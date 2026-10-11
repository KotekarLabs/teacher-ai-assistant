// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ContentSearch } from "../apps/web/src/components/library/ContentSearch";
import { ContentSort } from "../apps/web/src/components/library/ContentSort";
import { ContentFilters } from "../apps/web/src/components/library/ContentFilters";
import { ContentCard } from "../apps/web/src/components/library/ContentCard";
import { ContentGrid } from "../apps/web/src/components/library/ContentGrid";
import { ContentEmptyState } from "../apps/web/src/components/library/ContentEmptyState";
import { ContentArchiveDialog } from "../apps/web/src/components/library/ContentArchiveDialog";
import { ClassResourcesList } from "../apps/web/src/components/library/ClassResourcesList";
import type { ContentDTO } from "@teacher-ai/contracts";

const mockSampleLesson: ContentDTO = {
  id: "content-lesson-m7",
  type: "LESSON",
  resourceId: "lesson-m7",
  title: "Cellular Respiration & Krebs Cycle",
  subject: "Biology",
  topic: "Metabolism",
  difficulty: "ADVANCED",
  status: "SAVED",
  classId: "class-bio-10",
  class: {
    id: "class-bio-10",
    name: "Grade 10 Biology",
  },
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
  archivedAt: null,
};

const mockSampleWorksheet: ContentDTO = {
  id: "content-ws-m7",
  type: "WORKSHEET",
  resourceId: "ws-m7",
  title: "Cell Structure Analysis",
  subject: "Biology",
  topic: "Cell Organelles",
  difficulty: "INTERMEDIATE",
  status: "SAVED",
  classId: null,
  class: null,
  createdAt: "2026-10-02T10:00:00.000Z",
  updatedAt: "2026-10-02T10:00:00.000Z",
  archivedAt: null,
};

