import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateClassSchema,
  type CreateClassRequest,
} from "@teacher-ai/contracts";

interface ClassFormProps {
  initialValues?: Partial<CreateClassRequest>;
  onSubmit: (data: CreateClassRequest) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Class",
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClassRequest>({
    resolver: zodResolver(CreateClassSchema),
    defaultValues: {
      name: initialValues?.name || "",
      grade: initialValues?.grade || "",
      section: initialValues?.section || "",
      curriculumBoard: initialValues?.curriculumBoard || "",
      academicYear: initialValues?.academicYear || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Class Name */}
      <div>
        <label
          htmlFor="class-name"
          className="block text-sm font-semibold text-slate-900 mb-1"
        >
          Class Name <span className="text-red-500">*</span>
        </label>
        <input
          id="class-name"
          {...register("name")}
          type="text"
          placeholder="e.g. Class 4 Mathematics"
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
            errors.name
              ? "border-red-300 focus:ring-red-500 bg-red-50/20"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Grade and Section row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="class-grade"
            className="block text-sm font-semibold text-slate-900 mb-1"
          >
            Grade / Year <span className="text-red-500">*</span>
          </label>
          <input
            id="class-grade"
            {...register("grade")}
            type="text"
            placeholder="e.g. 4 or Grade 4"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.grade
                ? "border-red-300 focus:ring-red-500 bg-red-50/20"
                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
            }`}
          />
          {errors.grade && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.grade.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="class-section"
            className="block text-sm font-semibold text-slate-900 mb-1"
          >
            Section <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="class-section"
            {...register("section")}
            type="text"
            placeholder="e.g. A or Blue"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {errors.section && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.section.message}
            </p>
          )}
        </div>
      </div>

      {/* Curriculum Board and Academic Year row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="class-board"
            className="block text-sm font-semibold text-slate-900 mb-1"
          >
            Curriculum Board{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="class-board"
            {...register("curriculumBoard")}
            type="text"
            placeholder="e.g. CBSE, ICSE, Cambridge"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {errors.curriculumBoard && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.curriculumBoard.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="class-academic-year"
            className="block text-sm font-semibold text-slate-900 mb-1"
          >
            Academic Year{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="class-academic-year"
            {...register("academicYear")}
            type="text"
            placeholder="e.g. 2026-27"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {errors.academicYear && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.academicYear.message}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 flex items-center"
        >
          {isSubmitting && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
