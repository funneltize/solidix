// Solidix-authored tests: no upstream test suite exists at the pinned
// commit. Behavior is grounded on the headless @solidix/hover-card
// timers (openDelay/closeDelay on Root) and upstream defaults
// (Trigger delay 200, close delay 150).
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, expect, it, vi } from "vitest";

import { HoverCard } from "../src/components/hover-card/hover-card";
import { hoverCardContentPropDefs } from "../src/components/hover-card/hover-card.props";
import "../src/components/hover-card/hover-card.css";

// `HoverCard.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function openTrigger() {
  render(() => (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <button type="button">Trigger</button>
      </HoverCard.Trigger>
      <HoverCard.Content>Content</HoverCard.Content>
    </HoverCard.Root>
  ));
  return screen.getByRole("button", { name: "Trigger" });
}

it("opens after the open delay on hover", async () => {
  const trigger = openTrigger();
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
  expect(screen.queryByText("Content")).toBeNull();
  vi.advanceTimersByTime(200);
  const content = await screen.findByText("Content");
  expect(content.getAttribute("data-state")).toBe("open");
});

it("does not open when the pointer leaves before the open delay", async () => {
  const trigger = openTrigger();
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
  fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
  vi.advanceTimersByTime(1000);
  await Promise.resolve();
  expect(screen.queryByText("Content")).toBeNull();
});

it("closes after the close delay on blur", async () => {
  const trigger = openTrigger();
  fireEvent.focus(trigger);
  vi.advanceTimersByTime(200);
  await screen.findByText("Content");
  fireEvent.blur(trigger);
  expect(screen.queryByText("Content")).not.toBeNull();
  vi.advanceTimersByTime(150);
  await vi.waitFor(() => {
    expect(screen.queryByText("Content")).toBeNull();
  });
});

it("closes on Escape", async () => {
  const trigger = openTrigger();
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
  vi.advanceTimersByTime(200);
  await screen.findByText("Content");
  fireEvent.keyDown(document, { key: "Escape" });
  await vi.waitFor(() => {
    expect(screen.queryByText("Content")).toBeNull();
  });
});

it("closes on outside pointer down", async () => {
  const trigger = openTrigger();
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
  vi.advanceTimersByTime(200);
  const content = await screen.findByText("Content");
  // The dismissable layer defers its pointerdown listener by a macrotask.
  vi.advanceTimersByTime(10);
  fireEvent.pointerDown(document.body);
  fireEvent.click(document.body);
  vi.advanceTimersByTime(1000);
  await vi.waitFor(() => {
    expect(screen.queryByText("Content")).toBeNull();
  });
  expect(content.isConnected).toBe(false);
});

it("applies the default size and variant classes", async () => {
  const trigger = openTrigger();
  fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
  vi.advanceTimersByTime(200);
  const content = await screen.findByText("Content");
  expect(content.classList.contains("fui-HoverCardContent")).toBe(true);
  expect(content.classList.contains("fui-HoverCardPositioner")).toBe(true);
  expect(content.classList.contains("fui-r-size-2")).toBe(true);
  expect(content.classList.contains("fui-variant-translucent")).toBe(true);
  expect(hoverCardContentPropDefs.size.default).toBe("2");
  expect(hoverCardContentPropDefs.variant.default).toBe("translucent");
});
