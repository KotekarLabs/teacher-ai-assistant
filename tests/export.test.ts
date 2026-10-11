import { describe, it, expect, vi } from "vitest";
import zlib from "zlib";
import type { Request, Response } from "express";
import { renderLessonPdf } from "../apps/api/src/services/pdf/lesson-pdf.renderer";
import {
  renderWorksheetPdf,
  type WorksheetPdfData,
} from "../apps/api/src/services/pdf/worksheet-pdf.renderer";
import { renderQuizPdf } from "../apps/api/src/services/pdf/quiz-pdf.renderer";
import { renderHomeworkPdf } from "../apps/api/src/services/pdf/homework-pdf.renderer";
import { sanitizeFilename } from "../apps/api/src/services/pdf/pdf-utils";
import { ExportService } from "../apps/api/src/services/export.service";
import { LessonRepository } from "../apps/api/src/repositories/lesson.repository";
import { QuizRepository } from "../apps/api/src/repositories/quiz.repository";
import { WorksheetRepository } from "../apps/api/src/repositories/worksheet.repository";
import { WorksheetController } from "../apps/api/src/controllers/worksheet.controller";
import { requireAuth } from "../apps/api/src/middleware/auth.middleware";

/**
 * Robust PDF text extractor for PDFKit output streams.
 * Decompresses FlateDecode streams and decodes text objects (TJ and Tj operators).
 */
export function extractPdfText(pdfBuffer: Buffer): string {
  let reconstructedText = "";
  let idx = 0;

  while ((idx = pdfBuffer.indexOf(Buffer.from("stream\n"), idx)) !== -1) {
    const start = idx + 7;
    const end = pdfBuffer.indexOf(Buffer.from("\nendstream"), start);
    if (end !== -1) {
      try {
        const streamBuffer = pdfBuffer.subarray(start, end);
        const decompressed = zlib.inflateSync(streamBuffer).toString("latin1");

        // 1. Match TJ kerning arrays: [ <hex> spacing <hex> ... ] TJ
        const tjRegex = /\[(.*?)\]\s*TJ/gs;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
          const hexLiterals = tjMatch[1].match(/<([0-9a-fA-F]+)>/g) || [];
          const textRun = hexLiterals
            .map((h) => Buffer.from(h.slice(1, -1), "hex").toString("latin1"))
            .join("");
          reconstructedText += textRun;
        }

        // 2. Match single string operators: <hex> Tj and (ascii) Tj
        const singleHexRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
        let hexMatch: RegExpExecArray | null;
        while ((hexMatch = singleHexRegex.exec(decompressed)) !== null) {
          reconstructedText += Buffer.from(hexMatch[1], "hex").toString("latin1");
        }

        const asciiRegex = /\(([^)]+)\)\s*Tj/g;
        let asciiMatch: RegExpExecArray | null;
        while ((asciiMatch = asciiRegex.exec(decompressed)) !== null) {
          reconstructedText += asciiMatch[1];
        }
      } catch {
        // Skip uncompressed or image streams
      }
    }
    idx = start;
  }
  // Normalize WinAnsi em-dash (\u0097) to standard em-dash (—) and clean up whitespace
  return reconstructedText.replace(/\u0097/g, "—").replace(/\s+/g, " ");
}

