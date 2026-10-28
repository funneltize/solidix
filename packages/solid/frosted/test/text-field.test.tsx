// Solidix-authored: no upstream test suite exists at the pinned commit.
// Asserts observed frosted-ui behavior: root classes, slot size
// inheritance, standalone input self-wrapping, pointerdown focusing.

import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { TextField } from "../src/components/text-field/text-field";

describe("TextField.Root", () => {
  test("renders root classes with default size 2, surface variant, gray color", async () => {
    render(() => (
      <TextField.Root data-testid="root">
        <TextField.Input />
      </TextField.Root>
    ));
    const root = await screen.findByTestId("root");
    expect(root.classList.contains("fui-TextFieldRoot")).toBe(true);
    expect(root.classList.contains("fui-r-size-2")).toBe(true);
    expect(root.classList.contains("fui-variant-surface")).toBe(true);
    expect(root.getAttribute("data-accent-color")).toBe("gray");
  });
});

describe("TextField.Slot", () => {
  test("slot inherits root size class", async () => {
    render(() => (
      <TextField.Root size="3">
        <TextField.Slot data-testid="slot" />
        <TextField.Input />
      </TextField.Root>
    ));
    const slot = await screen.findByTestId("slot");
    expect(slot.classList.contains("fui-TextFieldSlot")).toBe(true);
    expect(slot.classList.contains("fui-r-size-3")).toBe(true);
  });
});

describe("TextField.Input", () => {
  test("standalone input wraps itself in a root", async () => {
    render(() => <TextField.Input data-testid="input" />);
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    expect(input.classList.contains("fui-TextFieldInput")).toBe(true);
    expect(input.getAttribute("spellcheck")).toBe("false");
    const root = input.parentElement!;
    expect(root.classList.contains("fui-TextFieldRoot")).toBe(true);
  });

  test("input inside a root renders without a second root", async () => {
    render(() => (
      <TextField.Root data-testid="root">
        <TextField.Input data-testid="input" />
      </TextField.Root>
    ));
    const input = await screen.findByTestId("input");
    const root = await screen.findByTestId("root");
    expect(input.parentElement).toBe(root);
  });

  test("pointerdown on root padding focuses the input", async () => {
    render(() => (
      <TextField.Root data-testid="root">
        <TextField.Input data-testid="input" />
      </TextField.Root>
    ));
    const root = await screen.findByTestId("root");
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    root.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve as FrameRequestCallback));
    expect(document.activeElement).toBe(input);
  });
});
