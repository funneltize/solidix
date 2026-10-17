import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { AccessibleIcon } from "../src/index";

const LABEL_TEXT = "Close";

const Icon = (props: { testId: string }) => (
  <svg
    viewBox="0 0 32 32"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    data-testid={props.testId}
  >
    <path d="M2 30 L30 2 M30 30 L2 2" />
  </svg>
);

describe("AccessibleIcon", () => {
  test("renders the label for screen reader users", async () => {
    render(() => (
      <AccessibleIcon label={LABEL_TEXT}>
        <Icon testId="icon" />
      </AccessibleIcon>
    ));

    const label = await screen.findByText(LABEL_TEXT);
    expect(label.textContent).toBe(LABEL_TEXT);
  });

  test("hides the child icon from assistive technology", async () => {
    render(() => (
      <AccessibleIcon label={LABEL_TEXT}>
        <Icon testId="icon" />
      </AccessibleIcon>
    ));

    const icon = await screen.findByTestId("icon");
    // Slot applies props in an effect, so wait for them to land.
    await vi.waitFor(() => {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(icon.getAttribute("focusable")).toBe("false");
    });
  });

  test("throws without exactly one child element", () => {
    const spy = vi.spyOn(console, "error");
    spy.mockImplementation(() => {});

    try {
      expect(() => render(() => <AccessibleIcon label={LABEL_TEXT} />)).toThrow();
      expect(() =>
        render(() => <AccessibleIcon label={LABEL_TEXT}>plain text</AccessibleIcon>),
      ).toThrow();
    } finally {
      spy.mockRestore();
    }
  });
});
