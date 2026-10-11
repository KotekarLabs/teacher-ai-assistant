import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { workspaceNavItems, createNavItems } from "./navItems";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const previousPathname = useRef(location.pathname);

  // Close mobile navigation on route change (not on initial mount)
  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      previousPathname.current = location.pathname;
      if (isOpen) {
        onClose();
      }
    }
  }, [location.pathname, isOpen, onClose]);

  // Handle body scroll locking, focus capture & restoration
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus close button initially
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 20);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        previousActiveElement.current?.focus?.();
      };
    }
  }, [isOpen]);

  // Handle Escape key & Focus Trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusables = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => {
          if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") {
            return false;
          }
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        });

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        onClick={onClose}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center space-x-3.5 px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 active:scale-[0.99] select-none ${
          isActive
            ? "bg-violet-600 text-white font-semibold shadow-xs"
            : "text-slate-300 hover:bg-slate-900/90 active:bg-slate-900 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 md:hidden overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      data-testid="mobile-nav-dialog"
    >
      {/* Backdrop with touch dismiss */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid="mobile-nav-backdrop"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="fixed inset-y-0 left-0 flex flex-col w-72 max-w-[85vw] bg-[#0B1120] text-slate-100 shadow-2xl z-50 border-r border-slate-800/80 focus:outline-none overscroll-contain"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80 flex-shrink-0">
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
          {/* Accessible 44px close button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer inline-flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items with Touch-Friendly Targets */}
        <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto overscroll-contain">
          {/* Workspace Links */}
          <div>
            <span className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Workspace
            </span>
            <nav className="mt-2 space-y-1.5" aria-label="Mobile Workspace Links">
              {workspaceNavItems.map(renderNavLink)}
            </nav>
          </div>

          {/* Quick Create Links */}
          <div>
            <div className="px-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Create
              </span>
              <span className="text-[9px] font-medium text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-800/50 px-1.5 py-0.2 rounded-full">
                AI
              </span>
            </div>
            <nav className="mt-2 space-y-1.5" aria-label="Mobile Quick Create Links">
              {createNavItems.map(renderNavLink)}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between flex-shrink-0">
          <span>Teacher AI Monolith</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] border border-emerald-800/40">
            v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
