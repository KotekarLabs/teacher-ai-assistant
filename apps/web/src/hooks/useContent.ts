import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContentList,
  getContentById,
  duplicateContent,
  archiveContent,
} from "../api/content.api";
import type { GetContentQuery } from "@teacher-ai/contracts";

export const useContentList = (params?: Partial<GetContentQuery>) => {
  return useQuery({
    queryKey: ["content", params],
    queryFn: () => getContentList(params),
  });
};

export const useContent = (contentId?: string) => {
  return useQuery({
    queryKey: ["content", "detail", contentId],
    queryFn: () => getContentById(contentId!),
    enabled: !!contentId,
  });
};

export const useDuplicateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => duplicateContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["worksheets"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["homeworks"] });
    },
  });
};

export const useArchiveContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => archiveContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["worksheets"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["homeworks"] });
    },
  });
};
