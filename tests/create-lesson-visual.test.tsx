// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { LessonForm } from "../apps/web/src/components/lessons/LessonForm";
import type { ClassDTO, CurriculumPresetSummary } from "../packages/contracts/index";
import * as hooks from "../apps/web/src/hooks/useCurriculumPresets";
import { useAuthStore } from "../apps/web/src/store/authStore";
import { CurriculumRegistry } from "../apps/api/src/registry/curriculum-registry";

const mockPreset: CurriculumPresetSummary = {
  id: "JOYFUL_MATH_C1_CH2_V1",
  curriculumBoard: "Karnataka State Board",
  grade: "1",
  subject: "Mathematics",
  topicName: "What is Long? What is Round?",
  kannadaTopicName: "ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?",
  textbook: {
    title: "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual",
    edition: "Revised 2026–27",
    chapterNumber: 2,
    chapterTitle: "What is Long? What is Round?",
    printedPages: "13–14",
    publisher: "Karnataka Textbook Society (KTBS), Bengaluru",
  },
  verification: {
    status: "VERIFIED",
    disclaimer: "Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.",
  },
  pedagogicalConstraints: {
    targetAge: 6,
    format: "SORTING_DIAGRAM",
    concepts: ["Long vs Round", "Rolling vs Sliding", "Multi-perspective viewing"],
  },
};

