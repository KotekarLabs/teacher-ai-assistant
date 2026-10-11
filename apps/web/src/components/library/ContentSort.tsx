import React from "react";
import type { ContentSort as ContentSortType } from "@teacher-ai/contracts";

interface ContentSortProps {
  value: ContentSortType;
  onChange: (sort: ContentSortType) => void;
}

export const ContentSortSelector: React.FC<ContentSortProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
      <label
        htmlFor="library-sort-select"
        className="text-xs font-semibold text-slate-500 whitespace-nowrap"
      >
        Sort by:
      </label>
      <select
        id="library-sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ContentSortType)}
        className="px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200/90 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 shadow-xs transition-colors min-h-[40px] cursor-pointer"
      >
        <option value="updatedAt_desc">Recently Updated</option>
        <option value="updatedAt_asc">Oldest First</option>
        <option value="title_asc">Title (A-Z)</option>
        <option value="title_desc">Title (Z-A)</option>
      </select>
    </div>
  );
};

export const ContentSort = ContentSortSelector;
