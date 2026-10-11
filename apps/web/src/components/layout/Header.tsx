import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Badge } from "../common/Badge";
import { Button } from "../ui/Button";

interface HeaderProps {
  onToggleMobileNav: () => void;
  isMobileNavOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  isMobileNavOpen,
}) => {
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = profile?.displayName || user?.email || "Teacher";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "T";

  const getPageContext = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) {
      return { title: "Dashboard", subtitle: "Daily Teaching Overview" };
    }
    if (path.startsWith("/library")) {
      return { title: "Resource Library", subtitle: "Manage Teaching Materials" };
    }
    if (path.startsWith("/classes")) {
      return { title: "Classes", subtitle: "Rosters & Classroom Setup" };
    }
    if (path.startsWith("/create/lesson")) {
      return { title: "Lesson Generator", subtitle: "Structured Lesson Planning" };
    }
    if (path.startsWith("/create/worksheet")) {
      return { title: "Worksheet Generator", subtitle: "Classroom Exercises & Marks" };
    }
    if (path.startsWith("/create/quiz")) {
      return { title: "Quiz Generator", subtitle: "Dual-Mode Assessments" };
    }
    if (path.startsWith("/create/homework")) {
      return { title: "Homework Generator", subtitle: "Take-Home Assignment Preparation" };
    }
    if (path.startsWith("/lessons")) {
      return { title: "Lesson Plan", subtitle: "Resource Details" };
    }
    if (path.startsWith("/worksheets")) {
      return { title: "Worksheet", subtitle: "Resource Details" };
    }
    if (path.startsWith("/quizzes")) {
      return { title: "Quiz", subtitle: "Resource Details" };
    }
    if (path.startsWith("/homeworks")) {
      return { title: "Homework", subtitle: "Resource Details" };
    }
    if (path.startsWith("/profile")) {
      return { title: "Teacher Profile", subtitle: "Pedagogical Settings & Context" };
    }
    return { title: "Workspace", subtitle: "Teacher AI Assistant" };
  };

  const pageContext = getPageContext();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 shadow-xs w-full">
      <div className="flex items-center justify-between h-16 px-3 sm:px-6 lg:px-8 w-full max-w-full">
        {/* Left Side: Touch-Accessible Hamburger Button + Truncated Page Context */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
          <button
            type="button"
            onClick={onToggleMobileNav}
            aria-label="Open navigation menu"
            aria-expanded={isMobileNavOpen}
            className="md:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
              {pageContext.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
              {pageContext.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Identity & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Teacher Profile Snippet as accessible Link */}
          <Link
            to="/profile"
            aria-label="View teacher profile"
            className="flex items-center space-x-2 p-1.5 -m-1.5 rounded-xl hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer min-h-[44px]"
          >
            <div
              className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs border border-violet-200 select-none shadow-2xs flex-shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px] lg:max-w-none">
                {displayName}
              </span>
              {profile?.curriculumBoard && (
                <div className="mt-1">
                  <Badge variant="primary" className="text-[10px] py-0 px-1.5">
                    {profile.curriculumBoard}
                  </Badge>
                </div>
              )}
            </div>
          </Link>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

          {/* Logout Action using Button primitive with touch-friendly height */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="min-h-[40px] px-2.5 sm:px-3 text-xs"
            leftIcon={
              <svg
                className="w-3.5 h-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            }
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
