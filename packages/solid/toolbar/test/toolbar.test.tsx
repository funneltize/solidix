import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Portal as SolidPortal } from "@solidjs/web";
import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "../src/index";

describe("given a default Toolbar", () => {
  test("Click event should be called just once", () => {
    const spy = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarToggleGroup type="single">
          <ToolbarToggleItem value="left" onClick={spy}>
            Left
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    ));

    fireEvent(
      screen.getByText("Left"),
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// Regression tests for https://github.com/radix-ui/primitives/issues/3232
describe("keys from focusable descendants", () => {
  test("does not activate a ToolbarLink from Space typed into a portaled focusable descendant", () => {
    const onClick = vi.fn();
    render(() => (
      <Toolbar>
        <ToolbarLink href="#" onClick={onClick}>
          Link
          <SolidPortal mount={document.body}>
            <input data-testid="input" value="" onInput={() => {}} />
          </SolidPortal>
        </ToolbarLink>
      </Toolbar>
    ));
    const input = screen.getByTestId("input") as HTMLInputElement;
    input.focus();
    fireEvent.keyDown(input, { key: " " });
    expect(onClick).not.toHaveBeenCalled();
  });

  test("still activates the ToolbarLink via Space when the link itself is focused", () => {
    const onClick = vi.fn();
    render(() => (
      <Toolbar>
        <ToolbarLink href="#" onClick={onClick}>
          Link
        </ToolbarLink>
      </Toolbar>
    ));
    const link = screen.getByText("Link") as HTMLElement;
    link.focus();
    fireEvent.keyDown(link, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Toolbar.Root", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <ToolbarButton>Button</ToolbarButton>
      </Toolbar>
    ));

    const root = screen.getByTestId("root") as HTMLElement;
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <ToolbarButton>Button</ToolbarButton>
        </article>
      </Toolbar>
    ));

    const root = screen.getByTestId("root") as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("role")).toBe("toolbar");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toolbar.Separator", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarSeparator
          ref={(node) => void (element = node)}
          data-testid="separator"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Toolbar>
    ));

    const separator = screen.getByTestId("separator") as HTMLElement;
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    fireEvent.click(separator);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarSeparator
          asChild
          ref={(node) => void (element = node)}
          data-testid="separator"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </ToolbarSeparator>
      </Toolbar>
    ));

    const separator = screen.getByTestId("separator") as HTMLElement;
    expect(separator.tagName).toBe("ARTICLE");
    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    fireEvent.click(separator);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toolbar.Button", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarButton
          ref={(node) => void (element = node)}
          data-testid="button"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Button
        </ToolbarButton>
      </Toolbar>
    ));

    const button = screen.getByTestId("button") as HTMLElement;
    expect(button.classList.contains("custom-class")).toBe(true);
    expect(button.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(button);

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarButton
          asChild
          ref={(node) => void (element = node)}
          data-testid="button"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Button</article>
        </ToolbarButton>
      </Toolbar>
    ));

    const button = screen.getByTestId("button") as HTMLElement;
    expect(button.tagName).toBe("ARTICLE");
    expect(button.classList.contains("custom-class")).toBe(true);
    expect(button.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(button);

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toolbar.Link", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarLink
          href="#"
          ref={(node) => void (element = node)}
          data-testid="link"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Link
        </ToolbarLink>
      </Toolbar>
    ));

    const link = screen.getByTestId("link") as HTMLElement;
    expect(link.classList.contains("custom-class")).toBe(true);
    expect(link.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(link);

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarLink
          asChild
          href="#"
          ref={(node) => void (element = node)}
          data-testid="link"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Link</article>
        </ToolbarLink>
      </Toolbar>
    ));

    const link = screen.getByTestId("link") as HTMLElement;
    expect(link.tagName).toBe("ARTICLE");
    expect(link.classList.contains("custom-class")).toBe(true);
    expect(link.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(link);

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toolbar.ToggleGroup", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarToggleGroup
          type="single"
          ref={(node) => void (element = node)}
          data-testid="toggle-group"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <ToolbarToggleItem value="one">Item</ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    ));

    const toggleGroup = screen.getByTestId("toggle-group") as HTMLElement;
    expect(toggleGroup.classList.contains("custom-class")).toBe(true);
    expect(toggleGroup.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(toggleGroup);

    fireEvent.click(toggleGroup);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Toolbar>
        <ToolbarToggleGroup
          type="single"
          asChild
          ref={(node) => void (element = node)}
          data-testid="toggle-group"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <ToolbarToggleItem value="one">Item</ToolbarToggleItem>
          </article>
        </ToolbarToggleGroup>
      </Toolbar>
    ));

    const toggleGroup = screen.getByTestId("toggle-group") as HTMLElement;
    expect(toggleGroup.tagName).toBe("ARTICLE");
    expect(toggleGroup.getAttribute("role")).toBe("radiogroup");
    expect(toggleGroup.getAttribute("data-orientation")).toBe("horizontal");
    expect(toggleGroup.classList.contains("custom-class")).toBe(true);
    expect(toggleGroup.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(toggleGroup);

    fireEvent.click(toggleGroup);
    expect(onClick).toHaveBeenCalled();
  });
});
