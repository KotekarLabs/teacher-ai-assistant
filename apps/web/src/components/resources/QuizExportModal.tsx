import React from "react";

export interface QuizExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (mode: "student" | "answer-key") => void;
  isExporting?: boolean;
}

export const QuizExportModal: React.FC<QuizExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-testid="quiz-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Export Quiz PDF</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose the format you wish to generate and download.
          </p>
        </div>

        <div className="space-y-3">
          {/* Student Version Option */}
          <button
            type="button"
            data-testid="export-student-quiz-btn"
            disabled={isExporting}
            onClick={() => onExport("student")}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors flex items-start space-x-3 cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors text-lg">
              🎓
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-900">
                Student Quiz
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Clean printable questionnaire with student header and mark breakdown. No answers or explanations.
              </div>
            </div>
          </button>

          {/* Teacher Answer Key Option */}
          <button
            type="button"
            data-testid="export-answer-key-btn"
            disabled={isExporting}
            onClick={() => onExport("answer-key")}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors flex items-start space-x-3 cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors text-lg">
              🔑
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-900">
                Teacher Answer Key
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Complete evaluation guide highlighting correct answers and pedagogical explanations.
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            data-testid="close-export-modal-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
