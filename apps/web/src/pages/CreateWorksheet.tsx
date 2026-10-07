import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getClasses } from "../api/classes.api";
import { generateWorksheet } from "../api/worksheets.api";
import { WorksheetForm } from "../components/worksheets/WorksheetForm";
import { WorksheetGenerationState } from "../components/worksheets/WorksheetGenerationState";
import type { GenerateWorksheetRequest } from "@teacher-ai/contracts";

export const CreateWorksheet: React.FC = () => {
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
    mutationFn: generateWorksheet,
    onSuccess: (data) => {
      navigate(`/worksheets/${data.worksheet.id}/edit`);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to generate worksheet. Please try again.";
      setGenerationError(msg);
    },
  });

  const handleFormSubmit = (data: GenerateWorksheetRequest) => {
    setGenerationError(null);
    generateMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create AI Worksheet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate customized practice worksheets, quizzes, and formative assessments aligned with your curriculum.
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
        <WorksheetGenerationState />
      ) : isLoadingClasses ? (
        <div className="p-12 text-center text-slate-400">
          Loading classes...
        </div>
      ) : classesError ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl">
          Failed to load classes. Please refresh the page.
        </div>
      ) : (
        <WorksheetForm
          classes={classesData?.classes || []}
          initialClassId={classIdFromQuery}
          onSubmit={handleFormSubmit}
          isLoading={generateMutation.isPending}
        />
      )}
    </div>
  );
};
