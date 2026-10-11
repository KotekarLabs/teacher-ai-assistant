import { Link } from "react-router-dom";

const CURRENT_YEAR = new Date().getFullYear();

export const LandingFooter = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white font-bold text-sm flex items-center justify-center select-none shadow-xs">
              T
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight leading-none block">
                Teacher AI
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Assistant Workspace
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs" aria-label="Footer Navigation">
            <a href="#generators" className="hover:text-white transition-colors">
              Generators
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#curriculum" className="hover:text-white transition-colors">
              Curriculum Boards
            </a>
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/signup" className="hover:text-white transition-colors">
              Sign Up
            </Link>
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {CURRENT_YEAR} Teacher AI Assistant. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
              Modular Monolith v1.0
            </span>
            <span className="text-slate-400">Educator Workspace</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
