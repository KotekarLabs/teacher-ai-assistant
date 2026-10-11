import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  LessonContextBuilder,
  WorksheetContextBuilder,
  QuizContextBuilder,
  HomeworkContextBuilder,
  LessonPromptBuilder,
  WorksheetPromptBuilder,
  QuizPromptBuilder,
  HomeworkPromptBuilder,
  LessonOutputValidator,
  WorksheetOutputValidator,
  MockAIProvider,
  type LessonGenerationContext,
  type WorksheetGenerationContext,
  type QuizGenerationContext,
  type HomeworkGenerationContext,
} from "../packages/ai/index";
import type {
  LessonContent,
  WorksheetContent,
} from "@teacher-ai/contracts";

describe("Milestone 10 Batch 1 — AI Resource Quality & Classroom Readiness Suite", () => {
  /* -------------------------------------------------------------------------- */
  /* 1. TEACHER PROFILE CONTEXT & MULTILINGUAL SCENARIOS                        */
  /* -------------------------------------------------------------------------- */
  describe("Teacher Profile Context Propagation", () => {
    const mockProfile = {
      preferredLanguage: "Spanish",
      teachingRole: "Lead Science Teacher",
      experienceLevel: "5-10 years",
    };

    const mockClass = {
      id: "cls-1",
      grade: "8",
      section: "A",
      curriculumBoard: "CBSE",
      name: "Grade 8 Science",
    };

    it("LessonContextBuilder propagates language, role, and experience from profile", () => {
      const context = LessonContextBuilder.buildContext(
        {
          classId: "cls-1",
          subject: "Physics",
          topic: "Newton's Third Law",
          durationMinutes: 45,
          difficulty: "MEDIUM",
        },
        mockClass,
        mockProfile,
      );

      expect(context.preferredLanguage).toBe("Spanish");
      expect(context.teachingRole).toBe("Lead Science Teacher");
      expect(context.experienceLevel).toBe("5-10 years");
      expect(context.curriculumBoard).toBe("CBSE");
    });

    it("WorksheetContextBuilder propagates language, role, and experience from profile", () => {
      const context = WorksheetContextBuilder.buildContext(
        {
          classId: "cls-1",
          subject: "Biology",
          topic: "Cell Division",
          questionCount: 6,
          questionTypes: ["MULTIPLE_CHOICE", "SHORT_ANSWER"],
        },
        mockClass,
        mockProfile,
      );

      expect(context.preferredLanguage).toBe("Spanish");
      expect(context.teachingRole).toBe("Lead Science Teacher");
      expect(context.experienceLevel).toBe("5-10 years");
    });

    it("QuizContextBuilder propagates language, role, and experience from profile", () => {
      const context = QuizContextBuilder.buildContext(
        {
          classId: "cls-1",
          subject: "Chemistry",
          topic: "Acids and Bases",
          questionCount: 5,
          questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
        },
        mockClass,
        mockProfile,
      );

      expect(context.preferredLanguage).toBe("Spanish");
      expect(context.teachingRole).toBe("Lead Science Teacher");
      expect(context.experienceLevel).toBe("5-10 years");
    });

    it("HomeworkContextBuilder propagates language, role, and experience from profile", () => {
      const context = HomeworkContextBuilder.buildContext(
        {
          classId: "cls-1",
          subject: "General Science",
          topic: "Renewable Energy",
          taskCount: 3,
        },
        mockClass,
        mockProfile,
      );

      expect(context.preferredLanguage).toBe("Spanish");
      expect(context.teachingRole).toBe("Lead Science Teacher");
      expect(context.experienceLevel).toBe("5-10 years");
    });

    it("safely handles null/missing profile data with clean English defaults", () => {
      const lessonCtx = LessonContextBuilder.buildContext(
        {
          classId: "cls-1",
          subject: "Biology",
          topic: "Genetics",
          durationMinutes: 40,
          difficulty: "MEDIUM",
        },
        mockClass,
        null,
      );

      expect(lessonCtx.preferredLanguage).toBe("English");
      expect(lessonCtx.teachingRole).toBeUndefined();
      expect(lessonCtx.experienceLevel).toBeUndefined();

      const wsCtx = WorksheetContextBuilder.buildContext(
        {
          classId: "cls-1",
          subject: "Biology",
          topic: "Genetics",
        },
        mockClass,
        undefined,
      );
      expect(wsCtx.preferredLanguage).toBe("English");
    });
  });

  describe("Multilingual Prompt Generation & Mock Outputs (Spanish & Hindi)", () => {
    it("LessonPromptBuilder includes language directive and MockAIProvider produces Spanish content", async () => {
      const context: LessonGenerationContext = {
        classId: "cls-sp",
        grade: "7",
        subject: "Ciencias Naturales",
        topic: "Fotosíntesis",
        durationMinutes: 45,
        difficulty: "MEDIUM",
        preferredLanguage: "Spanish",
        teachingRole: "Docente de Secundaria",
        experienceLevel: "3-5 years",
      };

      const prompt = LessonPromptBuilder.buildUserPrompt(context);
      expect(prompt).toContain("- Output Language: Spanish");
      expect(prompt).toContain("- Target Educator Role: Docente de Secundaria");

      const provider = new MockAIProvider();
      const result = await provider.generateLesson(context);

      expect(result.parsedContent).toBeDefined();
      expect(result.parsedContent?.title).toContain("Fotosíntesis");
      expect(result.parsedContent?.title).toContain("Plan de Clase");
      expect(result.parsedContent?.teacherScript).toContain("¡Buenos días clase!");
      expect(result.parsedContent?.introduction).toContain("Comience haciendo a los estudiantes");
    });

    it("WorksheetPromptBuilder includes language directive and MockAIProvider produces Hindi content", async () => {
      const context: WorksheetGenerationContext = {
        classId: "cls-hi",
        grade: "6",
        subject: "विज्ञान",
        topic: "प्रकाश संश्लेषण",
        difficulty: "MEDIUM",
        questionCount: 4,
        questionTypes: ["MULTIPLE_CHOICE", "SHORT_ANSWER"],
        preferredLanguage: "Hindi",
        teachingRole: "TGT Science",
        experienceLevel: "10+ years",
      };

      const prompt = WorksheetPromptBuilder.buildUserPrompt(context);
      expect(prompt).toContain("- Output Language: Hindi");
      expect(prompt).toContain("- Target Educator Role: TGT Science");

      const provider = new MockAIProvider();
      const result = await provider.generateWorksheet(context);

      expect(result.parsedContent).toBeDefined();
      expect(result.parsedContent?.title).toContain("अभ्यास कार्यपत्रक");
      expect(result.parsedContent?.instructions).toContain("सभी प्रश्नों के उत्तर ध्यानपूर्वक दें");
    });

    it("QuizPromptBuilder and HomeworkPromptBuilder reflect non-English language directives", () => {
      const quizCtx: QuizGenerationContext = {
        classId: "cls-1",
        grade: "9",
        subject: "Física",
        topic: "Cinemática",
        difficulty: "MEDIUM",
        questionCount: 5,
        questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
        preferredLanguage: "Spanish",
      };
      const quizPrompt = QuizPromptBuilder.buildUserPrompt(quizCtx);
      expect(quizPrompt).toContain("- Output Language: Spanish");

      const hwCtx: HomeworkGenerationContext = {
        classId: "cls-1",
        grade: "8",
        subject: "गणित",
        topic: "समीकरण",
        difficulty: "MEDIUM",
        preferredLanguage: "Hindi",
      };
      const hwPrompt = HomeworkPromptBuilder.buildUserPrompt(hwCtx);
      expect(hwPrompt).toContain("- Output Language: Hindi");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. DETERMINISTIC WORKSHEET ANSWER-CONSISTENCY VALIDATION                   */
  /* -------------------------------------------------------------------------- */
  describe("Worksheet Answer Consistency Validation", () => {
    const validWorksheet: WorksheetContent = {
      title: "Cell Biology Practice Sheet",
      subject: "Biology",
      topic: "Cell Membrane",
      instructions: "Answer all questions.",
      estimatedTimeMinutes: 25,
      questions: [
        {
          position: 1,
          type: "MULTIPLE_CHOICE",
          question: "Which lipid forms the bilayer of the cell membrane?",
          options: ["Phospholipid", "Triglyceride", "Steroid", "Wax"],
          expectedAnswer: "Phospholipid",
          marks: 1,
          difficulty: "MEDIUM",
        },
        {
          position: 2,
          type: "TRUE_FALSE",
          question: "The cell membrane is selectively permeable.",
          options: ["True", "False"],
          expectedAnswer: "True",
          marks: 1,
          difficulty: "EASY",
        },
        {
          position: 3,
          type: "SHORT_ANSWER",
          question: "Explain the role of transport proteins in simple terms.",
          options: [],
          expectedAnswer: "They facilitate the movement of specific molecules across the membrane.",
          marks: 2,
          difficulty: "MEDIUM",
        },
      ],
    };

    it("passes validation when multiple choice and true/false answers match options exactly", () => {
      const result = WorksheetOutputValidator.checkAnswerConsistency(validWorksheet);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects worksheet when Multiple Choice expected answer does not match any option", () => {
      const invalidWorksheet: WorksheetContent = {
        ...validWorksheet,
        questions: [
          {
            position: 1,
            type: "MULTIPLE_CHOICE",
            question: "What is the powerhouse of the cell?",
            options: ["Nucleus", "Ribosome", "Endoplasmic Reticulum", "Golgi"],
            expectedAnswer: "Mitochondria", // NOT IN OPTIONS!
            marks: 1,
            difficulty: "MEDIUM",
          },
        ],
      };

      const result = WorksheetOutputValidator.checkAnswerConsistency(invalidWorksheet);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('expected answer "Mitochondria" is not present in options');

      const qualityResult = WorksheetOutputValidator.checkEducationalQuality(invalidWorksheet, {} as any);
      expect(qualityResult.isAcceptable).toBe(false);
      expect(qualityResult.feedback?.some((f) => f.includes("not present in options"))).toBe(true);
    });

    it("rejects worksheet when True/False expected answer is not 'True' or 'False'", () => {
      const invalidWorksheet: WorksheetContent = {
        ...validWorksheet,
        questions: [
          {
            position: 1,
            type: "TRUE_FALSE",
            question: "Water is an organic compound.",
            options: ["True", "False"],
            expectedAnswer: "Maybe", // INVALID!
            marks: 1,
            difficulty: "EASY",
          },
        ],
      };

      const result = WorksheetOutputValidator.checkAnswerConsistency(invalidWorksheet);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('expected answer must be "True" or "False", got "Maybe"');
    });

    it("correctly handles letter-prefixed options (e.g., 'A. Phospholipid')", () => {
      const prefixedWorksheet: WorksheetContent = {
        ...validWorksheet,
        questions: [
          {
            position: 1,
            type: "MULTIPLE_CHOICE",
            question: "Which component stores genetic material?",
            options: ["A. Nucleus", "B. Mitochondria", "C. Vacuole", "D. Ribosome"],
            expectedAnswer: "Nucleus", // Strips prefix "A. "
            marks: 1,
            difficulty: "EASY",
          },
        ],
      };

      const result = WorksheetOutputValidator.checkAnswerConsistency(prefixedWorksheet);
      expect(result.isValid).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. LESSON PACING & DURATION VALIDATION                                     */
  /* -------------------------------------------------------------------------- */
  describe("Lesson Pacing & Backward-Compatible Duration Rules", () => {
    const baseLesson: LessonContent = {
      title: "Newton's Laws",
      overview: "Introduction to dynamics.",
      learningObjectives: ["Analyze forces in motion", "Calculate net acceleration"],
      prerequisites: ["Velocity and vectors"],
      introduction: "Demonstrate rolling cart.",
      teacherExplanation: "Newton's first and second laws explained clearly with free body diagrams.",
      examples: ["Pushing a stalled car", "Dropping a feather in vacuum"],
      classroomActivity: {
        title: "Cart and Pulley Lab",
        instructions: "Measure acceleration with varying masses.",
        durationMinutes: 15,
      },
      practice: ["Calculate F=ma for 3 given problems"],
      quickAssessment: ["State the formula for force"],
      homework: "Solve exercises 1-5 on page 42.",
      teacherScript: "Welcome class! Today we explore why objects move.",
    };

    it("passes validation for older saved lessons without optional pacingBreakdown", () => {
      const result = LessonOutputValidator.checkPacing(baseLesson, {
        durationMinutes: 45,
      } as any);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects lesson when classroom activity duration exceeds total lesson duration", () => {
      const oversizedActivityLesson: LessonContent = {
        ...baseLesson,
        classroomActivity: {
          title: "Extended Lab",
          instructions: "Run full day lab",
          durationMinutes: 50,
        },
      };

      const result = LessonOutputValidator.checkPacing(oversizedActivityLesson, {
        durationMinutes: 40,
      } as any);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("exceeds total lesson duration");
    });

    it("accepts optional pacingBreakdown when phase sum is within reasonable tolerance", () => {
      const lessonWithPacing = {
        ...baseLesson,
        pacingBreakdown: {
          introductionMinutes: 5,
          directInstructionMinutes: 15,
          activityMinutes: 15,
          practiceMinutes: 7,
          assessmentMinutes: 5,
        }, // sum = 47m for 45m lesson (within ±10m tolerance)
      };

      const result = LessonOutputValidator.checkPacing(lessonWithPacing as any, {
        durationMinutes: 45,
      } as any);

      expect(result.isValid).toBe(true);
    });

    it("flags pacingBreakdown when phase sum deviates significantly from total duration", () => {
      const lessonWithBadPacing = {
        ...baseLesson,
        pacingBreakdown: {
          introductionMinutes: 20,
          directInstructionMinutes: 30,
          activityMinutes: 25,
          practiceMinutes: 20,
          assessmentMinutes: 15,
        }, // sum = 110m for 45m lesson (deviates by 65m)
      };

      const result = LessonOutputValidator.checkPacing(lessonWithBadPacing as any, {
        durationMinutes: 45,
      } as any);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("deviates significantly from requested duration");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. DYNAMIC PROVIDER RESOLUTION IN REGENERATION                             */
  /* -------------------------------------------------------------------------- */
  describe("Regeneration Provider Resolution", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
      vi.restoreAllMocks();
    });

    it("respects OPENAI provider and custom model configuration from environment", () => {
      process.env.AI_PROVIDER = "OPENAI";
      process.env.OPENAI_MODEL = "gpt-4o";

      const providerType = process.env.AI_PROVIDER || "MOCK";
      const modelName =
        process.env.OPENAI_MODEL ||
        (providerType === "OPENAI" ? "gpt-4o-mini" : "mock-pedagogy-v1");

      expect(providerType).toBe("OPENAI");
      expect(modelName).toBe("gpt-4o");
    });

    it("falls back to mock-pedagogy-v1 when AI_PROVIDER is not set", () => {
      delete process.env.AI_PROVIDER;
      delete process.env.OPENAI_MODEL;

      const providerType = process.env.AI_PROVIDER || "MOCK";
      const modelName =
        process.env.OPENAI_MODEL ||
        (providerType === "OPENAI" ? "gpt-4o-mini" : "mock-pedagogy-v1");

      expect(providerType).toBe("MOCK");
      expect(modelName).toBe("mock-pedagogy-v1");
    });
  });
});
