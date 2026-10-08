import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorksheetById, archiveWorksheet } from "../api/worksheets.api";
import { downloadResourcePdf } from "../api/export.api";
import {
  ResourceHeader,
  ResourceActions,
  ResourceMetadata,
} from "../components/resources";

export const WorksheetDetails: React.FC = () => {
  const { worksheetId } = useParams<{ worksheetId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["content"] });
      navigate("/dashboard");
    },
  });

  const handleExportPdf = async () => {
    if (!worksheetData?.worksheet) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadResourcePdf("worksheets", worksheetData.worksheet.id);
    } catch (_err: unknown) {
      setExportError("We couldn't generate the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

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
        title={worksheet.title}
        type="WORKSHEET"
        subject={worksheet.subject}
        topic={worksheet.topic}
        estimatedTimeMinutes={worksheet.estimatedTimeMinutes}
        difficulty={worksheet.difficulty}
        status={worksheet.status}
        titleTestId="worksheet-details-title"
        backTo="/library"
        backLabel="Back to Library"
        actions={
          <ResourceActions
            onEdit={() => navigate(`/worksheets/${worksheet.id}/edit`)}
            editLabel="Edit Worksheet"
            editTestId="edit-worksheet-btn"
            onExportPdf={handleExportPdf}
            isExporting={isExporting}
            exportTestId="export-pdf-btn"
            onPrint={() => window.print()}
            printTestId="print-btn"
            onToggleAnswers={() => setShowAnswerKey(!showAnswerKey)}
            showAnswers={showAnswerKey}
            toggleAnswersTestId="toggle-answers-btn"
            onArchive={() => setShowArchiveConfirm(true)}
            archiveTestId="archive-worksheet-btn"
          />
        }
      />

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

      {/* Standardized Metadata */}
      <ResourceMetadata
        type="WORKSHEET"
        subject={worksheet.subject}
        topic={worksheet.topic}
        difficulty={worksheet.difficulty}
        curriculumBoard={worksheet.curriculumBoard}
        estimatedTimeMinutes={worksheet.estimatedTimeMinutes}
        status={worksheet.status}
        createdAt={worksheet.createdAt}
        updatedAt={worksheet.updatedAt}
      />

      {/* Archive Modal */}
      {showArchiveConfirm && (
        <div
          data-testid="archive-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h4 className="text-lg font-bold text-slate-900">
              Archive Worksheet?
            </h4>
            <p className="text-xs text-slate-500">
              This worksheet will be hidden from your main dashboard and class list. You can unarchive it later from the library.
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
export default WorksheetDetails;
