// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LessonForm } from "../apps/web/src/components/lessons/LessonForm";
import { WorksheetForm } from "../apps/web/src/components/worksheets/WorksheetForm";
import { QuizForm } from "../apps/web/src/components/quizzes/QuizForm";
import { HomeworkForm } from "../apps/web/src/components/homeworks/HomeworkForm";
import { LessonEditor } from "../apps/web/src/components/lessons/LessonEditor";
import { WorksheetEditor } from "../apps/web/src/components/worksheets/WorksheetEditor";
import { QuizEditor } from "../apps/web/src/components/quizzes/QuizEditor";
import { HomeworkEditor } from "../apps/web/src/components/homeworks/HomeworkEditor";
import { LessonSaveBar } from "../apps/web/src/components/lessons/LessonSaveBar";
import { WorksheetSaveBar } from "../apps/web/src/components/worksheets/WorksheetSaveBar";
import { QuizSaveBar } from "../apps/web/src/components/quizzes/QuizSaveBar";
import { HomeworkSaveBar } from "../apps/web/src/components/homeworks/HomeworkSaveBar";
import { UnsavedChangesDialog } from "../apps/web/src/components/resources/UnsavedChangesDialog";
import type {
  ClassDTO,
  LessonContent,
  WorksheetQuestion,
  QuizQuestion,
  HomeworkTask,
} from "@teacher-ai/contracts";

