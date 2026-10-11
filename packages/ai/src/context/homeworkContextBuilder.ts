import type { GenerateHomeworkRequest } from "@teacher-ai/contracts";
import type { HomeworkGenerationContext } from "../types";

import type { TeacherProfileContextInput } from "./lessonContextBuilder";

export interface HomeworkClassContextInput {
  id: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  name?: string;
}

export class HomeworkContextBuilder {
  static buildContext(
    request: GenerateHomeworkRequest,
    classData: HomeworkClassContextInput,
    profileData?: TeacherProfileContextInput | null,
  ): HomeworkGenerationContext {
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
      taskCount: request.taskCount || 3,
      taskTypes:
        request.taskTypes && request.taskTypes.length > 0
          ? request.taskTypes
          : ["PRACTICE", "WRITTEN"],
      estimatedTimeMinutes: request.estimatedTimeMinutes || 30,
      teacherInstructions: request.teacherInstructions?.trim() || undefined,
      preferredLanguage: profileData?.preferredLanguage?.trim() || "English",
      teachingRole: profileData?.teachingRole?.trim() || undefined,
      experienceLevel: profileData?.experienceLevel?.trim() || undefined,
    };
  }
}
