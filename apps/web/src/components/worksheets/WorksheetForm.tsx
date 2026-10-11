import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenerateWorksheetRequestSchema,
  type GenerateWorksheetRequest,
  type QuestionType,
  type ClassDTO,
} from "@teacher-ai/contracts";

import { useAuthStore } from "../../store/authStore";

interface WorksheetFormProps {
  classes: ClassDTO[];
  initialClassId?: string;
  initialValues?: Partial<GenerateWorksheetRequest>;
  onSubmit: (data: GenerateWorksheetRequest) => void;
  isLoading?: boolean;
}

const ALL_QUESTION_TYPES: { id: QuestionType; label: string; desc: string }[] = [
  {
    id: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    desc: "4 options with single correct answer",
  },
  {
    id: "TRUE_FALSE",
    label: "True / False",
    desc: "Binary conceptual statements",
  },
  {
    id: "FILL_IN_THE_BLANK",
    label: "Fill in the Blank",
    desc: "Key terminology completion",
  },
  {
    id: "SHORT_ANSWER",
    label: "Short Answer",
    desc: "1-2 sentence concept explanations",
  },
  {
    id: "MATCH_THE_FOLLOWING",
    label: "Match the Following",
    desc: "Paired concept associations",
  },
];

export const WorksheetForm: React.FC<WorksheetFormProps> = ({
  classes,
  initialClassId,
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const profile = useAuthStore((s) => s.profile);

  const initialTypes: QuestionType[] =
    initialValues?.questionTypes && initialValues.questionTypes.length > 0
      ? initialValues.questionTypes
      : ["MULTIPLE_CHOICE", "SHORT_ANSWER"];

  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(initialTypes);
  const [typeError, setTypeError] = useState<string | null>(null);

  const chosenClass =
    classes.find((c) => c.id === (initialValues?.classId || initialClassId)) ||
    (classes.length > 0 ? classes[0] : undefined);
  const defaultBoard =
    initialValues?.curriculumBoard ??
    (chosenClass?.curriculumBoard || profile?.curriculumBoard || "");
  const defaultSubject =
    initialValues?.subject ??
    (profile?.subjects && profile.subjects.length > 0 ? profile.subjects[0] : "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateWorksheetRequest>({
    resolver: zodResolver(GenerateWorksheetRequestSchema) as any,
    defaultValues: {
      classId: initialValues?.classId || initialClassId || (chosenClass ? chosenClass.id : ""),
      subject: defaultSubject,
      topic: initialValues?.topic || "",
      questionCount: initialValues?.questionCount ?? 5,
      questionTypes: initialTypes,
      difficulty: initialValues?.difficulty || "MEDIUM",
      estimatedTimeMinutes: initialValues?.estimatedTimeMinutes ?? 30,
      curriculumBoard: defaultBoard,
      teacherInstructions: initialValues?.teacherInstructions || "",
    },
  });

  const selectedClassId = watch("classId");

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setValue("classId", cid);
    const cls = classes.find((c) => c.id === cid);
    if (cls && cls.curriculumBoard) {
      setValue("curriculumBoard", cls.curriculumBoard);
    } else if (profile?.curriculumBoard && !watch("curriculumBoard")) {
      setValue("curriculumBoard", profile.curriculumBoard);
    }
  };

  const handleTypeToggle = (type: QuestionType) => {
    let next: QuestionType[];
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) {
        setTypeError("At least one question type must be selected.");
        return;
      }
      setTypeError(null);
      next = selectedTypes.filter((t) => t !== type);
    } else {
      setTypeError(null);
      next = [...selectedTypes, type];
    }
    setSelectedTypes(next);
    setValue("questionTypes", next);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs"
      data-testid="worksheet-form"
    >
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
            data-testid="worksheet-class-select"
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white text-slate-900 text-sm transition-colors"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Grade {c.grade}
                {c.section ? ` - ${c.section}` : ""})
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            id="subject"
            data-testid="worksheet-subject-input"
            type="text"
            placeholder="e.g. Science, Mathematics, History"
            {...register("subject")}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors placeholder:text-slate-400"
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.subject.message}
            </p>
          )}
          {profile?.subjects && profile.subjects.length > 0 && (
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
          <label
            htmlFor="topic"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Topic / Chapter <span className="text-rose-500">*</span>
          </label>
          <input
            id="topic"
            data-testid="worksheet-topic-input"
            type="text"
            placeholder="e.g. Photosynthesis, Fractions, Solar System"
            {...register("topic")}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors placeholder:text-slate-400"
          />
          {errors.topic && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.topic.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="questionCount"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Number of Questions (1-30)
          </label>
          <input
            id="questionCount"
            data-testid="worksheet-question-count-input"
            type="number"
            min={1}
            max={30}
            {...register("questionCount", { valueAsNumber: true })}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors"
          />
          {errors.questionCount && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.questionCount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Difficulty Level
          </label>
          <select
            id="difficulty"
            data-testid="worksheet-difficulty-select"
            {...register("difficulty")}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white text-sm text-slate-900 transition-colors"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="estimatedTimeMinutes"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Estimated Time (Minutes)
          </label>
          <input
            id="estimatedTimeMinutes"
            data-testid="worksheet-time-input"
            type="number"
            min={5}
            max={180}
            {...register("estimatedTimeMinutes", { valueAsNumber: true })}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Question Types Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Question Types to Include <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_QUESTION_TYPES.map((qt) => {
            const isChecked = selectedTypes.includes(qt.id);
            return (
              <button
                key={qt.id}
                type="button"
                data-testid={`question-type-${qt.id}`}
                onClick={() => handleTypeToggle(qt.id)}
                disabled={isLoading}
                className={`p-3.5 rounded-xl border text-left transition-all min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isChecked
                    ? "border-violet-500 bg-violet-50/70 ring-1 ring-violet-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded pointer-events-none"
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {qt.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 ml-6.5">{qt.desc}</p>
              </button>
            );
          })}
        </div>
        {typeError && (
          <p
            role="alert"
            aria-live="polite"
            data-testid="question-types-error"
            className="mt-2.5 text-xs text-rose-600 font-semibold flex items-center space-x-1"
          >
            <span>⚠️</span>
            <span>{typeError}</span>
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="teacherInstructions"
          className="block text-xs font-semibold text-slate-800 mb-1.5"
        >
          Special Instructions (Optional)
        </label>
        <textarea
          id="teacherInstructions"
          data-testid="worksheet-instructions-input"
          rows={3}
          placeholder="e.g. Include word problems; provide real-world application questions."
          {...register("teacherInstructions")}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors placeholder:text-slate-400"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          data-testid="generate-worksheet-btn"
          disabled={isLoading || classes.length === 0}
          className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span>Generate Worksheet</span>
        </button>
      </div>
    </form>
  );
};
