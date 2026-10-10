import { PrismaClient, Prisma } from "@prisma/client";
import type { QuestionType, QuizDifficulty } from "@teacher-ai/contracts";
import { prisma } from "../utils/prisma";

export interface CreateQuizQuestionData {
  position: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string | null;
  marks?: number;
  difficulty?: QuizDifficulty;
}

export interface CreateQuizData {
  teacherId: string;
  classId: string;
  generationRequestId?: string | null;
  title: string;
  subject: string;
  topic: string;
  curriculumBoard?: string | null;
  difficulty?: string;
  durationMinutes?: number;
  totalMarks?: number;
  instructions?: string | null;
  status?: string;
  questions: CreateQuizQuestionData[];
}

export interface UpdateQuizData {
  title?: string;
  instructions?: string | null;
  durationMinutes?: number;
  totalMarks?: number;
  status?: string;
  questions?: CreateQuizQuestionData[];
}

export class QuizRepository {
  static async findManyByTeacherId(
    teacherId: string,
    includeArchived = false,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.quiz.findMany({
      where: {
        teacherId,
        archivedAt: includeArchived ? undefined : null,
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findByIdAndTeacherId(
    quizId: string,
    teacherId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.quiz.findFirst({
      where: {
        id: quizId,
        teacherId,
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  static async create(
    data: CreateQuizData,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    const calculatedMarks =
      data.totalMarks !== undefined
        ? data.totalMarks
        : data.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    return db.quiz.create({
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        generationRequestId: data.generationRequestId || null,
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        curriculumBoard: data.curriculumBoard || null,
        difficulty: data.difficulty || "MEDIUM",
        durationMinutes: data.durationMinutes || 20,
        totalMarks: calculatedMarks,
        instructions: data.instructions || null,
        status: data.status || "DRAFT",
        questions: {
          create: data.questions.map((q) => ({
            position: q.position,
            type: q.type,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            marks: q.marks || 1,
            difficulty: q.difficulty || "MEDIUM",
          })),
        },
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  static async update(
    quizId: string,
    data: UpdateQuizData,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    if (data.questions) {
      const calculatedMarks =
        data.totalMarks !== undefined
          ? data.totalMarks
          : data.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

      await db.quizQuestion.deleteMany({
        where: { quizId },
      });

      return db.quiz.update({
        where: { id: quizId },
        data: {
          title: data.title,
          instructions: data.instructions,
          durationMinutes: data.durationMinutes,
          totalMarks: calculatedMarks,
          status: data.status,
          questions: {
            create: data.questions!.map((q) => ({
              position: q.position,
              type: q.type,
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || null,
              marks: q.marks || 1,
              difficulty: q.difficulty || "MEDIUM",
            })),
          },
        },
        include: {
          questions: {
            orderBy: { position: "asc" },
          },
        },
      });
    }

    return db.quiz.update({
      where: { id: quizId },
      data: {
        title: data.title,
        instructions: data.instructions,
        durationMinutes: data.durationMinutes,
        totalMarks: data.totalMarks,
        status: data.status,
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  static async archive(
    quizId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.quiz.update({
      where: { id: quizId },
      data: {
        archivedAt: new Date(),
        status: "ARCHIVED",
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });
  }
}

