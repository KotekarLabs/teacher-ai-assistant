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

export const VisualFormatTypeEnum = z.enum([
  "SORTING_DIAGRAM",
  "PROCESS_DIAGRAM",
  "SCIENTIFIC_DIAGRAM",
  "MATHEMATICAL_DIAGRAM",
  "TIMELINE",
  "MAP",
  "FLOWCHART",
  "ANIMATED_SEQUENCE",
  "INTERACTIVE_SIMULATION",
  "LANGUAGE_LEARNING_VISUAL",
]);
export type VisualFormatType = z.infer<typeof VisualFormatTypeEnum>;

export const CanonicalObjectIdEnum = z.enum([
  "bat",
  "ball",
  "pencil",
  "orange",
  "ruler",
  "bangle",
  "bottle",
  "pencil_box",
]);
export type CanonicalObjectId = z.infer<typeof CanonicalObjectIdEnum>;

export const CANONICAL_OBJECT_IDS: readonly CanonicalObjectId[] = Object.freeze([
  "bat",
  "ball",
  "pencil",
  "orange",
  "ruler",
  "bangle",
  "bottle",
  "pencil_box",
]);

export const VerificationStatusEnum = z.enum(["VERIFIED", "UNVERIFIED"]);
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

export const LessonProvenanceSchema = z.object({
  verificationStatus: VerificationStatusEnum,
  curriculumBoard: z.string(),
  textbook: z.string().nullable(),
  edition: z.string().nullable(),
  chapter: z.string().nullable(),
  printedPages: z.string().nullable(),
  sourceEvidence: z.string(),
  verifiedAt: z.string().datetime().nullable(),
});
export type LessonProvenance = z.infer<typeof LessonProvenanceSchema>;

export const DuplicationMetadataSchema = z.object({
  duplicatedFromId: z.string().uuid(),
  duplicatedAt: z.string().datetime(),
  originalTeacherId: z.string().uuid(),
});
export type DuplicationMetadata = z.infer<typeof DuplicationMetadataSchema>;

// AI Generated Visual Schemas (Zero Provenance)
export const AIGeneratedSortingItemSchema = z.object({
  id: CanonicalObjectIdEnum,
  contextualObservation: z.string().max(200).optional(),
  kannadaObservation: z.string().max(200).optional(),
});
export type AIGeneratedSortingItem = z.infer<typeof AIGeneratedSortingItemSchema>;

export const AIGeneratedSortingActivitySchema = z.object({
  title: z.string().min(1).max(100),
  instructions: z.string().min(1).max(300),
  kannadaInstructions: z.string().max(300),
  items: z
    .array(AIGeneratedSortingItemSchema)
    .length(8, "The sorting activity must contain exactly 8 canonical objects")
    .refine(
      (items) => {
        const ids = new Set(items.map((i) => i.id));
        return ids.size === 8 && CANONICAL_OBJECT_IDS.every((id) => ids.has(id));
      },
      {
        message:
          "Items must contain all 8 canonical objects exactly once without duplicates or omissions",
      },
    ),
});
export type AIGeneratedSortingActivity = z.infer<typeof AIGeneratedSortingActivitySchema>;

export const AIGeneratedVisualLessonSchema = z.object({
  format: z.literal("SORTING_DIAGRAM"),
  concept: z.string().min(1).max(200),
  shortExplanation: z.string().min(10).max(500),
  kannadaExplanation: z.string().max(500).optional(),
  teacherGuidance: z.string().min(20).max(1000),
  sortingActivity: AIGeneratedSortingActivitySchema,
});
export type AIGeneratedVisualLesson = z.infer<typeof AIGeneratedVisualLessonSchema>;

// Persisted Visual Schemas (Server-attached Provenance & Hydrated Catalog Metadata)
export const PersistedSortingObjectSchema = z.object({
  id: CanonicalObjectIdEnum,
  nameEnglish: z.string().min(1),
  nameKannada: z.string().min(1),
  shapeCategory: z.enum(["LONG", "ROUND", "MULTI_PERSPECTIVE"]),
  rolls: z.boolean(),
  slides: z.boolean(),
  perspectiveNote: z.string().optional(),
  contextualObservation: z.string().optional(),
  kannadaObservation: z.string().optional(),
});
export type PersistedSortingObject = z.infer<typeof PersistedSortingObjectSchema>;

export const PersistedSortingActivitySchema = z.object({
  title: z.string().min(1),
  instructions: z.string().min(1),
  kannadaInstructions: z.string(),
  items: z.array(PersistedSortingObjectSchema).length(8),
});
export type PersistedSortingActivity = z.infer<typeof PersistedSortingActivitySchema>;

export const PersistedSortingDiagramSchema = z.object({
  format: z.literal("SORTING_DIAGRAM"),
  concept: z.string().min(1),
  shortExplanation: z.string().min(1),
  kannadaExplanation: z.string().optional(),
  teacherGuidance: z.string().min(1),
  sortingActivity: PersistedSortingActivitySchema,
  provenance: LessonProvenanceSchema,
});
export type PersistedSortingDiagram = z.infer<typeof PersistedSortingDiagramSchema>;

