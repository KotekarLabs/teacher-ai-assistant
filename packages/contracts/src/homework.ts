import { z } from "zod";

export const HomeworkTaskTypeEnum = z.enum([
  "PRACTICE",
  "WRITTEN",
  "ACTIVITY",
  "CREATIVE",
  "SHORT_ANSWER",
]);
export type HomeworkTaskType = z.infer<typeof HomeworkTaskTypeEnum>;

export const HomeworkDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type HomeworkDifficulty = z.infer<typeof HomeworkDifficultyEnum>;

export const HomeworkStatusEnum = z.enum([
  "GENERATING",
  "DRAFT",
  "EDITED",
  "SAVED",
  "ARCHIVED",
  "GENERATION_FAILED",
]);
export type HomeworkStatus = z.infer<typeof HomeworkStatusEnum>;

export const MIN_HOMEWORK_TASKS = 1;
export const MAX_HOMEWORK_TASKS = 20;
export const MIN_HOMEWORK_MINUTES = 5;
export const MAX_HOMEWORK_MINUTES = 180;

export const HomeworkTaskSchema = z.object({
  position: z.number().int().positive(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Task description is required"),
  type: HomeworkTaskTypeEnum.default("PRACTICE"),
});
export type HomeworkTask = z.infer<typeof HomeworkTaskSchema>;

export const HomeworkContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: HomeworkDifficultyEnum.default("MEDIUM"),
  estimatedTimeMinutes: z
    .number()
    .int()
    .min(MIN_HOMEWORK_MINUTES, `Minimum ${MIN_HOMEWORK_MINUTES} minutes`)
    .max(MAX_HOMEWORK_MINUTES, `Maximum ${MAX_HOMEWORK_MINUTES} minutes`)
    .default(30),
  instructions: z.string().min(1, "Instructions are required"),
  tasks: z
    .array(HomeworkTaskSchema)
    .min(MIN_HOMEWORK_TASKS, `At least ${MIN_HOMEWORK_TASKS} task is required`)
    .max(MAX_HOMEWORK_TASKS, `Maximum ${MAX_HOMEWORK_TASKS} tasks allowed`),
});
export type HomeworkContent = z.infer<typeof HomeworkContentSchema>;

export const GenerateHomeworkRequestSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: HomeworkDifficultyEnum.optional().default("MEDIUM"),
  taskCount: z
    .number()
    .int()
    .min(MIN_HOMEWORK_TASKS, `At least ${MIN_HOMEWORK_TASKS} task is required`)
    .max(MAX_HOMEWORK_TASKS, `Maximum ${MAX_HOMEWORK_TASKS} tasks allowed`)
    .default(3),
  taskTypes: z
    .array(HomeworkTaskTypeEnum)
    .min(1, "At least one task type must be selected")
    .default(["PRACTICE", "WRITTEN"]),
  estimatedTimeMinutes: z
    .number()
    .int()
    .min(MIN_HOMEWORK_MINUTES, `Minimum ${MIN_HOMEWORK_MINUTES} minutes`)
    .max(MAX_HOMEWORK_MINUTES, `Maximum ${MAX_HOMEWORK_MINUTES} minutes`)
    .optional()
    .default(30),
  curriculumBoard: z.string().optional(),
  teacherInstructions: z.string().optional(),
});
export type GenerateHomeworkRequest = z.infer<
  typeof GenerateHomeworkRequestSchema
>;

export const UpdateHomeworkTaskSchema = z.object({
  position: z.number().int().positive(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Task description is required"),
  type: HomeworkTaskTypeEnum.default("PRACTICE"),
});
export type UpdateHomeworkTask = z.infer<typeof UpdateHomeworkTaskSchema>;

export const UpdateHomeworkRequestSchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().optional(),
  estimatedTimeMinutes: z
    .number()
    .int()
    .min(MIN_HOMEWORK_MINUTES)
    .max(MAX_HOMEWORK_MINUTES)
    .optional(),
  status: HomeworkStatusEnum.optional(),
  tasks: z
    .array(UpdateHomeworkTaskSchema)
    .min(MIN_HOMEWORK_TASKS)
    .max(MAX_HOMEWORK_TASKS)
    .optional(),
});
export type UpdateHomeworkRequest = z.infer<
  typeof UpdateHomeworkRequestSchema
>;

export interface HomeworkTaskDTO {
  position: number;
  title: string;
  description: string;
  type: HomeworkTaskType;
}

export interface HomeworkDTO {
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
  tasks: HomeworkTaskDTO[];
  status: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface HomeworkResponse {
  homework: HomeworkDTO;
  message?: string;
}

export interface HomeworkListResponse {
  homeworks: HomeworkDTO[];
}
