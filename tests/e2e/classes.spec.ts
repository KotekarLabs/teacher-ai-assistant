import { test, expect } from "@playwright/test";

test.describe("Class Management Flow", () => {
  const email = "teacher.classes@example.com";
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

  const storedClasses = new Map<string, any>();

  test.beforeEach(async ({ page }) => {
    storedClasses.clear();

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
      if (route.request().method() === "GET") {
        const activeClasses = Array.from(storedClasses.values()).filter(
          (c) => c.archivedAt === null,
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ classes: activeClasses }),
        });
      } else if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        const id = "mock-class-" + (storedClasses.size + 1);
        const newClass = {
          id,
          teacherId: currentUser.id,
          name: body.name,
          grade: body.grade,
          section: body.section || null,
          curriculumBoard: body.curriculumBoard || null,
          academicYear: body.academicYear || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          archivedAt: null,
        };
        storedClasses.set(id, newClass);
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ class: newClass }),
        });
      }
    });

    await page.route(/\/api\/v1\/classes\/([^/]+)$/, async (route) => {
      const match = route.request().url().match(/\/classes\/([^/?]+)/);
      const classId = match ? match[1] : null;
      const classItem = classId ? storedClasses.get(classId) : null;

      if (!classItem) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Class not found" }),
        });
        return;
      }

      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ class: classItem }),
        });
      } else if (route.request().method() === "PATCH") {
        const body = route.request().postDataJSON();
        Object.assign(classItem, body, { updatedAt: new Date().toISOString() });
        storedClasses.set(classItem.id, classItem);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ class: classItem }),
        });
      }
    });

    await page.route(/\/api\/v1\/classes\/([^/]+)\/archive/, async (route) => {
      const match = route.request().url().match(/\/classes\/([^/?]+)\/archive/);
      const classId = match ? match[1] : null;
      const classItem = classId ? storedClasses.get(classId) : null;

      if (!classItem) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Class not found" }),
        });
        return;
      }

      classItem.archivedAt = new Date().toISOString();
      storedClasses.set(classItem.id, classItem);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ class: classItem }),
      });
    });
  });

  test("Classes Complete Lifecycle: Empty -> Create -> Detail -> Edit -> Archive -> Empty", async ({
    page,
  }) => {
    // 1. Start on Dashboard
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toHaveText("Welcome, Ms. Anita Sharma");

    // 2. Click Classes in Sidebar Navigation
    await page.getByRole("complementary").getByRole("link", { name: "Classes" }).click();
    await expect(page).toHaveURL("/classes");
    await expect(page.locator("h1")).toHaveText("Classes");

    // 3. See Empty State and click Add Class
    await expect(page.getByText("No classes yet")).toBeVisible();
    await page.getByRole("link", { name: "Add Class" }).first().click();
    await expect(page).toHaveURL("/classes/new");
    await expect(page.locator("h1")).toHaveText("Create New Class");

    // 4. Fill Create Class Form and Submit
    await page.fill('input[placeholder="e.g. Class 4 Mathematics"]', "Class 4 Mathematics");
    await page.fill('input[placeholder="e.g. 4 or Grade 4"]', "4");
    await page.fill('input[placeholder="e.g. A or Blue"]', "A");
    await page.fill('input[placeholder="e.g. CBSE, ICSE, Cambridge"]', "CBSE");
    await page.fill('input[placeholder="e.g. 2026-27"]', "2026-27");
    await page.click('button[type="submit"]:has-text("Create Class")');

    // 5. Land on Class Details Page
    await expect(page.locator("h1")).toHaveText("Class 4 Mathematics", {
      timeout: 10000,
    });
    await expect(page.getByRole("main").getByText("Grade 4").first()).toBeVisible();
    await expect(page.getByRole("main").getByText("Section A")).toBeVisible();
    await expect(page.getByRole("main").getByText("CBSE").first()).toBeVisible();

    // 6. Click Edit Class
    await page.getByRole("link", { name: "Edit Class" }).click();
    await expect(page.locator("h1")).toHaveText("Edit Class");
    await page.fill('input[id="class-name"]', "Class 4 Advanced Math");
    await page.click('button[type="submit"]:has-text("Save Changes")');

    // 7. Redirected back to Class Details with updated name
    await expect(page.locator("h1")).toHaveText("Class 4 Advanced Math");

    // 8. Click Archive -> Confirm in Dialog
    await page.getByRole("button", { name: "Archive" }).click();
    await expect(page.getByRole("heading", { name: "Archive Class" })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Archive Class" }).click();

    // 9. Redirected back to Classes list (now empty)
    await expect(page).toHaveURL("/classes");
    await expect(page.getByText("No classes yet")).toBeVisible();
  });
});
