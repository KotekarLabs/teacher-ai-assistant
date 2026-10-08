import React from "react";

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
  if (!isOpen) return null;

  return (
    <div
      data-testid="unsaved-changes-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
        <div className="flex items-center space-x-3">
          <span className="text-amber-500 text-2xl">⚠️</span>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              You have unsaved changes
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Leaving this page will discard any modifications you have made.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-unsaved-btn"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="discard-changes-btn"
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 cursor-pointer"
          >
            Discard changes
          </button>
          <button
            type="button"
            data-testid="save-changes-btn"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
