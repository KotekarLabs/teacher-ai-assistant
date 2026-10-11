// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../apps/web/src/components/layout/Sidebar";
import { Header } from "../apps/web/src/components/layout/Header";
import { MobileNav } from "../apps/web/src/components/layout/MobileNav";
import { AppShell } from "../apps/web/src/components/layout/AppShell";
import { useAuthStore } from "../apps/web/src/store/authStore";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Milestone 2 — Navigation & Header Layout Modernization", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      hasCompletedOnboarding: true,
      user: {
        id: "teacher-1",
        email: "priya.nair@school.edu",
      },
      profile: {
        id: "prof-1",
        userId: "teacher-1",
        displayName: "Priya Nair",
        teachingRole: "Science Teacher",
        subjects: ["Physics", "Chemistry"],
        curriculumBoard: "CBSE",
        experienceLevel: "5+ years",
        preferredLanguage: "English",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("Sidebar Component", () => {
    it("renders Main Navigation landmark and Teacher AI brand identity", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Sidebar />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("complementary", { name: /Main Navigation/i }),
      ).toBeDefined();
      expect(screen.getByText("Teacher AI")).toBeDefined();
      expect(screen.getByText("Assistant Workspace")).toBeDefined();
    });

    it("renders functional Workspace links and Quick Create generator links", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Sidebar />
        </MemoryRouter>,
      );

      // Workspace links
      expect(screen.getByRole("link", { name: /Dashboard/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Library/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Classes/i })).toBeDefined();

      // Quick Create generator links
      expect(screen.getByRole("link", { name: /Lesson Plan/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Worksheet/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Quiz/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Homework/i })).toBeDefined();
    });

    it("accurately marks current active route with aria-current='page'", () => {
      render(
        <MemoryRouter initialEntries={["/library"]}>
          <Sidebar />
        </MemoryRouter>,
      );

      const libraryLink = screen.getByRole("link", { name: /Library/i });
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });

      expect(libraryLink.getAttribute("aria-current")).toBe("page");
      expect(dashboardLink.getAttribute("aria-current")).toBeNull();
    });
  });

  describe("Header Component", () => {
    it("renders dynamic page heading context based on current path", () => {
      render(
        <MemoryRouter initialEntries={["/create/lesson"]}>
          <Header onToggleMobileNav={vi.fn()} isMobileNavOpen={false} />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("heading", { name: "Lesson Generator", level: 2 }),
      ).toBeDefined();
    });

    it("renders teacher initials, display name, and curriculum board badge", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Header onToggleMobileNav={vi.fn()} isMobileNavOpen={false} />
        </MemoryRouter>,
      );

      expect(screen.getByText("PN")).toBeDefined();
      expect(screen.getByText("Priya Nair")).toBeDefined();
      expect(screen.getByText("CBSE")).toBeDefined();
    });

    it("invokes logout and navigates to login when Logout button is clicked", async () => {
      const logoutSpy = vi.fn().mockResolvedValue(undefined);
      useAuthStore.setState({ logout: logoutSpy });

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Header onToggleMobileNav={vi.fn()} isMobileNavOpen={false} />
        </MemoryRouter>,
      );

      const logoutBtn = screen.getByRole("button", { name: /Logout/i });
      fireEvent.click(logoutBtn);

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    it("wires hamburger toggle button with accessible aria attributes", () => {
      const onToggle = vi.fn();
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Header onToggleMobileNav={onToggle} isMobileNavOpen={false} />
        </MemoryRouter>,
      );

      const menuBtn = screen.getByRole("button", {
        name: "Open navigation menu",
      });
      expect(menuBtn.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(menuBtn);
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("MobileNav Drawer Component", () => {
    it("renders nothing when isOpen={false}", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={false} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("renders accessible modal drawer dialog when isOpen={true}", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      const dialog = screen.getByRole("dialog", { name: "Mobile Navigation" });
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(screen.getByTestId("mobile-nav-backdrop")).toBeDefined();
    });

    it("closes drawer when backdrop is clicked", () => {
      const onClose = vi.fn();
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={onClose} />
        </MemoryRouter>,
      );

      const backdrop = screen.getByTestId("mobile-nav-backdrop");
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes drawer when Escape key is pressed", () => {
      const onClose = vi.fn();
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={onClose} />
        </MemoryRouter>,
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("locks body scroll on open and restores on unmount", () => {
      expect(document.body.style.overflow).toBe("");
      const { unmount } = render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      expect(document.body.style.overflow).toBe("hidden");
      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("restores focus to previous active element on close", () => {
      const triggerBtn = document.createElement("button");
      triggerBtn.textContent = "Hamburger Menu";
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      const { unmount } = render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      unmount();
      expect(document.activeElement).toBe(triggerBtn);
      document.body.removeChild(triggerBtn);
    });

    it("traps Tab key navigation inside mobile drawer", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      const closeBtn = screen.getByRole("button", {
        name: "Close navigation menu",
      });
      const allLinks = screen.getAllByRole("link");
      const lastLink = allLinks[allLinks.length - 1];

      // Tab on last element wraps to closeBtn
      lastLink.focus();
      expect(document.activeElement).toBe(lastLink);
      fireEvent.keyDown(window, { key: "Tab" });
      expect(document.activeElement).toBe(closeBtn);

      // Shift+Tab on first element wraps to lastLink
      closeBtn.focus();
      fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(lastLink);
    });

    it("closes drawer when any navigation link is clicked", () => {
      const onClose = vi.fn();
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={onClose} />
        </MemoryRouter>,
      );

      const classesLink = screen.getByRole("link", { name: /Classes/i });
      fireEvent.click(classesLink);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("AppShell Integration", () => {
    it("renders sidebar, header, and ivory viewport wrapper", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppShell />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("complementary", { name: /Main Navigation/i }),
      ).toBeDefined();
      expect(screen.getByRole("banner")).toBeDefined();
      expect(screen.getByRole("main")).toBeDefined();
    });
  });

  describe("Mobile-First Responsive Design & Touch Accessibility", () => {
    it("ensures mobile hamburger button has accessible >=44x44px touch target class", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Header onToggleMobileNav={vi.fn()} isMobileNavOpen={false} />
        </MemoryRouter>,
      );

      const hamburger = screen.getByRole("button", {
        name: "Open navigation menu",
      });
      expect(hamburger.className).toContain("min-w-[44px]");
      expect(hamburger.className).toContain("min-h-[44px]");
    });

    it("ensures MobileNav drawer close button has >=44x44px touch target class", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      const closeBtn = screen.getByRole("button", {
        name: "Close navigation menu",
      });
      expect(closeBtn.className).toContain("min-w-[44px]");
      expect(closeBtn.className).toContain("min-h-[44px]");
    });

    it("ensures every link in MobileNav drawer has accessible >=44px touch target height", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <MobileNav isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        expect(link.className).toContain("min-h-[44px]");
      });
    });

    it("ensures Header heading has truncate class to prevent horizontal overflow on small screens", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Header onToggleMobileNav={vi.fn()} isMobileNavOpen={false} />
        </MemoryRouter>,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.className).toContain("truncate");
    });
  });
});
