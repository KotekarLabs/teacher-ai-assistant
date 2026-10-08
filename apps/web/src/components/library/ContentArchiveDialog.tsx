import React from "react";

interface ContentArchiveDialogProps {
  isOpen: boolean;
  resourceTitle: string;
  resourceType: string;
  onConfirm: () => void;
  onCancel: () => void;
  isArchiving?: boolean;
}

export const ContentArchiveDialog: React.FC<ContentArchiveDialogProps> = ({
  isOpen,
  resourceTitle,
  resourceType,
  onConfirm,
  onCancel,
  isArchiving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center space-x-3 mb-4 text-red-600">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <svg
              className="w-6 h-6"
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
          <div>
            <h3
              id="archive-dialog-title"
              className="text-lg font-bold text-slate-900 leading-none"
            >
              Archive {resourceType}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Remove from active library views
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to archive{" "}
          <strong className="text-slate-900 font-semibold">
            "{resourceTitle}"
          </strong>
          ? You can still access and restore archived items from the Archived filter.
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isArchiving}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isArchiving}
            data-testid="confirm-archive-btn"
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors disabled:opacity-50 flex items-center"
          >
            {isArchiving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Archiving...
              </>
            ) : (
              "Archive Resource"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
