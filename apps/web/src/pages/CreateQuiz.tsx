import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getClasses } from "../api/classes.api";
import { generateQuiz } from "../api/quizzes.api";
import { QuizForm } from "../components/quizzes/QuizForm";
import { QuizGenerationState } from "../components/quizzes/QuizGenerationState";
import type { GenerateQuizRequest } from "@teacher-ai/contracts";

export const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classIdFromQuery = searchParams.get("classId") || undefined;
  const [generationError, setGenerationError] = useState<string | null>(null);

  const {
    data: classesData,
    isLoading: isLoadingClasses,
    error: classesError,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const generateMutation = useMutation({
    mutationFn: generateQuiz,
    onSuccess: (data) => {
      navigate(`/quizzes/${data.quiz.id}/edit`);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to generate quiz. Please try again.";
      setGenerationError(msg);
    },
  });

  const handleFormSubmit = (data: GenerateQuizRequest) => {
    setGenerationError(null);
    generateMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create AI Quiz
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate classroom quizzes with verified answers, instant rubrics, and automated scoring.
          </p>
        </div>
      </div>

      {generationError && (
        <div
          data-testid="generation-error-alert"
          className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start justify-between"
        >
          <div>
            <p className="font-semibold">Generation Failed</p>
            <p className="mt-0.5">{generationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGenerationError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {generateMutation.isPending ? (
        <QuizGenerationState />
      ) : isLoadingClasses ? (
        <div className="p-12 text-center text-slate-400">
          Loading classes...
        </div>
      ) : classesError ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl">
          Failed to load classes. Please refresh the page.
        </div>
      ) : (
        <QuizForm
          classes={classesData?.classes || []}
          initialClassId={classIdFromQuery}
          onSubmit={handleFormSubmit}
          isLoading={generateMutation.isPending}
        />
      )}
    </div>
  );
};
