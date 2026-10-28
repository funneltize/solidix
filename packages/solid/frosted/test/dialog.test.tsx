// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream structure:
// portalled fui-DialogBackdrop + fui-DialogOverlay siblings wrapping
// div.fui-DialogContent, with the title/description size cascade.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog, dialogContentPropDefs } from "../src/index";

// `Dialog.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function openDialog(ui?: () => unknown) {
  render(() => (
    <Dialog.Root>
      <Dialog.Trigger>
        <button type="button">Open</button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.Description>Adjust your preferences.</Dialog.Description>
        <Dialog.Close>
          <button type="button">Close</button>
        </Dialog.Close>
        {ui?.()}
      </Dialog.Content>
    </Dialog.Root>
  ));
}

describe("Dialog", () => {
  it("renders closed, then opens with content, title, and description", async () => {
    openDialog();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-state")).toBe("open");
    expect(await screen.findByRole("heading", { name: "Settings" })).not.toBeNull();
    expect(screen.getByText("Adjust your preferences.")).not.toBeNull();
  });

  it("applies the default size class and cascades title/description sizes", async () => {
    openDialog();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.classList.contains("fui-DialogContent")).toBe(true);
    expect(dialog.classList.contains(`fui-r-size-${dialogContentPropDefs.size.default}`)).toBe(
      true,
    );
    // Default content size "3" cascades to title size "5" and description "2".
    const title = await screen.findByRole("heading", { name: "Settings" });
    expect(title.classList.contains("fui-r-size-5")).toBe(true);
    expect(screen.getByText("Adjust your preferences.").classList.contains("fui-r-size-2")).toBe(
      true,
    );
  });

  it("honors an explicit size and lets title/description override the cascade", async () => {
    render(() => (
      <Dialog.Root>
        <Dialog.Trigger>
          <button type="button">Open</button>
        </Dialog.Trigger>
        <Dialog.Content size="1">
          <Dialog.Title size="6">Settings</Dialog.Title>
          <Dialog.Description size="3">Adjust your preferences.</Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>
    ));
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.classList.contains("fui-r-size-1")).toBe(true);
    expect(
      (await screen.findByRole("heading", { name: "Settings" })).classList.contains("fui-r-size-6"),
    ).toBe(true);
    expect(screen.getByText("Adjust your preferences.").classList.contains("fui-r-size-3")).toBe(
      true,
    );
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    openDialog();
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
      <Dialog.Root onOpenChange={onOpenChange}>
        <Dialog.Trigger>
          <button type="button">Open</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Settings</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
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

  it("supports controlled open state", async () => {
    render(() => (
      <Dialog.Root open>
        <Dialog.Trigger>
          <button type="button">Open</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Settings</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ));
    expect((await screen.findByRole("dialog")).getAttribute("data-state")).toBe("open");
  });
});
