import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../src/index";

describe("given a default Collapsible", () => {
  test("opens and closes the content when clicking the trigger", async () => {
    const user = userEvent.setup();
    render(() => (
      <Collapsible>
        <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    ));

    expect(screen.queryByText("Content")).toBeNull();

    await user.click(screen.getByText("Trigger"));
    expect(await screen.findByText("Content")).toBeDefined();

    await user.click(screen.getByText("Trigger"));
    await vi.waitFor(() => {
      expect(screen.queryByText("Content")).toBeNull();
    });
  });
});

describe("aria-controls", () => {
  test("does not reference a non-existent element while closed", async () => {
    render(() => (
      <Collapsible>
        <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    ));

    const trigger = await screen.findByText("Trigger");
    expect(trigger.getAttribute("aria-controls")).toBe(null);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("references the rendered content while open", async () => {
    const user = userEvent.setup();
    render(() => (
      <Collapsible>
        <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    ));

    await user.click(screen.getByText("Trigger"));

    const trigger = screen.getByText("Trigger");
    const content = await screen.findByText("Content");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("given an open uncontrolled Collapsible", () => {
  test("closes the content and calls onOpenChange with false", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Collapsible defaultOpen onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    ));

    expect(await screen.findByText("Content")).toBeDefined();

    await user.click(screen.getByText("Trigger"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    await vi.waitFor(() => {
      expect(screen.queryByText("Content")).toBeNull();
    });
  });
});

describe("given an open controlled Collapsible", () => {
  test("calls onOpenChange but does not close the content", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    ));

    expect(await screen.findByText("Content")).toBeDefined();

    await user.click(screen.getByText("Trigger"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Content")).toBeDefined();
  });
});

describe("Collapsible.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Collapsible
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      />
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    await user.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Collapsible
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>Content</article>
      </Collapsible>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    await user.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Collapsible.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Collapsible>
        <CollapsibleTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Trigger
        </CollapsibleTrigger>
      </Collapsible>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    await user.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Collapsible>
        <CollapsibleTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <span>Trigger</span>
        </CollapsibleTrigger>
      </Collapsible>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    await user.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Collapsible.Content", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Collapsible defaultOpen>
        <CollapsibleContent
          ref={(node) => void (element = node)}
          data-testid="content"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Content
        </CollapsibleContent>
      </Collapsible>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    await user.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Collapsible defaultOpen>
        <CollapsibleContent
          asChild
          ref={(node) => void (element = node)}
          data-testid="content"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Content</article>
        </CollapsibleContent>
      </Collapsible>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    await user.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});
