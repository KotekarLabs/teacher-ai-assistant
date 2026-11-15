import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenerateLessonRequestSchema,
  type GenerateLessonRequest,
  type ClassDTO,
  type CurriculumPresetSummary,
} from "@teacher-ai/contracts";

import { useAuthStore } from "../../store/authStore";
import {
  CurriculumPresetSelector,
  isClassEligibleForPreset,
} from "./CurriculumPresetSelector";

interface LessonFormProps {
  classes: ClassDTO[];
  initialClassId?: string;
  initialValues?: Partial<GenerateLessonRequest>;
  onSubmit: (data: GenerateLessonRequest) => void;
  isLoading?: boolean;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  classes,
  initialClassId,
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const profile = useAuthStore((s) => s.profile);

  const chosenClass =
    classes.find((c) => c.id === (initialValues?.classId || initialClassId)) ||
    (classes.length > 0 ? classes[0] : undefined);
  const defaultBoard =
    initialValues?.curriculumBoard ??
    (chosenClass?.curriculumBoard || profile?.curriculumBoard || "");
  const defaultSubject =
    initialValues?.subject ??
    (profile?.subjects && profile.subjects.length > 0 ? profile.subjects[0] : "");

  const [mode, setMode] = useState<"standard" | "curriculum">(
    initialValues?.curriculumTopicId ? "curriculum" : "standard",
  );
  const [selectedPreset, setSelectedPreset] = useState<CurriculumPresetSummary | null>(null);
  const [classChangeNotice, setClassChangeNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateLessonRequest>({
    resolver: zodResolver(GenerateLessonRequestSchema) as any,
    defaultValues: {
      classId: initialValues?.classId || initialClassId || (chosenClass ? chosenClass.id : ""),
      subject: defaultSubject,
      topic: initialValues?.topic || "",
      durationMinutes: initialValues?.durationMinutes ?? 40,
      difficulty: initialValues?.difficulty || "MEDIUM",
      curriculumBoard: defaultBoard,
      teacherInstructions: initialValues?.teacherInstructions || "",
      curriculumTopicId: initialValues?.curriculumTopicId || undefined,
    },
  });

  const selectedClassId = watch("classId");
  const currentClass = classes.find((c) => c.id === selectedClassId);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setValue("classId", cid);
    const newClass = classes.find((c) => c.id === cid);
    if (newClass && newClass.curriculumBoard) {
      setValue("curriculumBoard", newClass.curriculumBoard);
    } else if (profile?.curriculumBoard && !watch("curriculumBoard")) {
      setValue("curriculumBoard", profile.curriculumBoard);
    }

    // Enforce class change reaction: if preset is active, check eligibility with new class
    if (selectedPreset) {
      const eligibility = isClassEligibleForPreset(newClass, selectedPreset);
      if (!eligibility.eligible) {
        // Clear preset immediately and return to standard mode
        setSelectedPreset(null);
        setValue("curriculumTopicId", undefined);
        setMode("standard");
        setClassChangeNotice(
          `Curriculum preset was cleared because ${newClass?.name || "the newly selected class"} is not eligible: ${eligibility.reason}`,
        );
      }
    }
  };

  const handleModeSwitch = (newMode: "standard" | "curriculum") => {
    setMode(newMode);
    setClassChangeNotice(null);
    if (newMode === "standard") {
      // Clear preset and unlock fields
      setSelectedPreset(null);
      setValue("curriculumTopicId", undefined);
    }
  };

