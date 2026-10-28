import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Tabs } from "../src/index";

describe("Tabs", () => {
  it("switches panels when triggers activate", async () => {
    render(() => (
      <Tabs.Root defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">First panel</Tabs.Content>
        <Tabs.Content value="two">Second panel</Tabs.Content>
      </Tabs.Root>
    ));
    expect(await screen.findByText("First panel")).not.toBeNull();
    expect(screen.queryByText("Second panel")).toBeNull();
    // The headless trigger activates on mousedown (Radix parity), not click.
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Two" }), { button: 0 });
    expect(await screen.findByText("Second panel")).not.toBeNull();
    expect(screen.queryByText("First panel")).toBeNull();
  });

  it("applies list, trigger, and content classes", async () => {
    render(() => (
      <Tabs.Root defaultValue="one" class="custom-root">
        <Tabs.List size="1" color="plum" highContrast>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">Panel</Tabs.Content>
      </Tabs.Root>
    ));
    const tab = await screen.findByRole("tab", { name: "One" });
    expect(tab.classList.contains("fui-reset")).toBe(true);
    expect(tab.classList.contains("fui-BaseTabsTrigger")).toBe(true);
    expect(tab.classList.contains("fui-TabsTrigger")).toBe(true);
    expect(tab.querySelector(".fui-BaseTabsTriggerInner")).not.toBeNull();
    const list = tab.closest("[role='tablist']");
    expect(list?.classList.contains("fui-BaseTabsList")).toBe(true);
    expect(list?.classList.contains("fui-TabsList")).toBe(true);
    expect(list?.classList.contains("fui-r-size-1")).toBe(true);
    expect(list?.classList.contains("fui-high-contrast")).toBe(true);
    expect(list?.getAttribute("data-accent-color")).toBe("plum");
    expect((await screen.findByText("Panel")).classList.contains("fui-TabsContent")).toBe(true);
  });

  it("bridges data-selected onto the active trigger", async () => {
    render(() => (
      <Tabs.Root defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">First panel</Tabs.Content>
        <Tabs.Content value="two">Second panel</Tabs.Content>
      </Tabs.Root>
    ));
    // The frosted CSS keys the active indicator on `data-selected` (Base UI
    // parity); the headless primitive only emits `data-state`.
    const first = await screen.findByRole("tab", { name: "One" });
    expect(first.hasAttribute("data-selected")).toBe(true);
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Two" }), { button: 0 });
    await screen.findByText("Second panel");
    expect(first.hasAttribute("data-selected")).toBe(false);
    expect(screen.getByRole("tab", { name: "Two" }).hasAttribute("data-selected")).toBe(true);
  });

  it("moves between tabs with arrow keys", async () => {
    render(() => (
      <Tabs.Root defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">First panel</Tabs.Content>
        <Tabs.Content value="two">Second panel</Tabs.Content>
      </Tabs.Root>
    ));
    const first = await screen.findByRole("tab", { name: "One" });
    first.focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(await screen.findByText("Second panel")).not.toBeNull();
  });
});
