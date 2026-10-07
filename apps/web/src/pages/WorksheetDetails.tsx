import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorksheetById, archiveWorksheet } from "../api/worksheets.api";

export const WorksheetDetails: React.FC = () => {
  const { worksheetId } = useParams<{ worksheetId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const {
    data: worksheetData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["worksheet", worksheetId],
    queryFn: () => getWorksheetById(worksheetId!),
    enabled: !!worksheetId,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveWorksheet(worksheetId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worksheets"] });
      navigate("/dashboard");
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading worksheet...
      </div>
    );
  }

  if (error || !worksheetData?.worksheet) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Worksheet Not Found</h3>
        <p className="text-sm">
          The requested worksheet could not be found or you do not have permission to access it.
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
  const questions = worksheet.questions || [];

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 pb-16"
      data-testid="worksheet-details"
    >
      {/* Header Bar */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              {worksheet.subject}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
              ⏱ {worksheet.estimatedTimeMinutes} mins
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
              {worksheet.difficulty}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {worksheet.status}
            </span>
          </div>
          <h1
            data-testid="worksheet-details-title"
            className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
          >
            {worksheet.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Topic: {worksheet.topic}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            data-testid="toggle-answers-btn"
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
          >
            {showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
          </button>
          <button
            type="button"
            data-testid="edit-worksheet-btn"
            onClick={() => navigate(`/worksheets/${worksheet.id}/edit`)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <span>✏️</span>
            <span>Edit Worksheet</span>
          </button>
          <button
            type="button"
            data-testid="archive-worksheet-btn"
            onClick={() => setShowArchiveConfirm(true)}
            className="px-3.5 py-2.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
            title="Archive Worksheet"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Instructions */}
      {worksheet.instructions && (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Student Instructions
          </h3>
          <p className="text-slate-700 leading-relaxed text-sm">
            {worksheet.instructions}
          </p>
        </section>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Questions ({questions.length})
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
                <span>{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
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
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-800 flex items-center space-x-2"
                  >
                    <span className="font-bold text-slate-400">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Key */}
            {showAnswerKey && (
              <div
                data-testid={`answer-key-${idx}`}
                className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs"
              >
                <span className="font-bold text-emerald-900 mr-2">
                  Answer Key:
                </span>
                <span className="text-emerald-800">{q.expectedAnswer}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Archive Modal */}
      {showArchiveConfirm && (
        <div
          data-testid="archive-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h4 className="text-lg font-bold text-slate-900">
              Archive Worksheet?
            </h4>
            <p className="text-xs text-slate-500">
              This worksheet will be hidden from your main dashboard and class list. You can unarchive it later.
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
