import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = "C:/Users/kotek/.gemini/antigravity-ide/brain/23d3c290-19df-4536-95e0-110fe8e9d239/.tempmediaStorage";

test.describe("Milestone 9 — Resilient Resource Creation & Pedagogical Context E2E", () => {
  const viewports = [
    { width: 320, height: 640, label: "320px (Mobile Mini / Low End)" },
    { width: 375, height: 667, label: "375px (iPhone SE / Standard Mobile)" },
    { width: 390, height: 844, label: "390px (iPhone 12/13/14)" },
    { width: 430, height: 932, label: "430px (iPhone Pro Max / Large Mobile)" },
    { width: 768, height: 1024, label: "768px (iPad Portrait / Tablet)" },
    { width: 1024, height: 768, label: "1024px (iPad Landscape / Desktop Small)" },
    { width: 1280, height: 800, label: "1280px (Standard Desktop)" },
  ];

  const currentUser = { id: "teacher-m9", email: "priya.teacher@school.edu" };
  const currentProfile = {
    id: "profile-m9",
    userId: currentUser.id,
    displayName: "Mrs. Priya Patel",
    teachingRole: "Middle School Science Lead",
    subjects: ["Biology", "Physics"],
    curriculumBoard: "Cambridge",
    experienceLevel: "5-10 years",
    preferredLanguage: "English",
    createdAt: "2025-08-10T10:00:00.000Z",
    updatedAt: "2025-08-10T10:00:00.000Z",
  };

  const sampleClasses = [
    {
      id: "class-m9-1",
      teacherId: currentUser.id,
      name: "Grade 9 Biology",
      grade: "9",
      section: "A",
      curriculumBoard: "Cambridge",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
  ];

  test.beforeEach(async ({ page }) => {
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

    // Mock Teacher Profile
    await page.route(/\/api\/v1\/teacher\/profile$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profile: currentProfile }),
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
  });

  for (const vp of viewports) {
    test(`renders creation form without overflow and supports quick-fill at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/create/lesson");
      await page.waitForLoadState("networkidle");

      // Verify page title and form
      await expect(page.getByRole("heading", { name: /Create AI Lesson Plan/i, level: 1 })).toBeVisible();
      await expect(page.getByTestId("lesson-form")).toBeVisible();

      // Verify Profile Subject Quick-fill pills are visible
      const suggestions = page.getByTestId("profile-subject-suggestions");
      await expect(suggestions).toBeVisible();
      await expect(page.getByRole("button", { name: "Biology" })).toBeVisible();

      // Click Biology pill to quick-fill
      await page.getByRole("button", { name: "Biology" }).click();
      await expect(page.getByTestId("lesson-subject-input")).toHaveValue("Biology");

      // Verify No Horizontal Overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // Verify touch targets >= 40px
      const generateBtn = page.getByTestId("generate-lesson-btn");
      const box = await generateBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }

      // Capture screenshot for required viewports
      if ([320, 375, 768, 1280].includes(vp.width)) {
        const screenshotPath = path.join(ARTIFACT_DIR, `resilient-creation-${vp.width}px.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
      }
    });
  }

  test("preserves teacher inputs on generation failure and allows 1-click retry", async ({ page }) => {
    let callCount = 0;

    await page.route(/\/api\/v1\/lessons\/generate$/, async (route) => {
      callCount++;
      if (callCount === 1) {
        // First call fails with 502 Provider Error
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "AI provider timeout during generation" }),
        });
      } else {
        // Second call succeeds
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            lesson: {
              id: "lesson-generated-123",
              title: "Cellular Respiration in Biology",
              subject: "Biology",
              topic: "Cellular Respiration",
              status: "DRAFT",
              content: {
                title: "Cellular Respiration in Biology",
                overview: "Complete overview",
                learningObjectives: ["Understand glycolysis"],
                prerequisites: [],
                introduction: "Intro",
                teacherExplanation: "Explanation",
                examples: ["Yeast fermentation"],
                classroomActivity: { title: "Activity", instructions: "Do work", durationMinutes: 10 },
                practice: [],
                quickAssessment: [],
                homework: "Read chapter 3",
                teacherScript: "Script",
              },
            },
          }),
        });
      }
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/create/lesson");
    await page.waitForLoadState("networkidle");

    // Fill inputs
    await page.getByTestId("lesson-subject-input").fill("Advanced Biology");
    await page.getByTestId("lesson-topic-input").fill("Cellular Respiration");
    await page.getByTestId("lesson-instructions-input").fill("Include hands-on microscope activity.");

    // Submit form
    await page.getByTestId("generate-lesson-btn").click();

    // Verify error alert appears
    const errorAlert = page.getByTestId("generation-error-alert");
    await expect(errorAlert).toBeVisible();
    await expect(page.getByText("AI provider timeout during generation")).toBeVisible();

    // CRITICAL RESILIENCE CHECK: Verify inputs were NOT wiped out!
    await expect(page.getByTestId("lesson-subject-input")).toHaveValue("Advanced Biology");
    await expect(page.getByTestId("lesson-topic-input")).toHaveValue("Cellular Respiration");
    await expect(page.getByTestId("lesson-instructions-input")).toHaveValue("Include hands-on microscope activity.");

    // Click "Retry Generation" button
    const retryBtn = page.getByTestId("retry-generation-btn");
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();

    // Verify successful navigation to edit page
    await page.waitForURL("**/lessons/lesson-generated-123/edit");
    expect(callCount).toBe(2);
  });

  test("shows accessible feedback when attempting to uncheck last question type in Worksheet form", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/create/worksheet");
    await page.waitForLoadState("networkidle");

    // Uncheck Multiple Choice
    const mcqBtn = page.getByTestId("question-type-MULTIPLE_CHOICE");
    await mcqBtn.click();

    // Uncheck Short Answer (the only remaining one)
    const shortAnsBtn = page.getByTestId("question-type-SHORT_ANSWER");
    await shortAnsBtn.click();

    // Verify accessible warning
    const errorMsg = page.getByTestId("question-types-error");
    await expect(errorMsg).toBeVisible();
    await expect(page.getByText("At least one question type must be selected.")).toBeVisible();

    // Re-check MCQ -> warning disappears
    await mcqBtn.click();
    await expect(errorMsg).toBeHidden();
  });
});
