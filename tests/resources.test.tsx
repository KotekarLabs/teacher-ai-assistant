// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  ResourceHeader,
  ResourceActions,
  ResourceMetadata,
  QuizExportModal,
  WorksheetExportModal,
  UnsavedChangesDialog,
} from "../apps/web/src/components/resources";

describe("Resource Workflow Components", () => {
  afterEach(() => {
    cleanup();
  });

  describe("ResourceHeader", () => {
    it("renders title, subject, topic, and badges correctly", () => {
      render(
        <MemoryRouter>
          <ResourceHeader
            title="Newton's Laws of Motion"
            type="LESSON"
            subject="Physics"
            topic="Classical Mechanics"
            difficulty="MEDIUM"
            durationMinutes={45}
            status="SAVED"
            titleTestId="test-header-title"
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId("test-header-title").textContent).toBe(
        "Newton's Laws of Motion"
      );
      expect(screen.getByText("Lesson Plan")).toBeDefined();
      expect(screen.getByText("Physics")).toBeDefined();
      expect(screen.getByText("⏱ 45 mins")).toBeDefined();
      expect(screen.getByText("MEDIUM")).toBeDefined();
      expect(screen.getByText("SAVED")).toBeDefined();
      expect(screen.getByText("Topic:")).toBeDefined();
      expect(screen.getByText("Classical Mechanics")).toBeDefined();
    });
  });

  describe("ResourceActions", () => {
    it("renders edit, export, print, and archive buttons and fires handlers", () => {
      const onEdit = vi.fn();
      const onExportPdf = vi.fn();
      const onPrint = vi.fn();
      const onArchive = vi.fn();

      render(
        <ResourceActions
          onEdit={onEdit}
          editTestId="custom-edit-btn"
          onExportPdf={onExportPdf}
          onPrint={onPrint}
          onArchive={onArchive}
          archiveTestId="custom-archive-btn"
        />
      );

      expect(screen.getByTestId("custom-edit-btn")).toBeDefined();
      expect(screen.getByTestId("export-pdf-btn")).toBeDefined();
      expect(screen.getByTestId("print-btn")).toBeDefined();
      expect(screen.getByTestId("custom-archive-btn")).toBeDefined();

      fireEvent.click(screen.getByTestId("custom-edit-btn"));
      expect(onEdit).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("export-pdf-btn"));
      expect(onExportPdf).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("print-btn"));
      expect(onPrint).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("custom-archive-btn"));
      expect(onArchive).toHaveBeenCalledTimes(1);
    });

    it("displays loading text when isExporting is true", () => {
      render(
        <ResourceActions
          onEdit={vi.fn()}
          onExportPdf={vi.fn()}
          isExporting={true}
        />
      );

      expect(screen.getByText("Generating PDF...")).toBeDefined();
      expect(
        (screen.getByTestId("export-pdf-btn") as HTMLButtonElement).disabled
      ).toBe(true);
    });
  });

  describe("ResourceMetadata", () => {
    it("renders metadata grid with formatted fields", () => {
      render(
        <ResourceMetadata
          type="WORKSHEET"
          subject="Biology"
          topic="Cell Structure"
          difficulty="EASY"
          curriculumBoard="CBSE"
          estimatedTimeMinutes={25}
          status="SAVED"
          createdAt="2026-03-01T10:00:00.000Z"
          updatedAt="2026-03-02T12:00:00.000Z"
        />
      );

      expect(screen.getByTestId("resource-metadata")).toBeDefined();
      expect(screen.getByText("Resource Details & Metadata")).toBeDefined();
      expect(screen.getByText("Biology")).toBeDefined();
      expect(screen.getByText("Cell Structure")).toBeDefined();
      expect(screen.getByText("CBSE")).toBeDefined();
      expect(screen.getByText("25 mins")).toBeDefined();
    });
  });

  describe("QuizExportModal", () => {
    it("renders student and answer key choices and fires onExport with correct mode", () => {
      const onExport = vi.fn();
      const onClose = vi.fn();

      render(
        <QuizExportModal
          isOpen={true}
          onClose={onClose}
          onExport={onExport}
        />
      );

      expect(screen.getByTestId("quiz-export-modal")).toBeDefined();
      expect(screen.getByText("Export Quiz PDF")).toBeDefined();

      fireEvent.click(screen.getByTestId("export-student-quiz-btn"));
      expect(onExport).toHaveBeenCalledWith("student");

      fireEvent.click(screen.getByTestId("export-answer-key-btn"));
      expect(onExport).toHaveBeenCalledWith("answer-key");

      fireEvent.click(screen.getByTestId("close-export-modal-btn"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("WorksheetExportModal", () => {
    it("renders student and answer key choices and fires onExport with correct mode", () => {
      const onExport = vi.fn();
      const onClose = vi.fn();

      render(
        <WorksheetExportModal
          isOpen={true}
          onClose={onClose}
          onExport={onExport}
        />
      );

      expect(screen.getByTestId("worksheet-export-modal")).toBeDefined();
      expect(screen.getByText("Export Worksheet PDF")).toBeDefined();

      fireEvent.click(screen.getByTestId("export-student-worksheet-btn"));
      expect(onExport).toHaveBeenCalledWith("student");

      fireEvent.click(screen.getByTestId("export-answer-key-btn"));
      expect(onExport).toHaveBeenCalledWith("answer-key");

      fireEvent.click(screen.getByTestId("close-export-modal-btn"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on Escape key press when not exporting", () => {
      const onClose = vi.fn();
      render(
        <WorksheetExportModal
          isOpen={true}
          onClose={onClose}
          onExport={vi.fn()}
          isExporting={false}
        />
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("disables export and cancel buttons when isExporting is true", () => {
      const onClose = vi.fn();
      render(
        <WorksheetExportModal
          isOpen={true}
          onClose={onClose}
          onExport={vi.fn()}
          isExporting={true}
        />
      );

      expect(
        (screen.getByTestId("export-student-worksheet-btn") as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        (screen.getByTestId("export-answer-key-btn") as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        (screen.getByTestId("close-export-modal-btn") as HTMLButtonElement).disabled
      ).toBe(true);

      // Escape key should NOT trigger onClose when exporting
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("UnsavedChangesDialog", () => {
    it("renders unsaved warning and handles Save, Discard, and Cancel", () => {
      const onSave = vi.fn();
      const onDiscard = vi.fn();
      const onCancel = vi.fn();

      render(
        <UnsavedChangesDialog
          isOpen={true}
          onSave={onSave}
          onDiscard={onDiscard}
          onCancel={onCancel}
        />
      );

      expect(screen.getByTestId("unsaved-changes-dialog")).toBeDefined();
      expect(screen.getByText("You have unsaved changes")).toBeDefined();

      fireEvent.click(screen.getByTestId("save-changes-btn"));
      expect(onSave).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("discard-changes-btn"));
      expect(onDiscard).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("cancel-unsaved-btn"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
