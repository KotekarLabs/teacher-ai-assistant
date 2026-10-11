import type { GenerateWorksheetRequest } from "@teacher-ai/contracts";
import type { WorksheetGenerationContext } from "../types";

import type { TeacherProfileContextInput } from "./lessonContextBuilder";

export interface WorksheetClassContextInput {
  id: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  name?: string;
}

export class WorksheetContextBuilder {
  static buildContext(
    request: GenerateWorksheetRequest,
    classData: WorksheetClassContextInput,
    profileData?: TeacherProfileContextInput | null,
  ): WorksheetGenerationContext {
    return {
      classId: classData.id,
      grade: classData.grade,
      section: classData.section || null,
      curriculumBoard:
        request.curriculumBoard?.trim() ||
        classData.curriculumBoard ||
        "General",
      subject: request.subject.trim(),
      topic: request.topic.trim(),
      difficulty: request.difficulty || "MEDIUM",
      questionCount: request.questionCount || 5,
      questionTypes: request.questionTypes && request.questionTypes.length > 0
        ? request.questionTypes
        : ["MULTIPLE_CHOICE", "SHORT_ANSWER"],
      estimatedTimeMinutes: request.estimatedTimeMinutes || 30,
      teacherInstructions: request.teacherInstructions?.trim() || undefined,
      preferredLanguage: profileData?.preferredLanguage?.trim() || "English",
      teachingRole: profileData?.teachingRole?.trim() || undefined,
      experienceLevel: profileData?.experienceLevel?.trim() || undefined,
    };
  }
}
