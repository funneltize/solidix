import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { flush } from "solid-js";
import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
  type PopoverProps,
} from "../src/index";

const TRIGGER_TEXT = "Open";
const CONTENT_TEXT = "Content";

const PopoverTest = (props: PopoverProps) => (
  <Popover {...props}>
    <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
    <PopoverPortal>
      <PopoverContent>{CONTENT_TEXT}</PopoverContent>
    </PopoverPortal>
  </Popover>
);

afterEach(() => {
  // A modal popover sets this on the `body` and only restores it on close.
  document.body.style.pointerEvents = "";
});

describe("aria-controls", () => {
  test("should not reference a non-existent element while closed", async () => {
    render(() => <PopoverTest />);
    const trigger = await screen.findByText(TRIGGER_TEXT);
    // Content is unmounted while closed, so the trigger must not point at it.
    expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe(null);
  });

  test("should reference the rendered content while open", async () => {
    render(() => <PopoverTest />);
    const trigger = await screen.findByText(TRIGGER_TEXT);
    fireEvent.click(trigger);
    const content = (await screen.findByText(CONTENT_TEXT)) as HTMLElement;
    expect(content.id).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);
  });

  test("should not reference the content before it is open", async () => {
    render(() => <PopoverTest />);
    const trigger = await screen.findByText(TRIGGER_TEXT);
    expect(trigger.getAttribute("aria-controls")).toBe(null);
  });

  test("should reference the content when it is open", async () => {
    render(() => <PopoverTest />);
    const trigger = await screen.findByText(TRIGGER_TEXT);

    fireEvent.click(trigger);

    const contentId = ((await screen.findByText(CONTENT_TEXT)) as HTMLElement).id;
    expect(trigger.getAttribute("aria-controls")).toBe(contentId);
  });

  test("should stop referencing the content once it closes", async () => {
    render(() => <PopoverTest defaultOpen />);
    const trigger = await screen.findByText(TRIGGER_TEXT);
    await screen.findByText(CONTENT_TEXT);

    fireEvent.click(trigger);

    await vi.waitFor(() => expect(trigger.getAttribute("aria-controls")).toBe(null));
  });
});

describe("Title and Description", () => {
  const TITLE_TEXT = "Title";
  const DESCRIPTION_TEXT = "Description";

  const openContent = async () => {
    fireEvent.click(await screen.findByText(TRIGGER_TEXT));
    return screen.findByRole("dialog");
  };

  test("should not reference a title or description when none are rendered", async () => {
    render(() => <PopoverTest />);
    const content = await openContent();
    expect(content.getAttribute("aria-labelledby")).toBe(null);
    expect(content.getAttribute("aria-describedby")).toBe(null);
  });

  test("should label the content via aria-labelledby when a Title is rendered", async () => {
    render(() => (
      <Popover>
        <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>{TITLE_TEXT}</PopoverTitle>
            {CONTENT_TEXT}
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));
    const content = await openContent();
    const title = (await screen.findByText(TITLE_TEXT)) as HTMLElement;
    expect(title.id).toBeTruthy();
    expect(content.getAttribute("aria-labelledby")).toBe(title.id);
    expect(content.getAttribute("aria-describedby")).toBe(null);
  });

  test("should describe the content via aria-describedby when a Description is rendered", async () => {
    render(() => (
      <Popover>
        <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverDescription>{DESCRIPTION_TEXT}</PopoverDescription>
            {CONTENT_TEXT}
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));
    const content = await openContent();
    const description = (await screen.findByText(DESCRIPTION_TEXT)) as HTMLElement;
    expect(description.id).toBeTruthy();
    expect(content.getAttribute("aria-describedby")).toBe(description.id);
    expect(content.getAttribute("aria-labelledby")).toBe(null);
  });

  test("should reference both Title and Description when rendered together", async () => {
    render(() => (
      <Popover>
        <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>{TITLE_TEXT}</PopoverTitle>
            <PopoverDescription>{DESCRIPTION_TEXT}</PopoverDescription>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));
    const content = await openContent();
    expect(content.getAttribute("aria-labelledby")).toBe((await screen.findByText(TITLE_TEXT)).id);
    expect(content.getAttribute("aria-describedby")).toBe(
      (await screen.findByText(DESCRIPTION_TEXT)).id,
    );
  });
});

