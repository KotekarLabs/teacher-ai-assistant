import { LessonRepository } from "../repositories/lesson.repository";
import { WorksheetRepository } from "../repositories/worksheet.repository";
import { QuizRepository } from "../repositories/quiz.repository";
import { HomeworkRepository } from "../repositories/homework.repository";
import { renderLessonPdf, type LessonPdfData } from "./pdf/lesson-pdf.renderer";
import { renderWorksheetPdf, type WorksheetPdfData, type WorksheetExportMode } from "./pdf/worksheet-pdf.renderer";
import { renderQuizPdf, type QuizPdfData, type QuizExportMode } from "./pdf/quiz-pdf.renderer";
import { renderHomeworkPdf, type HomeworkPdfData } from "./pdf/homework-pdf.renderer";
import { sanitizeFilename } from "./pdf/pdf-utils";

export interface ExportResult {
  buffer: Buffer;
  filename: string;
}

export interface ServiceError extends Error {
  statusCode?: number;
}

export class ExportService {
  static async exportLessonPdf(
    lessonId: string,
    teacherId: string,
  ): Promise<ExportResult> {
    const lesson = await LessonRepository.findByIdAndTeacherId(
      lessonId,
      teacherId,
    );

    if (!lesson) {
      const error: ServiceError = new Error("Lesson not found or access denied");
      error.statusCode = 404;
      throw error;
    }

    const buffer = await renderLessonPdf(lesson as unknown as LessonPdfData);
    const filename = sanitizeFilename(lesson.title, "lesson");

    return { buffer, filename };
  }

  static async exportWorksheetPdf(
    worksheetId: string,
    teacherId: string,
    mode?: string,
  ): Promise<ExportResult> {
    const effectiveMode = mode || "student";
    if (effectiveMode !== "student" && effectiveMode !== "answer-key") {
      const error: ServiceError = new Error(
        'Invalid worksheet export mode: must be either "student" or "answer-key"',
      );
      error.statusCode = 400;
      throw error;
    }

    const worksheet = await WorksheetRepository.findByIdAndTeacherId(
      worksheetId,
      teacherId,
    );

    if (!worksheet) {
      const error: ServiceError = new Error("Worksheet not found or access denied");
      error.statusCode = 404;
      throw error;
    }

    const validMode = effectiveMode as WorksheetExportMode;
    const buffer = await renderWorksheetPdf(
      worksheet as unknown as WorksheetPdfData,
      validMode,
    );

    let suffix = "worksheet";
    if (validMode === "answer-key") {
      suffix = "worksheet-answer-key";
    } else if (mode === "student") {
      suffix = "worksheet-student";
    }

    const filename = sanitizeFilename(worksheet.title, suffix);

    return { buffer, filename };
  }

  static async exportQuizPdf(
    quizId: string,
    teacherId: string,
    mode: string = "student",
  ): Promise<ExportResult> {
    if (mode !== "student" && mode !== "answer-key") {
      const error: ServiceError = new Error(
        'Invalid quiz export mode: must be either "student" or "answer-key"',
      );
      error.statusCode = 400;
      throw error;
    }

    const quiz = await QuizRepository.findByIdAndTeacherId(quizId, teacherId);

    if (!quiz) {
      const error: ServiceError = new Error("Quiz not found or access denied");
      error.statusCode = 404;
      throw error;
    }

    const validMode = mode as QuizExportMode;
    const buffer = await renderQuizPdf(quiz as unknown as QuizPdfData, validMode);
    const suffix = validMode === "answer-key" ? "quiz-answer-key" : "quiz-student";
    const filename = sanitizeFilename(quiz.title, suffix);

    return { buffer, filename };
  }

  static async exportHomeworkPdf(
    homeworkId: string,
    teacherId: string,
  ): Promise<ExportResult> {
    const homework = await HomeworkRepository.findByIdAndTeacherId(
      homeworkId,
      teacherId,
    );

    if (!homework) {
      const error: ServiceError = new Error("Homework not found or access denied");
      error.statusCode = 404;
      throw error;
    }

    const buffer = await renderHomeworkPdf(homework as unknown as HomeworkPdfData);
    const filename = sanitizeFilename(homework.title, "homework");

    return { buffer, filename };
  }
}
