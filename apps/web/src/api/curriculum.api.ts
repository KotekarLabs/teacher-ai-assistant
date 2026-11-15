import { apiClient } from "./client";
import type { CurriculumPresetsResponse } from "@teacher-ai/contracts";

export const getCurriculumPresets = async (): Promise<CurriculumPresetsResponse> => {
  const res = await apiClient.get<CurriculumPresetsResponse>("/curriculum/presets");
  return res.data;
};
