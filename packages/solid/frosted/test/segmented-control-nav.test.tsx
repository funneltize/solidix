import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { SegmentedControlNav, SegmentedControlRadioGroup } from "../src/index";

describe("SegmentedControlNav", () => {
  it("renders a nav landmark with segmented links", async () => {
    render(() => (
      <SegmentedControlNav.Root>
        <SegmentedControlNav.Link href="/one">One</SegmentedControlNav.Link>
        <SegmentedControlNav.Link href="/two">Two</SegmentedControlNav.Link>
      </SegmentedControlNav.Root>
    ));
    const nav = await screen.findByRole("navigation");
    expect(nav.classList.contains("fui-SegmentedControlNavRoot")).toBe(true);
    const link = screen.getByRole("link", { name: "One" });
    expect(link.classList.contains("fui-BaseSegmentedControlTrigger")).toBe(true);
    expect(link.classList.contains("fui-SegmentedControlNavLink")).toBe(true);
    expect(link.querySelector(".fui-BaseSegmentedControlTriggerInner")).not.toBeNull();
    expect(link.closest(".fui-SegmentedControlNavItem")).not.toBeNull();
  });

  it("marks the active link for the current page", async () => {
    render(() => (
      <SegmentedControlNav.Root>
        <SegmentedControlNav.Link href="/one">One</SegmentedControlNav.Link>
        <SegmentedControlNav.Link href="/two" active>
          Two
        </SegmentedControlNav.Link>
      </SegmentedControlNav.Root>
    ));
    const link = await screen.findByRole("link", { name: "Two" });
    expect(link.getAttribute("aria-current")).toBe("page");
  });
});

describe("SegmentedControlRadioGroup", () => {
  it("selects items as a radio group", async () => {
    render(() => (
      <SegmentedControlRadioGroup.Root defaultValue="one">
        <SegmentedControlRadioGroup.Item value="one">One</SegmentedControlRadioGroup.Item>
        <SegmentedControlRadioGroup.Item value="two">Two</SegmentedControlRadioGroup.Item>
      </SegmentedControlRadioGroup.Root>
    ));
    const second = await screen.findByRole("radio", { name: "Two" });
    expect(second.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(second);
    await screen.findByText("Two");
    expect(second.getAttribute("aria-checked")).toBe("true");
  });

  it("applies segmented radio classes", async () => {
    render(() => (
      <SegmentedControlRadioGroup.Root defaultValue="one">
        <SegmentedControlRadioGroup.Item value="one">One</SegmentedControlRadioGroup.Item>
      </SegmentedControlRadioGroup.Root>
    ));
    const item = await screen.findByRole("radio", { name: "One" });
    expect(item.classList.contains("fui-BaseSegmentedControlTrigger")).toBe(true);
    expect(item.querySelector(".fui-BaseSegmentedControlTriggerInner")).not.toBeNull();
    expect(item.closest(".fui-SegmentedControlRadioGroupRoot")).not.toBeNull();
  });
});
