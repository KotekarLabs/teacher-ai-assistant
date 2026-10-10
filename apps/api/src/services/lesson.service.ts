import type {
  GenerateLessonRequest,
  UpdateLessonRequest,
  LessonContent,
} from "@teacher-ai/contracts";
import {
  getAIProvider,
  LessonContextBuilder,
  LessonOutputValidator,
} from "@teacher-ai/ai";
import { ClassRepository } from "../repositories/class.repository";
import { LessonRepository } from "../repositories/lesson.repository";
import { GenerationRequestRepository } from "../repositories/generation-request.repository";
import { ContentSyncService } from "./content-sync.service";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";

export interface ServiceError extends Error {
  statusCode?: number;
}


export class LessonService {
  static async getLessons(teacherId: string, includeArchived = false) {
    return LessonRepository.findManyByTeacherId(teacherId, includeArchived);
  }

  static async getLessonById(teacherId: string, lessonId: string) {
    return LessonRepository.findByIdAndTeacherId(lessonId, teacherId);
  }

  static async generateLesson(
    teacherId: string,
    data: GenerateLessonRequest,
  ) {
    const targetClass = await ClassRepository.findByIdAndTeacherId(
      data.classId,
      teacherId,
    );
    if (!targetClass) {
      const error: ServiceError = new Error("Class not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }

    const context = LessonContextBuilder.buildContext(data, {
      id: targetClass.id,
      grade: targetClass.grade,
      curriculumBoard: targetClass.curriculumBoard,
      name: targetClass.name,
    });

    const provider = getAIProvider();
    const promptVersion = "lesson/generate.v1";

    const providerType = process.env.AI_PROVIDER || "MOCK";
    const modelName = process.env.OPENAI_MODEL || (providerType === "OPENAI" ? "gpt-4o-mini" : "mock-pedagogy-v1");

    const genRequest = await GenerationRequestRepository.create({
      teacherId,
      contentType: "LESSON",
      provider: providerType,
      model: modelName,
      promptVersion,
      status: "PENDING",
      inputContext: context as unknown as Prisma.InputJsonValue,
    });

    let result;
    try {
      result = await provider.generateLesson(context);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI provider failed to generate lesson";
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "PROVIDER_ERROR",
        errorMessage: message,
        completedAt: new Date(),
      });
      const error: ServiceError = new Error("AI provider failed to generate lesson");
      error.statusCode = 502;
      throw error;
    }

    let parsed: unknown;
    try {
      parsed = result.parsedContent || LessonOutputValidator.parseJson(result.rawOutput);
    } catch {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "MALFORMED_JSON",
        errorMessage: "AI output could not be parsed as valid JSON",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error("Failed to parse AI output into valid JSON");
      error.statusCode = 502;
      throw error;
    }

    const schemaRes = LessonOutputValidator.validateSchema(parsed);
    if (!schemaRes.success || !schemaRes.data) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SCHEMA_VALIDATION_FAILED",
        errorMessage: schemaRes.error || "Schema validation failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(`Lesson schema validation failed: ${schemaRes.error}`);
      error.statusCode = 502;
      throw error;
    }

