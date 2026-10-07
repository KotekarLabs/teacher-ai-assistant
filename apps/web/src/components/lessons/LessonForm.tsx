import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GenerateLessonRequestSchema,
  type GenerateLessonRequest,
  type ClassDTO,
} from "@teacher-ai/contracts";

interface LessonFormProps {
  classes: ClassDTO[];
  initialClassId?: string;
  onSubmit: (data: GenerateLessonRequest) => void;
  isLoading?: boolean;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  classes,
  initialClassId,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateLessonRequest>({
    resolver: zodResolver(GenerateLessonRequestSchema) as any,
    defaultValues: {
      classId: initialClassId || (classes.length > 0 ? classes[0].id : ""),
      subject: "",
      topic: "",
      durationMinutes: 40,
      difficulty: "MEDIUM",
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm"
      data-testid="lesson-form"
    >
      <div>
        <label
          htmlFor="classId"
          className="block text-sm font-semibold text-slate-700 mb-1"
        >
          Select Class <span className="text-red-500">*</span>
        </label>
        {classes.length === 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg">
            No classes available. Please create a class first.
          </div>
        ) : (
          <select
            id="classId"
            data-testid="lesson-class-select"
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
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
          <p className="mt-1 text-sm text-red-600">
            {errors.classId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            data-testid="lesson-subject-input"
            type="text"
            placeholder="e.g. Science, Mathematics, English"
            {...register("subject")}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            Topic / Concept <span className="text-red-500">*</span>
          </label>
          <input
            id="topic"
            data-testid="lesson-topic-input"
            type="text"
            placeholder="e.g. The Water Cycle, Quadratic Equations"
            {...register("topic")}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.topic && (
            <p className="mt-1 text-sm text-red-600">
              {errors.topic.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="durationMinutes"
            className="block text-sm font-semibold text-slate-700 mb-1"
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
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.durationMinutes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.durationMinutes.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            Difficulty
          </label>
          <select
            id="difficulty"
            data-testid="lesson-difficulty-select"
            {...register("difficulty")}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="curriculumBoard"
            className="block text-sm font-semibold text-slate-700 mb-1"
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
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="teacherInstructions"
          className="block text-sm font-semibold text-slate-700 mb-1"
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
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          data-testid="generate-lesson-btn"
          disabled={isLoading || classes.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
        >
          <span>Generate Lesson Plan</span>
        </button>
      </div>
    </form>
  );
};
