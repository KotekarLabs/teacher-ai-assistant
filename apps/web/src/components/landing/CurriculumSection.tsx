import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const CurriculumSection = () => {
  const { isAuthenticated } = useAuthStore();

  const boards = [
    {
      name: "CBSE",
      desc: "Structured around experiential learning, chapter competencies, and standard marking schemes.",
    },
    {
      name: "ICSE",
      desc: "Deep conceptual coverage with rigorous vocabulary, detailed explanations, and comprehensive literature framing.",
    },
    {
      name: "Cambridge / IGCSE",
      desc: "Inquiry-led learning, command word rubrics (e.g. explain, evaluate, calculate), and international contexts.",
    },
    {
      name: "State Board",
      desc: "Direct syllabus alignment with regional textbook standards and foundational practice drills.",
    },
    {
      name: "IB (PYP / MYP)",
      desc: "Inquiry cycles, global contexts, criterion-referenced assessment rubrics, and learner profiles.",
    },
  ];

  return (
    <section id="curriculum" className="py-16 sm:py-24 bg-[#FDFCF9] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
            Profile Customization
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
            Tailored to Your Curriculum Board
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            Set your board in your teacher profile once. All generated lesson plans and assessments automatically follow the appropriate terminology and assessment style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {boards.map((b) => (
            <Card
              key={b.name}
              elevated
              className="p-5 bg-white border border-slate-200/80 shadow-xs"
            >
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
            </Card>
          ))}
          <Card
            elevated
            className="p-5 bg-violet-50/60 border border-violet-200/70 shadow-xs flex flex-col justify-center"
          >
            <h3 className="text-sm font-bold text-violet-950">Custom &amp; Private Tuition</h3>
            <p className="text-xs text-violet-800/80 mt-1">
              Select &quot;Other&quot; to adapt outputs for private coaching centers, tuition batches, or homeschool cohorts.
            </p>
          </Card>
        </div>

        {/* Final CTA Banner */}
        <div className="mt-16 max-w-4xl mx-auto bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to Streamline Your Lesson Preparation?
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Join teachers saving hours each week on lesson plans, printable worksheets, and quizzes.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="ai"
                  size="lg"
                  className="w-full sm:w-auto min-h-[44px] px-8 text-sm font-semibold"
                >
                  Return to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="ai"
                    size="lg"
                    className="w-full sm:w-auto min-h-[44px] px-8 text-sm font-semibold"
                  >
                    Create Free Teacher Account
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto min-h-[44px] px-6 text-sm font-medium bg-transparent text-slate-200 border-slate-700 hover:bg-slate-800"
                  >
                    Teacher Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
