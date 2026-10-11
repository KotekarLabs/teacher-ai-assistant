import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonById, archiveLesson } from "../api/lessons.api";
import { downloadResourcePdf } from "../api/export.api";
import {
  ResourceHeader,
  ResourceActions,
  ResourceMetadata,
} from "../components/resources";

export const LessonDetails: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useEffect(() => {
    if (!showArchiveConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowArchiveConfirm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showArchiveConfirm]);

  const {
    data: lessonData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => getLessonById(lessonId!),
    enabled: !!lessonId,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveLesson(lessonId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      navigate("/dashboard");
    },
  });

  const handleExportPdf = async () => {
    if (!lessonData?.lesson) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadResourcePdf("lessons", lessonData.lesson.id);
    } catch {
      setExportError("We couldn't generate the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading lesson plan...
      </div>
    );
  }

  if (error || !lessonData?.lesson) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200" role="alert">
        <h3 className="font-bold text-lg mb-1">Lesson Not Found</h3>
        <p className="text-sm">
          The requested lesson could not be found or you do not have permission to access it.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl cursor-pointer min-h-[44px]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const lesson = lessonData.lesson;
  const content = lesson.content;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16" data-testid="lesson-details">
      {/* Export Error Alert */}
      {exportError && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between no-print"
        >
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-rose-500 hover:text-rose-800 ml-4 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <ResourceHeader
        title={lesson.title}
        type="LESSON"
        subject={lesson.subject}
        topic={lesson.topic}
        durationMinutes={lesson.durationMinutes}
        difficulty={lesson.difficulty}
        status={lesson.status}
        titleTestId="lesson-details-title"
        backTo="/library"
        backLabel="Back to Library"
        actions={
          <ResourceActions
            onEdit={() => navigate(`/lessons/${lesson.id}/edit`)}
            editLabel="Edit Lesson"
            editTestId="edit-lesson-btn"
            onExportPdf={handleExportPdf}
            isExporting={isExporting}
            exportTestId="export-pdf-btn"
            onPrint={() => window.print()}
            printTestId="print-btn"
            onArchive={() => setShowArchiveConfirm(true)}
            archiveTestId="archive-lesson-btn"
          />
        }
      />

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Overview */}
        <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Lesson Overview
          </h3>
          <p className="text-slate-800 leading-relaxed text-sm sm:text-base">{content.overview}</p>
        </section>

        {/* Learning Objectives & Prerequisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Learning Objectives</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-800">
              {content.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="font-bold text-violet-600">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📋</span>
              <span>Prerequisites</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {content.prerequisites.length > 0 ? (
                content.prerequisites.map((req, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-slate-400">✓</span>
                    <span>{req}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">None specified</li>
              )}
            </ul>
          </section>
        </div>

        {/* Warmup / Introduction */}
        <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Warmup & Introduction (Hook)
          </h3>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
            {content.introduction}
          </p>
        </section>

        {/* Teacher Explanation & Examples */}
        <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📖</span>
              <span>Teacher Explanation & Core Concepts</span>
            </h3>
            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
              {content.teacherExplanation}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Concrete Classroom Examples
            </h4>
            <div className="space-y-2.5">
              {content.examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-50/80 rounded-xl text-sm text-slate-800 border border-slate-100"
                >
                  <span className="font-semibold text-violet-700 mr-2">
                    Example {i + 1}:
                  </span>
                  {ex}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classroom Activity */}
        <section className="bg-violet-50/40 p-6 sm:p-7 rounded-2xl border border-violet-100/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎲</span>
              <span>Interactive Classroom Activity</span>
            </h3>
            <span className="text-xs font-semibold bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full">
              ⏱ {content.classroomActivity.durationMinutes} mins
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">
            {content.classroomActivity.title}
          </h4>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
            {content.classroomActivity.instructions}
          </p>
        </section>

        {/* Practice & Quick Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📝</span>
              <span>Guided & Independent Practice</span>
            </h3>
            <div className="space-y-2 text-sm text-slate-800">
              {content.practice.map((item, i) => (
                <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Quick Formative Assessment / Exit Ticket</span>
            </h3>
            <div className="space-y-2 text-sm text-slate-800">
              {content.quickAssessment.map((item, i) => (
                <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Homework & Teacher Script */}
        <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🏠</span>
              <span>Homework Assignment</span>
            </h3>
            <p className="text-slate-800 text-sm">{content.homework}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🗣</span>
              <span>Teacher Talking Points Script</span>
            </h3>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-line">
              {content.teacherScript}
            </div>
          </div>
        </section>

        {/* Standardized Metadata */}
        <ResourceMetadata
          type="LESSON PLAN"
          subject={lesson.subject}
          topic={lesson.topic}
          difficulty={lesson.difficulty}
          curriculumBoard={lesson.curriculumBoard}
          durationMinutes={lesson.durationMinutes}
          status={lesson.status}
          createdAt={lesson.createdAt}
          updatedAt={lesson.updatedAt}
        />
      </div>

      {/* Archive Modal */}
      {showArchiveConfirm && (
        <div
          data-testid="archive-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-lesson-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 no-print animate-fade-in"
          onClick={() => setShowArchiveConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="archive-lesson-dialog-title" className="text-lg font-bold text-slate-900">
              Archive Lesson?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This lesson will be archived and hidden from your main dashboard and class list. You can access it anytime in the library.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-archive-btn"
                disabled={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate()}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl cursor-pointer min-h-[44px]"
              >
                {archiveMutation.isPending ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LessonDetails;
