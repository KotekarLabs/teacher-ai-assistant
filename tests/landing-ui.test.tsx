// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Landing from "../apps/web/src/pages/Landing";
import { useAuthStore } from "../apps/web/src/store/authStore";

describe("Milestone 4 — Landing Page UI Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      profile: null,
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders semantic landmarks: header, main, footer and a single h1", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();

    const h1Headings = screen.getAllByRole("heading", { level: 1 });
    expect(h1Headings).toHaveLength(1);
    expect(h1Headings[0].textContent).toContain(
      "Classroom-Ready Lessons, Worksheets & Quizzes in Seconds",
    );
  });

  it("renders the 4 pedagogical generator pillars", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Structured Lesson Plans" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Classroom Worksheets" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Dual-Mode Quizzes" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Homework Assignments" })).toBeDefined();
  });

  it("renders unauthenticated CTAs pointing to /signup and /login", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    const signupLinks = screen.getAllByRole("link", { name: /Get Started Free|Sign Up/i });
    expect(signupLinks.length).toBeGreaterThan(0);
    expect(signupLinks.some((l) => l.getAttribute("href") === "/signup")).toBe(true);

    const loginLinks = screen.getAllByRole("link", { name: /Login|Teacher Login/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks.some((l) => l.getAttribute("href") === "/login")).toBe(true);
  });

  it("adapts primary CTAs to dashboard when user is authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u-1", email: "teacher@test.com" },
      hasCompletedOnboarding: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    const dashboardLinks = screen.getAllByRole("link", {
      name: /Go to Dashboard|Enter Teacher Workspace|Return to Dashboard/i,
    });
    expect(dashboardLinks.length).toBeGreaterThan(0);
    dashboardLinks.forEach((l) => {
      expect(l.getAttribute("href")).toBe("/dashboard");
    });
  });

  it("toggles sample quiz view between Student Mode and Answer Key", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Student Assessment: Write-in answers only/i)).toBeDefined();

    const answerKeyBtn = screen.getByRole("button", { name: /Answer Key/i });
    fireEvent.click(answerKeyBtn);

    expect(screen.getByText(/Teacher Key: Complete solutions & explanation/i)).toBeDefined();
    expect(screen.getByText(/Ans: Mitochondria/i)).toBeDefined();
  });
});
