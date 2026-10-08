import { apiClient } from "./client";
import type {
  GenerateHomeworkRequest,
  UpdateHomeworkRequest,
  HomeworkResponse,
  HomeworkListResponse,
} from "@teacher-ai/contracts";

export const generateHomework = async (
  data: GenerateHomeworkRequest,
): Promise<HomeworkResponse> => {
  const res = await apiClient.post<HomeworkResponse>(
    "/homeworks/generate",
    data,
  );
  return res.data;
};

export const getHomeworks = async (): Promise<HomeworkListResponse> => {
  const res = await apiClient.get<HomeworkListResponse>("/homeworks");
  return res.data;
};

export const getHomeworkById = async (
  homeworkId: string,
): Promise<HomeworkResponse> => {
  const res = await apiClient.get<HomeworkResponse>(
    `/homeworks/${homeworkId}`,
  );
  return res.data;
};

export const updateHomework = async (
  homeworkId: string,
  data: UpdateHomeworkRequest,
): Promise<HomeworkResponse> => {
  const res = await apiClient.patch<HomeworkResponse>(
    `/homeworks/${homeworkId}`,
    data,
  );
  return res.data;
};

export const archiveHomework = async (
  homeworkId: string,
): Promise<HomeworkResponse> => {
  const res = await apiClient.post<HomeworkResponse>(
    `/homeworks/${homeworkId}/archive`,
  );
  return res.data;
};
