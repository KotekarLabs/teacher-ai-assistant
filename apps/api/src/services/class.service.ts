import type {
  CreateClassRequest,
  UpdateClassRequest,
} from "@teacher-ai/contracts";
import { ClassRepository } from "../repositories/class.repository";

export class ClassService {
  static async getClasses(teacherId: string, includeArchived = false) {
    return ClassRepository.findManyByTeacherId(teacherId, includeArchived);
  }

  static async getClassById(teacherId: string, classId: string) {
    return ClassRepository.findByIdAndTeacherId(classId, teacherId);
  }

  static async createClass(teacherId: string, data: CreateClassRequest) {
    return ClassRepository.create({
      teacherId,
      name: data.name,
      grade: data.grade,
      section: data.section ? data.section.trim() : null,
      curriculumBoard: data.curriculumBoard ? data.curriculumBoard.trim() : null,
      academicYear: data.academicYear ? data.academicYear.trim() : null,
    });
  }

  static async updateClass(
    teacherId: string,
    classId: string,
    data: UpdateClassRequest,
  ) {
    const existing = await this.getClassById(teacherId, classId);
    if (!existing) {
      return null;
    }

    return ClassRepository.update(classId, {
      name: data.name !== undefined ? data.name : undefined,
      grade: data.grade !== undefined ? data.grade : undefined,
      section:
        data.section !== undefined
          ? data.section
            ? data.section.trim()
            : null
          : undefined,
      curriculumBoard:
        data.curriculumBoard !== undefined
          ? data.curriculumBoard
            ? data.curriculumBoard.trim()
            : null
          : undefined,
      academicYear:
        data.academicYear !== undefined
          ? data.academicYear
            ? data.academicYear.trim()
            : null
          : undefined,
    });
  }

  static async archiveClass(teacherId: string, classId: string) {
    const existing = await this.getClassById(teacherId, classId);
    if (!existing) {
      return null;
    }

    return ClassRepository.archive(classId);
  }
}
