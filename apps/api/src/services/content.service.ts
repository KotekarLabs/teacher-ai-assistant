import { PrismaClient, Prisma } from "@prisma/client";
import type {
  GetContentQuery,
  ContentDTO,
  ContentListResponse,
  ContentType,
  Difficulty,
  HomeworkTask,
  QuestionType,
} from "@teacher-ai/contracts";
import { ContentRepository } from "../repositories/content.repository";
import { LessonRepository } from "../repositories/lesson.repository";
import { WorksheetRepository } from "../repositories/worksheet.repository";
import { QuizRepository } from "../repositories/quiz.repository";
import { HomeworkRepository } from "../repositories/homework.repository";
import { LessonService } from "./lesson.service";
import { WorksheetService } from "./worksheet.service";
import { QuizService } from "./quiz.service";
import { HomeworkService } from "./homework.service";
import { ContentSyncService } from "./content-sync.service";

const prisma = new PrismaClient();

export interface ServiceError extends Error {
  statusCode?: number;
}

export class ContentService {
  static formatContentDTO(raw: {
    id: string;
    type: string;
    resourceId: string;
    title: string;
    subject: string;
    topic: string;
    difficulty?: string | null;
    status: string;
    classId?: string | null;
    class?: { id: string; name: string } | null;
    createdAt: Date;
    updatedAt: Date;
    archivedAt?: Date | null;
  }): ContentDTO {
    return {
      id: raw.id,
      type: raw.type as ContentType,
      resourceId: raw.resourceId,
      title: raw.title,
      subject: raw.subject,
      topic: raw.topic,
      difficulty: raw.difficulty || null,
      status: raw.status,
      classId: raw.classId || null,
      class: raw.class
        ? {
            id: raw.class.id,
            name: raw.class.name,
          }
        : null,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
      archivedAt: raw.archivedAt ? raw.archivedAt.toISOString() : null,
    };
  }

