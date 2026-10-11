import React from "react";
import { Link } from "react-router-dom";

export interface QuickCreateOption {
  id: string;
  title: string;
  description: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  accentBorderHover?: string;
  icon: React.ReactNode;
  href?: string;
  enabled?: boolean;
}

interface QuickCreateCardProps {
  option: QuickCreateOption;
}

export const QuickCreateCard: React.FC<QuickCreateCardProps> = ({ option }) => {
  const isEnabled = !!option.enabled;

  if (isEnabled && option.href) {
    return (
      <Link
        to={option.href}
        data-testid={`quick-create-${option.id}`}
        className={`relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md ${
          option.accentBorderHover || "hover:border-violet-300"
        } hover:-translate-y-0.5 group transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 min-h-[190px]`}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${option.iconBg} ${option.iconColor} transition-transform group-hover:scale-105 duration-200 shadow-xs`}
              aria-hidden="true"
            >
              {option.icon}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/70">
              AI Ready
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">
            {option.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {option.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-violet-700 font-semibold group-hover:text-violet-800">
          <span>Create Now</span>
          <svg
            className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <div
      data-testid={`quick-create-${option.id}`}
      aria-disabled="true"
      tabIndex={-1}
      className="relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs opacity-75 cursor-not-allowed select-none group min-h-[190px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${option.iconBg} ${option.iconColor}`}
            aria-hidden="true"
          >
            {option.icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Coming Soon
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-700 mb-1">
          {option.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {option.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>AI Generator</span>
        <svg
          className="w-4 h-4 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};
