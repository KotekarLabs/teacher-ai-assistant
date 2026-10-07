import { apiClient } from "./client";
import type {
  GenerateLessonRequest,
  UpdateLessonRequest,
  LessonResponse,
  LessonListResponse,
} from "@teacher-ai/contracts";

export const generateLesson = async (
  data: GenerateLessonRequest,
): Promise<LessonResponse> => {
  const res = await apiClient.post<LessonResponse>("/lessons/generate", data);
  return res.data;
};

export const getLessons = async (): Promise<LessonListResponse> => {
  const res = await apiClient.get<LessonListResponse>("/lessons");
  return res.data;
};

export const getLessonById = async (
  lessonId: string,
): Promise<LessonResponse> => {
  const res = await apiClient.get<LessonResponse>(`/lessons/${lessonId}`);
  return res.data;
};

export const updateLesson = async (
  lessonId: string,
  data: UpdateLessonRequest,
): Promise<LessonResponse> => {
  const res = await apiClient.patch<LessonResponse>(
    `/lessons/${lessonId}`,
    data,
  );
  return res.data;
};

export const archiveLesson = async (
  lessonId: string,
): Promise<LessonResponse> => {
  const res = await apiClient.post<LessonResponse>(
    `/lessons/${lessonId}/archive`,
  );
  return res.data;
};

export const regenerateLesson = async (
  lessonId: string,
  teacherInstructions?: string,
): Promise<LessonResponse> => {
  const res = await apiClient.post<LessonResponse>(
    `/lessons/${lessonId}/regenerate`,
    { teacherInstructions },
  );
  return res.data;
};
