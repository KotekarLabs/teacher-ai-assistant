import React from "react";

export type ResourceStatus =
  | "SAVED"
  | "DRAFT"
  | "EDITED"
  | "ARCHIVED"
  | "ACTIVE";

export interface StatusBadgeProps {
  status: ResourceStatus | string;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<
  ResourceStatus,
  {
    label: string;
    container: string;
    dot: string;
  }
> = {
  SAVED: {
    label: "Saved",
    container: "bg-teal-50 text-teal-800 border-teal-200",
    dot: "bg-teal-500",
  },
  ACTIVE: {
    label: "Active",
    container: "bg-teal-50 text-teal-800 border-teal-200",
    dot: "bg-teal-500",
  },
  DRAFT: {
    label: "Draft",
    container: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  EDITED: {
    label: "Edited",
    container: "bg-violet-50 text-violet-800 border-violet-200",
    dot: "bg-violet-500",
  },
  ARCHIVED: {
    label: "Archived",
    container: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
  showDot = true,
}) => {
  const normalizedStatus = (status.toUpperCase() as ResourceStatus) in statusConfig
    ? (status.toUpperCase() as ResourceStatus)
    : "DRAFT";

  const config = statusConfig[normalizedStatus];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border gap-1.5 ${config.container} ${className}`}
      data-testid="status-badge"
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
