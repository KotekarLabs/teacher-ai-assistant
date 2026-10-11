import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239";

test.describe("Milestone 3 — Auth & Onboarding Responsive Verification Suite", () => {
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
    // Unauthenticated by default for login/signup
    await page.route(/\/api\/v1\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });
  });

  for (const vp of viewports) {
    test(`Login page responsive layout & zero horizontal overflow at ${vp.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/login");

      await expect(page.locator("h1")).toHaveText("Login");
      await expect(page.getByRole("heading", { name: "Teacher AI Assistant" })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toHaveText("Login");

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
          path: path.join(ARTIFACT_DIR, `auth_${vp.width}_login.png`),
        });
      }
    });

    test(`Signup page responsive layout & zero horizontal overflow at ${vp.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/signup");

      await expect(page.locator("h1")).toHaveText("Sign Up");
      await expect(page.getByRole("heading", { name: "Teacher AI Assistant" })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toHaveText("Sign Up");

      // Verify zero horizontal overflow
      const overflow = await page.evaluate(() => ({
        windowInnerWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));
      expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);
      expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);

      // Capture representative screenshots
      if ([375, 768, 1280].includes(vp.width)) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, `auth_${vp.width}_signup.png`),
        });
      }
    });
  }

  test("Onboarding page responsive layout, chips, and submission across viewports", async ({
    page,
  }) => {
    // Mock authenticated user with incomplete onboarding
    await page.route(/\/api\/v1\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "test-user-id", email: "onboarding.teacher@example.com" },
          profile: null,
          hasCompletedOnboarding: false,
        }),
      });
    });

    let submittedData: any = null;
    await page.route(/\/api\/v1\/teacher\/profile/, async (route) => {
      submittedData = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          profile: {
            id: "mock-p1",
            userId: "test-user-id",
            ...submittedData,
          },
        }),
      });
    });

    const testWidths = [320, 375, 768, 1280];
    for (const w of testWidths) {
      await page.setViewportSize({ width: w, height: w < 768 ? 700 : 900 });
      await page.goto("/onboarding");

      await expect(page.locator("h1")).toHaveText("Complete Teacher Profile");

      // Verify zero horizontal overflow
      const overflow = await page.evaluate(() => ({
        windowInnerWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
      }));
      expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `auth_${w}_onboarding.png`),
      });
    }

    // Interactive Chip test at mobile (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/onboarding");

    // Click English quick-add chip
    const englishChip = page.getByRole("button", { name: /English/i });
    await expect(englishChip).toBeVisible();
    await englishChip.click();

    // Verify subjects input now includes English
    const subjectsInput = page.locator('input#subjects');
    await expect(subjectsInput).toHaveValue(/English/);

    // Fill display name and submit
    await page.fill('input[placeholder="e.g. Ms. Sarah Jenkins"]', "Ms. Anita Sharma");
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForTimeout(500);
    expect(submittedData).not.toBeNull();
    expect(submittedData.displayName).toBe("Ms. Anita Sharma");
    expect(submittedData.subjects).toContain("English");
  });

  test("Mobile keyboard open viewport simulation (reduced height) does not break layout", async ({
    page,
  }) => {
    // When virtual keyboard opens on mobile, available viewport height reduces drastically (e.g., 375x380)
    await page.setViewportSize({ width: 375, height: 380 });
    await page.goto("/login");

    await expect(page.locator("h1")).toHaveText("Login");
    // Ensure form is scrollable and submit button is reachable
    await page.locator('input[type="email"]').fill("teacher@example.com");
    await page.locator('input[type="password"]').fill("Password123");
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeVisible();

    const overflow = await page.evaluate(() => ({
      windowInnerWidth: window.innerWidth,
      docScrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.windowInnerWidth);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "auth_375_keyboard_sim.png"),
    });
  });
});
