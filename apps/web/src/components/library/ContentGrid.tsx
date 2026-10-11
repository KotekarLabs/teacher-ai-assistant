import React from "react";
import type { ContentDTO, ContentPaginationDTO } from "@teacher-ai/contracts";
import { ContentCard } from "./ContentCard";

interface ContentGridProps {
  items: ContentDTO[];
  isLoading: boolean;
  pagination?: ContentPaginationDTO;
  onPageChange: (page: number) => void;
  onDuplicate: (item: ContentDTO) => void;
  onArchive: (item: ContentDTO) => void;
  duplicatingId?: string | null;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  isLoading,
  pagination,
  onPageChange,
  onDuplicate,
  onArchive,
  duplicatingId,
}) => {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading library resources"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-6 bg-slate-200 rounded-lg" />
              <div className="w-16 h-5 bg-slate-100 rounded-md" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
              <div className="w-1/2 h-3.5 bg-slate-100 rounded-md" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="w-20 h-5 bg-slate-100 rounded-lg" />
              <div className="flex space-x-1.5">
                <div className="w-12 h-6 bg-slate-100 rounded-lg" />
                <div className="w-12 h-6 bg-slate-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            isDuplicating={duplicatingId === item.id}
          />
        ))}
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div
          role="navigation"
          aria-label="Pagination"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/80 text-xs text-slate-500"
        >
          <div className="text-center sm:text-left">
            Showing page <strong className="text-slate-900 font-bold">{pagination.page}</strong> of{" "}
            <strong className="text-slate-900 font-bold">{pagination.totalPages}</strong> ({pagination.total} total items)
          </div>

          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px] cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
