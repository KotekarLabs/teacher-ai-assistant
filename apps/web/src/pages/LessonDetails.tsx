import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLessonById } from "../api/lessons.api";

export const LessonDetails: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const {
    data: lessonData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => getLessonById(lessonId!),
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading lesson plan...
      </div>
    );
  }

  if (error || !lessonData?.lesson) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-1">Lesson Not Found</h3>
        <p className="text-sm">
          The requested lesson could not be found or you do not have permission to access it.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg"
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
      {/* Header Bar */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              {lesson.subject}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
              ⏱ {lesson.durationMinutes} mins
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
              {lesson.difficulty}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {lesson.status}
            </span>
          </div>
          <h1
            data-testid="lesson-details-title"
            className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
          >
            {lesson.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Topic: {lesson.topic}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            data-testid="edit-lesson-btn"
            onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <span>✏️</span>
            <span>Edit Lesson</span>
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Overview */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Lesson Overview
          </h3>
          <p className="text-slate-700 leading-relaxed">{content.overview}</p>
        </section>

        {/* Learning Objectives & Prerequisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
              🎯 Learning Objectives
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {content.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-500">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              📋 Prerequisites
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
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Warmup & Introduction (Hook)
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            {content.introduction}
          </p>
        </section>

        {/* Teacher Explanation & Examples */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              📖 Teacher Explanation & Core Concepts
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {content.teacherExplanation}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Concrete Classroom Examples
            </h4>
            <div className="space-y-2">
              {content.examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100"
                >
                  <span className="font-semibold text-indigo-600 mr-2">
                    Example {i + 1}:
                  </span>
                  {ex}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classroom Activity */}
        <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              🎲 Interactive Classroom Activity
            </h3>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              ⏱ {content.classroomActivity.durationMinutes} mins
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">
            {content.classroomActivity.title}
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {content.classroomActivity.instructions}
          </p>
        </section>

        {/* Practice & Quick Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              📝 Guided & Independent Practice
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              {content.practice.map((item, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              ⚡ Quick Formative Assessment / Exit Ticket
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              {content.quickAssessment.map((item, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Homework & Teacher Script */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              🏠 Homework Assignment
            </h3>
            <p className="text-slate-700 text-sm">{content.homework}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              🗣 Teacher Talking Points Script
            </h3>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-line">
              {content.teacherScript}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
