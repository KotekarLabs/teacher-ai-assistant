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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      {/* Type Pill Selector */}
      <div
        role="tablist"
        aria-label="Filter by resource type"
        className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full"
      >
        {TYPE_OPTIONS.map((opt) => {
          const isSelected = (selectedType || "ALL") === opt.id;
          return (
            <button
              key={opt.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onTypeChange(opt.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Class and Status Controls */}
      <div className="flex items-center space-x-3 flex-wrap sm:flex-nowrap">
        {/* Class Filter Dropdown */}
        <div className="w-48">
          <label htmlFor="library-class-select" className="sr-only">
            Filter by Class
          </label>
          <select
            id="library-class-select"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
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
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => onStatusChange("ACTIVE")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              status !== "ARCHIVED"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("ARCHIVED")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              status === "ARCHIVED"
                ? "bg-white text-red-600 shadow-sm font-bold"
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
