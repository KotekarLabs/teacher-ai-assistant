import { test, expect } from "@playwright/test";

test.describe("Resource Workflow & Export Foundation E2E", () => {
  const email = "teacher.export.e2e@example.com";
  const currentUser = { id: "mock-teacher-export", email };
  const currentProfile = {
    id: "mock-profile-export",
    userId: currentUser.id,
    displayName: "Prof. Alan Turing",
    teachingRole: "Computer Science Teacher",
    subjects: ["Computer Science"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const sampleLesson = {
    id: "lesson-export-1",
    teacherId: currentUser.id,
    classId: null,
    title: "Introduction to Algorithms",
    subject: "Computer Science",
    topic: "Sorting & Searching",
    curriculumBoard: "CBSE",
    difficulty: "MEDIUM",
    durationMinutes: 45,
    status: "SAVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      overview: "Introduction to foundational algorithmic thinking and sorting mechanisms.",
      learningObjectives: ["Understand Bubble Sort", "Analyze time complexity"],
      prerequisites: ["Basic variable understanding"],
      introduction: "Demonstrate sorting playing cards hook.",
      teacherExplanation: "Algorithms are step-by-step instructions to solve problems.",
      examples: ["Linear search through a grocery list."],
      classroomActivity: {
        title: "Human Sort Activity",
        instructions: "Students order themselves by height.",
        durationMinutes: 15,
      },
      practice: ["Trace bubble sort on [4, 2, 7, 1]."],
      quickAssessment: ["What is the best-case complexity of linear search?"],
      homework: "Write pseudocode for finding max element.",
      teacherScript: "Welcome everyone! Today we begin computational problem solving.",
    },
  };

  const sampleQuiz = {
    id: "quiz-export-1",
    teacherId: currentUser.id,
    classId: null,
    title: "Data Structures Quiz",
    subject: "Computer Science",
    topic: "Arrays & Trees",
    curriculumBoard: "CBSE",
    difficulty: "HARD",
    durationMinutes: 20,
    totalMarks: 5,
    status: "SAVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    instructions: "Answer all questions independently.",
    questions: [
      {
        id: "q1",
        position: 1,
        type: "MULTIPLE_CHOICE",
        question: "What is the time complexity of array index lookup?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctAnswer: "O(1)",
        explanation: "Direct memory index calculation allows constant time lookup.",
        marks: 1,
        difficulty: "EASY",
      },
    ],
  };

  const sampleWorksheet = {
    id: "worksheet-export-1",
    teacherId: currentUser.id,
    classId: null,
    title: "Graph Theory Worksheet",
    subject: "Computer Science",
    topic: "Graphs and Trees",
    curriculumBoard: "CBSE",
    difficulty: "MEDIUM",
    estimatedTimeMinutes: 30,
    instructions: "Draw and calculate degrees of vertices.",
    status: "SAVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: "w1",
        position: 1,
        type: "SHORT_ANSWER",
        question: "State the Handshaking Lemma.",
        options: [],
        expectedAnswer: "Sum of degrees equals twice the number of edges.",
        marks: 2,
        difficulty: "MEDIUM",
      },
    ],
  };

  const sampleHomework = {
    id: "homework-export-1",
    teacherId: currentUser.id,
    classId: null,
    title: "Recursion Homework Practice",
    subject: "Computer Science",
    topic: "Recursion",
    curriculumBoard: "CBSE",
    difficulty: "MEDIUM",
    estimatedTimeMinutes: 30,
    instructions: "Complete tasks in your notebooks.",
    status: "SAVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [
      {
        position: 1,
        title: "Factorial Trace",
        description: "Trace factorial(5) call stack.",
        type: "WRITTEN_EXERCISE",
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

    // Content Library route
    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "content-1",
              type: "LESSON",
              resourceId: sampleLesson.id,
              title: sampleLesson.title,
              subject: sampleLesson.subject,
              topic: sampleLesson.topic,
              difficulty: sampleLesson.difficulty,
              status: "SAVED",
              classId: null,
              class: null,
              createdAt: sampleLesson.createdAt,
              updatedAt: sampleLesson.updatedAt,
              archivedAt: null,
            },
          ],
          pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
        }),
      });
    });

    // Lesson routes
    await page.route(/\/api\/v1\/lessons\/lesson-export-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lesson: sampleLesson }),
      });
    });

    // Quiz routes
    await page.route(/\/api\/v1\/quizzes\/quiz-export-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ quiz: sampleQuiz }),
      });
    });

    // Worksheet routes
    await page.route(/\/api\/v1\/worksheets\/worksheet-export-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ worksheet: sampleWorksheet }),
      });
    });

    // Homework routes
    await page.route(/\/api\/v1\/homeworks\/homework-export-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ homework: sampleHomework }),
      });
    });

    // PDF Export endpoint mocks
    await page.route(/\/api\/v1\/(lessons|worksheets|quizzes|homeworks)\/([^/]+)\/export\/pdf/, async (route) => {
      const dummyPdf = Buffer.from("%PDF-1.4 Mock PDF Content binary stream");
      const url = route.request().url();
      let filename = "resource.pdf";
      if (url.includes("lessons")) filename = "introduction-to-algorithms-lesson.pdf";
      else if (url.includes("quizzes") && url.includes("mode=student")) filename = "data-structures-quiz-student.pdf";
      else if (url.includes("quizzes") && url.includes("mode=answer-key")) filename = "data-structures-quiz-answer-key.pdf";
      else if (url.includes("worksheets") && url.includes("mode=student")) filename = "graph-theory-worksheet-student.pdf";
      else if (url.includes("worksheets") && url.includes("mode=answer-key")) filename = "graph-theory-worksheet-answer-key.pdf";
      else if (url.includes("worksheets")) filename = "graph-theory-worksheet.pdf";
      else if (url.includes("homeworks")) filename = "recursion-homework.pdf";

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

  test("Lesson Detail page renders standardized header, metadata, and triggers PDF export", async ({ page }) => {
    await page.goto("/lessons/lesson-export-1");

    await expect(page.getByTestId("lesson-details")).toBeVisible();
    await expect(page.getByTestId("lesson-details-title")).toHaveText("Introduction to Algorithms");
    await expect(page.getByTestId("resource-metadata")).toBeVisible();
    await expect(page.getByTestId("export-pdf-btn")).toBeVisible();
    await expect(page.getByTestId("print-btn")).toBeVisible();
    await expect(page.getByTestId("edit-lesson-btn")).toBeVisible();

    // Trigger PDF Export
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-pdf-btn").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("introduction-to-algorithms-lesson.pdf");
  });

  test("Quiz Detail page supports Student Export and Teacher Answer Key Export", async ({ page }) => {
    await page.goto("/quizzes/quiz-export-1");

    await expect(page.getByTestId("quiz-details")).toBeVisible();
    await expect(page.getByTestId("quiz-details-title")).toHaveText("Data Structures Quiz");
    await expect(page.getByTestId("toggle-answers-btn")).toBeVisible();

    // Click Export PDF to open QuizExportModal
    await page.getByTestId("export-pdf-btn").click();
    await expect(page.getByTestId("quiz-export-modal")).toBeVisible();
    await expect(page.getByTestId("export-student-quiz-btn")).toBeVisible();
    await expect(page.getByTestId("export-answer-key-btn")).toBeVisible();

    // Export Student Quiz
    const studentDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-student-quiz-btn").click();
    const studentDownload = await studentDownloadPromise;
    expect(studentDownload.suggestedFilename()).toBe("data-structures-quiz-student.pdf");

    // Reopen modal and export Answer Key
    await page.getByTestId("export-pdf-btn").click();
    await expect(page.getByTestId("quiz-export-modal")).toBeVisible();
    const answerKeyDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-answer-key-btn").click();
    const answerKeyDownload = await answerKeyDownloadPromise;
    expect(answerKeyDownload.suggestedFilename()).toBe("data-structures-quiz-answer-key.pdf");
  });

  test("Worksheet Detail page supports Student Export and Teacher Answer Key Export", async ({ page }) => {
    await page.goto("/worksheets/worksheet-export-1");

    await expect(page.getByTestId("worksheet-details")).toBeVisible();
    await expect(page.getByTestId("worksheet-details-title")).toHaveText("Graph Theory Worksheet");
    await expect(page.getByTestId("toggle-answers-btn")).toBeVisible();

    // Click Export PDF to open WorksheetExportModal
    await page.getByTestId("export-pdf-btn").click();
    await expect(page.getByTestId("worksheet-export-modal")).toBeVisible();
    await expect(page.getByTestId("export-student-worksheet-btn")).toBeVisible();
    await expect(page.getByTestId("export-answer-key-btn")).toBeVisible();

    // Export Student Worksheet
    const studentDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-student-worksheet-btn").click();
    const studentDownload = await studentDownloadPromise;
    expect(studentDownload.suggestedFilename()).toBe("graph-theory-worksheet-student.pdf");

    // Reopen modal and export Answer Key
    await page.getByTestId("export-pdf-btn").click();
    await expect(page.getByTestId("worksheet-export-modal")).toBeVisible();
    const answerKeyDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-answer-key-btn").click();
    const answerKeyDownload = await answerKeyDownloadPromise;
    expect(answerKeyDownload.suggestedFilename()).toBe("graph-theory-worksheet-answer-key.pdf");
  });

  test("Homework detail page triggers PDF export successfully", async ({ page }) => {
    await page.goto("/homeworks/homework-export-1");
    await expect(page.getByTestId("homework-details")).toBeVisible();
    const homeworkDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-pdf-btn").click();
    const homeworkDownload = await homeworkDownloadPromise;
    expect(homeworkDownload.suggestedFilename()).toBe("recursion-homework.pdf");
  });

  test("Editor protects unsaved changes with modal dialog on back navigation", async ({ page }) => {
    await page.goto("/lessons/lesson-export-1/edit");

    await expect(page.getByTestId("lesson-edit-page-title")).toBeVisible();

    // Modify introduction hook
    await page.locator("textarea").first().fill("Updated hook text with unsaved modifications.");

    // Click back button in SaveBar
    await page.getByTestId("back-btn").click();

    // Verify UnsavedChangesDialog appears
    await expect(page.getByTestId("unsaved-changes-dialog")).toBeVisible();
    await expect(page.getByText("You have unsaved changes")).toBeVisible();

    // Click cancel to stay
    await page.getByTestId("cancel-unsaved-btn").click();
    await expect(page.getByTestId("unsaved-changes-dialog")).not.toBeVisible();
    expect(page.url()).toContain("/lessons/lesson-export-1/edit");

    // Click back again and discard changes
    await page.getByTestId("back-btn").click();
    await expect(page.getByTestId("unsaved-changes-dialog")).toBeVisible();
    await page.getByTestId("discard-changes-btn").click();
    await expect(page).toHaveURL(/\/lessons\/lesson-export-1$/);
  });
});
