import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClassById, archiveClass } from "../api/classes.api";
import { ArchiveClassDialog } from "../components/classes/ArchiveClassDialog";
import { Badge } from "../components/common/Badge";

export default function ClassDetails() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClassById(classId!),
    enabled: !!classId,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveClass(classId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
      navigate("/classes");
    },
  });

  const classItem = data?.class;

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading class details"
        className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 max-w-3xl mx-auto"
      >
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading class details...</p>
      </div>
    );
  }

  if (isError || !classItem) {
    return (
      <div
        role="alert"
        className="max-w-3xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-2">Class Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          {(error as any)?.response?.data?.error || "The requested class does not exist or you do not have permission to view it."}
        </p>
        <Link
          to="/classes"
          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Back to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <Link
          to="/classes"
          className="hover:text-slate-900 transition-colors flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Classes
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{classItem.name}</span>
      </div>

      {/* Class Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="primary" className="font-semibold text-sm py-1 px-3">
                Grade {classItem.grade}
              </Badge>
              {classItem.section && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Section {classItem.section}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {classItem.name}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Link
              to={`/create/lesson?classId=${classItem.id}`}
              data-testid="create-lesson-for-class-btn"
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <span>✨</span>
              <span className="ml-1.5">Create Lesson</span>
            </Link>
            <Link
              to={`/create/worksheet?classId=${classItem.id}`}
              data-testid="create-worksheet-for-class-btn"
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <span>📝</span>
              <span className="ml-1.5">Create Worksheet</span>
            </Link>
            <Link
              to={`/create/quiz?classId=${classItem.id}`}
              data-testid="create-quiz-for-class-btn"
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            >
              <span>❓</span>
              <span className="ml-1.5">Create Quiz</span>
            </Link>
            <Link
              to={`/classes/${classItem.id}/edit`}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Class
            </Link>
            <button
              type="button"
              onClick={() => setIsArchiveDialogOpen(true)}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Archive
            </button>
          </div>
        </div>

        {/* Structured Context Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Grade Level
            </span>
            <span className="text-base font-bold text-slate-900">
              Grade {classItem.grade}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Section
            </span>
            <span className="text-base font-bold text-slate-900">
              {classItem.section || "Not assigned"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Curriculum Board
            </span>
            <span className="text-base font-bold text-slate-900">
              {classItem.curriculumBoard || "Standard"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Academic Year
            </span>
            <span className="text-base font-bold text-slate-900">
              {classItem.academicYear || "Current"}
            </span>
          </div>
        </div>
      </div>

      {/* Archive Modal */}
      <ArchiveClassDialog
        isOpen={isArchiveDialogOpen}
        classNameTitle={classItem.name}
        onConfirm={() => archiveMutation.mutate()}
        onCancel={() => setIsArchiveDialogOpen(false)}
        isArchiving={archiveMutation.isPending}
      />
    </div>
  );
}
