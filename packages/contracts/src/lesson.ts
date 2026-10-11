import { z } from "zod";

export const ClassroomActivitySchema = z.object({
  title: z.string().min(1, "Activity title is required"),
  instructions: z.string().min(1, "Activity instructions are required"),
  durationMinutes: z.number().int().nonnegative().default(10),
});

export type ClassroomActivity = z.infer<typeof ClassroomActivitySchema>;

export const LessonDifferentiationSchema = z.object({
  support: z.string().optional().default(""),
  extension: z.string().optional().default(""),
});
export type LessonDifferentiation = z.infer<typeof LessonDifferentiationSchema>;

export const LessonPacingBreakdownSchema = z.object({
  introductionMinutes: z.number().int().nonnegative(),
  directInstructionMinutes: z.number().int().nonnegative(),
  activityMinutes: z.number().int().nonnegative(),
  practiceMinutes: z.number().int().nonnegative(),
  assessmentMinutes: z.number().int().nonnegative(),
});
export type LessonPacingBreakdown = z.infer<typeof LessonPacingBreakdownSchema>;

export const LessonContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  overview: z.string().min(1, "Overview is required"),
  learningObjectives: z
    .array(z.string().min(1))
    .min(1, "At least one learning objective is required"),
  prerequisites: z.array(z.string()),
  introduction: z.string().min(1, "Introduction is required"),
  teacherExplanation: z.string().min(1, "Teacher explanation is required"),
  examples: z.array(z.string()).min(1, "At least one example is required"),
  classroomActivity: ClassroomActivitySchema,
  practice: z.array(z.string()),
  quickAssessment: z.array(z.string()),
  homework: z.string(),
  teacherScript: z.string(),
  materials: z.array(z.string()).optional(),
  differentiation: LessonDifferentiationSchema.optional(),
  pacingBreakdown: LessonPacingBreakdownSchema.optional(),
});

export type LessonContent = z.infer<typeof LessonContentSchema>;

export const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const LessonStatusEnum = z.enum([
  "GENERATING",
  "DRAFT",
  "EDITED",
  "SAVED",
  "ARCHIVED",
  "GENERATION_FAILED",
]);
export type LessonStatus = z.infer<typeof LessonStatusEnum>;

export const GenerateLessonRequestSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  durationMinutes: z.number().int().positive().optional().default(40),
  difficulty: DifficultyEnum.optional().default("MEDIUM"),
  curriculumBoard: z.string().optional(),
  teacherInstructions: z.string().optional(),
});

export interface GenerateLessonRequest {
  classId: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  curriculumBoard?: string;
  teacherInstructions?: string;
}

export const UpdateLessonRequestSchema = z.object({
  title: z.string().min(1).optional(),
  content: LessonContentSchema.optional(),
  status: LessonStatusEnum.optional(),
});

export type UpdateLessonRequest = z.infer<typeof UpdateLessonRequestSchema>;

export interface LessonDTO {
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
  status: string;
  content: LessonContent;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface LessonResponse {
  lesson: LessonDTO;
  message?: string;
}

export interface LessonListResponse {
  lessons: LessonDTO[];
}
