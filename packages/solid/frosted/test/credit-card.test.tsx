import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { CreditCard, useCreditCard, type CreditCardRootRef } from "../src/index";

function Card(props: {
  face?: "front" | "back" | undefined;
  defaultFace?: "front" | "back" | undefined;
  onFaceChange?: ((face: "front" | "back") => void) | undefined;
  ref?: ((handle: CreditCardRootRef | null) => void) | undefined;
  color?: string | undefined;
}) {
  return (
    <CreditCard.Root
      face={props.face}
      defaultFace={props.defaultFace}
      onFaceChange={props.onFaceChange}
      ref={props.ref}
    >
      <CreditCard.Content color={props.color}>
        <CreditCard.Front>
          <CreditCard.FrontHeader>
            <CreditCard.Brand>My Bank</CreditCard.Brand>
            <CreditCard.BrandLogo />
            <CreditCard.Logo>Logo</CreditCard.Logo>
          </CreditCard.FrontHeader>
          <CreditCard.Title>Card title</CreditCard.Title>
          <CreditCard.LastFour>4242</CreditCard.LastFour>
          <CreditCard.FrontFooter>Footer</CreditCard.FrontFooter>
        </CreditCard.Front>
        <CreditCard.Back>
          <CreditCard.BackContent>
            <CreditCard.MagStripe />
          </CreditCard.BackContent>
        </CreditCard.Back>
      </CreditCard.Content>
      <CreditCard.Trigger>Flip</CreditCard.Trigger>
    </CreditCard.Root>
  );
}

