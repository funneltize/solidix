// Solidix-authored tests: no upstream test suite exists at the pinned
// commit. Behavior is grounded on the headless @solidix/tooltip delays
// (delayDuration on Root, skipDelayDuration grouping on Provider) and the
// upstream defaults (delay 400, sideOffset 4, collisionPadding 10).
// The headless trigger opens on `pointermove` (see Trigger `onPointerMove`
// in packages/solid/tooltip/src/tooltip.tsx), so these tests hover with
// `pointerMove` plus `flush()`, matching the headless suite idiom.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { beforeEach, expect, it, vi } from "vitest";

import { Tooltip } from "../src/components/tooltip/tooltip";
import { TooltipProvider } from "../src/components/tooltip/tooltip-provider";
import "../src/components/tooltip/tooltip.css";

// `Tooltip` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

/** Hover the trigger the way the headless trigger expects. */
function hover(trigger: HTMLElement) {
  fireEvent.pointerMove(trigger, { pointerType: "mouse" });
  flush();
}

function openTrigger(content = "Content") {
  render(() => (
    <TooltipProvider>
      <Tooltip content={content}>
        <button type="button">Trigger</button>
      </Tooltip>
    </TooltipProvider>
  ));
  return screen.getByRole("button", { name: "Trigger" });
}

it("opens after the delay on hover", async () => {
  const trigger = openTrigger();
  hover(trigger);
  vi.advanceTimersByTime(400);
  await screen.findByText("Content");
  // The headless wrapper reports `delayed-open` after a delayed open; the
  // inner text element carries no `data-state`.
  expect(screen.getByRole("tooltip").getAttribute("data-state")).toBe("delayed-open");
});

it("does not open when the pointer leaves before the open delay", async () => {
  const trigger = openTrigger();
  hover(trigger);
  fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
  flush();
  vi.advanceTimersByTime(1000);
  await Promise.resolve();
  expect(screen.queryByText("Content")).toBeNull();
});

it("closes on blur", async () => {
  const trigger = openTrigger();
  fireEvent.focus(trigger);
  await flush();
  await screen.findByText("Content");
  // Headless has no close delay: blur closes synchronously.
  fireEvent.blur(trigger);
  await vi.waitFor(() => {
    expect(screen.queryByText("Content")).toBeNull();
  });
});

it("closes on Escape", async () => {
  const trigger = openTrigger();
  hover(trigger);
  vi.advanceTimersByTime(400);
  await screen.findByText("Content");
  fireEvent.keyDown(document, { key: "Escape" });
  flush();
  await vi.waitFor(() => {
    expect(screen.queryByText("Content")).toBeNull();
  });
});

it("closes on outside pointer down", async () => {
  const trigger = openTrigger();
  hover(trigger);
  vi.advanceTimersByTime(400);
  const content = await screen.findByText("Content");
  // The dismissable layer defers its pointerdown listener by a macrotask.
  vi.advanceTimersByTime(10);
  fireEvent.pointerDown(document.body);
  flush();
  fireEvent.click(document.body);
  flush();
  vi.advanceTimersByTime(1000);
  await vi.waitFor(() => {
    expect(screen.queryByText("Content")).toBeNull();
  });
  expect(content.isConnected).toBe(false);
});

it("opens instantly within the provider skip-delay window", async () => {
  render(() => (
    <TooltipProvider skipDelayDuration={300}>
      <Tooltip content="First">
        <button type="button">First trigger</button>
      </Tooltip>
      <Tooltip content="Second">
        <button type="button">Second trigger</button>
      </Tooltip>
    </TooltipProvider>
  ));
  const first = screen.getByRole("button", { name: "First trigger" });
  const second = screen.getByRole("button", { name: "Second trigger" });
  hover(first);
  expect(first.getAttribute("data-state")).toBe("closed");
  vi.advanceTimersByTime(400);
  flush();
  expect(first.getAttribute("data-state")).toBe("delayed-open");
  await screen.findByText("First");
  // Click closes the first tooltip immediately (`closeOnClick` default),
  // which starts the provider skip-delay window. A pointer leave would
  // schedule the close after `closeDelayDuration` instead.
  fireEvent.click(first);
  flush();
  await vi.waitFor(() => {
    expect(screen.queryByText("First")).toBeNull();
  });
  hover(second);
  // No timer advance: the second tooltip opens instantly after the first.
  expect(second.getAttribute("data-state")).toBe("instant-open");
  await screen.findByText("Second");
  expect(screen.queryByText("First")).toBeNull();
});

it("keeps the tooltip open on trigger click when closeOnClick is false", async () => {
  render(() => (
    <TooltipProvider>
      <Tooltip content="Content" closeOnClick={false}>
        <button type="button">Trigger</button>
      </Tooltip>
    </TooltipProvider>
  ));
  const trigger = screen.getByRole("button", { name: "Trigger" });
  hover(trigger);
  vi.advanceTimersByTime(400);
  await screen.findByText("Content");
  fireEvent.click(trigger);
  flush();
  await Promise.resolve();
  expect(screen.queryByText("Content")).not.toBeNull();
});

it("applies the upstream classes and defaults", async () => {
  const trigger = openTrigger();
  hover(trigger);
  vi.advanceTimersByTime(400);
  await screen.findByText("Content");
  // `findByText` returns the inner Text `p`; the fused Positioner+Popup
  // wrapper carries `role="tooltip"` and the `fui-TooltipContent` class.
  const content = screen.getByRole("tooltip");
  expect(content.classList.contains("fui-TooltipContent")).toBe(true);
  expect(content.classList.contains("fui-TooltipPositioner")).toBe(true);
  const text = content.querySelector(".fui-TooltipText");
  expect(text?.tagName).toBe("P");
  expect(content.querySelector(".fui-TooltipArrow")).not.toBeNull();
});