describe("open and close behavior", () => {
  test("toggles open state when clicking the trigger", async () => {
    const onOpenChange = vi.fn();
    render(() => <PopoverTest onOpenChange={onOpenChange} />);
    const trigger = await screen.findByText(TRIGGER_TEXT);

    fireEvent.click(trigger);
    await screen.findByText(CONTENT_TEXT);
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));

    fireEvent.click(trigger);
    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test("closes on Escape", async () => {
    render(() => <PopoverTest />);
    fireEvent.click(await screen.findByText(TRIGGER_TEXT));
    const content = await screen.findByRole("dialog");

    fireEvent.keyDown(content, { key: "Escape" });

    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
  });

  test("closes on outside pointer down", async () => {
    render(() => <PopoverTest />);
    fireEvent.click(await screen.findByText(TRIGGER_TEXT));
    await screen.findByText(CONTENT_TEXT);

    // Flush so the layer's document listeners (attached in effects) are in
    // place, then yield a macrotask: the `pointerdown` listener itself
    // attaches in a `setTimeout` (Radix parity, so the mounting gesture never
    // counts as outside). The popover defers outside pointer-down handling
    // until the follow-up click, so fire the full gesture.
    flush();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(document.body, { button: 0 });
    fireEvent.click(document.body, { button: 0 });

    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
  });

  test("closes on Close click and returns focus to the trigger", async () => {
    render(() => (
      <Popover>
        <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            {CONTENT_TEXT}
            <PopoverClose>Dismiss</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));
    const trigger = await screen.findByText(TRIGGER_TEXT);
    fireEvent.click(trigger);
    const close = await screen.findByText("Dismiss");

    fireEvent.click(close);

    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test("moves focus into the content on open", async () => {
    render(() => (
      <Popover>
        <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <button type="button">Action</button>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));
    fireEvent.click(await screen.findByText(TRIGGER_TEXT));
    const content = await screen.findByRole("dialog");

    await vi.waitFor(() => expect(content.contains(document.activeElement)).toBe(true));
  });

  test("keeps focus inside modal content when tabbing", async () => {
    const user = userEvent.setup();
    render(() => (
      <Popover modal>
        <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <button type="button">First</button>
            <button type="button">Second</button>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));
    fireEvent.click(await screen.findByText(TRIGGER_TEXT));
    const content = await screen.findByRole("dialog");
    await vi.waitFor(() => expect(content.contains(document.activeElement)).toBe(true));

    await user.tab();
    expect(content.contains(document.activeElement)).toBe(true);
    await user.tab();
    expect(content.contains(document.activeElement)).toBe(true);
  });

  test("closes a modal popover on Escape and restores the trigger", async () => {
    render(() => <PopoverTest modal />);
    const trigger = await screen.findByText(TRIGGER_TEXT);
    fireEvent.click(trigger);
    const content = await screen.findByRole("dialog");

    fireEvent.keyDown(content, { key: "Escape" });

    await vi.waitFor(() => expect(screen.queryByText(CONTENT_TEXT)).toBe(null));
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});

describe("given a Popover with `asChild` on the Content", () => {
  // Regression test for https://github.com/radix-ui/primitives/issues/4077
  test.each([{ modal: true }, { modal: false }])(
    "forwards content props and the ref to the child (modal: $modal)",
    async ({ modal }) => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <Popover defaultOpen modal={modal}>
          <PopoverTrigger>{TRIGGER_TEXT}</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent
              asChild
              class="content"
              onClick={onClick}
              ref={(node) => void (element = node)}
            >
              <article data-testid="content">{CONTENT_TEXT}</article>
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      ));

      const content = (await screen.findByTestId("content")) as HTMLElement;
      expect(content.tagName).toBe("ARTICLE");
      expect(content.getAttribute("role")).toBe("dialog");
      expect(content.getAttribute("data-state")).toBe("open");
      expect(content.classList.contains("content")).toBe(true);
      expect(element).toBe(content);

      fireEvent.click(content);
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );
});

describe("Popover.Anchor", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover>
        <PopoverAnchor
          ref={(node) => void (element = node)}
          data-testid="anchor"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Popover>
    ));

    const anchor = (await screen.findByTestId("anchor")) as HTMLElement;
    expect(anchor.classList.contains("custom-class")).toBe(true);
    expect(anchor.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(anchor);

    fireEvent.click(anchor);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover>
        <PopoverAnchor
          asChild
          ref={(node) => void (element = node)}
          data-testid="anchor"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </PopoverAnchor>
      </Popover>
    ));

    const anchor = (await screen.findByTestId("anchor")) as HTMLElement;
    expect(anchor.tagName).toBe("ARTICLE");
    expect(anchor.classList.contains("custom-class")).toBe(true);
    expect(anchor.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(anchor);

    fireEvent.click(anchor);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Popover.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover>
        <PopoverTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Open
        </PopoverTrigger>
      </Popover>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    // Composed with the trigger's own click handler rather than replaced by it.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  // With no custom anchor the trigger is also wrapped in a slotted `Popper.Anchor`, so the props
  // have to survive two nested `Slot`s.
  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover>
        <PopoverTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button type="button">Open</button>
        </PopoverTrigger>
      </Popover>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Popover.Content", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <PopoverTitle>Title</PopoverTitle>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <PopoverTitle>Title</PopoverTitle>
            </article>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.getAttribute("aria-labelledby")).toBe(screen.getByText("Title").id);
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("spreads props it does not consume onto the element it renders on a modal popover", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen modal>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <PopoverTitle>Title</PopoverTitle>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set on a modal popover", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen modal>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <PopoverTitle>Title</PopoverTitle>
            </article>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.getAttribute("aria-labelledby")).toBe(screen.getByText("Title").id);
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Popover.Title", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLHeadingElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle
              ref={(node) => void (element = node)}
              data-testid="title"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Title
            </PopoverTitle>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const title = (await screen.findByTestId("title")) as HTMLElement;
    expect(title.classList.contains("custom-class")).toBe(true);
    expect(title.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(title);

    fireEvent.click(title);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle
              asChild
              ref={(node) => void (element = node)}
              data-testid="title"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Title</article>
            </PopoverTitle>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const title = (await screen.findByTestId("title")) as HTMLElement;
    expect(title.tagName).toBe("ARTICLE");
    expect(title.classList.contains("custom-class")).toBe(true);
    expect(title.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(title);

    fireEvent.click(title);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Popover.Description", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLParagraphElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverDescription
              ref={(node) => void (element = node)}
              data-testid="description"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Description
            </PopoverDescription>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const description = (await screen.findByTestId("description")) as HTMLElement;
    expect(description.classList.contains("custom-class")).toBe(true);
    expect(description.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(description);

    fireEvent.click(description);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverDescription
              asChild
              ref={(node) => void (element = node)}
              data-testid="description"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Description</article>
            </PopoverDescription>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const description = (await screen.findByTestId("description")) as HTMLElement;
    expect(description.tagName).toBe("ARTICLE");
    expect(description.classList.contains("custom-class")).toBe(true);
    expect(description.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(description);

    fireEvent.click(description);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Popover.Close", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverClose
              ref={(node) => void (element = node)}
              data-testid="close"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Close
            </PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const close = (await screen.findByTestId("close")) as HTMLElement;
    expect(close.classList.contains("custom-class")).toBe(true);
    expect(close.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(close);

    // Composed with the close behaviour rather than replaced by it.
    fireEvent.click(close);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverClose
              asChild
              ref={(node) => void (element = node)}
              data-testid="close"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <button type="button">Close</button>
            </PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const close = (await screen.findByTestId("close")) as HTMLElement;
    expect(close.tagName).toBe("BUTTON");
    expect(close.classList.contains("custom-class")).toBe(true);
    expect(close.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(close);

    fireEvent.click(close);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Popover.Arrow", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: SVGSVGElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverArrow
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            />
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const arrow = (await screen.findByTestId("arrow")) as HTMLElement;
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: Element | null = null;
    const onClick = vi.fn();

    render(() => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverArrow
              asChild
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <svg />
            </PopoverArrow>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    ));

    const arrow = (await screen.findByTestId("arrow")) as HTMLElement;
    // SVG elements report their tag name in lower case.
    expect(arrow.tagName).toBe("svg");
    expect(arrow.getAttribute("viewBox")).toBe("0 0 30 10");
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });
});

// Regression test for https://github.com/radix-ui/primitives/issues/4197
describe("handlers with a narrower parameter type than the prop", () => {
  test("accepts an `onOpenChange` handler typed with a narrower parameter", async () => {
    const handleOpenChange = vi.fn((open: true) => open);

    render(() => <PopoverTest onOpenChange={handleOpenChange} />);
    fireEvent.click(await screen.findByText(TRIGGER_TEXT));

    await vi.waitFor(() => expect(handleOpenChange).toHaveBeenCalledWith(true));
  });
});
