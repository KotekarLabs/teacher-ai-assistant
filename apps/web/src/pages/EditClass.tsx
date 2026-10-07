import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateClassRequest } from "@teacher-ai/contracts";
import { getClassById, updateClass } from "../api/classes.api";
import { ClassForm } from "../components/classes/ClassForm";

export default function EditClass() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string>("");

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

  const updateMutation = useMutation({
    mutationFn: (updateData: CreateClassRequest) =>
      updateClass(classId!, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
      navigate(`/classes/${classId}`);
    },
    onError: (err: any) => {
      setServerError(
        err?.response?.data?.error || "Failed to update class. Please check your inputs.",
      );
    },
  });

  const handleSubmit = async (formData: CreateClassRequest) => {
    setServerError("");
    await updateMutation.mutateAsync(formData);
  };

  const classItem = data?.class;

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading class for editing"
        className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 max-w-2xl mx-auto"
      >
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading class data...</p>
      </div>
    );
  }

  if (isError || !classItem) {
    return (
      <div
        role="alert"
        className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-2">Class Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          {(error as any)?.response?.data?.error || "The requested class does not exist or you do not have permission to edit it."}
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
    <div className="max-w-2xl mx-auto space-y-6">
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
        <Link
          to={`/classes/${classItem.id}`}
          className="hover:text-slate-900 transition-colors"
        >
          {classItem.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Edit</span>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Class
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update classroom information and curriculum attributes
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700"
          >
            {serverError}
          </div>
        )}

        <ClassForm
          initialValues={{
            name: classItem.name,
            grade: classItem.grade,
            section: classItem.section || "",
            curriculumBoard: classItem.curriculumBoard || "",
            academicYear: classItem.academicYear || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/classes/${classItem.id}`)}
          submitLabel="Save Changes"
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
