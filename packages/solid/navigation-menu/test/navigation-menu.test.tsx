import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import * as NavigationMenu from "../src/index";

const TRIGGER_TEXT = "Item One";
const CONTENT_TEXT = "Content One";

const NavigationMenuTest = (props: NavigationMenu.NavigationMenuProps) => (
  <NavigationMenu.Root {...props}>
    <NavigationMenu.List>
      <NavigationMenu.Item value="one">
        <NavigationMenu.Trigger>{TRIGGER_TEXT}</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#">{CONTENT_TEXT}</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Viewport />
  </NavigationMenu.Root>
);

describe("aria-controls", () => {
  afterEach(cleanup);

  it("should not reference a non-existent element while closed", () => {
    render(() => <NavigationMenuTest />);
    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
  });

  it("should reference the rendered content while open", async () => {
    render(() => <NavigationMenuTest defaultValue="one" />);
    const trigger = screen.getByText(TRIGGER_TEXT);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const contentId = trigger.getAttribute("aria-controls");
    expect(contentId).toBeTruthy();
    const content = contentId ? document.getElementById(contentId) : null;
    expect(content).not.toBe(null);
    expect(content?.contains(screen.getByText(CONTENT_TEXT))).toBe(true);
  });
});

describe("NavigationMenu activationMode", () => {
  afterEach(cleanup);

  describe('"automatic" activationMode', () => {
    it("opens the item on pointer enter", async () => {
      render(() => <NavigationMenuTest activationMode="automatic" />);
      const trigger = screen.getByText(TRIGGER_TEXT);
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    it("toggles item on click", async () => {
      render(() => <NavigationMenuTest defaultValue="one" />);
      const trigger = screen.getByText(TRIGGER_TEXT);
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

      fireEvent.click(trigger);
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe('"manual" activationMode', () => {
    it("does not open on pointer enter", async () => {
      render(() => <NavigationMenuTest activationMode="manual" />);
      const trigger = screen.getByText(TRIGGER_TEXT);

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });

      // Wait past the default open delay to catch a hover-open regression.
      await new Promise((resolve) => setTimeout(resolve, 250));
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("toggles item on click", async () => {
      render(() => <NavigationMenuTest activationMode="manual" />);
      const trigger = screen.getByText(TRIGGER_TEXT);
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

      fireEvent.click(trigger);
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");

      fireEvent.click(trigger);
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
  });
});

const NavigationMenuSubTest = (props: NavigationMenu.NavigationMenuSubProps) => (
  <NavigationMenu.Sub defaultValue="one" {...props}>
    <NavigationMenu.List>
      <NavigationMenu.Item value="one">
        <NavigationMenu.Trigger>{TRIGGER_TEXT}</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#">{CONTENT_TEXT}</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu.Sub>
);

describe("NavigationMenuSub activationMode", () => {
  afterEach(cleanup);

  describe('"automatic" activationMode', () => {
    it("opens the item on pointer enter", async () => {
      render(() => (
        <NavigationMenu.Root>
          <NavigationMenuSubTest activationMode="automatic" defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

      fireEvent.pointerMove(trigger, { pointerType: "mouse" });
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe('"manual" activationMode', () => {
    it("does not open on pointer enter", async () => {
      render(() => (
        <NavigationMenu.Root>
          <NavigationMenuSubTest activationMode="manual" defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("opens the item on click", async () => {
      render(() => (
        <NavigationMenu.Root>
          <NavigationMenuSubTest activationMode="manual" defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

      fireEvent.click(trigger);
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });
  });

  // `activationMode` governs pointer/focus activation, so inheritance is asserted
  // via hover behavior (open on pointer enter) rather than click.
  describe("inheritance", () => {
    it('inherits "manual" from the parent NavigationMenu', async () => {
      render(() => (
        <NavigationMenu.Root activationMode="manual">
          <NavigationMenuSubTest defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });

    it('inherits "automatic" from the parent NavigationMenu', async () => {
      render(() => (
        <NavigationMenu.Root activationMode="automatic">
          <NavigationMenuSubTest defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

      fireEvent.pointerMove(trigger, { pointerType: "mouse" });
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    it('overrides inherited "manual" with activationMode="automatic"', async () => {
      render(() => (
        <NavigationMenu.Root activationMode="manual">
          <NavigationMenuSubTest activationMode="automatic" defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

      fireEvent.pointerMove(trigger, { pointerType: "mouse" });
      await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    it('overrides inherited "automatic" with activationMode="manual"', async () => {
      render(() => (
        <NavigationMenu.Root activationMode="automatic">
          <NavigationMenuSubTest activationMode="manual" defaultValue="" />
        </NavigationMenu.Root>
      ));
      const trigger = screen.getByText(TRIGGER_TEXT);

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
  });
});

describe("NavigationMenuSub disableToggle", () => {
  afterEach(cleanup);

  it("does not close an open item when clicking its trigger by default", async () => {
    render(() => (
      <NavigationMenu.Root>
        <NavigationMenuSubTest defaultValue="one" />
      </NavigationMenu.Root>
    ));
    const trigger = screen.getByText(TRIGGER_TEXT);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    fireEvent.click(trigger);
    expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps an open item open on click in manual mode by default", async () => {
    render(() => (
      <NavigationMenu.Root activationMode="manual">
        <NavigationMenuSubTest defaultValue="one" />
      </NavigationMenu.Root>
    ));
    const trigger = screen.getByText(TRIGGER_TEXT);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    fireEvent.click(trigger);
    expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes an open item when clicking its trigger with disableToggle={false}", async () => {
    render(() => (
      <NavigationMenu.Root>
        <NavigationMenuSubTest defaultValue="one" disableToggle={false} />
      </NavigationMenu.Root>
    ));
    const trigger = screen.getByText(TRIGGER_TEXT);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    fireEvent.click(trigger);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes an open item on click with disableToggle={false} in manual mode", async () => {
    render(() => (
      <NavigationMenu.Root activationMode="manual">
        <NavigationMenuSubTest defaultValue="one" disableToggle={false} />
      </NavigationMenu.Root>
    ));
    const trigger = screen.getByText(TRIGGER_TEXT);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    fireEvent.click(trigger);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

// Regression tests for https://github.com/radix-ui/primitives/issues/3963
describe("NavigationMenu ref stability", () => {
  afterEach(cleanup);

  it("keeps a stable composed ref on the root", () => {
    assertStableComposedRef((ref) => (
      <NavigationMenu.Root ref={ref}>
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>{TRIGGER_TEXT}</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="#">{CONTENT_TEXT}</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport />
      </NavigationMenu.Root>
    ));
  });

  // Exercises the viewport content item composed ref (`NavigationMenuViewportItem`).
  it("keeps a stable composed ref on viewport content", () => {
    assertStableComposedRef((ref) => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>{TRIGGER_TEXT}</NavigationMenu.Trigger>
            <NavigationMenu.Content ref={ref}>
              <NavigationMenu.Link href="#">{CONTENT_TEXT}</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport />
      </NavigationMenu.Root>
    ));
  });
});

// See: https://github.com/radix-ui/primitives/issues/3473
describe("focus outside", () => {
  afterEach(cleanup);

  it("should not dismiss an open menu when focus moves between elements outside the menu", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <div>
        <NavigationMenuTest defaultValue="one" onValueChange={onValueChange} />
        <button type="button" data-testid="outside">
          Outside
        </button>
      </div>
    ));
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    // Mimics an external layer (e.g. a Dialog) auto-focusing an element on open.
    // Focus never originated from within the menu, so it should stay open.
    const outside = screen.getByTestId("outside");
    (outside as HTMLElement).focus();
    fireEvent.focusIn(outside);
    // Flush pending effects (uncontrolled `onChange` fires from an effect, which
    // React's `act()` flushes for Radix) so the negative assertion is meaningful.
    flush();

    expect(onValueChange).not.toHaveBeenCalledWith("");
    expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null);
  });

  it("should dismiss an open menu when focus actually leaves the menu", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <div>
        <NavigationMenuTest defaultValue="one" onValueChange={onValueChange} />
        <button type="button" data-testid="outside">
          Outside
        </button>
      </div>
    ));
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).not.toBe(null));

    // Focus leaving the menu content for an outside element should dismiss it.
    const link = screen.getByText(CONTENT_TEXT);
    const outside = screen.getByTestId("outside");
    fireEvent.focusIn(outside, { relatedTarget: link });

    // Uncontrolled `onChange` fires from a deferred effect (React's `act()`
    // flushes it for Radix), so wait for it rather than asserting synchronously.
    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledWith(""));
  });
});

describe("NavigationMenu.Root", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <NavigationMenu.List />
      </NavigationMenu.Root>
    ));

    const root = screen.getByTestId("root");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect((root as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <NavigationMenu.List />
        </article>
      </NavigationMenu.Root>
    ));

    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("aria-label")).toBe("Main");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect((root as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Sub", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.Sub
          ref={(node) => void (element = node)}
          data-testid="sub"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <NavigationMenu.List />
        </NavigationMenu.Sub>
      </NavigationMenu.Root>
    ));

    const sub = screen.getByTestId("sub");
    expect(sub.classList.contains("custom-class")).toBe(true);
    expect((sub as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(sub);

    fireEvent.click(sub);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.Sub
          asChild
          ref={(node) => void (element = node)}
          data-testid="sub"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <NavigationMenu.List />
          </article>
        </NavigationMenu.Sub>
      </NavigationMenu.Root>
    ));

    const sub = screen.getByTestId("sub");
    expect(sub.tagName).toBe("ARTICLE");
    expect(sub.getAttribute("data-orientation")).toBe("horizontal");
    expect(sub.classList.contains("custom-class")).toBe(true);
    expect((sub as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(sub);

    fireEvent.click(sub);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.List", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List
          ref={(node) => void (element = node)}
          data-testid="list"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <NavigationMenu.Item value="one" />
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    // The list renders an indicator track around the element it spreads onto,
    // so the props have to land on the inner `ul` rather than on the track.
    const list = screen.getByTestId("list");
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("custom-class")).toBe(true);
    expect((list as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(list);

    fireEvent.click(list);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List
          asChild
          ref={(node) => void (element = node)}
          data-testid="list"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <NavigationMenu.Item value="one" />
          </article>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const list = screen.getByTestId("list");
    expect(list.tagName).toBe("ARTICLE");
    expect(list.getAttribute("data-orientation")).toBe("horizontal");
    expect(list.classList.contains("custom-class")).toBe(true);
    expect((list as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(list);

    fireEvent.click(list);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Item", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item
            value="one"
            ref={(node) => void (element = node)}
            data-testid="item"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const item = screen.getByTestId("item");
    expect(item.tagName).toBe("LI");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect((item as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item
            value="one"
            asChild
            ref={(node) => void (element = node)}
            data-testid="item"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <li>
              <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
            </li>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const item = screen.getByTestId("item");
    expect(item.tagName).toBe("LI");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect((item as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Trigger", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger
              ref={(node) => void (element = node)}
              data-testid="trigger"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Trigger
            </NavigationMenu.Trigger>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const trigger = screen.getByTestId("trigger");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect((trigger as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    // Composed with the trigger's own click handler rather than replaced by it.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger
              asChild
              ref={(node) => void (element = node)}
              data-testid="trigger"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <button type="button">Trigger</button>
            </NavigationMenu.Trigger>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const trigger = screen.getByTestId("trigger");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect((trigger as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Link", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Link
              href="/"
              active
              ref={(node) => void (element = node)}
              data-testid="link"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Link
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const link = screen.getByTestId("link");
    expect(link.classList.contains("custom-class")).toBe(true);
    expect((link as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(link);

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Link
              active
              asChild
              ref={(node) => void (element = node)}
              data-testid="link"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <a href="/">Link</a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("data-active")).toBe("");
    expect(link.classList.contains("custom-class")).toBe(true);
    expect((link as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(link);

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Content", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    // Open, since the content only mounts while its item is the active one. No
    // `Viewport` is rendered, so the content renders in place rather than being
    // proxied into one.
    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
            <NavigationMenu.Content
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <NavigationMenu.Link href="/">Link</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
            <NavigationMenu.Content
              asChild
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>
                <NavigationMenu.Link href="/">Link</NavigationMenu.Link>
              </article>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.getAttribute("data-orientation")).toBe("horizontal");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Indicator", () => {
  afterEach(cleanup);

  // Radix's shared test setup fires `ResizeObserver` callbacks on observe;
  // the Soldix setup stub never delivers, so install a delivering observer
  // (the indicator only renders once it has measured the active trigger).
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        cb: ResizeObserverCallback;
        constructor(cb: ResizeObserverCallback) {
          this.cb = cb;
        }
        observe() {
          this.cb([], this as unknown as ResizeObserver);
        }
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    // The indicator portals into the track the list renders, and only mounts
    // once it has measured the trigger of the active item, hence the open root
    // and the `waitFor`.
    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
          </NavigationMenu.Item>
          <NavigationMenu.Indicator
            ref={(node) => void (element = node)}
            data-testid="indicator"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const indicator = await vi.waitFor(() => screen.getByTestId("indicator"));
    expect(indicator.classList.contains("custom-class")).toBe(true);
    // Merged with the positioning styles the indicator sets itself.
    expect((indicator as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect((indicator as HTMLElement).style.position).toBe("absolute");
    expect(element).toBe(indicator);

    fireEvent.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
          </NavigationMenu.Item>
          <NavigationMenu.Indicator
            asChild
            ref={(node) => void (element = node)}
            data-testid="indicator"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </NavigationMenu.Indicator>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    ));

    const indicator = await vi.waitFor(() => screen.getByTestId("indicator"));
    expect(indicator.tagName).toBe("ARTICLE");
    expect(indicator.getAttribute("data-state")).toBe("visible");
    expect(indicator.getAttribute("data-orientation")).toBe("horizontal");
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect((indicator as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    fireEvent.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavigationMenu.Viewport", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    // Open, since the viewport only mounts while a menu is active.
    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="/">Link</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport
          ref={(node) => void (element = node)}
          data-testid="viewport"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </NavigationMenu.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="/">Link</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport asChild>
          <section
            ref={(node) => void (element = node)}
            data-testid="viewport"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </NavigationMenu.Viewport>
      </NavigationMenu.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.tagName).toBe("SECTION");
    expect(viewport.getAttribute("data-state")).toBe("open");
    expect(viewport.getAttribute("data-orientation")).toBe("horizontal");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders the active content inside the child element when `asChild` is set", () => {
    render(() => (
      <NavigationMenu.Root defaultValue="one">
        <NavigationMenu.List>
          <NavigationMenu.Item value="one">
            <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="/">Link</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport asChild>
          <section data-testid="viewport">
            <span data-testid="decoration" />
          </section>
        </NavigationMenu.Viewport>
      </NavigationMenu.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.contains(screen.getByTestId("decoration"))).toBe(true);
    expect(viewport.contains(screen.getByRole("link", { name: "Link" }))).toBe(true);
  });
});

// Soldix port guards (no Radix equivalent — the Radix suite only renders one
// item): switching the value must swap the proxied content, including through
// the `asChild` viewport portal wiring.
describe("NavigationMenu viewport switching", () => {
  afterEach(cleanup);

  const TwoItemMenu = (props: { asChildViewport?: boolean }) => (
    <NavigationMenu.Root defaultValue="one">
      <NavigationMenu.List>
        <NavigationMenu.Item value="one">
          <NavigationMenu.Trigger>Trigger One</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#">Content One</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="two">
          <NavigationMenu.Trigger>Trigger Two</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#">Content Two</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      {props.asChildViewport ? (
        <NavigationMenu.Viewport asChild>
          <section data-testid="viewport" />
        </NavigationMenu.Viewport>
      ) : (
        <NavigationMenu.Viewport data-testid="viewport" />
      )}
    </NavigationMenu.Root>
  );

  it("swaps the proxied content when the value changes", async () => {
    render(() => <TwoItemMenu />);
    await vi.waitFor(() => expect(screen.queryByText("Content One")).not.toBe(null));

    fireEvent.click(screen.getByText("Trigger Two"));
    await vi.waitFor(() => expect(screen.queryByText("Content Two")).not.toBe(null));
    expect(screen.queryByText("Content One")).toBe(null);

    const viewport = screen.getByTestId("viewport");
    expect(viewport.contains(screen.getByText("Content Two"))).toBe(true);

    fireEvent.click(screen.getByText("Trigger One"));
    await vi.waitFor(() => expect(screen.queryByText("Content One")).not.toBe(null));
    expect(screen.queryByText("Content Two")).toBe(null);
  });

  it("swaps the proxied content inside an `asChild` viewport", async () => {
    render(() => <TwoItemMenu asChildViewport />);
    const viewport = screen.getByTestId("viewport");
    await vi.waitFor(() => expect(screen.queryByText("Content One")).not.toBe(null));
    expect(viewport.contains(screen.getByText("Content One"))).toBe(true);

    fireEvent.click(screen.getByText("Trigger Two"));
    await vi.waitFor(() => expect(screen.queryByText("Content Two")).not.toBe(null));
    expect(viewport.contains(screen.getByText("Content Two"))).toBe(true);
    expect(screen.queryByText("Content One")).toBe(null);
  });
});

/**
 * Solid equivalent of Radix's `assertStableComposedRef` helper. Solid
 * components render once (there are no re-renders to count), so instead of a
 * render budget this asserts the composed ref settles: a stable callback ref
 * that writes a signal when it receives a node must not be detached and
 * re-attached in a loop.
 */
function assertStableComposedRef(
  renderWithRef: (ref: (node: unknown) => void) => JSX.Element,
  { maxCalls = 25 }: { maxCalls?: number | undefined } = {},
) {
  let calls = 0;

  function Probe() {
    const [tick, setTick] = createSignal(0);
    tick();
    // The probe ref is intentionally stable so that any loop is caused by the
    // component under test, not by this helper.
    const ref = (node: unknown) => {
      calls++;
      if (node) setTick((t) => t + 1);
    };
    return renderWithRef(ref);
  }

  expect(() => render(() => <Probe />)).not.toThrow();
  expect(
    calls,
    `Expected the component to settle, but the ref was called ${calls} times ` +
      `(>= ${maxCalls}). This usually means a composed ref callback is being ` +
      `recreated on every update.`,
  ).toBeLessThan(maxCalls);
}
