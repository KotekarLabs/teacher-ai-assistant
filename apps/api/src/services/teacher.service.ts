import {
  CreateTeacherProfileRequest,
  UpdateTeacherProfileRequest,
} from "@teacher-ai/contracts";
import { prisma } from "../utils/prisma";

export class TeacherService {
  static async getProfileByUserId(userId: string) {
    return prisma.teacherProfile.findUnique({
      where: { userId },
    });
  }

  static async createProfile(
    userId: string,
    data: CreateTeacherProfileRequest,
  ) {
    const existing = await this.getProfileByUserId(userId);
    if (existing) {
      return null;
    }

    return prisma.teacherProfile.create({
      data: {
        userId,
        displayName: data.displayName,
        teachingRole: data.teachingRole,
        subjects: data.subjects,
        preferredLanguage: data.preferredLanguage || "English",
        curriculumBoard: data.curriculumBoard,
        experienceLevel: data.experienceLevel,
      },
    });
  }

  static async updateProfile(
    userId: string,
    data: UpdateTeacherProfileRequest,
  ) {
    const existing = await this.getProfileByUserId(userId);
    if (!existing) {
      return null;
    }

    return prisma.teacherProfile.update({
      where: { userId },
      data,
    });
  }
}
