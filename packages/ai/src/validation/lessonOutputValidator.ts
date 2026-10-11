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

  static checkPacing(
    content: LessonContent,
    context: LessonGenerationContext,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (context.durationMinutes <= 0) {
      errors.push("Lesson duration must be greater than 0");
    }

    if (
      content.classroomActivity &&
      content.classroomActivity.durationMinutes > context.durationMinutes
    ) {
      errors.push(
        `Classroom activity duration (${content.classroomActivity.durationMinutes}m) exceeds total lesson duration (${context.durationMinutes}m)`,
      );
    }

    // Backward-compatible check: only evaluated if optional pacingBreakdown is provided
    const pacing = content.pacingBreakdown;
    if (pacing && typeof pacing === "object") {
      const phases = [
        { name: "Introduction", val: pacing.introductionMinutes },
        { name: "Direct instruction", val: pacing.directInstructionMinutes },
        { name: "Activity", val: pacing.activityMinutes },
        { name: "Practice", val: pacing.practiceMinutes },
        { name: "Assessment", val: pacing.assessmentMinutes },
      ];

      let hasInvalidPhase = false;
      for (const p of phases) {
        if (typeof p.val !== "number" || isNaN(p.val) || p.val < 0) {
          errors.push(
            `Invalid phase duration for ${p.name}: must be a non-negative number`,
          );
          hasInvalidPhase = true;
        }
      }

      if (!hasInvalidPhase) {
        const sum =
          pacing.introductionMinutes +
          pacing.directInstructionMinutes +
          pacing.activityMinutes +
          pacing.practiceMinutes +
          pacing.assessmentMinutes;

        // Tolerance: ±10 mins or 25% of total duration
        const tolerance = Math.max(10, Math.round(context.durationMinutes * 0.25));
        if (Math.abs(sum - context.durationMinutes) > tolerance) {
          errors.push(
            `Lesson phase pacing sum (${sum}m) deviates significantly from requested duration (${context.durationMinutes}m)`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static checkEducationalQuality(
    content: LessonContent,
    context: LessonGenerationContext,
  ): EducationalQualityResult {
    const feedback: string[] = [];

    if (!content.learningObjectives || content.learningObjectives.length === 0) {
      feedback.push("Missing learning objectives");
    } else {
      content.learningObjectives.forEach((obj, idx) => {
        if (!obj || obj.trim().length < 5) {
          feedback.push(`Learning objective #${idx + 1} is too brief or empty`);
        }
      });
    }

    if (!content.examples || content.examples.length === 0) {
      feedback.push("Lesson must contain at least one concrete example");
    }

    if (!content.teacherExplanation || content.teacherExplanation.trim().length < 20) {
      feedback.push("Teacher explanation is too brief for classroom delivery");
    }

    const pacingCheck = this.checkPacing(content, context);
    if (!pacingCheck.isValid) {
      feedback.push(...pacingCheck.errors);
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