vi.mock("../apps/web/src/hooks/useContent", () => ({
  useContentList: vi.fn(() => ({
    data: {
      items: [mockSampleLesson],
      pagination: { page: 1, pageSize: 18, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
  })),
  useDuplicateContent: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    variables: null,
  })),
  useArchiveContent: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

describe("Milestone 7 — Resource Library Redesign UI Components", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  describe("ContentSearch Component", () => {
    it("renders search input, debounces search updates, and clears query on button click", () => {
      vi.useFakeTimers();
      const onChange = vi.fn();

      render(<ContentSearch value="" onChange={onChange} />);

      const input = screen.getByTestId("content-search-input") as HTMLInputElement;
      expect(input).toBeDefined();

      fireEvent.change(input, { target: { value: "Photosynthesis" } });
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(onChange).toHaveBeenCalledWith("Photosynthesis");

      // Clear button
      const clearBtn = screen.getByTestId("clear-search-btn");
      expect(clearBtn).toBeDefined();
      fireEvent.click(clearBtn);
      expect(onChange).toHaveBeenCalledWith("");

      vi.useRealTimers();
    });
  });

  describe("ContentSort Component", () => {
    it("renders sort options and triggers change handler", () => {
      const onChange = vi.fn();
      render(<ContentSort value="updatedAt_desc" onChange={onChange} />);

      const select = screen.getByLabelText(/Sort by:/i) as HTMLSelectElement;
      expect(select.value).toBe("updatedAt_desc");

      fireEvent.change(select, { target: { value: "title_asc" } });
      expect(onChange).toHaveBeenCalledWith("title_asc");
    });
  });

  describe("ContentFilters Component", () => {
    it("renders type filter tabs, class selector, and status toggle with expected callbacks", () => {
      const onTypeChange = vi.fn();
      const onClassChange = vi.fn();
      const onStatusChange = vi.fn();

      render(
        <ContentFilters
          selectedType="ALL"
          onTypeChange={onTypeChange}
          selectedClassId=""
          onClassChange={onClassChange}
          status="ACTIVE"
          onStatusChange={onStatusChange}
          classes={[{ id: "class-1", name: "Grade 10 Biology", grade: "10" }]}
        />,
      );

      expect(screen.getByRole("tablist")).toBeDefined();
      expect(screen.getByRole("tab", { name: /All Resources/i })).toBeDefined();
      expect(screen.getByRole("tab", { name: /Lessons/i })).toBeDefined();
      expect(screen.getByRole("tab", { name: /Worksheets/i })).toBeDefined();
      expect(screen.getByRole("tab", { name: /Quizzes/i })).toBeDefined();
      expect(screen.getByRole("tab", { name: /Homework/i })).toBeDefined();

      // Click worksheet tab
      fireEvent.click(screen.getByRole("tab", { name: /Worksheets/i }));
      expect(onTypeChange).toHaveBeenCalledWith("WORKSHEET");

      // Select class
      const classSelect = screen.getByLabelText(/Filter by Class/i);
      fireEvent.change(classSelect, { target: { value: "class-1" } });
      expect(onClassChange).toHaveBeenCalledWith("class-1");

      // Click archived
      fireEvent.click(screen.getByRole("button", { name: /Archived/i }));
      expect(onStatusChange).toHaveBeenCalledWith("ARCHIVED");
    });
  });

  describe("ContentCard Component", () => {
    it("renders resource metadata, difficulty, date, links, and triggers actions", () => {
      const onDuplicate = vi.fn();
      const onArchive = vi.fn();

      render(
        <BrowserRouter>
          <ContentCard
            item={mockSampleLesson}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            isDuplicating={false}
          />
        </BrowserRouter>,
      );

      expect(screen.getByTestId("content-card-content-lesson-m7")).toBeDefined();
      expect(screen.getByText("Cellular Respiration & Krebs Cycle")).toBeDefined();
      expect(screen.getByText("Grade 10 Biology")).toBeDefined();
      expect(screen.getByText("Lesson Plan")).toBeDefined();
      expect(screen.getByText("ADVANCED")).toBeDefined();

      const openLink = screen.getByTestId("view-resource-btn-content-lesson-m7");
      expect(openLink.getAttribute("href")).toBe("/lessons/lesson-m7");

      const editLink = screen.getByTestId("edit-resource-btn-content-lesson-m7");
      expect(editLink.getAttribute("href")).toBe("/lessons/lesson-m7/edit");

      const duplicateBtn = screen.getByTestId("duplicate-resource-btn-content-lesson-m7");
      fireEvent.click(duplicateBtn);
      expect(onDuplicate).toHaveBeenCalledWith(mockSampleLesson);

      const archiveBtn = screen.getByTestId("archive-resource-btn-content-lesson-m7");
      fireEvent.click(archiveBtn);
      expect(onArchive).toHaveBeenCalledWith(mockSampleLesson);
    });

    it("renders duplicating spinner when duplicating", () => {
      render(
        <BrowserRouter>
          <ContentCard
            item={mockSampleLesson}
            onDuplicate={vi.fn()}
            onArchive={vi.fn()}
            isDuplicating={true}
          />
        </BrowserRouter>,
      );

      const duplicateBtn = screen.getByTestId("duplicate-resource-btn-content-lesson-m7") as HTMLButtonElement;
      expect(duplicateBtn.disabled).toBe(true);
      expect(duplicateBtn.querySelector(".animate-spin")).toBeDefined();
    });
  });

  describe("ContentArchiveDialog with Shared Modal", () => {
    it("renders accessible modal with title, description, and handles cancel & confirm", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ContentArchiveDialog
          isOpen={true}
          resourceTitle="Cellular Respiration"
          resourceType="Lesson Plan"
          onConfirm={onConfirm}
          onCancel={onCancel}
          isArchiving={false}
        />,
      );

      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByText("Archive Lesson Plan")).toBeDefined();
      expect(screen.getByText(/Remove from active library views/i)).toBeDefined();
      expect(screen.getByText(/Cellular Respiration/i)).toBeDefined();

      // Confirm
      const confirmBtn = screen.getByTestId("confirm-archive-btn");
      fireEvent.click(confirmBtn);
      expect(onConfirm).toHaveBeenCalledTimes(1);

      // Cancel
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("supports Escape key dismissal", () => {
      const onCancel = vi.fn();
      render(
        <ContentArchiveDialog
          isOpen={true}
          resourceTitle="Cellular Respiration"
          resourceType="Lesson Plan"
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />,
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("ContentGrid Component", () => {
    it("renders skeleton state when loading", () => {
      render(
        <ContentGrid
          items={[]}
          isLoading={true}
          onPageChange={vi.fn()}
          onDuplicate={vi.fn()}
          onArchive={vi.fn()}
        />,
      );

      expect(screen.getByRole("status")).toBeDefined();
      expect(screen.getByLabelText("Loading library resources")).toBeDefined();
    });

    it("renders cards and handles pagination page change", () => {
      const onPageChange = vi.fn();

      render(
        <BrowserRouter>
          <ContentGrid
            items={[mockSampleLesson, mockSampleWorksheet]}
            isLoading={false}
            pagination={{
              page: 1,
              pageSize: 2,
              total: 4,
              totalPages: 2,
            }}
            onPageChange={onPageChange}
            onDuplicate={vi.fn()}
            onArchive={vi.fn()}
          />
        </BrowserRouter>,
      );

      expect(screen.getByTestId("content-card-content-lesson-m7")).toBeDefined();
      expect(screen.getByTestId("content-card-content-ws-m7")).toBeDefined();
      expect(screen.getByText(/Showing page/i)).toBeDefined();

      const nextBtn = screen.getByRole("button", { name: /Next page/i });
      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe("ContentEmptyState Component", () => {
    it("renders initial empty state with quick create links", () => {
      render(
        <BrowserRouter>
          <ContentEmptyState
            isSearchOrFiltered={false}
            isArchivedView={false}
            onClearFilters={vi.fn()}
          />
        </BrowserRouter>,
      );

      expect(screen.getByText("Your Resource Library is Empty")).toBeDefined();
      expect(screen.getByRole("link", { name: /Create Lesson/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Create Worksheet/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Create Quiz/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Create Homework/i })).toBeDefined();
    });

    it("renders filtered empty state with reset button", () => {
      const onClear = vi.fn();
      render(
        <BrowserRouter>
          <ContentEmptyState
            isSearchOrFiltered={true}
            isArchivedView={false}
            onClearFilters={onClear}
          />
        </BrowserRouter>,
      );

      expect(screen.getByText("No Resources Match Your Criteria")).toBeDefined();
      const resetBtn = screen.getByRole("button", { name: /Reset All Filters/i });
      fireEvent.click(resetBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("renders archived empty state with view active library button", () => {
      const onClear = vi.fn();
      render(
        <BrowserRouter>
          <ContentEmptyState
            isSearchOrFiltered={false}
            isArchivedView={true}
            onClearFilters={onClear}
          />
        </BrowserRouter>,
      );

      expect(screen.getByText("No Archived Resources")).toBeDefined();
      const activeBtn = screen.getByRole("button", { name: /View Active Library/i });
      fireEvent.click(activeBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("ClassResourcesList Component", () => {
    it("renders class resources list and heading", () => {
      render(
        <BrowserRouter>
          <ClassResourcesList classId="class-bio-10" />
        </BrowserRouter>,
      );

      expect(screen.getByTestId("class-resources-list")).toBeDefined();
      expect(screen.getByText("Class Teaching Resources")).toBeDefined();
      expect(screen.getByText("Cellular Respiration & Krebs Cycle")).toBeDefined();
    });
  });
});
