import React from "react";
import type { TeacherProfileDTO } from "@teacher-ai/contracts";
import { Badge } from "../common/Badge";

interface ProfileHeaderProps {
  profile: TeacherProfileDTO | null;
  email?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  email,
}) => {
  const displayName = profile?.displayName || "Teacher";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "T";

  const memberSince = React.useMemo(() => {
    if (!profile?.createdAt) return null;
    try {
      const d = new Date(profile.createdAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [profile]);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs mb-6 sm:mb-8 transition-all"
      data-testid="profile-header-card"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
        {/* Large Avatar */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-violet-500/20 select-none flex-shrink-0"
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Educator Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {profile?.teachingRole || "Educator"}
              </p>
            </div>

            {/* Read-only Member Since badge */}
            {memberSince && (
              <div className="self-center sm:self-start">
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60 font-medium">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Joined {memberSince}
                </span>
              </div>
            )}
          </div>

          {/* Metadata badges row */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {email && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate max-w-[220px]">{email}</span>
              </span>
            )}

            {profile?.curriculumBoard && (
              <Badge variant="primary" className="text-xs py-1 px-2.5">
                {profile.curriculumBoard} Board
              </Badge>
            )}

            {profile?.experienceLevel && (
              <Badge variant="neutral" className="text-xs py-1 px-2.5">
                {profile.experienceLevel} exp
              </Badge>
            )}

            {profile?.preferredLanguage && (
              <Badge variant="neutral" className="text-xs py-1 px-2.5">
                {profile.preferredLanguage}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
