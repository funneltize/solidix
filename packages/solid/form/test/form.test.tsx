import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormSubmit,
  FormValidityState,
} from "../src/index";

describe("Form", () => {
  afterEach(cleanup);
  // NOTE: Radix also asserts `axe` cleanliness here (field wiring and
  // explicit wiring); Solidix has no axe harness yet (Phase 6), so those
  // assertions have no port.

  describe("given components used within `Form.Field`", () => {
    test("should wire up the label, control and message via context", () => {
      render(() => (
        <Form>
          <FormField name="email">
            <FormLabel>Email</FormLabel>
            <FormControl type="email" required />
          </FormField>
        </Form>
      ));

      const control = screen.getByLabelText("Email") as HTMLElement;
      expect(control.getAttribute("name")).toBe("email");
      // the control gets an auto-generated id that the label points at
      expect(control.id).toBeTruthy();
    });
  });

  describe("given components used outside `Form.Field` (explicit wiring)", () => {
    test("should associate a `Form.Label` with a `Form.Control` via `name`/`htmlFor`/`id`", () => {
      render(() => (
        <Form>
          <FormLabel name="email" htmlFor="email">
            Email
          </FormLabel>
          <FormControl name="email" id="email" type="email" />
        </Form>
      ));

      const control = screen.getByLabelText("Email") as HTMLElement;
      expect(control.getAttribute("id")).toBe("email");
      expect(control.getAttribute("name")).toBe("email");
    });

    // https://github.com/radix-ui/primitives/issues/2279
    test("should render a `Form.Message` outside `Form.Field` and toggle it based on validity", async () => {
      render(() => (
        <Form>
          <FormMessage match="valueMissing" name="email">
            Please enter your email address.
          </FormMessage>
          <FormField name="email">
            <FormControl type="email" required />
          </FormField>
        </Form>
      ));

      // the message is hidden until the control reports an error
      expect(screen.queryByText("Please enter your email address.")).toBe(null);

      const control = screen.getByRole("textbox");
      fireEvent.invalid(control);
      flush();

      expect(await screen.findByText("Please enter your email address.")).toBeTruthy();
    });

    test("should describe the control via `aria-describedby` when a message matches", async () => {
      render(() => (
        <Form>
          <FormControl name="email" id="email" type="email" required />
          <FormMessage match="valueMissing" name="email">
            Please enter your email address.
          </FormMessage>
        </Form>
      ));

      const control = screen.getByRole("textbox") as HTMLElement;
      fireEvent.invalid(control);
      flush();

      const message = (await screen.findByText("Please enter your email address.")) as HTMLElement;
      await vi.waitFor(() =>
        expect(control.getAttribute("aria-describedby")).toContain(message.id),
      );
    });

    // Regression test for https://github.com/radix-ui/primitives/issues/2598
    test("should normalize existing aria-describedby ids and append a matching message id", async () => {
      render(() => (
        <Form>
          <FormControl
            aria-describedby={" existing-description\texisting-description shared-description "}
            name="email"
            id="email"
            type="email"
            required
          />
          <FormMessage match="valueMissing" name="email">
            Please enter your email address.
          </FormMessage>
          <span id="existing-description">Existing description</span>
          <span id="shared-description">Shared description</span>
        </Form>
      ));

      const control = screen.getByRole("textbox") as HTMLElement;
      expect(control.getAttribute("aria-describedby")).toBe(
        "existing-description shared-description",
      );

      fireEvent.invalid(control);
      flush();

      const message = (await screen.findByText("Please enter your email address.")) as HTMLElement;
      await vi.waitFor(() =>
        expect(control.getAttribute("aria-describedby")).toBe(
          `existing-description shared-description ${message.id}`,
        ),
      );
    });

    test("should expose validity through `Form.ValidityState` via `name`", async () => {
      render(() => (
        <Form>
          <FormControl name="email" id="email" type="email" required />
          <FormValidityState name="email">
            {(validity) => (
              <span data-testid="validity">{validity?.valueMissing ? "missing" : "ok"}</span>
            )}
          </FormValidityState>
        </Form>
      ));

      expect(screen.getByTestId("validity").textContent).toBe("ok");

      const control = screen.getByRole("textbox");
      fireEvent.invalid(control);
      flush();

      await vi.waitFor(() => expect(screen.getByTestId("validity").textContent).toBe("missing"));
    });
  });

  describe("given a required prop is missing", () => {
    test("should throw when `Form.Control` has no `name`", () => {
      expect(() =>
        render(() => (
          <Form>
            <FormControl id="email" />
          </Form>
        )),
      ).toThrow(/`FormControl` must be used within `FormField` or specify the `name` prop/);
    });

    test("should throw when `Form.Control` has a `name` but no `id`", () => {
      expect(() =>
        render(() => (
          <Form>
            <FormControl name="email" />
          </Form>
        )),
      ).toThrow(/`FormControl` must be used within `FormField` or specify the `id` prop/);
    });

    test("should throw when `Form.Label` has no `name`", () => {
      expect(() =>
        render(() => (
          <Form>
            <FormLabel htmlFor="email">Email</FormLabel>
          </Form>
        )),
      ).toThrow(/`FormLabel` must be used within `FormField` or specify the `name` prop/);
    });

    test("should throw when `Form.Label` has a `name` but no `htmlFor`", () => {
      expect(() =>
        render(() => (
          <Form>
            <FormLabel name="email">Email</FormLabel>
          </Form>
        )),
      ).toThrow(/`FormLabel` must be used within `FormField` or specify the `htmlFor` prop/);
    });

    test("should throw when `Form.Message` has no `name`", () => {
      expect(() =>
        render(() => (
          <Form>
            <FormMessage match="valueMissing">Required</FormMessage>
          </Form>
        )),
      ).toThrow(/`FormMessage` must be used within `FormField` or specify the `name` prop/);
    });

    test("should throw when `Form.ValidityState` has no `name`", () => {
      expect(() =>
        render(() => (
          <Form>
            <FormValidityState>{() => null}</FormValidityState>
          </Form>
        )),
      ).toThrow(/`FormValidityState` must be used within `FormField` or specify the `name` prop/);
    });
  });
});

