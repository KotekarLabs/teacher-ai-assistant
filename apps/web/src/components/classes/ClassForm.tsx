import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateClassSchema,
  type CreateClassRequest,
} from "@teacher-ai/contracts";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

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
        <Input
          id="class-name"
          label="Class Name *"
          placeholder="e.g. Class 4 Mathematics"
          error={errors.name?.message}
          disabled={isSubmitting}
          {...register("name")}
        />
      </div>

      {/* Grade and Section row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id="class-grade"
            label="Grade / Year *"
            placeholder="e.g. 4 or Grade 4"
            error={errors.grade?.message}
            disabled={isSubmitting}
            {...register("grade")}
          />
        </div>

        <div>
          <Input
            id="class-section"
            label="Section (optional)"
            placeholder="e.g. A or Blue"
            error={errors.section?.message}
            disabled={isSubmitting}
            {...register("section")}
          />
        </div>
      </div>

      {/* Curriculum Board and Academic Year row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id="class-board"
            label="Curriculum Board (optional)"
            placeholder="e.g. CBSE, ICSE, Cambridge"
            error={errors.curriculumBoard?.message}
            disabled={isSubmitting}
            {...register("curriculumBoard")}
          />
        </div>

        <div>
          <Input
            id="class-academic-year"
            label="Academic Year (optional)"
            placeholder="e.g. 2026-27"
            error={errors.academicYear?.message}
            disabled={isSubmitting}
            {...register("academicYear")}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200/80">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[44px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="ai"
          isLoading={isSubmitting}
          className="w-full sm:w-auto min-h-[44px]"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
