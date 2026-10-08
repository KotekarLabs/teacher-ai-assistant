import React, { useEffect, useState } from "react";

const STAGES = [
  "Preparing quiz context...",
  "Generating quiz questions...",
  "Checking answers & explanations...",
  "Calculating marks & scoring rubrics...",
  "Finalizing your classroom-ready quiz...",
];

export const QuizGenerationState: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-testid="quiz-generation-loading"
      className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto"
    >
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
        <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Generating Quiz
      </h3>
      <p className="text-sm text-indigo-600 font-medium mb-4 animate-fade-in">
        {STAGES[stageIndex]}
      </p>
      <p className="text-xs text-slate-400 max-w-xs">
        Our pedagogical AI is creating questions, validating answers, and calculating marks aligned with your grade and difficulty.
      </p>
    </div>
  );
};
