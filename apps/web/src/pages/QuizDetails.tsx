import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizById, archiveQuiz } from "../api/quizzes.api";
import { downloadResourcePdf, type QuizExportMode } from "../api/export.api";
import {
  ResourceHeader,
  ResourceActions,
  ResourceMetadata,
  QuizExportModal,
} from "../components/resources";

export const QuizDetails: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveQuiz(quizId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      navigate("/dashboard");
    },
  });

  const handleExportMode = async (mode: QuizExportMode) => {
    if (!quizData?.quiz) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadResourcePdf("quizzes", quizData.quiz.id, mode);
      setShowExportModal(false);
    } catch (_err: unknown) {
      setExportError("We couldn't generate the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading quiz...
      </div>
    );
  }

  if (error || !quizData?.quiz) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Quiz Not Found</h3>
        <p className="text-sm">
          The requested quiz could not be found or you do not have permission to access it.
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

  const quiz = quizData.quiz;
  const questions = quiz.questions || [];

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 pb-16"
      data-testid="quiz-details"
    >
      {/* Export Error Alert */}
      {exportError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center justify-between no-print">
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-red-500 hover:text-red-800 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <ResourceHeader
        title={quiz.title}
        type="QUIZ"
        subject={quiz.subject}
        topic={quiz.topic}
        durationMinutes={quiz.durationMinutes}
        totalMarks={quiz.totalMarks}
        difficulty={quiz.difficulty}
        status={quiz.status}
        titleTestId="quiz-details-title"
        backTo="/library"
        backLabel="Back to Library"
        actions={
          <ResourceActions
            onEdit={() => navigate(`/quizzes/${quiz.id}/edit`)}
            editLabel="Edit Quiz"
            editTestId="edit-quiz-btn"
            onExportPdf={() => setShowExportModal(true)}
            isExporting={isExporting}
            exportTestId="export-pdf-btn"
            onPrint={() => window.print()}
            printTestId="print-btn"
            onToggleAnswers={() => setShowAnswerKey(!showAnswerKey)}
            showAnswers={showAnswerKey}
            toggleAnswersTestId="toggle-answers-btn"
            onArchive={() => setShowArchiveConfirm(true)}
            archiveTestId="archive-quiz-btn"
          />
        }
      />

      {/* Instructions */}
      {quiz.instructions && (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Quiz Instructions
          </h3>
          <p className="text-slate-700 leading-relaxed text-sm">
            {quiz.instructions}
          </p>
        </section>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Quiz Questions ({questions.length})
        </h3>

        {questions.map((q, idx) => (
          <div
            key={q.id || idx}
            data-testid={`detail-question-${idx}`}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {q.position}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {q.type.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-semibold">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                <span>•</span>
                <span className="uppercase">{q.difficulty}</span>
              </div>
            </div>

            <p className="text-slate-900 font-medium text-base pt-1">
              {q.question}
            </p>

            {/* Multiple Choice Options */}
            {q.type === "MULTIPLE_CHOICE" && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 border ${
                      showAnswerKey && opt === q.correctAnswer
                        ? "bg-emerald-50 border-emerald-300 font-semibold text-emerald-900"
                        : "bg-slate-50 border-slate-100 text-slate-800"
                    }`}
                  >
                    <span className="font-bold text-slate-400">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span>{opt}</span>
                    {showAnswerKey && opt === q.correctAnswer && (
                      <span className="ml-auto text-emerald-600 text-xs font-bold">
                        ✓ Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Teacher Answer Key & Explanation */}
            {showAnswerKey && (
              <div
                data-testid={`answer-key-${idx}`}
                className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs space-y-1.5"
              >
                <div>
                  <span className="font-bold text-emerald-900 mr-2">
                    Correct Answer:
                  </span>
                  <span className="text-emerald-800 font-medium">
                    {q.correctAnswer}
                  </span>
                </div>
                {q.explanation && (
                  <div className="text-slate-600 pt-1 border-t border-emerald-100/60">
                    <span className="font-semibold text-slate-700 mr-1">
                      Explanation:
                    </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Standardized Metadata */}
      <ResourceMetadata
        type="QUIZ"
        subject={quiz.subject}
        topic={quiz.topic}
        difficulty={quiz.difficulty}
        curriculumBoard={quiz.curriculumBoard}
        durationMinutes={quiz.durationMinutes}
        status={quiz.status}
        createdAt={quiz.createdAt}
        updatedAt={quiz.updatedAt}
      />

      {/* Quiz PDF Export Modal */}
      <QuizExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportMode}
        isExporting={isExporting}
      />

      {/* Archive Modal */}
      {showArchiveConfirm && (
        <div
          data-testid="archive-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h4 className="text-lg font-bold text-slate-900">
              Archive Quiz?
            </h4>
            <p className="text-xs text-slate-500">
              This quiz will be hidden from your main dashboard and class list. You can unarchive it later in the library.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-archive-btn"
                disabled={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                {archiveMutation.isPending ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuizDetails;
