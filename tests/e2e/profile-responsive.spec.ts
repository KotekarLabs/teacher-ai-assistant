import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239/.tempmediaStorage";

test.describe("Milestone 8 — Profile, Pedagogical Context & Settings Responsive Verification", () => {
  const viewports = [
    { width: 320, height: 640, label: "320px (Mobile Mini / Low End)" },
    { width: 375, height: 667, label: "375px (iPhone SE / Standard Mobile)" },
    { width: 390, height: 844, label: "390px (iPhone 12/13/14)" },
    { width: 430, height: 932, label: "430px (iPhone Pro Max / Large Mobile)" },
    { width: 768, height: 1024, label: "768px (iPad Portrait / Tablet)" },
    { width: 1024, height: 768, label: "1024px (iPad Landscape / Desktop Small)" },
    { width: 1280, height: 800, label: "1280px (Standard Desktop)" },
  ];

  const currentUser = { id: "teacher-resp-1", email: "sarah.jenkins@school.edu" };
  let currentProfile = {
    id: "profile-resp-1",
    userId: currentUser.id,
    displayName: "Ms. Sarah Jenkins",
    teachingRole: "Middle School Teacher",
    subjects: ["Mathematics", "Physics"],
    curriculumBoard: "CBSE",
    experienceLevel: "3-5 years",
    preferredLanguage: "English",
    createdAt: "2025-08-10T10:00:00.000Z",
    updatedAt: "2025-08-10T10:00:00.000Z",
  };

  test.beforeEach(async ({ page }) => {
    currentProfile = {
      id: "profile-resp-1",
      userId: currentUser.id,
      displayName: "Ms. Sarah Jenkins",
      teachingRole: "Middle School Teacher",
      subjects: ["Mathematics", "Physics"],
      curriculumBoard: "CBSE",
      experienceLevel: "3-5 years",
      preferredLanguage: "English",
      createdAt: "2025-08-10T10:00:00.000Z",
      updatedAt: "2025-08-10T10:00:00.000Z",
    };

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

    // Mock GET /api/v1/teacher/profile
    await page.route(/\/api\/v1\/teacher\/profile$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ profile: currentProfile }),
        });
      } else if (route.request().method() === "PATCH") {
        const patchData = route.request().postDataJSON();
        currentProfile = { ...currentProfile, ...patchData, updatedAt: new Date().toISOString() };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ profile: currentProfile }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock Classes & Content for AppShell
    await page.route(/\/api\/v1\/classes(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ classes: [] }),
      });
    });

    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, limit: 12 }),
      });
    });
  });

  for (const vp of viewports) {
    test(`renders flawlessly and prevents overflow at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/profile");
      await page.waitForLoadState("networkidle");

      // Verify Header Link & Context
      await expect(page.getByTestId("profile-page")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Teacher Profile", level: 1 })).toBeVisible();

      // Verify Profile Header Card and Form Card
      await expect(page.getByTestId("profile-header-card")).toBeVisible();
      await expect(page.getByTestId("profile-form")).toBeVisible();

      // Verify Profile details rendered
      await expect(
        page.getByTestId("profile-header-card").getByText("Ms. Sarah Jenkins"),
      ).toBeVisible();
      await expect(
        page.getByTestId("profile-header-card").getByText("sarah.jenkins@school.edu"),
      ).toBeVisible();
      await expect(
        page.getByTestId("profile-header-card").getByText("CBSE Board"),
      ).toBeVisible();

      // Verify Form inputs
      const nameInput = page.getByLabel("Display Name");
      await expect(nameInput).toHaveValue("Ms. Sarah Jenkins");

      // Verify Subjects
      await expect(
        page.getByTestId("selected-subjects-container").getByText("Mathematics"),
      ).toBeVisible();
      await expect(
        page.getByTestId("selected-subjects-container").getByText("Physics"),
      ).toBeVisible();

      // Verify Sticky Save Bar
      const stickyBar = page.getByTestId("sticky-save-bar");
      await expect(stickyBar).toBeVisible();
      await expect(page.getByText("All changes saved")).toBeVisible();

      // Check NO horizontal scrollbar overflow
      const horizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(horizontalOverflow).toBe(false);

      // Verify interactive touch target heights
      const saveButton = page.getByRole("button", { name: /Save Profile/i });
      const saveBox = await saveButton.boundingBox();
      expect(saveBox).not.toBeNull();
      if (saveBox) {
        expect(saveBox.height).toBeGreaterThanOrEqual(40);
      }

      // Capture screenshots for required widths: 320, 375, 768, 1280 px
      if ([320, 375, 768, 1280].includes(vp.width)) {
        const screenshotPath = path.join(ARTIFACT_DIR, `profile-responsive-${vp.width}px.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
      }
    });
  }

  test("navigates from Header avatar click to /profile", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Click profile link in header
    const profileLink = page.getByRole("link", { name: /View teacher profile/i });
    await expect(profileLink).toBeVisible();
    await profileLink.click();

    await page.waitForURL("**/profile");
    await expect(page.getByTestId("profile-page")).toBeVisible();
  });

  test("edits profile fields, adds subjects, saves successfully, and persists across reload", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Add subject
    const subjectInput = page.getByPlaceholder("Type a subject name...");
    await subjectInput.fill("Computer Science");
    await page.getByRole("button", { name: /\+ Add Subject/i }).click();

    // Verify chip added
    await expect(
      page.getByTestId("selected-subjects-container").getByText("Computer Science"),
    ).toBeVisible();
    await expect(page.getByText("Unsaved changes")).toBeVisible();

    // Edit display name
    const nameInput = page.getByLabel("Display Name");
    await nameInput.fill("Ms. Sarah Jenkins Ph.D.");

    // Save
    const saveButton = page.getByRole("button", { name: /Save Profile/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Status announcement
    await expect(page.getByText("Teacher profile updated successfully.")).toBeVisible();
    await expect(page.getByText("All changes saved")).toBeVisible();

    // Reload page to verify persistence from server
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByLabel("Display Name")).toHaveValue("Ms. Sarah Jenkins Ph.D.");
    await expect(
      page.getByTestId("selected-subjects-container").getByText("Computer Science"),
    ).toBeVisible();
  });
});
