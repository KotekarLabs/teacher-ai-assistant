import React from "react";
import { Link } from "react-router-dom";
import { useContentList } from "../../hooks/useContent";
import { EmptyState } from "../common/EmptyState";
import {
  getResourceDetailRoute,
  getResourceTypeLabel,
  getResourceTypeIcon,
  getResourceTypeColor,
} from "../../utils/resourceRoutes";

export const RecentResources: React.FC = () => {
  const { data, isLoading } = useContentList({
    pageSize: 4,
    sort: "updatedAt_desc",
  });

  const items = data?.items || [];

  return (
    <section aria-labelledby="recent-resources-heading" className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            id="recent-resources-heading"
            className="text-lg font-bold text-slate-900"
          >
            Recent Resources
          </h2>
          <p className="text-xs text-slate-500">
            Access and manage your recently generated teaching materials
          </p>
        </div>
        {items.length > 0 && (
          <Link
            to="/library"
            data-testid="view-all-library-btn"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
          >
            <span>View All in Library</span>
            <span className="ml-1">→</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading recent resources"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-2.5"
            >
              <div className="w-16 h-5 bg-slate-200 rounded-md" />
              <div className="w-3/4 h-4 bg-slate-200 rounded-md" />
              <div className="w-1/2 h-3 bg-slate-200 rounded-md" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No Teaching Resources Yet"
          description="Your generated lesson plans, worksheets, quizzes, and classroom resources will appear here once created."
          actionText="Create Lesson"
          actionDisabled={false}
          onAction={() => {
            window.location.href = "/create/lesson";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const typeColor = getResourceTypeColor(item.type);
            const detailRoute = getResourceDetailRoute(item.type, item.resourceId);
            const typeLabel = getResourceTypeLabel(item.type);
            const typeIcon = getResourceTypeIcon(item.type);

            return (
              <div
                key={item.id}
                data-testid={`recent-resource-item-${item.id}`}
                className="flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
                    >
                      <span>{typeIcon}</span>
                      <span>{typeLabel}</span>
                    </span>

                    {item.class && (
                      <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[90px]">
                        {item.class.name}
                      </span>
                    )}
                  </div>

                  <Link
                    to={detailRoute}
                    className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 block mb-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-500 truncate mb-3">
                    {item.subject} • {item.topic}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    to={detailRoute}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
