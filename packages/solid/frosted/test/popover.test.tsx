// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream structure:
// div.fui-PopoverPositioner carrying the inner fui-PopoverContent,
// with the size/variant cascade from popoverContentPropDefs.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Popover, popoverContentPropDefs } from "../src/index";

// `Popover.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function openPopover() {
  render(() => (
    <Popover.Root>
      <Popover.Trigger>
        <button type="button">Open</button>
      </Popover.Trigger>
      <Popover.Content>
        <button type="button">Action</button>
        <Popover.Close>
          <button type="button">Close</button>
        </Popover.Close>
      </Popover.Content>
    </Popover.Root>
  ));
}

describe("Popover", () => {
  it("renders closed, then opens with positioner and content classes", async () => {
    openPopover();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-state")).toBe("open");
    expect(dialog.classList.contains("fui-PopoverContent")).toBe(true);
    expect(
      dialog.classList.contains(
        `fui-r-size-${popoverContentPropDefs.size.default}`,
      ),
    ).toBe(true);
    expect(
      dialog.classList.contains(
        `fui-variant-${popoverContentPropDefs.variant.default}`,
      ),
    ).toBe(true);
    expect(dialog.classList.contains("fui-PopoverPositioner")).toBe(true);
    expect(dialog.getAttribute("data-side")).not.toBeNull();
  });

  it("moves focus into the content on open", async () => {
    openPopover();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    await vi.waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    openPopover();
    const trigger = await screen.findByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("closes on outside pointer down and notifies onOpenChange", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Popover.Root onOpenChange={onOpenChange}>
        <Popover.Trigger>
          <button type="button">Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <button type="button">Action</button>
        </Popover.Content>
      </Popover.Root>
    ));
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    // The dismissable layer defers its pointerdown listener by a macrotask.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes through the Close button", async () => {
    openPopover();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("supports controlled open state", async () => {
    render(() => (
      <Popover.Root open>
        <Popover.Trigger>
          <button type="button">Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <button type="button">Action</button>
        </Popover.Content>
      </Popover.Root>
    ));
    expect((await screen.findByRole("dialog")).getAttribute("data-state")).toBe(
      "open",
    );
  });
});
