import { apiClient } from "./client";
import type {
  CreateClassRequest,
  UpdateClassRequest,
  ClassResponse,
  ClassListResponse,
} from "@teacher-ai/contracts";

export const getClasses = async (): Promise<ClassListResponse> => {
  const res = await apiClient.get<ClassListResponse>("/classes");
  return res.data;
};

export const getClassById = async (
  classId: string,
): Promise<ClassResponse> => {
  const res = await apiClient.get<ClassResponse>(`/classes/${classId}`);
  return res.data;
};

export const createClass = async (
  data: CreateClassRequest,
): Promise<ClassResponse> => {
  const res = await apiClient.post<ClassResponse>("/classes", data);
  return res.data;
};

export const updateClass = async (
  classId: string,
  data: UpdateClassRequest,
): Promise<ClassResponse> => {
  const res = await apiClient.patch<ClassResponse>(
    `/classes/${classId}`,
    data,
  );
  return res.data;
};

export const archiveClass = async (
  classId: string,
): Promise<ClassResponse> => {
  const res = await apiClient.post<ClassResponse>(
    `/classes/${classId}/archive`,
  );
  return res.data;
};
