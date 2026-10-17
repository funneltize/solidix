import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {
  Switch,
  SwitchThumb as Thumb,
  unstable_SwitchBubbleInput as UnstableBubbleInput,
  unstable_SwitchProvider as UnstableProvider,
  unstable_SwitchTrigger as UnstableTrigger,
} from "../src/index";

describe("given a default Switch", () => {
  test("toggles checked state when clicked", async () => {
    const user = userEvent.setup();
    render(() => (
      <Switch data-testid="switch">
        <Thumb data-testid="thumb" />
      </Switch>
    ));

    const switchControl = await screen.findByRole("switch");
    const thumb = await screen.findByTestId("thumb");
    expect(switchControl.getAttribute("aria-checked")).toBe("false");
    expect(switchControl.getAttribute("data-state")).toBe("unchecked");
    expect(thumb.getAttribute("data-state")).toBe("unchecked");

    await user.click(switchControl);

    expect(switchControl.getAttribute("aria-checked")).toBe("true");
    expect(switchControl.getAttribute("data-state")).toBe("checked");
    expect(thumb.getAttribute("data-state")).toBe("checked");
  });

  test("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(() => <Switch disabled>notifications</Switch>);

    const switchControl = await screen.findByRole("switch");
    expect(switchControl.hasAttribute("disabled")).toBe(true);

    await user.click(switchControl);

    expect(switchControl.getAttribute("aria-checked")).toBe("false");
  });

  test("calls onCheckedChange and stays controlled when checked is provided", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <Switch checked={false} onCheckedChange={onCheckedChange}>
        notifications
      </Switch>
    ));

    const switchControl = await screen.findByRole("switch");
    await user.click(switchControl);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(switchControl.getAttribute("aria-checked")).toBe("false");
  });
});

describe("given a Switch in a form", () => {
  test("uncontrolled restores its defaultChecked value when the form is reset", async () => {
    const user = userEvent.setup();
    let form!: HTMLFormElement;
    render(() => (
      <form
        ref={(element) => {
          form = element;
        }}
      >
        <Switch name="notifications" defaultChecked>
          <Thumb />
        </Switch>
      </form>
    ));

    const switchControl = await screen.findByRole("switch");
    expect(switchControl.getAttribute("aria-checked")).toBe("true");

    await user.click(switchControl);
    expect(switchControl.getAttribute("aria-checked")).toBe("false");

    form.reset();
    await vi.waitFor(() => {
      expect(switchControl.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("controlled restores its initial checked value when the form is reset", async () => {
    const user = userEvent.setup();
    let form!: HTMLFormElement;
    const [checked, setChecked] = createSignal(true);
    render(() => (
      <form
        ref={(element) => {
          form = element;
        }}
      >
        <Switch name="notifications" checked={checked()} onCheckedChange={setChecked}>
          <Thumb />
        </Switch>
      </form>
    ));

    const switchControl = await screen.findByRole("switch");
    expect(switchControl.getAttribute("aria-checked")).toBe("true");

    await user.click(switchControl);
    expect(switchControl.getAttribute("aria-checked")).toBe("false");

    form.reset();
    await vi.waitFor(() => {
      expect(switchControl.getAttribute("aria-checked")).toBe("true");
    });
  });
});

describe("given a Switch with external form association", () => {
  test("restores its value when the external form is reset", async () => {
    const user = userEvent.setup();
    let form!: HTMLFormElement;
    render(() => (
      <>
        <form
          id="settings"
          ref={(element) => {
            form = element;
          }}
        />
        <Switch name="notifications" form="settings" defaultChecked>
          <Thumb />
        </Switch>
      </>
    ));

    const switchControl = await screen.findByRole("switch");
    await user.click(switchControl);
    expect(switchControl.getAttribute("aria-checked")).toBe("false");

    form.reset();
    await vi.waitFor(() => {
      expect(switchControl.getAttribute("aria-checked")).toBe("true");
    });
  });
});

describe("given a Switch with a clickable ancestor inside a form", () => {
  function FormCase(props: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onParentClick?: (event: MouseEvent) => void;
    onFormChange?: (event: Event) => void;
    onTriggerClick?: (event: MouseEvent) => void;
  }) {
    return (
      <form
        onChange={(event) =>
          props.onFormChange?.(event) ?? (event.target as HTMLInputElement).checked
        }
      >
        <div onClick={props.onParentClick}>
          <Switch
            checked={props.checked}
            onCheckedChange={props.onCheckedChange}
            onClick={props.onTriggerClick}
          >
            <Thumb />
          </Switch>
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

    await screen.findByRole("switch");
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

    await user.click(await screen.findByRole("switch"));

    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  test("triggers the ancestor onClick for a user click that the controlled parent ignores, without notifying the form", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <FormCase
        checked={false}
        onCheckedChange={() => {}}
        onParentClick={onParentClick}
        onFormChange={onFormChange}
      />
    ));

    const switchControl = await screen.findByRole("switch");
    await user.click(switchControl);

    expect(switchControl.getAttribute("aria-checked")).toBe("false");
    expect(onParentClick).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onFormChange).not.toHaveBeenCalled();
  });

  test("triggers the ancestor onClick once and notifies the form when the controlled parent applies checked after a timeout", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    const [checked, setChecked] = createSignal(false);
    render(() => (
      <FormCase
        checked={checked()}
        onCheckedChange={(next) => {
          setTimeout(() => setChecked(next));
        }}
        onParentClick={onParentClick}
        onFormChange={(event) => onFormChange((event.target as HTMLInputElement).checked)}
      />
    ));

    await user.click(await screen.findByRole("switch"));
    await vi.waitFor(() => {
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    });

    expect(onParentClick).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledWith(true);
  });

  test("does not notify the form when propagation is stopped on the trigger and the controlled parent applies checked later", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    const [checked, setChecked] = createSignal(false);
    render(() => (
      <FormCase
        checked={checked()}
        onCheckedChange={(next) => {
          setTimeout(() => setChecked(next));
        }}
        onParentClick={onParentClick}
        onFormChange={onFormChange}
        onTriggerClick={(event) => event.stopPropagation()}
      />
    ));

    await user.click(await screen.findByRole("switch"));
    await vi.waitFor(() => {
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    });

    expect(onParentClick).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onFormChange).not.toHaveBeenCalled();
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

    const switchControl = await screen.findByRole("switch");
    await user.click(switchControl);

    expect(switchControl.getAttribute("aria-checked")).toBe("true");
    expect(onParentClick).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onFormChange).not.toHaveBeenCalled();
  });
});

