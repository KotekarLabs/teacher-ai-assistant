import { test, expect } from "@playwright/test";

test.describe("Dashboard Foundation Flow", () => {
  const email = "teacher.dashboard@example.com";
  const currentUser = { id: "mock-teacher-1", email };
  const currentProfile = {
    id: "mock-profile-1",
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
  });

  test("Authenticated teacher sees full Dashboard Foundation with Quick Create and AppShell", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // 1. AppShell and Welcome Banner
    await expect(page.locator("h1")).toHaveText("Welcome, Ms. Anita Sharma");
    await expect(page.getByText("CBSE Board")).toBeVisible();
    await expect(page.getByText("Mathematics")).toBeVisible();
    await expect(page.getByText("Science")).toBeVisible();

    // 2. Navigation Sidebar
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("complementary").getByText("Create")).toBeVisible();
    await expect(page.getByRole("complementary").getByText("Library")).toBeVisible();
    await expect(page.getByRole("complementary").getByText("Classes")).toBeVisible();

    // 3. Quick Create Cards
    await expect(page.getByRole("heading", { name: "Quick Create" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lesson Plan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Worksheet" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quiz" })).toBeVisible();
    await expect(page.getByText("AI Ready")).toBeVisible();
    const comingSoonBadges = page.getByText("Coming Soon");
    await expect(comingSoonBadges).toHaveCount(3);

    // 4. Recent Resources Empty State
    await expect(page.getByText("Recent Resources")).toBeVisible();
    await expect(page.getByText("No Teaching Resources Yet")).toBeVisible();

    // 5. Logout flow
    await page.click('button:has-text("Logout")');
    await expect(page.locator("h1")).toHaveText("Login", { timeout: 10000 });
  });
});
