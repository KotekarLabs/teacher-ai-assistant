import React from "react";
import { QuickCreateCard, type QuickCreateOption } from "./QuickCreateCard";

const quickCreateOptions: QuickCreateOption[] = [
  {
    id: "lesson",
    title: "Lesson Plan",
    description:
      "Generate structured lesson plans with objectives, prerequisites, activities, and timings.",
    badgeColor: "bg-violet-50 text-violet-700",
    iconBg: "bg-violet-100/70",
    iconColor: "text-violet-700",
    accentBorderHover: "hover:border-violet-300",
    href: "/create/lesson",
    enabled: true,
    icon: (
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    id: "worksheet",
    title: "Worksheet",
    description:
      "Create printable classroom worksheets with multiple question formats and answer keys.",
    badgeColor: "bg-sky-50 text-sky-700",
    iconBg: "bg-sky-100/70",
    iconColor: "text-sky-700",
    accentBorderHover: "hover:border-sky-300",
    href: "/create/worksheet",
    enabled: true,
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    id: "quiz",
    title: "Quiz",
    description:
      "Build formative quizzes, assessments, and tests tailored to specific curriculum topics.",
    badgeColor: "bg-amber-50 text-amber-700",
    iconBg: "bg-amber-100/70",
    iconColor: "text-amber-700",
    accentBorderHover: "hover:border-amber-300",
    href: "/create/quiz",
    enabled: true,
    icon: (
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
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "homework",
    title: "Homework",
    description:
      "Prepare clear, take-home practice assignments with instructions and criteria.",
    badgeColor: "bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-100/70",
    iconColor: "text-emerald-700",
    accentBorderHover: "hover:border-emerald-300",
    href: "/create/homework",
    enabled: true,
    icon: (
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
];

export const QuickCreateGrid: React.FC = () => {
  return (
    <section aria-labelledby="quick-create-heading" className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            id="quick-create-heading"
            className="text-lg font-bold text-slate-900 tracking-tight"
          >
            Quick Create
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate customized, classroom-ready teaching resources
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickCreateOptions.map((option) => (
          <QuickCreateCard key={option.id} option={option} />
        ))}
      </div>
    </section>
  );
};
