import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHomeworkById, archiveHomework } from "../api/homeworks.api";
import { downloadResourcePdf } from "../api/export.api";
import {
  ResourceHeader,
  ResourceActions,
  ResourceMetadata,
} from "../components/resources";

export const HomeworkDetails: React.FC = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    data: homeworkData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["homework", homeworkId],
    queryFn: () => getHomeworkById(homeworkId!),
    enabled: !!homeworkId,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveHomework(homeworkId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeworks"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      navigate("/dashboard");
    },
  });

  const handleExportPdf = async () => {
    if (!homeworkData?.homework) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadResourcePdf("homeworks", homeworkData.homework.id);
    } catch (_err: unknown) {
      setExportError("We couldn't generate the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading homework...
      </div>
    );
  }

  if (error || !homeworkData?.homework) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Homework Not Found</h3>
        <p className="text-sm">
          The requested homework could not be found or you do not have permission to access it.
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
  const tasks = homework.tasks || [];

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 pb-16"
      data-testid="homework-details"
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
        title={homework.title}
        type="HOMEWORK"
        subject={homework.subject}
        topic={homework.topic}
        estimatedTimeMinutes={homework.estimatedTimeMinutes}
        difficulty={homework.difficulty}
        status={homework.status}
        titleTestId="homework-details-title"
        backTo="/library"
        backLabel="Back to Library"
        actions={
          <ResourceActions
            onEdit={() => navigate(`/homeworks/${homework.id}/edit`)}
            editLabel="Edit Homework"
            editTestId="edit-homework-btn"
            onExportPdf={handleExportPdf}
            isExporting={isExporting}
            exportTestId="export-pdf-btn"
            onPrint={() => window.print()}
            printTestId="print-btn"
            onArchive={() => setShowArchiveConfirm(true)}
            archiveTestId="archive-homework-btn"
          />
        }
      />

      {/* Instructions */}
      {homework.instructions && (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Homework Instructions
          </h3>
          <p className="text-slate-700 leading-relaxed text-sm">
            {homework.instructions}
          </p>
        </section>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Tasks & Activities ({tasks.length})
        </h3>

        {tasks.map((task, idx) => (
          <div
            key={idx}
            data-testid={`detail-task-${idx}`}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {task.position}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {task.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <h4 className="text-slate-900 font-bold text-base pt-1">
              {task.title}
            </h4>

            <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
              {task.description}
            </p>
          </div>
        ))}
      </div>

      {/* Standardized Metadata */}
      <ResourceMetadata
        type="HOMEWORK"
        subject={homework.subject}
        topic={homework.topic}
        difficulty={homework.difficulty}
        curriculumBoard={homework.curriculumBoard}
        estimatedTimeMinutes={homework.estimatedTimeMinutes}
        status={homework.status}
        createdAt={homework.createdAt}
        updatedAt={homework.updatedAt}
      />

      {/* Archive Modal */}
      {showArchiveConfirm && (
        <div
          data-testid="archive-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h4 className="text-lg font-bold text-slate-900">
              Archive Homework?
            </h4>
            <p className="text-xs text-slate-500">
              This homework will be hidden from your main dashboard and class list. You can unarchive it later in the library.
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
export default HomeworkDetails;
