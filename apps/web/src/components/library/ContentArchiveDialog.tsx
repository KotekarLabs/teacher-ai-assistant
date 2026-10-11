import React from "react";
import { Modal } from "../ui/Modal";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={`Archive ${resourceType}`}
      description="Remove from active library views"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={isArchiving}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-600 transition-colors min-h-[40px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isArchiving}
            data-testid="confirm-archive-btn"
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs transition-colors disabled:opacity-50 flex items-center min-h-[40px] cursor-pointer"
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
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to archive{" "}
          <strong className="text-slate-900 font-semibold">
            "{resourceTitle}"
          </strong>
          ? You can still access and review archived items from the Archived filter.
        </p>
      </div>
    </Modal>
  );
};
