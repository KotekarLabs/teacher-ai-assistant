import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHomeworkById, updateHomework } from "../api/homeworks.api";
import { HomeworkEditor } from "../components/homeworks/HomeworkEditor";
import { HomeworkSaveBar } from "../components/homeworks/HomeworkSaveBar";
import { UnsavedChangesDialog } from "../components/resources/UnsavedChangesDialog";
import type { HomeworkTask } from "@teacher-ai/contracts";

export const EditHomework: React.FC = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number>(30);
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: homeworkData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["homework", homeworkId],
    queryFn: () => getHomeworkById(homeworkId!),
    enabled: !!homeworkId,
  });

  // Sync initial data from query
  if (homeworkData?.homework && !isInitialized) {
    setTitle(homeworkData.homework.title);
    setInstructions(homeworkData.homework.instructions || "");
    setEstimatedTimeMinutes(homeworkData.homework.estimatedTimeMinutes || 30);
    setTasks(
      (homeworkData.homework.tasks || []).map((t) => ({
        position: t.position,
        title: t.title,
        description: t.description,
        type: t.type,
      })),
    );
    setIsInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateHomework(homeworkId!, {
        title,
        instructions,
        estimatedTimeMinutes,
        tasks: tasks.map((t) => ({
          position: t.position,
          title: t.title,
          description: t.description,
          type: t.type,
        })),
        status: "SAVED",
      }),
    onSuccess: (data) => {
      setHasUnsavedChanges(false);
      setSaveSuccessMessage("Homework saved successfully!");
      queryClient.setQueryData(["homework", homeworkId], data);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionError(
        err.response?.data?.error || err.message || "Failed to save homework",
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

  const handleEstimatedTimeChange = (newMinutes: number) => {
    setEstimatedTimeMinutes(newMinutes);
    setHasUnsavedChanges(true);
  };

  const handleTasksChange = (newTasks: HomeworkTask[]) => {
    setTasks(newTasks);
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
      navigate(`/homeworks/${homeworkId}`);
    }
  };

  const handleSaveAndLeave = async () => {
    setActionError(null);
    try {
      await saveMutation.mutateAsync();
      setShowUnsavedDialog(false);
      navigate(`/homeworks/${homeworkId}`);
    } catch {
      // actionError set in mutation onError
    }
  };

  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    navigate(`/homeworks/${homeworkId}`);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading homework details...
      </div>
    );
  }

  if (error || !homeworkData?.homework) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Homework Not Found</h3>
        <p className="text-sm">
          Could not load the requested homework. It may not exist or you may not have permission to view it.
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

  const homework = homeworkData.homework;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {homework.subject} • {homework.topic}
          </span>
          <h1
            data-testid="homework-edit-page-title"
            className="text-2xl font-bold text-slate-900 tracking-tight"
          >
            Edit Homework
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
          data-testid="homework-action-error"
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

      <HomeworkEditor
        title={title}
        instructions={instructions}
        estimatedTimeMinutes={estimatedTimeMinutes}
        tasks={tasks}
        onTitleChange={handleTitleChange}
        onInstructionsChange={handleInstructionsChange}
        onEstimatedTimeChange={handleEstimatedTimeChange}
        onTasksChange={handleTasksChange}
      />

      <HomeworkSaveBar
        status={homework.status}
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
export default EditHomework;
