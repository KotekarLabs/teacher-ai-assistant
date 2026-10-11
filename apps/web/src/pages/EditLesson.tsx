import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLessonById,
  updateLesson,
  regenerateLesson,
} from "../api/lessons.api";
import { LessonEditor } from "../components/lessons/LessonEditor";
import { LessonSaveBar } from "../components/lessons/LessonSaveBar";
import { LessonGenerationState } from "../components/lessons/LessonGenerationState";
import { UnsavedChangesDialog } from "../components/resources/UnsavedChangesDialog";
import type { LessonContent } from "@teacher-ai/contracts";

export const EditLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [localContent, setLocalContent] = useState<LessonContent | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: lessonData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => getLessonById(lessonId!),
    enabled: !!lessonId,
  });

  const activeContent = localContent ?? lessonData?.lesson?.content ?? null;

  const saveMutation = useMutation({
    mutationFn: (contentToSave: LessonContent) =>
      updateLesson(lessonId!, {
        title: contentToSave.title,
        content: contentToSave as any,
        status: "SAVED",
      }),
    onSuccess: (data) => {
      setLocalContent(data.lesson.content);
      setHasUnsavedChanges(false);
      setSaveSuccessMessage("Lesson saved successfully!");
      queryClient.setQueryData(["lesson", lessonId], data);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionError(
        err.response?.data?.error || err.message || "Failed to save lesson",
      );
    },
  });

  const regenMutation = useMutation({
    mutationFn: (instructions?: string) =>
      regenerateLesson(lessonId!, instructions),
    onSuccess: (data) => {
      setLocalContent(data.lesson.content);
      setHasUnsavedChanges(true);
      setSaveSuccessMessage(
        "New lesson plan generated! Review and save your changes.",
      );
      queryClient.setQueryData(["lesson", lessonId], data);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionError(
        err.response?.data?.error ||
          err.message ||
          "Failed to regenerate lesson plan",
      );
    },
  });

  const handleContentChange = (updated: LessonContent) => {
    setLocalContent(updated);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!activeContent) return;
    setActionError(null);
    saveMutation.mutate(activeContent);
  };

  const handleRegenerate = (instructions?: string) => {
    setActionError(null);
    regenMutation.mutate(instructions);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate(`/lessons/${lessonId}`);
    }
  };

  const handleSaveAndLeave = async () => {
    if (!activeContent) return;
    setActionError(null);
    try {
      await saveMutation.mutateAsync(activeContent);
      setShowUnsavedDialog(false);
      navigate(`/lessons/${lessonId}`);
    } catch {
      // actionError set in mutation onError
    }
  };

  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    navigate(`/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading lesson details...
      </div>
    );
  }

  if (error || !lessonData?.lesson || !activeContent) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200" role="alert">
        <h3 className="font-bold text-lg mb-1">Lesson Not Found</h3>
        <p className="text-sm">
          Could not load the requested lesson. It may not exist or you may not have permission to view it.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl cursor-pointer min-h-[44px]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const lesson = lessonData.lesson;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-32">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
            {lesson.subject} • {lesson.topic || lesson.difficulty}
          </span>
          <h1
            data-testid="lesson-edit-page-title"
            className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1"
          >
            Edit Lesson Plan
          </h1>
        </div>
      </div>

      {saveSuccessMessage && (
        <div
          data-testid="save-success-alert"
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium"
        >
          ✓ {saveSuccessMessage}
        </div>
      )}

      {actionError && (
        <div
          data-testid="lesson-action-error"
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start justify-between"
        >
          <div>
            <p className="font-semibold">Action Failed</p>
            <p className="mt-0.5">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {regenMutation.isPending ? (
        <LessonGenerationState />
      ) : (
        <LessonEditor
          content={activeContent}
          onChange={handleContentChange}
          disabled={saveMutation.isPending || regenMutation.isPending}
        />
      )}

      <LessonSaveBar
        status={lesson.status}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={saveMutation.isPending}
        isRegenerating={regenMutation.isPending}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
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
export default EditLesson;
