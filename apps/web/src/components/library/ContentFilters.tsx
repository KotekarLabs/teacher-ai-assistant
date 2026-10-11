import React from "react";

interface ContentFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedClassId?: string;
  onClassChange: (classId: string) => void;
  status?: string;
  onStatusChange: (status: string) => void;
  classes?: Array<{ id: string; name: string; grade: string }>;
}

const TYPE_OPTIONS = [
  { id: "ALL", label: "All Resources", icon: "📁" },
  { id: "LESSON", label: "Lessons", icon: "✨" },
  { id: "WORKSHEET", label: "Worksheets", icon: "📝" },
  { id: "QUIZ", label: "Quizzes", icon: "❓" },
  { id: "HOMEWORK", label: "Homework", icon: "📚" },
];

export const ContentFilters: React.FC<ContentFiltersProps> = ({
  selectedType,
  onTypeChange,
  selectedClassId = "",
  onClassChange,
  status = "ACTIVE",
  onStatusChange,
  classes = [],
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 py-1">
      {/* Type Pill Selector */}
      <div
        role="tablist"
        aria-label="Filter by resource type"
        className="flex items-center space-x-1 p-1 bg-slate-100/90 rounded-xl overflow-x-auto max-w-full scrollbar-none"
      >
        {TYPE_OPTIONS.map((opt) => {
          const isSelected = (selectedType || "ALL") === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onTypeChange(opt.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 min-h-[36px] cursor-pointer ${
                isSelected
                  ? "bg-white text-violet-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span aria-hidden="true">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Class and Status Controls */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full lg:w-auto">
        {/* Class Filter Dropdown */}
        <div className="w-full sm:w-48 min-w-0">
          <label htmlFor="library-class-select" className="sr-only">
            Filter by Class
          </label>
          <select
            id="library-class-select"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200/90 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 shadow-xs transition-colors min-h-[40px] cursor-pointer"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Grade {c.grade} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Toggle (Active / Archived) */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100/90 rounded-xl flex-shrink-0">
          <button
            type="button"
            onClick={() => onStatusChange("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 min-h-[36px] cursor-pointer ${
              status !== "ARCHIVED"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("ARCHIVED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 min-h-[36px] cursor-pointer ${
              status === "ARCHIVED"
                ? "bg-white text-rose-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Archived
          </button>
        </div>
      </div>
    </div>
  );
};
