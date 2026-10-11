import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getClasses } from "../api/classes.api";
import { generateLesson } from "../api/lessons.api";
import { LessonForm } from "../components/lessons/LessonForm";
import { LessonGenerationState } from "../components/lessons/LessonGenerationState";
import type { GenerateLessonRequest } from "@teacher-ai/contracts";

export const CreateLesson: React.FC = () => {
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
    mutationFn: generateLesson,
    onSuccess: (data) => {
      navigate(`/lessons/${data.lesson.id}/edit`);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to generate lesson plan. Please try again.";
      setGenerationError(msg);
    },
  });

  const handleFormSubmit = (data: GenerateLessonRequest) => {
    setGenerationError(null);
    generateMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create AI Lesson Plan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate a classroom-ready, structured lesson tailored to your grade, subject, and curriculum.
          </p>
        </div>
      </div>

      {generationError && (
        <div
          data-testid="generation-error-alert"
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start justify-between"
        >
          <div>
            <p className="font-semibold">Generation Failed</p>
            <p className="mt-0.5">{generationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGenerationError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {generateMutation.isPending ? (
        <LessonGenerationState />
      ) : isLoadingClasses ? (
        <div className="p-12 text-center text-slate-400">Loading classes...</div>
      ) : classesError ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
          Failed to load classes. Please refresh the page.
        </div>
      ) : (
        <LessonForm
          classes={classesData?.classes || []}
          initialClassId={classIdFromQuery}
          onSubmit={handleFormSubmit}
          isLoading={generateMutation.isPending}
        />
      )}
    </div>
  );
};
