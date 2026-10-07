import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateClassData {
  teacherId: string;
  name: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  academicYear?: string | null;
}

export interface UpdateClassData {
  name?: string;
  grade?: string;
  section?: string | null;
  curriculumBoard?: string | null;
  academicYear?: string | null;
}

export class ClassRepository {
  static async findManyByTeacherId(teacherId: string, includeArchived = false) {
    return prisma.class.findMany({
      where: {
        teacherId,
        archivedAt: includeArchived ? undefined : null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findByIdAndTeacherId(classId: string, teacherId: string) {
    return prisma.class.findFirst({
      where: {
        id: classId,
        teacherId,
      },
    });
  }

  static async create(data: CreateClassData) {
    return prisma.class.create({
      data,
    });
  }

  static async update(classId: string, data: UpdateClassData) {
    return prisma.class.update({
      where: { id: classId },
      data,
    });
  }

  static async archive(classId: string) {
    return prisma.class.update({
      where: { id: classId },
      data: {
        archivedAt: new Date(),
      },
    });
  }
}
