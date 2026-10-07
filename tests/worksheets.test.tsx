// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorksheetForm } from "../apps/web/src/components/worksheets/WorksheetForm";
import { WorksheetGenerationState } from "../apps/web/src/components/worksheets/WorksheetGenerationState";
import { WorksheetEditor } from "../apps/web/src/components/worksheets/WorksheetEditor";
import { QuickCreateCard } from "../apps/web/src/components/dashboard/QuickCreateCard";
import type { WorksheetQuestion } from "@teacher-ai/contracts";

const mockClasses = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    teacherId: "teacher-1",
    name: "Grade 5 Science",
    grade: "5",
    section: "A",
    curriculumBoard: "CBSE",
    academicYear: "2026-27",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
];

const mockQuestions: WorksheetQuestion[] = [
  {
    position: 1,
    type: "MULTIPLE_CHOICE",
    question: "What is the powerhouse of the cell?",
    options: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"],
    expectedAnswer: "Mitochondria",
    marks: 1,
    difficulty: "EASY",
  },
  {
    position: 2,
    type: "SHORT_ANSWER",
    question: "Explain the role of the cell membrane.",
    options: [],
    expectedAnswer: "Controls the movement of substances into and out of cells.",
    marks: 2,
    difficulty: "MEDIUM",
  },
];

describe("Worksheet Generation UI Components", () => {
  it("renders WorksheetForm and allows selecting question types and parameters", async () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <WorksheetForm classes={mockClasses} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("worksheet-form")).toBeDefined();
    expect(screen.getByTestId("worksheet-class-select")).toBeDefined();
    expect(screen.getByTestId("worksheet-subject-input")).toBeDefined();
    expect(screen.getByTestId("worksheet-topic-input")).toBeDefined();
    expect(screen.getByTestId("worksheet-question-count-input")).toBeDefined();

    fireEvent.change(screen.getByTestId("worksheet-subject-input"), {
      target: { value: "Biology" },
    });
    fireEvent.change(screen.getByTestId("worksheet-topic-input"), {
      target: { value: "Cell Biology" },
    });

    expect(
      (screen.getByTestId("worksheet-subject-input") as HTMLInputElement).value,
    ).toBe("Biology");
    expect(
      (screen.getByTestId("worksheet-topic-input") as HTMLInputElement).value,
    ).toBe("Cell Biology");
  });

  it("renders WorksheetGenerationState with progress messages", () => {
    render(<WorksheetGenerationState />);
    expect(screen.getByTestId("worksheet-generation-loading")).toBeDefined();
    expect(screen.getByText("Generating Worksheet")).toBeDefined();
  });

  it("renders WorksheetEditor with editable questions, options, and marks", () => {
    const onTitleChange = vi.fn();
    const onInstructionsChange = vi.fn();
    const onTimeChange = vi.fn();
    const onQuestionsChange = vi.fn();

    render(
      <WorksheetEditor
        title="Cell Structure Worksheet"
        instructions="Complete all questions."
        estimatedTimeMinutes={25}
        questions={mockQuestions}
        onTitleChange={onTitleChange}
        onInstructionsChange={onInstructionsChange}
        onTimeChange={onTimeChange}
        onQuestionsChange={onQuestionsChange}
      />
    );

    expect(screen.getByTestId("worksheet-editor")).toBeDefined();
    expect(
      (screen.getByTestId("worksheet-title-input") as HTMLInputElement).value,
    ).toBe("Cell Structure Worksheet");
    expect(screen.getByTestId("question-item-0")).toBeDefined();
    expect(screen.getByTestId("question-item-1")).toBeDefined();

    fireEvent.change(screen.getByTestId("worksheet-title-input"), {
      target: { value: "Advanced Cell Structure" },
    });
    expect(onTitleChange).toHaveBeenCalledWith("Advanced Cell Structure");

    fireEvent.change(screen.getByTestId("question-text-0"), {
      target: { value: "Updated question 1?" },
    });
    expect(onQuestionsChange).toHaveBeenCalled();
  });

  it("renders QuickCreateCard correctly with active Worksheet link", () => {
    render(
      <MemoryRouter>
        <QuickCreateCard
          option={{
            id: "worksheet",
            title: "Worksheet",
            description: "Create printable classroom worksheets.",
            badgeColor: "bg-purple-50 text-purple-700",
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            href: "/create/worksheet",
            enabled: true,
            icon: <span>Icon</span>,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("quick-create-worksheet").getAttribute("href"),
    ).toBe("/create/worksheet");
    expect(screen.getByText("AI Ready")).toBeDefined();
  });
});
