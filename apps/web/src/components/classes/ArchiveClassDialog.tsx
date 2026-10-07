import React, { useEffect } from "react";

interface ArchiveClassDialogProps {
  isOpen: boolean;
  classNameTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isArchiving?: boolean;
}

export const ArchiveClassDialog: React.FC<ArchiveClassDialogProps> = ({
  isOpen,
  classNameTitle,
  onConfirm,
  onCancel,
  isArchiving = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isArchiving) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isArchiving, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-title"
    >
      <div
        className="fixed inset-0"
        onClick={() => !isArchiving && onCancel()}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200 z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3
            id="archive-dialog-title"
            className="text-lg font-bold text-slate-900"
          >
            Archive Class
          </h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Are you sure you want to archive{" "}
          <strong className="text-slate-900">{classNameTitle}</strong>? This class
          will be removed from your active classes list. No data will be permanently deleted.
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isArchiving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isArchiving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center"
          >
            {isArchiving ? "Archiving..." : "Archive Class"}
          </button>
        </div>
      </div>
    </div>
  );
};
