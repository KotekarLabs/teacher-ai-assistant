// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../apps/web/src/pages/Dashboard";
import { AppShell } from "../apps/web/src/components/layout/AppShell";
import { useAuthStore } from "../apps/web/src/store/authStore";

describe("Dashboard & AppShell Components", () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      hasCompletedOnboarding: true,
      user: {
        id: "teacher-123",
        email: "anita.sharma@school.edu",
      },
      profile: {
        id: "profile-123",
        userId: "teacher-123",
        displayName: "Ms. Anita Sharma",
        teachingRole: "Primary School Teacher",
        subjects: ["Mathematics", "Science"],
        curriculumBoard: "CBSE",
        experienceLevel: "3-5 years",
        preferredLanguage: "English",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  it("renders WelcomeBanner with teacher identity and teaching context", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Welcome, Ms. Anita Sharma/i, level: 1 }),
    ).toBeDefined();
    expect(screen.getByText(/CBSE Board/i)).toBeDefined();
    expect(screen.getByText("Mathematics")).toBeDefined();
    expect(screen.getByText("Science")).toBeDefined();
    expect(screen.getByText(/3-5 years exp/i)).toBeDefined();
  });

  it("renders Quick Create section with active Lesson Plan, active Worksheet, and 2 Coming Soon badges", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Quick Create/i, level: 2 }),
    ).toBeDefined();
    expect(screen.getByText("Lesson Plan")).toBeDefined();
    expect(screen.getByText("Worksheet")).toBeDefined();
    expect(screen.getByText("Quiz")).toBeDefined();
    expect(screen.getByText("Homework")).toBeDefined();

    const aiReadyBadges = screen.getAllByText(/AI Ready/i);
    expect(aiReadyBadges.length).toBe(2);

    const comingSoonBadges = screen.getAllByText(/Coming Soon/i);
    expect(comingSoonBadges.length).toBe(2);
  });

  it("renders Recent Resources section with accessible empty state", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Recent Resources/i, level: 2 }),
    ).toBeDefined();
    expect(screen.getByText("No Teaching Resources Yet")).toBeDefined();
    expect(
      screen.getByText(
        /Your generated lesson plans, worksheets, quizzes, and classroom resources will appear here/i,
      ),
    ).toBeDefined();
  });

  it("renders AppShell navigation landmarks and teacher header", () => {
    render(
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>,
    );

    // Sidebar & Navigation
    expect(screen.getByRole("complementary", { name: /Main Navigation/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Logout/i })).toBeDefined();
  });
});
