import React, { useEffect, useState } from "react";

const STAGES = [
  "Preparing worksheet context...",
  "Generating targeted practice questions...",
  "Formulating answer keys & marks...",
  "Checking worksheet quality & safety...",
  "Finalizing your classroom-ready worksheet...",
];

export const WorksheetGenerationState: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-testid="worksheet-generation-loading"
      className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto"
    >
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
        <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Generating Worksheet
      </h3>
      <p className="text-sm text-indigo-600 font-medium mb-4 animate-fade-in">
        {STAGES[stageIndex]}
      </p>
      <p className="text-xs text-slate-400 max-w-xs">
        Our pedagogical AI is creating questions, answer keys, and grading rubrics aligned with your grade and difficulty.
      </p>
    </div>
  );
};
