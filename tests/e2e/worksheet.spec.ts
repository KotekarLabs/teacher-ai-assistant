import { test, expect } from "@playwright/test";

test.describe("Worksheet Generation Flow", () => {
  const email = "teacher.worksheet.e2e@example.com";
  const currentUser = { id: "mock-teacher-worksheet", email };
  const currentProfile = {
    id: "mock-profile-worksheet",
    userId: currentUser.id,
    displayName: "Dr. Vikram Seth",
    teachingRole: "Science Teacher",
    subjects: ["Science"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const storedClasses = new Map<string, any>();
  const storedWorksheets = new Map<string, any>();

  test.beforeEach(async ({ page }) => {
    storedClasses.clear();
    storedWorksheets.clear();

    const sampleClass = {
      id: "class-science-5",
      teacherId: currentUser.id,
      name: "Grade 5 Science Gamma",
      grade: "5",
      section: "Gamma",
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

    await page.route(/\/api\/v1\/worksheets\/generate/, async (route) => {
      const body = route.request().postDataJSON();
      const id = "worksheet-" + (storedWorksheets.size + 1);
      const newWorksheet = {
        id,
        teacherId: currentUser.id,
        classId: body.classId,
        generationRequestId: "gen-mock-ws-1",
        title: `${body.topic} Practice Worksheet — Grade 5`,
        subject: body.subject,
        topic: body.topic,
        curriculumBoard: "CBSE",
        difficulty: body.difficulty || "MEDIUM",
        estimatedTimeMinutes: body.estimatedTimeMinutes || 30,
        instructions:
          body.teacherInstructions ||
          "Answer all questions thoroughly. Show your work where required.",
        status: "DRAFT",
        questions: [
          {
            id: "q-1",
            worksheetId: id,
            position: 1,
            type: "MULTIPLE_CHOICE",
            question: `Which of the following is a primary characteristic of ${body.topic}?`,
            options: [
              "Option A: Core property",
              "Option B: Secondary effect",
              "Option C: Misconception",
              "Option D: None of these",
            ],
            expectedAnswer: "Option A: Core property",
            marks: 1,
            difficulty: "EASY",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "q-2",
            worksheetId: id,
            position: 2,
            type: "SHORT_ANSWER",
            question: `In 1-2 sentences, explain why ${body.topic} is important.`,
            options: [],
            expectedAnswer: `${body.topic} is essential for understanding natural systems.`,
            marks: 2,
            difficulty: "MEDIUM",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null,
      };
      storedWorksheets.set(id, newWorksheet);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ worksheet: newWorksheet }),
      });
    });

    await page.route(/\/api\/v1\/worksheets\/([^/]+)\/archive/, async (route) => {
      const match = route.request().url().match(/\/worksheets\/([^/?]+)\/archive/);
      const worksheetId = match ? match[1] : null;
      const ws = worksheetId ? storedWorksheets.get(worksheetId) : null;
      if (ws) {
        ws.status = "ARCHIVED";
        ws.archivedAt = new Date().toISOString();
      }
      await route.fulfill({
        status: ws ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          ws ? { message: "Worksheet archived", worksheet: ws } : { error: "Not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/worksheets\/([^/]+)$/, async (route) => {
      const match = route.request().url().match(/\/worksheets\/([^/?]+)/);
      const worksheetId = match ? match[1] : null;

      if (worksheetId === "generate") {
        await route.fallback();
        return;
      }

      if (route.request().method() === "PATCH") {
        const body = route.request().postDataJSON();
        const ws = worksheetId ? storedWorksheets.get(worksheetId) : null;
        if (ws) {
          if (body.title) ws.title = body.title;
          if (body.instructions !== undefined) ws.instructions = body.instructions;
          if (body.estimatedTimeMinutes) ws.estimatedTimeMinutes = body.estimatedTimeMinutes;
          if (body.status) ws.status = body.status;
          if (body.questions) {
            ws.questions = body.questions.map((q: any, i: number) => ({
              id: q.id || `q-${i + 1}`,
              worksheetId: ws.id,
              position: q.position || i + 1,
              type: q.type,
              question: q.question,
              options: q.options || [],
              expectedAnswer: q.expectedAnswer,
              marks: q.marks || 1,
              difficulty: q.difficulty || "MEDIUM",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
          }
          ws.updatedAt = new Date().toISOString();
        }
        await route.fulfill({
          status: ws ? 200 : 404,
          contentType: "application/json",
          body: JSON.stringify(
            ws ? { worksheet: ws } : { error: "Worksheet not found" },
          ),
        });
        return;
      }

      const ws = worksheetId ? storedWorksheets.get(worksheetId) : null;
      await route.fulfill({
        status: ws ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          ws ? { worksheet: ws } : { error: "Worksheet not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/worksheets(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          worksheets: Array.from(storedWorksheets.values()),
        }),
      });
    });
  });

  test("Worksheet Generation End-to-End Flow: Dashboard Quick Create -> Form -> Generate -> Edit -> Save -> Reopen", async ({
    page,
  }) => {
    // 1. Visit Dashboard
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible();

    // 2. Click Quick Create Worksheet
    const wsCard = page.getByTestId("quick-create-worksheet");
    await expect(wsCard).toBeVisible();
    await wsCard.click();

    // 3. Form input
    await expect(page.locator("h1")).toHaveText("Create AI Worksheet");
    await page.fill('[data-testid="worksheet-subject-input"]', "General Science");
    await page.fill('[data-testid="worksheet-topic-input"]', "States of Matter");
    await page.fill('[data-testid="worksheet-question-count-input"]', "2");

    // 4. Click Generate
    await page.click('[data-testid="generate-worksheet-btn"]');

    // 5. Lands on Edit Worksheet page
    await expect(page.getByTestId("worksheet-edit-page-title")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("worksheet-editor")).toBeVisible();
    await expect(page.getByTestId("question-item-0")).toBeVisible();

    // 6. Edit title and question text
    await page.fill(
      '[data-testid="worksheet-title-input"]',
      "Custom States of Matter Assessment",
    );
    await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();

    // 7. Save Worksheet
    await page.click('[data-testid="save-worksheet-btn"]');
    await expect(page.getByTestId("save-success-alert")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("worksheet-status-badge")).toHaveText("SAVED");

    // 8. Reopen details page
    await page.click('[data-testid="back-btn"]');
    await expect(page.getByTestId("worksheet-details")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("worksheet-details-title")).toHaveText(
      "Custom States of Matter Assessment",
    );

    // 9. Toggle answer key visibility
    await expect(page.getByTestId("answer-key-0")).toBeVisible();
    await page.click('[data-testid="toggle-answers-btn"]');
    await expect(page.getByTestId("answer-key-0")).toBeHidden();
    await page.click('[data-testid="toggle-answers-btn"]');
    await expect(page.getByTestId("answer-key-0")).toBeVisible();

    // 10. Archive worksheet
    await page.click('[data-testid="archive-worksheet-btn"]');
    await expect(page.getByTestId("archive-modal")).toBeVisible();
    await page.click('[data-testid="confirm-archive-btn"]');

    // Navigates back to dashboard after archiving
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible({
      timeout: 10000,
    });
  });
});
