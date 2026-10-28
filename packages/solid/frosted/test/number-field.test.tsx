/**
 * Solidix-authored tests for the frosted `NumberField` port. Upstream ships no
 * test file for this component at the pinned commit, so these assert the
 * behavior observed in upstream `number-field.tsx` (spinbutton role, step
 * buttons, clamping, read-only/disabled threading).
 */
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NumberField } from "../src/components/number-field/number-field";
import { Theme } from "../src/theme.js";

// `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function Ui(props: {
  readonly value?: number | null | undefined;
  readonly defaultValue?: number | null | undefined;
  readonly onValueChange?: ((value: number | null, event: Event) => void) | undefined;
  readonly min?: number | undefined;
  readonly max?: number | undefined;
  readonly step?: number | undefined;
  readonly disabled?: boolean | undefined;
  readonly readOnly?: boolean | undefined;
}) {
  return (
    <Theme>
      <NumberField.Root
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        min={props.min}
        max={props.max}
        step={props.step}
        disabled={props.disabled}
        readOnly={props.readOnly}
      >
        {/* Upstream `Root` auto-renders the step buttons around `children`
            (`buttonLayout="trailing"` default); consumers only pass adornments
            and the input itself. */}
        <NumberField.Slot>$</NumberField.Slot>
        <NumberField.Input data-testid="input" />
      </NumberField.Root>
    </Theme>
  );
}

describe("NumberField", () => {
  it("renders a spinbutton with the default value and step buttons", async () => {
    render(() => <Ui defaultValue={5} />);
    const input = await screen.findByTestId("input");
    expect(input.getAttribute("role")).toBe("spinbutton");
    expect((input as HTMLInputElement).value).toBe("5");
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("increments and decrements through the step buttons", async () => {
    const onValueChange = vi.fn();
    render(() => <Ui defaultValue={5} onValueChange={onValueChange} />);
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    const [decrement, increment] = screen.getAllByRole("button");
    fireEvent.click(increment!);
    await flush();
    expect(input.value).toBe("6");
    fireEvent.click(decrement!);
    await flush();
    expect(input.value).toBe("5");
    expect(onValueChange).toHaveBeenCalledWith(6, expect.anything());
  });

  it("clamps steps to min and max", async () => {
    render(() => <Ui defaultValue={9} min={0} max={10} step={5} />);
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    const [, increment] = screen.getAllByRole("button");
    fireEvent.click(increment!);
    await flush();
    expect(input.value).toBe("10");
  });

  it("commits typed text and steps on arrow keys", async () => {
    render(() => <Ui defaultValue={5} />);
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    fireEvent.input(input, { target: { value: "12" } });
    await flush();
    expect(input.value).toBe("12");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await flush();
    expect(input.value).toBe("13");
  });

  it("disables the input and buttons when disabled", async () => {
    render(() => <Ui defaultValue={5} disabled />);
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    for (const button of screen.getAllByRole("button")) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("marks the input readonly when readOnly", async () => {
    render(() => <Ui defaultValue={5} readOnly />);
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });
});
