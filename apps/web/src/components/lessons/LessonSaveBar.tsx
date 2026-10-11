import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    if (!showRegenModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowRegenModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showRegenModal]);

  const handleConfirmRegenerate = () => {
    setShowRegenModal(false);
    onRegenerate(customInstructions.trim() || undefined);
  };

  return (
    <>
      <div
        data-testid="lesson-save-bar"
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
              data-testid="lesson-status-badge"
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

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            data-testid="regenerate-lesson-btn"
            disabled={isSaving || isRegenerating}
            onClick={() => setShowRegenModal(true)}
            className="px-4 py-2 text-sm font-semibold text-violet-700 hover:text-violet-800 bg-violet-50 hover:bg-violet-100/80 rounded-xl transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
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
            className="px-6 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="regenerate-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 no-print animate-fade-in"
          onClick={() => setShowRegenModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="regenerate-dialog-title" className="text-lg font-bold text-slate-900">
              Regenerate Whole Lesson
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will create a new structured draft for this topic. Your current saved version remains safe if generation fails.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Instructions for AI (Optional)
              </label>
              <textarea
                rows={3}
                data-testid="regenerate-instructions-input"
                placeholder="e.g. Focus more on practical outdoor examples or make assessment questions simpler."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-regenerate-btn"
                onClick={handleConfirmRegenerate}
                className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl cursor-pointer min-h-[44px]"
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
