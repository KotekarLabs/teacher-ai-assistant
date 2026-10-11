import React, { useEffect } from "react";

export interface WorksheetExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (mode: "student" | "answer-key") => void;
  isExporting?: boolean;
}

export const WorksheetExportModal: React.FC<WorksheetExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExporting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="worksheet-export-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="worksheet-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div>
            <h3 id="worksheet-export-title" className="text-lg font-bold text-slate-900 tracking-tight">
              Export Worksheet PDF
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose the format you wish to generate and download.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Student Version Option */}
          <button
            type="button"
            data-testid="export-student-worksheet-btn"
            disabled={isExporting}
            onClick={() => onExport("student")}
            className="w-full text-left p-4 rounded-xl border border-slate-200/80 hover:border-violet-400 hover:bg-violet-50/40 transition-all flex items-start space-x-3.5 cursor-pointer group disabled:opacity-50 min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <div className="p-2.5 bg-violet-100 text-violet-700 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors text-lg flex-shrink-0">
              📝
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-violet-900">
                Student Worksheet
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Clean printable worksheet with student header and answer spaces. No answers or solutions.
              </div>
            </div>
          </button>

          {/* Teacher Answer Key Option */}
          <button
            type="button"
            data-testid="export-answer-key-btn"
            disabled={isExporting}
            onClick={() => onExport("answer-key")}
            className="w-full text-left p-4 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-start space-x-3.5 cursor-pointer group disabled:opacity-50 min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors text-lg flex-shrink-0">
              🔑
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-900">
                Teacher Answer Key
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Complete evaluation guide highlighting expected answers and grading solutions for every question.
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="close-export-modal-btn"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
