import type {
  GenerateWorksheetRequest,
  UpdateWorksheetRequest,
  WorksheetDTO,
} from "@teacher-ai/contracts";
import {
  getAIProvider,
  WorksheetContextBuilder,
  WorksheetOutputValidator,
} from "@teacher-ai/ai";
import { ClassRepository } from "../repositories/class.repository";
import { WorksheetRepository } from "../repositories/worksheet.repository";
import { GenerationRequestRepository } from "../repositories/generation-request.repository";
import { ContentSyncService } from "./content-sync.service";
import { TeacherService } from "./teacher.service";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";

export interface ServiceError extends Error {
  statusCode?: number;
}


export class WorksheetService {
  static async getWorksheets(teacherId: string, includeArchived = false) {
    return WorksheetRepository.findManyByTeacherId(teacherId, includeArchived);
  }

  static async getWorksheetById(teacherId: string, worksheetId: string) {
    return WorksheetRepository.findByIdAndTeacherId(worksheetId, teacherId);
  }

  static async generateWorksheet(
    teacherId: string,
    data: GenerateWorksheetRequest,
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

    const context = WorksheetContextBuilder.buildContext(
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
    const promptVersion = "worksheet/generate.v1";

    const providerType = process.env.AI_PROVIDER || "MOCK";
    const modelName = process.env.OPENAI_MODEL || (providerType === "OPENAI" ? "gpt-4o-mini" : "mock-pedagogy-v1");

    const genRequest = await GenerationRequestRepository.create({
      teacherId,
      contentType: "WORKSHEET",
      provider: providerType,
      model: modelName,
      promptVersion,
      status: "PENDING",
      inputContext: context as unknown as Prisma.InputJsonValue,
    });

    let result;
    try {
      result = await provider.generateWorksheet(context);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "AI provider failed to generate worksheet";
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "PROVIDER_ERROR",
        errorMessage: message,
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        "AI provider failed to generate worksheet",
      );
      error.statusCode = 502;
      throw error;
    }

    let parsed: unknown;
    try {
      parsed =
        result.parsedContent ||
        WorksheetOutputValidator.parseJson(result.rawOutput);
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

    const schemaRes = WorksheetOutputValidator.validateSchema(parsed);
    if (!schemaRes.success || !schemaRes.data) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SCHEMA_VALIDATION_FAILED",
        errorMessage: schemaRes.error || "Schema validation failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Worksheet schema validation failed: ${schemaRes.error}`,
      );
      error.statusCode = 502;
      throw error;
    }

    const validContent = schemaRes.data;

    const safetyRes = WorksheetOutputValidator.checkSafety(validContent);
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

    const qualityRes = WorksheetOutputValidator.checkEducationalQuality(
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
        questionCount: validContent.questions.length,
      } as Prisma.InputJsonValue,
      completedAt: new Date(),
    });

    const worksheet = await prisma.$transaction(
      async (tx) => {
        const created = await WorksheetRepository.create(
          {
            teacherId,
            classId: targetClass.id,
            generationRequestId: genRequest.id,
            title: validContent.title,
            subject: validContent.subject,
            topic: validContent.topic,
            curriculumBoard: targetClass.curriculumBoard,
            difficulty: data.difficulty || "MEDIUM",
            estimatedTimeMinutes: validContent.estimatedTimeMinutes || 30,
            instructions: validContent.instructions || null,
            status: "DRAFT",
            questions: validContent.questions,
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "WORKSHEET",
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
      resourceId: worksheet.id,
    });

    return worksheet;
  }

  static async updateWorksheet(
    teacherId: string,
    worksheetId: string,
    data: UpdateWorksheetRequest,
  ) {
    const worksheet = await WorksheetRepository.findByIdAndTeacherId(
      worksheetId,
      teacherId,
    );
    if (!worksheet) {
      const error: ServiceError = new Error(
        "Worksheet not found or unauthorized",
      );
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(
      async (tx) => {
        const updated = await WorksheetRepository.update(
          worksheetId,
          {
            title: data.title,
            instructions: data.instructions,
            estimatedTimeMinutes: data.estimatedTimeMinutes,
            status: data.status,
            questions: data.questions,
          },
          tx,
        );

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "WORKSHEET",
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

  static async archiveWorksheet(teacherId: string, worksheetId: string) {
    const worksheet = await WorksheetRepository.findByIdAndTeacherId(
      worksheetId,
      teacherId,
    );
    if (!worksheet) {
      const error: ServiceError = new Error(
        "Worksheet not found or unauthorized",
      );
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(
      async (tx) => {
        const archived = await WorksheetRepository.archive(worksheetId, tx);

        await ContentSyncService.syncResource(
          {
            teacherId,
            type: "WORKSHEET",
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


  static formatWorksheetDTO(raw: {
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
    questions?: Array<{
      id: string;
      worksheetId: string;
      position: number;
      type: string;
      question: string;
      options?: string[];
      expectedAnswer: string;
      marks: number;
      difficulty: string;
      createdAt: Date | string;
      updatedAt: Date | string;
    }>;
    createdAt: Date | string;
    updatedAt: Date | string;
    archivedAt?: Date | string | null;
  }): WorksheetDTO {
    return {
      id: raw.id,
      teacherId: raw.teacherId,
      classId: raw.classId,
      generationRequestId: raw.generationRequestId || null,
      title: raw.title,
      subject: raw.subject,
      topic: raw.topic,
      curriculumBoard: raw.curriculumBoard || null,
      difficulty: raw.difficulty,
      estimatedTimeMinutes: raw.estimatedTimeMinutes,
      instructions: raw.instructions || null,
      status: raw.status,
      questions: (raw.questions || []).map((q) => ({
        id: q.id,
        worksheetId: q.worksheetId,
        position: q.position,
        type: q.type as WorksheetDTO["questions"][0]["type"],
        question: q.question,
        options: q.options || [],
        expectedAnswer: q.expectedAnswer,
        marks: q.marks,
        difficulty: q.difficulty as WorksheetDTO["questions"][0]["difficulty"],
        createdAt:
          q.createdAt instanceof Date ? q.createdAt.toISOString() : q.createdAt,
        updatedAt:
          q.updatedAt instanceof Date ? q.updatedAt.toISOString() : q.updatedAt,
      })),
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
