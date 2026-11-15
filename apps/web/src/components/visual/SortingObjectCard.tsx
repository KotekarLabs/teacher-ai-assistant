import React from "react";
import type { PersistedSortingObject } from "@teacher-ai/contracts";
import { CanonicalVectorGraphic } from "./CanonicalVectorGraphic";

export interface SortingObjectCardProps {
  item: PersistedSortingObject;
  className?: string;
  testId?: string;
}

export const SortingObjectCard: React.FC<SortingObjectCardProps> = ({
  item,
  className = "",
  testId,
}) => {
  const getMovementBadge = () => {
    if (item.rolls && item.slides) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          🌀 Rolls & ➡️ Slides (ಉರುಳುತ್ತದೆ & ಜಾರುತ್ತದೆ)
        </span>
      );
    }
    if (item.rolls) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          🌀 Rolls (ಉರುಳುತ್ತದೆ)
        </span>
      );
    }
    if (item.slides) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
          ➡️ Slides (ಜಾರುತ್ತದೆ)
        </span>
      );
    }
    return null;
  };

  return (
    <article
      data-testid={testId || `sorting-card-${item.id}`}
      className={`bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-3 ${className}`}
    >
      <div className="flex items-start space-x-3.5">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0 flex items-center justify-center">
          <CanonicalVectorGraphic id={item.id} size={48} title={item.nameEnglish} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {item.nameEnglish}
            </h4>
            {getMovementBadge()}
          </div>
          <p className="text-xs font-semibold text-violet-700 font-kannada">
            {item.nameKannada}
          </p>
        </div>
      </div>

      {(item.contextualObservation || item.kannadaObservation) && (
        <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
          {item.contextualObservation && (
            <p className="text-slate-600 leading-relaxed">
              {item.contextualObservation}
            </p>
          )}
          {item.kannadaObservation && (
            <p className="text-slate-700 font-kannada leading-relaxed">
              {item.kannadaObservation}
            </p>
          )}
        </div>
      )}
    </article>
  );
};
export default SortingObjectCard;
