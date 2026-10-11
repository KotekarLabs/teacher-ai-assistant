import React from "react";

interface QuizSaveBarProps {
  status: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
}

export const QuizSaveBar: React.FC<QuizSaveBarProps> = ({
  status,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onBack,
}) => {
  return (
    <div
      data-testid="quiz-save-bar"
      className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-lg shadow-slate-900/5 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          data-testid="back-btn"
          onClick={onBack}
          className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px] flex items-center"
        >
          ← Back
        </button>
        <div className="flex items-center space-x-2">
          <span
            data-testid="quiz-status-badge"
            className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              status === "SAVED"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : status === "EDITED"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {status}
          </span>
          {hasUnsavedChanges && (
            <span
              data-testid="unsaved-changes-indicator"
              className="text-xs text-amber-700 font-medium flex items-center space-x-1"
            >
              <span className="text-amber-500">●</span>
              <span>Unsaved changes</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
        <button
          type="button"
          data-testid="save-quiz-btn"
          disabled={isSaving}
          onClick={onSave}
          className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <span>💾</span>
              <span>Save Quiz</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
