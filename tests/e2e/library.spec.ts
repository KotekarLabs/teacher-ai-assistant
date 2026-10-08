import { test, expect } from "@playwright/test";

test.describe("Content Library / Unified Resource Management Flow", () => {
  const email = "teacher.library.e2e@example.com";
  const currentUser = { id: "mock-teacher-lib", email };
  const currentProfile = {
    id: "mock-profile-lib",
    userId: currentUser.id,
    displayName: "Ms. Anita Sharma",
    teachingRole: "Middle School Teacher",
    subjects: ["Science", "Mathematics"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const storedClasses = new Map<string, any>();
  const storedContent = new Map<string, any>();

  test.beforeEach(async ({ page }) => {
    storedClasses.clear();
    storedContent.clear();

    const sampleClass = {
      id: "class-science-8",
      teacherId: currentUser.id,
      name: "Grade 8 Science A",
      grade: "8",
      section: "A",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    };
    storedClasses.set(sampleClass.id, sampleClass);

    // Seed 4 resources in the catalog (1 Lesson, 1 Worksheet, 1 Quiz, 1 Homework)
    const seedItems = [
      {
        id: "content-lesson-1",
        type: "LESSON",
        resourceId: "lesson-1",
        title: "Photosynthesis & Cellular Energy",
        subject: "Science",
        topic: "Plant Energy",
        classId: "class-science-8",
        class: { id: "class-science-8", name: "Grade 8 Science A" },
        difficulty: "INTERMEDIATE",
        status: "SAVED",
        createdAt: "2026-10-01T10:00:00.000Z",
        updatedAt: "2026-10-01T10:00:00.000Z",
        archivedAt: null,
      },
      {
        id: "content-worksheet-1",
        type: "WORKSHEET",
        resourceId: "worksheet-1",
        title: "Plant Cell Structure Worksheet",
        subject: "Science",
        topic: "Cell Organelles",
        classId: "class-science-8",
        class: { id: "class-science-8", name: "Grade 8 Science A" },
        difficulty: "BEGINNER",
        status: "SAVED",
        createdAt: "2026-10-02T11:00:00.000Z",
        updatedAt: "2026-10-02T11:00:00.000Z",
        archivedAt: null,
      },
      {
        id: "content-quiz-1",
        type: "QUIZ",
        resourceId: "quiz-1",
        title: "Algebraic Equations Mastery Quiz",
        subject: "Mathematics",
        topic: "Linear Equations",
        classId: null,
        class: null,
        difficulty: "ADVANCED",
        status: "SAVED",
        createdAt: "2026-10-03T12:00:00.000Z",
        updatedAt: "2026-10-03T12:00:00.000Z",
        archivedAt: null,
      },
      {
        id: "content-homework-1",
        type: "HOMEWORK",
        resourceId: "homework-1",
        title: "Fractions Take-Home Assignment",
        subject: "Mathematics",
        topic: "Adding Fractions",
        classId: null,
        class: null,
        difficulty: "BEGINNER",
        status: "SAVED",
        createdAt: "2026-10-04T13:00:00.000Z",
        updatedAt: "2026-10-04T13:00:00.000Z",
        archivedAt: null,
      },
    ];

    seedItems.forEach((item) => storedContent.set(item.id, item));

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

    // Content API routes
    await page.route(/\/api\/v1\/content\/([^/]+)\/duplicate$/, async (route) => {
      const match = route.request().url().match(/\/content\/([^/?]+)\/duplicate/);
      const contentId = match ? match[1] : null;
      const original = contentId ? storedContent.get(contentId) : null;

      if (!original) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Content not found" }),
        });
        return;
      }

      const newId = `content-${original.type.toLowerCase()}-${storedContent.size + 1}`;
      const newResourceId = `${original.type.toLowerCase()}-${storedContent.size + 1}`;
      const duplicatedItem = {
        ...original,
        id: newId,
        resourceId: newResourceId,
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storedContent.set(newId, duplicatedItem);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Resource duplicated successfully",
          content: duplicatedItem,
        }),
      });
    });

    await page.route(/\/api\/v1\/content\/([^/]+)\/archive$/, async (route) => {
      const match = route.request().url().match(/\/content\/([^/?]+)\/archive/);
      const contentId = match ? match[1] : null;
      const item = contentId ? storedContent.get(contentId) : null;

      if (!item) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Content not found" }),
        });
        return;
      }

      item.status = "ARCHIVED";
      item.archivedAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Resource archived successfully",
          content: item,
        }),
      });
    });

    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search")?.toLowerCase();
      const type = url.searchParams.get("type");
      const classId = url.searchParams.get("classId");
      const status = url.searchParams.get("status") || "ACTIVE";
      const sort = url.searchParams.get("sort") || "updatedAt_desc";
      const pageNum = parseInt(url.searchParams.get("page") || "1", 10);
      const pageSize = parseInt(url.searchParams.get("pageSize") || "18", 10);

      let items = Array.from(storedContent.values());

      // Filter by status (active vs archived)
      if (status === "ARCHIVED") {
        items = items.filter((i) => i.archivedAt !== null || i.status === "ARCHIVED");
      } else {
        items = items.filter((i) => !i.archivedAt && i.status !== "ARCHIVED");
      }

      // Filter by type
      if (type && type !== "ALL") {
        items = items.filter((i) => i.type === type);
      }

      // Filter by classId
      if (classId) {
        items = items.filter((i) => i.classId === classId);
      }

      // Search keyword
      if (search) {
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(search) ||
            i.subject.toLowerCase().includes(search) ||
            i.topic.toLowerCase().includes(search),
        );
      }

      // Sort
      if (sort === "title_asc") {
        items.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "title_desc") {
        items.sort((a, b) => b.title.localeCompare(a.title));
      } else if (sort === "updatedAt_asc") {
        items.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      } else {
        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

      const total = items.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const paginatedItems = items.slice((pageNum - 1) * pageSize, pageNum * pageSize);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: paginatedItems,
          pagination: {
            page: pageNum,
            pageSize,
            total,
            totalPages,
          },
        }),
      });
    });

    // Mock individual resource detail endpoints
    await page.route(/\/api\/v1\/lessons\/lesson-1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          lesson: {
            id: "lesson-1",
            title: "Photosynthesis & Cellular Energy",
            subject: "Science",
            topic: "Plant Energy",
            objectives: ["Understand chloroplast function"],
            activities: [],
            status: "SAVED",
          },
        }),
      });
    });
  });

  test("Content Library End-to-End Discovery, Search, Filter, Sort, Duplicate, Archive, and Class Integration", async ({
    page,
  }) => {
    // 1. Visit Library via AppShell navigation
    await page.goto("/dashboard");
    await expect(page.getByRole("complementary").getByText("Library")).toBeVisible();
    await page.getByRole("complementary").getByText("Library").click();

    await expect(page.locator("h1")).toHaveText("Resource Library");

    // 2. Verify all 4 resource types are visible in the unified library
    await expect(page.getByText("Photosynthesis & Cellular Energy")).toBeVisible();
    await expect(page.getByText("Plant Cell Structure Worksheet")).toBeVisible();
    await expect(page.getByText("Algebraic Equations Mastery Quiz")).toBeVisible();
    await expect(page.getByText("Fractions Take-Home Assignment")).toBeVisible();

    // Verify type tags on cards
    await expect(page.getByTestId("content-card-content-lesson-1")).toBeVisible();
    await expect(page.getByTestId("content-card-content-worksheet-1")).toBeVisible();
    await expect(page.getByTestId("content-card-content-quiz-1")).toBeVisible();
    await expect(page.getByTestId("content-card-content-homework-1")).toBeVisible();

    // 3. Search for "Photosynthesis"
    await page.fill('[data-testid="content-search-input"]', "Photosynthesis");
    await page.waitForTimeout(400); // debounce

    await expect(page.getByText("Photosynthesis & Cellular Energy")).toBeVisible();
    await expect(page.getByText("Algebraic Equations Mastery Quiz")).toBeHidden();
    await expect(page.getByText("Fractions Take-Home Assignment")).toBeHidden();

    // Clear search
    await page.click('[data-testid="clear-search-btn"]');
    await expect(page.getByText("Algebraic Equations Mastery Quiz")).toBeVisible();

    // 4. Filter by Type "Quiz"
    await page.getByRole("tab", { name: /Quizzes/i }).click();
    await expect(page.getByText("Algebraic Equations Mastery Quiz")).toBeVisible();
    await expect(page.getByText("Photosynthesis & Cellular Energy")).toBeHidden();
    await expect(page.getByText("Plant Cell Structure Worksheet")).toBeHidden();

    // Reset to "All Resources"
    await page.getByRole("tab", { name: /All Resources/i }).click();
    await expect(page.getByText("Photosynthesis & Cellular Energy")).toBeVisible();

    // 5. Filter by Class "Grade 8 Science A"
    await page.selectOption('[id="library-class-select"]', "class-science-8");
    await expect(page.getByText("Photosynthesis & Cellular Energy")).toBeVisible();
    await expect(page.getByText("Plant Cell Structure Worksheet")).toBeVisible();
    await expect(page.getByText("Algebraic Equations Mastery Quiz")).toBeHidden();

    // Reset class filter
    await page.selectOption('[id="library-class-select"]', "");
    await expect(page.getByText("Algebraic Equations Mastery Quiz")).toBeVisible();

    // 6. Duplicate a Resource (Quiz)
    const duplicateQuizBtn = page.getByTestId("duplicate-resource-btn-content-quiz-1");
    await expect(duplicateQuizBtn).toBeVisible();
    await duplicateQuizBtn.click();

    // Verify duplicated copy appears in the library
    await expect(page.getByText("Algebraic Equations Mastery Quiz (Copy)")).toBeVisible({
      timeout: 10000,
    });

    // 7. Archive a Resource (Lesson)
    const archiveLessonBtn = page.getByTestId("archive-resource-btn-content-lesson-1");
    await expect(archiveLessonBtn).toBeVisible();
    await archiveLessonBtn.click();

    // Confirm Archive in Modal
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.click('[data-testid="confirm-archive-btn"]');

    // Verify lesson is removed from Active Library view
    await expect(page.getByTestId("content-card-content-lesson-1")).toBeHidden({
      timeout: 10000,
    });

    // Switch to "Archived" view and verify it appears there
    await page.getByRole("button", { name: "Archived" }).click();
    await expect(page.getByTestId("content-card-content-lesson-1")).toBeVisible({
      timeout: 10000,
    });

    // 8. Class Details integration
    await page.goto("/classes/class-science-8");
    await expect(page.getByRole("heading", { name: "Grade 8 Science A" })).toBeVisible();
    await expect(page.getByTestId("class-resources-list")).toBeVisible();
    await expect(page.getByText("Class Teaching Resources")).toBeVisible();
  });
});
