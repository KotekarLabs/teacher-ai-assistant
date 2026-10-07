import React from "react";

export interface QuickCreateOption {
  id: string;
  title: string;
  description: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

interface QuickCreateCardProps {
  option: QuickCreateOption;
}

export const QuickCreateCard: React.FC<QuickCreateCardProps> = ({ option }) => {
  return (
    <div
      aria-disabled="true"
      tabIndex={-1}
      className="relative flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-sm opacity-90 cursor-not-allowed select-none group transition-all"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center ${option.iconBg} ${option.iconColor}`}
            aria-hidden="true"
          >
            {option.icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Coming Soon
          </span>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          {option.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
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
