// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomeworkForm } from "../apps/web/src/components/homeworks/HomeworkForm";
import { HomeworkGenerationState } from "../apps/web/src/components/homeworks/HomeworkGenerationState";
import { HomeworkEditor } from "../apps/web/src/components/homeworks/HomeworkEditor";
import { QuickCreateCard } from "../apps/web/src/components/dashboard/QuickCreateCard";
import type { HomeworkTask } from "@teacher-ai/contracts";

const mockClasses = [
  {
    id: "88888888-8888-8888-8888-888888888888",
    teacherId: "teacher-1",
    name: "Grade 7 Science",
    grade: "7",
    section: "A",
    curriculumBoard: "CBSE",
    academicYear: "2026-27",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
];

const mockTasks: HomeworkTask[] = [
  {
    position: 1,
    type: "PRACTICE",
    title: "Terminology Practice",
    description: "Define condensation, evaporation, and precipitation in your notebook.",
  },
  {
    position: 2,
    type: "CREATIVE",
    title: "Water Cycle Diagram",
    description: "Draw a colored diagram of the water cycle and label each phase.",
  },
  {
    position: 3,
    type: "SHORT_ANSWER",
    title: "Real World Application",
    description: "Explain why rain is an essential phase of the water cycle.",
  },
];

describe("Homework Generation UI Components", () => {
  it("renders HomeworkForm and allows inputting homework parameters", async () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <HomeworkForm classes={mockClasses} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("homework-form")).toBeDefined();
    expect(screen.getByTestId("homework-class-select")).toBeDefined();
    expect(screen.getByTestId("homework-subject-input")).toBeDefined();
    expect(screen.getByTestId("homework-topic-input")).toBeDefined();
    expect(screen.getByTestId("homework-task-count-input")).toBeDefined();
    expect(screen.getByTestId("homework-duration-input")).toBeDefined();

    fireEvent.change(screen.getByTestId("homework-subject-input"), {
      target: { value: "Science" },
    });
    fireEvent.change(screen.getByTestId("homework-topic-input"), {
      target: { value: "Water Cycle" },
    });

    expect(
      (screen.getByTestId("homework-subject-input") as HTMLInputElement).value,
    ).toBe("Science");
    expect(
      (screen.getByTestId("homework-topic-input") as HTMLInputElement).value,
    ).toBe("Water Cycle");
  });

  it("renders HomeworkGenerationState with progress stages", () => {
    render(<HomeworkGenerationState />);
    expect(screen.getByTestId("homework-generation-loading")).toBeDefined();
    expect(screen.getByText("Generating Homework")).toBeDefined();
  });

  it("renders HomeworkEditor with tasks and allows editing", () => {
    const onTitleChange = vi.fn();
    const onInstructionsChange = vi.fn();
    const onEstimatedTimeChange = vi.fn();
    const onTasksChange = vi.fn();

    render(
      <HomeworkEditor
        title="Water Cycle Take-Home Assignment"
        instructions="Complete in your science notebook."
        estimatedTimeMinutes={30}
        tasks={mockTasks}
        onTitleChange={onTitleChange}
        onInstructionsChange={onInstructionsChange}
        onEstimatedTimeChange={onEstimatedTimeChange}
        onTasksChange={onTasksChange}
      />,
    );

    expect(screen.getByTestId("homework-editor")).toBeDefined();
    expect(
      (screen.getByTestId("homework-title-input") as HTMLInputElement).value,
    ).toBe("Water Cycle Take-Home Assignment");
    expect(screen.getByTestId("estimated-time-display").textContent).toBe("30 min");

    expect(screen.getByTestId("task-item-0")).toBeDefined();
    expect(screen.getByTestId("task-item-1")).toBeDefined();
    expect(screen.getByTestId("task-item-2")).toBeDefined();

    fireEvent.change(screen.getByTestId("homework-title-input"), {
      target: { value: "Chapter 3 Science Homework" },
    });
    expect(onTitleChange).toHaveBeenCalledWith("Chapter 3 Science Homework");

    fireEvent.change(screen.getByTestId("task-title-0"), {
      target: { value: "Updated Task Title" },
    });
    expect(onTasksChange).toHaveBeenCalled();
  });

  it("renders QuickCreateCard correctly with active Homework link and AI Ready badge", () => {
    render(
      <MemoryRouter>
        <QuickCreateCard
          option={{
            id: "homework",
            title: "Homework",
            description: "Prepare clear, take-home practice assignments.",
            badgeColor: "bg-emerald-50 text-emerald-700",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            href: "/create/homework",
            enabled: true,
            icon: <span>Icon</span>,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("quick-create-homework").getAttribute("href"),
    ).toBe("/create/homework");
    expect(screen.getByText("AI Ready")).toBeDefined();
  });
});
