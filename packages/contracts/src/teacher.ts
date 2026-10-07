import { z } from "zod";

export const CreateTeacherProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters").max(100, "Display name cannot exceed 100 characters"),
  teachingRole: z.string().trim().min(2, "Teaching role is required").max(100, "Teaching role cannot exceed 100 characters"),
  subjects: z.array(z.string().trim().min(1, "Subject cannot be empty")).min(1, "Please select at least one subject"),
  preferredLanguage: z.string().trim().default("English"),
  curriculumBoard: z.string().trim().min(1, "Curriculum board is required"),
  experienceLevel: z.string().trim().min(1, "Experience level is required"),
});

export const UpdateTeacherProfileSchema = CreateTeacherProfileSchema.partial();

export type CreateTeacherProfileRequest = z.input<typeof CreateTeacherProfileSchema>;
export type UpdateTeacherProfileRequest = z.input<typeof UpdateTeacherProfileSchema>;

export interface TeacherProfileDTO {
  id: string;
  userId: string;
  displayName: string;
  teachingRole: string;
  subjects: string[];
  preferredLanguage: string;
  curriculumBoard: string;
  experienceLevel: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TeacherProfileResponse {
  profile: TeacherProfileDTO;
}
