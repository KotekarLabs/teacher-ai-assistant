import React from "react";
import { EmptyState } from "../common/EmptyState";

export const RecentResources: React.FC = () => {
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
      </div>

      <EmptyState
        title="No Teaching Resources Yet"
        description="Your generated lesson plans, worksheets, quizzes, and classroom resources will appear here once created."
        actionText="Create Resource"
        actionDisabled={true}
      />
    </section>
  );
};
