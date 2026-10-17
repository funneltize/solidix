import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {
  Checkbox,
  CheckboxIndicator as Indicator,
  unstable_CheckboxBubbleInput as UnstableBubbleInput,
  unstable_CheckboxProvider as UnstableProvider,
  unstable_CheckboxTrigger as UnstableTrigger,
} from "../src/index";

describe("given a default Checkbox", () => {
  test("toggles the indicator when clicked", async () => {
    const user = userEvent.setup();
    render(() => (
      <Checkbox>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");
    expect(screen.queryByTestId("indicator")).toBeNull();

    await user.click(checkbox);

    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.getAttribute("data-state")).toBe("checked");
    expect(await screen.findByTestId("indicator")).toBeDefined();

    await user.click(checkbox);

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    await vi.waitFor(() => {
      expect(screen.queryByTestId("indicator")).toBeNull();
    });
  });

  test("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(() => (
      <Checkbox disabled>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    const checkbox = await screen.findByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(screen.queryByTestId("indicator")).toBeNull();
  });

  test("does not activate on Enter keypress", async () => {
    const user = userEvent.setup();
    render(() => (
      <Checkbox>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    const checkbox = await screen.findByRole("checkbox");
    checkbox.focus();
    await user.keyboard("{Enter}");

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(screen.queryByTestId("indicator")).toBeNull();
  });
});

describe("given an uncontrolled checked Checkbox", () => {
  test("renders a visible indicator, toggles when clicked, and calls onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Checkbox defaultChecked onCheckedChange={onCheckedChange}>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    const checkbox = await screen.findByRole("checkbox");
    expect(await screen.findByTestId("indicator")).toBeDefined();

    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });
});

describe("given an indeterminate Checkbox", () => {
  test("reports mixed state and checks on click", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Checkbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange}>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(checkbox.getAttribute("data-state")).toBe("indeterminate");
    expect(await screen.findByTestId("indicator")).toBeDefined();

    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });
});

describe("given a controlled Checkbox", () => {
  test("calls onCheckedChange but does not toggle unless state is updated", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Checkbox checked={false} onCheckedChange={onCheckedChange}>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    const checkbox = await screen.findByRole("checkbox");
    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(screen.queryByTestId("indicator")).toBeNull();
  });

  test("toggles the indicator when state is updated", async () => {
    const user = userEvent.setup();
    const [checked, setChecked] = createSignal(false);
    render(() => (
      <Checkbox checked={checked()} onCheckedChange={setChecked}>
        <Indicator data-testid="indicator">✓</Indicator>
      </Checkbox>
    ));

    await user.click(await screen.findByRole("checkbox"));

    expect(await screen.findByTestId("indicator")).toBeDefined();
  });
});

describe("given a Checkbox in a form with a bubble input", () => {
  test("uncontrolled receives change event with next state", async () => {
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <form onChange={(event) => onFormChange((event.target as HTMLInputElement).checked)}>
        <Checkbox name="agree">
          <Indicator>✓</Indicator>
        </Checkbox>
      </form>
    ));

    await user.click(await screen.findByRole("checkbox"));

    await vi.waitFor(() => {
      expect(onFormChange).toHaveBeenCalledWith(true);
    });
  });

  test("controlled receives change event with controlled state when set externally", async () => {
    const onFormChange = vi.fn();
    const [checked, setChecked] = createSignal(false);
    render(() => (
      <form onChange={(event) => onFormChange((event.target as HTMLInputElement).checked)}>
        <Checkbox name="agree" checked={checked()} onCheckedChange={() => {}}>
          <Indicator>✓</Indicator>
        </Checkbox>
      </form>
    ));

    await screen.findByRole("checkbox");
    setChecked(true);

    await vi.waitFor(() => {
      expect(onFormChange).toHaveBeenCalledWith(true);
    });
  });
});

