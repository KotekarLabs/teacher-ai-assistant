import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { ContentDTO, ContentSort, ContentType } from "@teacher-ai/contracts";
import {
  useContentList,
  useDuplicateContent,
  useArchiveContent,
} from "../hooks/useContent";
import { useClasses } from "../hooks/useClasses";
import { ContentSearch } from "../components/library/ContentSearch";
import { ContentFilters } from "../components/library/ContentFilters";
import { ContentSortSelector } from "../components/library/ContentSort";
import { ContentGrid } from "../components/library/ContentGrid";
import { ContentEmptyState } from "../components/library/ContentEmptyState";
import { ContentArchiveDialog } from "../components/library/ContentArchiveDialog";
import { getResourceTypeLabel } from "../utils/resourceRoutes";

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "ALL";
  const classId = searchParams.get("classId") || "";
  const status = searchParams.get("status") || "ACTIVE";
  const sort = (searchParams.get("sort") as ContentSort) || "updatedAt_desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Archive modal state
  const [archiveTarget, setArchiveTarget] = useState<ContentDTO | null>(null);

  // Helper to update search params
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || (key === "page" && val === "1") || (key === "type" && val === "ALL") || (key === "status" && val === "ACTIVE") || (key === "sort" && val === "updatedAt_desc")) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  // TanStack Query
  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      type: (type as any) || undefined,
      classId: classId || undefined,
      status: status === "ACTIVE" ? undefined : ((status as any) || undefined),
      sort,
      page,
      pageSize: 18,
    }),
    [search, type, classId, status, sort, page],
  );

  const { data, isLoading, isError } = useContentList(queryParams);
  const { data: classesData } = useClasses();
  const duplicateMutation = useDuplicateContent();
  const archiveMutation = useArchiveContent();

  const items = data?.items || [];
  const pagination = data?.pagination;

  const isSearchOrFiltered =
    Boolean(search.trim()) ||
    type !== "ALL" ||
    Boolean(classId) ||
    status === "ARCHIVED";

  const handleDuplicate = (item: ContentDTO) => {
    duplicateMutation.mutate(item.id);
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveMutation.mutate(archiveTarget.id, {
      onSuccess: () => {
        setArchiveTarget(null);
      },
    });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resource Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, manage, duplicate, and search all your generated teaching materials
          </p>
        </div>

        {/* Quick Generation Actions */}
        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
          <Link
            to="/create/lesson"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
          >
            <span>✨</span>
            <span className="ml-1.5">New Lesson</span>
          </Link>
          <Link
            to="/create/worksheet"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-sm"
          >
            <span>📝</span>
            <span className="ml-1.5">New Worksheet</span>
          </Link>
          <Link
            to="/create/quiz"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm"
          >
            <span>❓</span>
            <span className="ml-1.5">New Quiz</span>
          </Link>
          <Link
            to="/create/homework"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
          >
            <span>📚</span>
            <span className="ml-1.5">New Homework</span>
          </Link>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <ContentSearch
          value={search}
          onChange={(val) => updateParams({ search: val, page: "1" })}
        />
        <ContentSortSelector
          value={sort}
          onChange={(val) => updateParams({ sort: val, page: "1" })}
        />
      </div>

      {/* Filter Tabs & Selectors */}
      <ContentFilters
        selectedType={type}
        onTypeChange={(val) => updateParams({ type: val, page: "1" })}
        selectedClassId={classId}
        onClassChange={(val) => updateParams({ classId: val, page: "1" })}
        status={status}
        onStatusChange={(val) => updateParams({ status: val, page: "1" })}
        classes={classesData?.classes || []}
      />

      {/* Content Area */}
      {isError ? (
        <div
          role="alert"
          className="p-8 bg-white rounded-2xl border border-red-200 text-center space-y-3"
        >
          <p className="text-sm font-bold text-red-600">
            Failed to load resources from library.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            Retry
          </button>
        </div>
      ) : !isLoading && items.length === 0 ? (
        <ContentEmptyState
          isSearchOrFiltered={isSearchOrFiltered}
          isArchivedView={status === "ARCHIVED"}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <ContentGrid
          items={items}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(p) => updateParams({ page: p.toString() })}
          onDuplicate={handleDuplicate}
          onArchive={(item) => setArchiveTarget(item)}
          duplicatingId={duplicateMutation.isPending ? duplicateMutation.variables : null}
        />
      )}

      {/* Archive Modal */}
      {archiveTarget && (
        <ContentArchiveDialog
          isOpen={!!archiveTarget}
          resourceTitle={archiveTarget.title}
          resourceType={getResourceTypeLabel(archiveTarget.type as ContentType)}
          onConfirm={handleConfirmArchive}
          onCancel={() => setArchiveTarget(null)}
          isArchiving={archiveMutation.isPending}
        />
      )}
    </div>
  );
}
