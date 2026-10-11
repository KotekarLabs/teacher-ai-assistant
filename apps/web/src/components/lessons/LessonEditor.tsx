import React from "react";
import type { LessonContent } from "@teacher-ai/contracts";

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
  const handleStringChange = (field: keyof LessonContent, value: string) => {
    onChange({
      ...content,
      [field]: value,
    });
  };

  const handleArrayItemChange = (
    field: "learningObjectives" | "prerequisites" | "examples" | "practice" | "quickAssessment",
    index: number,
    value: string,
  ) => {
    const list = [...content[field]];
    list[index] = value;
    onChange({
      ...content,
      [field]: list,
    });
  };

  const handleAddArrayItem = (
    field: "learningObjectives" | "prerequisites" | "examples" | "practice" | "quickAssessment",
  ) => {
    onChange({
      ...content,
      [field]: [...content[field], ""],
    });
  };

  const handleRemoveArrayItem = (
    field: "learningObjectives" | "prerequisites" | "examples" | "practice" | "quickAssessment",
    index: number,
  ) => {
    const list = content[field].filter((_, i) => i !== index);
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
