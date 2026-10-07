import { apiClient } from "./client";
import type {
  CreateTeacherProfileRequest,
  UpdateTeacherProfileRequest,
  TeacherProfileResponse,
} from "@teacher-ai/contracts";

export const getTeacherProfile = async (): Promise<TeacherProfileResponse> => {
  const res = await apiClient.get<TeacherProfileResponse>("/teacher/profile");
  return res.data;
};

export const createTeacherProfile = async (
  data: CreateTeacherProfileRequest,
): Promise<TeacherProfileResponse> => {
  const res = await apiClient.post<TeacherProfileResponse>(
    "/teacher/profile",
    data,
  );
  return res.data;
};

export const updateTeacherProfile = async (
  data: UpdateTeacherProfileRequest,
): Promise<TeacherProfileResponse> => {
  const res = await apiClient.patch<TeacherProfileResponse>(
    "/teacher/profile",
    data,
  );
  return res.data;
};
