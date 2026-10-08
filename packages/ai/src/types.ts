import type {
  LessonContent,
  WorksheetContent,
  QuizContent,
  HomeworkContent,
  QuestionType,
  HomeworkTaskType,
} from "@teacher-ai/contracts";

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

export interface WorksheetGenerationContext {
  classId: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questionTypes: QuestionType[];
  estimatedTimeMinutes?: number;
  teacherInstructions?: string;
}

export interface WorksheetGenerationResult {
  rawOutput: string;
  parsedContent?: WorksheetContent;
  provider: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface QuizGenerationContext {
  classId: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questionTypes: QuestionType[];
  durationMinutes?: number;
  teacherInstructions?: string;
}

export interface QuizGenerationResult {
  rawOutput: string;
  parsedContent?: QuizContent;
  provider: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface HomeworkGenerationContext {
  classId: string;
  grade: string;
  section?: string | null;
  curriculumBoard?: string | null;
  subject: string;
  topic: string;
  difficulty: string;
  taskCount?: number;
  taskTypes?: HomeworkTaskType[];
  taskPreferences?: HomeworkTaskType[];
  estimatedTimeMinutes?: number;
  teacherInstructions?: string;
}

export interface HomeworkGenerationResult {
  rawOutput: string;
  parsedContent?: HomeworkContent;
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
  generateWorksheet(
    context: WorksheetGenerationContext,
  ): Promise<WorksheetGenerationResult>;
  generateQuiz(
    context: QuizGenerationContext,
  ): Promise<QuizGenerationResult>;
  generateHomework(
    context: HomeworkGenerationContext,
  ): Promise<HomeworkGenerationResult>;
}
