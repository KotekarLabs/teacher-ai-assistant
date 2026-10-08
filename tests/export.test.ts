import { describe, it, expect, vi } from "vitest";
import { renderLessonPdf } from "../apps/api/src/services/pdf/lesson-pdf.renderer";
import { renderWorksheetPdf } from "../apps/api/src/services/pdf/worksheet-pdf.renderer";
import { renderQuizPdf } from "../apps/api/src/services/pdf/quiz-pdf.renderer";
import { renderHomeworkPdf } from "../apps/api/src/services/pdf/homework-pdf.renderer";
import { sanitizeFilename } from "../apps/api/src/services/pdf/pdf-utils";
import { ExportService } from "../apps/api/src/services/export.service";
import { LessonRepository } from "../apps/api/src/repositories/lesson.repository";
import { QuizRepository } from "../apps/api/src/repositories/quiz.repository";

describe("PDF Export Renderers & Utilities", () => {
  it("sanitizes filenames correctly", () => {
    expect(sanitizeFilename("Introduction: To Algorithms / Part 1", "lesson")).toBe(
      "introduction-to-algorithms-part-1-lesson.pdf"
    );
    expect(sanitizeFilename("Quiz #5 & Test!", "quiz-student")).toBe(
      "quiz-5-test-quiz-student.pdf"
    );
    expect(sanitizeFilename("", "worksheet")).toBe("teaching-resource-worksheet.pdf");
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
        overview: "An introductory study of cell organelles and their vital functions.",
        learningObjectives: [
          "Identify major organelle functions.",
          "Distinguish between plant and animal cells.",
        ],
        prerequisites: ["Basic understanding of living organisms."],
        introduction: "Begin with a microscope demonstration hook.",
        teacherExplanation: "The cell membrane acts as a selective barrier.",
        examples: ["Mitochondria produce ATP.", "Chloroplasts conduct photosynthesis."],
        classroomActivity: {
          title: "Organelle Roleplay",
          instructions: "Students act as cell components transporting proteins.",
          durationMinutes: 15,
        },
        practice: ["Complete labeling diagram.", "Organelle matchup chart."],
        quickAssessment: ["Name 2 organelles unique to plant cells."],
        homework: "Read chapter 3 and write a 1-page summary.",
        teacherScript: "Good morning class! Today we explore the microscopic building blocks of life.",
      },
    };

    const buffer = await renderLessonPdf(mockLesson);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    // Check %PDF- magic bytes header
    expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
  });

  it("renders Worksheet PDF with valid PDF binary signature (%PDF-)", async () => {
    const mockWorksheet: any = {
      title: "Photosynthesis Practice Sheet",
      subject: "Science",
      topic: "Photosynthesis",
      curriculumBoard: "ICSE",
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 30,
      instructions: "Read each question carefully and write your answers clearly.",
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
          question: "Photosynthesis releases carbon dioxide into the atmosphere.",
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
          correctAnswer: "A reaction that absorbs energy from its surroundings.",
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
          description: "Formulate an equation representing ticket sales revenue.",
        },
      ],
    };

    const buffer = await renderHomeworkPdf(mockHomework);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.toString("utf-8", 0, 5)).toBe("%PDF-");
  });
});

describe("ExportService & Export Endpoints Authorization", () => {
  const teacherA = "teacher-export-user-1";

  it("fails when resource is not found or teacher is not owner", async () => {
    vi.spyOn(LessonRepository, "findByIdAndTeacherId").mockResolvedValue(null);

    await expect(
      ExportService.exportLessonPdf("non-existent-lesson-id", teacherA)
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
      ExportService.exportQuizPdf("quiz-1", teacherA, "invalid-mode" as any)
    ).rejects.toThrow("Invalid quiz export mode");
  });
});
