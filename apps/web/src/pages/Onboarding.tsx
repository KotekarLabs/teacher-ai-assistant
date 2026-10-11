import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateTeacherProfileSchema,
  type CreateTeacherProfileRequest,
} from "@teacher-ai/contracts";
import { createTeacherProfile } from "../api/teacher.api";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const COMMON_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Hindi"];

export default function Onboarding() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [error, setError] = useState("");
  const [subjectsText, setSubjectsText] = useState("Mathematics, Science");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeacherProfileRequest>({
    resolver: zodResolver(CreateTeacherProfileSchema),
    defaultValues: {
      displayName: "",
      teachingRole: "Primary School Teacher",
      subjects: ["Mathematics", "Science"],
      curriculumBoard: "CBSE",
      experienceLevel: "3-5 years",
      preferredLanguage: "English",
    },
  });

  const handleSubjectsChange = (text: string) => {
    setSubjectsText(text);
    const parsed = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setValue("subjects", parsed, { shouldValidate: true });
  };

  const handleQuickAddSubject = (subject: string) => {
    const currentList = subjectsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedList: string[];
    if (currentList.some((s) => s.toLowerCase() === subject.toLowerCase())) {
      updatedList = currentList.filter(
        (s) => s.toLowerCase() !== subject.toLowerCase(),
      );
    } else {
      updatedList = [...currentList, subject];
    }

    const newText = updatedList.join(", ");
    handleSubjectsChange(newText);
  };

  const currentSubjectList = subjectsText
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const onSubmit = async (data: CreateTeacherProfileRequest) => {
    try {
      setError("");
      const res = await createTeacherProfile(data);
      setProfile(res.profile);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to complete profile setup. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCF9] py-10 px-4 sm:px-6 lg:px-8 selection:bg-violet-100 selection:text-violet-900">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-violet-500/20 mb-3 select-none">
            T
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200/60">
            Step 1 of 1 &bull; Personalization
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
            Complete Teacher Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1.5">
            Tell us about your teaching role so we can personalize your workspace, curriculum boards, and AI generators.
          </p>
        </div>

        {/* Form Card */}
        <Card elevated className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md">
          {error && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <svg
                className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0"
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
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            data-testid="onboarding-form"
            noValidate
          >
            {/* Section 1: Educator Identity */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Educator Identity
                </h2>
              </div>

              <div>
                <Input
                  id="displayName"
                  label="Display Name"
                  placeholder="e.g. Ms. Sarah Jenkins"
                  disabled={isSubmitting}
                  error={errors.displayName?.message}
                  className="min-h-[44px]"
                  {...register("displayName")}
                />
              </div>

              <div>
                <Select
                  id="teachingRole"
                  label="Teaching Role"
                  disabled={isSubmitting}
                  error={errors.teachingRole?.message}
                  className="min-h-[44px]"
                  {...register("teachingRole")}
                >
                  <option value="Primary School Teacher">Primary School Teacher</option>
                  <option value="Middle School Teacher">Middle School Teacher</option>
                  <option value="High School Teacher">High School Teacher</option>
                  <option value="Subject Specialist">Subject Specialist</option>
                  <option value="Tuition / Private Educator">Tuition / Private Educator</option>
                </Select>
              </div>
            </div>

            {/* Section 2: Curriculum & Subjects */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subjects & Curriculum
                </h2>
              </div>

              <div>
                <label
                  htmlFor="subjects"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Subjects Taught (comma separated)
                </label>
                <input
                  id="subjects"
                  value={subjectsText}
                  onChange={(e) => handleSubjectsChange(e.target.value)}
                  placeholder="e.g. Mathematics, Science, English"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.subjects)}
                  aria-describedby={errors.subjects ? "subjects-error" : undefined}
                  className={`w-full px-3.5 py-2 min-h-[44px] text-sm text-slate-900 bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none ${
                    errors.subjects
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20"
                  }`}
                  type="text"
                />
                {errors.subjects && (
                  <p
                    id="subjects-error"
                    role="alert"
                    className="mt-1 text-xs text-rose-600 font-medium"
                  >
                    {errors.subjects.message}
                  </p>
                )}

                {/* Subject Quick Add Chips */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1 select-none">Quick add:</span>
                  {COMMON_SUBJECTS.map((subj) => {
                    const isSelected = currentSubjectList.includes(subj.toLowerCase());
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => handleQuickAddSubject(subj)}
                        className={`inline-flex items-center text-xs px-2.5 py-1 min-h-[32px] rounded-lg border font-medium transition-colors cursor-pointer select-none ${
                          isSelected
                            ? "bg-violet-100 border-violet-300 text-violet-800"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Responsive Grid for Board and Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Select
                    id="curriculumBoard"
                    label="Curriculum Board"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  label="Preferred Language"
                  placeholder="e.g. English"
                  disabled={isSubmitting}
                  error={errors.preferredLanguage?.message}
                  className="min-h-[44px]"
                  {...register("preferredLanguage")}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="ai"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full min-h-[44px] text-sm font-semibold shadow-xs"
              >
                {isSubmitting ? "Setting up..." : "Complete Setup & Continue"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Teacher AI Assistant &bull; Secure Monolith Architecture
        </p>
      </div>
    </main>
  );
}