describe("Form.Root", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form
        ref={(node) => void (element = node)}
        data-testid="form"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        Form
      </Form>
    ));

    const form = screen.getByTestId("form") as HTMLElement;
    expect(form.tagName).toBe("FORM");
    expect(form.classList.contains("custom-class")).toBe(true);
    expect(form.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(form);

    fireEvent.click(form);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form
        asChild
        ref={(node) => void (element = node)}
        data-testid="form"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>Form</article>
      </Form>
    ));

    const form = screen.getByTestId("form") as HTMLElement;
    expect(form.tagName).toBe("ARTICLE");
    expect(form.classList.contains("custom-class")).toBe(true);
    expect(form.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(form);

    fireEvent.click(form);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Field", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField
          name="email"
          ref={(node) => void (element = node)}
          data-testid="field"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Field
        </FormField>
      </Form>
    ));

    const field = screen.getByTestId("field") as HTMLElement;
    expect(field.tagName).toBe("DIV");
    expect(field.classList.contains("custom-class")).toBe(true);
    expect(field.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(field);

    fireEvent.click(field);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField
          name="email"
          serverInvalid
          asChild
          ref={(node) => void (element = node)}
          data-testid="field"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Field</article>
        </FormField>
      </Form>
    ));

    const field = screen.getByTestId("field") as HTMLElement;
    expect(field.tagName).toBe("ARTICLE");
    expect(field.getAttribute("data-invalid")).toBe("true");
    expect(field.classList.contains("custom-class")).toBe(true);
    expect(field.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(field);

    fireEvent.click(field);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Label", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormLabel
            ref={(node) => void (element = node)}
            data-testid="label"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Email
          </FormLabel>
        </FormField>
      </Form>
    ));

    const label = screen.getByTestId("label") as HTMLElement;
    expect(label.tagName).toBe("LABEL");
    expect(label.classList.contains("custom-class")).toBe(true);
    expect(label.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(label);

    fireEvent.click(label);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormLabel
            asChild
            ref={(node) => void (element = node)}
            data-testid="label"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Email</article>
          </FormLabel>
        </FormField>
      </Form>
    ));

    const label = screen.getByTestId("label") as HTMLElement;
    expect(label.tagName).toBe("ARTICLE");
    expect(label.hasAttribute("for")).toBe(true);
    expect(label.classList.contains("custom-class")).toBe(true);
    expect(label.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(label);

    fireEvent.click(label);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Control", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl
            ref={(node) => void (element = node)}
            data-testid="control"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </FormField>
      </Form>
    ));

    const control = screen.getByTestId("control") as HTMLElement;
    expect(control.tagName).toBe("INPUT");
    expect(control.classList.contains("custom-class")).toBe(true);
    expect(control.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(control);

    fireEvent.click(control);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl
            asChild
            ref={(node) => void (element = node)}
            data-testid="control"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <input />
          </FormControl>
        </FormField>
      </Form>
    ));

    const control = screen.getByTestId("control") as HTMLElement;
    expect(control.tagName).toBe("INPUT");
    expect(control.getAttribute("name")).toBe("email");
    expect(control.hasAttribute("id")).toBe(true);
    expect(control.classList.contains("custom-class")).toBe(true);
    expect(control.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(control);

    fireEvent.click(control);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Message", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl />
          <FormMessage
            ref={(node) => void (element = node)}
            data-testid="message"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Message
          </FormMessage>
        </FormField>
      </Form>
    ));

    const message = screen.getByTestId("message") as HTMLElement;
    expect(message.tagName).toBe("SPAN");
    expect(message.classList.contains("custom-class")).toBe(true);
    expect(message.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(message);

    fireEvent.click(message);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl />
          <FormMessage
            asChild
            ref={(node) => void (element = node)}
            data-testid="message"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Message</article>
          </FormMessage>
        </FormField>
      </Form>
    ));

    const message = (await screen.findByTestId("message")) as HTMLElement;
    expect(message.tagName).toBe("ARTICLE");
    expect(message.hasAttribute("id")).toBe(true);
    // Message-id registration runs post-mount; the control picks it up after.
    await vi.waitFor(() =>
      expect(screen.getByRole("textbox").getAttribute("aria-describedby")).toBe(message.id),
    );
    expect(message.classList.contains("custom-class")).toBe(true);
    expect(message.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(message);

    fireEvent.click(message);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Message with a built-in `match`", () => {
  afterEach(cleanup);

  // A built-in `match` goes through a separate implementation that renders
  // nothing until the field is invalid, so `forceMatch` is used to bring it
  // into the DOM without running validation first.
  const FORCE_MATCH = true;

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl required />
          <FormMessage
            match="valueMissing"
            forceMatch={FORCE_MATCH}
            ref={(node) => void (element = node)}
            data-testid="message"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Email is required
          </FormMessage>
        </FormField>
      </Form>
    ));

    const message = screen.getByTestId("message") as HTMLElement;
    expect(message.tagName).toBe("SPAN");
    expect(message.classList.contains("custom-class")).toBe(true);
    expect(message.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(message);

    fireEvent.click(message);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl required />
          <FormMessage
            match="valueMissing"
            forceMatch={FORCE_MATCH}
            asChild
            ref={(node) => void (element = node)}
            data-testid="message"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Email is required</article>
          </FormMessage>
        </FormField>
      </Form>
    ));

    const message = screen.getByTestId("message") as HTMLElement;
    expect(message.tagName).toBe("ARTICLE");
    expect(message.hasAttribute("id")).toBe(true);
    expect(message.classList.contains("custom-class")).toBe(true);
    expect(message.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(message);

    fireEvent.click(message);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Message with a custom `match`", () => {
  afterEach(cleanup);

  // A function `match` goes through yet another implementation, which registers
  // a custom matcher and is gated on the same `forceMatch`.
  const FORCE_MATCH = true;

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl />
          <FormMessage
            match={(value) => value === ""}
            forceMatch={FORCE_MATCH}
            ref={(node) => void (element = node)}
            data-testid="message"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Message
          </FormMessage>
        </FormField>
      </Form>
    ));

    const message = screen.getByTestId("message") as HTMLElement;
    expect(message.tagName).toBe("SPAN");
    expect(message.classList.contains("custom-class")).toBe(true);
    expect(message.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(message);

    fireEvent.click(message);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form>
        <FormField name="email">
          <FormControl />
          <FormMessage
            match={(value) => value === ""}
            forceMatch={FORCE_MATCH}
            asChild
            ref={(node) => void (element = node)}
            data-testid="message"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Message</article>
          </FormMessage>
        </FormField>
      </Form>
    ));

    const message = screen.getByTestId("message") as HTMLElement;
    expect(message.tagName).toBe("ARTICLE");
    expect(message.hasAttribute("id")).toBe(true);
    expect(message.classList.contains("custom-class")).toBe(true);
    expect(message.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(message);

    fireEvent.click(message);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Form.Submit", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      // jsdom cannot submit a form, so the submission the click triggers is
      // prevented.
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormSubmit
          ref={(node) => void (element = node)}
          data-testid="submit"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Submit
        </FormSubmit>
      </Form>
    ));

    const submit = screen.getByTestId("submit") as HTMLElement;
    expect(submit.tagName).toBe("BUTTON");
    expect(submit.classList.contains("custom-class")).toBe(true);
    expect(submit.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(submit);

    fireEvent.click(submit);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormSubmit
          asChild
          ref={(node) => void (element = node)}
          data-testid="submit"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button>Submit</button>
        </FormSubmit>
      </Form>
    ));

    const submit = screen.getByTestId("submit") as HTMLElement;
    expect(submit.tagName).toBe("BUTTON");
    expect(submit.getAttribute("type")).toBe("submit");
    expect(submit.classList.contains("custom-class")).toBe(true);
    expect(submit.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(submit);

    fireEvent.click(submit);
    expect(onClick).toHaveBeenCalled();
  });
});
