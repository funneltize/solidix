import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Breadcrumbs } from "../src/index";

// `Breadcrumbs.Dropdown` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

describe("Breadcrumbs", () => {
  it("renders a nav with separators between items", async () => {
    render(() => (
      <Breadcrumbs.Root>
        <Breadcrumbs.Item onClick={() => {}}>Home</Breadcrumbs.Item>
        <Breadcrumbs.Item onClick={() => {}}>Library</Breadcrumbs.Item>
        <Breadcrumbs.Item onClick={() => {}}>Data</Breadcrumbs.Item>
      </Breadcrumbs.Root>
    ));
    const nav = (await screen.findByText("Home")).closest("nav");
    expect(nav?.classList.contains("fui-BreadcrumbsRoot")).toBe(true);
    expect(nav?.querySelectorAll(".fui-BreadcrumbsSeparator")).toHaveLength(2);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("renders the last item without onClick as plain text", async () => {
    render(() => (
      <Breadcrumbs.Root>
        <Breadcrumbs.Item onClick={() => {}}>Home</Breadcrumbs.Item>
        <Breadcrumbs.Item>Current page</Breadcrumbs.Item>
      </Breadcrumbs.Root>
    ));
    const last = await screen.findByText("Current page");
    expect(last.tagName).toBe("DIV");
    expect(last.classList.contains("fui-reset")).toBe(true);
    expect(last.classList.contains("fui-BreadcrumbsLastItem")).toBe(true);
    expect(last.classList.contains("fui-Text")).toBe(true);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("keeps a last item with onClick interactive", async () => {
    const onClick = vi.fn();
    render(() => (
      <Breadcrumbs.Root>
        <Breadcrumbs.Item onClick={() => {}}>Home</Breadcrumbs.Item>
        <Breadcrumbs.Item onClick={onClick}>Active</Breadcrumbs.Item>
      </Breadcrumbs.Root>
    ));
    const last = await screen.findByRole("button", { name: "Active" });
    expect(last.classList.contains("fui-BreadcrumbsItem")).toBe(true);
    fireEvent.click(last);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("cascades the root color to items and separators", async () => {
    render(() => (
      <Breadcrumbs.Root color="blue">
        <Breadcrumbs.Item onClick={() => {}}>Home</Breadcrumbs.Item>
        <Breadcrumbs.Item>Current</Breadcrumbs.Item>
      </Breadcrumbs.Root>
    ));
    const nav = (await screen.findByText("Home")).closest("nav");
    expect(nav?.getAttribute("data-accent-color")).toBe("blue");
    expect((await screen.findByText("Current")).getAttribute("data-accent-color")).toBe("blue");
  });

  it("renders a dropdown for collapsed crumbs", async () => {
    render(() => (
      <Breadcrumbs.Root>
        <Breadcrumbs.Item onClick={() => {}}>Home</Breadcrumbs.Item>
        <Breadcrumbs.Dropdown>
          <Breadcrumbs.DropdownItem>Hidden</Breadcrumbs.DropdownItem>
        </Breadcrumbs.Dropdown>
        <Breadcrumbs.Item>Current</Breadcrumbs.Item>
      </Breadcrumbs.Root>
    ));
    const nav = (await screen.findByText("Home")).closest("nav");
    expect(nav?.querySelectorAll(".fui-BreadcrumbsSeparator")).toHaveLength(2);
    fireEvent.pointerDown(await screen.findByRole("button", { name: "..." }), { button: 0 });
    expect(await screen.findByRole("menuitem", { name: "Hidden" })).not.toBeNull();
  });
});
