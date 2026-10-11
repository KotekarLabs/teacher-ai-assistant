import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239";

test.describe("Milestone 6 — Resource Workflows Responsive Verification", () => {
  const viewports = [
    { width: 320, height: 640, label: "320px (Mobile Mini)" },
    { width: 375, height: 667, label: "375px (Standard Mobile)" },
    { width: 390, height: 844, label: "390px (iPhone 14)" },
    { width: 430, height: 932, label: "430px (Large Mobile)" },
    { width: 768, height: 1024, label: "768px (iPad Tablet)" },
    { width: 1024, height: 768, label: "1024px (Desktop Small)" },
    { width: 1280, height: 800, label: "1280px (Standard Desktop)" },
  ];

  const currentUser = { id: "teacher-m6-resp", email: "priya.sharma@school.edu" };
  const currentProfile = {
    id: "profile-m6-resp",
    userId: currentUser.id,
    displayName: "Mrs. Priya Sharma",
    teachingRole: "Senior Science Teacher",
    subjects: ["Science", "Physics"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const mockClasses = [
    {
      id: "class-m6-1",
      teacherId: currentUser.id,
      name: "Grade 8 Science A",
      grade: "8",
      section: "A",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
  ];

  const mockLesson = {
    id: "lesson-resp-1",
    teacherId: currentUser.id,
    classId: "class-m6-1",
    title: "Newton's Laws of Motion",
    subject: "Physics",
    topic: "Force and Motion",
    curriculumBoard: "CBSE",
    difficulty: "MEDIUM",
    durationMinutes: 45,
    status: "SAVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      title: "Newton's Laws of Motion",
      overview: "Introduction to classical mechanics and inertia.",
      learningObjectives: [
        "State Newton's three laws of motion with examples",
        "Calculate force using F = ma in basic problem sets",
      ],
      prerequisites: ["Velocity and acceleration formulas"],
      introduction: "Push a toy car across rough and smooth surfaces to illustrate friction.",
      teacherExplanation: "Every body perseveres in its state of rest or uniform motion unless compelled to change.",
      examples: ["Seatbelts stopping passengers during sudden brakes", "Rocket propulsion"],
      classroomActivity: {
        title: "Balloon Rocket Exploration",
        instructions: "Measure distance traveled by balloons untied along a string line.",
        durationMinutes: 15,
      },
      practice: ["Determine force on a 5kg mass accelerating at 2m/s^2."],
      quickAssessment: ["Why does an apple fall towards Earth?"],
      homework: "Answer end-of-chapter questions 1 to 4.",
      teacherScript: "Welcome students! Today we unpack why things move the way they do.",
    },
  };

  const mockQuiz = {
    id: "quiz-resp-1",
    teacherId: currentUser.id,
    classId: "class-m6-1",
    title: "Forces & Motion Checkpoint",
    subject: "Physics",
    topic: "Newton's Laws",
    curriculumBoard: "CBSE",
    difficulty: "MEDIUM",
    durationMinutes: 20,
    totalMarks: 5,
    status: "SAVED",
    instructions: "Choose the single correct answer for each problem.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: "q-1",
        position: 1,
        type: "MULTIPLE_CHOICE",
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Pascal", "Watt"],
        correctAnswer: "Newton",
        explanation: "Force is measured in Newtons (N) in honor of Sir Isaac Newton.",
        marks: 1,
        difficulty: "EASY",
      },
      {
        id: "q-2",
        position: 2,
        type: "TRUE_FALSE",
        question: "Inertia depends directly on the mass of an object.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Greater mass confers greater inertia.",
        marks: 1,
        difficulty: "EASY",
      },
    ],
  };

  test.beforeEach(async ({ page }) => {
    // Auth route
    await page.route(/\/api\/v1\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: currentUser,
          profile: currentProfile,
          hasCompletedOnboarding: true,
        }),
      });
    });

    // Classes
    await page.route(/\/api\/v1\/classes(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ classes: mockClasses }),
      });
    });

    // Lesson
    await page.route(/\/api\/v1\/lessons\/lesson-resp-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lesson: mockLesson }),
      });
    });

    // Quiz
    await page.route(/\/api\/v1\/quizzes\/quiz-resp-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ quiz: mockQuiz }),
      });
    });

    // PDF Export
    await page.route(/\/api\/v1\/(lessons|worksheets|quizzes|homeworks)\/([^/]+)\/export\/pdf/, async (route) => {
      const dummyPdf = Buffer.from("%PDF-1.4 Genuine Mock PDF Binary Stream Content");
      const url = route.request().url();
      let filename = "resource.pdf";
      if (url.includes("lessons")) filename = "newtons-laws-of-motion-lesson.pdf";
      else if (url.includes("quizzes") && url.includes("mode=student")) filename = "forces-checkpoint-student.pdf";
      else if (url.includes("quizzes") && url.includes("mode=answer-key")) filename = "forces-checkpoint-answer-key.pdf";

      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        headers: {
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Access-Control-Expose-Headers": "Content-Disposition",
        },
        body: dummyPdf,
      });
    });
  });

  for (const vp of viewports) {
    test(`Create Lesson form renders without horizontal overflow at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/create/lesson");

      await expect(page.getByTestId("lesson-form")).toBeVisible();
      await expect(page.getByTestId("lesson-subject-input")).toBeVisible();
      await expect(page.getByTestId("generate-lesson-btn")).toBeVisible();

      // Horizontal overflow verification
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      if ([320, 375, 768, 1280].includes(vp.width)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `m6-create-lesson-${vp.width}px.png`),
          fullPage: true,
        });
      }
    });

    test(`Lesson Details page renders responsive layout at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/lessons/lesson-resp-1");

      await expect(page.getByTestId("lesson-details")).toBeVisible();
      await expect(page.getByTestId("lesson-details-title")).toHaveText("Newton's Laws of Motion");
      await expect(page.getByTestId("export-pdf-btn")).toBeVisible();
      await expect(page.getByTestId("edit-lesson-btn")).toBeVisible();

      // Check overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      if ([320, 375, 768, 1280].includes(vp.width)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `m6-lesson-details-${vp.width}px.png`),
          fullPage: true,
        });
      }
    });

    test(`Lesson Editor with sticky save bar renders cleanly at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/lessons/lesson-resp-1/edit");

      await expect(page.getByTestId("lesson-editor")).toBeVisible();
      await expect(page.getByTestId("lesson-save-bar")).toBeVisible();
      await expect(page.getByTestId("save-lesson-btn")).toBeVisible();

      // Check overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      if ([320, 375, 768, 1280].includes(vp.width)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `m6-lesson-editor-${vp.width}px.png`),
          fullPage: true,
        });
      }
    });
  }

  test("Genuine PDF export download verification for Lesson and Quiz", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/lessons/lesson-resp-1");

    // Test genuine Lesson PDF download
    const [downloadLesson] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("export-pdf-btn").click(),
    ]);

    expect(downloadLesson.suggestedFilename()).toBe("newtons-laws-of-motion-lesson.pdf");

    // Test genuine Quiz PDF modal & student/answer-key downloads
    await page.goto("/quizzes/quiz-resp-1");
    await page.getByTestId("export-pdf-btn").click();
    await expect(page.getByTestId("quiz-export-modal")).toBeVisible();

    const [downloadQuizStudent] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("export-student-quiz-btn").click(),
    ]);
    expect(downloadQuizStudent.suggestedFilename()).toBe("forces-checkpoint-student.pdf");

    // Also test answer key export
    await page.getByTestId("export-pdf-btn").click();
    await expect(page.getByTestId("quiz-export-modal")).toBeVisible();
    const [downloadQuizAnswerKey] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("export-answer-key-btn").click(),
    ]);
    expect(downloadQuizAnswerKey.suggestedFilename()).toBe("forces-checkpoint-answer-key.pdf");
  });
});
