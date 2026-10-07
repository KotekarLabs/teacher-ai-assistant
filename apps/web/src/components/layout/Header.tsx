import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Badge } from "../common/Badge";

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = profile?.displayName || user?.email || "Teacher";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button + Page Title */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleMobileNav}
            aria-label="Open navigation menu"
            aria-expanded={isMobileNavOpen}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Dashboard
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Daily Teaching Workspace
            </p>
          </div>
        </div>

        {/* Right Side: Identity & Actions */}
        <div className="flex items-center space-x-4">
          {/* Teacher Profile Snippet */}
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200 select-none"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 leading-none">
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
          </div>

          {/* Vertical Separator */}
          <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg
              className="w-4 h-4 mr-1.5 text-slate-500 group-hover:text-red-600"
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
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
