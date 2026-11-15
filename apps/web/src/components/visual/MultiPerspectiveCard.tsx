import React from "react";
import type { PersistedSortingObject } from "@teacher-ai/contracts";
import { CanonicalVectorGraphic } from "./CanonicalVectorGraphic";

export interface MultiPerspectiveCardProps {
  item: PersistedSortingObject;
  className?: string;
  testId?: string;
}

export const MultiPerspectiveCard: React.FC<MultiPerspectiveCardProps> = ({
  item,
  className = "",
  testId,
}) => {
  // Canonical viewpoint explanations if not overridden in item
  const getDefaultPerspectiveNote = () => {
    switch (item.id) {
      case "bottle":
        return {
          en: "Long cylindrical body when viewed from the side; circular shape when viewed from its base.",
          kn: "ಪಕ್ಕದಿಂದ ನೋಡಿದಾಗ ಉದ್ದ ಸಿಲಿಂಡರ್ ಆಕಾರ; ಕೆಳಭಾಗದಿಂದ ನೋಡಿದಾಗ ದುಂಡಾದ ವೃತ್ತಾಕಾರ.",
        };
      case "bangle":
        return {
          en: "Circular ring that rolls along its rim; appears like a straight line when viewed edge-on.",
          kn: "ಅಂಚಿನ ಮೇಲೆ ಉರುಳುವ ದುಂಡಗಿನ ಬಳೆ; ಬದಿಯಿಂದ ನೋಡಿದಾಗ ನೇರ ರೇಖೆಯಂತೆ ಕಾಣುತ್ತದೆ.",
        };
      case "pencil_box":
        return {
          en: "Elongated cuboid with flat faces; slides rather than rolls under the demonstrated conditions.",
          kn: "ಚಪ್ಪಟೆ ಮುಖಗಳನ್ನು ಹೊಂದಿರುವ ಉದ್ದವಾದ ಆಯತಾಕಾರದ ಪೆಟ್ಟಿಗೆ; ಇದು ಜಾರುತ್ತದೆ.",
        };
      default:
        return {
          en: item.perspectiveNote || item.contextualObservation || "",
          kn: item.kannadaObservation || "",
        };
    }
  };

  const note = getDefaultPerspectiveNote();

  return (
    <article
      data-testid={testId || `multi-perspective-card-${item.id}`}
      className={`bg-white p-5 rounded-2xl border border-violet-200/90 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4 ${className}`}
    >
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 bg-violet-50/80 rounded-xl border border-violet-100 flex-shrink-0 flex items-center justify-center">
          <CanonicalVectorGraphic id={item.id} size={52} title={item.nameEnglish} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {item.nameEnglish}
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100/70 text-violet-800 border border-violet-200">
              🔄 Multi-Perspective (ಬಹು-ಕೋನ)
            </span>
          </div>
          <p className="text-xs font-semibold text-violet-700 font-kannada">
            {item.nameKannada}
          </p>
        </div>
      </div>

      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Viewpoint Observation
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {item.perspectiveNote || note.en}
          </p>
        </div>
        {note.kn && (
          <div className="pt-1.5 border-t border-slate-200/60">
            <p className="text-slate-700 font-kannada leading-relaxed text-xs">
              {note.kn}
            </p>
          </div>
        )}
      </div>

      {(item.contextualObservation || item.kannadaObservation) && (
        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
          {item.contextualObservation && <p>{item.contextualObservation}</p>}
          {item.kannadaObservation && (
            <p className="font-kannada text-slate-600">{item.kannadaObservation}</p>
          )}
        </div>
      )}
    </article>
  );
};
export default MultiPerspectiveCard;