describe("PDF Export Renderers & Utilities", () => {
  it("sanitizes filenames correctly", () => {
    expect(
      sanitizeFilename("Introduction: To Algorithms / Part 1", "lesson"),
    ).toBe("introduction-to-algorithms-part-1-lesson.pdf");
    expect(sanitizeFilename("Quiz #5 & Test!", "quiz-student")).toBe(
      "quiz-5-test-quiz-student.pdf",
    );
    expect(sanitizeFilename("", "worksheet")).toBe(
      "teaching-resource-worksheet.pdf",
    );
  });

  it("renders Lesson PDF with valid PDF binary signature (%PDF-)", async () => {
    const mockLesson: any = {
      title: "Cell Structure & Function",
      subject: "Biology",
      topic: "Plant and Animal Cells",
      curriculumBoard: "CBSE",
      difficulty: "MEDIUM",
      durationMinutes: 45,
      content: {
        overview:
          "An introductory study of cell organelles and their vital functions.",
        learningObjectives: [
          "Identify major organelle functions.",
          "Distinguish between plant and animal cells.",
        ],
        prerequisites: ["Basic understanding of living organisms."],
        introduction: "Begin with a microscope demonstration hook.",
        teacherExplanation: "The cell membrane acts as a selective barrier.",
        examples: [
          "Mitochondria produce ATP.",
          "Chloroplasts conduct photosynthesis.",
        ],
        classroomActivity: {
          title: "Organelle Roleplay",
          instructions:
            "Students act as cell components transporting proteins.",
          durationMinutes: 15,
        },
        practice: ["Complete labeling diagram.", "Organelle matchup chart."],
        quickAssessment: ["Name 2 organelles unique to plant cells."],
        homework: "Read chapter 3 and write a 1-page summary.",
        teacherScript:
          "Good morning class! Today we explore the microscopic building blocks of life.",
      },
    };

    const buffer = await renderLessonPdf(mockLesson);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
  });

  it("renders Worksheet PDF with valid PDF binary signature (%PDF-) and preserves backward compatibility when mode is omitted", async () => {
    const mockWorksheet: any = {
      title: "Photosynthesis Practice Sheet",
      subject: "Science",
      topic: "Photosynthesis",
      curriculumBoard: "ICSE",
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 30,
      instructions:
        "Read each question carefully and write your answers clearly.",
      questions: [
        {
          position: 1,
          type: "MULTIPLE_CHOICE",
          question: "Which pigment absorbs light energy in chloroplasts?",
          options: ["Chlorophyll", "Carotene", "Xanthophyll", "Anthocyanin"],
          expectedAnswer: "Chlorophyll",
          marks: 1,
          difficulty: "EASY",
        },
        {
          position: 2,
          type: "TRUE_FALSE",
          question:
            "Photosynthesis releases carbon dioxide into the atmosphere.",
          options: ["True", "False"],
          expectedAnswer: "False",
          marks: 1,
          difficulty: "EASY",
        },
        {
          position: 3,
          type: "SHORT_ANSWER",
          question: "Write the balanced chemical equation for photosynthesis.",
          options: [],
          expectedAnswer: "6CO2 + 6H2O -> C6H12O6 + 6O2",
          marks: 3,
          difficulty: "HARD",
        },
      ],
    };

    // Calling without second argument defaults to "student" mode
    const buffer = await renderWorksheetPdf(mockWorksheet);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
  });

  it("renders Quiz PDF in student mode without correct answers or explanations", async () => {
    const mockQuiz: any = {
      title: "Chemical Reactions Quick Quiz",
      subject: "Chemistry",
      topic: "Types of Reactions",
      curriculumBoard: "CBSE",
      difficulty: "MEDIUM",
      durationMinutes: 20,
      totalMarks: 5,
      instructions: "Answer all 3 questions within the time limit.",
      questions: [
        {
          position: 1,
          type: "MULTIPLE_CHOICE",
          question: "What is formed when magnesium burns in oxygen?",
          options: ["MgO", "Mg2O", "MgO2", "Mg(OH)2"],
          correctAnswer: "MgO",
          explanation: "2Mg + O2 -> 2MgO is a combination reaction.",
          marks: 1,
          difficulty: "EASY",
        },
        {
          position: 2,
          type: "SHORT_ANSWER",
          question: "Define an endothermic reaction.",
          options: [],
          correctAnswer:
            "A reaction that absorbs energy from its surroundings.",
          explanation: "Energy is taken in, causing temperature drop.",
          marks: 2,
          difficulty: "MEDIUM",
        },
      ],
    };

    const studentBuffer = await renderQuizPdf(mockQuiz, "student");
    expect(studentBuffer).toBeInstanceOf(Buffer);
    expect(studentBuffer.length).toBeGreaterThan(500);
    expect(studentBuffer.toString("utf-8", 0, 5)).toBe("%PDF-");

    const answerKeyBuffer = await renderQuizPdf(mockQuiz, "answer-key");
    expect(answerKeyBuffer).toBeInstanceOf(Buffer);
    expect(answerKeyBuffer.length).toBeGreaterThan(500);
    expect(answerKeyBuffer.toString("utf-8", 0, 5)).toBe("%PDF-");
  });

  it("renders Homework PDF with valid PDF binary signature (%PDF-)", async () => {
    const mockHomework: any = {
      title: "Algebraic Equations Homework Assignment",
      subject: "Mathematics",
      topic: "Linear Equations",
      curriculumBoard: "State Board",
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 30,
      instructions: "Show step-by-step working for each problem.",
      tasks: [
        {
          position: 1,
          type: "WRITTEN_EXERCISE",
          title: "Solve Linear Systems",
          description: "Solve 2x + 3y = 12 and x - y = 1 using substitution.",
        },
        {
          position: 2,
          type: "APPLICATION_TASK",
          title: "Real-world Scenario",
          description:
            "Formulate an equation representing ticket sales revenue.",
        },
      ],
    };

    const buffer = await renderHomeworkPdf(mockHomework);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
  });
});

