import type { LessonContent } from "@teacher-ai/contracts";
import type {
  AIProvider,
  LessonGenerationContext,
  LessonGenerationResult,
} from "../types";
import { LessonPromptBuilder } from "../prompts/lessonPromptBuilder";

export class MockAIProvider implements AIProvider {
  async generateLesson(
    context: LessonGenerationContext,
  ): Promise<LessonGenerationResult> {
    const startTime = Date.now();

    const structuredContent: LessonContent = {
      title: `${context.topic} — Grade ${context.grade} ${context.subject}`,
      overview: `A comprehensive ${context.durationMinutes}-minute lesson designed to teach ${context.topic} to Grade ${context.grade} students with engaging conceptual breakdown and hands-on practice.`,
      learningObjectives: [
        `Understand the core principles and key mechanisms of ${context.topic}.`,
        `Identify real-world examples and applications of ${context.topic}.`,
        `Demonstrate comprehension by solving classroom problems and answering discussion questions.`,
      ],
      prerequisites: [
        `Basic foundational understanding of Grade ${context.grade} ${context.subject} concepts.`,
      ],
      introduction: `Begin by asking students an engaging hook question related to ${context.topic} in daily life. Connect their existing observations to today's core concept.`,
      teacherExplanation: `Explain ${context.topic} step-by-step using clear, grade-appropriate language. Highlight key terminology, cause-and-effect relationships, and practical significance.`,
      examples: [
        `Example 1: Demonstrating ${context.topic} in an everyday classroom scenario.`,
        `Example 2: Analyzing a standard step-by-step problem related to ${context.topic}.`,
      ],
      classroomActivity: {
        title: `Interactive ${context.topic} Exploration`,
        instructions: `Divide students into small groups. Have them investigate a guided scenario on ${context.topic}, record their findings, and present one key insight to the class.`,
        durationMinutes: Math.min(15, Math.floor(context.durationMinutes / 3)),
      },
      practice: [
        `Guided Practice: Complete a structured worksheet problem together on the board.`,
        `Independent Practice: Students solve 2 practice questions individually.`,
      ],
      quickAssessment: [
        `Quick formative check: What is the most important takeaway from today's lesson on ${context.topic}?`,
        `Exit ticket question to evaluate student mastery before conclusion.`,
      ],
      homework: `Review class notes and complete 3 follow-up exercise questions on ${context.topic}.`,
      teacherScript: `Good morning class! Today we are diving into an exciting topic: ${context.topic}. Look around you—how do you see this in action every day? Let's find out together!`,
    };

    const rawOutput = JSON.stringify(structuredContent, null, 2);
    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      rawOutput,
      parsedContent: structuredContent,
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion: LessonPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens: 450,
      outputTokens: 620,
      estimatedCost: 0.002,
    };
  }
}
