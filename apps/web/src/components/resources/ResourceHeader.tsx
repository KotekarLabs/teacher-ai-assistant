import React from "react";
import { Link } from "react-router-dom";

export interface ResourceHeaderProps {
  title: string;
  type: "LESSON" | "WORKSHEET" | "QUIZ" | "HOMEWORK";
  subject: string;
  topic: string;
  className?: string | null;
  durationMinutes?: number | null;
  estimatedTimeMinutes?: number | null;
  totalMarks?: number | null;
  difficulty?: string | null;
  status?: string;
  titleTestId?: string;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

const typeStyles: Record<
  string,
  { label: string; badge: string; border: string }
> = {
  LESSON: {
    label: "Lesson Plan",
    badge: "bg-indigo-100 text-indigo-800",
    border: "border-indigo-200",
  },
  WORKSHEET: {
    label: "Worksheet",
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
  },
  QUIZ: {
    label: "Quiz",
    badge: "bg-purple-100 text-purple-800",
    border: "border-purple-200",
  },
  HOMEWORK: {
    label: "Homework",
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-200",
  },
};

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  title,
  type,
  subject,
  topic,
  className,
  durationMinutes,
  estimatedTimeMinutes,
  totalMarks,
  difficulty,
  status = "SAVED",
  titleTestId = "resource-details-title",
  backTo = "/library",
  backLabel = "Back to Library",
  actions,
}) => {
  const typeConfig = typeStyles[type] || typeStyles.LESSON;
  const time = durationMinutes || estimatedTimeMinutes;

  return (
    <div className="space-y-3">
      {/* Top back navigation */}
      <div className="no-print">
        <Link
          to={backTo}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span>←</span>
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${typeConfig.badge}`}
            >
              {typeConfig.label}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
              {subject}
            </span>
            {className && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                🏫 {className}
              </span>
            )}
            {time !== undefined && time !== null && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                ⏱ {time} mins
              </span>
            )}
            {totalMarks !== undefined && totalMarks !== null && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700">
                🏆 {totalMarks} Total Marks
              </span>
            )}
            {difficulty && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800">
                {difficulty}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                status === "SAVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : status === "ARCHIVED"
                    ? "bg-slate-200 text-slate-700"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {status}
            </span>
          </div>

          <h1
            data-testid={titleTestId}
            className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
          >
            {title}
          </h1>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">Topic:</span> {topic}
          </p>
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
