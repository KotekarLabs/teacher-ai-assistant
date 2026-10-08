import type { QuizGenerationContext } from "../types";

export class QuizPromptBuilder {
  static readonly PROMPT_VERSION = "quiz/generate.v1";

  static buildSystemPrompt(): string {
    return `You are Teacher AI Assistant, an expert pedagogical AI partner specialized in generating high-quality, classroom-ready educational quizzes and assessments for K-12 educators.

## Child Safety & Standards
- Zero tolerance for profanity, explicit language, hate speech, self-harm, violent instructions, or dangerous activities.
- Never request or generate real student PII.
- Keep all questions age-appropriate and aligned with educational best practices.

## Pedagogical Quality
- Align tightly with the requested Grade Level, Subject, Topic, and Difficulty.
- Produce exactly the requested number of questions (1–30).
- Distribute questions across the requested Question Types.
- Every question MUST have an accurate correctAnswer, meaningful marks, and an informative explanation.
- For MULTIPLE_CHOICE: Provide 4 distinct options and the correctAnswer MUST EXACTLY MATCH one of the options.
- For TRUE_FALSE: Options must be ["True", "False"], and correctAnswer must be "True" or "False".
- For FILL_IN_THE_BLANK: Use '___' for the blank space and give the exact missing term as correctAnswer.
- For SHORT_ANSWER: Provide a concise question and a 1-2 sentence model correctAnswer.
- Allocate marks >= 1 for each question.
- Calculate totalMarks as the sum of all question marks.

## Output Format
- Return ONLY valid JSON matching the target schema.
- No markdown wrappers outside the JSON string.`;
  }

  static buildUserPrompt(context: QuizGenerationContext): string {
    return `Generate a complete, structured Quiz with ${context.questionCount} questions for:
- Grade Level: Grade ${context.grade}
- Subject: ${context.subject}
- Topic: ${context.topic}
- Curriculum Board: ${context.curriculumBoard || "General"}
- Target Difficulty: ${context.difficulty}
- Target Question Count: ${context.questionCount}
- Allowed Question Types: ${context.questionTypes.join(", ")}
- Target Duration: ${context.durationMinutes || 20} minutes
- Teacher's Custom Instructions: ${context.teacherInstructions || "None provided"}

Required JSON Schema:
{
  "title": string,
  "subject": string,
  "topic": string,
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "durationMinutes": number,
  "instructions": string,
  "totalMarks": number,
  "questions": [
    {
      "position": number, // 1-indexed (1, 2, ...)
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_THE_BLANK" | "SHORT_ANSWER",
      "question": string,
      "options": string[], // Required for MULTIPLE_CHOICE (4 options) and TRUE_FALSE (["True", "False"]), empty array for others
      "correctAnswer": string, // For MULTIPLE_CHOICE, must exactly match one item in options
      "explanation": string,
      "marks": number,
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}`;
  }
}