    const safetyRes = LessonOutputValidator.checkSafety(schemaRes.data);
    if (!safetyRes.isSafe) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SAFETY_VIOLATION",
        errorMessage: safetyRes.reason || "Safety policy violation",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(`Safety policy violation: ${safetyRes.reason}`);
      error.statusCode = 422;
      throw error;
    }

    const qualityRes = LessonOutputValidator.checkEducationalQuality(
      schemaRes.data,
      context,
    );
    if (!qualityRes.isAcceptable) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "QUALITY_CHECK_FAILED",
        errorMessage: qualityRes.feedback?.join("; ") || "Quality check failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Educational quality check failed: ${qualityRes.feedback?.join("; ")}`,
      );
      error.statusCode = 422;
      throw error;
    }

    const lesson = await prisma.$transaction(
      async (tx) => {
        const created = await LessonRepository.create(
          {
            teacherId,
            classId: targetClass.id,
            generationRequestId: genRequest.id,
            title: schemaRes.data!.title || data.topic,
            subject: data.subject,
            topic: data.topic,
            curriculumBoard: context.curriculumBoard,
            difficulty: data.difficulty,
            durationMinutes: data.durationMinutes,
            status: "DRAFT",
            content: schemaRes.data as unknown as Prisma.InputJsonValue,
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "LESSON",
            resourceId: created.id,
            title: created.title,
            subject: created.subject,
            topic: created.topic,
            difficulty: created.difficulty,
            classId: created.classId,
            status: created.status,
            archivedAt: created.archivedAt,
          },
          tx,
        );

        return created;
      },
      { maxWait: 15000, timeout: 30000 },
    );

    await GenerationRequestRepository.update(genRequest.id, {
      status: "SUCCESS",
      resourceId: lesson.id,
      outputMetadata: { qualityScore: qualityRes.score },
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: result.estimatedCost,
      completedAt: new Date(),
    });

    return lesson;
  }

  static async updateLesson(
    teacherId: string,
    lessonId: string,
    data: UpdateLessonRequest,
  ) {
    const existing = await this.getLessonById(teacherId, lessonId);
    if (!existing) {
      return null;
    }

    if (data.content) {
      const safetyRes = LessonOutputValidator.checkSafety(data.content);
      if (!safetyRes.isSafe) {
        const error: ServiceError = new Error(`Safety violation: ${safetyRes.reason}`);
        error.statusCode = 422;
        throw error;
      }
    }

    return prisma.$transaction(
      async (tx) => {
        const updated = await LessonRepository.update(
          lessonId,
          {
            title:
              data.title !== undefined
                ? data.title
                : data.content?.title !== undefined
                  ? data.content.title
                  : undefined,
            content: data.content as unknown as Prisma.InputJsonValue,
            status: data.status || "SAVED",
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "LESSON",
            resourceId: updated.id,
            title: updated.title,
            subject: updated.subject,
            topic: updated.topic,
            difficulty: updated.difficulty,
            classId: updated.classId,
            status: updated.status,
            archivedAt: updated.archivedAt,
          },
          tx,
        );

        return updated;
      },
      { maxWait: 15000, timeout: 30000 },
    );
  }

  static async archiveLesson(teacherId: string, lessonId: string) {
    const existing = await this.getLessonById(teacherId, lessonId);
    if (!existing) {
      return null;
    }

    return prisma.$transaction(
      async (tx) => {
        const archived = await LessonRepository.archive(lessonId, tx);

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "LESSON",
            resourceId: archived.id,
            title: archived.title,
            subject: archived.subject,
            topic: archived.topic,
            difficulty: archived.difficulty,
            classId: archived.classId,
            status: archived.status,
            archivedAt: archived.archivedAt,
          },
          tx,
        );

        return archived;
      },
      { maxWait: 15000, timeout: 30000 },
    );
  }


  static async regenerateLesson(
    teacherId: string,
    lessonId: string,
    teacherInstructions?: string,
  ) {
    const existing = await this.getLessonById(teacherId, lessonId);
    if (!existing) {
      return null;
    }

    const targetClass = await ClassRepository.findByIdAndTeacherId(
      existing.classId,
      teacherId,
    );
    if (!targetClass) {
      const error: ServiceError = new Error("Associated class not found");
      error.statusCode = 404;
      throw error;
    }

    const existingContent = existing.content as unknown as LessonContent;

    const context = LessonContextBuilder.buildContext(
      {
        classId: targetClass.id,
        subject: existing.subject,
        topic: existing.topic,
        durationMinutes: existing.durationMinutes,
        difficulty: existing.difficulty as "EASY" | "MEDIUM" | "HARD",
        curriculumBoard: existing.curriculumBoard || undefined,
        teacherInstructions:
          teacherInstructions || (existingContent as { teacherInstructions?: string })?.teacherInstructions,
      },
      {
        id: targetClass.id,
        grade: targetClass.grade,
        curriculumBoard: targetClass.curriculumBoard,
        name: targetClass.name,
      },
    );

    const provider = getAIProvider();
    const promptVersion = "lesson/generate.v1";

    const genRequest = await GenerationRequestRepository.create({
      teacherId,
      contentType: "LESSON",
      resourceId: lessonId,
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion,
      status: "PENDING",
      inputContext: context as unknown as Prisma.InputJsonValue,
    });

    let result;
    try {
      result = await provider.generateLesson(context);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI provider failed to regenerate lesson";
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "PROVIDER_ERROR",
        errorMessage: message,
        completedAt: new Date(),
      });
      const error: ServiceError = new Error("AI provider failed to regenerate lesson");
      error.statusCode = 502;
      throw error;
    }

    let parsed: unknown;
    try {
      parsed = result.parsedContent || LessonOutputValidator.parseJson(result.rawOutput);
    } catch {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "MALFORMED_JSON",
        errorMessage: "AI output could not be parsed as valid JSON",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error("Failed to parse AI output into valid JSON");
      error.statusCode = 502;
      throw error;
    }

    const schemaRes = LessonOutputValidator.validateSchema(parsed);
    if (!schemaRes.success || !schemaRes.data) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SCHEMA_VALIDATION_FAILED",
        errorMessage: schemaRes.error || "Schema validation failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(`Lesson schema validation failed: ${schemaRes.error}`);
      error.statusCode = 502;
      throw error;
    }

    const safetyRes = LessonOutputValidator.checkSafety(schemaRes.data);
    if (!safetyRes.isSafe) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SAFETY_VIOLATION",
        errorMessage: safetyRes.reason || "Safety policy violation",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(`Safety policy violation: ${safetyRes.reason}`);
      error.statusCode = 422;
      throw error;
    }

    const qualityRes = LessonOutputValidator.checkEducationalQuality(
      schemaRes.data,
      context,
    );
    if (!qualityRes.isAcceptable) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "QUALITY_CHECK_FAILED",
        errorMessage: qualityRes.feedback?.join("; ") || "Quality check failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Educational quality check failed: ${qualityRes.feedback?.join("; ")}`,
      );
      error.statusCode = 422;
      throw error;
    }

    // Only update upon full validation success
    const updatedLesson = await prisma.$transaction(
      async (tx) => {
        const updated = await LessonRepository.update(
          lessonId,
          {
            title: schemaRes.data!.title,
            content: schemaRes.data as unknown as Prisma.InputJsonValue,
            generationRequestId: genRequest.id,
            status: "DRAFT",
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "LESSON",
            resourceId: updated.id,
            title: updated.title,
            subject: updated.subject,
            topic: updated.topic,
            difficulty: updated.difficulty,
            classId: updated.classId,
            status: updated.status,
            archivedAt: updated.archivedAt,
          },
          tx,
        );

        return updated;
      },
      { maxWait: 15000, timeout: 30000 },
    );


    await GenerationRequestRepository.update(genRequest.id, {
      status: "SUCCESS",
      outputMetadata: { qualityScore: qualityRes.score },
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: result.estimatedCost,
      completedAt: new Date(),
    });

    return updatedLesson;
  }
}
