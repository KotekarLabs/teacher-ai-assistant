import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isArchiving && onCancel()}
      title="Archive Class"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isArchiving}
            isLoading={isArchiving}
          >
            {isArchiving ? "Archiving..." : "Archive Class"}
          </Button>
        </div>
      }
    >
      <div className="flex items-start space-x-3.5">
        <div
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-600"
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed pt-1">
          Are you sure you want to archive{" "}
          <strong className="text-slate-900 font-semibold">{classNameTitle}</strong>? This class
          will be removed from your active classes list. No data will be permanently deleted.
        </p>
      </div>
    </Modal>
  );
};
