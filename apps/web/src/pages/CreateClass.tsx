import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateClassRequest } from "@teacher-ai/contracts";
import { createClass } from "../api/classes.api";
import { ClassForm } from "../components/classes/ClassForm";

export default function CreateClass() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      navigate(`/classes/${res.class.id}`);
    },
    onError: (err: any) => {
      setServerError(
        err?.response?.data?.error || "Failed to create class. Please check your inputs.",
      );
    },
  });

  const handleSubmit = async (data: CreateClassRequest) => {
    setServerError("");
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb / Back Link */}
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
        <span className="text-slate-900 font-medium">New Class</span>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create New Class
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Establish a persistent class context for organizing your lessons and materials
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
          onSubmit={handleSubmit}
          onCancel={() => navigate("/classes")}
          submitLabel="Create Class"
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
}