describe("given a Checkbox with a clickable ancestor inside a form", () => {
  function FormCase(props: {
    checked?: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
    onParentClick?: (event: MouseEvent) => void;
    onFormChange?: (event: Event) => void;
    onTriggerClick?: (event: MouseEvent) => void;
  }) {
    return (
      <form onChange={props.onFormChange}>
        <div onClick={props.onParentClick}>
          <Checkbox
            checked={props.checked}
            onCheckedChange={props.onCheckedChange}
            onClick={props.onTriggerClick}
          >
            <Indicator>✓</Indicator>
          </Checkbox>
        </div>
      </form>
    );
  }

  test("does not trigger the ancestor onClick when checked is updated programmatically, but notifies the form", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const [checked, setChecked] = createSignal(false);
    render(() => (
      <FormCase
        checked={checked()}
        onCheckedChange={() => {}}
        onParentClick={onParentClick}
        onFormChange={(event) => onFormChange((event.target as HTMLInputElement).checked)}
      />
    ));

    await screen.findByRole("checkbox");
    setChecked(true);

    await vi.waitFor(() => {
      expect(onFormChange).toHaveBeenCalledWith(true);
    });
    expect(onParentClick).not.toHaveBeenCalled();
  });

  test("triggers the ancestor onClick on a real user click", async () => {
    const onParentClick = vi.fn();
    const user = userEvent.setup();
    render(() => <FormCase onParentClick={onParentClick} />);

    await user.click(await screen.findByRole("checkbox"));

    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  test("does not notify the form when propagation is stopped on the trigger", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <FormCase
        onParentClick={onParentClick}
        onFormChange={onFormChange}
        onTriggerClick={(event) => event.stopPropagation()}
      />
    ));

    const checkbox = await screen.findByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(onParentClick).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onFormChange).not.toHaveBeenCalled();
  });
});

describe("Checkbox.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Checkbox
        ref={(node) => void (element = node)}
        data-testid="checkbox"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      />
    ));

    const checkbox = (await screen.findByTestId("checkbox")) as HTMLElement;
    expect(checkbox.classList.contains("custom-class")).toBe(true);
    expect(checkbox.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(checkbox);

    await user.click(checkbox);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Checkbox
        asChild
        ref={(node) => void (element = node)}
        data-testid="checkbox"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <span>checkbox</span>
      </Checkbox>
    ));

    const checkbox = (await screen.findByTestId("checkbox")) as HTMLElement;
    expect(checkbox.tagName).toBe("SPAN");
    expect(checkbox.classList.contains("custom-class")).toBe(true);
    expect(checkbox.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(checkbox);

    await user.click(checkbox);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Checkbox.Indicator", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Checkbox defaultChecked>
        <Indicator
          ref={(node) => void (element = node)}
          data-testid="indicator"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          ✓
        </Indicator>
      </Checkbox>
    ));

    const indicator = (await screen.findByTestId("indicator")) as HTMLElement;
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect(indicator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    indicator.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Checkbox defaultChecked>
        <Indicator
          asChild
          ref={(node) => void (element = node)}
          data-testid="indicator"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <i>✓</i>
        </Indicator>
      </Checkbox>
    ));

    const indicator = (await screen.findByTestId("indicator")) as HTMLElement;
    expect(indicator.tagName).toBe("I");
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect(indicator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    indicator.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Checkbox.unstable_Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <UnstableProvider defaultChecked>
        <UnstableTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <Indicator>✓</Indicator>
        </UnstableTrigger>
      </UnstableProvider>
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
      <UnstableProvider defaultChecked>
        <UnstableTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <span>
            <Indicator>✓</Indicator>
          </span>
        </UnstableTrigger>
      </UnstableProvider>
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

describe("Checkbox.unstable_BubbleInput", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLInputElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <UnstableProvider defaultChecked>
        <UnstableBubbleInput
          ref={(node) => void (element = node)}
          data-testid="bubble-input"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </UnstableProvider>
    ));

    const input = (await screen.findByTestId("bubble-input")) as HTMLElement;
    expect(input.classList.contains("custom-class")).toBe(true);
    expect(input.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(input);

    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <UnstableProvider defaultChecked>
        <UnstableBubbleInput
          asChild
          ref={(node) => void (element = node)}
          data-testid="bubble-input"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <input type="checkbox" aria-hidden="true" />
        </UnstableBubbleInput>
      </UnstableProvider>
    ));

    const input = (await screen.findByTestId("bubble-input")) as HTMLElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.classList.contains("custom-class")).toBe(true);
    expect(input.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(input);

    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });
});
