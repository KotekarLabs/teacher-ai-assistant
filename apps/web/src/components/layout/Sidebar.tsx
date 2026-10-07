import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "./navItems";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-slate-900 text-slate-100 border-r border-slate-800 z-30"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-lg">
            T
          </div>
          <div>
            <span className="text-base font-bold text-white leading-none">
              Teacher AI
            </span>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Assistant Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          if (item.enabled) {
            return (
              <Link
                key={item.name}
                to={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          }

          return (
            <div
              key={item.name}
              aria-disabled="true"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed opacity-75 select-none"
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Soon
              </span>
            </div>
          );
        })}
      </nav>

      {/* Workspace Footer Indicator */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Teacher AI v1.0 Foundation
      </div>
    </aside>
  );
};
