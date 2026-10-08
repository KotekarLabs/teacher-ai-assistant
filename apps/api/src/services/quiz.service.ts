import type {
  GenerateQuizRequest,
  UpdateQuizRequest,
  QuizDTO,
} from "@teacher-ai/contracts";
import {
  getAIProvider,
  QuizContextBuilder,
  QuizOutputValidator,
} from "@teacher-ai/ai";
import { ClassRepository } from "../repositories/class.repository";
import { QuizRepository } from "../repositories/quiz.repository";
import { GenerationRequestRepository } from "../repositories/generation-request.repository";
import { Prisma } from "@prisma/client";

export interface ServiceError extends Error {
  statusCode?: number;
}

export class QuizService {
  static async getQuizzes(teacherId: string, includeArchived = false) {
    return QuizRepository.findManyByTeacherId(teacherId, includeArchived);
  }

  static async getQuizById(teacherId: string, quizId: string) {
    return QuizRepository.findByIdAndTeacherId(quizId, teacherId);
  }

  static async generateQuiz(
    teacherId: string,
    data: GenerateQuizRequest,
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

    const context = QuizContextBuilder.buildContext(data, {
      id: targetClass.id,
      grade: targetClass.grade,
      section: targetClass.section,
      curriculumBoard: targetClass.curriculumBoard,
      name: targetClass.name,
    });

    const provider = getAIProvider();
    const promptVersion = "quiz/generate.v1";

    const genRequest = await GenerationRequestRepository.create({
      teacherId,
      contentType: "QUIZ",
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion,
      status: "PENDING",
      inputContext: context as unknown as Prisma.InputJsonValue,
    });

    let result;
    try {
      result = await provider.generateQuiz(context);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "AI provider failed to generate quiz";
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "PROVIDER_ERROR",
        errorMessage: message,
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        "AI provider failed to generate quiz",
      );
      error.statusCode = 502;
      throw error;
    }

    let parsed: unknown;
    try {
      parsed =
        result.parsedContent ||
        QuizOutputValidator.parseJson(result.rawOutput);
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

    const schemaRes = QuizOutputValidator.validateSchema(parsed);
    if (!schemaRes.success || !schemaRes.data) {
      await GenerationRequestRepository.update(genRequest.id, {
        status: "FAILED",
        errorCode: "SCHEMA_VALIDATION_FAILED",
        errorMessage: schemaRes.error || "Schema validation failed",
        completedAt: new Date(),
      });
      const error: ServiceError = new Error(
        `Quiz schema validation failed: ${schemaRes.error}`,
      );
      error.statusCode = 502;
      throw error;
    }

    const validContent = schemaRes.data;

    const safetyRes = QuizOutputValidator.checkSafety(validContent);
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

    const qualityRes = QuizOutputValidator.checkEducationalQuality(
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

    // Critical Requirement: Server-authoritative calculation of totalMarks
    const authoritativeTotalMarks = QuizOutputValidator.calculateTotalMarks(validContent);

    await GenerationRequestRepository.update(genRequest.id, {
      status: "COMPLETED",
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: result.estimatedCost,
      outputMetadata: {
        score: qualityRes.score,
        questionCount: validContent.questions.length,
        totalMarks: authoritativeTotalMarks,
      } as Prisma.InputJsonValue,
      completedAt: new Date(),
    });

    const quiz = await QuizRepository.create({
      teacherId,
      classId: targetClass.id,
      generationRequestId: genRequest.id,
      title: validContent.title,
      subject: validContent.subject,
      topic: validContent.topic,
      curriculumBoard: targetClass.curriculumBoard,
      difficulty: data.difficulty || "MEDIUM",
      durationMinutes: validContent.durationMinutes || data.durationMinutes || 20,
      totalMarks: authoritativeTotalMarks,
      instructions: validContent.instructions || null,
      status: "DRAFT",
      questions: validContent.questions,
    });

    await GenerationRequestRepository.update(genRequest.id, {
      resourceId: quiz.id,
    });

    return quiz;
  }

  static async updateQuiz(
    teacherId: string,
    quizId: string,
    data: UpdateQuizRequest,
  ) {
    const quiz = await QuizRepository.findByIdAndTeacherId(
      quizId,
      teacherId,
    );
    if (!quiz) {
      const error: ServiceError = new Error(
        "Quiz not found or unauthorized",
      );
      error.statusCode = 404;
      throw error;
    }

    let calculatedTotalMarks: number | undefined = undefined;
    if (data.questions) {
      calculatedTotalMarks = data.questions.reduce(
        (sum, q) => sum + (q.marks || 1),
        0,
      );
    }

    return QuizRepository.update(quizId, {
      title: data.title,
      instructions: data.instructions,
      durationMinutes: data.durationMinutes,
      totalMarks: calculatedTotalMarks,
      status: data.status,
      questions: data.questions,
    });
  }

  static async archiveQuiz(teacherId: string, quizId: string) {
    const quiz = await QuizRepository.findByIdAndTeacherId(
      quizId,
      teacherId,
    );
    if (!quiz) {
      const error: ServiceError = new Error(
        "Quiz not found or unauthorized",
      );
      error.statusCode = 404;
      throw error;
    }

    return QuizRepository.archive(quizId);
  }

  static formatQuizDTO(raw: {
    id: string;
    teacherId: string;
    classId: string;
    generationRequestId?: string | null;
    title: string;
    subject: string;
    topic: string;
    curriculumBoard?: string | null;
    difficulty: string;
    durationMinutes: number;
    totalMarks: number;
    instructions?: string | null;
    status: string;
    questions?: Array<{
      id: string;
      quizId: string;
      position: number;
      type: string;
      question: string;
      options?: string[];
      correctAnswer: string;
      explanation?: string | null;
      marks: number;
      difficulty: string;
      createdAt: Date | string;
      updatedAt: Date | string;
    }>;
    createdAt: Date | string;
    updatedAt: Date | string;
    archivedAt?: Date | string | null;
  }): QuizDTO {
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
      durationMinutes: raw.durationMinutes,
      totalMarks: raw.totalMarks,
      instructions: raw.instructions || null,
      status: raw.status,
      questions: (raw.questions || []).map((q) => ({
        id: q.id,
        quizId: q.quizId,
        position: q.position,
        type: q.type as QuizDTO["questions"][0]["type"],
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        marks: q.marks,
        difficulty: q.difficulty as QuizDTO["questions"][0]["difficulty"],
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
