import React from "react";
import { Link } from "react-router-dom";

interface ContentEmptyStateProps {
  isSearchOrFiltered: boolean;
  isArchivedView: boolean;
  onClearFilters: () => void;
}

export const ContentEmptyState: React.FC<ContentEmptyStateProps> = ({
  isSearchOrFiltered,
  isArchivedView,
  onClearFilters,
}) => {
  if (isArchivedView) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
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
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No Archived Resources
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          You haven't archived any lessons, worksheets, quizzes, or homework assignments.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 transition-colors min-h-[40px] cursor-pointer"
        >
          View Active Library
        </button>
      </div>
    );
  }

  if (isSearchOrFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No Resources Match Your Criteria
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Try changing your search keywords or adjusting your filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 transition-colors min-h-[40px] cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200/60 flex items-center justify-center text-violet-700 text-2xl mb-4">
        📚
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">
        Your Resource Library is Empty
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-md leading-relaxed">
        Generate your first AI-assisted teaching materials to start building your unified teacher repository.
      </p>

      {/* Quick Create Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
        <Link
          to="/create/lesson"
          className="flex flex-col items-center p-3 rounded-xl bg-violet-50/70 hover:bg-violet-50 border border-violet-200/70 text-violet-900 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 min-h-[44px]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform" aria-hidden="true">✨</span>
          <span className="text-xs font-bold">Create Lesson</span>
        </Link>
        <Link
          to="/create/worksheet"
          className="flex flex-col items-center p-3 rounded-xl bg-sky-50/70 hover:bg-sky-50 border border-sky-200/70 text-sky-900 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[44px]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform" aria-hidden="true">📝</span>
          <span className="text-xs font-bold">Create Worksheet</span>
        </Link>
        <Link
          to="/create/quiz"
          className="flex flex-col items-center p-3 rounded-xl bg-amber-50/70 hover:bg-amber-50 border border-amber-200/70 text-amber-900 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform" aria-hidden="true">❓</span>
          <span className="text-xs font-bold">Create Quiz</span>
        </Link>
        <Link
          to="/create/homework"
          className="flex flex-col items-center p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/70 text-emerald-900 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform" aria-hidden="true">📚</span>
          <span className="text-xs font-bold">Create Homework</span>
        </Link>
      </div>
    </div>
  );
};
