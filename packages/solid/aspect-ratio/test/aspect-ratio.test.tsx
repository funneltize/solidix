import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { AspectRatio } from "../src/index";

describe("AspectRatio", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <AspectRatio
        ref={(node) => void (element = node)}
        data-testid="aspect-ratio"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        Content
      </AspectRatio>
    ));

    const aspectRatio = (await screen.findByTestId("aspect-ratio")) as HTMLElement;
    expect(aspectRatio.classList.contains("custom-class")).toBe(true);
    expect(aspectRatio.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(aspectRatio.style.position).toBe("absolute");
    expect(element).toBe(aspectRatio);

    await user.click(aspectRatio);
    expect(onClick).toHaveBeenCalled();
  });

  test("sizes the wrapper from the ratio", async () => {
    render(() => (
      <AspectRatio ratio={1 / 2} data-testid="aspect-ratio">
        Content
      </AspectRatio>
    ));

    const aspectRatio = (await screen.findByTestId("aspect-ratio")) as HTMLElement;
    const wrapper = aspectRatio.parentElement;
    expect(wrapper?.hasAttribute("data-radix-aspect-ratio-wrapper")).toBe(true);
    expect(wrapper?.style.paddingBottom).toBe("200%");
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <AspectRatio
        asChild
        ref={(node) => void (element = node)}
        data-testid="aspect-ratio"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>Content</article>
      </AspectRatio>
    ));

    const aspectRatio = (await screen.findByTestId("aspect-ratio")) as HTMLElement;
    expect(aspectRatio.tagName).toBe("ARTICLE");
    expect(aspectRatio.classList.contains("custom-class")).toBe(true);
    expect(aspectRatio.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(aspectRatio.style.position).toBe("absolute");
    expect(element).toBe(aspectRatio);

    expect(aspectRatio.parentElement?.hasAttribute("data-radix-aspect-ratio-wrapper")).toBe(true);

    await user.click(aspectRatio);
    expect(onClick).toHaveBeenCalled();
  });
});
