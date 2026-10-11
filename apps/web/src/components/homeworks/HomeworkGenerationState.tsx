import React, { useEffect, useState } from "react";

const STAGES = [
  "Preparing your homework...",
  "Creating practice tasks...",
  "Checking age suitability...",
  "Checking workload & completion time...",
  "Finalizing classroom-ready assignment...",
];

export const HomeworkGenerationState: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-testid="homework-generation-loading"
      role="status"
      aria-label="Generating Homework"
      className="flex flex-col items-center justify-center p-10 sm:p-14 bg-white rounded-2xl shadow-xs border border-slate-200/80 text-center max-w-lg mx-auto"
    >
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-violet-100 animate-pulse" />
        <div className="w-16 h-16 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
        Generating Homework
      </h3>
      <p className="text-sm text-violet-700 font-semibold mb-4 transition-all">
        {STAGES[stageIndex]}
      </p>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
        Crafting structured practice tasks, verifying age appropriateness, and balancing student workload for your class.
      </p>
    </div>
  );
};
