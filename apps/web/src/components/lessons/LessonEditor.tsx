import React from "react";
import type {
  LessonContent,
  LessonPacingBreakdown,
} from "@teacher-ai/contracts";
import {
  CanonicalVectorGraphic,
  CurriculumProvenanceCard,
} from "../visual";

interface LessonEditorProps {
  content: LessonContent;
  onChange: (updated: LessonContent) => void;
  disabled?: boolean;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  content,
  onChange,
  disabled = false,
}) => {
  const isVisualLesson =
    content.visualExplanation?.format === "SORTING_DIAGRAM";
  const visual = content.visualExplanation;

  const handleVisualFieldChange = (
    field: "teacherGuidance" | "instructions" | "kannadaInstructions",
    value: string,
  ) => {
    if (!content.visualExplanation) return;
    if (field === "teacherGuidance") {
      onChange({
        ...content,
        visualExplanation: {
          ...content.visualExplanation,
          teacherGuidance: value,
        },
      });
    } else {
      onChange({
        ...content,
        visualExplanation: {
          ...content.visualExplanation,
          sortingActivity: {
            ...content.visualExplanation.sortingActivity,
            [field]: value,
          },
        },
      });
    }
  };

  const handleItemObservationChange = (
    itemId: string,
    field: "contextualObservation" | "kannadaObservation",
    value: string,
  ) => {
    if (!content.visualExplanation) return;
    const updatedItems = content.visualExplanation.sortingActivity.items.map(
      (item) => (item.id === itemId ? { ...item, [field]: value } : item),
    );
    onChange({
      ...content,
      visualExplanation: {
        ...content.visualExplanation,
        sortingActivity: {
          ...content.visualExplanation.sortingActivity,
          items: updatedItems,
        },
      },
    });
  };

  const handleStringChange = (field: keyof LessonContent, value: string) => {
    onChange({
      ...content,
      [field]: value,
    });
  };

  const handleArrayItemChange = (
    field:
      | "learningObjectives"
      | "prerequisites"
      | "examples"
      | "practice"
      | "quickAssessment"
      | "materials",
    index: number,
    value: string,
  ) => {
    const list = content[field] ? [...(content[field] as string[])] : [];
    list[index] = value;
    onChange({
      ...content,
      [field]: list,
    });
  };

  const handleAddArrayItem = (
    field:
      | "learningObjectives"
      | "prerequisites"
      | "examples"
      | "practice"
      | "quickAssessment"
      | "materials",
  ) => {
    const list = content[field] ? [...(content[field] as string[])] : [];
    onChange({
      ...content,
      [field]: [...list, ""],
    });
  };

  const handleRemoveArrayItem = (
    field:
      | "learningObjectives"
      | "prerequisites"
      | "examples"
      | "practice"
      | "quickAssessment"
      | "materials",
    index: number,
  ) => {
    const currentList = content[field]
      ? [...(content[field] as string[])]
      : [];
    const list = currentList.filter((_, i) => i !== index);
    onChange({
      ...content,
      [field]: list,
    });
  };

  const handleActivityChange = (
    subField: "title" | "instructions" | "durationMinutes",
    value: any,
  ) => {
    onChange({
      ...content,
      classroomActivity: {
        ...content.classroomActivity,
        [subField]: value,
      },
    });
  };

  const handleDifferentiationChange = (
    subField: "support" | "extension",
    value: string,
  ) => {
    onChange({
      ...content,
      differentiation: {
        support: content.differentiation?.support ?? "",
        extension: content.differentiation?.extension ?? "",
        [subField]: value,
      },
    });
  };

  const handlePacingChange = (
    subField: keyof LessonPacingBreakdown,
    value: number,
  ) => {
    const current = content.pacingBreakdown ?? {
      introductionMinutes: 5,
      directInstructionMinutes: 15,
      activityMinutes: content.classroomActivity?.durationMinutes ?? 10,
      practiceMinutes: 10,
      assessmentMinutes: 5,
    };
    onChange({
      ...content,
      pacingBreakdown: {
        ...current,
        [subField]: Math.max(0, value || 0),
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="lesson-editor">
      {/* Title & Overview */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Lesson Header & Overview
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Lesson Title
          </label>
          <input
            type="text"
            data-testid="editor-title-input"
            value={content.title}
            disabled={disabled}
            onChange={(e) => handleStringChange("title", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-base focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Overview
          </label>
          <textarea
            rows={2}
            data-testid="editor-overview-input"
            value={content.overview}
            disabled={disabled}
            onChange={(e) => handleStringChange("overview", e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
          />
        </div>
      </section>

      {/* Learning Objectives */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-lg font-bold text-slate-900">
            Learning Objectives
          </h3>
          <button
            type="button"
            data-testid="add-objective-btn"
            disabled={disabled}
            onClick={() => handleAddArrayItem("learningObjectives")}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer p-1"
          >
            + Add Objective
          </button>
        </div>
        <div className="space-y-2.5">
          {content.learningObjectives.map((obj, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
              <input
                type="text"
                data-testid={`editor-objective-${i}`}
                value={obj}
                disabled={disabled}
                onChange={(e) =>
                  handleArrayItemChange("learningObjectives", i, e.target.value)
                }
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
              <button
                type="button"
                disabled={disabled || content.learningObjectives.length <= 1}
                onClick={() => handleRemoveArrayItem("learningObjectives", i)}
                className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-2 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                aria-label={`Remove objective ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Dedicated Visual Teaching & Sorting Board Section (Curriculum-Aligned Visual Lessons) */}
      {isVisualLesson && visual && (
        <section
          data-testid="editor-visual-section"
          className="bg-[#FCFBF7] p-6 sm:p-7 rounded-2xl border border-amber-200/80 shadow-xs space-y-6"
        >
          {/* Section Header */}
          <div className="border-b border-amber-200/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎨</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Visual Teaching Assistant & Sorting Board
                </h3>
              </div>
              <p className="text-xs font-semibold text-violet-700 font-kannada mt-0.5">
                ದೃಶ್ಯ ಬೋಧನಾ ಸಹಾಯಕ ಮತ್ತು ವಿಂಗಡಣೆ ಬೋರ್ಡ್
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              ✓ Karnataka State Board Aligned
            </span>
          </div>

          {/* Security & Immutability Notice */}
          <div
            data-testid="editor-visual-security-notice"
            className="p-3.5 bg-amber-50/90 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5 leading-relaxed"
          >
            <span className="text-base">🔒</span>
            <div>
              <strong className="font-bold">
                Curriculum-Aligned Resource — Canonical Properties Protected:
              </strong>{" "}
              Canonical object IDs, names, shape categories, rolling/sliding characteristics, and official curriculum provenance citations are protected from modification. You may freely customize teacher guidance, instructions, and classroom observations.
            </div>
          </div>

          {/* Teacher Guidance Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Teacher Guidance / Pedagogical Prompts</span>
              <span className="text-[11px] font-normal text-slate-500 font-kannada">
                ಬೋಧನಾ ಮಾರ್ಗದರ್ಶನ
              </span>
            </label>
            <textarea
              rows={3}
              data-testid="editor-visual-guidance"
              value={visual.teacherGuidance}
              disabled={disabled}
              onChange={(e) =>
                handleVisualFieldChange("teacherGuidance", e.target.value)
              }
              placeholder="e.g. Prompt students to roll and slide each object on their desks before placing it on the board..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors leading-relaxed"
            />
          </div>

          {/* Activity Instructions (Bilingual) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Activity Instructions (English)
              </label>
              <textarea
                rows={3}
                data-testid="editor-visual-instructions"
                value={visual.sortingActivity.instructions}
                disabled={disabled}
                onChange={(e) =>
                  handleVisualFieldChange("instructions", e.target.value)
                }
                placeholder="Instructions for students during the sorting activity..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-kannada">
                ಸೂಚನೆಗಳು (ಕನ್ನಡ / Kannada)
              </label>
              <textarea
                rows={3}
                data-testid="editor-visual-kannada-instructions"
                value={visual.sortingActivity.kannadaInstructions || ""}
                disabled={disabled}
                onChange={(e) =>
                  handleVisualFieldChange("kannadaInstructions", e.target.value)
                }
                placeholder="ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಸೂಚನೆಗಳು..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors leading-relaxed font-kannada"
              />
            </div>
          </div>

          {/* Canonical Objects Catalogue (8 Objects — Canonical Properties Locked, Observations Editable) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Canonical Sorting Objects (8 Curriculum Items)
                </h4>
                <p className="text-xs text-slate-500">
                  Objects and physical classifications are fixed. Contextual observations can be adapted for your classroom.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                🔒 8 Locked Canonical Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visual.sortingActivity.items.map((item) => (
                <div
                  key={item.id}
                  data-testid={`editor-visual-item-${item.id}`}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                >
                  {/* Canonical Item Header with Graphic & Locked Metadata */}
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 flex-shrink-0">
                      <CanonicalVectorGraphic
                        id={item.id}
                        size={40}
                        title={item.nameEnglish}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {item.nameEnglish}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.shapeCategory === "LONG"
                            ? "📏 LONG"
                            : item.shapeCategory === "ROUND"
                            ? "⚽ ROUND"
                            : "🔄 MULTI-PERSPECTIVE"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-violet-700 font-kannada">
                        {item.nameKannada}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span>
                          {item.rolls && item.slides
                            ? "Rolls & Slides"
                            : item.rolls
                            ? "Rolls only"
                            : "Slides only"}
                        </span>
                        <span>•</span>
                        <span className="text-amber-800 font-medium">
                          🔒 Canonical
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editable Observations */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Classroom Observation (English)
                      </label>
                      <input
                        type="text"
                        data-testid={`editor-obs-en-${item.id}`}
                        value={item.contextualObservation || ""}
                        disabled={disabled}
                        onChange={(e) =>
                          handleItemObservationChange(
                            item.id,
                            "contextualObservation",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Long cylindrical shape..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-kannada">
                        ತರಗತಿ ವೀಕ್ಷಣೆ (ಕನ್ನಡ / Kannada)
                      </label>
                      <input
                        type="text"
                        data-testid={`editor-obs-kn-${item.id}`}
                        value={item.kannadaObservation || ""}
                        disabled={disabled}
                        onChange={(e) =>
                          handleItemObservationChange(
                            item.id,
                            "kannadaObservation",
                            e.target.value,
                          )
                        }
                        placeholder="ಉದಾ. ನೆಲದ ಮೇಲೆ ಜಾರುತ್ತದೆ..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-kannada"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protected Curriculum Provenance Reference */}
          <div className="pt-2">
            <CurriculumProvenanceCard provenance={visual.provenance} />
          </div>
        </section>
      )}

      {/* Prerequisites & Hook */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Warmup & Prerequisites
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Introduction / Warmup Hook
          </label>
          <textarea
            rows={3}
            data-testid="editor-introduction-input"
            value={content.introduction}
            disabled={disabled}
            onChange={(e) => handleStringChange("introduction", e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Prerequisites
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleAddArrayItem("prerequisites")}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer p-1"
            >
              + Add Prerequisite
            </button>
          </div>
          <div className="space-y-2.5">
            {content.prerequisites.map((req, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={req}
                  disabled={disabled}
                  onChange={(e) =>
                    handleArrayItemChange("prerequisites", i, e.target.value)
                  }
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveArrayItem("prerequisites", i)}
                  className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                  aria-label={`Remove prerequisite ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Materials */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-lg font-bold text-slate-900">
            Required Materials & Equipment
          </h3>
          <button
            type="button"
            data-testid="editor-add-material-btn"
            disabled={disabled}
            onClick={() => handleAddArrayItem("materials")}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer min-h-[44px] px-3 flex items-center rounded-lg hover:bg-violet-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            + Add Material
          </button>
        </div>
        {!content.materials || content.materials.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            No specific materials listed. Click "+ Add Material" to list handouts, lab equipment, or tools.
          </p>
        ) : (
          <div className="space-y-2.5">
            {content.materials.map((mat, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  data-testid={`editor-material-${i}`}
                  value={mat}
                  disabled={disabled}
                  onChange={(e) =>
                    handleArrayItemChange("materials", i, e.target.value)
                  }
                  placeholder="e.g. Whiteboard markers, Student lab kits, Handouts..."
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
                />
                <button
                  type="button"
                  data-testid={`editor-remove-material-${i}`}
                  disabled={disabled}
                  onClick={() => handleRemoveArrayItem("materials", i)}
                  className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label={`Remove material ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Teacher Explanation & Examples */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Core Teaching & Examples
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Teacher Explanation / Concept Breakdown
          </label>
          <textarea
            rows={5}
            data-testid="editor-explanation-input"
            value={content.teacherExplanation}
            disabled={disabled}
            onChange={(e) =>
              handleStringChange("teacherExplanation", e.target.value)
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors leading-relaxed"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Concrete Examples
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleAddArrayItem("examples")}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer p-1"
            >
              + Add Example
            </button>
          </div>
          <div className="space-y-2.5">
            {content.examples.map((ex, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  data-testid={`editor-example-${i}`}
                  value={ex}
                  disabled={disabled}
                  onChange={(e) =>
                    handleArrayItemChange("examples", i, e.target.value)
                  }
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
                />
                <button
                  type="button"
                  disabled={disabled || content.examples.length <= 1}
                  onClick={() => handleRemoveArrayItem("examples", i)}
                  className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                  aria-label={`Remove example ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classroom Activity */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Classroom Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Activity Title
            </label>
            <input
              type="text"
              data-testid="editor-activity-title"
              value={content.classroomActivity.title}
              disabled={disabled}
              onChange={(e) =>
                handleActivityChange("title", e.target.value)
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              data-testid="editor-activity-duration"
              value={content.classroomActivity.durationMinutes}
              disabled={disabled}
              onChange={(e) =>
                handleActivityChange(
                  "durationMinutes",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Activity Instructions
          </label>
          <textarea
            rows={3}
            data-testid="editor-activity-instructions"
            value={content.classroomActivity.instructions}
            disabled={disabled}
            onChange={(e) =>
              handleActivityChange("instructions", e.target.value)
            }
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors leading-relaxed"
          />
        </div>
      </section>

      {/* Lesson Pacing Breakdown */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Lesson Pacing Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phase-by-phase time budgeting across the total lesson duration.
            </p>
          </div>
          {content.pacingBreakdown && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-100">
              Total Phase Sum:{" "}
              {(content.pacingBreakdown.introductionMinutes || 0) +
                (content.pacingBreakdown.directInstructionMinutes || 0) +
                (content.pacingBreakdown.activityMinutes || 0) +
                (content.pacingBreakdown.practiceMinutes || 0) +
                (content.pacingBreakdown.assessmentMinutes || 0)}{" "}
              mins
            </div>
          )}
        </div>

        {!content.pacingBreakdown ? (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-slate-500 italic">
              Phase pacing breakdown not set for this lesson.
            </p>
            <button
              type="button"
              data-testid="editor-enable-pacing-btn"
              disabled={disabled}
              onClick={() =>
                handlePacingChange(
                  "activityMinutes",
                  content.classroomActivity?.durationMinutes || 10,
                )
              }
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer min-h-[44px] px-3 flex items-center rounded-lg hover:bg-violet-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              + Configure Pacing Breakdown
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Introduction
              </label>
              <input
                type="number"
                min="0"
                data-testid="editor-pacing-intro"
                value={content.pacingBreakdown.introductionMinutes}
                disabled={disabled}
                onChange={(e) =>
                  handlePacingChange(
                    "introductionMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Direct Instruction
              </label>
              <input
                type="number"
                min="0"
                data-testid="editor-pacing-direct"
                value={content.pacingBreakdown.directInstructionMinutes}
                disabled={disabled}
                onChange={(e) =>
                  handlePacingChange(
                    "directInstructionMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Activity
              </label>
              <input
                type="number"
                min="0"
                data-testid="editor-pacing-activity"
                value={content.pacingBreakdown.activityMinutes}
                disabled={disabled}
                onChange={(e) =>
                  handlePacingChange(
                    "activityMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Practice
              </label>
              <input
                type="number"
                min="0"
                data-testid="editor-pacing-practice"
                value={content.pacingBreakdown.practiceMinutes}
                disabled={disabled}
                onChange={(e) =>
                  handlePacingChange(
                    "practiceMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Assessment
              </label>
              <input
                type="number"
                min="0"
                data-testid="editor-pacing-assessment"
                value={content.pacingBreakdown.assessmentMinutes}
                disabled={disabled}
                onChange={(e) =>
                  handlePacingChange(
                    "assessmentMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
              />
            </div>
          </div>
        )}
      </section>

      {/* Practice & Quick Assessment */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Practice & Quick Assessment
        </h3>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Guided & Independent Practice
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleAddArrayItem("practice")}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer p-1"
            >
              + Add Practice Item
            </button>
          </div>
          <div className="space-y-2.5">
            {content.practice.map((pr, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={pr}
                  disabled={disabled}
                  onChange={(e) =>
                    handleArrayItemChange("practice", i, e.target.value)
                  }
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveArrayItem("practice", i)}
                  className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                  aria-label={`Remove practice item ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Quick Formative Assessment / Exit Questions
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleAddArrayItem("quickAssessment")}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer p-1"
            >
              + Add Question
            </button>
          </div>
          <div className="space-y-2.5">
            {content.quickAssessment.map((qa, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={qa}
                  disabled={disabled}
                  onChange={(e) =>
                    handleArrayItemChange("quickAssessment", i, e.target.value)
                  }
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors text-slate-900"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveArrayItem("quickAssessment", i)}
                  className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                  aria-label={`Remove assessment question ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation & Accommodations */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Differentiation & Classroom Accommodations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-sky-800 uppercase tracking-wider">
              Scaffolding & Support (Emerging Learners / ELL)
            </label>
            <textarea
              rows={3}
              data-testid="editor-diff-support"
              value={content.differentiation?.support ?? ""}
              disabled={disabled}
              onChange={(e) =>
                handleDifferentiationChange("support", e.target.value)
              }
              placeholder="e.g. Sentence frames, graphic organizers, paired peer support, chunked tasks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-colors leading-relaxed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-purple-800 uppercase tracking-wider">
              Extension & Challenge (Advanced Learners / Fast Finishers)
            </label>
            <textarea
              rows={3}
              data-testid="editor-diff-extension"
              value={content.differentiation?.extension ?? ""}
              disabled={disabled}
              onChange={(e) =>
                handleDifferentiationChange("extension", e.target.value)
              }
              placeholder="e.g. Open-ended inquiry questions, hypothesis design, real-world case analysis..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* Homework & Teacher Script */}
      <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          Homework & Teacher Talking Points
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Homework Assignment
          </label>
          <textarea
            rows={2}
            data-testid="editor-homework-input"
            value={content.homework}
            disabled={disabled}
            onChange={(e) => handleStringChange("homework", e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Teacher Talking Points / In-Class Script
          </label>
          <textarea
            rows={4}
            data-testid="editor-script-input"
            value={content.teacherScript}
            disabled={disabled}
            onChange={(e) => handleStringChange("teacherScript", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors font-mono leading-relaxed"
          />
        </div>
      </section>
    </div>
  );
};