describe("Switch.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Switch
        ref={(node) => void (element = node)}
        data-testid="switch"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      />
    ));

    const switchControl = (await screen.findByTestId("switch")) as HTMLElement;
    expect(switchControl.classList.contains("custom-class")).toBe(true);
    expect(switchControl.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(switchControl);

    await user.click(switchControl);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Switch
        asChild
        ref={(node) => void (element = node)}
        data-testid="switch"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <span>switch</span>
      </Switch>
    ));

    const switchControl = (await screen.findByTestId("switch")) as HTMLElement;
    expect(switchControl.tagName).toBe("SPAN");
    expect(switchControl.classList.contains("custom-class")).toBe(true);
    expect(switchControl.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(switchControl);

    await user.click(switchControl);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Switch.unstable_Trigger", () => {
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
          <Thumb />
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
            <Thumb />
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

describe("Switch.unstable_BubbleInput", () => {
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

    // The input is visually hidden, so a real user never clicks it. The part
    // composes `onClick` to swallow the synthetic clicks it dispatches at
    // forms, and that composition is exactly where a consumer's handler could
    // get dropped.
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

describe("Switch.Thumb", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Switch>
        <Thumb
          ref={(node) => void (element = node)}
          data-testid="thumb"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Switch>
    ));

    const thumb = (await screen.findByTestId("thumb")) as HTMLElement;
    expect(thumb.classList.contains("custom-class")).toBe(true);
    expect(thumb.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(thumb);

    await user.click(thumb);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Switch>
        <Thumb
          asChild
          ref={(node) => void (element = node)}
          data-testid="thumb"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <i>thumb</i>
        </Thumb>
      </Switch>
    ));

    const thumb = (await screen.findByTestId("thumb")) as HTMLElement;
    expect(thumb.tagName).toBe("I");
    expect(thumb.classList.contains("custom-class")).toBe(true);
    expect(thumb.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(thumb);

    await user.click(thumb);
    expect(onClick).toHaveBeenCalled();
  });
});