const mockClasses: ClassDTO[] = [
  {
    id: "class-ktbs-1",
    teacherId: "teacher-1",
    name: "Class 1A",
    grade: "1",
    section: "A",
    curriculumBoard: "Karnataka State Board",
    academicYear: "2026-2027",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
  {
    id: "class-ktbs-2",
    teacherId: "teacher-1",
    name: "Class 1B",
    grade: "1",
    section: "B",
    curriculumBoard: "Karnataka State Board",
    academicYear: "2026-2027",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
  {
    id: "class-cbse-1",
    teacherId: "teacher-1",
    name: "Class 1 CBSE",
    grade: "1",
    section: "A",
    curriculumBoard: "CBSE",
    academicYear: "2026-2027",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
  {
    id: "class-grade2-1",
    teacherId: "teacher-1",
    name: "Class 2A",
    grade: "2",
    section: "A",
    curriculumBoard: "Karnataka State Board",
    academicYear: "2026-2027",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
  {
    id: "class-unassigned-1",
    teacherId: "teacher-1",
    name: "Class 1 Unassigned Board",
    grade: "1",
    section: "C",
    curriculumBoard: null,
    academicYear: "2026-2027",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
  },
];

beforeEach(() => {
  useAuthStore.setState({
    user: { id: "teacher-1", email: "teacher@test.com", role: "TEACHER" } as any,
    profile: {
      displayName: "Teacher One",
      teachingRole: "Primary Teacher",
      subjects: ["Mathematics", "Science"],
      preferredLanguage: "kannada",
      curriculumBoard: "Karnataka State Board",
      experienceLevel: "SENIOR",
    } as any,
    isAuthenticated: true,
  });

  vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
    isLoading: false,
    isError: false,
    data: { presets: [mockPreset] },
    error: null,
    refetch: vi.fn(),
  } as any);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Visual Lesson Creation Workflow & Preset Selection (Stage 3C Batch 1)", () => {
  it("Scenario 1 (Acceptance 1): Grade 1 Karnataka State Board class renders preset card in curriculum mode", () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    // Switch to curriculum mode
    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));

    // Verify preset selector and card are displayed
    expect(screen.getByTestId("curriculum-preset-selector")).toBeDefined();
    expect(screen.getByTestId(`preset-card-${mockPreset.id}`)).toBeDefined();
    expect(screen.getByText("What is Long? What is Round?")).toBeDefined();
    expect(screen.getByText("ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?")).toBeDefined();
  });

  it("Scenario 2 (Acceptance 2): Selecting preset locks subject & topic and updates CTA button", () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    const subjectInput = screen.getByTestId("lesson-subject-input") as HTMLInputElement;
    const topicInput = screen.getByTestId("lesson-topic-input") as HTMLInputElement;

    expect(subjectInput.value).toBe("Mathematics");
    expect(subjectInput.readOnly).toBe(true);

    expect(topicInput.value).toBe("What is Long? What is Round?");
    expect(topicInput.readOnly).toBe(true);

    // Preset defined badges
    const lockBadges = screen.getAllByText("🔒 Preset defined");
    expect(lockBadges.length).toBeGreaterThanOrEqual(2);

    // Button text reflects visual bilingual lesson
    expect(screen.getByTestId("generate-lesson-btn").textContent).toContain(
      "Generate Visual Lesson Plan (Bilingual Sorting)",
    );
  });

  it("Scenario 3 (Acceptance 3): Form submission includes curriculumTopicId and locked fields", async () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    fireEvent.click(screen.getByTestId("generate-lesson-btn"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.classId).toBe("class-ktbs-1");
    expect(payload.curriculumTopicId).toBe("JOYFUL_MATH_C1_CH2_V1");
    expect(payload.subject).toBe("Mathematics");
    expect(payload.topic).toBe("What is Long? What is Round?");
    expect(payload.curriculumBoard).toBe("Karnataka State Board");
  });

  it("Scenario 4 (Acceptance 4): Switching to an ineligible class (Grade 2) clears preset and reverts to standard mode", async () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    // Select preset first
    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    // Switch class to Grade 2
    fireEvent.change(screen.getByTestId("lesson-class-select"), {
      target: { value: "class-grade2-1" },
    });

    // Verify notice appears
    await waitFor(() => {
      expect(screen.getByTestId("class-change-notice")).toBeDefined();
      expect(screen.getByTestId("class-change-notice").textContent).toContain("Grade mismatch");
    });

    // Form fields should unlock
    const subjectInput = screen.getByTestId("lesson-subject-input") as HTMLInputElement;
    const topicInput = screen.getByTestId("lesson-topic-input") as HTMLInputElement;
    expect(subjectInput.readOnly).toBe(false);
    expect(topicInput.readOnly).toBe(false);

    // Standard CTA
    expect(screen.getByTestId("generate-lesson-btn").textContent).toContain("Generate Lesson Plan");
    expect(screen.getByTestId("generate-lesson-btn").textContent).not.toContain("Bilingual Sorting");
  });

  it("Scenario 4b (Acceptance 4): Switching to an incompatible board (CBSE) clears preset and reverts to standard mode", async () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    // Switch class to CBSE
    fireEvent.change(screen.getByTestId("lesson-class-select"), {
      target: { value: "class-cbse-1" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("class-change-notice")).toBeDefined();
      expect(screen.getByTestId("class-change-notice").textContent).toContain("Board mismatch");
      expect(screen.getByTestId("class-change-notice").textContent).toContain("CBSE");
    });
  });

  it("Scenario 5 (Acceptance 5): Switching between two eligible Grade 1 classes preserves preset selection", async () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    // Switch to another eligible Grade 1 Karnataka State Board class
    fireEvent.change(screen.getByTestId("lesson-class-select"), {
      target: { value: "class-ktbs-2" },
    });

    // Notice should NOT appear
    expect(screen.queryByTestId("class-change-notice")).toBeNull();

    // Inputs should remain locked
    const topicInput = screen.getByTestId("lesson-topic-input") as HTMLInputElement;
    expect(topicInput.value).toBe("What is Long? What is Round?");
    expect(topicInput.readOnly).toBe(true);

    // Submitting targets class-ktbs-2 with preset preserved
    fireEvent.click(screen.getByTestId("generate-lesson-btn"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0][0].classId).toBe("class-ktbs-2");
    expect(onSubmit.mock.calls[0][0].curriculumTopicId).toBe("JOYFUL_MATH_C1_CH2_V1");
  });

  it("Scenario 6 (Acceptance 6): Toggling mode back to Standard clears preset and unlocks fields", () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    // Switch back to Standard Lesson mode
    fireEvent.click(screen.getByTestId("mode-standard-btn"));

    const subjectInput = screen.getByTestId("lesson-subject-input") as HTMLInputElement;
    const topicInput = screen.getByTestId("lesson-topic-input") as HTMLInputElement;

    expect(subjectInput.readOnly).toBe(false);
    expect(topicInput.readOnly).toBe(false);
    expect(screen.queryByText("🔒 Preset defined")).toBeNull();
  });

  it("Scenario 7 (Acceptance 7): Ordinary standard lesson submission omits curriculumTopicId", async () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-ktbs-1" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId("lesson-subject-input"), {
      target: { value: "Science" },
    });
    fireEvent.change(screen.getByTestId("lesson-topic-input"), {
      target: { value: "Plant Photosynthesis" },
    });

    fireEvent.click(screen.getByTestId("generate-lesson-btn"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.curriculumTopicId).toBeUndefined();
    expect(payload.subject).toBe("Science");
    expect(payload.topic).toBe("Plant Photosynthesis");
  });

  it("Scenario 8 (Acceptance 8): Unassigned board class (null board) is eligible and inherits preset board", async () => {
    const onSubmit = vi.fn();
    render(<LessonForm classes={mockClasses} initialClassId="class-unassigned-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("mode-curriculum-btn"));
    expect(screen.getByTestId(`preset-card-${mockPreset.id}`)).toBeDefined();

    fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));

    fireEvent.click(screen.getByTestId("generate-lesson-btn"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.classId).toBe("class-unassigned-1");
    expect(payload.curriculumTopicId).toBe("JOYFUL_MATH_C1_CH2_V1");
    expect(payload.curriculumBoard).toBe("Karnataka State Board");
  });

  it("Scenario 9 (Acceptance 9): Backend server-side eligibility check enforces board compatibility", () => {
    const entry = CurriculumRegistry.getEntry("JOYFUL_MATH_C1_CH2_V1")!;
    expect(entry).toBeDefined();

    // Ineligible: Grade 1 CBSE class
    const cbseResult = CurriculumRegistry.validateClassEligibility(
      entry,
      { grade: "1", curriculumBoard: "CBSE" },
      { subjects: ["Mathematics"] },
      "Mathematics",
    );
    expect(cbseResult.eligible).toBe(false);
    expect(cbseResult.reason).toContain("CBSE");
    expect(cbseResult.reason).toContain("not compatible with verified topic board 'Karnataka State Board'");

    // Ineligible: Grade 2 Karnataka State Board class
    const grade2Result = CurriculumRegistry.validateClassEligibility(
      entry,
      { grade: "2", curriculumBoard: "Karnataka State Board" },
      { subjects: ["Mathematics"] },
      "Mathematics",
    );
    expect(grade2Result.eligible).toBe(false);
    expect(grade2Result.reason).toContain("Target class grade '2' does not match verified topic grade 'Class 1'");

    // Ineligible: Subject mismatch (Science)
    const subjectMismatch = CurriculumRegistry.validateClassEligibility(
      entry,
      { grade: "1", curriculumBoard: "Karnataka State Board" },
      { subjects: ["Mathematics"] },
      "Science",
    );
    expect(subjectMismatch.eligible).toBe(false);
    expect(subjectMismatch.reason).toContain("does not match verified topic subject 'Mathematics'");
  });

  it("Scenario 10 (Acceptance 10): Backend server-side eligibility check accepts valid class and unassigned board", () => {
    const entry = CurriculumRegistry.getEntry("JOYFUL_MATH_C1_CH2_V1")!;

    // Eligible: Grade 1 Karnataka State Board
    const ktbsResult = CurriculumRegistry.validateClassEligibility(
      entry,
      { grade: "1", curriculumBoard: "Karnataka State Board" },
      { subjects: ["Mathematics"] },
      "Mathematics",
    );
    expect(ktbsResult.eligible).toBe(true);

    // Eligible: Grade 1 with unassigned board (null)
    const unassignedResult = CurriculumRegistry.validateClassEligibility(
      entry,
      { grade: "1", curriculumBoard: null },
      { subjects: ["Mathematics"] },
      "Mathematics",
    );
    expect(unassignedResult.eligible).toBe(true);

    // Eligible: Grade 1 with empty string board
    const emptyBoardResult = CurriculumRegistry.validateClassEligibility(
      entry,
      { grade: "Grade 1", curriculumBoard: "" },
      { subjects: ["Mathematics"] },
      "Mathematics",
    );
    expect(emptyBoardResult.eligible).toBe(true);
  });
});
