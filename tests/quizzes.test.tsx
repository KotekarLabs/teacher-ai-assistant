// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QuizForm } from "../apps/web/src/components/quizzes/QuizForm";
import { QuizGenerationState } from "../apps/web/src/components/quizzes/QuizGenerationState";
import { QuizEditor } from "../apps/web/src/components/quizzes/QuizEditor";
import { QuickCreateCard } from "../apps/web/src/components/dashboard/QuickCreateCard";
import type { QuizQuestion } from "@teacher-ai/contracts";

const mockClasses = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    teacherId: "teacher-1",
    name: "Grade 8 Science",
    grade: "8",
    section: "B",
    curriculumBoard: "CBSE",
    academicYear: "2026-27",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
];

const mockQuestions: QuizQuestion[] = [
  {
    position: 1,
    type: "MULTIPLE_CHOICE",
    question: "What is the pH of pure water at 25°C?",
    options: ["5", "7", "9", "14"],
    correctAnswer: "7",
    explanation: "Pure water is neutral with a pH of 7.",
    marks: 1,
    difficulty: "EASY",
  },
  {
    position: 2,
    type: "TRUE_FALSE",
    question: "Acids turn blue litmus paper red.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Acids turn blue litmus red; bases turn red litmus blue.",
    marks: 1,
    difficulty: "EASY",
  },
  {
    position: 3,
    type: "SHORT_ANSWER",
    question: "Define neutralization reaction with an example.",
    options: [],
    correctAnswer: "A reaction between an acid and a base giving salt and water.",
    explanation: "Acid + Base -> Salt + Water",
    marks: 3,
    difficulty: "MEDIUM",
  },
];

describe("Quiz Generation UI Components", () => {
  it("renders QuizForm and allows inputting quiz parameters", async () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <QuizForm classes={mockClasses} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("quiz-form")).toBeDefined();
    expect(screen.getByTestId("quiz-class-select")).toBeDefined();
    expect(screen.getByTestId("quiz-subject-input")).toBeDefined();
    expect(screen.getByTestId("quiz-topic-input")).toBeDefined();
    expect(screen.getByTestId("quiz-question-count-input")).toBeDefined();
    expect(screen.getByTestId("quiz-duration-input")).toBeDefined();

    fireEvent.change(screen.getByTestId("quiz-subject-input"), {
      target: { value: "Chemistry" },
    });
    fireEvent.change(screen.getByTestId("quiz-topic-input"), {
      target: { value: "Acids and Bases" },
    });

    expect(
      (screen.getByTestId("quiz-subject-input") as HTMLInputElement).value,
    ).toBe("Chemistry");
    expect(
      (screen.getByTestId("quiz-topic-input") as HTMLInputElement).value,
    ).toBe("Acids and Bases");
  });

  it("renders QuizGenerationState with progress stages", () => {
    render(<QuizGenerationState />);
    expect(screen.getByTestId("quiz-generation-loading")).toBeDefined();
    expect(screen.getByText("Generating Quiz")).toBeDefined();
  });

  it("renders QuizEditor with live calculated total marks and question fields", () => {
    const onTitleChange = vi.fn();
    const onInstructionsChange = vi.fn();
    const onDurationChange = vi.fn();
    const onQuestionsChange = vi.fn();

    render(
      <QuizEditor
        title="Acids & Bases Mastery Quiz"
        instructions="Answer all questions."
        durationMinutes={20}
        questions={mockQuestions}
        onTitleChange={onTitleChange}
        onInstructionsChange={onInstructionsChange}
        onDurationChange={onDurationChange}
        onQuestionsChange={onQuestionsChange}
      />,
    );

    expect(screen.getByTestId("quiz-editor")).toBeDefined();
    expect(
      (screen.getByTestId("quiz-title-input") as HTMLInputElement).value,
    ).toBe("Acids & Bases Mastery Quiz");

    // Total marks = 1 + 1 + 3 = 5
    expect(screen.getByTestId("calculated-total-marks").textContent).toBe("5");

    expect(screen.getByTestId("question-item-0")).toBeDefined();
    expect(screen.getByTestId("question-item-1")).toBeDefined();
    expect(screen.getByTestId("question-item-2")).toBeDefined();

    fireEvent.change(screen.getByTestId("quiz-title-input"), {
      target: { value: "Chapter 5 Chemistry Assessment" },
    });
    expect(onTitleChange).toHaveBeenCalledWith("Chapter 5 Chemistry Assessment");

    fireEvent.change(screen.getByTestId("question-text-0"), {
      target: { value: "Updated question 1 text?" },
    });
    expect(onQuestionsChange).toHaveBeenCalled();
  });

  it("renders QuickCreateCard correctly with active Quiz link and AI Ready badge", () => {
    render(
      <MemoryRouter>
        <QuickCreateCard
          option={{
            id: "quiz",
            title: "Quiz",
            description: "Build formative quizzes and assessments.",
            badgeColor: "bg-amber-50 text-amber-700",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            href: "/create/quiz",
            enabled: true,
            icon: <span>Icon</span>,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("quick-create-quiz").getAttribute("href"),
    ).toBe("/create/quiz");
    expect(screen.getByText("AI Ready")).toBeDefined();
  });
});
