import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateLessonData {
  teacherId: string;
  classId: string;
  generationRequestId?: string | null;
  title: string;
  subject: string;
  topic: string;
  curriculumBoard?: string | null;
  difficulty?: string;
  durationMinutes?: number;
  status?: string;
  content: Prisma.InputJsonValue;
}

export interface UpdateLessonData {
  title?: string;
  content?: Prisma.InputJsonValue;
  status?: string;
  generationRequestId?: string | null;
}

export class LessonRepository {
  static async findManyByTeacherId(teacherId: string, includeArchived = false) {
    return prisma.lesson.findMany({
      where: {
        teacherId,
        archivedAt: includeArchived ? undefined : null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findByIdAndTeacherId(lessonId: string, teacherId: string) {
    return prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId,
      },
    });
  }

  static async create(data: CreateLessonData) {
    return prisma.lesson.create({
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        generationRequestId: data.generationRequestId || null,
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        curriculumBoard: data.curriculumBoard || null,
        difficulty: data.difficulty || "MEDIUM",
        durationMinutes: data.durationMinutes || 40,
        status: data.status || "DRAFT",
        content: data.content,
      },
    });
  }

  static async update(lessonId: string, data: UpdateLessonData) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
  }

  static async archive(lessonId: string) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data: {
        archivedAt: new Date(),
        status: "ARCHIVED",
      },
    });
  }
}