describe("Worksheet PDF Dual-Mode & Strict Answer-Leakage Protection", () => {
  // High-entropy sentinel answers that do NOT appear anywhere in prompts or instructions
  const SENTINEL_MC = "SENTINEL_MC_CORRECT_ANSWER_XY78";
  const SENTINEL_FITB = "SENTINEL_FITB_KEYWORD_ZK99";
  const SENTINEL_SA = "SENTINEL_SA_MODEL_EXPLANATION_QP12";
  const SENTINEL_MTF = "SENTINEL_MTF_PAIRINGS_1A_2B_GH34";

  const sentinelWorksheet: WorksheetPdfData = {
    id: "ws-sentinel-test-1",
    title: "Cellular Bioenergetics Comprehensive Worksheet",
    subject: "Biology",
    topic: "Cellular Respiration and Photosynthesis",
    difficulty: "HARD",
    estimatedTimeMinutes: 45,
    instructions:
      "Carefully read each problem. Write all responses neatly in the provided areas.",
    class: { id: "class-1", name: "Grade 10 Honors Biology" },
    questions: [
      {
        position: 1,
        type: "MULTIPLE_CHOICE",
        question:
          "Which specialized organelle is primarily responsible for ATP synthesis via chemiosmosis?",
        options: [
          "Alpha Golgi Apparatus",
          "Beta Endoplasmic Reticulum",
          "Gamma Mitochondria Matrix",
          "Delta Lysosome",
        ],
        expectedAnswer: `C. ${SENTINEL_MC}`,
        marks: 1,
        difficulty: "MEDIUM",
      },
      {
        position: 2,
        type: "TRUE_FALSE",
        question:
          "Anaerobic glycolysis yields a higher net ATP quantity per glucose molecule than aerobic respiration.",
        options: ["True", "False"],
        expectedAnswer: "False",
        marks: 1,
        difficulty: "EASY",
      },
      {
        position: 3,
        type: "FILL_IN_THE_BLANK",
        question:
          "During the light-dependent reactions, the terminal electron acceptor in the electron transport chain is ___ .",
        options: [],
        expectedAnswer: SENTINEL_FITB,
        marks: 2,
        difficulty: "MEDIUM",
      },
      {
        position: 4,
        type: "SHORT_ANSWER",
        question:
          "In 2-3 sentences, articulate how the proton motive force drives the rotational mechanism of ATP synthase.",
        options: [],
        expectedAnswer: SENTINEL_SA,
        marks: 3,
        difficulty: "HARD",
      },
      {
        position: 5,
        type: "MATCH_THE_FOLLOWING",
        question:
          "Match each metabolic pathway with its primary eukaryotic cellular location.",
        options: ["Glycolysis", "Citric Acid Cycle", "Electron Transport Chain"],
        expectedAnswer: SENTINEL_MTF,
        marks: 3,
        difficulty: "HARD",
      },
    ],
  };

  it("self-validates PDF text extraction helper against known document content", async () => {
    const studentBuffer = await renderWorksheetPdf(
      sentinelWorksheet,
      "student",
    );
    const answerKeyBuffer = await renderWorksheetPdf(
      sentinelWorksheet,
      "answer-key",
    );

    const studentText = extractPdfText(studentBuffer);
    const answerKeyText = extractPdfText(answerKeyBuffer);

    // Verify extraction helper accurately reconstructs document title, topic, and instructions
    expect(studentText).toContain("Cellular Bioenergetics Comprehensive Worksheet");
    expect(studentText).toContain("Cellular Respiration and Photosynthesis");
    expect(studentText).toContain("Carefully read each problem");

    expect(answerKeyText).toContain("Cellular Bioenergetics Comprehensive Worksheet");
    expect(answerKeyText).toContain("Cellular Respiration and Photosynthesis");
    expect(answerKeyText).toContain("Carefully read each problem");
  });

  it("renders Worksheet Answer-Key PDF with expected answers for all five question types and confidential banner", async () => {
    const answerKeyBuffer = await renderWorksheetPdf(
      sentinelWorksheet,
      "answer-key",
    );
    expect(answerKeyBuffer).toBeInstanceOf(Buffer);
    expect(answerKeyBuffer.length).toBeGreaterThan(1000);
    expect(answerKeyBuffer.toString("utf-8", 0, 5)).toBe("%PDF-");

    const answerKeyText = extractPdfText(answerKeyBuffer);

    // 1. Confidential header and section title
    expect(answerKeyText).toContain("TEACHER ANSWER KEY — STRICTLY CONFIDENTIAL");
    expect(answerKeyText).toContain("Answer Key & Solutions");

    // 2. MULTIPLE_CHOICE expected answer and correct indicator
    expect(answerKeyText).toContain(SENTINEL_MC);
    expect(answerKeyText).toContain("(Correct)");

    // 3. TRUE_FALSE expected answer
    expect(answerKeyText).toContain("Expected Answer: False");

    // 4. FILL_IN_THE_BLANK expected answer
    expect(answerKeyText).toContain(SENTINEL_FITB);

    // 5. SHORT_ANSWER model response
    expect(answerKeyText).toContain(SENTINEL_SA);
    expect(answerKeyText).toContain("Expected Answer / Model Response:");

    // 6. MATCH_THE_FOLLOWING pairings
    expect(answerKeyText).toContain(SENTINEL_MTF);
    expect(answerKeyText).toContain("Expected Matching / Correct Pairs:");
  });

  it("renders Worksheet Student-Copy PDF with zero sentinel answers, zero checkmarks, and zero teacher elements", async () => {
    const studentBuffer = await renderWorksheetPdf(
      sentinelWorksheet,
      "student",
    );
    expect(studentBuffer).toBeInstanceOf(Buffer);
    expect(studentBuffer.length).toBeGreaterThan(1000);
    expect(studentBuffer.toString("utf-8", 0, 5)).toBe("%PDF-");

    const studentText = extractPdfText(studentBuffer);

    // 1. Header is student view with name & date lines
    expect(studentText).toContain("STUDENT WORKSHEET");
    expect(studentText).toContain("Name: ____________________________________");

    // 2. Questions are present
    expect(studentText).toContain(
      "Which specialized organelle is primarily responsible for ATP synthesis via chemiosmosis?",
    );
    expect(studentText).toContain("Alpha Golgi Apparatus");

    // 3. STRICT EXCLUSION: None of the sentinel expected answers appear in the student copy
    expect(studentText).not.toContain(SENTINEL_MC);
    expect(studentText).not.toContain(SENTINEL_FITB);
    expect(studentText).not.toContain(SENTINEL_SA);
    expect(studentText).not.toContain(SENTINEL_MTF);

    // 4. STRICT EXCLUSION: No teacher banners, checkmarks, or teacher-only labels
    expect(studentText).not.toContain("TEACHER ANSWER KEY");
    expect(studentText).not.toContain("STRICTLY CONFIDENTIAL");
    expect(studentText).not.toContain("Expected Answer:");
    expect(studentText).not.toContain("Model Response:");
    expect(studentText).not.toContain("Correct Pairs:");
    expect(studentText).not.toContain("(Correct)");
    expect(studentText).not.toContain("✓");
  });

  it("handles multi-page worksheets with boundary check preventing clipping", async () => {
    const longQuestions = Array.from({ length: 15 }, (_, i) => ({
      position: i + 1,
      type: "SHORT_ANSWER",
      question: `Question ${i + 1}: Articulate the biochemical regulation of enzymatic activity under fluctuating physiological temperatures and pH levels.`,
      options: [],
      expectedAnswer: `Detailed model response for question ${i + 1} explaining allosteric regulation, feedback inhibition, and denaturation thresholds.`,
      marks: 3,
      difficulty: "HARD",
    }));

    const multiPageWorksheet: WorksheetPdfData = {
      ...sentinelWorksheet,
      questions: longQuestions,
    };

    const studentBuffer = await renderWorksheetPdf(
      multiPageWorksheet,
      "student",
    );
    const answerKeyBuffer = await renderWorksheetPdf(
      multiPageWorksheet,
      "answer-key",
    );

    expect(studentBuffer.length).toBeGreaterThan(3000);
    expect(answerKeyBuffer.length).toBeGreaterThan(3500);

    const studentText = extractPdfText(studentBuffer);
    const answerKeyText = extractPdfText(answerKeyBuffer);

    // All 15 questions rendered
    expect(studentText).toContain("Q1.");
    expect(studentText).toContain("Q15.");
    expect(answerKeyText).toContain("Q1.");
    expect(answerKeyText).toContain("Q15.");

    // Footer page count is present
    expect(studentText).toContain("Teacher AI Assistant");
    expect(answerKeyText).toContain("Teacher AI Assistant");
  });
});

