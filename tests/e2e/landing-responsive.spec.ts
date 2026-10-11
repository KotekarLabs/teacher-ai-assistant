import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239";

test.describe("Milestone 4 — Public Landing Page Responsive Verification", () => {
  const viewports = [
    { width: 320, height: 640, label: "320px (Mobile Mini / Low End)" },
    { width: 375, height: 667, label: "375px (iPhone SE / Standard Mobile)" },
    { width: 390, height: 844, label: "390px (iPhone 12/13/14)" },
    { width: 430, height: 932, label: "430px (iPhone Pro Max / Large Mobile)" },
    { width: 768, height: 1024, label: "768px (iPad Portrait / Tablet)" },
    { width: 1024, height: 768, label: "1024px (iPad Landscape / Desktop Small)" },
    { width: 1280, height: 800, label: "1280px (Standard Desktop)" },
  ];

  test.beforeEach(async ({ page }) => {
    // Unauthenticated by default
    await page.route(/\/api\/v1\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });
  });

  for (const vp of viewports) {
    test(`Landing page layout and zero horizontal overflow at ${vp.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Verify single H1
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(
        "Classroom-Ready Lessons, Worksheets & Quizzes in Seconds",
      );

      // Verify sections are visible
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("#generators")).toBeVisible();
      await expect(page.locator("#curriculum")).toBeVisible();

      // Verify zero horizontal overflow
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
          path: path.join(ARTIFACT_DIR, `landing_${vp.width}.png`),
        });
      }
    });
  }

  test("Mobile menu interaction at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const mobileMenuBtn = page.getByRole("button", { name: "Open mobile menu" });
    await expect(mobileMenuBtn).toBeVisible();

    // Open mobile menu
    await mobileMenuBtn.click();
    const mobileMenu = page.locator('[data-testid="landing-mobile-menu"]');
    await expect(mobileMenu).toBeVisible();

    // Capture screenshot of mobile menu open
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "landing_375_mobile_menu.png"),
    });

    // Close menu by clicking again
    await mobileMenuBtn.click();
    await expect(mobileMenu).not.toBeVisible();
  });

  test("Unauthenticated CTA navigates to signup", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Click Hero 'Get Started Free' CTA
    const getStartedBtn = page.locator('section').first().getByRole("link", { name: "Get Started Free" });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("h1")).toHaveText("Sign Up");
  });

  test("Authenticated user sees Go to Dashboard CTA and navigates directly", async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "teacher-123", email: "teacher@example.com" },
          profile: {
            id: "profile-123",
            userId: "teacher-123",
            displayName: "Mr. Ramesh Kumar",
            teachingRole: "High School Teacher",
            subjects: ["Mathematics"],
            curriculumBoard: "CBSE",
            experienceLevel: "6-10 years",
            preferredLanguage: "English",
          },
          hasCompletedOnboarding: true,
        }),
      });
    });

    await page.route(/\/api\/v1\/content(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], pagination: { total: 0 } }),
      });
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Verify authenticated hero CTA
    const dashboardCta = page.getByRole("link", { name: "Enter Teacher Workspace" });
    await expect(dashboardCta).toBeVisible();
    await dashboardCta.click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("h1")).toHaveText("Welcome, Mr. Ramesh Kumar");
  });
});
