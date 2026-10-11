// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import React, { createRef } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatusBadge,
  Modal,
} from "../apps/web/src/components/ui";
import { Badge } from "../apps/web/src/components/common/Badge";

describe("Milestone 1 — UI Component Primitives", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Button Primitive", () => {
    it("renders with label and defaults to type='button'", () => {
      render(<Button>Click Me</Button>);
      const btn = screen.getByRole("button", { name: "Click Me" });
      expect(btn).toBeDefined();
      expect(btn.getAttribute("type")).toBe("button");
    });

    it("respects custom type='submit' when provided", () => {
      render(<Button type="submit">Submit Form</Button>);
      const btn = screen.getByRole("button", { name: "Submit Form" });
      expect(btn.getAttribute("type")).toBe("submit");
    });

    it("renders loading state with spinner and disables button", () => {
      render(<Button isLoading>Generating Lesson</Button>);
      const btn = screen.getByRole("button") as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(screen.getByTestId("button-spinner")).toBeDefined();
    });

    it("forwards ref to underlying HTML button element", () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toContain("Ref Button");
    });

    it("handles click events when enabled", () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Active Button</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire click events when disabled", () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Disabled Button</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Input & Textarea Primitives", () => {
    it("renders input with label and links id correctly", () => {
      render(<Input label="Lesson Title" placeholder="Enter topic" />);
      const input = screen.getByLabelText("Lesson Title");
      expect(input).toBeDefined();
      expect(input.getAttribute("placeholder")).toBe("Enter topic");
    });

    it("displays error message and sets aria-invalid on Input", () => {
      render(<Input label="Email" error="Email is required" />);
      const input = screen.getByLabelText("Email");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(screen.getByRole("alert").textContent).toBe("Email is required");
    });

    it("forwards ref to HTMLInputElement", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} label="Topic" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("renders textarea with label and error state", () => {
      render(
        <Textarea
          label="Instructions"
          error="Must be at least 10 characters"
          rows={5}
        />,
      );
      const textarea = screen.getByLabelText("Instructions");
      expect(textarea).toBeDefined();
      expect(textarea.getAttribute("rows")).toBe("5");
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
      expect(screen.getByRole("alert").textContent).toBe(
        "Must be at least 10 characters",
      );
    });
  });

  describe("Select Primitive", () => {
    it("renders select with options array", () => {
      const options = [
        { value: "CBSE", label: "CBSE Curriculum" },
        { value: "ICSE", label: "ICSE Curriculum" },
      ];
      render(<Select label="Board" options={options} defaultValue="CBSE" />);
      const select = screen.getByLabelText("Board") as HTMLSelectElement;
      expect(select.value).toBe("CBSE");
      expect(screen.getByText("ICSE Curriculum")).toBeDefined();
    });

    it("handles selection change events", () => {
      const onChange = vi.fn();
      render(
        <Select label="Grade" onChange={onChange}>
          <option value="6">Grade 6</option>
          <option value="7">Grade 7</option>
        </Select>,
      );
      const select = screen.getByLabelText("Grade");
      fireEvent.change(select, { target: { value: "7" } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Card Compound Primitive", () => {
    it("renders card with header, title, description, content, and footer", () => {
      render(
        <Card elevated>
          <CardHeader>
            <CardTitle as="h2">Photosynthesis</CardTitle>
            <CardDescription>Grade 6 Science Plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Lesson content details</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Export PDF</Button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByRole("heading", { level: 2, name: "Photosynthesis" })).toBeDefined();
      expect(screen.getByText("Grade 6 Science Plan")).toBeDefined();
      expect(screen.getByText("Lesson content details")).toBeDefined();
      expect(screen.getByRole("button", { name: "Export PDF" })).toBeDefined();
    });
  });

  describe("StatusBadge Primitive", () => {
    it("renders semantic labels and dot indicators for all resource statuses", () => {
      const { rerender } = render(<StatusBadge status="SAVED" />);
      expect(screen.getByTestId("status-badge").textContent).toContain("Saved");

      rerender(<StatusBadge status="DRAFT" />);
      expect(screen.getByTestId("status-badge").textContent).toContain("Draft");

      rerender(<StatusBadge status="EDITED" />);
      expect(screen.getByTestId("status-badge").textContent).toContain("Edited");

      rerender(<StatusBadge status="ARCHIVED" />);
      expect(screen.getByTestId("status-badge").textContent).toContain("Archived");

      rerender(<StatusBadge status="ACTIVE" />);
      expect(screen.getByTestId("status-badge").textContent).toContain("Active");
    });
  });

  describe("Badge Compatibility", () => {
    it("preserves backward compatibility with existing variants", () => {
      render(
        <div>
          <Badge variant="primary">Primary Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="neutral">Neutral Badge</Badge>
          <Badge variant="success">Success Badge</Badge>
        </div>,
      );
      expect(screen.getByText("Primary Badge")).toBeDefined();
      expect(screen.getByText("Secondary Badge")).toBeDefined();
      expect(screen.getByText("Neutral Badge")).toBeDefined();
      expect(screen.getByText("Success Badge")).toBeDefined();
    });
  });

  describe("Modal Accessibility Primitive", () => {
    it("renders accessible dialog when open and hides when closed", () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Dialog">
          <p>Dialog Body</p>
        </Modal>,
      );
      expect(screen.queryByRole("dialog")).toBeNull();

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Dialog">
          <p>Dialog Body</p>
        </Modal>,
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(screen.getByText("Test Dialog")).toBeDefined();
      expect(screen.getByText("Dialog Body")).toBeDefined();
    });

    it("triggers onClose when Escape key is pressed", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Escape Test">
          <p>Body</p>
        </Modal>,
      );
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("triggers onClose when clicking backdrop overlay", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Backdrop Test">
          <p>Body</p>
        </Modal>,
      );
      const backdrop = screen.getByTestId("modal-backdrop");
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("locks document.body overflow when open and restores on unmount", () => {
      expect(document.body.style.overflow).toBe("");
      const { unmount } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Lock Test">
          <p>Body</p>
        </Modal>,
      );
      expect(document.body.style.overflow).toBe("hidden");
      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("restores focus to previous active element on close", async () => {
      const triggerBtn = document.createElement("button");
      triggerBtn.textContent = "Open Modal";
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      const { unmount } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Focus Test">
          <button type="button">Inside Modal</button>
        </Modal>,
      );

      unmount();
      expect(document.activeElement).toBe(triggerBtn);
      document.body.removeChild(triggerBtn);
    });

    it("traps Tab key navigation inside modal dialog", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Trap Test"
          footer={<Button size="sm">Confirm Action</Button>}
        >
          <input data-testid="modal-input" placeholder="Name" />
        </Modal>,
      );

      const closeBtn = screen.getByLabelText("Close dialog");
      const input = screen.getByTestId("modal-input");
      const confirmBtn = screen.getByRole("button", { name: "Confirm Action" });

      // Focus last element (confirmBtn) and press Tab -> should wrap to first element (closeBtn)
      confirmBtn.focus();
      expect(document.activeElement).toBe(confirmBtn);

      fireEvent.keyDown(window, { key: "Tab" });
      expect(document.activeElement).toBe(closeBtn);

      // Focus first element (closeBtn) and press Shift+Tab -> should wrap to last element (confirmBtn)
      closeBtn.focus();
      fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(confirmBtn);
    });
  });
});
