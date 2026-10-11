import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateTeacherProfileSchema,
  type TeacherProfileDTO,
  type CreateTeacherProfileRequest,
} from "@teacher-ai/contracts";
import { useUpdateTeacherProfile } from "../../hooks/useTeacherProfile";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ProfileFormProps {
  initialProfile: TeacherProfileDTO;
}

const COMMON_SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Hindi",
  "History",
];

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile }) => {
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateMutation = useUpdateTeacherProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CreateTeacherProfileRequest>({
    resolver: zodResolver(CreateTeacherProfileSchema),
    defaultValues: {
      displayName: initialProfile.displayName || "",
      teachingRole: initialProfile.teachingRole || "Primary School Teacher",
      subjects: initialProfile.subjects || ["Mathematics"],
      curriculumBoard: initialProfile.curriculumBoard || "CBSE",
      experienceLevel: initialProfile.experienceLevel || "3-5 years",
      preferredLanguage: initialProfile.preferredLanguage || "English",
    },
  });

  // Keep form in sync if initialProfile changes from a fresh query
  useEffect(() => {
    reset({
      displayName: initialProfile.displayName || "",
      teachingRole: initialProfile.teachingRole || "Primary School Teacher",
      subjects: initialProfile.subjects || ["Mathematics"],
      curriculumBoard: initialProfile.curriculumBoard || "CBSE",
      experienceLevel: initialProfile.experienceLevel || "3-5 years",
      preferredLanguage: initialProfile.preferredLanguage || "English",
    });
  }, [initialProfile, reset]);

  const currentSubjects = watch("subjects") || [];

  const handleAddSubject = (subjectName: string) => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;

    const exists = currentSubjects.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      const updated = [...currentSubjects, trimmed];
      setValue("subjects", updated, { shouldValidate: true, shouldDirty: true });
    }
    setNewSubjectInput("");
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    const updated = currentSubjects.filter((s) => s !== subjectToRemove);
    setValue("subjects", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubject(newSubjectInput);
    }
  };

  const handleDiscard = () => {
    reset({
      displayName: initialProfile.displayName || "",
      teachingRole: initialProfile.teachingRole || "Primary School Teacher",
      subjects: initialProfile.subjects || ["Mathematics"],
      curriculumBoard: initialProfile.curriculumBoard || "CBSE",
      experienceLevel: initialProfile.experienceLevel || "3-5 years",
      preferredLanguage: initialProfile.preferredLanguage || "English",
    });
    setStatusMessage(null);
  };

  const onSubmit = async (data: CreateTeacherProfileRequest) => {
    try {
      setStatusMessage(null);
      await updateMutation.mutateAsync(data);
      setStatusMessage({
        type: "success",
        text: "Teacher profile updated successfully.",
      });
      // Reset dirty state to current saved values
      reset(data);
    } catch (err: any) {
      const errorText =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update profile. Please check your network and try again.";
      setStatusMessage({
        type: "error",
        text: errorText,
      });
    }
  };

  const isSaving = isSubmitting || updateMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pb-28"
      data-testid="profile-form"
      noValidate
    >
      {/* Status Announcement Banner */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
          data-testid="profile-status-message"
        >
          {statusMessage.type === "success" ? (
            <svg
              className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {statusMessage.text}
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1 -m-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Dismiss status message"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Section 1: Educator Identity */}
      <Card elevated className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Professional Identity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your name and primary teaching role used across class materials and resources.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              id="displayName"
              label="Display Name"
              placeholder="e.g. Ms. Sarah Jenkins"
              disabled={isSaving}
              error={errors.displayName?.message}
              className="min-h-[44px]"
              {...register("displayName")}
            />
          </div>

          <div>
            <Select
              id="teachingRole"
              label="Teaching Role"
              disabled={isSaving}
              error={errors.teachingRole?.message}
              className="min-h-[44px]"
              {...register("teachingRole")}
            >
              <option value="Primary School Teacher">Primary School Teacher</option>
              <option value="Middle School Teacher">Middle School Teacher</option>
              <option value="High School Teacher">High School Teacher</option>
              <option value="Subject Specialist">Subject Specialist</option>
              <option value="Tuition / Private Educator">Tuition / Private Educator</option>
              <option value="Head of Department">Head of Department</option>
              <option value="Instructional Coach">Instructional Coach</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Section 2: Pedagogical Context & Curriculum */}
      <Card elevated className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Pedagogical Context & Subjects
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your curriculum standards, teaching subjects, and instruction language.
          </p>
        </div>

        <div className="space-y-5">
          {/* Subjects Tag Editor */}
          <div>
            <label
              htmlFor="add-subject-input"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              Subjects Taught
            </label>

            {/* Selected Subject Chips */}
            <div
              className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50/70 border border-slate-200 rounded-xl mb-3"
              data-testid="selected-subjects-container"
              aria-label="Currently selected subjects"
            >
              {currentSubjects.length === 0 ? (
                <span className="text-xs text-slate-400 italic py-1 px-1">
                  No subjects selected. Please add at least one subject.
                </span>
              ) : (
                currentSubjects.map((subj) => (
                  <span
                    key={subj}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 border border-violet-200 text-violet-800 text-xs font-semibold rounded-lg shadow-2xs"
                  >
                    <span>{subj}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subj)}
                      disabled={isSaving}
                      aria-label={`Remove subject ${subj}`}
                      className="min-w-[28px] min-h-[28px] -mr-1 inline-flex items-center justify-center text-violet-600 hover:text-violet-900 hover:bg-violet-200/60 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))
              )}
            </div>

            {errors.subjects && (
              <p
                role="alert"
                className="mt-1 mb-2 text-xs text-rose-600 font-medium"
                data-testid="subjects-error"
              >
                {errors.subjects.message}
              </p>
            )}

            {/* Input to add new subject */}
            <div className="flex gap-2">
              <input
                id="add-subject-input"
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={handleSubjectKeyDown}
                placeholder="Type a subject name..."
                disabled={isSaving}
                className="flex-1 px-3.5 py-2 min-h-[44px] text-sm text-slate-900 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isSaving || !newSubjectInput.trim()}
                onClick={() => handleAddSubject(newSubjectInput)}
                className="min-h-[44px] px-4 text-xs font-semibold"
              >
                + Add Subject
              </Button>
            </div>

            {/* Quick add suggestion pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 select-none">
                Suggestions:
              </span>
              {COMMON_SUBJECT_SUGGESTIONS.map((suggestion) => {
                const isSelected = currentSubjects.some(
                  (s) => s.toLowerCase() === suggestion.toLowerCase(),
                );
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      isSelected
                        ? handleRemoveSubject(suggestion)
                        : handleAddSubject(suggestion)
                    }
                    disabled={isSaving}
                    className={`inline-flex items-center text-xs px-2.5 py-1 min-h-[32px] rounded-lg border font-medium transition-colors cursor-pointer select-none ${
                      isSelected
                        ? "bg-violet-100 border-violet-300 text-violet-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curriculum Board & Experience Level in responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                id="curriculumBoard"
                label="Curriculum Board"
                disabled={isSaving}
                error={errors.curriculumBoard?.message}
                className="min-h-[44px]"
                {...register("curriculumBoard")}
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="Cambridge / IGCSE">Cambridge / IGCSE</option>
                <option value="IB">IB</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <Select
                id="experienceLevel"
                label="Experience Level"
                disabled={isSaving}
                error={errors.experienceLevel?.message}
                className="min-h-[44px]"
                {...register("experienceLevel")}
              >
                <option value="0-2 years">0-2 years (Beginner)</option>
                <option value="3-5 years">3-5 years (Intermediate)</option>
                <option value="6-10 years">6-10 years (Experienced)</option>
                <option value="10+ years">10+ years (Senior)</option>
              </Select>
            </div>
          </div>

          <div>
            <Input
              id="preferredLanguage"
              label="Instruction Language"
              placeholder="e.g. English"
              disabled={isSaving}
              error={errors.preferredLanguage?.message}
              className="min-h-[44px]"
              {...register("preferredLanguage")}
            />
          </div>
        </div>
      </Card>

      {/* Sticky Bottom Save & Discard Bar */}
      <div
        className="fixed bottom-0 inset-x-0 md:left-64 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg p-3 sm:p-4 transition-all"
        data-testid="sticky-save-bar"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Dirty indicator */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 font-normal">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                All changes saved
              </span>
            )}
          </div>

          {/* Action buttons with 44px min height */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={!isDirty || isSaving}
              onClick={handleDiscard}
              className="flex-1 sm:flex-none min-h-[44px] px-4 text-xs sm:text-sm font-semibold"
            >
              Discard Changes
            </Button>

            <Button
              type="submit"
              variant="ai"
              size="md"
              isLoading={isSaving}
              disabled={!isDirty || isSaving}
              className="flex-1 sm:flex-none min-h-[44px] px-6 text-xs sm:text-sm font-semibold shadow-xs"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
