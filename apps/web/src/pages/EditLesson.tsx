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
import type { LessonContent } from "@teacher-ai/contracts";

export const EditLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [localContent, setLocalContent] = useState<LessonContent | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading lesson details...
      </div>
    );
  }

  if (error || !lessonData?.lesson || !activeContent) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Lesson Not Found</h3>
        <p className="text-sm">
          Could not load the requested lesson. It may not exist or you may not have permission to view it.
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

  const lesson = lessonData.lesson;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {lesson.subject} • Grade {activeContent.overview ? lesson.difficulty : ""}
          </span>
          <h1
            data-testid="lesson-edit-page-title"
            className="text-2xl font-bold text-slate-900 tracking-tight"
          >
            Edit Lesson Plan
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
          data-testid="lesson-action-error"
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
        onBack={() => navigate(`/lessons/${lesson.id}`)}
      />
    </div>
  );
};
