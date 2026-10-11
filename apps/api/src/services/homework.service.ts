import type {
  GenerateHomeworkRequest,
  UpdateHomeworkRequest,
  HomeworkDTO,
} from "@teacher-ai/contracts";
import {
  getAIProvider,
  HomeworkContextBuilder,
  HomeworkOutputValidator,
} from "@teacher-ai/ai";
import { ClassRepository } from "../repositories/class.repository";
import { HomeworkRepository } from "../repositories/homework.repository";
import { GenerationRequestRepository } from "../repositories/generation-request.repository";
import { ContentSyncService } from "./content-sync.service";
import { TeacherService } from "./teacher.service";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";

export interface ServiceError extends Error {
  statusCode?: number;
}


export class HomeworkService {
  static async getHomeworks(teacherId: string, includeArchived = false) {
    return HomeworkRepository.findManyByTeacherId(teacherId, includeArchived);
  }

  static async getHomeworkById(teacherId: string, homeworkId: string) {
    return HomeworkRepository.findByIdAndTeacherId(homeworkId, teacherId);
  }

  static async generateHomework(
    teacherId: string,
    data: GenerateHomeworkRequest,
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

    const profile = await TeacherService.getProfileByUserId(teacherId);

    const context = HomeworkContextBuilder.buildContext(
      data,
      {
        id: targetClass.id,
        grade: targetClass.grade,
        section: targetClass.section,
        curriculumBoard: targetClass.curriculumBoard,
        name: targetClass.name,
      },
      profile,
    );

    const provider = getAIProvider();
    const promptVersion = "homework/generate.v1";

    const providerType = process.env.AI_PROVIDER || "MOCK";
    const modelName = process.env.OPENAI_MODEL || (providerType === "OPENAI" ? "gpt-4o-mini" : "mock-pedagogy-v1");

    const genRequest = await GenerationRequestRepository.create({
      teacherId,
      contentType: "HOMEWORK",
      provider: providerType,
      model: modelName,
      promptVersion,
      status: "PENDING",
      inputContext: context as unknown as Prisma.InputJsonValue,
    });

    let result;
    try {
      result = await provider.generateHomework(context);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "AI provider failed to generate homework";
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "PROVIDER_ERROR",
        errorMessage: message,
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        "AI provider failed to generate homework",
      );
      error.statusCode = 502;
      throw error;
    }

