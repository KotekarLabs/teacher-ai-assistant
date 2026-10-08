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
    <div className="flex items-center space-x-2">
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
        className="px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
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
