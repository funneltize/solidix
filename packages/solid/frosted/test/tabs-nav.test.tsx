import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { TabsNav } from "../src/index";

describe("TabsNav", () => {
  it("renders a nav landmark with tab-styled links", async () => {
    render(() => (
      <TabsNav.Root>
        <TabsNav.Link href="/one">One</TabsNav.Link>
        <TabsNav.Link href="/two">Two</TabsNav.Link>
      </TabsNav.Root>
    ));
    const nav = await screen.findByRole("navigation");
    expect(nav.classList.contains("fui-TabsNavRoot")).toBe(true);
    expect(nav.classList.contains("fui-BaseTabsList")).toBe(true);
    expect(nav.classList.contains("fui-TabsNavList")).toBe(true);
    expect(nav.classList.contains("fui-r-size-2")).toBe(true);
    const link = screen.getByRole("link", { name: "One" });
    expect(link.classList.contains("fui-BaseTabsTrigger")).toBe(true);
    expect(link.classList.contains("fui-TabsNavLink")).toBe(true);
    expect(link.querySelector(".fui-BaseTabsTriggerInner")).not.toBeNull();
    expect(link.closest(".fui-TabsNavItem")).not.toBeNull();
  });

  it("marks the active link for the current page", async () => {
    render(() => (
      <TabsNav.Root>
        <TabsNav.Link href="/one">One</TabsNav.Link>
        <TabsNav.Link href="/two" active>
          Two
        </TabsNav.Link>
      </TabsNav.Root>
    ));
    const link = await screen.findByRole("link", { name: "Two" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.hasAttribute("data-active")).toBe(true);
  });

  it("applies size, color, and high-contrast", async () => {
    render(() => (
      <TabsNav.Root size="1" color="teal" highContrast>
        <TabsNav.Link href="/one">One</TabsNav.Link>
      </TabsNav.Root>
    ));
    const nav = await screen.findByRole("navigation");
    expect(nav.classList.contains("fui-r-size-1")).toBe(true);
    expect(nav.classList.contains("fui-high-contrast")).toBe(true);
    expect(nav.getAttribute("data-accent-color")).toBe("teal");
  });
});
