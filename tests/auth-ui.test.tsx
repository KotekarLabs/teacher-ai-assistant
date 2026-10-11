// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../apps/web/src/pages/Login";
import Signup from "../apps/web/src/pages/Signup";
import Onboarding from "../apps/web/src/pages/Onboarding";
import { ProtectedRoute } from "../apps/web/src/components/ProtectedRoute";
import { useAuthStore } from "../apps/web/src/store/authStore";
import { apiClient } from "../apps/web/src/api/client";
import * as teacherApi from "../apps/web/src/api/teacher.api";

describe("Milestone 3 — Auth & Onboarding UI Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Login Page", () => {
    it("renders brand header, heading, inputs, and submit button", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      expect(screen.getByRole("heading", { name: "Login" })).toBeDefined();
      expect(screen.getByText("Teacher AI Assistant")).toBeDefined();
      expect(screen.getByLabelText("Email")).toBeDefined();
      expect(screen.getByLabelText("Password")).toBeDefined();
      expect(screen.getByRole("button", { name: "Login" })).toBeDefined();
      expect(screen.getByRole("link", { name: /Need an account\? Sign up/i })).toBeDefined();
    });

    it("displays error banner when login request fails", async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce({
        response: { data: { error: "Invalid email or password" } },
      });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "teacher@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "WrongPassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(screen.getByText("Invalid email or password")).toBeDefined();
      });
    });
  });

  describe("Signup Page", () => {
    it("renders brand header, password requirements helper, and signup button", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>,
      );

      expect(screen.getByRole("heading", { name: "Sign Up" })).toBeDefined();
      expect(screen.getByText("Teacher AI Assistant")).toBeDefined();
      expect(screen.getByLabelText("Email")).toBeDefined();
      expect(screen.getByLabelText("Password")).toBeDefined();
      expect(
        screen.getByText(/Must be at least 8 characters with a letter and a number/i),
      ).toBeDefined();
      expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
      expect(screen.getByRole("link", { name: /Already have an account\? Login/i })).toBeDefined();
    });

    it("displays error banner when signup request fails", async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce({
        response: { data: { error: "Email already in use" } },
      });

      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "Password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(screen.getByText("Email already in use")).toBeDefined();
      });
    });
  });

  describe("Onboarding Page", () => {
    it("renders structured sections, quick-add subject chips, and allows chip toggling", () => {
      render(
        <MemoryRouter>
          <Onboarding />
        </MemoryRouter>,
      );

      expect(screen.getByRole("heading", { name: "Complete Teacher Profile" })).toBeDefined();
      expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
      expect(screen.getByLabelText(/Teaching Role/i)).toBeDefined();
      expect(screen.getByLabelText(/Subjects Taught/i)).toBeDefined();
      expect(screen.getByLabelText(/Curriculum Board/i)).toBeDefined();
      expect(screen.getByLabelText(/Experience Level/i)).toBeDefined();
      expect(screen.getByLabelText(/Preferred Language/i)).toBeDefined();

      // Quick add chips
      const mathChip = screen.getByRole("button", { name: /Mathematics/i });
      expect(mathChip).toBeDefined();

      const englishChip = screen.getByRole("button", { name: /English/i });
      fireEvent.click(englishChip);

      // Value should now contain English
      const subjectsInput = screen.getByLabelText(/Subjects Taught/i) as HTMLInputElement;
      expect(subjectsInput.value).toContain("English");
    });

    it("calls createTeacherProfile API upon valid submission", async () => {
      const mockProfile = {
        id: "profile-1",
        userId: "user-1",
        displayName: "Ms. Anita Sharma",
        teachingRole: "Primary School Teacher",
        subjects: ["Mathematics", "Science"],
        curriculumBoard: "CBSE",
        experienceLevel: "3-5 years",
        preferredLanguage: "English",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createSpy = vi
        .spyOn(teacherApi, "createTeacherProfile")
        .mockResolvedValueOnce({ profile: mockProfile });

      render(
        <MemoryRouter>
          <Onboarding />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText(/Display Name/i), {
        target: { value: "Ms. Anita Sharma" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /Complete Setup & Continue/i }),
      );

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: "Ms. Anita Sharma",
            teachingRole: "Primary School Teacher",
            curriculumBoard: "CBSE",
            experienceLevel: "3-5 years",
          }),
        );
      });
    });
  });

  describe("ProtectedRoute & OnboardingRoute Auth Loading States", () => {
    it("renders brand AuthLoading screen when isLoading is true", () => {
      useAuthStore.setState({ isLoading: true });

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute />
        </MemoryRouter>,
      );

      expect(screen.getByText("Loading...")).toBeDefined();
      expect(container.querySelector(".animate-spin")).not.toBeNull();
    });
  });
});
