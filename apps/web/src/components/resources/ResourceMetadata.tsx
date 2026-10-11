import React from "react";

export interface ResourceMetadataProps {
  type: string;
  subject: string;
  topic: string;
  className?: string | null;
  curriculumBoard?: string | null;
  difficulty?: string | null;
  durationMinutes?: number | null;
  estimatedTimeMinutes?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const ResourceMetadata: React.FC<ResourceMetadataProps> = ({
  type,
  subject,
  topic,
  className,
  curriculumBoard,
  difficulty,
  durationMinutes,
  estimatedTimeMinutes,
  status,
  createdAt,
  updatedAt,
}) => {
  const time = durationMinutes || estimatedTimeMinutes;

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
      data-testid="resource-metadata"
    >
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Resource Details & Metadata
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Type</span>
          <span className="text-slate-800 font-semibold">{type}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Subject</span>
          <span className="text-slate-800 font-semibold">{subject}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Topic</span>
          <span className="text-slate-800 font-semibold">{topic}</span>
        </div>
        {className && (
          <div>
            <span className="text-slate-400 block font-medium">Class</span>
            <span className="text-slate-800 font-semibold">{className}</span>
          </div>
        )}
        {curriculumBoard && (
          <div>
            <span className="text-slate-400 block font-medium">Curriculum Board</span>
            <span className="text-slate-800 font-semibold">{curriculumBoard}</span>
          </div>
        )}
        {difficulty && (
          <div>
            <span className="text-slate-400 block font-medium">Difficulty</span>
            <span className="text-slate-800 font-semibold">{difficulty}</span>
          </div>
        )}
        {time !== undefined && time !== null && (
          <div>
            <span className="text-slate-400 block font-medium">Estimated Time</span>
            <span className="text-slate-800 font-semibold">{time} mins</span>
          </div>
        )}
        <div>
          <span className="text-slate-400 block font-medium">Status</span>
          <span className="text-slate-800 font-semibold">{status}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Created</span>
          <span className="text-slate-600">{formatDate(createdAt)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Last Updated</span>
          <span className="text-slate-600">{formatDate(updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
