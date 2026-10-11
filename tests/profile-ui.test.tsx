// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProfileHeader } from "../apps/web/src/components/profile/ProfileHeader";
import { ProfileForm } from "../apps/web/src/components/profile/ProfileForm";
import Profile from "../apps/web/src/pages/Profile";
import { useAuthStore } from "../apps/web/src/store/authStore";
import type { TeacherProfileDTO } from "@teacher-ai/contracts";

const mockProfile: TeacherProfileDTO = {
  id: "prof-1",
  userId: "user-1",
  displayName: "Ms. Sarah Jenkins",
  teachingRole: "Middle School Teacher",
  subjects: ["Mathematics", "Physics"],
  curriculumBoard: "CBSE",
  experienceLevel: "3-5 years",
  preferredLanguage: "English",
  createdAt: "2025-09-15T00:00:00.000Z",
  updatedAt: "2025-09-15T00:00:00.000Z",
};

const mockMutateAsync = vi.fn();
let mockIsPending = false;
let mockProfileHookReturn = {
  data: mockProfile,
  isLoading: false,
  isError: false,
  error: null as Error | null,
  refetch: vi.fn(),
};

vi.mock("../apps/web/src/hooks/useTeacherProfile", () => ({
  useTeacherProfile: () => mockProfileHookReturn,
  useUpdateTeacherProfile: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending,
  }),
}));

