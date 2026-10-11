import React, { useState, useEffect } from "react";

interface ResourceGenerationOverlayProps {
  resourceType: string;
  topic?: string;
  className?: string;
  onDismiss?: () => void;
}

export const ResourceGenerationOverlay: React.FC<
  ResourceGenerationOverlayProps
> = ({ resourceType, topic, className: targetClass, onDismiss }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isTakingLong = elapsedSeconds >= 30;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Generating ${resourceType}`}
      data-testid="resource-generation-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 text-center space-y-5">
        {/* Animated AI Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-violet-100 animate-pulse motion-reduce:animate-none" />
          <div className="w-16 h-16 rounded-full border-4 border-violet-600 border-t-transparent animate-spin motion-reduce:animate-none" />
        </div>

        {/* Title & Resource Context */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Generating AI {resourceType}
          </h3>
          {(topic || targetClass) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {topic && (
                <span className="text-xs font-semibold text-violet-800 bg-violet-50 border border-violet-200/80 px-2.5 py-0.5 rounded-full truncate max-w-[200px]">
                  {topic}
                </span>
              )}
              {targetClass && (
                <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                  {targetClass}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Informational Stage Text */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          Assembling structured educational content, validating pedagogical quality, and aligning with curriculum standards.
        </p>

        {/* Elapsed Timer & 30s Timeout Guidance */}
        <div className="pt-2 border-t border-slate-100 text-xs">
          {isTakingLong ? (
            <div
              role="alert"
              className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-left space-y-2 animate-fade-in"
            >
              <div className="flex items-center space-x-1.5 font-semibold text-amber-900">
                <span>⏱</span>
                <span>Generation is taking longer than usual ({elapsedSeconds}s)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700">
                Your request is still processing on the server. Please keep this page open, or you may return to the form to review your inputs.
              </p>
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200/80 rounded-lg transition-colors cursor-pointer min-h-[40px]"
                >
                  Return to Form While Processing
                </button>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium">
              Elapsed: {elapsedSeconds}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