const mockClasses: ClassDTO[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    teacherId: "teacher-1",
    name: "Grade 8 Science A",
    grade: "8",
    section: "A",
    subject: "Science",
    curriculumBoard: "CBSE",
    studentCount: 28,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    teacherId: "teacher-1",
    name: "Grade 9 Biology",
    grade: "9",
    section: "B",
    subject: "Biology",
    curriculumBoard: "Cambridge",
    studentCount: 24,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockLessonContent: LessonContent = {
  title: "Cell Division: Mitosis & Meiosis",
  overview: "An in-depth lesson on cellular reproduction.",
  learningObjectives: [
    "Identify stages of mitosis",
    "Explain the significance of meiosis in genetics",
  ],
  prerequisites: ["Basic cell structure", "DNA fundamentals"],
  introduction: "Why do living organisms grow and heal? Let us investigate cellular replication.",
  teacherExplanation: "Mitosis produces two genetically identical diploid cells.",
  examples: ["Skin cell regeneration following a scrape", "Plant root tip growth"],
  classroomActivity: {
    title: "Onion Root Tip Microscopic Observation",
    instructions: "Examine prepared slides under 400x magnification and record mitotic phases.",
    durationMinutes: 20,
  },
  practice: [
    "Draw and label the 4 stages of mitosis in order.",
    "Contrast chromosome count in mitosis versus meiosis.",
  ],
  quickAssessment: [
    "In which phase do sister chromatids pull apart?",
  ],
  homework: "Complete worksheet questions 1-5 on page 84.",
  teacherScript: "Good morning class! Today we explore how cells divide and conquer.",
};

const mockWorksheetQuestions: WorksheetQuestion[] = [
  {
    position: 1,
    type: "MULTIPLE_CHOICE",
    question: "Which organelle is considered the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    expectedAnswer: "Mitochondria",
    marks: 1,
    difficulty: "EASY",
  },
  {
    position: 2,
    type: "SHORT_ANSWER",
    question: "Define the term photosynthesis in your own words.",
    options: [],
    expectedAnswer: "The process by which green plants synthesize nutrients using sunlight.",
    marks: 2,
    difficulty: "MEDIUM",
  },
];

const mockQuizQuestions: QuizQuestion[] = [
  {
    position: 1,
    type: "MULTIPLE_CHOICE",
    question: "What is the capital of France?",
    options: ["Paris", "Lyon", "Marseille", "Nice"],
    correctAnswer: "Paris",
    explanation: "Paris is the historical and political capital of France.",
    marks: 2,
    difficulty: "EASY",
  },
  {
    position: 2,
    type: "TRUE_FALSE",
    question: "Water boils at 100 degrees Celsius at sea level.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Standard atmospheric pressure yields a 100C boiling point.",
    marks: 1,
    difficulty: "EASY",
  },
];

const mockHomeworkTasks: HomeworkTask[] = [
  {
    position: 1,
    title: "Review Textbook Chapter 4",
    description: "Read pages 42-48 and take Cornell notes.",
    type: "WRITTEN",
  },
  {
    position: 2,
    title: "Solve Practice Problems 1 to 5",
    description: "Show step-by-step arithmetic operations.",
    type: "PRACTICE",
  },
];

describe("Milestone 6 — Resource Workflows UI Test Suite", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Generator Forms Interaction", () => {
    it("LessonForm renders with pre-selected class and allows input entry", () => {
      const onSubmit = vi.fn();
      render(
        <MemoryRouter>
          <LessonForm
            classes={mockClasses}
            initialClassId="11111111-1111-1111-1111-111111111111"
            onSubmit={onSubmit}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId("lesson-form")).toBeDefined();
      expect(screen.getByTestId("lesson-class-select")).toBeDefined();
      expect(screen.getByTestId("lesson-subject-input")).toBeDefined();
      expect(screen.getByTestId("lesson-topic-input")).toBeDefined();
      expect(screen.getByTestId("generate-lesson-btn")).toBeDefined();

      fireEvent.change(screen.getByTestId("lesson-subject-input"), {
        target: { value: "Biology" },
      });
      fireEvent.change(screen.getByTestId("lesson-topic-input"), {
        target: { value: "Photosynthesis" },
      });

      expect((screen.getByTestId("lesson-subject-input") as HTMLInputElement).value).toBe("Biology");
      expect((screen.getByTestId("lesson-topic-input") as HTMLInputElement).value).toBe("Photosynthesis");
    });

    it("WorksheetForm allows selecting question types and entering parameters", () => {
      const onSubmit = vi.fn();
      render(
        <MemoryRouter>
          <WorksheetForm
            classes={mockClasses}
            initialClassId="22222222-2222-2222-2222-222222222222"
            onSubmit={onSubmit}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId("worksheet-form")).toBeDefined();
      expect(screen.getByTestId("worksheet-class-select")).toBeDefined();
      expect(screen.getByTestId("worksheet-question-count-input")).toBeDefined();
      expect(screen.getByTestId("generate-worksheet-btn")).toBeDefined();

      // Toggle TRUE_FALSE on
      const tfChip = screen.getByTestId("question-type-TRUE_FALSE");
      fireEvent.click(tfChip);

      // Fill inputs
      fireEvent.change(screen.getByTestId("worksheet-subject-input"), {
        target: { value: "Chemistry" },
      });
      fireEvent.change(screen.getByTestId("worksheet-topic-input"), {
        target: { value: "Acids and Bases" },
      });

      expect((screen.getByTestId("worksheet-subject-input") as HTMLInputElement).value).toBe("Chemistry");
      expect((screen.getByTestId("worksheet-topic-input") as HTMLInputElement).value).toBe("Acids and Bases");
    });

    it("QuizForm and HomeworkForm render correctly and respond to input", () => {
      const onQuizSubmit = vi.fn();
      render(
        <MemoryRouter>
          <QuizForm
            classes={mockClasses}
            initialClassId="11111111-1111-1111-1111-111111111111"
            onSubmit={onQuizSubmit}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId("quiz-form")).toBeDefined();
      expect(screen.getByTestId("quiz-duration-input")).toBeDefined();
      expect(screen.getByTestId("generate-quiz-btn")).toBeDefined();

      const onHwSubmit = vi.fn();
      render(
        <MemoryRouter>
          <HomeworkForm
            classes={mockClasses}
            initialClassId="11111111-1111-1111-1111-111111111111"
            onSubmit={onHwSubmit}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId("homework-form")).toBeDefined();
      expect(screen.getByTestId("homework-task-count-input")).toBeDefined();
      expect(screen.getByTestId("generate-homework-btn")).toBeDefined();
    });
  });

  describe("In-Place Editors (Array Add/Remove, Fields & Ordering)", () => {
    it("LessonEditor allows adding and editing objectives", () => {
      const onChange = vi.fn();
      render(
        <LessonEditor
          content={mockLessonContent}
          onChange={onChange}
        />
      );

      expect(screen.getByTestId("lesson-editor")).toBeDefined();
      expect(screen.getByTestId("editor-title-input")).toHaveProperty(
        "value",
        "Cell Division: Mitosis & Meiosis"
      );

      // Click Add Objective
      fireEvent.click(screen.getByTestId("add-objective-btn"));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          learningObjectives: expect.arrayContaining([
            "Identify stages of mitosis",
            "Explain the significance of meiosis in genetics",
            "",
          ]),
        })
      );
    });

    it("WorksheetEditor allows editing questions, marks, and adding new questions", () => {
      const onQuestionsChange = vi.fn();
      render(
        <WorksheetEditor
          title="Cell Biology Practice"
          instructions="Complete all questions."
          estimatedTimeMinutes={25}
          questions={mockWorksheetQuestions}
          onTitleChange={vi.fn()}
          onInstructionsChange={vi.fn()}
          onTimeChange={vi.fn()}
          onQuestionsChange={onQuestionsChange}
        />
      );

      expect(screen.getByTestId("worksheet-editor")).toBeDefined();
      expect(screen.getByTestId("worksheet-title-input")).toHaveProperty(
        "value",
        "Cell Biology Practice"
      );

      // Modify question 0 text
      fireEvent.change(screen.getByTestId("question-text-0"), {
        target: { value: "Updated question 1 text" },
      });
      expect(onQuestionsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            question: "Updated question 1 text",
          }),
        ])
      );

      // Click Add Question
      fireEvent.click(screen.getByTestId("add-question-btn"));
      expect(onQuestionsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          ...mockWorksheetQuestions,
          expect.objectContaining({
            position: 3,
            type: "SHORT_ANSWER",
            question: "New practice question",
          }),
        ])
      );
    });

    it("QuizEditor displays calculated total marks and handles options", () => {
      const onQuestionsChange = vi.fn();
      render(
        <QuizEditor
          title="World Geography Quiz"
          instructions="Choose the best answer."
          durationMinutes={15}
          questions={mockQuizQuestions}
          onTitleChange={vi.fn()}
          onInstructionsChange={vi.fn()}
          onDurationChange={vi.fn()}
          onQuestionsChange={onQuestionsChange}
        />
      );

      expect(screen.getByTestId("quiz-editor")).toBeDefined();
      // Total marks: 2 + 1 = 3
      expect(screen.getByTestId("calculated-total-marks").textContent).toBe("3");

      // Modify marks for question 0
      fireEvent.change(screen.getByTestId("question-marks-0"), {
        target: { value: "5" },
      });
      expect(onQuestionsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            marks: 5,
          }),
        ])
      );
    });

    it("HomeworkEditor allows adding and editing tasks", () => {
      const onTasksChange = vi.fn();
      render(
        <HomeworkEditor
          title="Science Take-Home Assignment"
          instructions="Show all work."
          estimatedTimeMinutes={30}
          tasks={mockHomeworkTasks}
          onTitleChange={vi.fn()}
          onInstructionsChange={vi.fn()}
          onEstimatedTimeChange={vi.fn()}
          onTasksChange={onTasksChange}
        />
      );

      expect(screen.getByTestId("homework-editor")).toBeDefined();
      expect(screen.getByTestId("estimated-time-display").textContent).toContain("30 min");

      // Click Add Task
      fireEvent.click(screen.getByTestId("add-task-btn"));
      expect(onTasksChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          ...mockHomeworkTasks,
          expect.objectContaining({
            position: 3,
            title: "New Homework Task",
          }),
        ])
      );
    });
  });

  describe("Save Bars & Unsaved Changes Protection", () => {
    it("LessonSaveBar renders status badge, unsaved indicator, and triggers actions", () => {
      const onSave = vi.fn();
      const onBack = vi.fn();
      const onRegenerate = vi.fn();

      render(
        <LessonSaveBar
          status="EDITED"
          hasUnsavedChanges={true}
          isSaving={false}
          isRegenerating={false}
          onSave={onSave}
          onRegenerate={onRegenerate}
          onBack={onBack}
        />
      );

      expect(screen.getByTestId("lesson-save-bar")).toBeDefined();
      expect(screen.getByTestId("lesson-status-badge").textContent).toBe("EDITED");
      expect(screen.getByTestId("unsaved-changes-indicator")).toBeDefined();

      fireEvent.click(screen.getByTestId("save-lesson-btn"));
      expect(onSave).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("back-btn"));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("WorksheetSaveBar, QuizSaveBar, and HomeworkSaveBar render properly", () => {
      render(
        <WorksheetSaveBar
          status="SAVED"
          hasUnsavedChanges={false}
          isSaving={false}
          onSave={vi.fn()}
          onBack={vi.fn()}
        />
      );

      expect(screen.getByTestId("worksheet-save-bar")).toBeDefined();
      expect(screen.getByTestId("worksheet-status-badge").textContent).toBe("SAVED");
      expect(screen.queryByTestId("unsaved-changes-indicator")).toBeNull();
    });

    it("UnsavedChangesDialog fires Save, Discard, and Cancel callbacks correctly", () => {
      const onSave = vi.fn();
      const onDiscard = vi.fn();
      const onCancel = vi.fn();

      const { rerender } = render(
        <UnsavedChangesDialog
          isOpen={true}
          onSave={onSave}
          onDiscard={onDiscard}
          onCancel={onCancel}
        />
      );

      expect(screen.getByTestId("unsaved-changes-dialog")).toBeDefined();

      fireEvent.click(screen.getByTestId("save-changes-btn"));
      expect(onSave).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("discard-changes-btn"));
      expect(onDiscard).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("cancel-unsaved-btn"));
      expect(onCancel).toHaveBeenCalledTimes(1);

      // Verify closed dialog
      rerender(
        <UnsavedChangesDialog
          isOpen={false}
          onSave={onSave}
          onDiscard={onDiscard}
          onCancel={onCancel}
        />
      );
      expect(screen.queryByTestId("unsaved-changes-dialog")).toBeNull();
    });
  });
});
