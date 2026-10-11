import React from "react";
import { Link } from "react-router-dom";
import type { ContentDTO } from "@teacher-ai/contracts";
import {
  getResourceDetailRoute,
  getResourceEditRoute,
  getResourceTypeLabel,
  getResourceTypeIcon,
  getResourceTypeColor,
} from "../../utils/resourceRoutes";

interface ContentCardProps {
  item: ContentDTO;
  onDuplicate: (item: ContentDTO) => void;
  onArchive: (item: ContentDTO) => void;
  isDuplicating?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onDuplicate,
  onArchive,
  isDuplicating = false,
}) => {
  const typeColor = getResourceTypeColor(item.type);
  const detailRoute = getResourceDetailRoute(item.type, item.resourceId);
  const editRoute = getResourceEditRoute(item.type, item.resourceId);
  const typeLabel = getResourceTypeLabel(item.type);
  const typeIcon = getResourceTypeIcon(item.type);

  const formattedDate = new Date(item.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      data-testid={`content-card-${item.id}`}
      className="flex flex-col justify-between p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150 group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
          >
            <span aria-hidden="true">{typeIcon}</span>
            <span>{typeLabel}</span>
          </span>

          {item.class && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70 truncate max-w-[130px]">
              {item.class.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2 mb-1.5">
          <Link to={detailRoute} className="focus:outline-none focus-visible:underline">
            {item.title}
          </Link>
        </h3>

        {/* Subject & Topic */}
        <div className="space-y-0.5 mb-4">
          <p className="text-xs font-medium text-slate-700 truncate">
            {item.subject} • <span className="text-slate-500">{item.topic}</span>
          </p>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            {item.difficulty && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                {item.difficulty}
              </span>
            )}
            {item.archivedAt && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                Archived
              </span>
            )}
          </div>
          <span className="text-[11px]">{formattedDate}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <Link
              to={detailRoute}
              data-testid={`view-resource-btn-${item.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 transition-colors min-h-[36px]"
            >
              Open
            </Link>
            <Link
              to={editRoute}
              data-testid={`edit-resource-btn-${item.id}`}
              className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors min-h-[36px]"
            >
              Edit
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onDuplicate(item)}
              disabled={isDuplicating}
              title="Duplicate Resource"
              aria-label={`Duplicate ${item.title}`}
              data-testid={`duplicate-resource-btn-${item.id}`}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            >
              {isDuplicating ? (
                <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
              )}
            </button>

            {!item.archivedAt && (
              <button
                type="button"
                onClick={() => onArchive(item)}
                title="Archive Resource"
                aria-label={`Archive ${item.title}`}
                data-testid={`archive-resource-btn-${item.id}`}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
