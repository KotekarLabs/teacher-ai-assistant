import { PrismaClient } from "@prisma/client";
import type {
  QuestionType,
  WorksheetDifficulty,
} from "@teacher-ai/contracts";

const prisma = new PrismaClient();

export interface CreateWorksheetQuestionData {
  position: number;
  type: QuestionType;
  question: string;
  options?: string[];
  expectedAnswer: string;
  marks?: number;
  difficulty?: WorksheetDifficulty;
}

export interface CreateWorksheetData {
  teacherId: string;
  classId: string;
  generationRequestId?: string | null;
  title: string;
  subject: string;
  topic: string;
  curriculumBoard?: string | null;
  difficulty?: string;
  estimatedTimeMinutes?: number;
  instructions?: string | null;
  status?: string;
  questions: CreateWorksheetQuestionData[];
}

export interface UpdateWorksheetData {
  title?: string;
  instructions?: string | null;
  estimatedTimeMinutes?: number;
  status?: string;
  questions?: CreateWorksheetQuestionData[];
}

export class WorksheetRepository {
  static async findManyByTeacherId(teacherId: string, includeArchived = false) {
    return prisma.worksheet.findMany({
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

  static async findByIdAndTeacherId(worksheetId: string, teacherId: string) {
    return prisma.worksheet.findFirst({
      where: {
        id: worksheetId,
        teacherId,
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  static async create(data: CreateWorksheetData) {
    return prisma.worksheet.create({
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        generationRequestId: data.generationRequestId || null,
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        curriculumBoard: data.curriculumBoard || null,
        difficulty: data.difficulty || "MEDIUM",
        estimatedTimeMinutes: data.estimatedTimeMinutes || 30,
        instructions: data.instructions || null,
        status: data.status || "DRAFT",
        questions: {
          create: data.questions.map((q) => ({
            position: q.position,
            type: q.type,
            question: q.question,
            options: q.options || [],
            expectedAnswer: q.expectedAnswer,
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

  static async update(worksheetId: string, data: UpdateWorksheetData) {
    if (data.questions) {
      return prisma.$transaction(async (tx) => {
        await tx.worksheetQuestion.deleteMany({
          where: { worksheetId },
        });

        return tx.worksheet.update({
          where: { id: worksheetId },
          data: {
            title: data.title,
            instructions: data.instructions,
            estimatedTimeMinutes: data.estimatedTimeMinutes,
            status: data.status,
            questions: {
              create: data.questions!.map((q) => ({
                position: q.position,
                type: q.type,
                question: q.question,
                options: q.options || [],
                expectedAnswer: q.expectedAnswer,
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
      });
    }

    return prisma.worksheet.update({
      where: { id: worksheetId },
      data: {
        title: data.title,
        instructions: data.instructions,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        status: data.status,
      },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  static async archive(worksheetId: string) {
    return prisma.worksheet.update({
      where: { id: worksheetId },
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