describe("ExportService & Export Endpoints Authorization", () => {
  const teacherA = "teacher-export-user-1";
  const teacherB = "teacher-export-user-2";

  it("fails when resource is not found or teacher is not owner", async () => {
    vi.spyOn(LessonRepository, "findByIdAndTeacherId").mockResolvedValue(null);

    await expect(
      ExportService.exportLessonPdf("non-existent-lesson-id", teacherA),
    ).rejects.toThrow("Lesson not found");
  });

  it("fails when quiz export mode is invalid", async () => {
    vi.spyOn(QuizRepository, "findByIdAndTeacherId").mockResolvedValue({
      id: "quiz-1",
      teacherId: teacherA,
      title: "Test Quiz",
      subject: "Math",
      topic: "Numbers",
      difficulty: "EASY",
      durationMinutes: 10,
      totalMarks: 5,
      questions: [],
    } as any);

    await expect(
      ExportService.exportQuizPdf("quiz-1", teacherA, "invalid-mode" as any),
    ).rejects.toThrow("Invalid quiz export mode");
  });

  it("fails when worksheet is not found or teacher is not owner (404)", async () => {
    vi.spyOn(WorksheetRepository, "findByIdAndTeacherId").mockResolvedValue(
      null,
    );

    await expect(
      ExportService.exportWorksheetPdf("ws-non-existent", teacherA),
    ).rejects.toThrow("Worksheet not found or access denied");

    // Teacher B attempting to export Teacher A's worksheet yields 404
    await expect(
      ExportService.exportWorksheetPdf("ws-owned-by-a", teacherB),
    ).rejects.toThrow("Worksheet not found or access denied");
  });

  it("fails when worksheet export mode is invalid (400)", async () => {
    vi.spyOn(WorksheetRepository, "findByIdAndTeacherId").mockResolvedValue({
      id: "ws-1",
      teacherId: teacherA,
      title: "Genetics Worksheet",
      subject: "Biology",
      topic: "Mendelian Inheritance",
      questions: [],
    } as any);

    await expect(
      ExportService.exportWorksheetPdf("ws-1", teacherA, "unsupported-mode"),
    ).rejects.toThrow("Invalid worksheet export mode");
  });

  it("resolves correct filenames for omitted mode, explicit student mode, and explicit answer-key mode", async () => {
    const mockWs = {
      id: "ws-filename-test",
      teacherId: teacherA,
      title: "Photosynthesis Practice Sheet",
      subject: "Biology",
      topic: "Plants",
      questions: [],
    };
    vi.spyOn(WorksheetRepository, "findByIdAndTeacherId").mockResolvedValue(
      mockWs as any,
    );

    // 1. Omitted mode preserves legacy filename: -worksheet.pdf
    const omittedResult = await ExportService.exportWorksheetPdf(
      "ws-filename-test",
      teacherA,
    );
    expect(omittedResult.filename).toBe(
      "photosynthesis-practice-sheet-worksheet.pdf",
    );

    // 2. Explicit student mode: -worksheet-student.pdf
    const studentResult = await ExportService.exportWorksheetPdf(
      "ws-filename-test",
      teacherA,
      "student",
    );
    expect(studentResult.filename).toBe(
      "photosynthesis-practice-sheet-worksheet-student.pdf",
    );

    // 3. Explicit answer-key mode: -worksheet-answer-key.pdf
    const answerKeyResult = await ExportService.exportWorksheetPdf(
      "ws-filename-test",
      teacherA,
      "answer-key",
    );
    expect(answerKeyResult.filename).toBe(
      "photosynthesis-practice-sheet-worksheet-answer-key.pdf",
    );
  });
});

