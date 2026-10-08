import {
  HomeworkContentSchema,
  type HomeworkContent,
  MAX_HOMEWORK_TASKS,
  MIN_HOMEWORK_MINUTES,
  MAX_HOMEWORK_MINUTES,
} from "@teacher-ai/contracts";
import type {
  EducationalQualityResult,
  SafetyCheckResult,
  HomeworkGenerationContext,
} from "../types";

export class HomeworkOutputValidator {
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
    data?: HomeworkContent;
    error?: string;
  } {
    const result = HomeworkContentSchema.safeParse(parsed);
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

  static checkSafety(
    textOrContent: string | HomeworkContent,
  ): SafetyCheckResult {
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

  static checkWorkload(
    content: HomeworkContent,
    context?: HomeworkGenerationContext,
  ): { isValid: boolean; isAcceptable: boolean; reason?: string; errors: string[] } {
    const errors: string[] = [];

    if (
      content.estimatedTimeMinutes < MIN_HOMEWORK_MINUTES ||
      content.estimatedTimeMinutes > MAX_HOMEWORK_MINUTES
    ) {
      errors.push(
        `Estimated time (${content.estimatedTimeMinutes} mins) must be between ${MIN_HOMEWORK_MINUTES} and ${MAX_HOMEWORK_MINUTES} minutes`,
      );
    }

    if (
      content.tasks &&
      content.tasks.length > 10 &&
      content.estimatedTimeMinutes <= 10
    ) {
      errors.push(
        `Workload mismatch: ${content.tasks.length} tasks cannot be completed reasonably within ${content.estimatedTimeMinutes} minutes`,
      );
    }

    if (
      context?.taskCount &&
      Math.abs(content.tasks.length - context.taskCount) > 2
    ) {
      errors.push(
        `Expected ~${context.taskCount} tasks but received ${content.tasks.length}`,
      );
    }

    return {
      isValid: errors.length === 0,
      isAcceptable: errors.length === 0,
      reason: errors.length > 0 ? errors.join(", ") : undefined,
      errors,
    };
  }

  static checkEducationalQuality(
    content: HomeworkContent,
    context?: HomeworkGenerationContext,
  ): EducationalQualityResult {
    const feedback: string[] = [];

    if (!content.title || content.title.trim().length < 3) {
      feedback.push("Homework title is too short or empty");
    }

    if (!content.instructions || content.instructions.trim().length < 5) {
      feedback.push("Homework instructions are too short or empty");
    }

    if (!content.tasks || content.tasks.length === 0) {
      feedback.push("Homework contains no tasks");
    } else {
      if (content.tasks.length > MAX_HOMEWORK_TASKS) {
        feedback.push(
          `Homework exceeds maximum allowed task count (${MAX_HOMEWORK_TASKS})`,
        );
      }

      content.tasks.forEach((t, idx) => {
        const taskNum = idx + 1;
        if (!t.title || t.title.trim().length < 2) {
          feedback.push(`Task #${taskNum} title is too short or empty`);
        }
        if (!t.description || t.description.trim().length < 5) {
          feedback.push(`Task #${taskNum} description is too short or empty`);
        }
      });
    }

    const workloadCheck = this.checkWorkload(content, context);
    if (!workloadCheck.isValid) {
      feedback.push(...workloadCheck.errors);
    }

    if (feedback.length > 0) {
      return {
        isAcceptable: false,
        score: Math.max(0, 100 - feedback.length * 20),
        feedback,
      };
    }

    return {
      isAcceptable: true,
      score: 100,
    };
  }
}
