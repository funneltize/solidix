import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Separator } from "../src/index";

describe("Separator", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Separator
        ref={(node) => void (element = node)}
        data-testid="separator"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      />
    ));

    const separator = (await screen.findByTestId("separator")) as HTMLElement;
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    await user.click(separator);
    expect(onClick).toHaveBeenCalled();
  });

  test("renders a horizontal separator by default", async () => {
    render(() => <Separator data-testid="separator" />);

    const separator = await screen.findByTestId("separator");
    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
    expect(separator.getAttribute("aria-orientation")).toBe(null);
  });

  test("sets aria-orientation for vertical separators", async () => {
    render(() => <Separator data-testid="separator" orientation="vertical" />);

    const separator = await screen.findByTestId("separator");
    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("data-orientation")).toBe("vertical");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
  });

  test("removes decorative separators from the accessibility tree", async () => {
    render(() => <Separator data-testid="separator" decorative />);

    const separator = await screen.findByTestId("separator");
    expect(separator.getAttribute("role")).toBe("none");
    expect(separator.getAttribute("aria-orientation")).toBe(null);
  });

  test("falls back to horizontal for invalid orientations", async () => {
    render(() => <Separator data-testid="separator" orientation={"diagonal" as "horizontal"} />);

    const separator = await screen.findByTestId("separator");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
  });

  test("lets explicit props override the semantic defaults", async () => {
    render(() => <Separator data-testid="separator" role="presentation" />);

    const separator = await screen.findByTestId("separator");
    expect(separator.getAttribute("role")).toBe("presentation");
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Separator
        asChild
        ref={(node) => void (element = node)}
        data-testid="separator"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article />
      </Separator>
    ));

    const separator = (await screen.findByTestId("separator")) as HTMLElement;
    expect(separator.tagName).toBe("ARTICLE");
    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    await user.click(separator);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set on a vertical decorative separator", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Separator
        orientation="vertical"
        decorative
        asChild
        ref={(node) => void (element = node)}
        data-testid="separator"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article />
      </Separator>
    ));

    const separator = (await screen.findByTestId("separator")) as HTMLElement;
    expect(separator.tagName).toBe("ARTICLE");
    expect(separator.getAttribute("role")).toBe("none");
    expect(separator.getAttribute("data-orientation")).toBe("vertical");
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    await user.click(separator);
    expect(onClick).toHaveBeenCalled();
  });
});
