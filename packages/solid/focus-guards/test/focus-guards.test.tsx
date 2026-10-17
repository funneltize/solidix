import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { FocusGuards } from "../src/index";

describe("FocusGuards", () => {
  test("injects edge guards while mounted and removes them after", async () => {
    const { unmount } = render(() => (
      <FocusGuards>
        <p>content</p>
      </FocusGuards>
    ));
    await screen.findByText("content");

    expect(document.body.firstElementChild?.hasAttribute("data-radix-focus-guard")).toBe(true);
    expect(document.body.lastElementChild?.hasAttribute("data-radix-focus-guard")).toBe(true);

    unmount();
    expect(document.querySelector("[data-radix-focus-guard]")).toBeNull();
  });
});
