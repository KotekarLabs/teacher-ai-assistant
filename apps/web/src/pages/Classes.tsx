import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../api/classes.api";
import { ClassList } from "../components/classes/ClassList";
import { ClassesEmptyState } from "../components/classes/ClassesEmptyState";

export default function Classes() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const classes = data?.classes || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Classes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your classrooms and teaching contexts
          </p>
        </div>
        <div>
          <Link
            to="/classes/new"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Class
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          role="status"
          aria-label="Loading classes"
          className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200"
        >
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading classes...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center"
        >
          <p className="text-sm font-semibold text-red-800 mb-2">
            Failed to load classes: {(error as any)?.response?.data?.error || "Unknown error"}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {classes.length === 0 ? (
            <ClassesEmptyState />
          ) : (
            <ClassList classes={classes} />
          )}
        </>
      )}
    </div>
  );
}
