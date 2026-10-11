import { Card } from "../ui/Card";

export const FeaturesSection = () => {
  const pillars = [
    {
      title: "Structured Lesson Plans",
      tag: "5E Instructional Model",
      description:
        "Comprehensive lesson sequences including learning objectives, materials required, timed classroom activities, and ready-to-speak teacher scripts.",
      icon: (
        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      highlights: ["Timed breakdown", "Teacher prompts", "Vocabulary terms"],
    },
    {
      title: "Classroom Worksheets",
      tag: "Formatted with Marks",
      description:
        "Printable student practice sheets organized into tiered sections (Multiple Choice, Short Answer, Extended Problem Solving) with specific mark values.",
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      highlights: ["Total mark allocation", "Write-in lines", "Section A/B/C layout"],
    },
    {
      title: "Dual-Mode Quizzes",
      tag: "Student & Teacher Copies",
      description:
        "Diagnostic and formative assessments with dual output views: a clean exam sheet for students and an answer key with explanations for grading.",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      highlights: ["One-click answer toggle", "Solution explanations", "Distractor rationale"],
    },
    {
      title: "Homework Assignments",
      tag: "Independent Practice",
      description:
        "Focused take-home review questions tailored to reinforce class discussions, complete with parent guidance notes and estimated completion times.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      highlights: ["Time estimates", "Parent/guardian notes", "Review questions"],
    },
  ];

  return (
    <section id="generators" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
            Pedagogical Engine
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
            Four Purpose-Built Teaching Generators
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500">
            Built around standard lesson models and real classroom constraints, so you never receive unformatted generic paragraphs.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <Card
              key={p.title}
              elevated
              className="p-6 bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded inline-block mb-2">
                  {p.tag}
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
                {p.highlights.map((h) => (
                  <div key={h} className="flex items-center text-xs text-slate-600 gap-1.5">
                    <svg className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* 3-Step Workflow Section */}
        <div id="workflow" className="mt-24 pt-12 border-t border-slate-100">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Simple 3-Step Flow
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              From Topic to Handout in Under a Minute
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Choose Topic &amp; Class</h4>
              <p className="text-xs text-slate-500 mt-1">
                Select your subject, target grade level, and curriculum board preset.
              </p>
            </div>

            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Pedagogical Framing</h4>
              <p className="text-xs text-slate-500 mt-1">
                The generator structures objectives, timed activities, and mark allocations.
              </p>
            </div>

            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Edit, Print or Export</h4>
              <p className="text-xs text-slate-500 mt-1">
                Refine content directly in the editor, print clean copies, or save to your library.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
