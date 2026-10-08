import type { ContentType } from "@teacher-ai/contracts";

export const getResourceDetailRoute = (
  type: ContentType,
  resourceId: string,
): string => {
  switch (type) {
    case "LESSON":
      return `/lessons/${resourceId}`;
    case "WORKSHEET":
      return `/worksheets/${resourceId}`;
    case "QUIZ":
      return `/quizzes/${resourceId}`;
    case "HOMEWORK":
      return `/homeworks/${resourceId}`;
    default:
      return `/dashboard`;
  }
};

export const getResourceEditRoute = (
  type: ContentType,
  resourceId: string,
): string => {
  switch (type) {
    case "LESSON":
      return `/lessons/${resourceId}/edit`;
    case "WORKSHEET":
      return `/worksheets/${resourceId}/edit`;
    case "QUIZ":
      return `/quizzes/${resourceId}/edit`;
    case "HOMEWORK":
      return `/homeworks/${resourceId}/edit`;
    default:
      return `/dashboard`;
  }
};

export const getResourceTypeLabel = (type: ContentType): string => {
  switch (type) {
    case "LESSON":
      return "Lesson Plan";
    case "WORKSHEET":
      return "Worksheet";
    case "QUIZ":
      return "Quiz";
    case "HOMEWORK":
      return "Homework";
    default:
      return type;
  }
};

export const getResourceTypeIcon = (type: ContentType): string => {
  switch (type) {
    case "LESSON":
      return "✨";
    case "WORKSHEET":
      return "📝";
    case "QUIZ":
      return "❓";
    case "HOMEWORK":
      return "📚";
    default:
      return "📄";
  }
};

export const getResourceTypeColor = (
  type: ContentType,
): { bg: string; text: string; border: string } => {
  switch (type) {
    case "LESSON":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      };
    case "WORKSHEET":
      return {
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
      };
    case "QUIZ":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "HOMEWORK":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
      };
  }
};
