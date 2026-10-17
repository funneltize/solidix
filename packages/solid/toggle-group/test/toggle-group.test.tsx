import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { ToggleGroup, ToggleGroupItem } from "../src/index";

describe("given a single ToggleGroup", () => {
  test("has radiogroup role and changes value on click", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="one">One</ToggleGroupItem>
        <ToggleGroupItem value="two">Two</ToggleGroupItem>
      </ToggleGroup>
    ));

    expect(screen.getByRole("radiogroup")).toBeDefined();

    const one = screen.getByRole("radio", { name: "One" });
    const two = screen.getByRole("radio", { name: "Two" });

    await user.click(one);
    expect(onValueChange).toHaveBeenLastCalledWith("one");
    expect(one.getAttribute("aria-checked")).toBe("true");
    expect(one.getAttribute("data-state")).toBe("on");
    expect(one.getAttribute("aria-pressed")).toBe(null);
    expect(two.getAttribute("aria-checked")).toBe("false");

    await user.click(two);
    expect(onValueChange).toHaveBeenLastCalledWith("two");
    expect(two.getAttribute("aria-checked")).toBe("true");
    expect(one.getAttribute("aria-checked")).toBe("false");
  });

  test("clears the value when clicking the pressed item again", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <ToggleGroup type="single" defaultValue="two" onValueChange={onValueChange}>
        <ToggleGroupItem value="one">One</ToggleGroupItem>
        <ToggleGroupItem value="two">Two</ToggleGroupItem>
      </ToggleGroup>
    ));

    const two = screen.getByRole("radio", { name: "Two" });
    expect(two.getAttribute("aria-checked")).toBe("true");

    await user.click(two);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(two.getAttribute("aria-checked")).toBe("false");
  });

  test("stays controlled when value is provided", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <ToggleGroup type="single" value="one" onValueChange={onValueChange}>
        <ToggleGroupItem value="one">One</ToggleGroupItem>
        <ToggleGroupItem value="two">Two</ToggleGroupItem>
      </ToggleGroup>
    ));

    await user.click(screen.getByRole("radio", { name: "Two" }));

    expect(onValueChange).toHaveBeenLastCalledWith("two");
    expect(screen.getByRole("radio", { name: "One" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Two" }).getAttribute("aria-checked")).toBe("false");
  });
});

describe("given a multiple ToggleGroup", () => {
  test("has toolbar role and accumulates values on click", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <ToggleGroup type="multiple" onValueChange={onValueChange}>
        <ToggleGroupItem value="one">One</ToggleGroupItem>
        <ToggleGroupItem value="two">Two</ToggleGroupItem>
      </ToggleGroup>
    ));

    expect(screen.getByRole("toolbar")).toBeDefined();

    const one = screen.getByRole("button", { name: "One" });
    const two = screen.getByRole("button", { name: "Two" });

    await user.click(one);
    expect(onValueChange).toHaveBeenLastCalledWith(["one"]);
    expect(one.getAttribute("aria-pressed")).toBe("true");

    await user.click(two);
    expect(onValueChange).toHaveBeenLastCalledWith(["one", "two"]);
    expect(two.getAttribute("aria-pressed")).toBe("true");

    await user.click(one);
    expect(onValueChange).toHaveBeenLastCalledWith(["two"]);
    expect(one.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("ToggleGroup.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <ToggleGroup
        type="single"
        defaultValue="one"
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <ToggleGroupItem value="one">Item</ToggleGroupItem>
      </ToggleGroup>
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
      <ToggleGroup
        type="single"
        defaultValue="one"
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <ToggleGroupItem value="one">Item</ToggleGroupItem>
        </article>
      </ToggleGroup>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("role")).toBe("radiogroup");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    await user.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("ToggleGroup.Item", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <ToggleGroup type="single" defaultValue="one">
        <ToggleGroupItem
          value="one"
          ref={(node) => void (element = node)}
          data-testid="item"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Item
        </ToggleGroupItem>
      </ToggleGroup>
    ));

    const item = (await screen.findByTestId("item")) as HTMLElement;
    expect(item.classList.contains("custom-class")).toBe(true);
    expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    // Composed with the item's own handler rather than replaced
    await user.click(item);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <ToggleGroup type="single" defaultValue="one">
        <ToggleGroupItem
          value="one"
          asChild
          ref={(node) => void (element = node)}
          data-testid="item"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button type="button">Item</button>
        </ToggleGroupItem>
      </ToggleGroup>
    ));

    const item = (await screen.findByTestId("item")) as HTMLElement;
    expect(item.tagName).toBe("BUTTON");
    expect(item.getAttribute("role")).toBe("radio");
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(item.getAttribute("data-state")).toBe("on");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    await user.click(item);
    expect(onClick).toHaveBeenCalled();
  });
});
