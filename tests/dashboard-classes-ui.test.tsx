// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { WelcomeBanner } from "../apps/web/src/components/dashboard/WelcomeBanner";
import { QuickCreateCard } from "../apps/web/src/components/dashboard/QuickCreateCard";
import { QuickCreateGrid } from "../apps/web/src/components/dashboard/QuickCreateGrid";
import { RecentResources } from "../apps/web/src/components/dashboard/RecentResources";
import { ClassCard } from "../apps/web/src/components/classes/ClassCard";
import { ClassList } from "../apps/web/src/components/classes/ClassList";
import { ClassesEmptyState } from "../apps/web/src/components/classes/ClassesEmptyState";
import { ClassForm } from "../apps/web/src/components/classes/ClassForm";
import { ArchiveClassDialog } from "../apps/web/src/components/classes/ArchiveClassDialog";
import { useAuthStore } from "../apps/web/src/store/authStore";
import type { ClassDTO } from "@teacher-ai/contracts";

const mockUseContentList = vi.fn();
vi.mock("../apps/web/src/hooks/useContent", () => ({
  useContentList: () => mockUseContentList(),
}));

describe("Milestone 5 — Dashboard & Class Management UI Suite", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("WelcomeBanner Modernization", () => {
    it("renders personalized welcome, avatar initial, curriculum board, and profile chips", () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: "u-1", email: "priya.teacher@school.edu" },
        profile: {
          id: "p-1",
          userId: "u-1",
          displayName: "Mrs. Priya Patel",
          teachingRole: "Middle School Science Lead",
          subjects: ["Biology", "Physics"],
          curriculumBoard: "Cambridge",
          experienceLevel: "5-10 years",
          preferredLanguage: "English",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      render(
        <BrowserRouter>
          <WelcomeBanner />
        </BrowserRouter>,
      );

      expect(
        screen.getByRole("heading", { name: /Welcome, Mrs. Priya Patel/i, level: 1 }),
      ).toBeDefined();
      expect(screen.getByText("P")).toBeDefined(); // Avatar initial
      expect(screen.getByText("Cambridge Board")).toBeDefined();
      expect(screen.getByText("Biology")).toBeDefined();
      expect(screen.getByText("Physics")).toBeDefined();
      expect(screen.getByText("5-10 years exp")).toBeDefined();
      expect(screen.getByText(/Middle School Science Lead/i)).toBeDefined();
    });

    it("handles fallback display name when profile is missing", () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: "u-2", email: "guest@example.com" },
        profile: null,
      });

      render(
        <BrowserRouter>
          <WelcomeBanner />
        </BrowserRouter>,
      );

      expect(
        screen.getByRole("heading", { name: /Welcome, guest@example.com/i, level: 1 }),
      ).toBeDefined();
      expect(screen.getByText("G")).toBeDefined();
    });
  });

  describe("Quick Create Grid & Cards", () => {
    it("renders all 4 resource types with AI Ready badges and valid navigation targets", () => {
      render(
        <BrowserRouter>
          <QuickCreateGrid />
        </BrowserRouter>,
      );

      expect(screen.getByRole("heading", { name: /Quick Create/i, level: 2 })).toBeDefined();
      expect(screen.getByTestId("quick-create-lesson")).toBeDefined();
      expect(screen.getByTestId("quick-create-worksheet")).toBeDefined();
      expect(screen.getByTestId("quick-create-quiz")).toBeDefined();
      expect(screen.getByTestId("quick-create-homework")).toBeDefined();

      const lessonLink = screen.getByTestId("quick-create-lesson");
      expect(lessonLink.getAttribute("href")).toBe("/create/lesson");
    });

    it("renders disabled state card when enabled is false", () => {
      const disabledOption = {
        id: "rubric",
        title: "Rubric Generator",
        description: "Generate assessment rubrics with weighted criteria.",
        badgeColor: "bg-slate-50 text-slate-700",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        icon: <span>R</span>,
        enabled: false,
      };

      render(<QuickCreateCard option={disabledOption} />);

      const card = screen.getByTestId("quick-create-rubric");
      expect(card.getAttribute("aria-disabled")).toBe("true");
      expect(screen.getByText("Coming Soon")).toBeDefined();
    });
  });

  describe("RecentResources Modernization", () => {
    it("renders accessible loading skeleton when data is loading", () => {
      mockUseContentList.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      });

      render(
        <BrowserRouter>
          <RecentResources />
        </BrowserRouter>,
      );

      expect(screen.getByRole("status", { name: /Loading recent resources/i })).toBeDefined();
    });

    it("renders accessible empty state when items list is empty", () => {
      mockUseContentList.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        isError: false,
      });

      render(
        <BrowserRouter>
          <RecentResources />
        </BrowserRouter>,
      );

      expect(screen.getByText("No Teaching Resources Yet")).toBeDefined();
      expect(screen.getByRole("button", { name: "Create Lesson" })).toBeDefined();
    });

    it("renders populated recent items with badges, class attribution, and links", () => {
      mockUseContentList.mockReturnValue({
        data: {
          items: [
            {
              id: "item-1",
              resourceId: "res-1",
              type: "LESSON_PLAN",
              title: "Cell Division Mitosis",
              subject: "Biology",
              topic: "Cell Theory",
              updatedAt: "2026-10-10T10:00:00Z",
              class: { name: "Grade 9 Biology" },
            },
          ],
        },
        isLoading: false,
        isError: false,
      });

      render(
        <BrowserRouter>
          <RecentResources />
        </BrowserRouter>,
      );

      expect(screen.getByTestId("recent-resource-item-item-1")).toBeDefined();
      expect(screen.getByText("Cell Division Mitosis")).toBeDefined();
      expect(screen.getByText("Grade 9 Biology")).toBeDefined();
      expect(screen.getByText("View All in Library")).toBeDefined();
      expect(screen.getByRole("link", { name: /Open/i })).toBeDefined();
    });
  });

  describe("Class Components & Interactions", () => {
    const mockClass: ClassDTO = {
      id: "class-101",
      teacherId: "teacher-1",
      name: "Class 7 Mathematics",
      grade: "7",
      section: "B",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    };

    it("renders ClassCard with full metadata pills and link to details", () => {
      render(
        <BrowserRouter>
          <ClassCard classItem={mockClass} />
        </BrowserRouter>,
      );

      expect(screen.getByText("Class 7 Mathematics")).toBeDefined();
      expect(screen.getByText("Grade 7")).toBeDefined();
      expect(screen.getByText("Sec B")).toBeDefined();
      expect(screen.getByText("CBSE")).toBeDefined();
      expect(screen.getByText("2026-27")).toBeDefined();
      expect(screen.getByText("View Details")).toBeDefined();
    });

    it("renders ClassList with multiple cards in grid", () => {
      render(
        <BrowserRouter>
          <ClassList classes={[mockClass]} />
        </BrowserRouter>,
      );

      expect(screen.getByText("Class 7 Mathematics")).toBeDefined();
    });

    it("renders ClassesEmptyState with actionable button", () => {
      render(
        <BrowserRouter>
          <ClassesEmptyState />
        </BrowserRouter>,
      );

      expect(screen.getByText("No classes yet")).toBeDefined();
      expect(screen.getByRole("link", { name: /Add Class/i })).toBeDefined();
    });

    it("validates and submits ClassForm with required inputs", async () => {
      const handleSubmit = vi.fn();
      const handleCancel = vi.fn();

      render(
        <BrowserRouter>
          <ClassForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Class"
          />
        </BrowserRouter>,
      );

      // Try empty submission to trigger validation
      fireEvent.click(screen.getByRole("button", { name: "Create Class" }));

      await waitFor(() => {
        expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
      });

      // Fill in valid fields
      fireEvent.change(screen.getByLabelText(/Class Name/i), {
        target: { value: "Grade 6 History" },
      });
      fireEvent.change(screen.getByLabelText(/Grade/i), {
        target: { value: "6" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create Class" }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Grade 6 History",
            grade: "6",
          }),
          expect.anything(),
        );
      });
    });

    it("renders ArchiveClassDialog with Modal primitive accessibility", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ArchiveClassDialog
          isOpen={true}
          classNameTitle="Class 7 Mathematics"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(screen.getByRole("heading", { name: "Archive Class" })).toBeDefined();
      expect(screen.getByText(/Class 7 Mathematics/i)).toBeDefined();

      // Trigger confirm
      fireEvent.click(screen.getByRole("button", { name: "Archive Class" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      // Trigger cancel
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