    let parsed: unknown;
    try {
      parsed =
        result.parsedContent ||
        HomeworkOutputValidator.parseJson(result.rawOutput);
    } catch {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "MALFORMED_JSON",
        errorMessage: "AI output could not be parsed as valid JSON",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        "Failed to parse AI output into valid JSON",
      );
      error.statusCode = 502;
      throw error;
    }

    const schemaRes = HomeworkOutputValidator.validateSchema(parsed);
    if (!schemaRes.success || !schemaRes.data) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SCHEMA_VALIDATION_FAILED",
        errorMessage: schemaRes.error || "Schema validation failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Homework schema validation failed: ${schemaRes.error}`,
      );
      error.statusCode = 502;
      throw error;
    }

    const validContent = schemaRes.data;

    const safetyRes = HomeworkOutputValidator.checkSafety(validContent);
    if (!safetyRes.isSafe) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SAFETY_VIOLATION",
        errorMessage: safetyRes.reason || "Safety check failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Safety violation detected: ${safetyRes.reason}`,
      );
      error.statusCode = 502;
      throw error;
    }

    const workloadRes = HomeworkOutputValidator.checkWorkload(validContent);
    if (!workloadRes.isAcceptable) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "WORKLOAD_VIOLATION",
        errorMessage: workloadRes.reason || "Workload check failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Workload check failed: ${workloadRes.reason}`,
      );
      error.statusCode = 502;
      throw error;
    }

    const qualityRes = HomeworkOutputValidator.checkEducationalQuality(
      validContent,
      context,
    );
    if (!qualityRes.isAcceptable) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "QUALITY_VIOLATION",
        errorMessage: (qualityRes.feedback || []).join(", "),
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Educational quality check failed: ${(qualityRes.feedback || []).join(", ")}`,
      );
      error.statusCode = 502;
      throw error;
    }

    await GenerationRequestRepository.update(genRequest.id, {
      status: "COMPLETED",
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: result.estimatedCost,
      outputMetadata: {
        score: qualityRes.score,
        taskCount: validContent.tasks.length,
        estimatedTimeMinutes: validContent.estimatedTimeMinutes,
      } as Prisma.InputJsonValue,
      completedAt: new Date(),
    });

    const homework = await prisma.$transaction(
      async (tx) => {
        const created = await HomeworkRepository.create(
          {
            teacherId,
            classId: targetClass.id,
            generationRequestId: genRequest.id,
            title: validContent.title,
            subject: validContent.subject,
            topic: validContent.topic,
            difficulty: validContent.difficulty || data.difficulty || "MEDIUM",
            estimatedTimeMinutes:
              validContent.estimatedTimeMinutes || data.estimatedTimeMinutes || 30,
            instructions: validContent.instructions,
            status: "DRAFT",
            tasks: validContent.tasks,
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "HOMEWORK",
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
      resourceId: homework.id,
    });

    return homework;
  }

  static async updateHomework(
    teacherId: string,
    homeworkId: string,
    data: UpdateHomeworkRequest,
  ) {
    const homework = await HomeworkRepository.findByIdAndTeacherId(
      homeworkId,
      teacherId,
    );
    if (!homework) {
      const error: ServiceError = new Error(
        "Homework not found or unauthorized",
      );
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(
      async (tx) => {
        const updated = await HomeworkRepository.update(
          homeworkId,
          {
            title: data.title,
            instructions: data.instructions,
            estimatedTimeMinutes: data.estimatedTimeMinutes,
            status: data.status,
            tasks: data.tasks,
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "HOMEWORK",
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

  static async archiveHomework(teacherId: string, homeworkId: string) {
    const homework = await HomeworkRepository.findByIdAndTeacherId(
      homeworkId,
      teacherId,
    );
    if (!homework) {
      const error: ServiceError = new Error(
        "Homework not found or unauthorized",
      );
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(
      async (tx) => {
        const archived = await HomeworkRepository.archive(homeworkId, tx);

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "HOMEWORK",
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


  static formatHomeworkDTO(raw: {
    id: string;
    teacherId: string;
    classId: string;
    generationRequestId?: string | null;
    title: string;
    subject: string;
    topic: string;
    curriculumBoard?: string | null;
    difficulty: string;
    estimatedTimeMinutes: number;
    instructions?: string | null;
    status: string;
    tasks: unknown;
    createdAt: Date | string;
    updatedAt: Date | string;
    archivedAt?: Date | string | null;
  }): HomeworkDTO {
    return {
      id: raw.id,
      teacherId: raw.teacherId,
      classId: raw.classId,
      generationRequestId: raw.generationRequestId || null,
      title: raw.title,
      subject: raw.subject,
      topic: raw.topic,
      curriculumBoard: raw.curriculumBoard || null,
      difficulty: raw.difficulty as HomeworkDTO["difficulty"],
      estimatedTimeMinutes: raw.estimatedTimeMinutes,
      instructions: raw.instructions || null,
      status: raw.status as HomeworkDTO["status"],
      tasks: (raw.tasks as HomeworkDTO["tasks"]) || [],
      createdAt:
        raw.createdAt instanceof Date
          ? raw.createdAt.toISOString()
          : raw.createdAt,
      updatedAt:
        raw.updatedAt instanceof Date
          ? raw.updatedAt.toISOString()
          : raw.updatedAt,
      archivedAt:
        raw.archivedAt instanceof Date
          ? raw.archivedAt.toISOString()
          : raw.archivedAt || null,
    };
  }
}
