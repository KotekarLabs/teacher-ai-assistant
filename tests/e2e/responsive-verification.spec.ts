import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239";

test.describe("Browser-based Responsive Verification & Interaction Suite", () => {
  const email = "teacher.verification@example.com";
  const currentUser = { id: "mock-teacher-resp", email };
  const currentProfile = {
    id: "mock-profile-resp",
    userId: currentUser.id,
    displayName: "Ms. Anita Sharma",
    teachingRole: "Primary School Teacher",
    subjects: ["Mathematics", "Science"],
    curriculumBoard: "CBSE",
    experienceLevel: "3-5 years",
    preferredLanguage: "English",
  };

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

    await page.route(/\/api\/v1\/auth\/logout/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          pagination: {
            page: 1,
            pageSize: 5,
            total: 0,
            totalPages: 0,
          },
        }),
      });
    });
  });

  const viewports = [
    { width: 320, height: 640, label: "320px (Mobile Mini / Low End)" },
    { width: 375, height: 667, label: "375px (iPhone SE / Standard Mobile)" },
    { width: 390, height: 844, label: "390px (iPhone 12/13/14)" },
    { width: 430, height: 932, label: "430px (iPhone Pro Max / Large Mobile)" },
    { width: 768, height: 1024, label: "768px (iPad Portrait / Tablet)" },
    { width: 1024, height: 768, label: "1024px (iPad Landscape / Desktop Small)" },
    { width: 1280, height: 800, label: "1280px (Standard Desktop)" },
  ];

  for (const vp of viewports) {
    test(`Rendered layout and zero-horizontal-overflow check at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/dashboard");

      // Wait for network idle and key element
      await expect(page.locator("h1")).toHaveText("Welcome, Ms. Anita Sharma");

      // Verify zero horizontal overflow on html/body
      const overflow = await page.evaluate(() => {
        return {
          windowInnerWidth: window.innerWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
        };
      });

      expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);
      expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);

      // Verify header elements
      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect(header.getByText("Dashboard")).toBeVisible();
      await expect(header.getByRole("button", { name: "Logout" })).toBeVisible();

      if (vp.width < 768) {
        // Mobile view: hamburger is visible, desktop sidebar is hidden
        await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
        await expect(page.locator('aside')).not.toBeVisible();
      } else {
        // Desktop/Tablet view: desktop sidebar is visible, hamburger is hidden
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.getByRole("button", { name: "Open navigation menu" })).not.toBeVisible();
      }

      // Capture screenshot
      const screenshotPath = path.join(ARTIFACT_DIR, `responsive_${vp.width}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
    });
  }

  test("Mobile drawer: open, navigation, escape dismissal, backdrop dismissal, body scroll and focus restoration", async ({
    page,
  }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    const hamburger = page.getByRole("button", { name: "Open navigation menu" });
    await expect(hamburger).toBeVisible();

    // 1. Open drawer
    await hamburger.click();

    const drawer = page.locator('[data-testid="mobile-nav-dialog"]');
    await expect(drawer).toBeVisible();
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");

    // Verify initial focus moved to close button inside drawer
    const closeBtn = page.getByRole("button", { name: "Close navigation menu" });
    await expect(closeBtn).toBeFocused();

    // Verify body scroll lock applied
    const bodyOverflowLocked = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowLocked).toBe("hidden");

    // Capture drawer screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "responsive_375_drawer_open.png") });

    // 2. Navigate to generator (e.g. Lesson Plan)
    const lessonLink = drawer.getByRole("link", { name: "Lesson Plan" });
    await expect(lessonLink).toBeVisible();
    await lessonLink.click();

    // Verify route change closes drawer and restores body scroll
    await expect(page).toHaveURL(/\/create\/lesson/);
    await expect(drawer).not.toBeVisible();
    const bodyOverflowAfterNav = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowAfterNav).toBe("");

    // Capture generator screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "responsive_375_generator.png") });

    // 3. Re-open drawer and dismiss via Escape key
    const genHamburger = page.getByRole("button", { name: "Open navigation menu" });
    await genHamburger.click();
    await expect(drawer).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    // Focus should be restored to the hamburger button
    await expect(genHamburger).toBeFocused();

    // 4. Re-open drawer and dismiss via Backdrop click
    await genHamburger.click();
    await expect(drawer).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    const backdrop = page.locator('[data-testid="mobile-nav-backdrop"]');
    await backdrop.click({ position: { x: 350, y: 100 } }); // click on right side outside drawer panel (w-72 = 288px)
    await expect(drawer).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("Header and Logout action verification", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dashboard");

    const logoutBtn = page.getByRole("button", { name: "Logout" });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verification that user is navigated to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toHaveText("Login");

    // Capture screenshot on login page
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "responsive_1280_logged_out.png") });
  });
});
