// Solidix-authored behavior tests for the frosted Form port. No
// upstream test suite exists at the pinned commit, so these assert the
// composition contract observed in upstream `form.tsx` (a form element
// carrying `fui-FormRoot`) plus passthrough of the Solidix form
// primitive's submit behavior (consumer `onSubmit` and
// `onClearServerErrors` both fire on submit - see
// `packages/solid/form/src/form.tsx`). Rendered bare - `Theme` needs
// `window.matchMedia`, which jsdom does not provide.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { flush } from "solid-js";
import { Form } from "../src/index.js";

describe("Form", () => {
  it("renders a native form carrying fui-FormRoot", async () => {
    render(() => <Form data-testid="form" />);
    const form = (await screen.findByTestId("form")) as HTMLElement;
    expect(form.tagName).toBe("FORM");
    expect(form.className).toContain("fui-FormRoot");
  });

  it("merges a consumer class after fui-FormRoot", async () => {
    render(() => <Form class="checkout" data-testid="form" />);
    const form = (await screen.findByTestId("form")) as HTMLElement;
    expect(form.className).toContain("fui-FormRoot");
    expect(form.className).toContain("checkout");
  });

  it("renders children", async () => {
    render(() => (
      <Form>
        <button type="submit">Pay</button>
      </Form>
    ));
    await screen.findByText("Pay");
  });

  it("calls the consumer onSubmit when submitted", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render(() => (
      <Form data-testid="form" onSubmit={onSubmit}>
        <button type="submit">Pay</button>
      </Form>
    ));
    const form = (await screen.findByTestId("form")) as HTMLElement;
    fireEvent.submit(form);
    await flush();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("clears server errors on submit via the primitive", async () => {
    const onClearServerErrors = vi.fn();
    render(() => (
      <Form
        data-testid="form"
        onClearServerErrors={onClearServerErrors}
        onSubmit={(event) => event.preventDefault()}
      />
    ));
    const form = (await screen.findByTestId("form")) as HTMLElement;
    fireEvent.submit(form);
    await flush();
    expect(onClearServerErrors).toHaveBeenCalledTimes(1);
  });
});
