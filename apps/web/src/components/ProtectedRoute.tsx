import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AuthLoading: React.FC = () => (
  <div className="min-h-screen bg-[#FDFCF9] flex flex-col items-center justify-center p-4">
    <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center shadow-md animate-pulse mb-3 select-none">
      T
    </div>
    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
      <svg
        className="animate-spin h-4 w-4 text-violet-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Loading...</span>
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuthStore();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
};

export const OnboardingRoute = () => {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuthStore();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hasCompletedOnboarding) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
