import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
  type HoverCardProps,
} from "../src/index";

const HoverCardTest = (props: HoverCardProps) => (
  <HoverCard openDelay={700} closeDelay={300} {...props}>
    <HoverCardTrigger>Trigger</HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent>Content</HoverCardContent>
    </HoverCardPortal>
  </HoverCard>
);

describe("HoverCard", () => {
  // Regression test for https://github.com/radix-ui/primitives/issues/1248
  test("does not open when leaving the trigger before the open delay elapses", () => {
    vi.useFakeTimers();
    try {
      render(() => <HoverCardTest />);
      const trigger = screen.getByText("Trigger");

      // Enter the trigger, then leave before the open delay finishes.
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      flush();
      vi.advanceTimersByTime(300);
      flush();
      fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
      flush();

      // Advance well past the original open delay.
      vi.advanceTimersByTime(1000);
      flush();

      expect(screen.queryByText("Content")).toBe(null);
      expect(trigger.getAttribute("data-state")).toBe("closed");
    } finally {
      vi.useRealTimers();
    }
  });

  test("opens after the open delay when the trigger stays hovered", () => {
    vi.useFakeTimers();
    try {
      render(() => <HoverCardTest />);
      const trigger = screen.getByText("Trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      flush();
      expect(screen.queryByText("Content")).toBe(null);

      vi.advanceTimersByTime(700);
      flush();
      expect(screen.getByText("Content")).toBeTruthy();
      expect(trigger.getAttribute("data-state")).toBe("open");
    } finally {
      vi.useRealTimers();
    }
  });

  test("closes after the close delay when leaving an open trigger", () => {
    vi.useFakeTimers();
    try {
      render(() => <HoverCardTest />);
      const trigger = screen.getByText("Trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      flush();
      vi.advanceTimersByTime(700);
      flush();
      expect(screen.getByText("Content")).toBeTruthy();

      fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
      flush();
      vi.advanceTimersByTime(300);
      flush();
      expect(screen.queryByText("Content")).toBe(null);
    } finally {
      vi.useRealTimers();
    }
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/1248
  // Sweeping a pointer across a list of triggers without pausing on any of them
  // must not leave any card lingering open.
  test("does not leave a card open when sweeping across a list of triggers", () => {
    vi.useFakeTimers();
    try {
      render(() => (
        <>
          {["A", "B", "C"].map((id) => (
            <HoverCard openDelay={700} closeDelay={300}>
              <HoverCardTrigger>Trigger {id}</HoverCardTrigger>
              <HoverCardPortal>
                <HoverCardContent>Content {id}</HoverCardContent>
              </HoverCardPortal>
            </HoverCard>
          ))}
        </>
      ));

      const triggers = ["A", "B", "C"].map((id) => screen.getByText(`Trigger ${id}`));

      // Move across each trigger, pausing less than the open delay on each.
      for (const trigger of triggers) {
        fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
        flush();
        vi.advanceTimersByTime(200);
        flush();
        fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
        flush();
      }

      vi.advanceTimersByTime(1000);
      flush();

      for (const id of ["A", "B", "C"]) {
        expect(screen.queryByText(`Content ${id}`)).toBe(null);
      }
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("HoverCard.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <HoverCard>
        <HoverCardTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Trigger
        </HoverCardTrigger>
      </HoverCard>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <HoverCard>
        <HoverCardTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Trigger</article>
        </HoverCardTrigger>
      </HoverCard>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("ARTICLE");
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("HoverCard.Content", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <HoverCard open>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Content
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>
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
      <HoverCard open>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Content</article>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.getAttribute("data-side")).toBe("bottom");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("HoverCard.Arrow", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: Element | null = null;
    const onClick = vi.fn();

    render(() => (
      <HoverCard open>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent>
            Content
            <HoverCardArrow
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>
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
      <HoverCard open>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent>
            Content
            <HoverCardArrow
              asChild
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <svg />
            </HoverCardArrow>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>
    ));

    const arrow = (await screen.findByTestId("arrow")) as HTMLElement;
    expect(arrow.tagName).toBe("svg");
    expect(arrow.getAttribute("viewBox")).toBe("0 0 30 10");
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });
});