  const handlePresetSelect = (preset: CurriculumPresetSummary | null) => {
    setClassChangeNotice(null);
    if (!preset) {
      setSelectedPreset(null);
      setValue("curriculumTopicId", undefined);
      return;
    }

    setSelectedPreset(preset);
    setValue("curriculumTopicId", preset.id);
    setValue("subject", preset.subject, { shouldValidate: true });
    setValue("topic", preset.topicName, { shouldValidate: true });
    setValue("curriculumBoard", preset.curriculumBoard);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs"
      data-testid="lesson-form"
    >
      {/* 1. Class Selection */}
      <div>
        <label
          htmlFor="classId"
          className="block text-xs font-semibold text-slate-800 mb-1.5"
        >
          Select Class <span className="text-rose-500">*</span>
        </label>
        {classes.length === 0 ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-xl">
            No classes available. Please create a class first.
          </div>
        ) : (
          <select
            id="classId"
            data-testid="lesson-class-select"
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white text-slate-900 text-sm transition-colors cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Grade {c.grade}
                {c.section ? ` - ${c.section}` : ""}
                {c.curriculumBoard ? ` • ${c.curriculumBoard}` : ""})
              </option>
            ))}
          </select>
        )}
        {errors.classId && (
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {errors.classId.message}
          </p>
        )}
      </div>

      {/* Class Change Ineligibility Notice */}
      {classChangeNotice && (
        <div
          data-testid="class-change-notice"
          role="status"
          className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start justify-between gap-2"
        >
          <div className="flex items-start gap-1.5">
            <span className="text-amber-600">⚠️</span>
            <span>{classChangeNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setClassChangeNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2 cursor-pointer"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Generation Mode Selector Tabs */}
      <div className="pt-1">
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Lesson Planning Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <button
            type="button"
            data-testid="mode-standard-btn"
            disabled={isLoading}
            onClick={() => handleModeSwitch("standard")}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "standard"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📝</span>
            <span>Standard Lesson (Free Topic)</span>
          </button>
          <button
            type="button"
            data-testid="mode-curriculum-btn"
            disabled={isLoading}
            onClick={() => handleModeSwitch("curriculum")}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "curriculum"
                ? "bg-white text-violet-900 shadow-xs border border-violet-200 ring-1 ring-violet-500/20"
                : "text-slate-600 hover:text-violet-700"
            }`}
          >
            <span>🌟</span>
            <span>Curriculum-Aligned Visual Lesson</span>
          </button>
        </div>
      </div>

      {/* 3. Curriculum Preset Selector (Curriculum Mode Only) */}
      {mode === "curriculum" && (
        <div className="p-4 bg-violet-50/40 rounded-2xl border border-violet-100">
          <CurriculumPresetSelector
            selectedClass={currentClass}
            selectedPresetId={selectedPreset?.id}
            onSelectPreset={handlePresetSelect}
            disabled={isLoading}
          />
        </div>
      )}

      {/* 4. Subject & Topic Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="subject"
              className="block text-xs font-semibold text-slate-800"
            >
              Subject <span className="text-rose-500">*</span>
            </label>
            {selectedPreset && (
              <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">
                🔒 Preset defined
              </span>
            )}
          </div>
          <input
            id="subject"
            data-testid="lesson-subject-input"
            type="text"
            placeholder="e.g. Science, Mathematics, English"
            {...register("subject")}
            disabled={isLoading}
            readOnly={!!selectedPreset}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
              selectedPreset
                ? "bg-slate-100/90 border-slate-300 text-slate-700 cursor-not-allowed font-medium"
                : "border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 placeholder:text-slate-400 bg-white"
            }`}
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.subject.message}
            </p>
          )}
          {mode === "standard" && profile?.subjects && profile.subjects.length > 0 && (
            <div
              className="mt-2 flex flex-wrap items-center gap-1.5"
              data-testid="profile-subject-suggestions"
            >
              <span className="text-[11px] text-slate-400 select-none">Quick fill:</span>
              {profile.subjects.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setValue("subject", subj, { shouldValidate: true })}
                  className="inline-flex items-center text-xs px-2.5 py-1 min-h-[32px] rounded-lg border font-medium bg-slate-50 border-slate-200 text-slate-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-800 transition-colors cursor-pointer select-none"
                >
                  {subj}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="topic"
              className="block text-xs font-semibold text-slate-800"
            >
              Topic / Concept <span className="text-rose-500">*</span>
            </label>
            {selectedPreset && (
              <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">
                🔒 Preset defined
              </span>
            )}
          </div>
          <input
            id="topic"
            data-testid="lesson-topic-input"
            type="text"
            placeholder="e.g. The Water Cycle, Quadratic Equations"
            {...register("topic")}
            disabled={isLoading}
            readOnly={!!selectedPreset}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
              selectedPreset
                ? "bg-slate-100/90 border-slate-300 text-slate-700 cursor-not-allowed font-medium"
                : "border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 placeholder:text-slate-400 bg-white"
            }`}
          />
          {errors.topic && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.topic.message}
            </p>
          )}
        </div>
      </div>

      {/* 5. Duration, Difficulty, Curriculum Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="durationMinutes"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Duration (Minutes)
          </label>
          <input
            id="durationMinutes"
            data-testid="lesson-duration-input"
            type="number"
            min={15}
            max={180}
            {...register("durationMinutes", { valueAsNumber: true })}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors bg-white"
          />
          {errors.durationMinutes && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.durationMinutes.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Difficulty
          </label>
          <select
            id="difficulty"
            data-testid="lesson-difficulty-select"
            {...register("difficulty")}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white text-sm text-slate-900 transition-colors cursor-pointer"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="curriculumBoard"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Curriculum Board (Optional)
          </label>
          <input
            id="curriculumBoard"
            data-testid="lesson-curriculum-input"
            type="text"
            placeholder="e.g. CBSE, ICSE, Cambridge"
            {...register("curriculumBoard")}
            disabled={isLoading}
            readOnly={!!selectedPreset}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
              selectedPreset
                ? "bg-slate-100/90 border-slate-300 text-slate-700 cursor-not-allowed font-medium"
                : "border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 placeholder:text-slate-400 bg-white"
            }`}
          />
        </div>
      </div>

      {/* 6. Special Teacher Instructions */}
      <div>
        <label
          htmlFor="teacherInstructions"
          className="block text-xs font-semibold text-slate-800 mb-1.5"
        >
          Special Teacher Instructions (Optional)
        </label>
        <textarea
          id="teacherInstructions"
          data-testid="lesson-instructions-input"
          rows={3}
          placeholder="e.g. Include hands-on outdoor demonstration; focus on vocabulary words."
          {...register("teacherInstructions")}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors placeholder:text-slate-400 bg-white"
        />
      </div>

      {/* 7. Submit Action */}
      <div className="pt-2">
        <button
          type="submit"
          data-testid="generate-lesson-btn"
          disabled={isLoading || classes.length === 0}
          className={`w-full sm:w-auto px-8 py-3 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${
            selectedPreset
              ? "bg-violet-700 hover:bg-violet-800 active:bg-violet-900 focus-visible:ring-violet-500"
              : "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 focus-visible:ring-violet-500"
          }`}
        >
          <span>
            {selectedPreset
              ? "Generate Visual Lesson Plan (Bilingual Sorting)"
              : "Generate Lesson Plan"}
          </span>
        </button>
      </div>
    </form>
  );
};
export default LessonForm;
