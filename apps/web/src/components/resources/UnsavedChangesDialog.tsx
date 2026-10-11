import React, { useEffect } from "react";

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="unsaved-changes-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start space-x-3.5">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
            ⚠️
          </div>
          <div>
            <h4 id="unsaved-dialog-title" className="text-lg font-bold text-slate-900 tracking-tight">
              You have unsaved changes
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Leaving this page will discard any modifications you have made to this resource.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-unsaved-btn"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl transition-colors border border-slate-300 hover:bg-slate-50 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="discard-changes-btn"
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Discard changes
          </button>
          <button
            type="button"
            data-testid="save-changes-btn"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
