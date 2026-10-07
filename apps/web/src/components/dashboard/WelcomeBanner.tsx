import React from "react";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "../common/Badge";

export const WelcomeBanner: React.FC = () => {
  const { user, profile } = useAuthStore();

  const displayName = profile?.displayName || user?.email || "Teacher";

  return (
    <section
      className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm"
      aria-labelledby="welcome-heading"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Workspace
            </span>
            {profile?.curriculumBoard && (
              <Badge variant="primary">{profile.curriculumBoard} Board</Badge>
            )}
          </div>
          <h1
            id="welcome-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
          >
            Welcome, {displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {profile?.teachingRole
              ? `${profile.teachingRole} · Ready to prepare structured, classroom-ready materials.`
              : "Ready to prepare structured, classroom-ready materials."}
          </p>
        </div>

        {/* Profile Context Chips */}
        {profile && (
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
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
