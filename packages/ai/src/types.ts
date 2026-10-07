import type { LessonContent } from "@teacher-ai/contracts";

export interface LessonGenerationContext {
  classId: string;
  grade: string;
  subject: string;
  topic: string;
  curriculumBoard?: string | null;
  durationMinutes: number;
  difficulty: string;
  teacherInstructions?: string;
}

export interface LessonGenerationResult {
  rawOutput: string;
  parsedContent?: LessonContent;
  provider: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
}

export interface EducationalQualityResult {
  isAcceptable: boolean;
  score: number;
  feedback?: string[];
}

export interface AIProvider {
  generateLesson(
    context: LessonGenerationContext,
  ): Promise<LessonGenerationResult>;
}
