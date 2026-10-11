import { PrismaClient, Prisma } from "@prisma/client";
import type {
  ContentType,
  ContentSort,
} from "@teacher-ai/contracts";
import { prisma } from "../utils/prisma";

export interface UpsertContentData {
  teacherId: string;
  type: ContentType;
  resourceId: string;
  title: string;
  subject: string;
  topic: string;
  classId?: string | null;
  status: string;
  difficulty?: string | null;
  archivedAt?: Date | null;
}

export interface ContentFindManyQuery {
  teacherId: string;
  search?: string;
  type?: string;
  classId?: string;
  subject?: string;
  topic?: string;
  status?: string;
  sort?: ContentSort;
  page?: number;
  pageSize?: number;
}

export class ContentRepository {
  static async findMany(
    query: ContentFindManyQuery,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize =
      query.pageSize && query.pageSize > 0 && query.pageSize <= 100
        ? query.pageSize
        : 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ContentWhereInput = {
      teacherId: query.teacherId,
    };

    // Filter by type
    if (query.type && query.type !== "ALL") {
      where.type = query.type;
    }

    // Filter by classId
    if (query.classId) {
      where.classId = query.classId;
    }

    // Filter by subject
    if (query.subject) {
      where.subject = {
        equals: query.subject,
        mode: "insensitive",
      };
    }

    // Filter by topic
    if (query.topic) {
      where.topic = {
        equals: query.topic,
        mode: "insensitive",
      };
    }

    // Filter by status & archive state
    if (query.status === "ARCHIVED") {
      where.archivedAt = { not: null };
    } else if (query.status === "ACTIVE") {
      where.archivedAt = null;
    } else if (query.status === "ALL") {
      // Return both active and archived
    } else if (query.status) {
      where.status = query.status;
      where.archivedAt = null;
    } else {
      // Default: exclude archived items
      where.archivedAt = null;
    }

    // Search on title, subject, topic
    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { subject: { contains: searchTerm, mode: "insensitive" } },
        { topic: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy: Prisma.ContentOrderByWithRelationInput;

    switch (query.sort) {
      case "updatedAt_asc":
        orderBy = { updatedAt: "asc" };
        break;
      case "title_asc":
        orderBy = { title: "asc" };
        break;
      case "title_desc":
        orderBy = { title: "desc" };
        break;
      case "updatedAt_desc":
      default:
        orderBy = { updatedAt: "desc" };
        break;
    }

    const [items, total] = await Promise.all([
      db.content.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      db.content.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 0;

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  static async findByIdAndTeacherId(
    contentId: string,
    teacherId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.content.findFirst({
      where: {
        id: contentId,
        teacherId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async findByTypeAndResourceId(
    type: ContentType,
    resourceId: string,
    teacherId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.content.findFirst({
      where: {
        type,
        resourceId,
        teacherId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async upsert(
    data: UpsertContentData,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.content.upsert({
      where: {
        type_resourceId: {
          type: data.type,
          resourceId: data.resourceId,
        },
      },
      create: {
        teacherId: data.teacherId,
        type: data.type,
        resourceId: data.resourceId,
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        classId: data.classId || null,
        status: data.status,
        difficulty: data.difficulty || null,
        archivedAt: data.archivedAt || null,
      },
      update: {
        title: data.title,
        subject: data.subject,
        topic: data.topic,
        classId: data.classId || null,
        status: data.status,
        difficulty: data.difficulty || null,
        archivedAt: data.archivedAt !== undefined ? data.archivedAt : undefined,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async archive(
    contentId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    return db.content.update({
      where: { id: contentId },
      data: {
        archivedAt: new Date(),
        status: "ARCHIVED",
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
