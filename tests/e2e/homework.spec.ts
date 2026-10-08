import { test, expect } from "@playwright/test";

test.describe("Homework Generation Flow", () => {
  const email = "teacher.homework.e2e@example.com";
  const currentUser = { id: "mock-teacher-hw", email };
  const currentProfile = {
    id: "mock-profile-hw",
    userId: currentUser.id,
    displayName: "Ms. Anita Sharma",
    teachingRole: "Middle School Teacher",
    subjects: ["Science"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const storedClasses = new Map<string, any>();
  const storedHomeworks = new Map<string, any>();

  test.beforeEach(async ({ page }) => {
    storedClasses.clear();
    storedHomeworks.clear();

    const sampleClass = {
      id: "class-science-7",
      teacherId: currentUser.id,
      name: "Grade 7 Science A",
      grade: "7",
      section: "A",
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

    await page.route(/\/api\/v1\/homeworks\/generate/, async (route) => {
      const body = route.request().postDataJSON();
      const id = "hw-" + (storedHomeworks.size + 1);
      const newHomework = {
        id,
        teacherId: currentUser.id,
        classId: body.classId,
        generationRequestId: "gen-mock-hw-1",
        title: `${body.topic} Take-Home Assignment`,
        subject: body.subject,
        topic: body.topic,
        difficulty: body.difficulty || "MEDIUM",
        estimatedTimeMinutes: body.estimatedTimeMinutes || 30,
        instructions:
          body.teacherInstructions ||
          "Complete all activities neatly in your science notebook.",
        status: "DRAFT",
        tasks: [
          {
            position: 1,
            title: "Core Concept Practice",
            description: `Answer key conceptual questions on ${body.topic}.`,
            type: "PRACTICE",
          },
          {
            position: 2,
            title: "Diagram & Labeling",
            description: `Draw a clear, labeled illustration representing ${body.topic}.`,
            type: "CREATIVE",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null,
      };
      storedHomeworks.set(id, newHomework);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ homework: newHomework }),
      });
    });

    await page.route(/\/api\/v1\/homeworks\/([^/]+)\/archive/, async (route) => {
      const match = route.request().url().match(/\/homeworks\/([^/?]+)\/archive/);
      const hwId = match ? match[1] : null;
      const hw = hwId ? storedHomeworks.get(hwId) : null;
      if (hw) {
        hw.status = "ARCHIVED";
        hw.archivedAt = new Date().toISOString();
      }
      await route.fulfill({
        status: hw ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          hw ? { message: "Homework archived", homework: hw } : { error: "Not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/homeworks\/([^/]+)$/, async (route) => {
      const match = route.request().url().match(/\/homeworks\/([^/?]+)/);
      const hwId = match ? match[1] : null;

      if (hwId === "generate") {
        await route.fallback();
        return;
      }

      if (route.request().method() === "PATCH") {
        const body = route.request().postDataJSON();
        const hw = hwId ? storedHomeworks.get(hwId) : null;
        if (hw) {
          if (body.title) hw.title = body.title;
          if (body.instructions !== undefined) hw.instructions = body.instructions;
          if (body.estimatedTimeMinutes) hw.estimatedTimeMinutes = body.estimatedTimeMinutes;
          if (body.status) hw.status = body.status;
          if (body.tasks) {
            hw.tasks = body.tasks.map((t: any, i: number) => ({
              position: t.position || i + 1,
              title: t.title,
              description: t.description,
              type: t.type,
            }));
          }
          hw.updatedAt = new Date().toISOString();
        }
        await route.fulfill({
          status: hw ? 200 : 404,
          contentType: "application/json",
          body: JSON.stringify(
            hw ? { homework: hw } : { error: "Homework not found" },
          ),
        });
        return;
      }

      const hw = hwId ? storedHomeworks.get(hwId) : null;
      await route.fulfill({
        status: hw ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          hw ? { homework: hw } : { error: "Homework not found" },
        ),
      });
    });

    await page.route(/\/api\/v1\/homeworks(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          homeworks: Array.from(storedHomeworks.values()),
        }),
      });
    });
  });

  test("Homework Generation End-to-End Flow: Dashboard Quick Create -> Form -> Generate -> Edit -> Save -> Reopen -> Archive", async ({
    page,
  }) => {
    // 1. Visit Dashboard
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible();

    // 2. Click Quick Create Homework
    const hwCard = page.getByTestId("quick-create-homework");
    await expect(hwCard).toBeVisible();
    await hwCard.click();

    // 3. Form input
    await expect(page.locator("h1")).toHaveText("Create AI Homework");
    await page.fill('[data-testid="homework-subject-input"]', "Science");
    await page.fill('[data-testid="homework-topic-input"]', "Water Cycle");
    await page.fill('[data-testid="homework-task-count-input"]', "2");
    await page.fill('[data-testid="homework-duration-input"]', "30");

    // 4. Click Generate
    await page.click('[data-testid="generate-homework-btn"]');

    // 5. Lands on Edit Homework page
    await expect(page.getByTestId("homework-edit-page-title")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("homework-editor")).toBeVisible();
    await expect(page.getByTestId("task-item-0")).toBeVisible();
    await expect(page.getByTestId("estimated-time-display")).toBeVisible();

    // 6. Edit title and task description
    await page.fill(
      '[data-testid="homework-title-input"]',
      "Water Cycle Comprehensive Homework",
    );
    await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();

    // 7. Save Homework
    await page.click('[data-testid="save-homework-btn"]');
    await expect(page.getByTestId("save-success-alert")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("homework-status-badge")).toHaveText("SAVED");

    // 8. Reopen details page
    await page.click('[data-testid="back-btn"]');
    await expect(page.getByTestId("homework-details")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("homework-details-title")).toHaveText(
      "Water Cycle Comprehensive Homework",
    );
    await expect(page.getByTestId("detail-task-0")).toBeVisible();

    // Verify NO Answer Key button/section exists
    await expect(page.getByRole("button", { name: /answer key/i })).toBeHidden();
    await expect(page.getByTestId("answer-key-0")).toBeHidden();

    // 9. Archive homework
    await page.click('[data-testid="archive-homework-btn"]');
    await expect(page.getByTestId("archive-modal")).toBeVisible();
    await page.click('[data-testid="confirm-archive-btn"]');

    // Navigates back to dashboard after archiving
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("Class Details Integration: Navigate to class and click Create Homework with prefilled class", async ({
    page,
  }) => {
    await page.goto("/classes/class-science-7");
    await expect(page.getByRole("heading", { name: "Grade 7 Science A" })).toBeVisible();

    const createHwBtn = page.getByTestId("create-homework-for-class-btn");
    await expect(createHwBtn).toBeVisible();
    await createHwBtn.click();

    await expect(page.locator("h1")).toHaveText("Create AI Homework");
    await expect(page.getByTestId("homework-class-select")).toHaveValue("class-science-7");
  });
});
