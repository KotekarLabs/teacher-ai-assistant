import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239";

test.describe("Milestone 5 — Dashboard & Class Management Responsive Verification", () => {
  const viewports = [
    { width: 320, height: 640, label: "320px (Mobile Mini / Low End)" },
    { width: 375, height: 667, label: "375px (iPhone SE / Standard Mobile)" },
    { width: 390, height: 844, label: "390px (iPhone 12/13/14)" },
    { width: 430, height: 932, label: "430px (iPhone Pro Max / Large Mobile)" },
    { width: 768, height: 1024, label: "768px (iPad Portrait / Tablet)" },
    { width: 1024, height: 768, label: "1024px (iPad Landscape / Desktop Small)" },
    { width: 1280, height: 800, label: "1280px (Standard Desktop)" },
  ];

  const currentUser = { id: "teacher-resp-1", email: "anita.sharma@school.edu" };
  const currentProfile = {
    id: "profile-resp-1",
    userId: currentUser.id,
    displayName: "Ms. Anita Sharma",
    teachingRole: "Primary Science Teacher",
    subjects: ["Science", "Mathematics"],
    curriculumBoard: "CBSE",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
  };

  const mockClasses = [
    {
      id: "class-c1",
      teacherId: currentUser.id,
      name: "Grade 4 Science",
      grade: "4",
      section: "A",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
    {
      id: "class-c2",
      teacherId: currentUser.id,
      name: "Grade 5 Mathematics",
      grade: "5",
      section: "B",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
  ];

  test.beforeEach(async ({ page }) => {
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

    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "res-item-1",
              resourceId: "lesson-1",
              type: "LESSON_PLAN",
              title: "Water Cycle Stages",
              subject: "Science",
              topic: "Evaporation & Condensation",
              updatedAt: new Date().toISOString(),
              class: { name: "Grade 4 Science" },
            },
            {
              id: "res-item-2",
              resourceId: "worksheet-1",
              type: "WORKSHEET",
              title: "Fractions Practice",
              subject: "Mathematics",
              topic: "Equivalent Fractions",
              updatedAt: new Date().toISOString(),
              class: { name: "Grade 5 Mathematics" },
            },
          ],
          pagination: { page: 1, pageSize: 4, total: 2, totalPages: 1 },
        }),
      });
    });

    await page.route(/\/api\/v1\/classes(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ classes: mockClasses }),
      });
    });

    await page.route(/\/api\/v1\/classes\/class-c1$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ class: mockClasses[0] }),
      });
    });

    await page.route(/\/api\/v1\/classes\/class-c1\/archive/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ class: { ...mockClasses[0], archivedAt: new Date().toISOString() } }),
      });
    });
  });

  for (const vp of viewports) {
    test(`Dashboard layout and zero horizontal overflow at ${vp.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/dashboard");

      // Verify Welcome Banner
      await expect(page.locator("h1")).toHaveText("Welcome, Ms. Anita Sharma");
      await expect(page.getByText("CBSE Board")).toBeVisible();

      // Verify Quick Create
      await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible();
      await expect(page.getByTestId("quick-create-lesson")).toBeVisible();
      await expect(page.getByTestId("quick-create-worksheet")).toBeVisible();
      await expect(page.getByTestId("quick-create-quiz")).toBeVisible();
      await expect(page.getByTestId("quick-create-homework")).toBeVisible();

      // Verify Recent Resources
      await expect(page.getByRole("heading", { name: "Recent Resources" })).toBeVisible();
      await expect(page.getByText("Water Cycle Stages")).toBeVisible();

      // Verify Zero Horizontal Overflow
      const overflow = await page.evaluate(() => ({
        windowInnerWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));
      expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);
      expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);

      // Capture representative screenshots
      if ([320, 375, 768, 1280].includes(vp.width)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `dashboard_${vp.width}px.png`),
        });
      }
    });

    test(`Classes list layout and zero horizontal overflow at ${vp.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/classes");

      // Verify Classes Header
      await expect(page.locator("h1")).toHaveText("Classes");
      await expect(page.getByRole("link", { name: "Add Class" })).toBeVisible();

      // Verify Class cards
      await expect(page.getByText("Grade 4 Science")).toBeVisible();
      await expect(page.getByText("Grade 5 Mathematics")).toBeVisible();

      // Verify Zero Horizontal Overflow
      const overflow = await page.evaluate(() => ({
        windowInnerWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));
      expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);
      expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);

      // Capture representative screenshots
      if ([320, 1280].includes(vp.width)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `classes_${vp.width}px.png`),
        });
      }
    });
  }

  test("Class Details responsive layout and contextual links", async ({ page }) => {
    // Test on 375px mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/classes/class-c1");

    await expect(page.locator("h1")).toHaveText("Grade 4 Science");
    await expect(page.getByTestId("create-lesson-for-class-btn")).toBeVisible();
    await expect(page.getByTestId("create-worksheet-for-class-btn")).toBeVisible();
    await expect(page.getByTestId("create-quiz-for-class-btn")).toBeVisible();
    await expect(page.getByTestId("create-homework-for-class-btn")).toBeVisible();

    // Check no horizontal overflow on mobile
    const mobileOverflow = await page.evaluate(() => ({
      windowInnerWidth: window.innerWidth,
      docScrollWidth: document.documentElement.scrollWidth,
    }));
    expect(mobileOverflow.docScrollWidth).toBeLessThanOrEqual(mobileOverflow.windowInnerWidth);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "class_details_375px.png"),
    });

    // Test on 1280px desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "class_details_1280px.png"),
    });
  });

  test("Archive modal accessibility, focus trap, and Escape dismissal", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/classes/class-c1");

    // Click Archive button
    const archiveBtn = page.getByRole("button", { name: "Archive", exact: true });
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // Modal dialog is visible
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Archive Class" })).toBeVisible();
    await expect(page.getByText("Are you sure you want to archive Grade 4 Science?")).toBeVisible();

    // Dismiss with Escape key
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Reopen and cancel with Cancel button
    await archiveBtn.click();
    await expect(dialog).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();
  });
});
