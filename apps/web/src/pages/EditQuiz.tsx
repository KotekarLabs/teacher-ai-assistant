import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizById, updateQuiz } from "../api/quizzes.api";
import { QuizEditor } from "../components/quizzes/QuizEditor";
import { QuizSaveBar } from "../components/quizzes/QuizSaveBar";
import { UnsavedChangesDialog } from "../components/resources/UnsavedChangesDialog";
import type { QuizQuestion } from "@teacher-ai/contracts";

export const EditQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
  });

  // Sync initial data from query
  if (quizData?.quiz && !isInitialized) {
    setTitle(quizData.quiz.title);
    setInstructions(quizData.quiz.instructions || "");
    setDurationMinutes(quizData.quiz.durationMinutes || 20);
    setQuestions(
      (quizData.quiz.questions || []).map((q) => ({
        id: q.id,
        position: q.position,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || undefined,
        marks: q.marks,
        difficulty: q.difficulty,
      })),
    );
    setIsInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateQuiz(quizId!, {
        title,
        instructions,
        durationMinutes,
        questions: questions.map((q) => ({
          position: q.position,
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: q.marks,
          difficulty: q.difficulty,
        })),
        status: "SAVED",
      }),
    onSuccess: (data) => {
      setHasUnsavedChanges(false);
      setSaveSuccessMessage("Quiz saved successfully!");
      queryClient.setQueryData(["quiz", quizId], data);
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionError(
        err.response?.data?.error || err.message || "Failed to save quiz",
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

  const handleDurationChange = (newDuration: number) => {
    setDurationMinutes(newDuration);
    setHasUnsavedChanges(true);
  };

  const handleQuestionsChange = (newQuestions: QuizQuestion[]) => {
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
      navigate(`/quizzes/${quizId}`);
    }
  };

  const handleSaveAndLeave = async () => {
    setActionError(null);
    try {
      await saveMutation.mutateAsync();
      setShowUnsavedDialog(false);
      navigate(`/quizzes/${quizId}`);
    } catch {
      // actionError set in mutation onError
    }
  };

  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    navigate(`/quizzes/${quizId}`);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading quiz details...
      </div>
    );
  }

  if (error || !quizData?.quiz) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200" role="alert">
        <h3 className="font-bold text-lg mb-1">Quiz Not Found</h3>
        <p className="text-sm">
          Could not load the requested quiz. It may not exist or you may not have permission to view it.
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

  const quiz = quizData.quiz;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-32">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
            {quiz.subject} • {quiz.topic}
          </span>
          <h1
            data-testid="quiz-edit-page-title"
            className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1"
          >
            Edit Quiz
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
          data-testid="quiz-action-error"
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

      <QuizEditor
        title={title}
        instructions={instructions}
        durationMinutes={durationMinutes}
        questions={questions}
        onTitleChange={handleTitleChange}
        onInstructionsChange={handleInstructionsChange}
        onDurationChange={handleDurationChange}
        onQuestionsChange={handleQuestionsChange}
      />

      <QuizSaveBar
        status={quiz.status}
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
export default EditQuiz;