describe("CreditCard", () => {
  it("renders faces with classes, data-face, and inert back", async () => {
    render(() => <Card color="blue" />);
    await screen.findByText("My Bank");

    const content = document.querySelector(".fui-CreditCardContent") as HTMLElement;
    expect(content.getAttribute("data-face")).toBe("front");

    const front = document.querySelector(".fui-CreditCardFront") as HTMLElement;
    expect(front.hasAttribute("data-active")).toBe(true);
    expect(front.hasAttribute("inert")).toBe(false);
    expect(front.getAttribute("data-accent-color")).toBe("blue");

    const back = document.querySelector(".fui-CreditCardBack") as HTMLElement;
    expect(back.hasAttribute("data-active")).toBe(false);
    expect(back.hasAttribute("inert")).toBe(true);
    expect(back.getAttribute("data-accent-color")).toBe("blue");

    for (const cls of [
      "fui-CreditCardFrontHeader",
      "fui-CreditCardBrand",
      "fui-CreditCardLogo",
      "fui-CreditCardTitle",
      "fui-CreditCardLastFour",
      "fui-CreditCardFrontFooter",
      "fui-CreditCardBackContent",
      "fui-CreditCardMagStripe",
    ]) {
      expect(document.querySelector(`.${cls}`), cls).not.toBeNull();
    }
  });

  it("trigger toggles the face and reports changes", async () => {
    const onFaceChange = vi.fn();
    render(() => <Card onFaceChange={onFaceChange} />);
    await screen.findByText("My Bank");

    const trigger = screen.getByRole("button", { name: "Flip" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);

    expect(onFaceChange).toHaveBeenCalledWith("back");
    await vi.waitFor(() => {
      expect(document.querySelector(".fui-CreditCardContent")?.getAttribute("data-face")).toBe(
        "back",
      );
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector(".fui-CreditCardBack")?.hasAttribute("data-active")).toBe(true);
  });

  it("supports controlled face and the imperative handle", async () => {
    let handle: CreditCardRootRef | null | undefined;
    const [face, setFace] = createSignal<"front" | "back">("front");
    render(() => <Card face={face()} onFaceChange={setFace} ref={(h) => (handle = h)} />);
    await screen.findByText("My Bank");
    expect(handle).not.toBeNull();

    handle?.flip();
    await vi.waitFor(() => {
      expect(document.querySelector(".fui-CreditCardContent")?.getAttribute("data-face")).toBe(
        "back",
      );
    });
    handle?.setFace("front");
    await vi.waitFor(() => {
      expect(document.querySelector(".fui-CreditCardContent")?.getAttribute("data-face")).toBe(
        "front",
      );
    });
  });

  it("number field formats gaps, detects the brand, and notifies", async () => {
    const onChange = vi.fn();
    render(() => (
      <CreditCard.Root>
        <CreditCard.NumberField aria-label="Card number" onChange={onChange} />
        <CreditCard.Content>
          <CreditCard.Front>
            <CreditCard.BrandLogo />
          </CreditCard.Front>
        </CreditCard.Content>
      </CreditCard.Root>
    ));
    const input = (await screen.findByLabelText("Card number")) as HTMLInputElement;
    expect(input.getAttribute("spellcheck")).toBe("false");
    expect(input.getAttribute("autocomplete")).toBe("cc-number");

    fireEvent.input(input, { target: { value: "4111111111111111" } });
    expect(input.value).toBe("4111 1111 1111 1111");
    expect(onChange).toHaveBeenCalledTimes(1);

    const logo = await screen.findByRole("img", { name: "Visa" });
    expect(logo.classList.contains("fui-CreditCardBrandLogo")).toBe(true);
  });

  it("number field formats amex gaps and prefilled values", async () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.NumberField aria-label="Card number" defaultValue="378282246310005" />
      </CreditCard.Root>
    ));
    const input = (await screen.findByLabelText("Card number")) as HTMLInputElement;
    expect(input.value).toBe("3782 822463 10005");
  });

  it("expiry field formats MM/YY states", async () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.ExpiryField aria-label="Expiry" />
      </CreditCard.Root>
    ));
    const input = (await screen.findByLabelText("Expiry")) as HTMLInputElement;
    expect(input.getAttribute("placeholder")).toBe("MM/YY");

    fireEvent.input(input, { target: { value: "1225" } });
    expect(input.value).toBe("12/25");

    fireEvent.input(input, { target: { value: "1/" } });
    expect(input.value).toBe("01/");
  });

  it("cvv length follows the detected brand", async () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.NumberField aria-label="Card number" />
        <CreditCard.CVVField aria-label="CVV" />
      </CreditCard.Root>
    ));
    const cvv = (await screen.findByLabelText("CVV")) as HTMLInputElement;
    expect(cvv.getAttribute("type")).toBe("password");
    expect(cvv.getAttribute("placeholder")).toBe("000");
    expect(cvv.getAttribute("maxlength")).toBe("3");

    fireEvent.input(screen.getByLabelText("Card number"), {
      target: { value: "378282246310005" },
    });
    await vi.waitFor(() => {
      expect(cvv.getAttribute("placeholder")).toBe("0000");
    });
    expect(cvv.getAttribute("maxlength")).toBe("4");
  });

  it("brand logo override renders without detection", async () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.BrandLogo brand="mastercard" />
      </CreditCard.Root>
    ));
    const logo = await screen.findByRole("img", { name: "Mastercard" });
    expect(logo.tagName).toBe("svg");
  });

  it("fields link labels and portal errors into Errors", async () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.Fieldset>
          <CreditCard.Field invalid name="number">
            <CreditCard.FieldLabel>Card number</CreditCard.FieldLabel>
            <CreditCard.NumberField aria-label="Card number" />
            <CreditCard.FieldError>Invalid number</CreditCard.FieldError>
          </CreditCard.Field>
          <CreditCard.FieldGroup>group</CreditCard.FieldGroup>
        </CreditCard.Fieldset>
        <CreditCard.Errors />
      </CreditCard.Root>
    ));

    const label = await screen.findByText("Card number");
    expect(label.tagName).toBe("LABEL");
    expect(label.classList.contains("fui-CreditCardFieldLabel")).toBe(true);
    expect(label.getAttribute("for")).not.toBeNull();
    expect(document.querySelector(".fui-CreditCardField")).not.toBeNull();
    expect(document.querySelector(".fui-CreditCardFieldset")).not.toBeNull();
    expect(document.querySelector(".fui-CreditCardFieldGroup")).not.toBeNull();

    // Invalid errors portal into the Errors live region.
    const errors = document.querySelector(".fui-CreditCardErrors") as HTMLElement;
    expect(errors.getAttribute("aria-live")).toBe("polite");
    await vi.waitFor(() => {
      expect(errors.textContent).toContain("Invalid number");
    });
    expect(errors.querySelector(".fui-CreditCardFieldError")).not.toBeNull();
  });

  it("field errors render inline without an Errors part", async () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.Field invalid>
          <CreditCard.FieldError>Invalid</CreditCard.FieldError>
        </CreditCard.Field>
      </CreditCard.Root>
    ));
    const error = await screen.findByText("Invalid");
    expect(error.closest(".fui-CreditCardField")).not.toBeNull();
  });

  it("textfield renders a raw input with card classes", () => {
    render(() => (
      <CreditCard.Root>
        <CreditCard.TextField aria-label="Name" />
      </CreditCard.Root>
    ));
    const input = document.querySelector(".fui-CreditCardTextField") as HTMLInputElement;
    expect(input.classList.contains("fui-TextFieldInput")).toBe(true);
    expect(input.getAttribute("spellcheck")).toBe("false");
  });

  it("exposes face and brand through useCreditCard", async () => {
    const Probe = () => {
      const { face, cardType, cardNiceType } = useCreditCard();
      return <div data-testid="probe">{`${face()}/${cardType()}/${cardNiceType()}`}</div>;
    };
    render(() => (
      <CreditCard.Root>
        <Probe />
        <CreditCard.NumberField aria-label="Card number" />
      </CreditCard.Root>
    ));
    const probe = await screen.findByTestId("probe");
    expect(probe.textContent).toBe("front/null/null");

    fireEvent.input(screen.getByLabelText("Card number"), {
      target: { value: "4111111111111111" },
    });
    await vi.waitFor(() => {
      expect(probe.textContent).toBe("front/visa/Visa");
    });
  });

  it("throws outside Root", () => {
    expect(() => render(() => <CreditCard.Front />)).toThrow(
      "CreditCard compound components must be used within a CreditCard.Root",
    );
  });
});
