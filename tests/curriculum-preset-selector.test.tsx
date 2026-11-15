// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  CurriculumPresetSelector,
  isClassEligibleForPreset,
} from "../apps/web/src/components/lessons/CurriculumPresetSelector";
import type { ClassDTO, CurriculumPresetSummary } from "../packages/contracts/index";
import * as hooks from "../apps/web/src/hooks/useCurriculumPresets";

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

const createMockClass = (overrides: Partial<ClassDTO> = {}): ClassDTO => ({
  id: "class-uuid-1",
  teacherId: "teacher-1",
  name: "Class 1A",
  grade: "1",
  section: "A",
  curriculumBoard: "Karnataka State Board",
  academicYear: "2026-2027",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  archivedAt: null,
  ...overrides,
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CurriculumPresetSelector & Eligibility Rules", () => {
  describe("isClassEligibleForPreset Unit Logic", () => {
    it("Scenario 1: Grade 1 + Karnataka State Board is ELIGIBLE", () => {
      const cls = createMockClass({ grade: "1", curriculumBoard: "Karnataka State Board" });
      const result = isClassEligibleForPreset(cls, mockPreset);
      expect(result.eligible).toBe(true);
    });

    it("Scenario 2: Grade 1 + CBSE is INELIGIBLE (Board mismatch)", () => {
      const cls = createMockClass({ grade: "1", curriculumBoard: "CBSE" });
      const result = isClassEligibleForPreset(cls, mockPreset);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("Board mismatch");
      expect(result.reason).toContain("CBSE");
    });

    it("Scenario 2b: Grade 1 + ICSE is INELIGIBLE (Board mismatch)", () => {
      const cls = createMockClass({ grade: "1", curriculumBoard: "ICSE" });
      const result = isClassEligibleForPreset(cls, mockPreset);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("Board mismatch");
    });

    it("Scenario 3: Grade 1 + null board is ELIGIBLE (unassigned inherits preset board)", () => {
      const cls = createMockClass({ grade: "1", curriculumBoard: null });
      const result = isClassEligibleForPreset(cls, mockPreset);
      expect(result.eligible).toBe(true);
    });

    it("Scenario 3b: Grade 1 + empty string board is ELIGIBLE", () => {
      const cls = createMockClass({ grade: "1", curriculumBoard: "" });
      const result = isClassEligibleForPreset(cls, mockPreset);
      expect(result.eligible).toBe(true);
    });

    it("Scenario 4: Grade 2 + Karnataka State Board is INELIGIBLE (Grade mismatch)", () => {
      const cls = createMockClass({ grade: "2", curriculumBoard: "Karnataka State Board" });
      const result = isClassEligibleForPreset(cls, mockPreset);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("Grade mismatch");
    });

    it("handles variations in grade format (e.g. 'Grade 1' and 'Class 1')", () => {
      const clsGradePrefix = createMockClass({ grade: "Grade 1" });
      expect(isClassEligibleForPreset(clsGradePrefix, mockPreset).eligible).toBe(true);

      const clsClassPrefix = createMockClass({ grade: "Class 1" });
      expect(isClassEligibleForPreset(clsClassPrefix, mockPreset).eligible).toBe(true);
    });

    it("handles undefined class gracefully", () => {
      const result = isClassEligibleForPreset(undefined, mockPreset);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("Please select a class first");
    });
  });

  describe("CurriculumPresetSelector Component", () => {
    it("renders loading skeleton while query is pending", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: true,
        isError: false,
        data: undefined,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass()}
          onSelectPreset={vi.fn()}
        />,
      );

      expect(screen.getByTestId("preset-loading-skeleton")).toBeDefined();
    });

    it("renders error state when API query fails", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: false,
        isError: true,
        data: undefined,
        error: new Error("Network connection lost"),
        refetch: vi.fn(),
      } as any);

      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass()}
          onSelectPreset={vi.fn()}
        />,
      );

      expect(screen.getByTestId("preset-error-state")).toBeDefined();
      expect(screen.getByText(/Network connection lost/i)).toBeDefined();
    });

    it("renders preset card when class is eligible (Grade 1 + Karnataka State Board)", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: false,
        isError: false,
        data: { presets: [mockPreset] },
        error: null,
        refetch: vi.fn(),
      } as any);

      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass()}
          onSelectPreset={vi.fn()}
        />,
      );

      expect(screen.getByTestId(`preset-card-${mockPreset.id}`)).toBeDefined();
      expect(screen.getByText("What is Long? What is Round?")).toBeDefined();
      expect(screen.getByText("ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?")).toBeDefined();
      expect(screen.getByText(/Karnataka State Board/i)).toBeDefined();
    });

    it("renders empty state when class is incompatible CBSE board", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: false,
        isError: false,
        data: { presets: [mockPreset] },
        error: null,
        refetch: vi.fn(),
      } as any);

      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass({ grade: "1", curriculumBoard: "CBSE" })}
          onSelectPreset={vi.fn()}
        />,
      );

      expect(screen.getByTestId("preset-empty-state")).toBeDefined();
      expect(screen.getByText(/Board mismatch/i)).toBeDefined();
      expect(screen.getByText(/CBSE/i)).toBeDefined();
    });

    it("renders empty state when class is Grade 2", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: false,
        isError: false,
        data: { presets: [mockPreset] },
        error: null,
        refetch: vi.fn(),
      } as any);

      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass({ grade: "2" })}
          onSelectPreset={vi.fn()}
        />,
      );

      expect(screen.getByTestId("preset-empty-state")).toBeDefined();
      expect(screen.getByText(/Grade mismatch/i)).toBeDefined();
    });

    it("invokes onSelectPreset when preset card is clicked", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: false,
        isError: false,
        data: { presets: [mockPreset] },
        error: null,
        refetch: vi.fn(),
      } as any);

      const onSelectPreset = vi.fn();
      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass()}
          onSelectPreset={onSelectPreset}
        />,
      );

      expect(screen.getByTestId(`preset-card-${mockPreset.id}`)).toBeDefined();
      fireEvent.click(screen.getByTestId(`preset-card-${mockPreset.id}`));
      expect(onSelectPreset).toHaveBeenCalledWith(mockPreset);
    });

    it("clears selection when Clear Selection button is clicked", () => {
      vi.spyOn(hooks, "useCurriculumPresets").mockReturnValue({
        isLoading: false,
        isError: false,
        data: { presets: [mockPreset] },
        error: null,
        refetch: vi.fn(),
      } as any);

      const onSelectPreset = vi.fn();
      render(
        <CurriculumPresetSelector
          selectedClass={createMockClass()}
          selectedPresetId={mockPreset.id}
          onSelectPreset={onSelectPreset}
        />,
      );

      expect(screen.getByText("Clear Selection")).toBeDefined();
      fireEvent.click(screen.getByText("Clear Selection"));
      expect(onSelectPreset).toHaveBeenCalledWith(null);
    });
  });
});
