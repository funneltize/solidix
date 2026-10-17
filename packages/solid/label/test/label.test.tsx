import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Label } from "../src/index";

describe("Label", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLLabelElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Label
        ref={(node) => void (element = node)}
        data-testid="label"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        Label
      </Label>
    ));

    const label = (await screen.findByTestId("label")) as HTMLElement;
    expect(label.classList.contains("custom-class")).toBe(true);
    expect(label.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(label);

    await user.click(label);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Label
        asChild
        ref={(node) => void (element = node)}
        data-testid="label"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <span>Label</span>
      </Label>
    ));

    const label = (await screen.findByTestId("label")) as HTMLElement;
    expect(label.tagName).toBe("SPAN");
    expect(label.classList.contains("custom-class")).toBe(true);
    expect(label.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(label);

    await user.click(label);
    expect(onClick).toHaveBeenCalled();
  });

  test("prevents text selection when double clicking the label", async () => {
    const onMouseDown = vi.fn();

    render(() => (
      <Label data-testid="label" onMouseDown={onMouseDown}>
        Label
      </Label>
    ));

    const label = await screen.findByTestId("label");
    const prevented = !label.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, detail: 2 }),
    );

    expect(onMouseDown).toHaveBeenCalled();
    expect(prevented).toBe(true);
  });

  test("leaves single clicks alone", async () => {
    render(() => <Label data-testid="label">Label</Label>);

    const label = await screen.findByTestId("label");
    const prevented = !label.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, detail: 1 }),
    );

    expect(prevented).toBe(false);
  });

  test("skips handling when clicking inside a control", async () => {
    const onMouseDown = vi.fn();

    render(() => (
      <Label data-testid="label" onMouseDown={onMouseDown}>
        <button type="button">action</button>
      </Label>
    ));

    const button = await screen.findByText("action");
    const prevented = !button.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, detail: 2 }),
    );

    expect(onMouseDown).not.toHaveBeenCalled();
    expect(prevented).toBe(false);
  });
});
