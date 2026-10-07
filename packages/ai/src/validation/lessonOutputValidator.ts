import {
  LessonContentSchema,
  type LessonContent,
} from "@teacher-ai/contracts";
import type {
  EducationalQualityResult,
  LessonGenerationContext,
  SafetyCheckResult,
} from "../types";

export class LessonOutputValidator {
  static parseJson(rawOutput: string): unknown {
    let clean = rawOutput.trim();
    if (clean.startsWith("```json")) {
      clean = clean.slice(7);
    } else if (clean.startsWith("```")) {
      clean = clean.slice(3);
    }
    if (clean.endsWith("```")) {
      clean = clean.slice(0, -3);
    }
    return JSON.parse(clean.trim()) as unknown;
  }

  static validateSchema(parsed: unknown): {
    success: boolean;
    data?: LessonContent;
    error?: string;
  } {
    const result = LessonContentSchema.safeParse(parsed);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      };
    }
    return {
      success: true,
      data: result.data,
    };
  }

  static checkSafety(textOrContent: string | LessonContent): SafetyCheckResult {
    const serialized =
      typeof textOrContent === "string"
        ? textOrContent
        : JSON.stringify(textOrContent);
    const lower = serialized.toLowerCase();

    const unsafeKeywords = [
      "bomb",
      "explosive",
      "weapon",
      "suicide",
      "self-harm",
      "pornography",
      "explicit sexual",
      "kill yourself",
      "harm yourself",
      "hate speech",
      "racial slur",
    ];

    for (const keyword of unsafeKeywords) {
      if (lower.includes(keyword)) {
        return {
          isSafe: false,
          reason: `Unsafe keyword detected: ${keyword}`,
        };
      }
    }

    return { isSafe: true };
  }

  static checkEducationalQuality(
    content: LessonContent,
    context: LessonGenerationContext,
  ): EducationalQualityResult {
    const feedback: string[] = [];

    if (!content.learningObjectives || content.learningObjectives.length === 0) {
      feedback.push("Missing learning objectives");
    }

    if (!content.examples || content.examples.length === 0) {
      feedback.push("Lesson must contain at least one concrete example");
    }

    if (!content.teacherExplanation || content.teacherExplanation.trim().length < 20) {
      feedback.push("Teacher explanation is too brief for classroom delivery");
    }

    if (
      content.classroomActivity &&
      content.classroomActivity.durationMinutes > context.durationMinutes
    ) {
      feedback.push(
        `Classroom activity duration (${content.classroomActivity.durationMinutes}m) exceeds total lesson duration (${context.durationMinutes}m)`,
      );
    }

    if (feedback.length > 0) {
      return {
        isAcceptable: false,
        score: Math.max(0, 100 - feedback.length * 25),
        feedback,
      };
    }

    return {
      isAcceptable: true,
      score: 100,
    };
  }
}
