import React from "react";
import { Link, useLocation } from "react-router-dom";
import { workspaceNavItems, createNavItems } from "./navItems";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const renderNavLink = (item: {
    name: string;
    href: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        to={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isActive
            ? "bg-violet-600 text-white font-semibold shadow-xs"
            : "text-slate-300 hover:bg-slate-900/90 hover:text-white"
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-[#0B1120] text-slate-100 border-r border-slate-800/80 z-30 select-none"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white font-bold text-sm shadow-xs shadow-violet-500/20">
            T
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight leading-none block">
              Teacher AI
            </span>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              Assistant Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Workspace Section */}
        <div>
          <span className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </span>
          <nav className="mt-2 space-y-1" aria-label="Workspace Links">
            {workspaceNavItems.map(renderNavLink)}
          </nav>
        </div>

        {/* Quick Create Section */}
        <div>
          <div className="px-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Create
            </span>
            <span className="text-[9px] font-medium text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-800/50 px-1.5 py-0.2 rounded-full">
              AI
            </span>
          </div>
          <nav className="mt-2 space-y-1" aria-label="Quick Create Links">
            {createNavItems.map(renderNavLink)}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Teacher AI Monolith</span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] border border-emerald-800/40">
          v1.0
        </span>
      </div>
    </aside>
  );
};
