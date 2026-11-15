import React from "react";
import type { ClassDTO, CurriculumPresetSummary } from "@teacher-ai/contracts";
import { useCurriculumPresets } from "../../hooks/useCurriculumPresets";

export interface CurriculumPresetSelectorProps {
  selectedClass?: ClassDTO;
  selectedPresetId?: string;
  onSelectPreset: (preset: CurriculumPresetSummary | null) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Validates whether a given class is eligible for a specific curriculum preset.
 * Enforces strict grade and curriculum board matching rules.
 */
export function isClassEligibleForPreset(
  cls: ClassDTO | undefined,
  preset: CurriculumPresetSummary,
): { eligible: boolean; reason?: string } {
  if (!cls) {
    return { eligible: false, reason: "Please select a class first." };
  }

  // 1. Grade check: Normalize "Grade 1", "Class 1", or "1"
  const normClassGrade = cls.grade.replace(/^(grade|class)\s*/i, "").trim();
  if (normClassGrade !== preset.grade) {
    return {
      eligible: false,
      reason: `Grade mismatch: Preset is designed for Grade ${preset.grade}, but class is Grade ${cls.grade}.`,
    };
  }

  // 2. Board check: If class has an assigned board, it must be compatible with preset
  if (cls.curriculumBoard && cls.curriculumBoard.trim() !== "") {
    const normClassBoard = cls.curriculumBoard.trim().toLowerCase();
    const normPresetBoard = preset.curriculumBoard.trim().toLowerCase();
    const isKarnataka =
      normClassBoard === normPresetBoard ||
      normClassBoard === "karnataka state board" ||
      normClassBoard === "karnataka board" ||
      normClassBoard === "kseeb" ||
      normClassBoard === "ktbs";

    if (!isKarnataka) {
      return {
        eligible: false,
        reason: `Board mismatch: Preset is for ${preset.curriculumBoard}, but class board is '${cls.curriculumBoard}'.`,
      };
    }
  }

  // Grade 1 + null/empty board is eligible (adopts preset board)
  return { eligible: true };
}

export const CurriculumPresetSelector: React.FC<CurriculumPresetSelectorProps> = ({
  selectedClass,
  selectedPresetId,
  onSelectPreset,
  disabled = false,
  className = "",
}) => {
  const { data, isLoading, isError, error, refetch } = useCurriculumPresets();

  const presets = data?.presets || [];

  if (isLoading) {
    return (
      <div
        data-testid="preset-loading-skeleton"
        aria-busy="true"
        className={`p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-pulse ${className}`}
      >
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
        <div className="h-3 bg-slate-200 rounded-md w-2/3"></div>
        <div className="h-16 bg-slate-200 rounded-lg mt-3"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid="preset-error-state"
        role="alert"
        className={`p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-3 ${className}`}
      >
        <div>
          <p className="font-semibold text-rose-800">Unable to load curriculum presets</p>
          <p className="mt-0.5 text-rose-600">
            {(error as any)?.response?.data?.error || (error as Error)?.message || "Network error"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={disabled}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div
        data-testid="preset-no-class-notice"
        className={`p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center ${className}`}
      >
        Select a class above to see matching curriculum modules.
      </div>
    );
  }

  const eligiblePresets = presets.filter(
    (p) => isClassEligibleForPreset(selectedClass, p).eligible,
  );

  if (eligiblePresets.length === 0) {
    const firstPreset = presets[0];
    const eligibilityInfo = firstPreset
      ? isClassEligibleForPreset(selectedClass, firstPreset)
      : null;

    return (
      <div
        data-testid="preset-empty-state"
        className={`p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1 ${className}`}
      >
        <div className="flex items-center gap-1.5 font-bold text-amber-800">
          <span>ℹ️</span>
          <span>No matching curriculum presets for this class</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          {eligibilityInfo?.reason ||
            `No verified curriculum modules match ${selectedClass.name} (${selectedClass.grade}${
              selectedClass.curriculumBoard ? ` • ${selectedClass.curriculumBoard}` : ""
            }).`}
        </p>
        <p className="text-[11px] text-amber-700 font-medium pt-1">
          Tip: Select or create a <strong>Grade 1</strong> class with <strong>Karnataka State Board</strong> to use the visual sorting module.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} data-testid="curriculum-preset-selector">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-800">
          Select Verified Curriculum Module <span className="text-violet-600">*</span>
        </label>
        {selectedPresetId && (
          <button
            type="button"
            onClick={() => onSelectPreset(null)}
            disabled={disabled}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {eligiblePresets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <div
              key={preset.id}
              data-testid={`preset-card-${preset.id}`}
              onClick={() => {
                if (!disabled) {
                  onSelectPreset(isSelected ? null : preset);
                }
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-violet-50/80 border-violet-400 ring-2 ring-violet-500/20 shadow-xs"
                  : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
              } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Curriculum-aligned resource
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-100 text-violet-800">
                      {preset.subject} • Class {preset.grade}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
                      {preset.curriculumBoard}
                    </span>
                  </div>

                  {/* Title bilingual */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {preset.topicName}
                    </h4>
                    <p className="text-xs font-semibold text-violet-700 font-kannada mt-0.5">
                      {preset.kannadaTopicName}
                    </p>
                  </div>

                  {/* Textbook provenance inspection summary */}
                  <div className="pt-1 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>📖 {preset.textbook.title} ({preset.textbook.edition})</span>
                    <span>•</span>
                    <span>Chapter {preset.textbook.chapterNumber}, pp. {preset.textbook.printedPages}</span>
                  </div>
                </div>

                {/* Radio selection indicator */}
                <div className="pt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-violet-600 bg-violet-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CurriculumPresetSelector;
