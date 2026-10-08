import { apiClient } from "./client";
import type {
  GenerateQuizRequest,
  UpdateQuizRequest,
  QuizResponse,
  QuizListResponse,
} from "@teacher-ai/contracts";

export const generateQuiz = async (
  data: GenerateQuizRequest,
): Promise<QuizResponse> => {
  const res = await apiClient.post<QuizResponse>(
    "/quizzes/generate",
    data,
  );
  return res.data;
};

export const getQuizzes = async (): Promise<QuizListResponse> => {
  const res = await apiClient.get<QuizListResponse>("/quizzes");
  return res.data;
};

export const getQuizById = async (
  quizId: string,
): Promise<QuizResponse> => {
  const res = await apiClient.get<QuizResponse>(
    `/quizzes/${quizId}`,
  );
  return res.data;
};

export const updateQuiz = async (
  quizId: string,
  data: UpdateQuizRequest,
): Promise<QuizResponse> => {
  const res = await apiClient.patch<QuizResponse>(
    `/quizzes/${quizId}`,
    data,
  );
  return res.data;
};

export const archiveQuiz = async (
  quizId: string,
): Promise<QuizResponse> => {
  const res = await apiClient.post<QuizResponse>(
    `/quizzes/${quizId}/archive`,
  );
  return res.data;
};
