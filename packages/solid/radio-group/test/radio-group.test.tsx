import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator as Indicator,
  unstable_RadioGroupItemBubbleInput as UnstableItemBubbleInput,
  unstable_RadioGroupItemProvider as UnstableItemProvider,
  unstable_RadioGroupItemTrigger as UnstableItemTrigger,
  type RadioGroupProps,
} from "../src/index";

const VALUES = ["1", "2", "3"];
const LABELS: Record<string, string> = { "1": "cat", "2": "dog", "3": "rabbit" };

function ClassicRadioGroup(props: RadioGroupProps) {
  return (
    <RadioGroup aria-label="pets" {...props}>
      {VALUES.map((value) => (
        <RadioGroupItem value={value} aria-label={LABELS[value]}>
          <Indicator data-testid={`radio-indicator-${value}`} />
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}

function ComposableRadioGroup(props: RadioGroupProps) {
  return (
    <RadioGroup aria-label="pets" {...props}>
      {VALUES.map((value) => (
        <UnstableItemProvider value={value}>
          <UnstableItemTrigger aria-label={LABELS[value]}>
            <Indicator data-testid={`radio-indicator-${value}`} />
          </UnstableItemTrigger>
          <UnstableItemBubbleInput />
        </UnstableItemProvider>
      ))}
    </RadioGroup>
  );
}

describe("given a default RadioGroup", () => {
  test("renders all items unchecked", async () => {
    render(() => <ClassicRadioGroup />);

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.getAttribute("aria-checked")).toBe("false");
    }
    expect(screen.queryByTestId("radio-indicator-1")).toBeNull();
  });

  test("checks an item and shows its indicator when clicked, and moves selection", async () => {
    const user = userEvent.setup();
    render(() => <ClassicRadioGroup />);
    const radios = screen.getAllByRole("radio");

    await user.click(radios[0]!);
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");
    expect(radios[0]!.getAttribute("data-state")).toBe("checked");
    expect(await screen.findByTestId("radio-indicator-1")).toBeDefined();

    await user.click(radios[1]!);
    expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
    expect(radios[0]!.getAttribute("aria-checked")).toBe("false");
    await vi.waitFor(() => {
      expect(screen.queryByTestId("radio-indicator-1")).toBeNull();
    });
  });

  test("does not uncheck an item when clicked again", async () => {
    const user = userEvent.setup();
    render(() => <ClassicRadioGroup />);
    const radios = screen.getAllByRole("radio");

    await user.click(radios[0]!);
    await user.click(radios[0]!);

    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("given a RadioGroup with defaultValue", () => {
  test("renders the matching item checked", async () => {
    render(() => <ClassicRadioGroup defaultValue="2" />);

    const radios = screen.getAllByRole("radio");
    expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
    expect(await screen.findByTestId("radio-indicator-2")).toBeDefined();
  });
});

describe("given a disabled RadioGroup", () => {
  test("does not check an item when clicked", async () => {
    const user = userEvent.setup();
    render(() => <ClassicRadioGroup disabled />);
    const radios = screen.getAllByRole("radio");

    await user.click(radios[0]!);

    expect(radios[0]!.getAttribute("aria-checked")).toBe("false");
  });
});

describe("given a RadioGroup with a disabled item", () => {
  test("skips the disabled item but checks an enabled one", async () => {
    const user = userEvent.setup();
    render(() => (
      <RadioGroup aria-label="pets">
        <RadioGroupItem value="1" aria-label="cat" disabled>
          <Indicator />
        </RadioGroupItem>
        <RadioGroupItem value="2" aria-label="dog">
          <Indicator />
        </RadioGroupItem>
      </RadioGroup>
    ));
    const radios = screen.getAllByRole("radio");

    await user.click(radios[0]!);
    expect(radios[0]!.getAttribute("aria-checked")).toBe("false");

    await user.click(radios[1]!);
    expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("given a controlled RadioGroup", () => {
  test("calls onValueChange and does not change selection unless state updates", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(() => <ClassicRadioGroup value="1" onValueChange={onValueChange} />);
    const radios = screen.getAllByRole("radio");

    await user.click(radios[1]!);

    expect(onValueChange).toHaveBeenCalledWith("2");
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");
    expect(radios[1]!.getAttribute("aria-checked")).toBe("false");
  });

  test("unchecks every item when value becomes null and allows reselecting", async () => {
    const user = userEvent.setup();
    const [value, setValue] = createSignal<string | null>("1");
    render(() => <ClassicRadioGroup value={value()} onValueChange={setValue} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");

    setValue(null);
    await vi.waitFor(() => {
      expect(screen.getAllByRole("radio")[0]!.getAttribute("aria-checked")).toBe("false");
    });
    expect(screen.queryByTestId("radio-indicator-1")).toBeNull();

    await user.click(screen.getAllByRole("radio")[2]!);
    expect(screen.getAllByRole("radio")[2]!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("keyboard navigation", () => {
  test("checks an item that receives focus while an arrow key is pressed", async () => {
    render(() => <ClassicRadioGroup />);
    const radios = screen.getAllByRole("radio") as HTMLElement[];

    radios[0]!.focus();
    // `RovingFocusGroup` moves focus to the next item on arrow keys; once an
    // item is focused during arrow navigation it should also become checked.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    radios[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    radios[1]!.focus();
    document.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

    await vi.waitFor(() => {
      expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
    });
    expect(await screen.findByTestId("radio-indicator-2")).toBeDefined();
  });

  test("does not check an item that receives focus without arrow navigation", async () => {
    render(() => <ClassicRadioGroup />);
    const radios = screen.getAllByRole("radio") as HTMLElement[];

    radios[1]!.focus();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(radios[1]!.getAttribute("aria-checked")).toBe("false");
  });

  test("does not check an item on Enter key", async () => {
    render(() => <ClassicRadioGroup />);
    const radios = screen.getAllByRole("radio") as HTMLElement[];

    radios[0]!.focus();
    radios[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(radios[0]!.getAttribute("aria-checked")).toBe("false");
  });

  test("calls a consumer onKeyDown handler passed to an item", async () => {
    const onKeyDown = vi.fn();
    render(() => (
      <RadioGroup aria-label="pets">
        {VALUES.map((value) => (
          <RadioGroupItem value={value} aria-label={LABELS[value]} onKeyDown={onKeyDown}>
            <Indicator />
          </RadioGroupItem>
        ))}
      </RadioGroup>
    ));

    const radios = screen.getAllByRole("radio");
    radios[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onKeyDown).toHaveBeenCalled();
  });
});

describe("given an uncontrolled RadioGroup in a form", () => {
  test("bubbles a change event with the selected value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <form onChange={(event) => onChange((event.target as HTMLInputElement).value)}>
        <ClassicRadioGroup name="pet" />
      </form>
    ));

    await user.click(screen.getAllByRole("radio")[1]!);

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("2");
    });
  });

  test("does not trigger a clickable ancestor onClick when the value is set programmatically", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const [value, setValue] = createSignal<string | null>(null);
    render(() => (
      <form onChange={(event) => onFormChange((event.target as HTMLInputElement).value)}>
        <div onClick={onParentClick}>
          <ClassicRadioGroup name="pet" value={value()} onValueChange={() => {}} />
        </div>
      </form>
    ));

    await screen.findAllByRole("radio");
    setValue("2");

    await vi.waitFor(() => {
      expect(onFormChange).toHaveBeenCalledWith("2");
    });
    expect(onParentClick).not.toHaveBeenCalled();
  });

  test("triggers a clickable ancestor onClick on a real user click", async () => {
    const onParentClick = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <form>
        <div onClick={onParentClick}>
          <ClassicRadioGroup name="pet" />
        </div>
      </form>
    ));

    await user.click(screen.getAllByRole("radio")[0]!);

    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  test("does not notify the form when propagation is stopped on the trigger", async () => {
    const onParentClick = vi.fn();
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <form onChange={onFormChange}>
        <div onClick={onParentClick}>
          <RadioGroup aria-label="pets" name="pet">
            {VALUES.map((value) => (
              <RadioGroupItem
                value={value}
                aria-label={LABELS[value]}
                onClick={(event) => event.stopPropagation()}
              >
                <Indicator />
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
      </form>
    ));

    await user.click(screen.getAllByRole("radio")[0]!);

    expect(onParentClick).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onFormChange).not.toHaveBeenCalled();
  });

  test("exposes the group as required for native validation", async () => {
    const user = userEvent.setup();
    let form!: HTMLFormElement;
    render(() => (
      <form
        ref={(element) => {
          form = element;
        }}
      >
        <ClassicRadioGroup name="pet" required />
      </form>
    ));

    expect(form.checkValidity()).toBe(false);

    await user.click(screen.getAllByRole("radio")[0]!);

    expect(form.checkValidity()).toBe(true);
  });
});

describe("given a RadioGroup in a form that is reset", () => {
  test("uncontrolled restores its defaultValue selection when the form is reset", async () => {
    const user = userEvent.setup();
    let form!: HTMLFormElement;
    render(() => (
      <form
        ref={(element) => {
          form = element;
        }}
      >
        <ClassicRadioGroup name="pet" defaultValue="2" />
      </form>
    ));

    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]!);
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");

    form.reset();
    await vi.waitFor(() => {
      expect(screen.getAllByRole("radio")[1]!.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("controlled restores its initial value selection when the form is reset", async () => {
    const user = userEvent.setup();
    let form!: HTMLFormElement;
    const [value, setValue] = createSignal<string | null>("3");
    render(() => (
      <form
        ref={(element) => {
          form = element;
        }}
      >
        <ClassicRadioGroup name="pet" value={value()} onValueChange={setValue} />
      </form>
    ));

    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]!);
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");

    form.reset();
    await vi.waitFor(() => {
      expect(screen.getAllByRole("radio")[2]!.getAttribute("aria-checked")).toBe("true");
    });
  });
});

describe("given a RadioGroup with external form association that is reset", () => {
  test("restores its defaultValue selection when the external form is reset", async () => {
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
        <ClassicRadioGroup name="pet" form="settings" defaultValue="2" />
      </>
    ));

    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]!);
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");

    form.reset();
    await vi.waitFor(() => {
      expect(screen.getAllByRole("radio")[1]!.getAttribute("aria-checked")).toBe("true");
    });
  });
});

describe("given a composable RadioGroup in a form", () => {
  test("bubbles a change event with the selected value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <form onChange={(event) => onChange((event.target as HTMLInputElement).value)}>
        <ComposableRadioGroup name="pet" />
      </form>
    ));

    await user.click(screen.getAllByRole("radio")[1]!);

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("2");
    });
  });

  test("does not bubble to the form when propagation is stopped on the trigger", async () => {
    const onFormChange = vi.fn();
    const user = userEvent.setup();
    render(() => (
      <form onChange={onFormChange}>
        <RadioGroup aria-label="pets" name="pet">
          {VALUES.map((value) => (
            <UnstableItemProvider value={value}>
              <UnstableItemTrigger
                aria-label={LABELS[value]}
                onClick={(event) => event.stopPropagation()}
              >
                <Indicator />
              </UnstableItemTrigger>
              <UnstableItemBubbleInput />
            </UnstableItemProvider>
          ))}
        </RadioGroup>
      </form>
    ));

    await user.click(screen.getAllByRole("radio")[0]!);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onFormChange).not.toHaveBeenCalled();
  });
});

describe("RadioGroup.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <RadioGroup
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
      <RadioGroup
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>group</article>
      </RadioGroup>
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

describe("RadioGroup.Item", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <RadioGroup aria-label="pets">
        <RadioGroupItem
          value="1"
          ref={(node) => void (element = node)}
          data-testid="item"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <Indicator />
        </RadioGroupItem>
      </RadioGroup>
    ));

    const item = (await screen.findByTestId("item")) as HTMLElement;
    expect(item.classList.contains("custom-class")).toBe(true);
    expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    await user.click(item);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <RadioGroup aria-label="pets" defaultValue="1">
        <RadioGroupItem
          value="1"
          asChild
          ref={(node) => void (element = node)}
          data-testid="item"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <span>cat</span>
        </RadioGroupItem>
      </RadioGroup>
    ));

    const item = (await screen.findByTestId("item")) as HTMLElement;
    expect(item.tagName).toBe("SPAN");
    expect(item.getAttribute("role")).toBe("radio");
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    await user.click(item);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("RadioGroup.Indicator", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <RadioGroup aria-label="pets" defaultValue="1">
        <RadioGroupItem value="1">
          <Indicator
            ref={(node) => void (element = node)}
            data-testid="indicator"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </RadioGroupItem>
      </RadioGroup>
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
      <RadioGroup aria-label="pets" defaultValue="1">
        <RadioGroupItem value="1">
          <Indicator
            asChild
            ref={(node) => void (element = node)}
            data-testid="indicator"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <i>dot</i>
          </Indicator>
        </RadioGroupItem>
      </RadioGroup>
    ));

    const indicator = (await screen.findByTestId("indicator")) as HTMLElement;
    expect(indicator.tagName).toBe("I");
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect(indicator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    await user.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });
});
