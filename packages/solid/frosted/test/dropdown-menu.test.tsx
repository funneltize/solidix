import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { DropdownMenu } from "../src/components/dropdown-menu/dropdown-menu";

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function Fixture(props: { children?: JSX.Element }): JSX.Element {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger data-testid="trigger">Open</DropdownMenu.Trigger>
      <DropdownMenu.Content data-testid="content">
        <DropdownMenu.Item data-testid="item-apple">Apple</DropdownMenu.Item>
        <DropdownMenu.Item data-testid="item-banana">Banana</DropdownMenu.Item>
        <DropdownMenu.Item data-testid="item-cherry" shortcut="C">
          Cherry
        </DropdownMenu.Item>
        {props.children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

describe("DropdownMenu (frosted)", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens on trigger click and renders frosted classes", async () => {
    render(() => <Fixture />);
    expect(screen.queryByTestId("content")).toBeNull();

    fireEvent.pointerDown(screen.getByTestId("trigger"), { button: 0 });
    const content = await screen.findByTestId("content");
    expect(content.classList.contains("fui-DropdownMenuContent")).toBe(true);
    expect(content.classList.contains("fui-BaseMenuContent")).toBe(true);

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]?.classList.contains("fui-reset")).toBe(true);
    expect(items[0]?.classList.contains("fui-BaseMenuItem")).toBe(true);
    expect(items[0]?.textContent).toContain("Apple");
    expect(items[2]?.querySelector(".fui-BaseMenuShortcut")?.textContent).toBe("C");
  });

  it("clicking an item selects it and closes the menu", async () => {
    const onSelect = vi.fn();
    render(() => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger data-testid="trigger">Open</DropdownMenu.Trigger>
        <DropdownMenu.Content data-testid="content">
          <DropdownMenu.Item data-testid="item-apple" onSelect={onSelect}>
            Apple
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ));

    fireEvent.pointerDown(screen.getByTestId("trigger"), { button: 0 });
    const item = await screen.findByTestId("item-apple");
    fireEvent.click(item);
    await flush();

    expect(onSelect).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(screen.queryByTestId("content")).toBeNull();
    });
  });

  it("opens on Enter and moves focus with arrow keys", async () => {
    render(() => <Fixture />);
    const trigger = screen.getByTestId("trigger");
    (trigger as HTMLElement).focus();

    fireEvent.keyDown(trigger, { key: "Enter" });
    await screen.findByTestId("content");

    fireEvent.keyDown(screen.getByTestId("content"), { key: "ArrowDown" });
    await vi.waitFor(() => {
      expect(document.activeElement?.getAttribute("data-testid")).toBe("item-apple");
    });

    fireEvent.keyDown(document.activeElement as Element, {
      key: "ArrowDown",
    });
    await vi.waitFor(() => {
      expect(document.activeElement?.getAttribute("data-testid")).toBe("item-banana");
    });
  });

  it("typeahead focuses the matching item", async () => {
    render(() => <Fixture />);
    fireEvent.pointerDown(screen.getByTestId("trigger"), { button: 0 });
    await screen.findByTestId("content");

    fireEvent.keyDown(screen.getByTestId("item-apple"), {
      key: "b",
      code: "KeyB",
      charCode: 98,
    });
    await vi.waitFor(() => {
      expect(document.activeElement?.getAttribute("data-testid")).toBe("item-banana");
    });
  });

  it("Escape closes the menu", async () => {
    render(() => <Fixture />);
    fireEvent.pointerDown(screen.getByTestId("trigger"), { button: 0 });
    await screen.findByTestId("content");

    fireEvent.keyDown(screen.getByTestId("content"), { key: "Escape" });
    await vi.waitFor(() => {
      expect(screen.queryByTestId("content")).toBeNull();
    });
  });

  it("pointer down outside the menu closes it", async () => {
    render(() => <Fixture />);
    fireEvent.pointerDown(screen.getByTestId("trigger"), { button: 0 });
    await screen.findByTestId("content");

    await flush();
    await tick();
    fireEvent.pointerDown(document.body);
    await vi.waitFor(() => {
      expect(screen.queryByTestId("content")).toBeNull();
    });
  });
});
