import React from "react";
import type { ClassDTO } from "@teacher-ai/contracts";
import { ClassCard } from "./ClassCard";

interface ClassListProps {
  classes: ClassDTO[];
}

export const ClassList: React.FC<ClassListProps> = ({ classes }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {classes.map((classItem) => (
        <ClassCard key={classItem.id} classItem={classItem} />
      ))}
    </div>
  );
};
