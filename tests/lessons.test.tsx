// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LessonForm } from "../apps/web/src/components/lessons/LessonForm";
import { LessonGenerationState } from "../apps/web/src/components/lessons/LessonGenerationState";
import { LessonEditor } from "../apps/web/src/components/lessons/LessonEditor";
import { QuickCreateCard } from "../apps/web/src/components/dashboard/QuickCreateCard";
import type { LessonContent } from "@teacher-ai/contracts";

const mockClasses = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    teacherId: "teacher-1",
    name: "Grade 4 Science",
    grade: "4",
    section: "A",
    curriculumBoard: "CBSE",
    academicYear: "2026-27",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
];

const mockLessonContent: LessonContent = {
  title: "The Water Cycle",
  overview: "Understanding evaporation, condensation, and precipitation.",
  learningObjectives: ["Define evaporation", "Identify precipitation types"],
  prerequisites: ["States of matter"],
  introduction: "Why does it rain after hot days?",
  teacherExplanation:
    "Water evaporates from oceans, condenses into clouds, and falls as rain.",
  examples: ["Puddles drying up in the sun"],
  classroomActivity: {
    title: "Water in a Bag Experiment",
    instructions: "Fill a ziplock bag with water and tape it to a sunny window.",
    durationMinutes: 15,
  },
  practice: ["Label the water cycle diagram"],
  quickAssessment: ["What drives evaporation?"],
  homework: "Observe a boiling kettle with parents and note the condensation.",
  teacherScript: "Good morning class! Look outside at the clouds...",
};

describe("Lesson Generation UI Components", () => {
  it("renders LessonForm and allows input entry", async () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <LessonForm classes={mockClasses} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("lesson-form")).toBeDefined();
    expect(screen.getByTestId("lesson-class-select")).toBeDefined();
    expect(screen.getByTestId("lesson-subject-input")).toBeDefined();
    expect(screen.getByTestId("lesson-topic-input")).toBeDefined();

    fireEvent.change(screen.getByTestId("lesson-subject-input"), {
      target: { value: "Science" },
    });
    fireEvent.change(screen.getByTestId("lesson-topic-input"), {
      target: { value: "Water Cycle" },
    });

    expect((screen.getByTestId("lesson-subject-input") as HTMLInputElement).value).toBe(
      "Science",
    );
    expect((screen.getByTestId("lesson-topic-input") as HTMLInputElement).value).toBe(
      "Water Cycle",
    );
  });

  it("renders LessonGenerationState with progress indicators", () => {
    render(<LessonGenerationState />);
    expect(screen.getByTestId("lesson-generation-loading")).toBeDefined();
    expect(screen.getByText("Generating Lesson Plan")).toBeDefined();
  });

  it("renders LessonEditor with structured sections and handles changes", () => {
    const onChange = vi.fn();
    render(
      <LessonEditor content={mockLessonContent} onChange={onChange} />,
    );

    expect(screen.getByTestId("lesson-editor")).toBeDefined();
    expect((screen.getByTestId("editor-title-input") as HTMLInputElement).value).toBe(
      "The Water Cycle",
    );
    expect((screen.getByTestId("editor-overview-input") as HTMLTextAreaElement).value).toBe(
      "Understanding evaporation, condensation, and precipitation.",
    );

    fireEvent.change(screen.getByTestId("editor-title-input"), {
      target: { value: "The Dynamic Water Cycle" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders QuickCreateCard correctly: enabled for Lesson, disabled for Worksheet", () => {
    const { rerender } = render(
      <MemoryRouter>
        <QuickCreateCard
          option={{
            id: "lesson",
            title: "Lesson Plan",
            description: "Generate structured lesson plans.",
            badgeColor: "bg-blue-50 text-blue-700",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/create/lesson",
            enabled: true,
            icon: <span>Icon</span>,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("quick-create-lesson").getAttribute("href")).toBe(
      "/create/lesson",
    );
    expect(screen.getByText("AI Ready")).toBeDefined();

    rerender(
      <MemoryRouter>
        <QuickCreateCard
          option={{
            id: "worksheet",
            title: "Worksheet",
            description: "Create printable worksheets.",
            badgeColor: "bg-purple-50 text-purple-700",
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            icon: <span>Icon</span>,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("quick-create-worksheet").getAttribute("aria-disabled"),
    ).toBe("true");
    expect(screen.getByText("Coming Soon")).toBeDefined();
  });
});
