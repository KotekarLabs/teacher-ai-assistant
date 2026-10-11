import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const HeroSection = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeQuizMode, setActiveQuizMode] = useState<"student" | "teacher">("student");

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 bg-[#FDFCF9]">
      {/* Decorative radial gradients */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-200/40 via-indigo-100/30 to-amber-100/20 blur-3xl rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-semibold mb-6 shadow-2xs select-none">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span>AI-Powered Educator Workspace</span>
          </div>

          {/* Main H1 Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Classroom-Ready Lessons, Worksheets & Quizzes in Seconds
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Teacher AI Assistant transforms curriculum topics into structured lesson plans with teacher prompts, formatted worksheets with mark allocations, and dual-mode quizzes tailored to your classroom.
          </p>

          {/* Primary Call to Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="ai"
                  size="lg"
                  className="w-full sm:w-auto min-h-[44px] px-8 text-base font-semibold shadow-md shadow-violet-500/20"
                >
                  Enter Teacher Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="ai"
                    size="lg"
                    className="w-full sm:w-auto min-h-[44px] px-8 text-base font-semibold shadow-md shadow-violet-500/20"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <a href="#generators" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto min-h-[44px] px-6 text-base font-medium text-slate-700 bg-white"
                  >
                    Explore Sample Outputs
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Multi-Board Support (CBSE, ICSE, Cambridge, IB, State)
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Dual-Mode Student & Teacher Keys
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Print-Ready Grayscale Formatting
            </span>
          </div>
        </div>

        {/* Live Dimensional Preview Cards */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Lesson Plan Sample */}
          <Card elevated className="p-5 bg-white border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                  Lesson Plan
                </span>
                <span className="text-xs text-slate-500 font-medium">45 min &bull; Grade 6</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                Photosynthesis & Energy Transfer
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                CBSE Science &bull; 5E Instructional Model (Engage, Explore, Explain)
              </p>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                  Teacher Script (Engage - 7 min):
                </div>
                <p className="text-slate-600 italic text-[11px] leading-relaxed">
                  &quot;Look at this wilted leaf compared to this vibrant green one. What did one receive that the other was deprived of?&quot;
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Objectives &amp; Rubric</span>
              <span className="text-emerald-600 font-semibold">Structured</span>
            </div>
          </Card>

          {/* Card 2: Dual-Mode Quiz Sample */}
          <Card elevated className="p-5 bg-white border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Dual-Mode Quiz
                </span>
                {/* Interactive Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveQuizMode("student")}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                      activeQuizMode === "student"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveQuizMode("teacher")}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                      activeQuizMode === "teacher"
                        ? "bg-violet-600 text-white shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Answer Key
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                Cellular Structure &amp; Organelles
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeQuizMode === "student"
                  ? "Student Assessment: Write-in answers only"
                  : "Teacher Key: Complete solutions & explanation"}
              </p>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="font-medium text-slate-800">
                  Q1: What organelle is the powerhouse of the cell?
                </div>
                {activeQuizMode === "student" ? (
                  <div className="h-6 border-b border-dashed border-slate-300 flex items-end text-[10px] text-slate-400">
                    Ans: _________________________
                  </div>
                ) : (
                  <div className="text-[11px] text-violet-800 font-semibold bg-violet-50 p-1.5 rounded border border-violet-200">
                    Ans: Mitochondria. Generates ATP via cellular respiration.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Mode: {activeQuizMode === "student" ? "Clean Exam" : "Teacher Solution"}</span>
              <span className="text-violet-700 font-semibold">Instant Toggle</span>
            </div>
          </Card>

          {/* Card 3: Formatted Worksheet Sample */}
          <Card elevated className="p-5 bg-white border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Worksheet
                </span>
                <span className="text-xs text-slate-500 font-medium">Total: 25 Marks</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                Fractions &amp; Mixed Numbers
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Section A (Multiple Choice) &bull; Section B (Word Problems)
              </p>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-700 font-medium text-[11px]">
                  <span>Part B: Application (5 Marks)</span>
                  <span className="text-slate-400">Tier 2</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Solve for x: A baker uses 3/4 kg flour per loaf. How many loaves can be baked with 9 kg?
                </p>
                <div className="h-4 border-b border-slate-200" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Sectional Layout</span>
              <span className="text-emerald-700 font-semibold">Mark Breakdown</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
