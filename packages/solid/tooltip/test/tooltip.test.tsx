import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createEffect, createSignal, flush } from "solid-js";
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
} from "../src/index";

const TRIGGER_TEXT = "Tooltip Trigger";
const CONTENT_TEXT = "Tooltip Content";

describe("Tooltip rendering", () => {
  test("renders tooltip trigger without content while closed", () => {
    render(() => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              {CONTENT_TEXT}
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    expect(screen.getByText(TRIGGER_TEXT)).toBeTruthy();
    expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
  });

  test("renders tooltip content when trigger is hovered", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              {CONTENT_TEXT}
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

    await user.hover(trigger);
    const content = (await screen.findByText(CONTENT_TEXT)) as HTMLElement;
    expect(trigger.getAttribute("aria-describedby")).toBe(content.id);
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/2598
  test("appends the tooltip id to an existing aria-describedby", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger aria-describedby="existing-description">{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent id="tooltip-description">{CONTENT_TEXT}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
        <span id="existing-description">Existing description</span>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(trigger.getAttribute("aria-describedby")).toBe("existing-description");

    await user.hover(trigger);
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-describedby")).toBe(
        "existing-description tooltip-description",
      );
    });

    await user.click(trigger);
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-describedby")).toBe("existing-description");
    });
  });

  test("normalizes and deduplicates aria-describedby ids when the tooltip opens", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger
            aria-describedby={" existing-description\texisting-description tooltip-description "}
          >
            {TRIGGER_TEXT}
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent id="tooltip-description">{CONTENT_TEXT}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    await user.hover(trigger);
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-describedby")).toBe(
        "existing-description tooltip-description",
      );
    });
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/2598
  test("appends the tooltip id to aria-describedby on an asChild trigger", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button type="button" aria-describedby="existing-description">
              {TRIGGER_TEXT}
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent id="tooltip-description">{CONTENT_TEXT}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
        <span id="existing-description">Existing description</span>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(trigger.getAttribute("aria-describedby")).toBe("existing-description");

    await user.hover(trigger);
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-describedby")).toBe(
        "existing-description tooltip-description",
      );
    });

    await user.click(trigger);
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-describedby")).toBe("existing-description");
    });
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/3034
  test("does not duplicate content children", async () => {
    const user = userEvent.setup();
    let effectRuns = 0;

    const Child = () => {
      const [node, setNode] = createSignal<HTMLSpanElement | null>(null);
      createEffect(
        () => node(),
        (element) => {
          if (element) effectRuns += 1;
        },
      );
      return <span ref={setNode}>{CONTENT_TEXT}</span>;
    };

    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <Child />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    await user.hover(screen.getByText(TRIGGER_TEXT));
    await screen.findByText(CONTENT_TEXT);

    expect(screen.getAllByText(CONTENT_TEXT)).toHaveLength(1);
    // The setup-time presence probe instantiates (then disposes) one extra
    // copy, but effects run exactly once, on the mounted instance.
    expect(effectRuns).toBe(1);
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/3034
  test("uses aria-label without duplicating content children", async () => {
    const user = userEvent.setup();
    let effectRuns = 0;

    const Child = () => {
      const [node, setNode] = createSignal<HTMLSpanElement | null>(null);
      createEffect(
        () => node(),
        (element) => {
          if (element) effectRuns += 1;
        },
      );
      return <span ref={setNode}>{CONTENT_TEXT}</span>;
    };

    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent aria-label="Accessible label">
              <Child />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    await user.hover(screen.getByText(TRIGGER_TEXT));
    await screen.findByText(CONTENT_TEXT);

    expect(screen.getAllByText(CONTENT_TEXT)).toHaveLength(1);
    expect(effectRuns).toBe(1);
    expect(screen.getByRole("tooltip").textContent).toBe("Accessible label");
  });

  test("keeps aria-describedby in sync with a custom content id", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent id="custom-id">{CONTENT_TEXT}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    await user.hover(trigger);
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-describedby")).toBe("custom-id");
      expect(screen.getByRole("tooltip").getAttribute("id")).toBe("custom-id");
    });
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/3034
  test("keeps a custom id unique when combined with aria-label", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent aria-label="Accessible label" id="custom-id">
              {CONTENT_TEXT}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    await user.hover(trigger);
    await vi.waitFor(() => {
      expect(screen.queryByText(CONTENT_TEXT)).toBeTruthy();
    });

    // The id must not be duplicated across the visible content and the
    // visually hidden description.
    expect(document.querySelectorAll("#custom-id")).toHaveLength(1);

    // `aria-describedby` must resolve to the accessible label, not the visible
    // children.
    expect(trigger.getAttribute("aria-describedby")).toBe("custom-id");
    const description = document.getElementById("custom-id") as HTMLElement;
    expect(description.getAttribute("role")).toBe("tooltip");
    expect(description.textContent).toContain("Accessible label");
    expect(description.textContent).not.toContain(CONTENT_TEXT);
  });

  test("dismisses tooltip content when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(() => (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>{TRIGGER_TEXT}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              {CONTENT_TEXT}
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(screen.queryByText(CONTENT_TEXT)).toBe(null);

    await user.hover(trigger);
    await screen.findByText(CONTENT_TEXT);

    await user.click(trigger);
    await vi.waitFor(() => {
      expect(screen.queryByText(CONTENT_TEXT)).toBe(null);
    });
  });
});

