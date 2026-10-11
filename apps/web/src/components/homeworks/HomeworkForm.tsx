import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenerateHomeworkRequestSchema,
  type GenerateHomeworkRequest,
  type HomeworkTaskType,
  type ClassDTO,
} from "@teacher-ai/contracts";

interface HomeworkFormProps {
  classes: ClassDTO[];
  initialClassId?: string;
  onSubmit: (data: GenerateHomeworkRequest) => void;
  isLoading?: boolean;
}

const ALL_HOMEWORK_TASK_TYPES: { id: HomeworkTaskType; label: string; desc: string }[] = [
  {
    id: "PRACTICE",
    label: "Practice Questions",
    desc: "Targeted practice exercises and problem sets",
  },
  {
    id: "WRITTEN",
    label: "Written Work",
    desc: "Paragraph explanations, summaries, or essays",
  },
  {
    id: "ACTIVITY",
    label: "Hands-on Activity",
    desc: "Practical exploration or real-world observation",
  },
  {
    id: "CREATIVE",
    label: "Creative Task",
    desc: "Drawing, diagram labeling, or poster design",
  },
  {
    id: "SHORT_ANSWER",
    label: "Short Answer",
    desc: "Quick conceptual questions and checks",
  },
];

export const HomeworkForm: React.FC<HomeworkFormProps> = ({
  classes,
  initialClassId,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<HomeworkTaskType[]>([
    "PRACTICE",
    "SHORT_ANSWER",
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateHomeworkRequest>({
    resolver: zodResolver(GenerateHomeworkRequestSchema) as any,
    defaultValues: {
      classId: initialClassId || (classes.length > 0 ? classes[0].id : ""),
      subject: "",
      topic: "",
      taskCount: 3,
      taskTypes: ["PRACTICE", "SHORT_ANSWER"],
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 30,
      curriculumBoard: "",
      teacherInstructions: "",
    },
  });

  const selectedClassId = watch("classId");

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setValue("classId", cid);
    const cls = classes.find((c) => c.id === cid);
    if (cls && cls.curriculumBoard) {
      setValue("curriculumBoard", cls.curriculumBoard);
    }
  };

  const handleTypeToggle = (type: HomeworkTaskType) => {
    let next: HomeworkTaskType[];
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) return; // Keep at least one
      next = selectedTypes.filter((t) => t !== type);
    } else {
      next = [...selectedTypes, type];
    }
    setSelectedTypes(next);
    setValue("taskTypes", next);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs"
      data-testid="homework-form"
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
            data-testid="homework-class-select"
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
            data-testid="homework-subject-input"
            type="text"
            placeholder="e.g. Science, Mathematics, English"
            {...register("subject")}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors placeholder:text-slate-400"
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.subject.message}
            </p>
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
            data-testid="homework-topic-input"
            type="text"
            placeholder="e.g. Water Cycle, Quadratic Equations, Renewable Energy"
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
            htmlFor="taskCount"
            className="block text-xs font-semibold text-slate-800 mb-1.5"
          >
            Number of Tasks (1-20)
          </label>
          <input
            id="taskCount"
            data-testid="homework-task-count-input"
            type="number"
            min={1}
            max={20}
            {...register("taskCount", { valueAsNumber: true })}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors"
          />
          {errors.taskCount && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.taskCount.message}
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
            data-testid="homework-difficulty-select"
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
            Estimated Time (5-180 Mins)
          </label>
          <input
            id="estimatedTimeMinutes"
            data-testid="homework-duration-input"
            type="number"
            min={5}
            max={180}
            {...register("estimatedTimeMinutes", { valueAsNumber: true })}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors"
          />
          {errors.estimatedTimeMinutes && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.estimatedTimeMinutes.message}
            </p>
          )}
        </div>
      </div>

      {/* Task Preferences Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Task Types to Include <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_HOMEWORK_TASK_TYPES.map((tt) => {
            const isChecked = selectedTypes.includes(tt.id);
            return (
              <button
                key={tt.id}
                type="button"
                data-testid={`task-type-${tt.id}`}
                onClick={() => handleTypeToggle(tt.id)}
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
                    {tt.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 ml-6.5">{tt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="teacherInstructions"
          className="block text-xs font-semibold text-slate-800 mb-1.5"
        >
          Special Teacher Instructions (Optional)
        </label>
        <textarea
          id="teacherInstructions"
          data-testid="homework-instructions-input"
          rows={3}
          placeholder="e.g. Focus on real-life applications; keep materials simple."
          {...register("teacherInstructions")}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm text-slate-900 transition-colors placeholder:text-slate-400"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          data-testid="generate-homework-btn"
          disabled={isLoading || classes.length === 0}
          className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span>Generate Homework</span>
        </button>
      </div>
    </form>
  );
};
