import React, { useState } from "react";

interface LessonSaveBarProps {
  status: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isRegenerating: boolean;
  onSave: () => void;
  onRegenerate: (instructions?: string) => void;
  onBack: () => void;
}

export const LessonSaveBar: React.FC<LessonSaveBarProps> = ({
  status,
  hasUnsavedChanges,
  isSaving,
  isRegenerating,
  onSave,
  onRegenerate,
  onBack,
}) => {
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  const handleConfirmRegenerate = () => {
    setShowRegenModal(false);
    onRegenerate(customInstructions.trim() || undefined);
  };

  return (
    <>
      <div
        data-testid="lesson-save-bar"
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
              data-testid="lesson-status-badge"
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
            data-testid="regenerate-lesson-btn"
            disabled={isSaving || isRegenerating}
            onClick={() => setShowRegenModal(true)}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isRegenerating ? (
              <span>Regenerating...</span>
            ) : (
              <>
                <span>🔄</span>
                <span>Regenerate Lesson</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="save-lesson-btn"
            disabled={isSaving || isRegenerating}
            onClick={onSave}
            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>💾</span>
                <span>Save Lesson</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Regeneration Instructions Modal */}
      {showRegenModal && (
        <div
          data-testid="regenerate-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h4 className="text-lg font-bold text-slate-900">
              Regenerate Whole Lesson
            </h4>
            <p className="text-xs text-slate-500">
              This will create a new structured draft for this topic. Your current saved version remains safe if generation fails.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Instructions for AI (Optional)
              </label>
              <textarea
                rows={3}
                data-testid="regenerate-instructions-input"
                placeholder="e.g. Focus more on practical outdoor examples or make assessment questions simpler."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-regenerate-btn"
                onClick={handleConfirmRegenerate}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Start Regeneration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