export const VisualExplanationSchema = z.discriminatedUnion("format", [
  PersistedSortingDiagramSchema,
]);
export type VisualExplanation = z.infer<typeof VisualExplanationSchema>;

export const LessonContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  overview: z.string().min(1, "Overview is required"),
  learningObjectives: z
    .array(z.string().min(1))
    .min(1, "At least one learning objective is required"),
  prerequisites: z.array(z.string()),
  introduction: z.string().min(1, "Introduction is required"),
  teacherExplanation: z.string().min(1, "Teacher explanation is required"),
  examples: z.array(z.string().min(1)).min(1, "At least one example is required"),
  classroomActivity: ClassroomActivitySchema,
  practice: z.array(z.string()),
  quickAssessment: z.array(z.string()),
  homework: z.string(),
  teacherScript: z.string(),
  materials: z.array(z.string()).optional(),
  differentiation: LessonDifferentiationSchema.optional(),
  pacingBreakdown: LessonPacingBreakdownSchema.optional(),
  visualExplanation: PersistedSortingDiagramSchema.optional(),
  duplicationMetadata: DuplicationMetadataSchema.optional(),
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
  curriculumTopicId: z.string().optional(),
});

export interface GenerateLessonRequest {
  classId: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  curriculumBoard?: string;
  teacherInstructions?: string;
  curriculumTopicId?: string;
}

// Partial update schemas for safe PATCH/PUT
export const PartialClassroomActivitySchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  durationMinutes: z.number().int().nonnegative().optional(),
});

export const PartialLessonDifferentiationSchema = z.object({
  support: z.string().optional(),
  extension: z.string().optional(),
});

export const PartialLessonPacingBreakdownSchema = z.object({
  introductionMinutes: z.number().int().nonnegative().optional(),
  directInstructionMinutes: z.number().int().nonnegative().optional(),
  activityMinutes: z.number().int().nonnegative().optional(),
  practiceMinutes: z.number().int().nonnegative().optional(),
  assessmentMinutes: z.number().int().nonnegative().optional(),
});

export const PartialSortingObjectSchema = z.object({
  id: CanonicalObjectIdEnum,
  nameEnglish: z.string().min(1).optional(),
  nameKannada: z.string().min(1).optional(),
  shapeCategory: z.enum(["LONG", "ROUND", "MULTI_PERSPECTIVE"]).optional(),
  rolls: z.boolean().optional(),
  slides: z.boolean().optional(),
  perspectiveNote: z.string().optional(),
  contextualObservation: z.string().optional(),
  kannadaObservation: z.string().optional(),
});

export const PartialSortingActivitySchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  kannadaInstructions: z.string().optional(),
  items: z.array(PartialSortingObjectSchema).length(8).optional(),
});

export const PartialVisualExplanationSchema = z.object({
  format: z.literal("SORTING_DIAGRAM").optional(),
  concept: z.string().min(1).optional(),
  shortExplanation: z.string().min(1).optional(),
  kannadaExplanation: z.string().optional(),
  teacherGuidance: z.string().min(1).optional(),
  sortingActivity: PartialSortingActivitySchema.optional(),
  // PROVENANCE IS EXPLICITLY OMITTED: Clients cannot submit or edit provenance
});

export const PartialLessonContentSchema = z.object({
  title: z.string().min(1).optional(),
  overview: z.string().min(1).optional(),
  learningObjectives: z.array(z.string().min(1)).min(1).optional(),
  prerequisites: z.array(z.string()).optional(),
  introduction: z.string().min(1).optional(),
  teacherExplanation: z.string().min(1).optional(),
  examples: z.array(z.string().min(1)).min(1).optional(),
  classroomActivity: PartialClassroomActivitySchema.optional(),
  practice: z.array(z.string()).optional(),
  quickAssessment: z.array(z.string()).optional(),
  homework: z.string().optional(),
  teacherScript: z.string().optional(),

  materials: z.array(z.string()).nullable().optional(),
  differentiation: PartialLessonDifferentiationSchema.nullable().optional(),
  pacingBreakdown: PartialLessonPacingBreakdownSchema.nullable().optional(),
  visualExplanation: PartialVisualExplanationSchema.nullable().optional(),
});
export type PartialLessonContent = z.infer<typeof PartialLessonContentSchema>;

export const UpdateLessonRequestSchema = z.object({
  title: z.string().min(1).optional(),
  content: PartialLessonContentSchema.optional(),
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

export interface CurriculumPresetSummary {
  id: string;
  curriculumBoard: string;
  grade: string;
  subject: string;
  topicName: string;
  kannadaTopicName: string;
  textbook: {
    title: string;
    edition: string;
    chapterNumber: number;
    chapterTitle: string;
    printedPages: string;
    publisher: string;
  };
  verification: {
    status: "VERIFIED" | "UNVERIFIED";
    disclaimer: string;
  };
  pedagogicalConstraints: {
    targetAge: number;
    format: string;
    concepts: readonly string[];
  };
}

export interface CurriculumPresetsResponse {
  presets: CurriculumPresetSummary[];
}

