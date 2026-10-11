import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../api/classes.api";
import { ClassList } from "../components/classes/ClassList";
import { ClassesEmptyState } from "../components/classes/ClassesEmptyState";
import { Button } from "../components/ui/Button";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Classes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your classrooms and teaching contexts
          </p>
        </div>

        <div>
          <Link
            to="/classes/new"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-600 min-h-[44px]"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-3 min-h-[190px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-16 h-5 bg-slate-200 rounded-md" />
                <div className="w-12 h-5 bg-slate-100 rounded-md" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded-md mt-3" />
              <div className="w-1/2 h-4 bg-slate-100 rounded-md" />
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="w-20 h-3 bg-slate-100 rounded-md" />
                <div className="w-4 h-4 bg-slate-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center max-w-xl mx-auto space-y-3"
        >
          <p className="text-sm font-semibold text-rose-800">
            Failed to load classes: {(error as any)?.response?.data?.error || "Unknown error"}
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => refetch()}
            className="min-h-[40px]"
          >
            Retry
          </Button>
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
