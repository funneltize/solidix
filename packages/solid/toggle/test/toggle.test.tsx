import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Toggle } from "../src/index";

describe("Toggle", () => {
  test("renders pressed as false/off by default", async () => {
    render(() => <Toggle>Like</Toggle>);

    const button = await screen.findByRole("button", { name: "Like" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("data-state")).toBe("off");
  });

  test("toggles to true/on when clicked", async () => {
    const user = userEvent.setup();
    render(() => <Toggle>Like</Toggle>);

    const button = await screen.findByRole("button", { name: "Like" });
    await user.click(button);

    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("data-state")).toBe("on");
  });

  test("respects defaultPressed and toggles back off", async () => {
    const user = userEvent.setup();
    render(() => <Toggle defaultPressed>Like</Toggle>);

    const button = await screen.findByRole("button", { name: "Like" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("data-state")).toBe("on");

    await user.click(button);

    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("data-state")).toBe("off");
  });

  test("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(() => <Toggle disabled>Like</Toggle>);

    const button = await screen.findByRole("button", { name: "Like" });
    expect(button.hasAttribute("disabled")).toBe(true);

    await user.click(button);

    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("data-state")).toBe("off");
  });

  test("calls onPressedChange with the next state", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(() => <Toggle onPressedChange={onPressedChange}>Like</Toggle>);

    await user.click(await screen.findByRole("button", { name: "Like" }));

    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  test("stays controlled when pressed is provided", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        Like
      </Toggle>
    ));

    const button = await screen.findByRole("button", { name: "Like" });
    await user.click(button);

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("data-state")).toBe("off");
  });

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Toggle
        ref={(node) => void (element = node)}
        data-testid="toggle"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        Like
      </Toggle>
    ));

    const toggle = (await screen.findByTestId("toggle")) as HTMLElement;
    expect(toggle.classList.contains("custom-class")).toBe(true);
    expect(toggle.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(toggle);

    await user.click(toggle);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Toggle
        asChild
        ref={(node) => void (element = node)}
        data-testid="toggle"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <span>Like</span>
      </Toggle>
    ));

    const toggle = (await screen.findByTestId("toggle")) as HTMLElement;
    expect(toggle.tagName).toBe("SPAN");
    expect(toggle.classList.contains("custom-class")).toBe(true);
    expect(toggle.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(toggle);

    await user.click(toggle);
    expect(onClick).toHaveBeenCalled();
  });
});
