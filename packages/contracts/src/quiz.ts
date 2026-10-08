import { z } from "zod";
import { QuestionTypeEnum, type QuestionType } from "./worksheet";

export const QuizDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type QuizDifficulty = z.infer<typeof QuizDifficultyEnum>;

export const QuizStatusEnum = z.enum([
  "GENERATING",
  "DRAFT",
  "EDITED",
  "SAVED",
  "ARCHIVED",
  "GENERATION_FAILED",
]);
export type QuizStatus = z.infer<typeof QuizStatusEnum>;

export const QuizQuestionSchema = z.object({
  id: z.string().optional(),
  position: z.number().int().positive(),
  type: QuestionTypeEnum,
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  marks: z.number().int().positive().default(1),
  difficulty: QuizDifficultyEnum.default("MEDIUM"),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: QuizDifficultyEnum.default("MEDIUM"),
  durationMinutes: z.number().int().positive().default(20),
  instructions: z.string().optional(),
  totalMarks: z.number().int().nonnegative().default(0),
  questions: z
    .array(QuizQuestionSchema)
    .min(1, "At least one question is required")
    .max(30, "Maximum 30 questions allowed"),
});
export type QuizContent = z.infer<typeof QuizContentSchema>;

export const GenerateQuizRequestSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: QuizDifficultyEnum.optional().default("MEDIUM"),
  questionCount: z
    .number()
    .int()
    .min(1, "At least 1 question is required")
    .max(30, "Maximum 30 questions allowed")
    .default(5),
  questionTypes: z
    .array(QuestionTypeEnum)
    .min(1, "At least one question type must be selected")
    .default(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
  durationMinutes: z.number().int().positive().optional().default(20),
  curriculumBoard: z.string().optional(),
  teacherInstructions: z.string().optional(),
});
export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;

export const UpdateQuizQuestionSchema = z.object({
  id: z.string().optional(),
  position: z.number().int().positive(),
  type: QuestionTypeEnum,
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  marks: z.number().int().positive().default(1),
  difficulty: QuizDifficultyEnum.default("MEDIUM"),
});
export type UpdateQuizQuestion = z.infer<typeof UpdateQuizQuestionSchema>;

export const UpdateQuizRequestSchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  status: QuizStatusEnum.optional(),
  questions: z.array(UpdateQuizQuestionSchema).min(1).optional(),
});
export type UpdateQuizRequest = z.infer<typeof UpdateQuizRequestSchema>;

export interface QuizQuestionDTO {
  id: string;
  quizId: string;
  position: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  marks: number;
  difficulty: QuizDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDTO {
  id: string;
  teacherId: string;
  classId: string;
  generationRequestId: string | null;
  title: string;
  subject: string;
  topic: string;
  curriculumBoard: string | null;
  difficulty: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string | null;
  status: string;
  questions: QuizQuestionDTO[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface QuizResponse {
  quiz: QuizDTO;
  message?: string;
}

export interface QuizListResponse {
  quizzes: QuizDTO[];
}