describe("Milestone 8 — Profile UI & Settings Suite", () => {
  beforeEach(() => {
    mockIsPending = false;
    mockMutateAsync.mockReset();
    mockProfileHookReturn = {
      data: mockProfile,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "user-1", email: "sarah.jenkins@school.edu" },
      profile: mockProfile,
      hasCompletedOnboarding: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("ProfileHeader Component", () => {
    it("renders educator avatar initials, display name, teaching role, email, and metadata chips", () => {
      render(
        <BrowserRouter>
          <ProfileHeader
            profile={mockProfile}
            email="sarah.jenkins@school.edu"
          />
        </BrowserRouter>,
      );

      expect(screen.getByText("MS")).toBeDefined();
      expect(
        screen.getByRole("heading", { name: "Ms. Sarah Jenkins", level: 1 }),
      ).toBeDefined();
      expect(screen.getByText("Middle School Teacher")).toBeDefined();
      expect(screen.getByText("sarah.jenkins@school.edu")).toBeDefined();
      expect(screen.getByText("CBSE Board")).toBeDefined();
      expect(screen.getByText("3-5 years exp")).toBeDefined();
      expect(screen.getByText(/Joined Sep 2025/i)).toBeDefined();
    });
  });

  describe("ProfileForm Component", () => {
    it("initializes form with profile values and shows 'All changes saved' when pristine", () => {
      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const nameInput = screen.getByLabelText(
        /Display Name/i,
      ) as HTMLInputElement;
      expect(nameInput.value).toBe("Ms. Sarah Jenkins");

      const roleSelect = screen.getByLabelText(
        /Teaching Role/i,
      ) as HTMLSelectElement;
      expect(roleSelect.value).toBe("Middle School Teacher");

      expect(screen.getByText("Mathematics")).toBeDefined();
      expect(screen.getByText("Physics")).toBeDefined();
      expect(screen.getByText("All changes saved")).toBeDefined();

      const saveButton = screen.getByRole("button", { name: /Save Profile/i });
      expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("allows adding a new subject via text input and marks form dirty", async () => {
      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const subjectInput = screen.getByPlaceholderText(/Type a subject name/i);
      const addSubjectBtn = screen.getByRole("button", {
        name: /\+ Add Subject/i,
      });

      fireEvent.change(subjectInput, { target: { value: "Chemistry" } });
      fireEvent.click(addSubjectBtn);

      await waitFor(() => {
        expect(screen.getByText("Chemistry")).toBeDefined();
        expect(screen.getByText("Unsaved changes")).toBeDefined();
      });

      const saveButton = screen.getByRole("button", { name: /Save Profile/i });
      expect((saveButton as HTMLButtonElement).disabled).toBe(false);
    });

    it("allows adding a subject via suggestions pill", async () => {
      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const biologyPill = screen.getByRole("button", { name: /\+ Biology/i });
      fireEvent.click(biologyPill);

      await waitFor(() => {
        expect(screen.getByText("Biology")).toBeDefined();
        expect(screen.getByText("Unsaved changes")).toBeDefined();
      });
    });

    it("allows removing a subject and shows validation error if all subjects removed", async () => {
      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const removeMathBtn = screen.getByRole("button", {
        name: /Remove subject Mathematics/i,
      });
      fireEvent.click(removeMathBtn);

      await waitFor(() => {
        expect(screen.queryByText("Mathematics")).toBeNull();
      });

      const removePhysicsBtn = screen.getByRole("button", {
        name: /Remove subject Physics/i,
      });
      fireEvent.click(removePhysicsBtn);

      await waitFor(() => {
        expect(screen.queryByText("Physics")).toBeNull();
        expect(screen.getByText(/No subjects selected/i)).toBeDefined();
      });

      // Attempt to save with 0 subjects
      const saveButton = screen.getByRole("button", { name: /Save Profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please select at least one subject/i),
        ).toBeDefined();
      });
    });

    it("discards changes back to initial state when clicking Discard Changes", async () => {
      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const nameInput = screen.getByLabelText(
        /Display Name/i,
      ) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "Dr. Jenkins Modified" } });

      expect(screen.getByText("Unsaved changes")).toBeDefined();

      const discardBtn = screen.getByRole("button", {
        name: /Discard Changes/i,
      });
      expect((discardBtn as HTMLButtonElement).disabled).toBe(false);

      fireEvent.click(discardBtn);

      await waitFor(() => {
        expect(nameInput.value).toBe("Ms. Sarah Jenkins");
        expect(screen.getByText("All changes saved")).toBeDefined();
      });
    });

    it("submits updated data and displays success announcement banner", async () => {
      mockMutateAsync.mockResolvedValue({
        ...mockProfile,
        displayName: "Ms. Sarah Jenkins M.Sc.",
        subjects: ["Mathematics", "Physics", "Computer Science"],
      });

      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const nameInput = screen.getByLabelText(/Display Name/i);
      fireEvent.change(nameInput, {
        target: { value: "Ms. Sarah Jenkins M.Sc." },
      });

      const subjectInput = screen.getByPlaceholderText(/Type a subject name/i);
      const addSubjectBtn = screen.getByRole("button", {
        name: /\+ Add Subject/i,
      });
      fireEvent.change(subjectInput, { target: { value: "Computer Science" } });
      fireEvent.click(addSubjectBtn);

      const saveButton = screen.getByRole("button", { name: /Save Profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: "Ms. Sarah Jenkins M.Sc.",
            subjects: ["Mathematics", "Physics", "Computer Science"],
          }),
        );
        expect(
          screen.getByText("Teacher profile updated successfully."),
        ).toBeDefined();
      });
    });

    it("displays error banner when update fails without clearing user input", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Network timeout updating profile"));

      render(
        <BrowserRouter>
          <ProfileForm initialProfile={mockProfile} />
        </BrowserRouter>,
      );

      const nameInput = screen.getByLabelText(
        /Display Name/i,
      ) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "Failed Name Change" } });

      const saveButton = screen.getByRole("button", { name: /Save Profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText("Network timeout updating profile"),
        ).toBeDefined();
      });

      // Value retained
      expect(nameInput.value).toBe("Failed Name Change");
    });
  });

  describe("Profile Page Integration", () => {
    it("renders page title, breadcrumbs, profile header and form when loaded", async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>,
      );

      expect(
        screen.getByText("Teacher Profile & Pedagogical Settings"),
      ).toBeDefined();
      expect(
        screen.getByRole("heading", { name: "Teacher Profile", level: 1 }),
      ).toBeDefined();
      expect(screen.getByTestId("profile-header-card")).toBeDefined();
      expect(screen.getByTestId("profile-form")).toBeDefined();
    });

    it("renders error state with retry button when profile query fails", async () => {
      mockProfileHookReturn = {
        data: null as any,
        isLoading: false,
        isError: true,
        error: new Error("Failed to fetch teacher profile"),
        refetch: vi.fn(),
      };

      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>,
      );

      expect(
        screen.getByText("Failed to load teacher profile"),
      ).toBeDefined();
      expect(
        screen.getByText("Failed to fetch teacher profile"),
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Try Again/i }),
      ).toBeDefined();
    });
  });
});
