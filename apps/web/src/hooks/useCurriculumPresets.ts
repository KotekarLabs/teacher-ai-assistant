import { useQuery } from "@tanstack/react-query";
import { getCurriculumPresets } from "../api/curriculum.api";

export const useCurriculumPresets = () => {
  return useQuery({
    queryKey: ["curriculum-presets"],
    queryFn: getCurriculumPresets,
    staleTime: 5 * 60 * 1000,
  });
};
