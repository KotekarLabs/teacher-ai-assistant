import type { GenerateQuizRequest } from "@teacher-ai/contracts";
import type { QuizGenerationContext } from "../types";

export interface QuizClassContextInput {
  id: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  name?: string;
}

export class QuizContextBuilder {
  static buildContext(
    request: GenerateQuizRequest,
    classData: QuizClassContextInput,
  ): QuizGenerationContext {
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
      questionTypes:
        request.questionTypes && request.questionTypes.length > 0
          ? request.questionTypes
          : ["MULTIPLE_CHOICE", "TRUE_FALSE"],
      durationMinutes: request.durationMinutes || 20,
      teacherInstructions: request.teacherInstructions?.trim() || undefined,
    };
  }
}
