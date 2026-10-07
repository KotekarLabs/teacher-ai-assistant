import React from "react";
import { Link } from "react-router-dom";
import type { ClassDTO } from "@teacher-ai/contracts";
import { Badge } from "../common/Badge";

interface ClassCardProps {
  classItem: ClassDTO;
}

export const ClassCard: React.FC<ClassCardProps> = ({ classItem }) => {
  return (
    <Link
      to={`/classes/${classItem.id}`}
      className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="primary" className="font-semibold">
            Grade {classItem.grade}
          </Badge>
          {classItem.section && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Sec {classItem.section}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
          {classItem.name}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {classItem.curriculumBoard && (
            <Badge variant="neutral">{classItem.curriculumBoard}</Badge>
          )}
          {classItem.academicYear && (
            <Badge variant="secondary">{classItem.academicYear}</Badge>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>View Details</span>
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};
