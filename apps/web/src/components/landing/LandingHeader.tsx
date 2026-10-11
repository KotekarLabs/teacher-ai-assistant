import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";

export const LandingHeader = () => {
  const { isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:bg-violet-700 transition-colors select-none">
              T
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none block">
                Teacher AI
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Assistant Workspace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Landing Navigation">
            <a
              href="#generators"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md py-1 px-2"
            >
              Generators
            </a>
            <a
              href="#workflow"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md py-1 px-2"
            >
              How It Works
            </a>
            <a
              href="#curriculum"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md py-1 px-2"
            >
              Curriculum Boards
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  variant="ai"
                  size="md"
                  className="min-h-[44px] px-5 font-semibold shadow-xs"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="md"
                    className="min-h-[44px] px-4 font-medium text-slate-700"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="ai"
                    size="md"
                    className="min-h-[44px] px-5 font-semibold shadow-xs"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open mobile menu"
              aria-expanded={isMobileMenuOpen}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 inline-flex items-center justify-center cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in"
          data-testid="landing-mobile-menu"
        >
          <nav className="flex flex-col space-y-2" aria-label="Mobile Landing Navigation">
            <a
              href="#generators"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px] flex items-center"
            >
              Generators
            </a>
            <a
              href="#workflow"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px] flex items-center"
            >
              How It Works
            </a>
            <a
              href="#curriculum"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px] flex items-center"
            >
              Curriculum Boards
            </a>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2.5">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ai" size="md" className="w-full min-h-[44px]">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ai" size="md" className="w-full min-h-[44px]">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full min-h-[44px]">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
