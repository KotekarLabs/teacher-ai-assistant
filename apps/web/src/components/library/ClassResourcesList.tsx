import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { ContentDTO } from "@teacher-ai/contracts";
import {
  useContentList,
  useDuplicateContent,
  useArchiveContent,
} from "../../hooks/useContent";
import {
  getResourceDetailRoute,
  getResourceTypeLabel,
  getResourceTypeIcon,
  getResourceTypeColor,
} from "../../utils/resourceRoutes";
import { ContentArchiveDialog } from "./ContentArchiveDialog";

interface ClassResourcesListProps {
  classId: string;
}

export const ClassResourcesList: React.FC<ClassResourcesListProps> = ({
  classId,
}) => {
  const { data, isLoading, isError } = useContentList({
    classId,
    pageSize: 50,
    sort: "updatedAt_desc",
  });

  const duplicateMutation = useDuplicateContent();
  const archiveMutation = useArchiveContent();

  const [archiveTarget, setArchiveTarget] = useState<ContentDTO | null>(null);

  const items = data?.items || [];

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading class resources"
        className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-3"
      >
        <div className="w-32 h-5 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="p-6 bg-white rounded-2xl border border-rose-200 text-center text-xs text-rose-600 shadow-xs"
      >
        Failed to load class resources.
      </div>
    );
  }

  return (
    <section
      data-testid="class-resources-list"
      aria-labelledby="class-resources-heading"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="class-resources-heading"
            className="text-lg font-bold text-slate-900 tracking-tight"
          >
            Class Teaching Resources
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching materials specifically assigned to this class ({items.length})
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            No resources created for this class yet
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Use the creation buttons above to generate lesson plans, worksheets, quizzes, or homework tailored to this class.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {items.map((item) => {
            const typeColor = getResourceTypeColor(item.type);
            const detailRoute = getResourceDetailRoute(item.type, item.resourceId);
            const typeLabel = getResourceTypeLabel(item.type);
            const typeIcon = getResourceTypeIcon(item.type);
            const isDuplicatingThis = duplicateMutation.isPending && duplicateMutation.variables === item.id;

            return (
              <div
                key={item.id}
                data-testid={`class-resource-item-${item.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border flex-shrink-0 ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
                  >
                    <span aria-hidden="true">{typeIcon}</span>
                  </span>
                  <div className="overflow-hidden min-w-0">
                    <Link
                      to={detailRoute}
                      className="text-sm font-bold text-slate-900 hover:text-violet-700 transition-colors truncate block focus:outline-none focus-visible:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {typeLabel} • {item.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0 ml-3">
                  <Link
                    to={detailRoute}
                    className="px-2.5 py-1 text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/60 rounded-lg transition-colors min-h-[32px] flex items-center"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => duplicateMutation.mutate(item.id)}
                    disabled={duplicateMutation.isPending}
                    title="Duplicate"
                    aria-label={`Duplicate ${item.title}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                  >
                    {isDuplicatingThis ? (
                      <div className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveTarget(item)}
                    title="Archive"
                    aria-label={`Archive ${item.title}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Archive Modal */}
      {archiveTarget && (
        <ContentArchiveDialog
          isOpen={!!archiveTarget}
          resourceTitle={archiveTarget.title}
          resourceType={getResourceTypeLabel(archiveTarget.type)}
          onConfirm={() => {
            archiveMutation.mutate(archiveTarget.id, {
              onSuccess: () => setArchiveTarget(null),
            });
          }}
          onCancel={() => setArchiveTarget(null)}
          isArchiving={archiveMutation.isPending}
        />
      )}
    </section>
  );
};
