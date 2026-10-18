import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import {
  OneTimePasswordField,
  OneTimePasswordFieldHiddenInput,
  OneTimePasswordFieldInput,
} from "../src/index";

describe("given a default OneTimePasswordField", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    render(() => (
      <OneTimePasswordField>
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldHiddenInput name="code" />
      </OneTimePasswordField>
    ));
  });

  // NOTE: Radix also asserts `axe` cleanliness here; Solidix has no axe harness
  // yet (Phase 6), so that assertion has no port.

  test("should mask input value when type is password", async () => {
    const { container } = render(() => (
      <OneTimePasswordField type="password">
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldHiddenInput name="code" />
      </OneTimePasswordField>
    ));

    const input = container.querySelector('input:not([type="hidden"])') as HTMLInputElement;

    await user.click(input);
    await user.keyboard("1");
    expect(input.type).toBe("password");

    const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hiddenInput.value).toBe("1");
  });

  test("should disable all inputs when Root is disabled", () => {
    const { container } = render(() => (
      <OneTimePasswordField disabled>
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldHiddenInput name="code" />
      </OneTimePasswordField>
    ));

    const inputs = container.querySelectorAll('input:not([type="hidden"])');
    inputs.forEach((input) => {
      expect((input as HTMLInputElement).disabled).toBe(true);
    });
  });

  test("should type digits and advance focus", async () => {
    const inputs = screen.getAllByRole("textbox", {
      hidden: false,
    }) as HTMLInputElement[];
    await user.click(inputs[0]!);
    await user.keyboard("1");
    expect(inputs[0]!.value).toBe("1");
    // focus should have moved to second input
    expect(document.activeElement).toBe(inputs[1]);
    await user.keyboard("2");
    expect(inputs[1]!.value).toBe("2");
    expect(document.activeElement).toBe(inputs[2]);
  });

  test("should navigate with arrow keys", async () => {
    const inputs = screen.getAllByRole("textbox", {
      hidden: false,
    }) as HTMLInputElement[];
    await user.click(inputs[0]!);
    await user.keyboard("1");
    // now on input 1
    expect(document.activeElement).toBe(inputs[1]);
    await user.keyboard("{ArrowLeft}");
    // roving focus moves in a `setTimeout`
    await vi.waitFor(() => expect(document.activeElement).toBe(inputs[0]));
    await user.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(inputs[1]));
  });

  test("pastes the code into the input", async () => {
    const inputs = screen.getAllByRole("textbox", {
      hidden: false,
    }) as HTMLInputElement[];
    const firstInput = inputs[0]!;
    await user.click(firstInput);
    await user.paste("1,2,3,4,5,6");
    expect(getInputValues(inputs)).toBe("1,2,3,4,5,6");
  });

  test("should truncate pasted characters to the number of inputs", async () => {
    const inputs = screen.getAllByRole("textbox", {
      hidden: false,
    }) as HTMLInputElement[];
    const firstInput = inputs[0]!;
    await user.click(firstInput);
    await user.paste("123456789");
    expect(getInputValues(inputs)).toBe("1,2,3,4,5,6");
  });
});

function getInputValues(inputs: HTMLInputElement[]) {
  return inputs.map((input) => input.value).join(",");
}

describe("OneTimePasswordField.Root", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <OneTimePasswordField
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <OneTimePasswordFieldInput />
      </OneTimePasswordField>
    ));

    const root = screen.getByTestId("root") as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <OneTimePasswordField
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <OneTimePasswordFieldInput />
        </article>
      </OneTimePasswordField>
    ));

    const root = screen.getByTestId("root") as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    // The root's own `role` has to land on the slotted element too.
    expect(root.getAttribute("role")).toBe("group");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("OneTimePasswordField.Input", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <OneTimePasswordField defaultValue="1">
        <OneTimePasswordFieldInput
          ref={(node) => void (element = node)}
          data-testid="input"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </OneTimePasswordField>
    ));

    const input = screen.getByTestId("input") as HTMLElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.classList.contains("custom-class")).toBe(true);
    expect(input.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(input);

    fireEvent.click(input);
    expect(onClick).toHaveBeenCalled();
  });

  // The part renders an `input`, so the slotted element is an `input` with no
  // children.
  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <OneTimePasswordField defaultValue="1">
        <OneTimePasswordFieldInput
          asChild
          ref={(node) => void (element = node)}
          data-testid="input"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <input />
        </OneTimePasswordFieldInput>
      </OneTimePasswordField>
    ));

    const input = (await screen.findByTestId("input")) as HTMLElement;
    expect(input.tagName).toBe("INPUT");
    // The attributes the part sets itself have to reach the slotted element,
    // including the ones the roving focus group and the collection contribute.
    // The index resolves after mount (collection registration), so wait for it.
    expect(input.getAttribute("data-radix-otp-input")).toBe("");
    await vi.waitFor(() => expect(input.getAttribute("data-radix-index")).toBe("0"));
    expect(input.classList.contains("custom-class")).toBe(true);
    expect(input.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(input);

    fireEvent.click(input);
    expect(onClick).toHaveBeenCalled();
  });
});

// `HiddenInput` renders a plain `input`, not a `Primitive`, so it has no
// `asChild` prop and there is no slotted variant to test. It is also always
// `type="hidden"`, which a real browser never dispatches a click to, so the
// click assertion is left out rather than faked.
describe("OneTimePasswordField.HiddenInput", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;

    render(() => (
      <OneTimePasswordField defaultValue="1" name="code">
        <OneTimePasswordFieldInput />
        <OneTimePasswordFieldHiddenInput
          ref={(node) => void (element = node)}
          data-testid="hidden-input"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
        />
      </OneTimePasswordField>
    ));

    const hiddenInput = screen.getByTestId("hidden-input") as HTMLElement;
    expect(hiddenInput.tagName).toBe("INPUT");
    expect(hiddenInput.getAttribute("type")).toBe("hidden");
    expect(hiddenInput.getAttribute("name")).toBe("code");
    expect(hiddenInput.classList.contains("custom-class")).toBe(true);
    expect(hiddenInput.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(hiddenInput);
  });
});