  static async listContent(
    teacherId: string,
    query: GetContentQuery,
  ): Promise<ContentListResponse> {
    const result = await ContentRepository.findMany({
      teacherId,
      search: query.search,
      type: query.type,
      classId: query.classId,
      subject: query.subject,
      topic: query.topic,
      status: query.status,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: result.items.map((item) => this.formatContentDTO(item)),
      pagination: result.pagination,
    };
  }

  static async getContentById(
    teacherId: string,
    contentId: string,
  ): Promise<ContentDTO | null> {
    const content = await ContentRepository.findByIdAndTeacherId(
      contentId,
      teacherId,
    );
    if (!content) return null;
    return this.formatContentDTO(content);
  }

  static async duplicateContent(
    teacherId: string,
    contentId: string,
  ): Promise<ContentDTO> {
    const content = await ContentRepository.findByIdAndTeacherId(
      contentId,
      teacherId,
    );
    if (!content) {
      const error: ServiceError = new Error("Content not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }

    const copyTitle = `${content.title} (Copy)`;

    if (content.type === "LESSON") {
      const lesson = await LessonRepository.findByIdAndTeacherId(
        content.resourceId,
        teacherId,
      );
      if (!lesson) {
        const error: ServiceError = new Error("Original lesson resource not found");
        error.statusCode = 404;
        throw error;
      }

      const duplicated = await prisma.$transaction(async (tx) => {
        const createdLesson = await LessonRepository.create(
          {
            teacherId,
            classId: lesson.classId,
            generationRequestId: null,
            title: copyTitle,
            subject: lesson.subject,
            topic: lesson.topic,
            curriculumBoard: lesson.curriculumBoard,
            difficulty: lesson.difficulty,
            durationMinutes: lesson.durationMinutes,
            status: "SAVED",
            content: lesson.content as Prisma.InputJsonValue,
          },
          tx,
        );

        const syncedContent = await ContentSyncService.syncResource(
          {
            teacherId,
            type: "LESSON",
            resourceId: createdLesson.id,
            title: createdLesson.title,
            subject: createdLesson.subject,
            topic: createdLesson.topic,
            difficulty: createdLesson.difficulty,
            classId: createdLesson.classId,
            status: createdLesson.status,
            archivedAt: null,
          },
          tx,
        );

        return syncedContent;
      });

      return this.formatContentDTO(duplicated);
    }

    if (content.type === "WORKSHEET") {
      const worksheet = await WorksheetRepository.findByIdAndTeacherId(
        content.resourceId,
        teacherId,
      );
      if (!worksheet) {
        const error: ServiceError = new Error("Original worksheet resource not found");
        error.statusCode = 404;
        throw error;
      }

      const duplicated = await prisma.$transaction(async (tx) => {
        const createdWorksheet = await WorksheetRepository.create(
          {
            teacherId,
            classId: worksheet.classId,
            generationRequestId: null,
            title: copyTitle,
            subject: worksheet.subject,
            topic: worksheet.topic,
            curriculumBoard: worksheet.curriculumBoard,
            difficulty: worksheet.difficulty,
            estimatedTimeMinutes: worksheet.estimatedTimeMinutes,
            instructions: worksheet.instructions,
            status: "SAVED",
            questions: worksheet.questions.map((q) => ({
              position: q.position,
              type: q.type as QuestionType,
              question: q.question,
              options: q.options,
              expectedAnswer: q.expectedAnswer,
              marks: q.marks,
              difficulty: q.difficulty as Difficulty,
            })),
          },
          tx,
        );

        const syncedContent = await ContentSyncService.syncResource(
          {
            teacherId,
            type: "WORKSHEET",
            resourceId: createdWorksheet.id,
            title: createdWorksheet.title,
            subject: createdWorksheet.subject,
            topic: createdWorksheet.topic,
            difficulty: createdWorksheet.difficulty,
            classId: createdWorksheet.classId,
            status: createdWorksheet.status,
            archivedAt: null,
          },
          tx,
        );

        return syncedContent;
      });

      return this.formatContentDTO(duplicated);
    }

    if (content.type === "QUIZ") {
      const quiz = await QuizRepository.findByIdAndTeacherId(
        content.resourceId,
        teacherId,
      );
      if (!quiz) {
        const error: ServiceError = new Error("Original quiz resource not found");
        error.statusCode = 404;
        throw error;
      }

      const duplicated = await prisma.$transaction(async (tx) => {
        const createdQuiz = await QuizRepository.create(
          {
            teacherId,
            classId: quiz.classId,
            generationRequestId: null,
            title: copyTitle,
            subject: quiz.subject,
            topic: quiz.topic,
            curriculumBoard: quiz.curriculumBoard,
            difficulty: quiz.difficulty,
            durationMinutes: quiz.durationMinutes,
            totalMarks: quiz.totalMarks,
            instructions: quiz.instructions,
            status: "SAVED",
            questions: quiz.questions.map((q) => ({
              position: q.position,
              type: q.type as QuestionType,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              marks: q.marks,
              difficulty: q.difficulty as Difficulty,
            })),
          },
          tx,
        );

        const syncedContent = await ContentSyncService.syncResource(
          {
            teacherId,
            type: "QUIZ",
            resourceId: createdQuiz.id,
            title: createdQuiz.title,
            subject: createdQuiz.subject,
            topic: createdQuiz.topic,
            difficulty: createdQuiz.difficulty,
            classId: createdQuiz.classId,
            status: createdQuiz.status,
            archivedAt: null,
          },
          tx,
        );

        return syncedContent;
      });

      return this.formatContentDTO(duplicated);
    }

    if (content.type === "HOMEWORK") {
      const homework = await HomeworkRepository.findByIdAndTeacherId(
        content.resourceId,
        teacherId,
      );
      if (!homework) {
        const error: ServiceError = new Error("Original homework resource not found");
        error.statusCode = 404;
        throw error;
      }

      const duplicated = await prisma.$transaction(async (tx) => {
        const createdHomework = await HomeworkRepository.create(
          {
            teacherId,
            classId: homework.classId,
            generationRequestId: null,
            title: copyTitle,
            subject: homework.subject,
            topic: homework.topic,
            curriculumBoard: homework.curriculumBoard,
            difficulty: homework.difficulty as Difficulty,
            estimatedTimeMinutes: homework.estimatedTimeMinutes,
            instructions: homework.instructions,
            status: "SAVED",
            tasks: homework.tasks as unknown as HomeworkTask[],
          },
          tx,
        );

        const syncedContent = await ContentSyncService.syncResource(
          {
            teacherId,
            type: "HOMEWORK",
            resourceId: createdHomework.id,
            title: createdHomework.title,
            subject: createdHomework.subject,
            topic: createdHomework.topic,
            difficulty: createdHomework.difficulty,
            classId: createdHomework.classId,
            status: createdHomework.status,
            archivedAt: null,
          },
          tx,
        );

        return syncedContent;
      });

      return this.formatContentDTO(duplicated);
    }

    const error: ServiceError = new Error(`Unsupported content type: ${content.type}`);
    error.statusCode = 400;
    throw error;
  }

  static async archiveContent(
    teacherId: string,
    contentId: string,
  ): Promise<ContentDTO> {
    const content = await ContentRepository.findByIdAndTeacherId(
      contentId,
      teacherId,
    );
    if (!content) {
      const error: ServiceError = new Error("Content not found or unauthorized");
      error.statusCode = 404;
      throw error;
    }

    if (content.type === "LESSON") {
      await LessonService.archiveLesson(teacherId, content.resourceId);
    } else if (content.type === "WORKSHEET") {
      await WorksheetService.archiveWorksheet(teacherId, content.resourceId);
    } else if (content.type === "QUIZ") {
      await QuizService.archiveQuiz(teacherId, content.resourceId);
    } else if (content.type === "HOMEWORK") {
      await HomeworkService.archiveHomework(teacherId, content.resourceId);
    } else {
      const error: ServiceError = new Error(`Unsupported content type: ${content.type}`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await ContentRepository.findByIdAndTeacherId(
      contentId,
      teacherId,
    );
    if (!updated) {
      const error: ServiceError = new Error("Failed to retrieve archived content");
      error.statusCode = 500;
      throw error;
    }

    return this.formatContentDTO(updated);
  }
}
