import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorksheetById, updateWorksheet } from "../api/worksheets.api";
import { WorksheetEditor } from "../components/worksheets/WorksheetEditor";
import { WorksheetSaveBar } from "../components/worksheets/WorksheetSaveBar";
import { UnsavedChangesDialog } from "../components/resources/UnsavedChangesDialog";
import type { WorksheetQuestion } from "@teacher-ai/contracts";

export const EditWorksheet: React.FC = () => {
  const { worksheetId } = useParams<{ worksheetId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number>(30);
  const [questions, setQuestions] = useState<WorksheetQuestion[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: worksheetData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["worksheet", worksheetId],
    queryFn: () => getWorksheetById(worksheetId!),
    enabled: !!worksheetId,
  });

  // Sync initial data from query
  if (worksheetData?.worksheet && !isInitialized) {
    setTitle(worksheetData.worksheet.title);
    setInstructions(worksheetData.worksheet.instructions || "");
    setEstimatedTimeMinutes(worksheetData.worksheet.estimatedTimeMinutes || 30);
    setQuestions(
      (worksheetData.worksheet.questions || []).map((q) => ({
        id: q.id,
        position: q.position,
        type: q.type,
        question: q.question,
        options: q.options || [],
        expectedAnswer: q.expectedAnswer,
        marks: q.marks,
        difficulty: q.difficulty,
      })),
    );
    setIsInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateWorksheet(worksheetId!, {
        title,
        instructions,
        estimatedTimeMinutes,
        questions: questions.map((q) => ({
          position: q.position,
          type: q.type,
          question: q.question,
          options: q.options,
          expectedAnswer: q.expectedAnswer,
          marks: q.marks,
          difficulty: q.difficulty,
        })),
        status: "SAVED",
      }),
    onSuccess: (data) => {
      setHasUnsavedChanges(false);
      setSaveSuccessMessage("Worksheet saved successfully!");
      queryClient.setQueryData(["worksheet", worksheetId], data);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionError(
        err.response?.data?.error || err.message || "Failed to save worksheet",
      );
    },
  });

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleInstructionsChange = (newInstructions: string) => {
    setInstructions(newInstructions);
    setHasUnsavedChanges(true);
  };

  const handleTimeChange = (newTime: number) => {
    setEstimatedTimeMinutes(newTime);
    setHasUnsavedChanges(true);
  };

  const handleQuestionsChange = (newQuestions: WorksheetQuestion[]) => {
    setQuestions(newQuestions);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    setActionError(null);
    saveMutation.mutate();
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate(`/worksheets/${worksheetId}`);
    }
  };

  const handleSaveAndLeave = async () => {
    setActionError(null);
    try {
      await saveMutation.mutateAsync();
      setShowUnsavedDialog(false);
      navigate(`/worksheets/${worksheetId}`);
    } catch {
      // actionError set in mutation onError
    }
  };

  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    navigate(`/worksheets/${worksheetId}`);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading worksheet details...
      </div>
    );
  }

  if (error || !worksheetData?.worksheet) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Worksheet Not Found</h3>
        <p className="text-sm">
          Could not load the requested worksheet. It may not exist or you may not have permission to view it.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const worksheet = worksheetData.worksheet;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {worksheet.subject} • {worksheet.topic}
          </span>
          <h1
            data-testid="worksheet-edit-page-title"
            className="text-2xl font-bold text-slate-900 tracking-tight"
          >
            Edit Worksheet
          </h1>
        </div>
      </div>

      {saveSuccessMessage && (
        <div
          data-testid="save-success-alert"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium"
        >
          ✓ {saveSuccessMessage}
        </div>
      )}

      {actionError && (
        <div
          data-testid="worksheet-action-error"
          className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start justify-between"
        >
          <div>
            <p className="font-semibold">Action Failed</p>
            <p className="mt-0.5">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <WorksheetEditor
        title={title}
        instructions={instructions}
        estimatedTimeMinutes={estimatedTimeMinutes}
        questions={questions}
        onTitleChange={handleTitleChange}
        onInstructionsChange={handleInstructionsChange}
        onTimeChange={handleTimeChange}
        onQuestionsChange={handleQuestionsChange}
      />

      <WorksheetSaveBar
        status={worksheet.status}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={saveMutation.isPending}
        onSave={handleSave}
        onBack={handleBack}
      />

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={() => setShowUnsavedDialog(false)}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
};
export default EditWorksheet;
