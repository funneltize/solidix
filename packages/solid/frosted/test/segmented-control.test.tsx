import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { SegmentedControl } from "../src/index";

describe("SegmentedControl", () => {
  it("switches panels when triggers activate", async () => {
    render(() => (
      <SegmentedControl.Root defaultValue="one">
        <SegmentedControl.List>
          <SegmentedControl.Trigger value="one">One</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value="two">Two</SegmentedControl.Trigger>
        </SegmentedControl.List>
        <SegmentedControl.Content value="one">First panel</SegmentedControl.Content>
        <SegmentedControl.Content value="two">Second panel</SegmentedControl.Content>
      </SegmentedControl.Root>
    ));
    expect(await screen.findByText("First panel")).not.toBeNull();
    // The headless trigger activates on mousedown (Radix parity), not click.
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Two" }), { button: 0 });
    expect(await screen.findByText("Second panel")).not.toBeNull();
  });

  it("bridges data-selected onto the active segment", async () => {
    render(() => (
      <SegmentedControl.Root defaultValue="one">
        <SegmentedControl.List>
          <SegmentedControl.Trigger value="one">One</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value="two">Two</SegmentedControl.Trigger>
        </SegmentedControl.List>
        <SegmentedControl.Content value="one">First panel</SegmentedControl.Content>
        <SegmentedControl.Content value="two">Second panel</SegmentedControl.Content>
      </SegmentedControl.Root>
    ));
    // The frosted CSS keys the selected pill on `data-selected` (Base UI
    // parity); the headless primitive only emits `data-state`.
    const first = await screen.findByRole("tab", { name: "One" });
    expect(first.hasAttribute("data-selected")).toBe(true);
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Two" }), { button: 0 });
    await screen.findByText("Second panel");
    expect(first.hasAttribute("data-selected")).toBe(false);
    expect(screen.getByRole("tab", { name: "Two" }).hasAttribute("data-selected")).toBe(true);
  });

  it("applies segmented classes", async () => {
    render(() => (
      <SegmentedControl.Root defaultValue="one">
        <SegmentedControl.List>
          <SegmentedControl.Trigger value="one">One</SegmentedControl.Trigger>
        </SegmentedControl.List>
        <SegmentedControl.Content value="one">Panel</SegmentedControl.Content>
      </SegmentedControl.Root>
    ));
    const tab = await screen.findByRole("tab", { name: "One" });
    expect(tab.classList.contains("fui-BaseSegmentedControlTrigger")).toBe(true);
    expect(tab.querySelector(".fui-BaseSegmentedControlTriggerInner")).not.toBeNull();
    expect(
      tab.closest("[role='tablist']")?.classList.contains("fui-BaseSegmentedControlList"),
    ).toBe(true);
    expect(
      (await screen.findByText("Panel")).classList.contains("fui-SegmentedControlContent"),
    ).toBe(true);
  });
});
