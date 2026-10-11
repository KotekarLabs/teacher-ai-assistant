// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LessonForm } from "../apps/web/src/components/lessons/LessonForm";
import { WorksheetForm } from "../apps/web/src/components/worksheets/WorksheetForm";
import { QuizForm } from "../apps/web/src/components/quizzes/QuizForm";
import { HomeworkForm } from "../apps/web/src/components/homeworks/HomeworkForm";
import { ResourceGenerationOverlay } from "../apps/web/src/components/resources/ResourceGenerationOverlay";
import { CreateLesson } from "../apps/web/src/pages/CreateLesson";
import { useAuthStore } from "../apps/web/src/store/authStore";
import * as lessonsApi from "../apps/web/src/api/lessons.api";
import * as classesApi from "../apps/web/src/api/classes.api";
import type { ClassDTO } from "@teacher-ai/contracts";

const mockClasses: ClassDTO[] = [
  {
    id: "cls-1",
    teacherId: "t-1",
    name: "Grade 10 Science",
    grade: "10",
    section: "A",
    curriculumBoard: "CBSE",
    academicYear: "2026-27",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
  {
    id: "cls-2",
    teacherId: "t-1",
    name: "Grade 9 Biology",
    grade: "9",
    section: null,
    curriculumBoard: null,
    academicYear: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
];

const mockProfile = {
  id: "p-1",
  userId: "t-1",
  displayName: "Ms. Anita Roy",
  teachingRole: "Senior Teacher",
  subjects: ["Biology", "Chemistry"],
  curriculumBoard: "CBSE",
  experienceLevel: "5-10 years",
  preferredLanguage: "English",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("Milestone 9 — Resilient Resource Creation & Pedagogical Context Suite", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "t-1", email: "anita.roy@school.edu" },
      profile: mockProfile,
      hasCompletedOnboarding: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("Pedagogical Context & Pre-population", () => {
    it("renders profile subject quick-fill buttons and fills subject on click in LessonForm", () => {
      render(
        <BrowserRouter>
          <LessonForm classes={mockClasses} onSubmit={vi.fn()} />
        </BrowserRouter>,
      );

      expect(screen.getByTestId("profile-subject-suggestions")).toBeDefined();
      expect(screen.getByRole("button", { name: "Biology" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Chemistry" })).toBeDefined();

      const subjectInput = screen.getByTestId("lesson-subject-input") as HTMLInputElement;
      const chemistryBtn = screen.getByRole("button", { name: "Chemistry" });

      fireEvent.click(chemistryBtn);
      expect(subjectInput.value).toBe("Chemistry");
    });

    it("uses profile curriculum board as fallback when selected class has none", () => {
      render(
        <BrowserRouter>
          <LessonForm
            classes={mockClasses}
            initialClassId="cls-2"
            onSubmit={vi.fn()}
          />
        </BrowserRouter>,
      );

      const curriculumInput = screen.getByTestId("lesson-curriculum-input") as HTMLInputElement;
      expect(curriculumInput.value).toBe("CBSE");
    });

    it("gracefully functions without breaking when teacher profile is null", () => {
      useAuthStore.setState({
        profile: null,
      });

      render(
        <BrowserRouter>
          <LessonForm classes={mockClasses} onSubmit={vi.fn()} />
        </BrowserRouter>,
      );

      expect(screen.queryByTestId("profile-subject-suggestions")).toBeNull();
      const subjectInput = screen.getByTestId("lesson-subject-input") as HTMLInputElement;
      expect(subjectInput.value).toBe("");
    });
  });

  describe("Question / Task Type Feedback & Safe Selection", () => {
    it("prevents unchecking the last remaining question type and displays accessible alert in WorksheetForm", () => {
      render(
        <BrowserRouter>
          <WorksheetForm classes={mockClasses} onSubmit={vi.fn()} />
        </BrowserRouter>,
      );

      // Initially MULTIPLE_CHOICE and SHORT_ANSWER are checked
      const mcqBtn = screen.getByTestId("question-type-MULTIPLE_CHOICE");
      const shortAnsBtn = screen.getByTestId("question-type-SHORT_ANSWER");

      // Uncheck MCQ -> 1 remaining
      fireEvent.click(mcqBtn);
      expect(screen.queryByTestId("question-types-error")).toBeNull();

      // Attempt to uncheck SHORT_ANSWER (the last one)
      fireEvent.click(shortAnsBtn);

      // Should display accessible alert
      expect(screen.getByTestId("question-types-error")).toBeDefined();
      expect(
        screen.getByText("At least one question type must be selected."),
      ).toBeDefined();

      // Check MCQ again -> error cleared
      fireEvent.click(mcqBtn);
      expect(screen.queryByTestId("question-types-error")).toBeNull();
    });

    it("prevents unchecking the last remaining question type in QuizForm", () => {
      render(
        <BrowserRouter>
          <QuizForm classes={mockClasses} onSubmit={vi.fn()} />
        </BrowserRouter>,
      );

      const mcqBtn = screen.getByTestId("question-type-MULTIPLE_CHOICE");
      const tfBtn = screen.getByTestId("question-type-TRUE_FALSE");

      fireEvent.click(mcqBtn);
      fireEvent.click(tfBtn);

      expect(screen.getByTestId("question-types-error")).toBeDefined();
      expect(
        screen.getByText("At least one question type must be selected."),
      ).toBeDefined();
    });

    it("prevents unchecking the last remaining task type in HomeworkForm", () => {
      render(
        <BrowserRouter>
          <HomeworkForm classes={mockClasses} onSubmit={vi.fn()} />
        </BrowserRouter>,
      );

      const practiceBtn = screen.getByTestId("task-type-PRACTICE");
      const shortAnsBtn = screen.getByTestId("task-type-SHORT_ANSWER");

      fireEvent.click(practiceBtn);
      fireEvent.click(shortAnsBtn);

      expect(screen.getByTestId("task-types-error")).toBeDefined();
      expect(
        screen.getByText("At least one task type must be selected."),
      ).toBeDefined();
    });
  });

  describe("ResourceGenerationOverlay Component", () => {
    it("renders resource type, topic badge, and accessible status role", () => {
      render(
        <ResourceGenerationOverlay
          resourceType="Lesson Plan"
          topic="Cell Structure"
          className="Grade 10 Science"
        />,
      );

      expect(screen.getByRole("status")).toBeDefined();
      expect(screen.getByText("Generating AI Lesson Plan")).toBeDefined();
      expect(screen.getByText("Cell Structure")).toBeDefined();
      expect(screen.getByText("Grade 10 Science")).toBeDefined();
    });
  });
});
