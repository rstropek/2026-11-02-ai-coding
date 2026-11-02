import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Calculator } from "./calculator";

describe("Calculator", () => {
  it("asks for input while fields are empty", () => {
    render(<Calculator />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Bitte zwei gültige Zahlen eingeben.",
    );
  });

  it("shows the sum of both numbers", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.type(screen.getByLabelText("Erste Zahl"), "2,5");
    await user.type(screen.getByLabelText("Zweite Zahl"), "3");

    expect(screen.getByRole("status")).toHaveTextContent("Summe: 5,5");
  });

  it("does not show a sum for invalid input", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.type(screen.getByLabelText("Erste Zahl"), "abc");
    await user.type(screen.getByLabelText("Zweite Zahl"), "3");

    expect(screen.getByRole("status")).toHaveTextContent(
      "Bitte zwei gültige Zahlen eingeben.",
    );
  });
});
