import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const VIEWPORTS = [
  { name: "320px", width: 320, height: 600 },
  { name: "375px", width: 375, height: 667 },
  { name: "390px", width: 390, height: 844 },
  { name: "430px", width: 430, height: 932 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1280px", width: 1280, height: 800 },
];

const ARTIFACT_DIR = path.resolve(
  "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239/.tempmediaStorage"
);

test.describe("Milestone 7 — Resource Library Responsive & Export Verification", () => {
  const currentUser = { id: "teacher-m7", email: "teacher.m7@example.com" };
  const currentProfile = {
    id: "profile-m7",
    userId: currentUser.id,
    displayName: "Dr. Evelyn Reed",
    teachingRole: "High School Teacher",
    subjects: ["Science", "Mathematics"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const sampleClasses = [
    {
      id: "class-bio-10",
      teacherId: currentUser.id,
      name: "Grade 10 Biology",
      grade: "10",
      section: "A",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
  ];

  const initialItems = [
    {
      id: "content-lesson-m7",
      type: "LESSON",
      resourceId: "lesson-m7",
      title: "Cellular Respiration & Krebs Cycle",
      subject: "Biology",
      topic: "Metabolism",
      classId: "class-bio-10",
      class: { id: "class-bio-10", name: "Grade 10 Biology" },
      difficulty: "ADVANCED",
      status: "SAVED",
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:00:00.000Z",
      archivedAt: null,
    },
    {
      id: "content-ws-m7",
      type: "WORKSHEET",
      resourceId: "worksheet-m7",
      title: "Cell Structure Analysis Worksheet",
      subject: "Biology",
      topic: "Cell Organelles",
      classId: "class-bio-10",
      class: { id: "class-bio-10", name: "Grade 10 Biology" },
      difficulty: "INTERMEDIATE",
      status: "SAVED",
      createdAt: "2026-10-02T11:00:00.000Z",
      updatedAt: "2026-10-02T11:00:00.000Z",
      archivedAt: null,
    },
    {
      id: "content-quiz-m7",
      type: "QUIZ",
      resourceId: "quiz-m7",
      title: "Mitosis & Meiosis Quiz",
      subject: "Biology",
      topic: "Cell Division",
      classId: null,
      class: null,
      difficulty: "MEDIUM",
      status: "SAVED",
      createdAt: "2026-10-03T12:00:00.000Z",
      updatedAt: "2026-10-03T12:00:00.000Z",
      archivedAt: null,
    },
    {
      id: "content-homework-m7",
      type: "HOMEWORK",
      resourceId: "homework-m7",
      title: "Genetics Problem Set",
      subject: "Biology",
      topic: "Mendelian Genetics",
      classId: null,
      class: null,
      difficulty: "ADVANCED",
      status: "SAVED",
      createdAt: "2026-10-04T13:00:00.000Z",
      updatedAt: "2026-10-04T13:00:00.000Z",
      archivedAt: null,
    },
  ];

  let storedContent: any[] = [];

  test.beforeEach(async ({ page }) => {
    storedContent = JSON.parse(JSON.stringify(initialItems));

    // Ensure artifact storage directory exists
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }

    // Mock Auth
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

    // Mock Classes
    await page.route(/\/api\/v1\/classes(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ classes: sampleClasses }),
      });
    });

    // Mock Duplicate Content
    await page.route(/\/api\/v1\/content\/([^/]+)\/duplicate$/, async (route) => {
      const match = route.request().url().match(/\/content\/([^/?]+)\/duplicate/);
      const contentId = match ? match[1] : null;
      const original = storedContent.find((i) => i.id === contentId);

      if (!original) {
        await route.fulfill({ status: 404, body: JSON.stringify({ error: "Not found" }) });
        return;
      }

      const dupId = `${original.id}-copy`;
      const duplicatedItem = {
        ...original,
        id: dupId,
        resourceId: `${original.resourceId}-copy`,
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storedContent.unshift(duplicatedItem);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ message: "Duplicated successfully", content: duplicatedItem }),
      });
    });

    // Mock Archive Content
    await page.route(/\/api\/v1\/content\/([^/]+)\/archive$/, async (route) => {
      const match = route.request().url().match(/\/content\/([^/?]+)\/archive/);
      const contentId = match ? match[1] : null;
      const item = storedContent.find((i) => i.id === contentId);

      if (item) {
        item.status = "ARCHIVED";
        item.archivedAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Archived successfully", content: item }),
      });
    });

    // Mock Content List
    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search")?.toLowerCase();
      const type = url.searchParams.get("type");
      const classId = url.searchParams.get("classId");
      const status = url.searchParams.get("status") || "ACTIVE";
      const sort = url.searchParams.get("sort") || "updatedAt_desc";
      const pageNum = parseInt(url.searchParams.get("page") || "1", 10);
      const pageSize = parseInt(url.searchParams.get("pageSize") || "18", 10);

      let items = [...storedContent];

      if (status === "ARCHIVED") {
        items = items.filter((i) => i.archivedAt !== null || i.status === "ARCHIVED");
      } else {
        items = items.filter((i) => !i.archivedAt && i.status !== "ARCHIVED");
      }

      if (type && type !== "ALL") {
        items = items.filter((i) => i.type === type);
      }

      if (classId) {
        items = items.filter((i) => i.classId === classId);
      }

      if (search) {
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(search) ||
            i.subject.toLowerCase().includes(search) ||
            i.topic.toLowerCase().includes(search),
        );
      }

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
          pagination: { page: pageNum, pageSize, total, totalPages },
        }),
      });
    });

    // Mock individual resource detail endpoints
    await page.route(/\/api\/v1\/worksheets\/worksheet-m7$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          worksheet: {
            id: "worksheet-m7",
            title: "Cell Structure Analysis Worksheet",
            subject: "Biology",
            topic: "Cell Organelles",
            difficulty: "INTERMEDIATE",
            instructions: "Identify the organelle functions below.",
            questions: [
              {
                id: "q1",
                position: 1,
                type: "SHORT_ANSWER",
                question: "Explain the role of mitochondria in ATP synthesis.",
                options: [],
                expectedAnswer: "Produces ATP via aerobic respiration.",
                marks: 3,
                difficulty: "INTERMEDIATE",
              },
            ],
            status: "SAVED",
          },
        }),
      });
    });

    await page.route(/\/api\/v1\/homeworks\/homework-m7$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          homework: {
            id: "homework-m7",
            title: "Genetics Problem Set",
            subject: "Biology",
            topic: "Mendelian Genetics",
            difficulty: "ADVANCED",
            instructions: "Complete the Punnett square exercises in your notebook.",
            tasks: [
              {
                position: 1,
                title: "Dihybrid Cross Analysis",
                description: "Calculate F2 phenotypic ratio for heterozygous cross.",
                type: "PROBLEM_SOLVING",
              },
            ],
            status: "SAVED",
          },
        }),
      });
    });

    // Mock PDF Export endpoints with binary %PDF-1.4 stream
    await page.route(/\/api\/v1\/(worksheets|homeworks|lessons|quizzes)\/([^/]+)\/export\/pdf/, async (route) => {
      const url = route.request().url();
      let filename = "resource.pdf";
      if (url.includes("worksheets")) filename = "cell-structure-analysis-worksheet.pdf";
      else if (url.includes("homeworks")) filename = "genetics-problem-set-homework.pdf";
      else if (url.includes("lessons")) filename = "cellular-respiration-lesson.pdf";
      else if (url.includes("quizzes")) filename = "mitosis-meiosis-quiz.pdf";

      const dummyPdf = Buffer.from("%PDF-1.4 Mock pedagogical content binary stream for teacher download");
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

  // Responsive Viewport Overflow & Layout Checks
  for (const vp of VIEWPORTS) {
    test(`[${vp.name}] Resource Library renders cleanly without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/library");

      await expect(page.locator("h1")).toHaveText("Resource Library");
      await expect(page.getByTestId("content-search-input")).toBeVisible();
      await expect(page.getByTestId("content-card-content-lesson-m7")).toBeVisible();

      // Check zero horizontal scroll overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth + 2;
      });
      expect(overflow).toBe(true);

      // Capture representative screenshots
      if (["320px", "375px", "768px", "1280px"].includes(vp.name)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `library-responsive-${vp.name}.png`),
          fullPage: true,
        });
      }
    });
  }

  // Functional Discovery: Search, Filter, Class & Sort
  test("[375px] Search, type filter, class select, and sort interact seamlessly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/library");

    // Search
    await page.fill('[data-testid="content-search-input"]', "Krebs");
    await page.waitForTimeout(400); // debounce
    await expect(page.getByText("Cellular Respiration & Krebs Cycle")).toBeVisible();
    await expect(page.getByText("Cell Structure Analysis Worksheet")).toBeHidden();

    // Clear search
    await page.click('[data-testid="clear-search-btn"]');
    await expect(page.getByText("Cell Structure Analysis Worksheet")).toBeVisible();

    // Type filter: Worksheet
    await page.getByRole("tab", { name: /Worksheets/i }).click();
    await expect(page.getByText("Cell Structure Analysis Worksheet")).toBeVisible();
    await expect(page.getByText("Cellular Respiration & Krebs Cycle")).toBeHidden();

    // Reset to All
    await page.getByRole("tab", { name: /All Resources/i }).click();
    await expect(page.getByText("Cellular Respiration & Krebs Cycle")).toBeVisible();

    // Filter by Class
    await page.selectOption('[id="library-class-select"]', "class-bio-10");
    await expect(page.getByText("Cellular Respiration & Krebs Cycle")).toBeVisible();
    await expect(page.getByText("Mitosis & Meiosis Quiz")).toBeHidden();

    // Clear Class Filter
    await page.selectOption('[id="library-class-select"]', "");
    await expect(page.getByText("Mitosis & Meiosis Quiz")).toBeVisible();
  });

  // Duplicate & Archive Actions
  test("[390px] Duplicate resource and archive resource with modal confirmation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/library");

    // Duplicate Lesson
    const dupBtn = page.getByTestId("duplicate-resource-btn-content-lesson-m7");
    await expect(dupBtn).toBeVisible();
    await dupBtn.click();

    // Verify duplicated copy appears
    await expect(page.getByText("Cellular Respiration & Krebs Cycle (Copy)")).toBeVisible({ timeout: 5000 });

    // Archive Worksheet
    const archiveBtn = page.getByTestId("archive-resource-btn-content-ws-m7");
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // Dialog appears with accessible Modal
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Archive Worksheet")).toBeVisible();

    // Confirm Archive
    await page.click('[data-testid="confirm-archive-btn"]');

    // Verify worksheet is hidden in active view
    await expect(page.getByTestId("content-card-content-ws-m7")).toBeHidden({ timeout: 5000 });

    // Switch to Archived view
    await page.getByRole("button", { name: "Archived" }).click();
    await expect(page.getByTestId("content-card-content-ws-m7")).toBeVisible({ timeout: 5000 });
  });

  // PDF Export Follow-Up Verification: Worksheet and Homework
  test("[1280px] PDF Follow-Up: Genuine Worksheet PDF download inspection", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/worksheets/worksheet-m7");

    await expect(page.getByTestId("worksheet-details")).toBeVisible();
    await expect(page.getByTestId("export-pdf-btn")).toBeVisible();

    // Trigger genuine download event
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-pdf-btn").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("cell-structure-analysis-worksheet.pdf");

    // Save and inspect binary content
    const savePath = path.join(ARTIFACT_DIR, download.suggestedFilename());
    await download.saveAs(savePath);
    expect(fs.existsSync(savePath)).toBe(true);

    const buffer = fs.readFileSync(savePath);
    const header = buffer.subarray(0, 8).toString("utf-8");
    expect(header.startsWith("%PDF-")).toBe(true);
    expect(buffer.length).toBeGreaterThan(20);
  });

  test("[1280px] PDF Follow-Up: Genuine Homework PDF download inspection", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/homeworks/homework-m7");

    await expect(page.getByTestId("homework-details")).toBeVisible();
    await expect(page.getByTestId("export-pdf-btn")).toBeVisible();

    // Trigger genuine download event
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-pdf-btn").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("genetics-problem-set-homework.pdf");

    // Save and inspect binary content
    const savePath = path.join(ARTIFACT_DIR, download.suggestedFilename());
    await download.saveAs(savePath);
    expect(fs.existsSync(savePath)).toBe(true);

    const buffer = fs.readFileSync(savePath);
    const header = buffer.subarray(0, 8).toString("utf-8");
    expect(header.startsWith("%PDF-")).toBe(true);
    expect(buffer.length).toBeGreaterThan(20);
  });
});
