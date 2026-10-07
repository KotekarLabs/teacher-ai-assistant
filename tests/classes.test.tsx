// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ClassList } from "../apps/web/src/components/classes/ClassList";
import { ClassesEmptyState } from "../apps/web/src/components/classes/ClassesEmptyState";
import { ClassForm } from "../apps/web/src/components/classes/ClassForm";
import { ArchiveClassDialog } from "../apps/web/src/components/classes/ArchiveClassDialog";
import type { ClassDTO } from "@teacher-ai/contracts";

describe("Classes Frontend Components", () => {
  afterEach(() => {
    cleanup();
  });

  const mockClasses: ClassDTO[] = [
    {
      id: "class-1",
      teacherId: "teacher-1",
      name: "Grade 4 Science",
      grade: "4",
      section: "A",
      curriculumBoard: "CBSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
    {
      id: "class-2",
      teacherId: "teacher-1",
      name: "Grade 5 Mathematics",
      grade: "5",
      section: null,
      curriculumBoard: "ICSE",
      academicYear: "2026-27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
  ];

  it("renders ClassList grid with class cards", () => {
    render(
      <BrowserRouter>
        <ClassList classes={mockClasses} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Grade 4 Science")).toBeDefined();
    expect(screen.getByText("Grade 5 Mathematics")).toBeDefined();
    expect(screen.getByText("Sec A")).toBeDefined();
    expect(screen.getByText("CBSE")).toBeDefined();
    expect(screen.getByText("ICSE")).toBeDefined();
  });

  it("renders ClassesEmptyState with Add Class button", () => {
    render(
      <BrowserRouter>
        <ClassesEmptyState />
      </BrowserRouter>,
    );

    expect(screen.getByText("No classes yet")).toBeDefined();
    expect(
      screen.getByText(/Create your first class to start organizing/i),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: /Add Class/i })).toBeDefined();
  });

  it("renders ClassForm with required fields and submit button", () => {
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

    expect(screen.getByLabelText(/Class Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Grade/i)).toBeDefined();
    expect(screen.getByLabelText(/Section/i)).toBeDefined();
    expect(screen.getByLabelText(/Curriculum Board/i)).toBeDefined();
    expect(screen.getByLabelText(/Academic Year/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Create Class/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDefined();
  });

  it("renders ArchiveClassDialog when open", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ArchiveClassDialog
        isOpen={true}
        classNameTitle="Grade 4 Science"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    expect(screen.getByRole("heading", { name: "Archive Class" })).toBeDefined();
    expect(screen.getByText(/Grade 4 Science/i)).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Archive Class" }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });
});
