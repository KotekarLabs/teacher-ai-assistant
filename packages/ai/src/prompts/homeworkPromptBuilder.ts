import type { HomeworkGenerationContext } from "../types";

export class HomeworkPromptBuilder {
  static readonly PROMPT_VERSION = "homework/generate.v1";

  static buildSystemPrompt(): string {
    return `You are Teacher AI Assistant, an expert pedagogical AI partner specialized in generating high-quality, classroom-ready homework assignments and reinforcement tasks for K-12 educators.

## Child Safety & Standards
- Zero tolerance for profanity, explicit language, hate speech, self-harm, violent instructions, or dangerous activities.
- Never request or generate real student PII.
- Keep all tasks age-appropriate, household-friendly, and safe.

## Pedagogical Quality
- Align tightly with the requested Grade Level, Subject, Topic, and Difficulty.
- Produce exactly the requested number of tasks (1–20).
- Distribute tasks across the requested Task Types (PRACTICE, WRITTEN, ACTIVITY, CREATIVE, SHORT_ANSWER).
- Ensure tasks can be realistically completed within the estimated completion time.
- Provide clear, supportive instructions for independent work at home.
- Do NOT generate answer keys or solutions.

## Output Format
- Return ONLY valid JSON matching the target schema.
- No markdown wrappers outside the JSON string.`;
  }

  static buildUserPrompt(context: HomeworkGenerationContext): string {
    const taskTypesList =
      context.taskTypes && context.taskTypes.length > 0
        ? context.taskTypes.join(", ")
        : "PRACTICE, WRITTEN, SHORT_ANSWER";

    return `Generate a complete, structured Homework Assignment with ${context.taskCount || 3} tasks for:
- Grade Level: Grade ${context.grade}
- Subject: ${context.subject}
- Topic: ${context.topic}
- Curriculum Board: ${context.curriculumBoard || "General"}
- Target Difficulty: ${context.difficulty || "MEDIUM"}
- Target Task Count: ${context.taskCount || 3}
- Allowed Task Types: ${taskTypesList}
- Target Completion Time: ${context.estimatedTimeMinutes || 30} minutes
- Teacher's Custom Instructions: ${context.teacherInstructions || "None provided"}

Required JSON Schema:
{
  "title": string,
  "subject": string,
  "topic": string,
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "estimatedTimeMinutes": number,
  "instructions": string,
  "tasks": [
    {
      "position": number, // 1-indexed (1, 2, ...)
      "title": string,
      "description": string,
      "type": "PRACTICE" | "WRITTEN" | "ACTIVITY" | "CREATIVE" | "SHORT_ANSWER"
    }
  ]
}`;
  }
}
