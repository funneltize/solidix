// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream structure:
// portalled fui-DialogBackdrop/fui-DrawerBackdrop + fui-DrawerOverlay
// siblings wrapping div.fui-DrawerContent, with a size-4 semibold
// title and modal dialog semantics (Escape closes, focus trapped
// and returned).
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Drawer } from "../src/index";

// `Drawer.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function openDrawer() {
  render(() => (
    <Drawer.Root>
      <Drawer.Trigger>
        <button type="button">Open</button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Settings</Drawer.Title>
          <Drawer.Close>
            <button type="button">Close</button>
          </Drawer.Close>
        </Drawer.Header>
        <Drawer.Body>Drawer body text.</Drawer.Body>
        <Drawer.StickyFooter>Footer actions.</Drawer.StickyFooter>
      </Drawer.Content>
    </Drawer.Root>
  ));
}

describe("Drawer", () => {
  it("renders closed, then opens with the drawer structure", async () => {
    openDrawer();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-state")).toBe("open");
    expect(dialog.classList.contains("fui-DrawerContent")).toBe(true);
    expect(
      document.querySelector(".fui-DialogBackdrop.fui-DrawerBackdrop"),
    ).not.toBeNull();
    expect(document.querySelector(".fui-DrawerOverlay")).not.toBeNull();
    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).not.toBeNull();
    expect(screen.getByText("Drawer body text.")).not.toBeNull();
    expect(screen.getByText("Footer actions.")).not.toBeNull();
  });

  it("renders the layout parts with their classes", async () => {
    openDrawer();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    expect(document.querySelector(".fui-DrawerHeader")).not.toBeNull();
    expect(document.querySelector(".fui-BodyScrollArea")).not.toBeNull();
    expect(document.querySelector(".fui-DrawerBody")).not.toBeNull();
    expect(document.querySelector(".fui-DrawerStickyFooter")).not.toBeNull();
  });

  it("defaults the title to size 4 semibold; consumer props win", async () => {
    openDrawer();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const title = await screen.findByRole("heading", { name: "Settings" });
    expect(title.classList.contains("fui-r-size-4")).toBe(true);
    expect(title.classList.contains("fui-r-weight-semi-bold")).toBe(true);
  });

  it("lets consumers override the title size and weight", async () => {
    render(() => (
      <Drawer.Root defaultOpen>
        <Drawer.Content>
          <Drawer.Title size="6" weight="bold">
            Big title
          </Drawer.Title>
        </Drawer.Content>
      </Drawer.Root>
    ));
    const title = await screen.findByRole("heading", { name: "Big title" });
    expect(title.classList.contains("fui-r-size-6")).toBe(true);
    expect(title.classList.contains("fui-r-weight-bold")).toBe(true);
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    openDrawer();
    const trigger = await screen.findByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { bubbles: true, key: "Escape" });
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  });

  it("closes via the Close part", async () => {
    openDrawer();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
