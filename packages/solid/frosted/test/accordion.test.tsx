import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Accordion } from "../src/index";

function Basic(props: {
  multiple?: boolean | undefined;
  type?: "single" | "multiple" | undefined;
}) {
  return (
    <Accordion.Root multiple={props.multiple} type={props.type}>
      <Accordion.Item value="one">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>First panel</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Content>Second panel</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe("Accordion", () => {
  it("renders items with upstream classes and a chevron trigger", async () => {
    render(() => <Basic />);
    const trigger = await screen.findByRole("button", { name: "First" });
    expect(trigger.classList.contains("fui-AccordionTrigger")).toBe(true);
    expect(trigger.querySelector(".fui-AccordionTriggerIcon")).not.toBeNull();
    expect(trigger.closest(".fui-AccordionHeader")).not.toBeNull();
    expect(trigger.closest(".fui-AccordionItem")).not.toBeNull();
    expect(trigger.closest(".fui-AccordionRoot")).not.toBeNull();
  });

  it("opens one item at a time in single mode", async () => {
    render(() => <Basic />);
    const first = await screen.findByRole("button", { name: "First" });
    fireEvent.click(first);
    await screen.findByText("First panel");
    expect(first.getAttribute("aria-expanded")).toBe("true");

    const second = screen.getByRole("button", { name: "Second" });
    fireEvent.click(second);
    await screen.findByText("Second panel");
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");
  });

  it("collapses the open item on re-click in single mode", async () => {
    render(() => <Basic />);
    const first = await screen.findByRole("button", { name: "First" });
    fireEvent.click(first);
    await screen.findByText("First panel");
    fireEvent.click(first);
    await vi.waitFor(() => {
      expect(first.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("opens several items in multiple mode", async () => {
    render(() => <Basic multiple />);
    fireEvent.click(await screen.findByRole("button", { name: "First" }));
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    await screen.findByText("First panel");
    await screen.findByText("Second panel");
    expect(screen.getByRole("button", { name: "First" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Second" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("honors the deprecated type prop and array value semantics", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <Accordion.Root type="multiple" defaultValue={["one"]} onValueChange={onValueChange}>
        <Accordion.Item value="one">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Second panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    ));
    await screen.findByText("First panel");
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    await vi.waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith(["one", "two"]);
    });
  });

  it("keeps content mounted by default", async () => {
    render(() => <Basic />);
    await screen.findByRole("button", { name: "First" });
    // keepMounted default true: panels render while collapsed.
    expect(screen.getByText("First panel")).not.toBeNull();
    expect(screen.getByText("First panel").closest(".fui-AccordionContentInner")).not.toBeNull();
  });

  it("hides collapsed panels and flags the open trigger", async () => {
    render(() => <Basic />);
    const first = await screen.findByRole("button", { name: "First" });
    const content = screen.getByText("First panel").closest(".fui-AccordionContent");
    // Base UI `keepMounted` parity: mounted but `hidden` while closed, and
    // the chevron rotation keys on `data-panel-open`, not `data-state`.
    expect(content?.hasAttribute("hidden")).toBe(true);
    expect(first.hasAttribute("data-panel-open")).toBe(false);
    fireEvent.click(first);
    await vi.waitFor(() => {
      expect(content?.hasAttribute("hidden")).toBe(false);
    });
    await vi.waitFor(() => {
      expect(first.hasAttribute("data-panel-open")).toBe(true);
    });
    fireEvent.click(first);
    await vi.waitFor(() => {
      expect(content?.hasAttribute("hidden")).toBe(true);
    });
  });
});
