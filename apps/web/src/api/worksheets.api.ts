import { apiClient } from "./client";
import type {
  GenerateWorksheetRequest,
  UpdateWorksheetRequest,
  WorksheetResponse,
  WorksheetListResponse,
} from "@teacher-ai/contracts";

export const generateWorksheet = async (
  data: GenerateWorksheetRequest,
): Promise<WorksheetResponse> => {
  const res = await apiClient.post<WorksheetResponse>(
    "/worksheets/generate",
    data,
  );
  return res.data;
};

export const getWorksheets = async (): Promise<WorksheetListResponse> => {
  const res = await apiClient.get<WorksheetListResponse>("/worksheets");
  return res.data;
};

export const getWorksheetById = async (
  worksheetId: string,
): Promise<WorksheetResponse> => {
  const res = await apiClient.get<WorksheetResponse>(
    `/worksheets/${worksheetId}`,
  );
  return res.data;
};

export const updateWorksheet = async (
  worksheetId: string,
  data: UpdateWorksheetRequest,
): Promise<WorksheetResponse> => {
  const res = await apiClient.patch<WorksheetResponse>(
    `/worksheets/${worksheetId}`,
    data,
  );
  return res.data;
};

export const archiveWorksheet = async (
  worksheetId: string,
): Promise<WorksheetResponse> => {
  const res = await apiClient.post<WorksheetResponse>(
    `/worksheets/${worksheetId}/archive`,
  );
  return res.data;
};
