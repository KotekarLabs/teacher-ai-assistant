import { PrismaClient, Prisma } from "@prisma/client";
import type {
  HomeworkTask,
  HomeworkDifficulty,
  HomeworkStatus,
} from "@teacher-ai/contracts";
import { prisma } from "../utils/prisma";

export interface CreateHomeworkData {
  teacherId: string;
  classId: string;
  generationRequestId?: string | null;
  title: string;
  subject: string;
  topic: string;
  curriculumBoard?: string | null;
  difficulty?: HomeworkDifficulty;
  estimatedTimeMinutes: number;
  instructions?: string | null;
  status?: HomeworkStatus;
  tasks: HomeworkTask[];
}

export interface UpdateHomeworkData {
  title?: string;
  instructions?: string | null;
  estimatedTimeMinutes?: number;
  status?: HomeworkStatus;
  tasks?: HomeworkTask[];
}

export class HomeworkRepository {
  static async findManyByTeacherId(
    teacherId: string,
    includeArchived = false,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.homework.findMany({
      where: {
        teacherId,
        archivedAt: includeArchived ? undefined : null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findByIdAndTeacherId(
    homeworkId: string,
    teacherId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.homework.findFirst({
      where: {
        id: homeworkId,
        teacherId,
      },
    });
  }

  static async create(
    data: CreateHomeworkData,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.homework.create({
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        generationRequestId: data.generationRequestId || null,
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        difficulty: data.difficulty || "MEDIUM",
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        instructions: data.instructions || "",
        status: data.status || "DRAFT",
        tasks: data.tasks as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async update(
    homeworkId: string,
    data: UpdateHomeworkData,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.homework.update({
      where: { id: homeworkId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.estimatedTimeMinutes !== undefined && {
          estimatedTimeMinutes: data.estimatedTimeMinutes,
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.tasks !== undefined && {
          tasks: data.tasks as unknown as Prisma.InputJsonValue,
        }),
      },
    });
  }

  static async archive(
    homeworkId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.homework.update({
      where: { id: homeworkId },
      data: {
        archivedAt: new Date(),
        status: "ARCHIVED",
      },
    });
  }
}

