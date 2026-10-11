import React from "react";

export interface ResourceActionsProps {
  onEdit: () => void;
  editLabel?: string;
  editTestId?: string;

  onExportPdf: () => void;
  isExporting?: boolean;
  exportLabel?: string;
  exportTestId?: string;

  onPrint?: () => void;
  printTestId?: string;

  onDuplicate?: () => void;
  isDuplicating?: boolean;
  duplicateTestId?: string;

  onArchive?: () => void;
  archiveTestId?: string;

  onToggleAnswers?: () => void;
  showAnswers?: boolean;
  toggleAnswersTestId?: string;
}

export const ResourceActions: React.FC<ResourceActionsProps> = ({
  onEdit,
  editLabel = "Edit",
  editTestId = "edit-btn",
  onExportPdf,
  isExporting = false,
  exportLabel = "Export PDF",
  exportTestId = "export-pdf-btn",
  onPrint = () => window.print(),
  printTestId = "print-btn",
  onDuplicate,
  isDuplicating = false,
  duplicateTestId = "duplicate-btn",
  onArchive,
  archiveTestId = "archive-btn",
  onToggleAnswers,
  showAnswers,
  toggleAnswersTestId = "toggle-answers-btn",
}) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2 sm:gap-2.5 no-print"
      data-testid="resource-actions"
    >
      {/* Answer Key Toggle (Quiz / Worksheet) */}
      {onToggleAnswers && (
        <button
          type="button"
          data-testid={toggleAnswersTestId}
          onClick={onToggleAnswers}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200/80 shadow-xs flex items-center space-x-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <span aria-hidden="true">{showAnswers ? "👁️" : "🙈"}</span>
          <span>{showAnswers ? "Hide Answer Key" : "Show Answer Key"}</span>
        </button>
      )}

      {/* Print Button */}
      {onPrint && (
        <button
          type="button"
          data-testid={printTestId}
          onClick={onPrint}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-300 shadow-xs flex items-center space-x-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          title="Print this resource"
        >
          <span aria-hidden="true">🖨️</span>
          <span>Print</span>
        </button>
      )}

      {/* Duplicate Button */}
      {onDuplicate && (
        <button
          type="button"
          data-testid={duplicateTestId}
          disabled={isDuplicating}
          onClick={onDuplicate}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-300 shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          title="Duplicate this resource"
        >
          <span aria-hidden="true">📋</span>
          <span>{isDuplicating ? "Duplicating..." : "Duplicate"}</span>
        </button>
      )}

      {/* Export PDF Button (Primary Action) */}
      <button
        type="button"
        data-testid={exportTestId}
        disabled={isExporting}
        onClick={onExportPdf}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <span aria-hidden="true">📄</span>
        <span>{isExporting ? "Generating PDF..." : exportLabel}</span>
      </button>

      {/* Edit Button */}
      <button
        type="button"
        data-testid={editTestId}
        onClick={onEdit}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <span aria-hidden="true">✏️</span>
        <span>{editLabel}</span>
      </button>

      {/* Archive Button */}
      {onArchive && (
        <button
          type="button"
          data-testid={archiveTestId}
          onClick={onArchive}
          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors border border-rose-200 shadow-xs flex items-center space-x-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          title="Archive this resource"
        >
          <span aria-hidden="true">🗑️</span>
          <span>Archive</span>
        </button>
      )}
    </div>
  );
};
