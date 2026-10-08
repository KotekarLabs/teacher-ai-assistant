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
      className="sticky bottom-4 z-20 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center space-x-3">
        <button
          type="button"
          data-testid="back-btn"
          onClick={onBack}
          className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center space-x-2">
          <span
            data-testid="quiz-status-badge"
            className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              status === "SAVED"
                ? "bg-emerald-100 text-emerald-800"
                : status === "EDITED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {status}
          </span>
          {hasUnsavedChanges && (
            <span
              data-testid="unsaved-changes-indicator"
              className="text-xs text-amber-600 font-medium flex items-center space-x-1"
            >
              <span>●</span>
              <span>Unsaved changes</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          data-testid="save-quiz-btn"
          disabled={isSaving}
          onClick={onSave}
          className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors flex items-center space-x-1.5 disabled:opacity-50"
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
