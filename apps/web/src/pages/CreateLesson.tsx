import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getClasses } from "../api/classes.api";
import { generateLesson } from "../api/lessons.api";
import { LessonForm } from "../components/lessons/LessonForm";
import { ResourceGenerationOverlay } from "../components/resources/ResourceGenerationOverlay";
import type { GenerateLessonRequest } from "@teacher-ai/contracts";

export const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classIdFromQuery = searchParams.get("classId") || undefined;
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<GenerateLessonRequest | null>(null);

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
    setLastPayload(data);
    generateMutation.mutate(data);
  };

  const handleRetry = () => {
    if (!lastPayload || generateMutation.isPending) return;
    setGenerationError(null);
    generateMutation.mutate(lastPayload);
  };

  const selectedClass = classesData?.classes?.find(
    (c) => c.id === (lastPayload?.classId || classIdFromQuery),
  );

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
          className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in"
        >
          <div className="space-y-0.5">
            <p className="font-semibold text-rose-800">Generation Failed</p>
            <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">{generationError}</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
            {lastPayload && (
              <button
                type="button"
                data-testid="retry-generation-btn"
                disabled={generateMutation.isPending}
                onClick={handleRetry}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg transition-colors cursor-pointer min-h-[40px] flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>🔄</span>
                <span>Retry Generation</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setGenerationError(null)}
              className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {isLoadingClasses ? (
        <div className="p-12 text-center text-slate-400">Loading classes...</div>
      ) : classesError ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
          Failed to load classes. Please refresh the page.
        </div>
      ) : (
        <LessonForm
          classes={classesData?.classes || []}
          initialClassId={classIdFromQuery}
          initialValues={lastPayload || undefined}
          onSubmit={handleFormSubmit}
          isLoading={generateMutation.isPending}
        />
      )}

      {generateMutation.isPending && (
        <ResourceGenerationOverlay
          resourceType="Lesson Plan"
          topic={lastPayload?.topic}
          className={selectedClass ? `${selectedClass.name} (Grade ${selectedClass.grade})` : undefined}
        />
      )}
    </div>
  );
};