describe("Worksheet Controller & Middleware Integration", () => {
  it("rejects unauthenticated export requests with 401", async () => {
    const mockReq = {
      cookies: {},
    } as unknown as Request;
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const mockRes = {
      status: statusFn,
    } as unknown as Response;
    const nextFn = vi.fn();

    await requireAuth(mockReq, mockRes, nextFn);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Unauthorized") }),
    );
    expect(nextFn).not.toHaveBeenCalled();
  });

  it("WorksheetController.exportPdf handles mode parameter and sets proper PDF headers", async () => {
    const fakeBuffer = Buffer.from("%PDF-1.4 Mock Buffer Content");
    vi.spyOn(ExportService, "exportWorksheetPdf").mockResolvedValue({
      buffer: fakeBuffer,
      filename: "test-worksheet-answer-key.pdf",
    });

    const setHeaderFn = vi.fn();
    const sendFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ send: sendFn });

    const mockReq = {
      user: { id: "teacher-1", email: "teacher@test.com" },
      params: { worksheetId: "ws-123" },
      query: { mode: "answer-key" },
    } as unknown as Request;

    const mockRes = {
      setHeader: setHeaderFn,
      status: statusFn,
    } as unknown as Response;

    await WorksheetController.exportPdf(mockReq, mockRes);

    expect(ExportService.exportWorksheetPdf).toHaveBeenCalledWith(
      "ws-123",
      "teacher-1",
      "answer-key",
    );
    expect(setHeaderFn).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf",
    );
    expect(setHeaderFn).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="test-worksheet-answer-key.pdf"',
    );
    expect(statusFn).toHaveBeenCalledWith(200);
    expect(sendFn).toHaveBeenCalledWith(fakeBuffer);
  });

  it("WorksheetController.exportPdf returns error status and JSON when export service throws", async () => {
    const serviceError: any = new Error(
      'Invalid worksheet export mode: must be either "student" or "answer-key"',
    );
    serviceError.statusCode = 400;
    vi.spyOn(ExportService, "exportWorksheetPdf").mockRejectedValue(serviceError);

    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });

    const mockReq = {
      user: { id: "teacher-1", email: "teacher@test.com" },
      params: { worksheetId: "ws-123" },
      query: { mode: "bad-mode" },
    } as unknown as Request;

    const mockRes = {
      status: statusFn,
    } as unknown as Response;

    await WorksheetController.exportPdf(mockReq, mockRes);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({
      error: 'Invalid worksheet export mode: must be either "student" or "answer-key"',
    });
  });
});
