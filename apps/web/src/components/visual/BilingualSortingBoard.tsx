import React from "react";
import type { PersistedSortingDiagram } from "@teacher-ai/contracts";
import { SortingObjectCard } from "./SortingObjectCard";
import { MultiPerspectiveCard } from "./MultiPerspectiveCard";

export interface BilingualSortingBoardProps {
  visualExplanation: PersistedSortingDiagram;
  className?: string;
  testId?: string;
}

export const BilingualSortingBoard: React.FC<BilingualSortingBoardProps> = ({
  visualExplanation,
  className = "",
  testId = "bilingual-sorting-board",
}) => {
  const { sortingActivity, teacherGuidance } = visualExplanation;
  const items = sortingActivity.items || [];

  // Group items into canonical categories
  const longItems = items.filter((i) => i.shapeCategory === "LONG");
  const roundItems = items.filter((i) => i.shapeCategory === "ROUND");
  const multiPerspectiveItems = items.filter(
    (i) => i.shapeCategory === "MULTI_PERSPECTIVE",
  );

  return (
    <section
      data-testid={testId}
      aria-label="Bilingual Visual Sorting Board"
      className={`space-y-6 bg-[#FCFBF7] p-5 sm:p-7 rounded-3xl border border-amber-200/70 shadow-subtle ${className}`}
    >
      {/* Board Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-100 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block">
              Interactive Teaching Board • ದೃಶ್ಯ ಬೋಧನಾ ಬೋರ್ಡ್
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {sortingActivity.title || "Visual Sorting Board: What is Long? What is Round?"}
            </h2>
            <p className="text-base font-semibold text-violet-700 font-kannada mt-0.5">
              ದೃಶ್ಯ ವಿಂಗಡಣೆ ಬೋರ್ಡ್: ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 self-start sm:self-auto">
            8 Canonical Objects
          </span>
        </div>

        {/* Instructions English & Kannada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 block mb-0.5">English Instructions:</span>
            <p className="text-slate-600 leading-relaxed">{sortingActivity.instructions}</p>
          </div>
          {sortingActivity.kannadaInstructions && (
            <div className="p-3 bg-violet-50/40 rounded-xl border border-violet-100/60">
              <span className="font-bold text-violet-800 font-kannada block mb-0.5">
                ಕನ್ನಡ ಸೂಚನೆಗಳು:
              </span>
              <p className="text-slate-700 font-kannada leading-relaxed">
                {sortingActivity.kannadaInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Teacher Guidance Note */}
        {teacherGuidance && (
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-xs flex items-start space-x-2">
            <span className="text-amber-700 text-sm">💡</span>
            <div>
              <span className="font-bold text-amber-900 mr-1.5">Teacher Guidance:</span>
              <span className="text-amber-800 leading-relaxed">{teacherGuidance}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Binary Classification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="binary-sorting-grid">
        {/* Column 1: Long Objects — Slides */}
        <div
          data-testid="long-objects-column"
          className="bg-white/80 p-5 rounded-2xl border border-sky-200/80 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-sky-950 flex items-center gap-2">
                <span>📏</span>
                <span>Long Objects (ಉದ್ದವಾದ ವಸ್ತುಗಳು)</span>
              </h3>
              <p className="text-xs text-sky-700 font-medium mt-0.5">
                Characteristic Movement: Slides (ಜಾರುತ್ತದೆ)
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              {longItems.length} Objects
            </span>
          </div>

          <div className="space-y-3">
            {longItems.map((item) => (
              <SortingObjectCard key={item.id} item={item} testId={`long-item-${item.id}`} />
            ))}
          </div>
        </div>

        {/* Column 2: Round Objects — Rolls */}
        <div
          data-testid="round-objects-column"
          className="bg-white/80 p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                <span>⚽</span>
                <span>Round Objects (ದುಂಡಗಿನ ವಸ್ತುಗಳು)</span>
              </h3>
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                Characteristic Movement: Rolls (ಉರುಳುತ್ತದೆ)
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {roundItems.length} Objects
            </span>
          </div>

          <div className="space-y-3">
            {roundItems.map((item) => (
              <SortingObjectCard key={item.id} item={item} testId={`round-item-${item.id}`} />
            ))}

            {/* Discovery Inquiry Card */}
            <div
              data-testid="discovery-inquiry-card"
              className="p-4 bg-gradient-to-br from-amber-50 to-violet-50/50 rounded-2xl border border-dashed border-amber-300 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center space-x-2 text-violet-800">
                <span className="text-base">🔍</span>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Classroom Discovery Inquiry (ಕಲಿಕಾ ಅನ್ವೇಷಣೆ)
                </h4>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                Can an object both roll and slide? What if we look at it from different angles?
              </p>
              <p className="text-xs text-violet-700 font-kannada leading-relaxed">
                ಒಂದೇ ವಸ್ತು ಉರುಳಲು ಮತ್ತು ಜಾರಲು ಎರಡೂ ಸಾಧ್ಯವೇ? ವಿವಿಧ ಕೋನಗಳಿಂದ ನೋಡಿದಾಗ ಏನಾಗುತ್ತದೆ?
              </p>
              <span className="text-[11px] font-bold text-amber-700">
                👇 Discover the Multi-Perspective objects below!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distinct Multi-Perspective Section */}
      <div
        data-testid="multi-perspective-section"
        className="bg-white p-6 rounded-2xl border border-violet-200/90 shadow-2xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔄</span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Multi-Perspective Observation Section
              </h3>
            </div>
            <p className="text-xs font-semibold text-violet-700 font-kannada mt-0.5">
              ಬಹು-ಕೋನ ವೀಕ್ಷಣೆ: ನೋಡುವ ಕೋನದ ಆಧಾರದ ಮೇಲೆ ವಸ್ತುಗಳ ಆಕಾರ ಬದಲಾಗುತ್ತದೆ
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 self-start sm:self-auto">
            3 Special Objects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {multiPerspectiveItems.map((item) => (
            <MultiPerspectiveCard
              key={item.id}
              item={item}
              testId={`multi-item-${item.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default BilingualSortingBoard;
