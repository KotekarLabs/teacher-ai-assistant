import type { GenerateLessonRequest } from "@teacher-ai/contracts";
import type { LessonGenerationContext } from "../types";

export interface ClassContextInput {
  id: string;
  grade: string;
  curriculumBoard?: string | null;
  name?: string;
}

export interface TeacherProfileContextInput {
  preferredLanguage?: string | null;
  teachingRole?: string | null;
  experienceLevel?: string | null;
}

export class LessonContextBuilder {
  static buildContext(
    request: GenerateLessonRequest,
    classData: ClassContextInput,
    profileData?: TeacherProfileContextInput | null,
  ): LessonGenerationContext {
    return {
      classId: classData.id,
      grade: classData.grade,
      subject: request.subject.trim(),
      topic: request.topic.trim(),
      curriculumBoard:
        request.curriculumBoard?.trim() || classData.curriculumBoard || "General",
      durationMinutes: request.durationMinutes || 40,
      difficulty: request.difficulty || "MEDIUM",
      teacherInstructions: request.teacherInstructions?.trim() || undefined,
      preferredLanguage: profileData?.preferredLanguage?.trim() || "English",
      teachingRole: profileData?.teachingRole?.trim() || undefined,
      experienceLevel: profileData?.experienceLevel?.trim() || undefined,
    };
  }
}
