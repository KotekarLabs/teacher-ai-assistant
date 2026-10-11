import { z } from "zod";

export const QuestionTypeEnum = z.enum([
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_IN_THE_BLANK",
  "SHORT_ANSWER",
  "MATCH_THE_FOLLOWING",
]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const WorksheetDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type WorksheetDifficulty = z.infer<typeof WorksheetDifficultyEnum>;

export const WorksheetStatusEnum = z.enum([
  "GENERATING",
  "DRAFT",
  "EDITED",
  "SAVED",
  "ARCHIVED",
  "GENERATION_FAILED",
]);
export type WorksheetStatus = z.infer<typeof WorksheetStatusEnum>;

export const WorksheetExportModeEnum = z.enum(["student", "answer-key"]);
export type WorksheetExportMode = z.infer<typeof WorksheetExportModeEnum>;

export const WorksheetQuestionSchema = z.object({
  id: z.string().optional(),
  position: z.number().int().positive(),
  type: QuestionTypeEnum,
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).default([]),
  expectedAnswer: z.string().min(1, "Expected answer is required"),
  marks: z.number().int().positive().default(1),
  difficulty: WorksheetDifficultyEnum.default("MEDIUM"),
});
export type WorksheetQuestion = z.infer<typeof WorksheetQuestionSchema>;

export const WorksheetContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  instructions: z.string().optional(),
  estimatedTimeMinutes: z.number().int().positive().default(30),
  questions: z
    .array(WorksheetQuestionSchema)
    .min(1, "At least one question is required")
    .max(30, "Maximum 30 questions allowed"),
});
export type WorksheetContent = z.infer<typeof WorksheetContentSchema>;

export const GenerateWorksheetRequestSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: WorksheetDifficultyEnum.optional().default("MEDIUM"),
  questionCount: z
    .number()
    .int()
    .min(1, "At least 1 question is required")
    .max(30, "Maximum 30 questions allowed")
    .default(5),
  questionTypes: z
    .array(QuestionTypeEnum)
    .min(1, "At least one question type must be selected")
    .default(["MULTIPLE_CHOICE", "SHORT_ANSWER"]),
  estimatedTimeMinutes: z.number().int().positive().optional().default(30),
  curriculumBoard: z.string().optional(),
  teacherInstructions: z.string().optional(),
});
export type GenerateWorksheetRequest = z.infer<
  typeof GenerateWorksheetRequestSchema
>;

export const UpdateWorksheetQuestionSchema = z.object({
  id: z.string().optional(),
  position: z.number().int().positive(),
  type: QuestionTypeEnum,
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).default([]),
  expectedAnswer: z.string().min(1, "Expected answer is required"),
  marks: z.number().int().positive().default(1),
  difficulty: WorksheetDifficultyEnum.default("MEDIUM"),
});
export type UpdateWorksheetQuestion = z.infer<
  typeof UpdateWorksheetQuestionSchema
>;

export const UpdateWorksheetRequestSchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().optional(),
  estimatedTimeMinutes: z.number().int().positive().optional(),
  status: WorksheetStatusEnum.optional(),
  questions: z.array(UpdateWorksheetQuestionSchema).min(1).optional(),
});
export type UpdateWorksheetRequest = z.infer<
  typeof UpdateWorksheetRequestSchema
>;

export interface WorksheetQuestionDTO {
  id: string;
  worksheetId: string;
  position: number;
  type: QuestionType;
  question: string;
  options: string[];
  expectedAnswer: string;
  marks: number;
  difficulty: WorksheetDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface WorksheetDTO {
  id: string;
  teacherId: string;
  classId: string;
  generationRequestId: string | null;
  title: string;
  subject: string;
  topic: string;
  curriculumBoard: string | null;
  difficulty: string;
  estimatedTimeMinutes: number;
  instructions: string | null;
  status: string;
  questions: WorksheetQuestionDTO[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface WorksheetResponse {
  worksheet: WorksheetDTO;
  message?: string;
}

export interface WorksheetListResponse {
  worksheets: WorksheetDTO[];
}
