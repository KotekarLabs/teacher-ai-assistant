import React from "react";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "../common/Badge";

export const WelcomeBanner: React.FC = () => {
  const { user, profile } = useAuthStore();

  const displayName = profile?.displayName || user?.email || "Teacher";

  // Derive initial for decorative teacher avatar
  const initial = (profile?.displayName || user?.email || "T")
    .replace(/^Ms\.\s*|^Mr\.\s*|^Mrs\.\s*|^Dr\.\s*/i, "")
    .trim()
    .charAt(0)
    .toUpperCase() || "T";

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/60 to-violet-50/30 rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/80 shadow-xs"
      aria-labelledby="welcome-heading"
    >
      {/* Decorative ambient background blur */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-100/40 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          {/* Avatar medallion */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-xs select-none"
            aria-hidden="true"
          >
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200/70">
                Workspace
              </span>
              {profile?.curriculumBoard && (
                <Badge variant="primary">{profile.curriculumBoard} Board</Badge>
              )}
            </div>

            <h1
              id="welcome-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words"
            >
              Welcome, {displayName}
            </h1>

            <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl">
              {profile?.teachingRole
                ? `${profile.teachingRole} · Ready to prepare structured, classroom-ready materials.`
                : "Ready to prepare structured, classroom-ready materials."}
            </p>
          </div>
        </div>

        {/* Profile Context Chips */}
        {profile && (
          <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/70">
            {profile.subjects?.map((sub) => (
              <Badge key={sub} variant="neutral">
                {sub}
              </Badge>
            ))}
            {profile.experienceLevel && (
              <Badge variant="secondary">
                {profile.experienceLevel} exp
              </Badge>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
