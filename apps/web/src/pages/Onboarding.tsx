import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateTeacherProfileSchema,
  type CreateTeacherProfileRequest,
} from "@teacher-ai/contracts";
import { createTeacherProfile } from "../api/teacher.api";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Complete Teacher Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tell us about your teaching role so we can personalize your workspace.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          data-testid="onboarding-form"
        >
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Display Name
            </label>
            <input
              id="displayName"
              {...register("displayName")}
              placeholder="e.g. Ms. Sarah Jenkins"
              className="border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              type="text"
            />
            {errors.displayName && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.displayName.message}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="teachingRole"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Teaching Role
            </label>
            <select
              id="teachingRole"
              {...register("teachingRole")}
              className="border border-slate-300 rounded-lg p-2.5 w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Primary School Teacher">
                Primary School Teacher
              </option>
              <option value="Middle School Teacher">
                Middle School Teacher
              </option>
              <option value="High School Teacher">High School Teacher</option>
              <option value="Subject Specialist">Subject Specialist</option>
              <option value="Tuition / Private Educator">
                Tuition / Private Educator
              </option>
            </select>
            {errors.teachingRole && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.teachingRole.message}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="subjects"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Subjects Taught (comma separated)
            </label>
            <input
              id="subjects"
              value={subjectsText}
              onChange={(e) => handleSubjectsChange(e.target.value)}
              placeholder="e.g. Mathematics, Science, English"
              className="border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              type="text"
            />
            {errors.subjects && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.subjects.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="curriculumBoard"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Curriculum Board
              </label>
              <select
                id="curriculumBoard"
                {...register("curriculumBoard")}
                className="border border-slate-300 rounded-lg p-2.5 w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="Cambridge / IGCSE">Cambridge / IGCSE</option>
                <option value="IB">IB</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Experience Level
              </label>
              <select
                id="experienceLevel"
                {...register("experienceLevel")}
                className="border border-slate-300 rounded-lg p-2.5 w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="0-2 years">0-2 years (Beginner)</option>
                <option value="3-5 years">3-5 years (Intermediate)</option>
                <option value="6-10 years">6-10 years (Experienced)</option>
                <option value="10+ years">10+ years (Senior)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="preferredLanguage"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Preferred Language
            </label>
            <input
              id="preferredLanguage"
              {...register("preferredLanguage")}
              placeholder="e.g. English"
              className="border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              type="text"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
