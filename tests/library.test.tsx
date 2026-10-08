// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ContentCard } from "../apps/web/src/components/library/ContentCard";
import { ContentEmptyState } from "../apps/web/src/components/library/ContentEmptyState";
import { ContentFilters } from "../apps/web/src/components/library/ContentFilters";
import { ContentSort } from "../apps/web/src/components/library/ContentSort";
import { ContentArchiveDialog } from "../apps/web/src/components/library/ContentArchiveDialog";
import { ContentGrid } from "../apps/web/src/components/library/ContentGrid";
import { ClassResourcesList } from "../apps/web/src/components/library/ClassResourcesList";
import type { ContentDTO } from "@teacher-ai/contracts";

const mockLessonContent: ContentDTO = {
  id: "content-1",
  type: "LESSON",
  resourceId: "lesson-1",
  title: "Photosynthesis & Plant Biology",
  subject: "Science",
  topic: "Plant Energy",
  difficulty: "INTERMEDIATE",
  status: "SAVED",
  classId: "class-1",
  class: {
    id: "class-1",
    name: "Grade 6 Science",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  archivedAt: null,
};

const mockQuizContent: ContentDTO = {
  id: "content-2",
  type: "QUIZ",
  resourceId: "quiz-1",
  title: "Algebraic Expressions Quiz",
  subject: "Mathematics",
  topic: "Linear Equations",
  difficulty: "ADVANCED",
  status: "SAVED",
  classId: null,
  class: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  archivedAt: null,
};

vi.mock("../apps/web/src/hooks/useContent", () => ({
  useContentList: vi.fn(() => ({
    data: {
      items: [mockLessonContent],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
  })),
  useDuplicateContent: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useArchiveContent: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

describe("Content Library Frontend Components", () => {
  afterEach(() => {
    cleanup();
  });

  const mockClasses = [
    {
      id: "class-1",
      teacherId: "teacher-1",
      name: "Grade 6 Science",
      grade: "6",
      section: "A",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
  ];

  it("renders ContentCard with metadata, route links, and action buttons", () => {
    const onDuplicate = vi.fn();
    const onArchive = vi.fn();

    render(
      <BrowserRouter>
        <ContentCard
          item={mockLessonContent}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
        />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("content-card-content-1")).toBeDefined();
    expect(screen.getByText("Photosynthesis & Plant Biology")).toBeDefined();
    expect(screen.getByText("Grade 6 Science")).toBeDefined();
    expect(screen.getByText("Lesson Plan")).toBeDefined();
    expect(screen.getByText("INTERMEDIATE")).toBeDefined();

    // Verify Open and Edit links route to /lessons/:resourceId
    const openLink = screen.getByTestId("view-resource-btn-content-1");
    expect(openLink.getAttribute("href")).toBe("/lessons/lesson-1");

    const editLink = screen.getByTestId("edit-resource-btn-content-1");
    expect(editLink.getAttribute("href")).toBe("/lessons/lesson-1/edit");

    // Verify Duplicate & Archive actions
    const duplicateBtn = screen.getByTestId("duplicate-resource-btn-content-1");
    fireEvent.click(duplicateBtn);
    expect(onDuplicate).toHaveBeenCalledWith(mockLessonContent);

    const archiveBtn = screen.getByTestId("archive-resource-btn-content-1");
    fireEvent.click(archiveBtn);
    expect(onArchive).toHaveBeenCalledWith(mockLessonContent);
  });

  it("renders ContentFilters with resource type filter chips and class selector", () => {
    const onTypeChange = vi.fn();
    const onClassChange = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <ContentFilters
        selectedType="LESSON"
        selectedClassId="class-1"
        status="ACTIVE"
        classes={mockClasses}
        onTypeChange={onTypeChange}
        onClassChange={onClassChange}
        onStatusChange={onStatusChange}
      />,
    );

    expect(screen.getByRole("tab", { name: /All Resources/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Lessons/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Worksheets/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Quizzes/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Homework/i })).toBeDefined();

    const quizFilter = screen.getByRole("tab", { name: /Quizzes/i });
    fireEvent.click(quizFilter);
    expect(onTypeChange).toHaveBeenCalledWith("QUIZ");

    const classSelect = screen.getByLabelText(/Filter by Class/i);
    fireEvent.change(classSelect, { target: { value: "" } });
    expect(onClassChange).toHaveBeenCalledWith("");

    const archivedBtn = screen.getByRole("button", { name: /Archived/i });
    fireEvent.click(archivedBtn);
    expect(onStatusChange).toHaveBeenCalledWith("ARCHIVED");
  });

  it("renders ContentSort with sort options", () => {
    const onSortChange = vi.fn();

    render(
      <ContentSort
        value="updatedAt_desc"
        onChange={onSortChange}
      />,
    );

    const sortSelect = screen.getByLabelText(/Sort by:/i);
    expect(sortSelect).toBeDefined();

    fireEvent.change(sortSelect, { target: { value: "title_asc" } });
    expect(onSortChange).toHaveBeenCalledWith("title_asc");
  });

  it("renders ContentEmptyState for initial state and search filtering state", () => {
    const { rerender } = render(
      <BrowserRouter>
        <ContentEmptyState
          isSearchOrFiltered={false}
          isArchivedView={false}
          onClearFilters={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Your Resource Library is Empty")).toBeDefined();
    expect(
      screen.getByText(/Generate your first AI-assisted teaching materials/i),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: /Create Lesson/i })).toBeDefined();

    rerender(
      <BrowserRouter>
        <ContentEmptyState
          isSearchOrFiltered={true}
          isArchivedView={false}
          onClearFilters={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("No Resources Match Your Criteria")).toBeDefined();
    expect(
      screen.getByText(/Try changing your search keywords or adjusting your filters/i),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /Reset All Filters/i })).toBeDefined();
  });

  it("renders ContentArchiveDialog and handles confirmation", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ContentArchiveDialog
        isOpen={true}
        resourceTitle="Photosynthesis & Plant Biology"
        resourceType="Lesson Plan"
        isArchiving={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Archive Lesson Plan/i)).toBeDefined();
    expect(screen.getByText(/Photosynthesis & Plant Biology/i)).toBeDefined();

    const confirmBtn = screen.getByTestId("confirm-archive-btn");
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();
  });

  it("renders ContentGrid with pagination controls", () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <ContentGrid
          items={[mockLessonContent, mockQuizContent]}
          isLoading={false}
          pagination={{
            page: 1,
            pageSize: 2,
            total: 5,
            totalPages: 3,
          }}
          onPageChange={onPageChange}
          onDuplicate={vi.fn()}
          onArchive={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("content-card-content-1")).toBeDefined();
    expect(screen.getByTestId("content-card-content-2")).toBeDefined();
    expect(screen.getByText(/Showing page/i)).toBeDefined();

    const nextBtn = screen.getByRole("button", { name: /Next page/i });
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders ClassResourcesList with resources belonging to the class", () => {
    render(
      <BrowserRouter>
        <ClassResourcesList
          classId="class-1"
        />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("class-resources-list")).toBeDefined();
    expect(screen.getByText("Photosynthesis & Plant Biology")).toBeDefined();
  });
});