describe("Tooltip behavior", () => {
  // Adaptation of Radix's Profiler regression test for
  // https://github.com/radix-ui/primitives/issues/2375: Solid has no
  // re-renders - fine-grained reactivity updates only the hovered tooltip's
  // subscribers by construction. Assert the user-visible essence instead.
  test("hovering one tooltip does not open sibling tooltips", async () => {
    const user = userEvent.setup();
    const TooltipCase = (props: { id: string }) => (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>Trigger {props.id}</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Content {props.id}</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    );

    render(() => (
      <TooltipProvider>
        <TooltipCase id="a" />
        <TooltipCase id="b" />
        <TooltipCase id="c" />
      </TooltipProvider>
    ));

    await user.hover(screen.getByText("Trigger a"));
    await screen.findByText("Content a");

    expect(screen.getByText("Trigger a").getAttribute("data-state")).not.toBe("closed");
    for (const id of ["b", "c"]) {
      expect(screen.getByText(`Trigger ${id}`).getAttribute("data-state")).toBe("closed");
      expect(screen.queryByText(`Content ${id}`)).toBe(null);
    }
  });

  test("skips the delay when moving between triggers within skipDelayDuration", () => {
    vi.useFakeTimers();
    try {
      render(() => (
        <TooltipProvider delayDuration={100} skipDelayDuration={300}>
          <Tooltip>
            <TooltipTrigger>Trigger A</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Content A</TooltipContent>
            </TooltipPortal>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Trigger B</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Content B</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ));
      const triggerA = screen.getByText("Trigger A");
      const triggerB = screen.getByText("Trigger B");

      // Hovering the first trigger opens it only after the delay elapses
      fireEvent.pointerMove(triggerA);
      flush();
      expect(triggerA.getAttribute("data-state")).toBe("closed");
      vi.advanceTimersByTime(100);
      flush();
      expect(triggerA.getAttribute("data-state")).toBe("delayed-open");

      fireEvent.click(triggerA);
      flush();

      // Moving to the second trigger within the skip window opens instantly
      fireEvent.pointerMove(triggerB);
      flush();
      expect(triggerB.getAttribute("data-state")).toBe("instant-open");
    } finally {
      vi.useRealTimers();
    }
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/3873
  test("does not skip the delay when skipDelayDuration is 0", () => {
    vi.useFakeTimers();
    try {
      render(() => (
        <TooltipProvider delayDuration={100} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger A</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Content A</TooltipContent>
            </TooltipPortal>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Trigger B</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Content B</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ));

      const triggerA = screen.getByText("Trigger A");
      const triggerB = screen.getByText("Trigger B");

      fireEvent.pointerMove(triggerA);
      flush();
      vi.advanceTimersByTime(100);
      flush();
      expect(triggerA.getAttribute("data-state")).toBe("delayed-open");
      fireEvent.click(triggerA);
      flush();

      // Moving to the second trigger must NOT open it instantly
      fireEvent.pointerMove(triggerB);
      flush();
      expect(triggerB.getAttribute("data-state")).toBe("closed");

      vi.advanceTimersByTime(100);
      flush();
      expect(triggerB.getAttribute("data-state")).toBe("delayed-open");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Tooltip.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Trigger
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(trigger.getAttribute("type")).toBe(null);
    expect(element).toBe(trigger);

    // Composed with the trigger's own click handler rather than replaced by it.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            asChild
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <button type="button">Trigger</button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Tooltip.Content", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Content
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
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
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              asChild
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Content</article>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("tooltip");
    expect(content.getAttribute("data-state")).toBe("instant-open");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Tooltip.Arrow", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: Element | null = null;
    const onClick = vi.fn();

    render(() => (
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              Content
              <TooltipArrow
                ref={(node) => void (element = node)}
                data-testid="arrow"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
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
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              Content
              <TooltipArrow
                asChild
                ref={(node) => void (element = node)}
                data-testid="arrow"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <svg />
              </TooltipArrow>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
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
