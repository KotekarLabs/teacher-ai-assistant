import {
  WorksheetContentSchema,
  type WorksheetContent,
} from "@teacher-ai/contracts";
import type {
  EducationalQualityResult,
  SafetyCheckResult,
  WorksheetGenerationContext,
} from "../types";

export class WorksheetOutputValidator {
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
    data?: WorksheetContent;
    error?: string;
  } {
    const result = WorksheetContentSchema.safeParse(parsed);
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

  static checkSafety(textOrContent: string | WorksheetContent): SafetyCheckResult {
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
    content: WorksheetContent,
    _context: WorksheetGenerationContext,
  ): EducationalQualityResult {
    const feedback: string[] = [];

    if (!content.questions || content.questions.length === 0) {
      feedback.push("Worksheet contains no questions");
    } else {
      if (content.questions.length > 30) {
        feedback.push("Worksheet exceeds maximum allowed question count (30)");
      }

      content.questions.forEach((q, idx) => {
        if (!q.question || q.question.trim().length < 5) {
          feedback.push(`Question #${idx + 1} text is too short or empty`);
        }

        if (!q.expectedAnswer || q.expectedAnswer.trim().length === 0) {
          feedback.push(`Question #${idx + 1} has no expected answer`);
        }

        if (q.type === "MULTIPLE_CHOICE") {
          if (!q.options || q.options.length < 2) {
            feedback.push(
              `Multiple Choice Question #${idx + 1} requires at least 2 options`,
            );
          }
        }
      });
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
