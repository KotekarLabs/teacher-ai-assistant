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
      className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-violet-300 hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 min-h-[190px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <Badge variant="primary" className="font-semibold px-2.5 py-0.5 text-xs">
            Grade {classItem.grade}
          </Badge>
          {classItem.section && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
              Sec {classItem.section}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors mb-2.5 break-words">
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

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-violet-700">
        <span>View Details</span>
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all"
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
