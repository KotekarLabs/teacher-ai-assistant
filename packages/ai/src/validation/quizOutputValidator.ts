import {
  QuizContentSchema,
  type QuizContent,
} from "@teacher-ai/contracts";
import type {
  EducationalQualityResult,
  SafetyCheckResult,
  QuizGenerationContext,
} from "../types";

export class QuizOutputValidator {
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
    data?: QuizContent;
    error?: string;
  } {
    const result = QuizContentSchema.safeParse(parsed);
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

  static checkSafety(textOrContent: string | QuizContent): SafetyCheckResult {
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

  static checkAnswerConsistency(content: QuizContent): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    content.questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.correctAnswer || q.correctAnswer.trim().length === 0) {
        errors.push(`Question #${qNum} missing correct answer`);
        return;
      }

      if (q.type === "MULTIPLE_CHOICE") {
        if (!q.options || q.options.length < 2) {
          errors.push(
            `Multiple choice question #${qNum} must have at least 2 options`,
          );
        } else if (!q.options.includes(q.correctAnswer.trim())) {
          errors.push(
            `Multiple choice question #${qNum} correct answer "${q.correctAnswer}" is not present in options: [${q.options.join(", ")}]`,
          );
        }
      } else if (q.type === "TRUE_FALSE") {
        const lowerAns = q.correctAnswer.trim().toLowerCase();
        if (lowerAns !== "true" && lowerAns !== "false") {
          errors.push(
            `True/False question #${qNum} correct answer must be "True" or "False", got "${q.correctAnswer}"`,
          );
        }
      } else if (q.type === "FILL_IN_THE_BLANK") {
        if (q.correctAnswer.trim().length === 0) {
          errors.push(
            `Fill in the blank question #${qNum} has empty expected answer`,
          );
        }
      } else if (q.type === "SHORT_ANSWER") {
        if (q.correctAnswer.trim().length === 0) {
          errors.push(
            `Short answer question #${qNum} has empty expected answer`,
          );
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static calculateTotalMarks(content: QuizContent): number {
    return content.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }

  static checkEducationalQuality(
    content: QuizContent,
    context?: QuizGenerationContext,
  ): EducationalQualityResult {
    const feedback: string[] = [];

    if (!content.questions || content.questions.length === 0) {
      feedback.push("Quiz contains no questions");
    } else {
      if (content.questions.length > 30) {
        feedback.push("Quiz exceeds maximum allowed question count (30)");
      }

      if (context?.questionCount && Math.abs(content.questions.length - context.questionCount) > 2) {
        feedback.push(`Expected ~${context.questionCount} questions but received ${content.questions.length}`);
      }

      content.questions.forEach((q, idx) => {
        if (!q.question || q.question.trim().length < 5) {
          feedback.push(`Question #${idx + 1} text is too short or empty`);
        }

        if (q.marks < 1) {
          feedback.push(`Question #${idx + 1} marks must be at least 1`);
        }
      });

      const answerCheck = this.checkAnswerConsistency(content);
      if (!answerCheck.isValid) {
        feedback.push(...answerCheck.errors);
      }
    }

    if (content.durationMinutes <= 0) {
      feedback.push("Duration must be greater than 0");
    } else if (
      content.questions &&
      content.questions.length >= 20 &&
      content.durationMinutes <= 1
    ) {
      feedback.push(
        "Duration of 1 minute is unreasonable for a quiz with 20+ questions",
      );
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
