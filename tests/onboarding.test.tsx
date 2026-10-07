// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Onboarding from "../apps/web/src/pages/Onboarding";

describe("Onboarding Component", () => {
  it("renders onboarding form with required teacher fields", () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>,
    );

    expect(
      screen.getByText("Complete Teacher Profile"),
    ).toBeDefined();
    expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Teaching Role/i)).toBeDefined();
    expect(screen.getByLabelText(/Subjects Taught/i)).toBeDefined();
    expect(screen.getByLabelText(/Curriculum Board/i)).toBeDefined();
    expect(screen.getByLabelText(/Experience Level/i)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Complete Setup & Continue/i }),
    ).toBeDefined();
  });
});
