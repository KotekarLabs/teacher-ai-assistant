// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  LessonContentSchema,
  LessonDifferentiationSchema,
  LessonPacingBreakdownSchema,
  UpdateLessonRequestSchema,
  type LessonContent,
} from "../packages/contracts/index";
import {
  LessonOutputValidator,
  MockAIProvider,
  type LessonGenerationContext,
} from "../packages/ai/index";
import { renderLessonPdf } from "../apps/api/src/services/pdf/lesson-pdf.renderer";
import { LessonEditor } from "../apps/web/src/components/lessons/LessonEditor";

describe("Milestone 10 Batch 2 — Lesson Content Extensions & Pedagogical Quality Suite", () => {
  afterEach(() => {
    cleanup();
  });
  const baseLesson: LessonContent = {
    title: "Cellular Respiration",
    overview: "How cells extract energy from glucose.",
    learningObjectives: [
      "Explain the stages of cellular respiration",
      "Differentiate between aerobic and anaerobic pathways",
    ],
    prerequisites: ["Basic understanding of cell organelles"],
    introduction: "Hook question: Why do we breathe harder when running?",
    teacherExplanation:
      "Cellular respiration breaks down glucose into ATP through glycolysis, the Krebs cycle, and the electron transport chain.",
    examples: [
      "Yeast fermenting sugar in bread baking",
      "Muscle cells producing lactic acid during intense sprinting",
    ],
    classroomActivity: {
      title: "ATP Molecule Card Sort",
      instructions: "Sort reactant and product cards for each respiration stage in small groups.",
      durationMinutes: 15,
    },
    practice: [
      "Write out the overall chemical equation for cellular respiration",
      "Diagram the inputs and outputs of glycolysis",
    ],
    quickAssessment: [
      "Where does the Krebs cycle occur inside eukaryotic cells?",
    ],
    homework: "Complete textbook practice questions 1-4 on chapter 6.",
    teacherScript: "Good morning class! Today we explore how your body turns food into fuel.",
  };

  /* -------------------------------------------------------------------------- */
  /* 1. CONTRACTS & LEGACY COMPATIBILITY                                        */
  /* -------------------------------------------------------------------------- */
  describe("Lesson Content Schema & Compatibility", () => {
    it("successfully parses legacy lesson omitting materials, differentiation, and pacingBreakdown", () => {
      const parsed = LessonContentSchema.safeParse(baseLesson);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.materials).toBeUndefined();
        expect(parsed.data.differentiation).toBeUndefined();
        expect(parsed.data.pacingBreakdown).toBeUndefined();
      }
    });

    it("successfully parses enriched lesson with materials, differentiation, and pacingBreakdown", () => {
      const enrichedLesson = {
        ...baseLesson,
        materials: ["Glucose test strips", "Beakers & yeast", "Reaction worksheets"],
        differentiation: {
          support: "Provide partially completed flowcharts and bilingual vocabulary cards.",
          extension: "Have advanced learners model ATP yield comparisons between fermentation and aerobic respiration.",
        },
        pacingBreakdown: {
          introductionMinutes: 5,
          directInstructionMinutes: 15,
          activityMinutes: 15,
          practiceMinutes: 7,
          assessmentMinutes: 3,
        },
      };

      const parsed = LessonContentSchema.safeParse(enrichedLesson);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.materials).toHaveLength(3);
        expect(parsed.data.materials?.[0]).toBe("Glucose test strips");
        expect(parsed.data.differentiation?.support).toContain("partially completed flowcharts");
        expect(parsed.data.differentiation?.extension).toContain("ATP yield comparisons");
        expect(parsed.data.pacingBreakdown?.activityMinutes).toBe(15);
      }
    });

    it("distinguishes omitted field from explicitly empty array in materials", () => {
      const omitted = LessonContentSchema.safeParse({ ...baseLesson });
      expect(omitted.success).toBe(true);
      if (omitted.success) {
        expect(omitted.data.materials).toBeUndefined();
      }

      const empty = LessonContentSchema.safeParse({ ...baseLesson, materials: [] });
      expect(empty.success).toBe(true);
      if (empty.success) {
        expect(empty.data.materials).toEqual([]);
      }
    });

    it("rejects negative values and non-integers in LessonPacingBreakdownSchema", () => {
      const negativePacing = {
        introductionMinutes: -5,
        directInstructionMinutes: 15,
        activityMinutes: 15,
        practiceMinutes: 10,
        assessmentMinutes: 5,
      };
      const result = LessonPacingBreakdownSchema.safeParse(negativePacing);
      expect(result.success).toBe(false);

      const nonIntPacing = {
        introductionMinutes: 5.5,
        directInstructionMinutes: 15,
        activityMinutes: 15,
        practiceMinutes: 10,
        assessmentMinutes: 5,
      };
      const floatResult = LessonPacingBreakdownSchema.safeParse(nonIntPacing);
      expect(floatResult.success).toBe(false);
    });

    it("UpdateLessonRequestSchema validates update payloads for both legacy and enriched lessons", () => {
      const legacyUpdate = {
        title: "Updated Cellular Respiration",
        content: baseLesson,
      };
      expect(UpdateLessonRequestSchema.safeParse(legacyUpdate).success).toBe(true);

      const enrichedUpdate = {
        title: "Enriched Cellular Respiration",
        content: {
          ...baseLesson,
          materials: ["Microscopes", "Slide sets"],
          differentiation: {
            support: "Visual cues",
            extension: "Research project",
          },
        },
      };
      expect(UpdateLessonRequestSchema.safeParse(enrichedUpdate).success).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. PACING SEMANTICS & TOLERANCE RULES                                      */
  /* -------------------------------------------------------------------------- */
  describe("Pacing Semantics & Validation", () => {
    const context: LessonGenerationContext = {
      classId: "cls-1",
      grade: "9",
      subject: "Biology",
      topic: "Cellular Respiration",
      durationMinutes: 45,
      difficulty: "MEDIUM",
    };

    it("does not require classroomActivity duration to equal total lesson duration", () => {
      const lessonWithShortActivity: LessonContent = {
        ...baseLesson,
        classroomActivity: {
          title: "Mini Check",
          instructions: "Quick 10m exercise",
          durationMinutes: 10, // 10m activity in 45m lesson is completely valid
        },
      };

      const result = LessonOutputValidator.checkPacing(lessonWithShortActivity, context);
      expect(result.isValid).toBe(true);
    });

    it("accepts pacingBreakdown when sum is within max(10m, 25%) tolerance", () => {
      // 45m lesson -> 25% of 45 is 11m -> tolerance = 11m -> acceptable range: 34m - 56m
      const balancedLesson: LessonContent = {
        ...baseLesson,
        pacingBreakdown: {
          introductionMinutes: 5,
          directInstructionMinutes: 15,
          activityMinutes: 15,
          practiceMinutes: 10,
          assessmentMinutes: 5, // sum = 50m (diff = 5m <= 11m)
        },
      };

      const result = LessonOutputValidator.checkPacing(balancedLesson, context);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects pacingBreakdown when sum deviates beyond tolerance", () => {
      const overbudgetLesson: LessonContent = {
        ...baseLesson,
        pacingBreakdown: {
          introductionMinutes: 15,
          directInstructionMinutes: 30,
          activityMinutes: 20,
          practiceMinutes: 20,
          assessmentMinutes: 15, // sum = 100m (deviates by 55m)
        },
      };

      const result = LessonOutputValidator.checkPacing(overbudgetLesson, context);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("deviates significantly from requested duration");
    });

    it("detects and rejects malformed or negative phase durations in pacingBreakdown", () => {
      const malformedLesson: LessonContent = {
        ...baseLesson,
        pacingBreakdown: {
          introductionMinutes: -10 as any,
          directInstructionMinutes: 15,
          activityMinutes: 15,
          practiceMinutes: 10,
          assessmentMinutes: 5,
        },
      };

      const result = LessonOutputValidator.checkPacing(malformedLesson, context);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("must be a non-negative number");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. DIFFERENTIATION ADVISORY QUALITY                                        */
  /* -------------------------------------------------------------------------- */
  describe("Differentiation Quality Standards", () => {
    const context: LessonGenerationContext = {
      classId: "cls-1",
      grade: "9",
      subject: "Biology",
      topic: "Cellular Respiration",
      durationMinutes: 45,
      difficulty: "MEDIUM",
    };

    it("passes educational quality check when optional differentiation is omitted", () => {
      const legacyLesson = { ...baseLesson };
      delete legacyLesson.differentiation;

      const quality = LessonOutputValidator.checkEducationalQuality(legacyLesson, context);
      expect(quality.isAcceptable).toBe(true);
    });

    it("passes educational quality check when differentiation is populated with support and extension", () => {
      const enrichedLesson: LessonContent = {
        ...baseLesson,
        differentiation: {
          support: "Sentence starters and graphic organizers for struggling students.",
          extension: "Design an experiment comparing anaerobic fermentation in yeast.",
        },
      };

      const quality = LessonOutputValidator.checkEducationalQuality(enrichedLesson, context);
      expect(quality.isAcceptable).toBe(true);
      expect(quality.score).toBeGreaterThanOrEqual(90);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. MOCK PROVIDER GENERATION & LOCALIZATION                                 */
  /* -------------------------------------------------------------------------- */
  describe("Mock AI Provider Generation with Extensions", () => {
    it("generates English lesson with materials, differentiation, and balanced pacing", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateLesson({
        classId: "cls-en",
        grade: "8",
        subject: "Physics",
        topic: "Kinetic Energy",
        durationMinutes: 45,
        difficulty: "MEDIUM",
        preferredLanguage: "English",
      });

      expect(result.parsedContent).toBeDefined();
      const content = result.parsedContent!;
      expect(content.materials).toBeDefined();
      expect(content.materials!.length).toBeGreaterThanOrEqual(2);
      expect(content.differentiation?.support).toBeDefined();
      expect(content.differentiation?.extension).toBeDefined();
      expect(content.pacingBreakdown).toBeDefined();

      const pb = content.pacingBreakdown!;
      const sum =
        pb.introductionMinutes +
        pb.directInstructionMinutes +
        pb.activityMinutes +
        pb.practiceMinutes +
        pb.assessmentMinutes;
      expect(sum).toBe(45);
    });

    it("generates Spanish lesson with localized materials and differentiation", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateLesson({
        classId: "cls-es",
        grade: "7",
        subject: "Ciencias",
        topic: "Ecosistemas",
        durationMinutes: 50,
        difficulty: "MEDIUM",
        preferredLanguage: "Spanish",
      });

      const content = result.parsedContent!;
      expect(content.materials?.[0]).toContain("Pizarra blanca");
      expect(content.differentiation?.support).toContain("marcos de oraciones");
      expect(content.differentiation?.extension).toContain("estudiantes avanzados");
    });

    it("generates Hindi lesson with localized materials and differentiation", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateLesson({
        classId: "cls-hi",
        grade: "6",
        subject: "विज्ञान",
        topic: "सौर मंडल",
        durationMinutes: 40,
        difficulty: "MEDIUM",
        preferredLanguage: "Hindi",
      });

      const content = result.parsedContent!;
      expect(content.materials?.[0]).toContain("मार्कर");
      expect(content.differentiation?.support).toContain("वाक्य-ढांचे");
      expect(content.differentiation?.extension).toContain("उन्नत छात्रों");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. PDF RENDERER SAFETY                                                     */
  /* -------------------------------------------------------------------------- */
  describe("PDF Renderer Compatibility", () => {
    it("renders PDF buffer cleanly for enriched lesson with materials, pacing, and differentiation", async () => {
      const enrichedLesson: LessonContent = {
        ...baseLesson,
        materials: ["Safety goggles", "Test tubes", "Hydrochloric acid (0.1M)"],
        pacingBreakdown: {
          introductionMinutes: 5,
          directInstructionMinutes: 15,
          activityMinutes: 15,
          practiceMinutes: 7,
          assessmentMinutes: 3,
        },
        differentiation: {
          support: "Provide step-by-step pictorial lab protocol for emerging readers.",
          extension: "Have advanced students calculate theoretical molar yield.",
        },
      };

      const buffer = await renderLessonPdf({
        id: "les-pdf-1",
        title: "Chemistry Lab",
        subject: "Chemistry",
        topic: "Acid Reactions",
        difficulty: "MEDIUM",
        durationMinutes: 45,
        content: enrichedLesson,
        class: { id: "c-1", name: "Grade 10 Chem" },
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
    });

    it("renders PDF buffer cleanly for legacy lesson omitting optional fields", async () => {
      const buffer = await renderLessonPdf({
        id: "les-pdf-legacy",
        title: "Legacy History Lesson",
        subject: "History",
        topic: "Industrial Revolution",
        durationMinutes: 40,
        content: baseLesson, // no materials, no pacing, no differentiation
        class: { id: "c-2", name: "Grade 9 History" },
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. FRONTEND LESSONEDITOR INTEGRATION & ACCESSIBILITY                       */
  /* -------------------------------------------------------------------------- */
  describe("LessonEditor UI Integration & Accessibility", () => {
    it("renders LessonEditor with materials, pacing, and differentiation controls", () => {
      const onChange = vi.fn();
      render(React.createElement(LessonEditor, { content: baseLesson, onChange }));

      expect(screen.getByTestId("editor-add-material-btn")).toBeDefined();
      expect(screen.getByTestId("editor-enable-pacing-btn")).toBeDefined();
      expect(screen.getByTestId("editor-diff-support")).toBeDefined();
      expect(screen.getByTestId("editor-diff-extension")).toBeDefined();
    });

    it("allows adding a material item and invokes onChange", () => {
      const onChange = vi.fn();
      render(React.createElement(LessonEditor, { content: baseLesson, onChange }));

      const addBtn = screen.getByTestId("editor-add-material-btn");
      fireEvent.click(addBtn);

      expect(onChange).toHaveBeenCalled();
      const updatedCall = onChange.mock.calls[0][0];
      expect(updatedCall.materials).toEqual([""]);
    });

    it("allows editing differentiation support and extension", () => {
      const onChange = vi.fn();
      render(React.createElement(LessonEditor, { content: baseLesson, onChange }));

      const supportInput = screen.getByTestId("editor-diff-support");
      fireEvent.change(supportInput, {
        target: { value: "Provide sentence frames for ESL students." },
      });

      expect(onChange).toHaveBeenCalled();
      const updatedCall = onChange.mock.calls[0][0];
      expect(updatedCall.differentiation.support).toBe("Provide sentence frames for ESL students.");
    });

    it("allows editing configured pacing breakdown phases", () => {
      const onChange = vi.fn();
      const lessonWithPacing: LessonContent = {
        ...baseLesson,
        pacingBreakdown: {
          introductionMinutes: 5,
          directInstructionMinutes: 15,
          activityMinutes: 15,
          practiceMinutes: 7,
          assessmentMinutes: 3,
        },
      };

      render(React.createElement(LessonEditor, { content: lessonWithPacing, onChange }));

      const introInput = screen.getByTestId("editor-pacing-intro");
      fireEvent.change(introInput, { target: { value: "8" } });

      expect(onChange).toHaveBeenCalled();
      const updatedCall = onChange.mock.calls[0][0];
      expect(updatedCall.pacingBreakdown.introductionMinutes).toBe(8);
    });

    it("confirms button touch target standards for mobile accessibility", () => {
      const onChange = vi.fn();
      const lessonWithMaterials: LessonContent = {
        ...baseLesson,
        materials: ["Safety Goggles"],
      };

      render(React.createElement(LessonEditor, { content: lessonWithMaterials, onChange }));

      const addBtn = screen.getByTestId("editor-add-material-btn");
      expect(addBtn.className).toContain("min-h-[44px]");

      const removeBtn = screen.getByTestId("editor-remove-material-0");
      expect(removeBtn.className).toContain("min-w-[44px]");
      expect(removeBtn.className).toContain("min-h-[44px]");
      expect(removeBtn.getAttribute("aria-label")).toBe("Remove material 1");
    });
  });
});
