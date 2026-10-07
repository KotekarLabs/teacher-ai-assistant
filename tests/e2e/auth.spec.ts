import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "Password123";
  let currentUser: { id: string; email: string } | null = null;

  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/signup/, async (route) => {
      currentUser = { id: "mock-user-1", email };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ user: currentUser }),
        headers: { "set-cookie": "token=mock-jwt-token; Path=/; HttpOnly" },
      });
    });

    await page.route(/\/api\/v1\/auth\/login/, async (route) => {
      currentUser = { id: "mock-user-1", email };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: currentUser }),
        headers: { "set-cookie": "token=mock-jwt-token; Path=/; HttpOnly" },
      });
    });

    await page.route(/\/api\/v1\/auth\/logout/, async (route) => {
      currentUser = null;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route(/\/api\/v1\/auth\/me/, async (route) => {
      if (currentUser) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: currentUser,
            profile: {
              id: "profile-1",
              userId: currentUser.id,
              displayName: "Test Teacher",
              teachingRole: "Primary School Teacher",
              subjects: ["Math"],
              curriculumBoard: "CBSE",
              experienceLevel: "3-5 years",
              preferredLanguage: "English",
            },
            hasCompletedOnboarding: true,
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Unauthorized" }),
        });
      }
    });
  });

  test("Signup -> Protected Route -> Logout -> Denied", async ({ page }) => {
    // 1. Signup
    await page.goto("/signup");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // 2. Redirected to Dashboard (Protected)
    await expect(page.locator("h1")).toHaveText("Welcome, Test Teacher", {
      timeout: 10000,
    });
    await expect(page.getByText("Quick Create")).toBeVisible();

    // 3. Logout
    await page.click('button:has-text("Logout")');
    await expect(page.locator("h1")).toHaveText("Login", { timeout: 10000 });

    // 4. Try to access protected route again
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toHaveText("Login"); // Redirects back to login
  });

  test("Login -> Protected Route", async ({ page }) => {
    // The user was created in the previous test
    await page.goto("/login");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Redirected to Dashboard
    await expect(page.locator("h1")).toHaveText("Welcome, Test Teacher", {
      timeout: 10000,
    });
  });
});
