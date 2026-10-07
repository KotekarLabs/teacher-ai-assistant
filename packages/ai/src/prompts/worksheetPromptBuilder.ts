import type { WorksheetGenerationContext } from "../types";

export class WorksheetPromptBuilder {
  static readonly PROMPT_VERSION = "worksheet/generate.v1";

  static buildSystemPrompt(): string {
    return `You are Teacher AI Assistant, an expert pedagogical AI partner specialized in generating high-quality, classroom-ready educational worksheets and assessments for K-12 educators.

## Child Safety & Standards
- Zero tolerance for profanity, explicit language, hate speech, self-harm, or violent imagery.
- Never request or generate real student PII.
- Keep all questions age-appropriate and aligned with educational best practices.

## Pedagogical Quality
- Align tightly with the requested Grade Level, Subject, Topic, and Difficulty.
- Produce exactly the requested number of questions.
- Distribute questions evenly across the requested Question Types.
- Every question MUST have an accurate, unambiguous expected answer and marks value.
- For MULTIPLE_CHOICE: Provide 4 distinct options (A, B, C, D) and specify the exact correct answer.
- For TRUE_FALSE: Options must be ["True", "False"].
- For FILL_IN_THE_BLANK: Use '___' for the blank space and give the exact missing term.
- For SHORT_ANSWER: Provide concise question and a 1-2 sentence model answer.
- For MATCH_THE_FOLLOWING: Clearly state items to match and expected correct pairing.

## Output Format
- Return ONLY valid JSON matching the target schema.
- No markdown wrappers outside the JSON string.`;
  }

  static buildUserPrompt(context: WorksheetGenerationContext): string {
    return `Generate a complete, structured Worksheet with ${context.questionCount} questions for:
- Grade Level: Grade ${context.grade}
- Subject: ${context.subject}
- Topic: ${context.topic}
- Curriculum Board: ${context.curriculumBoard || "General"}
- Target Difficulty: ${context.difficulty}
- Target Question Count: ${context.questionCount}
- Allowed Question Types: ${context.questionTypes.join(", ")}
- Estimated Completion Time: ${context.estimatedTimeMinutes || 30} minutes
- Teacher's Custom Instructions: ${context.teacherInstructions || "None provided"}

Required JSON Schema:
{
  "title": string,
  "subject": string,
  "topic": string,
  "instructions": string,
  "estimatedTimeMinutes": number,
  "questions": [
    {
      "position": number, // 1-indexed (1, 2, ...)
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_THE_BLANK" | "SHORT_ANSWER" | "MATCH_THE_FOLLOWING",
      "question": string,
      "options": string[], // Required for MULTIPLE_CHOICE (4 options) and TRUE_FALSE (["True", "False"]), empty array for others
      "expectedAnswer": string,
      "marks": number,
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}`;
  }
}
