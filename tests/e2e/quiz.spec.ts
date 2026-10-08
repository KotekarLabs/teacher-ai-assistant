import { test, expect } from "@playwright/test";

test.describe("Quiz Generation Flow", () => {
  const email = "teacher.quiz.e2e@example.com";
  const currentUser = { id: "mock-teacher-quiz", email };
  const currentProfile = {
    id: "mock-profile-quiz",
    userId: currentUser.id,
    displayName: "Dr. Vikram Seth",
    teachingRole: "Science Teacher",
    subjects: ["Science"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const storedClasses = new Map<string, any>();
  const storedQuizzes = new Map<string, any>();

  test.beforeEach(async ({ page }) => {
    storedClasses.clear();
    storedQuizzes.clear();

    const sampleClass = {
      id: "class-science-8",
      teacherId: currentUser.id,
      name: "Grade 8 Science Delta",
      grade: "8",
      section: "Delta",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    };
    storedClasses.set(sampleClass.id, sampleClass);

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

    await page.route(/\/api\/v1\/classes(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          classes: Array.from(storedClasses.values()),
        }),
      });
    });

    await page.route(/\/api\/v1\/classes\/([^/]+)$/, async (route) => {
      const match = route.request().url().match(/\/classes\/([^/?]+)/);
      const classId = match ? match[1] : null;
      const classItem = classId ? storedClasses.get(classId) : null;
      await route.fulfill({
        status: classItem ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          classItem ? { class: classItem } : { error: "Class not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/quizzes\/generate/, async (route) => {
      const body = route.request().postDataJSON();
      const id = "quiz-" + (storedQuizzes.size + 1);
      const newQuiz = {
        id,
        teacherId: currentUser.id,
        classId: body.classId,
        generationRequestId: "gen-mock-qz-1",
        title: `${body.topic} Assessment Quiz — Grade 8`,
        subject: body.subject,
        topic: body.topic,
        curriculumBoard: "CBSE",
        difficulty: body.difficulty || "MEDIUM",
        durationMinutes: body.durationMinutes || 20,
        totalMarks: 3,
        instructions:
          body.teacherInstructions ||
          "Read each question carefully and select or write the best answer.",
        status: "DRAFT",
        questions: [
          {
            id: "q-1",
            quizId: id,
            position: 1,
            type: "MULTIPLE_CHOICE",
            question: `Which of the following is the primary principle of ${body.topic}?`,
            options: [
              "Option A: Fundamental principle",
              "Option B: Secondary effect",
              "Option C: Misconception",
              "Option D: None of these",
            ],
            correctAnswer: "Option A: Fundamental principle",
            explanation: "Option A accurately describes the foundational principle.",
            marks: 1,
            difficulty: "MEDIUM",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "q-2",
            quizId: id,
            position: 2,
            type: "SHORT_ANSWER",
            question: `In 1-2 sentences, describe an application of ${body.topic}.`,
            options: [],
            correctAnswer: `${body.topic} is used extensively in industrial chemistry.`,
            explanation: "Core industrial and laboratory application.",
            marks: 2,
            difficulty: "HARD",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null,
      };
      storedQuizzes.set(id, newQuiz);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ quiz: newQuiz }),
      });
    });

    await page.route(/\/api\/v1\/quizzes\/([^/]+)\/archive/, async (route) => {
      const match = route.request().url().match(/\/quizzes\/([^/?]+)\/archive/);
      const quizId = match ? match[1] : null;
      const qz = quizId ? storedQuizzes.get(quizId) : null;
      if (qz) {
        qz.status = "ARCHIVED";
        qz.archivedAt = new Date().toISOString();
      }
      await route.fulfill({
        status: qz ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          qz ? { message: "Quiz archived", quiz: qz } : { error: "Not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/quizzes\/([^/]+)$/, async (route) => {
      const match = route.request().url().match(/\/quizzes\/([^/?]+)/);
      const quizId = match ? match[1] : null;

      if (quizId === "generate") {
        await route.fallback();
        return;
      }

      if (route.request().method() === "PATCH") {
        const body = route.request().postDataJSON();
        const qz = quizId ? storedQuizzes.get(quizId) : null;
        if (qz) {
          if (body.title) qz.title = body.title;
          if (body.instructions !== undefined) qz.instructions = body.instructions;
          if (body.durationMinutes) qz.durationMinutes = body.durationMinutes;
          if (body.status) qz.status = body.status;
          if (body.questions) {
            qz.questions = body.questions.map((q: any, i: number) => ({
              id: q.id || `q-${i + 1}`,
              quizId: qz.id,
              position: q.position || i + 1,
              type: q.type,
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || null,
              marks: q.marks || 1,
              difficulty: q.difficulty || "MEDIUM",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            qz.totalMarks = qz.questions.reduce((sum: number, q: any) => sum + q.marks, 0);
          }
          qz.updatedAt = new Date().toISOString();
        }
        await route.fulfill({
          status: qz ? 200 : 404,
          contentType: "application/json",
          body: JSON.stringify(
            qz ? { quiz: qz } : { error: "Quiz not found" },
          ),
        });
        return;
      }

      const qz = quizId ? storedQuizzes.get(quizId) : null;
      await route.fulfill({
        status: qz ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          qz ? { quiz: qz } : { error: "Quiz not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/quizzes(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quizzes: Array.from(storedQuizzes.values()),
        }),
      });
    });
  });

  test("Quiz Generation End-to-End Flow: Dashboard Quick Create -> Form -> Generate -> Edit -> Save -> Reopen -> Archive", async ({
    page,
  }) => {
    // 1. Visit Dashboard
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible();

    // 2. Click Quick Create Quiz
    const quizCard = page.getByTestId("quick-create-quiz");
    await expect(quizCard).toBeVisible();
    await quizCard.click();

    // 3. Form input
    await expect(page.locator("h1")).toHaveText("Create AI Quiz");
    await page.fill('[data-testid="quiz-subject-input"]', "Chemistry");
    await page.fill('[data-testid="quiz-topic-input"]', "Acids and Bases");
    await page.fill('[data-testid="quiz-question-count-input"]', "2");
    await page.fill('[data-testid="quiz-duration-input"]', "15");

    // 4. Click Generate
    await page.click('[data-testid="generate-quiz-btn"]');

    // 5. Lands on Edit Quiz page
    await expect(page.getByTestId("quiz-edit-page-title")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("quiz-editor")).toBeVisible();
    await expect(page.getByTestId("question-item-0")).toBeVisible();
    await expect(page.getByTestId("calculated-total-marks")).toBeVisible();

    // 6. Edit title and question text
    await page.fill(
      '[data-testid="quiz-title-input"]',
      "Acids and Bases Chapter Test",
    );
    await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();

    // 7. Save Quiz
    await page.click('[data-testid="save-quiz-btn"]');
    await expect(page.getByTestId("save-success-alert")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("quiz-status-badge")).toHaveText("SAVED");

    // 8. Reopen details page
    await page.click('[data-testid="back-btn"]');
    await expect(page.getByTestId("quiz-details")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("quiz-details-title")).toHaveText(
      "Acids and Bases Chapter Test",
    );

    // 9. Toggle answer key visibility
    await expect(page.getByTestId("answer-key-0")).toBeVisible();
    await page.click('[data-testid="toggle-answers-btn"]');
    await expect(page.getByTestId("answer-key-0")).toBeHidden();
    await page.click('[data-testid="toggle-answers-btn"]');
    await expect(page.getByTestId("answer-key-0")).toBeVisible();

    // 10. Archive quiz
    await page.click('[data-testid="archive-quiz-btn"]');
    await expect(page.getByTestId("archive-modal")).toBeVisible();
    await page.click('[data-testid="confirm-archive-btn"]');

    // Navigates back to dashboard after archiving
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible({
      timeout: 10000,
    });
  });
});
