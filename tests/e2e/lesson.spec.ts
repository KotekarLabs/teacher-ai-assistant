import { test, expect } from "@playwright/test";

test.describe("Lesson Generation Flow", () => {
  const email = "teacher.lesson.e2e@example.com";
  const currentUser = { id: "mock-teacher-lesson", email };
  const currentProfile = {
    id: "mock-profile-lesson",
    userId: currentUser.id,
    displayName: "Dr. Vikram Seth",
    teachingRole: "Science Teacher",
    subjects: ["Science"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const storedClasses = new Map<string, any>();
  const storedLessons = new Map<string, any>();

  test.beforeEach(async ({ page }) => {
    storedClasses.clear();
    storedLessons.clear();

    const sampleClass = {
      id: "class-science-4",
      teacherId: currentUser.id,
      name: "Grade 4 Science Alpha",
      grade: "4",
      section: "Alpha",
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
        body: JSON.stringify(classItem ? { class: classItem } : { error: "Class not found" }),
      });
    });

    await page.route(/\/api\/v1\/lessons\/generate/, async (route) => {
      const body = route.request().postDataJSON();
      const id = "lesson-" + (storedLessons.size + 1);
      const newLesson = {
        id,
        teacherId: currentUser.id,
        classId: body.classId,
        generationRequestId: "gen-mock-1",
        title: `${body.topic} — Grade 4 ${body.subject}`,
        subject: body.subject,
        topic: body.topic,
        curriculumBoard: "CBSE",
        difficulty: body.difficulty || "MEDIUM",
        durationMinutes: body.durationMinutes || 40,
        status: "DRAFT",
        content: {
          title: `${body.topic} — Grade 4 ${body.subject}`,
          overview: `Comprehensive 40-minute lesson on ${body.topic}.`,
          learningObjectives: [
            `Understand key mechanisms of ${body.topic}.`,
            `Identify real-world examples of ${body.topic}.`,
          ],
          prerequisites: ["Basic science observation"],
          introduction: `Hook: Why is ${body.topic} vital to our planet?`,
          teacherExplanation: `Detailed classroom explanation about ${body.topic}.`,
          examples: [`Example 1: Demonstrating ${body.topic} with everyday objects.`],
          classroomActivity: {
            title: `Hands-on ${body.topic} Exploration`,
            instructions: "Students form pairs and sketch the cycle.",
            durationMinutes: 15,
          },
          practice: ["Solve practice worksheet questions"],
          quickAssessment: [`What is the main takeaway of ${body.topic}?`],
          homework: "Summarize the key points in 3 sentences.",
          teacherScript: "Good morning class! Let's explore together.",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null,
      };

      storedLessons.set(id, newLesson);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ lesson: newLesson }),
      });
    });

    await page.route(/\/api\/v1\/lessons\/([^/]+)$/, async (route) => {
      const match = route.request().url().match(/\/lessons\/([^/?]+)/);
      const lessonId = match ? match[1] : null;
      if (lessonId === "generate") {
        await route.fallback();
        return;
      }
      const lesson = lessonId ? storedLessons.get(lessonId) : null;

      if (!lesson) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Lesson not found" }),
        });
        return;
      }

      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ lesson }),
        });
      } else if (route.request().method() === "PATCH") {
        const body = route.request().postDataJSON();
        if (body.content) lesson.content = body.content;
        if (body.title) lesson.title = body.title;
        if (body.status) lesson.status = body.status;
        lesson.updatedAt = new Date().toISOString();
        storedLessons.set(lesson.id, lesson);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ lesson }),
        });
      }
    });

    await page.route(/\/api\/v1\/lessons\/([^/]+)\/regenerate/, async (route) => {
      const match = route.request().url().match(/\/lessons\/([^/?]+)\/regenerate/);
      const lessonId = match ? match[1] : null;
      const lesson = lessonId ? storedLessons.get(lessonId) : null;

      if (!lesson) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Lesson not found" }),
        });
        return;
      }

      lesson.content.overview = "Regenerated fresh overview with outdoor focus.";
      lesson.status = "DRAFT";
      storedLessons.set(lesson.id, lesson);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lesson }),
      });
    });
  });

  test("Lesson Generation End-to-End Flow: Dashboard Quick Create -> Form -> Generate -> Edit -> Save -> Reopen", async ({
    page,
  }) => {
    // 1. Dashboard Quick Create
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toHaveText("Welcome, Dr. Vikram Seth");

    // Verify Quick Create "Lesson Plan" is active and clickable
    const lessonCard = page.getByTestId("quick-create-lesson");
    await expect(lessonCard).toBeVisible();
    await lessonCard.click();

    // 2. Land on Create Lesson Page
    await expect(page).toHaveURL("/create/lesson");
    await expect(page.locator("h1")).toHaveText("Create AI Lesson Plan");

    // 3. Fill Form
    await page.fill('input[data-testid="lesson-subject-input"]', "Science");
    await page.fill('input[data-testid="lesson-topic-input"]', "Photosynthesis");
    await page.fill(
      'textarea[data-testid="lesson-instructions-input"]',
      "Include outdoor leaf collection activity.",
    );

    // 4. Click Generate Lesson Plan
    await page.click('button[data-testid="generate-lesson-btn"]');

    // 5. Lands on Lesson Editor
    await expect(page).toHaveURL(/\/lessons\/lesson-1\/edit/, {
      timeout: 10000,
    });
    await expect(page.getByTestId("lesson-edit-page-title")).toHaveText("Edit Lesson Plan");

    // 6. Verify Structured Sections Rendered
    const titleInput = page.getByTestId("editor-title-input");
    await expect(titleInput).toBeVisible();

    // 7. Edit Title & Overview
    await titleInput.fill("Photosynthesis — Sunlight to Plant Food");

    // 8. Save Lesson
    await page.getByTestId("save-lesson-btn").click();
    await expect(page.getByTestId("save-success-alert")).toBeVisible();
    await expect(page.getByTestId("lesson-status-badge")).toHaveText("SAVED");

    // 9. Back to View mode
    await page.getByTestId("back-btn").click();
    await expect(page).toHaveURL("/lessons/lesson-1");
    await expect(page.getByTestId("lesson-details-title")).toHaveText(
      "Photosynthesis — Sunlight to Plant Food",
    );

    // 10. Reopen Editor and verify persistence
    await page.getByTestId("edit-lesson-btn").click();
    await expect(page).toHaveURL("/lessons/lesson-1/edit");
    await expect(page.getByTestId("editor-title-input")).toHaveValue(
      "Photosynthesis — Sunlight to Plant Food",
    );
  });
});
