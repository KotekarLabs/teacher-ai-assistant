import { test, expect } from "@playwright/test";

test.describe("Teacher Onboarding Flow", () => {
  const email = `teacher-e2e-${Date.now()}@example.com`;
  const password = "Password123";
  let currentUser: { id: string; email: string } | null = null;
  let currentProfile: any = null;

  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/signup/, async (route) => {
      currentUser = { id: "mock-teacher-id-1", email };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ user: currentUser }),
        headers: { "set-cookie": "token=mock-jwt-token; Path=/; HttpOnly" },
      });
    });

    await page.route(/\/api\/v1\/auth\/login/, async (route) => {
      currentUser = { id: "mock-teacher-id-1", email };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: currentUser }),
        headers: { "set-cookie": "token=mock-jwt-token; Path=/; HttpOnly" },
      });
    });

    await page.route(/\/api\/v1\/auth\/logout/, async (route) => {
      currentUser = null;
      currentProfile = null;
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
            profile: currentProfile,
            hasCompletedOnboarding: !!currentProfile,
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

    await page.route(/\/api\/v1\/teacher\/profile/, async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        currentProfile = {
          id: "mock-profile-1",
          userId: currentUser?.id,
          displayName: body.displayName,
          teachingRole: body.teachingRole,
          subjects: body.subjects,
          curriculumBoard: body.curriculumBoard,
          experienceLevel: body.experienceLevel,
          preferredLanguage: body.preferredLanguage || "English",
        };
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ profile: currentProfile }),
        });
      } else if (route.request().method() === "GET") {
        if (currentProfile) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ profile: currentProfile }),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ error: "Teacher profile not found" }),
          });
        }
      }
    });
  });

  test("New Signup -> Redirected to Onboarding -> Fill Profile -> Redirected to Dashboard", async ({
    page,
  }) => {
    // 1. Signup
    await page.goto("/signup");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // 2. Automatically routed to Onboarding
    await expect(page.locator("h1")).toHaveText("Complete Teacher Profile", {
      timeout: 10000,
    });

    // 3. Attempting to navigate to Dashboard directly redirects back to Onboarding
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toHaveText("Complete Teacher Profile");

    // 4. Fill Onboarding Form
    await page.fill('input[placeholder="e.g. Ms. Sarah Jenkins"]', "Ms. Anita Sharma");
    await page.click('button[type="submit"]');

    // 5. Successfully redirected to Dashboard with profile display name
    await expect(page.locator("h1")).toHaveText("Welcome, Ms. Anita Sharma", {
      timeout: 10000,
    });
    await expect(page.getByText("Quick Create")).toBeVisible();
    await expect(page.getByText("CBSE Board")).toBeVisible();

    // 6. Direct navigation to /onboarding redirects to /dashboard now that profile exists
    await page.goto("/onboarding");
    await expect(page.locator("h1")).toHaveText("Welcome, Ms. Anita Sharma");
  });
});
