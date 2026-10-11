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
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    border: "border-violet-200",
  },
  WORKSHEET: {
    label: "Worksheet",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    border: "border-sky-200",
  },
  QUIZ: {
    label: "Quiz",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-amber-200",
  },
  HOMEWORK: {
    label: "Homework",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    border: "border-emerald-200",
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
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-violet-700 transition-colors focus:outline-none focus-visible:underline"
        >
          <span aria-hidden="true">←</span>
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider border ${typeConfig.badge}`}
            >
              {typeConfig.label}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
              {subject}
            </span>
            {className && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                🏫 {className}
              </span>
            )}
            {time !== undefined && time !== null && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                ⏱ {time} mins
              </span>
            )}
            {totalMarks !== undefined && totalMarks !== null && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-200/60">
                🏆 {totalMarks} Total Marks
              </span>
            )}
            {difficulty && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                {difficulty}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase border ${
                status === "SAVED"
                  ? "bg-teal-50 text-teal-800 border-teal-200"
                  : status === "ARCHIVED"
                    ? "bg-slate-100 text-slate-600 border-slate-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {status}
            </span>
          </div>

          <h1
            data-testid={titleTestId}
            className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight break-words"
          >
            {title}
          </h1>

          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">Topic:</span> {topic}
          </p>
        </div>

        {actions && <div className="shrink-0 pt-2 md:pt-0">{actions}</div>}
      </div>
    </div>
  );
};
