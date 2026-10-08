import { apiClient } from "./client";
import type {
  GetContentQuery,
  ContentListResponse,
  ContentResponse,
} from "@teacher-ai/contracts";

export const getContentList = async (
  params?: Partial<GetContentQuery>,
): Promise<ContentListResponse> => {
  const res = await apiClient.get<ContentListResponse>("/content", {
    params,
  });
  return res.data;
};

export const getContentById = async (
  contentId: string,
): Promise<ContentResponse> => {
  const res = await apiClient.get<ContentResponse>(`/content/${contentId}`);
  return res.data;
};

export const duplicateContent = async (
  contentId: string,
): Promise<ContentResponse> => {
  const res = await apiClient.post<ContentResponse>(
    `/content/${contentId}/duplicate`,
  );
  return res.data;
};

export const archiveContent = async (
  contentId: string,
): Promise<ContentResponse> => {
  const res = await apiClient.post<ContentResponse>(
    `/content/${contentId}/archive`,
  );
  return res.data;
};
