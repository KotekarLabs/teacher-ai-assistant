import { z } from "zod";

export const CreateClassSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class name is required")
    .max(100, "Class name cannot exceed 100 characters"),
  grade: z
    .string()
    .trim()
    .min(1, "Grade is required")
    .max(50, "Grade cannot exceed 50 characters"),
  section: z
    .string()
    .trim()
    .max(50, "Section cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  curriculumBoard: z
    .string()
    .trim()
    .max(50, "Curriculum board cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  academicYear: z
    .string()
    .trim()
    .max(50, "Academic year cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

export const UpdateClassSchema = CreateClassSchema.partial();

export type CreateClassRequest = z.input<typeof CreateClassSchema>;
export type UpdateClassRequest = z.input<typeof UpdateClassSchema>;

export interface ClassDTO {
  id: string;
  teacherId: string;
  name: string;
  grade: string;
  section: string | null;
  curriculumBoard: string | null;
  academicYear: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  archivedAt: string | Date | null;
}

export interface ClassResponse {
  class: ClassDTO;
}

export interface ClassListResponse {
  classes: ClassDTO[];
}
