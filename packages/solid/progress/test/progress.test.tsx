import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Progress, ProgressIndicator } from "../src/index";

describe("Progress", () => {
  test("renders value, max, and loading state", async () => {
    render(() => (
      <Progress value={30}>
        <ProgressIndicator data-testid="indicator" />
      </Progress>
    ));

    const progress = await screen.findByRole("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("30");
    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.getAttribute("aria-valuetext")).toBe("30%");
    expect(progress.getAttribute("data-state")).toBe("loading");
    expect(progress.getAttribute("data-value")).toBe("30");
    expect(progress.getAttribute("data-max")).toBe("100");

    const indicator = await screen.findByTestId("indicator");
    expect(indicator.getAttribute("data-state")).toBe("loading");
    expect(indicator.getAttribute("data-value")).toBe("30");
    expect(indicator.getAttribute("data-max")).toBe("100");
  });

  test("reports complete state when value reaches max", async () => {
    render(() => <Progress value={100} />);

    const progress = await screen.findByRole("progressbar");
    expect(progress.getAttribute("data-state")).toBe("complete");
    expect(progress.getAttribute("aria-valuetext")).toBe("100%");
  });

  test("reports indeterminate state without a value", async () => {
    render(() => <Progress />);

    const progress = await screen.findByRole("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe(null);
    expect(progress.getAttribute("aria-valuetext")).toBe(null);
    expect(progress.getAttribute("data-state")).toBe("indeterminate");
    expect(progress.getAttribute("data-value")).toBe(null);
  });

  test("supports a custom max and value label", async () => {
    render(() => (
      <Progress value={1} max={4} getValueLabel={(value, max) => `Step ${value} of ${max}`}>
        <ProgressIndicator data-testid="indicator" />
      </Progress>
    ));

    const progress = await screen.findByRole("progressbar");
    expect(progress.getAttribute("aria-valuemax")).toBe("4");
    expect(progress.getAttribute("aria-valuetext")).toBe("Step 1 of 4");
    expect(progress.getAttribute("data-max")).toBe("4");

    const indicator = await screen.findByTestId("indicator");
    expect(indicator.getAttribute("data-max")).toBe("4");
  });

  test.each([[200], [-20]])(
    "falls back to indeterminate for out-of-range value %s",
    async (value) => {
      const spy = vi.spyOn(console, "error");
      spy.mockImplementation(() => {});

      try {
        render(() => <Progress value={value} />);

        const progress = await screen.findByRole("progressbar");
        expect(progress.getAttribute("aria-valuenow")).toBe(null);
        expect(progress.getAttribute("data-state")).toBe("indeterminate");
        expect(spy).toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    },
  );

  test("falls back to the default max for an invalid max", async () => {
    const spy = vi.spyOn(console, "error");
    spy.mockImplementation(() => {});

    try {
      render(() => <Progress value={30} max={-100} />);

      const progress = await screen.findByRole("progressbar");
      expect(progress.getAttribute("aria-valuemax")).toBe("100");
      expect(progress.getAttribute("data-max")).toBe("100");
      expect(spy).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});

describe("Progress.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Progress
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
      <Progress
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>progress</article>
      </Progress>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("role")).toBe("progressbar");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    await user.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Progress.Indicator", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Progress value={30}>
        <ProgressIndicator
          ref={(node) => void (element = node)}
          data-testid="indicator"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Progress>
    ));

    const indicator = (await screen.findByTestId("indicator")) as HTMLElement;
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect(indicator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    await user.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Progress value={30}>
        <ProgressIndicator
          asChild
          ref={(node) => void (element = node)}
          data-testid="indicator"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <section>indicator</section>
        </ProgressIndicator>
      </Progress>
    ));

    const indicator = (await screen.findByTestId("indicator")) as HTMLElement;
    expect(indicator.tagName).toBe("SECTION");
    expect(indicator.getAttribute("data-state")).toBe("loading");
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect(indicator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    await user.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });
});
