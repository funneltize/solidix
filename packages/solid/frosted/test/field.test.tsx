// Solidix-authored behavior tests for the frosted Field port. No upstream
// test suite exists at the pinned commit, so these assert the composition
// contract observed in upstream `field.tsx` (context id wiring, touched
// gating, controlled/uncontrolled value, standalone item rendering).
// Rendered bare like the other frosted tests - `Theme` needs
// `window.matchMedia`, which jsdom does not provide.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../src/index.js";

describe("Field", () => {
  it("links label, control, and description ids and hides the error until touched", async () => {
    render(() => (
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Field.Control placeholder="Jane" />
        <Field.Description>Your display name.</Field.Description>
        <Field.Error>Required.</Field.Error>
      </Field.Root>
    ));
    const input = (await screen.findByPlaceholderText("Jane")) as HTMLInputElement;
    const label = (await screen.findByText("Name")) as HTMLLabelElement;
    const description = await screen.findByText("Your display name.");
    // Upstream wires `for` on the label to the control id; control is required
    // or aria-invalid'd only past the touched gate, so grab the raw input.
    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-describedby")).toContain(description.id);
    // The error message is absent until the field is touched: Base UI
    // conditionally renders `Field.Error`, so the port gates it on the same
    // touched/invalid/error state with `<Show>` instead of hiding it.
    expect(screen.queryByText("Required.")).toBe(null);
  });

  it("shows the error and sets aria-invalid once the control blurs", async () => {
    render(() => (
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Field.Control placeholder="Jane" />
        <Field.Error>Required.</Field.Error>
      </Field.Root>
    ));
    const input = (await screen.findByPlaceholderText("Jane")) as HTMLInputElement;
    fireEvent.blur(input);
    await flush();
    // Upstream marks the field touched on blur, which reveals the error and
    // flags the control invalid.
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const error = (await screen.findByText("Required.")) as HTMLElement;
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("treats the error prop as the forced invalid state", async () => {
    render(() => (
      <Field.Root error="Name taken.">
        <Field.Label>Name</Field.Label>
        <Field.Control placeholder="Jane" />
      </Field.Root>
    ));
    const input = (await screen.findByPlaceholderText("Jane")) as HTMLInputElement;
    // The string error renders an implicit FieldError immediately (upstream
    // renders `<Field.Error>` when `error` is a string) and flags invalid.
    const error = await screen.findByText("Name taken.");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain((error as HTMLElement).id);
  });

  it("supports uncontrolled values and reports changes via onValueChange", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <Field.Root defaultValue="Ada" onValueChange={onValueChange}>
        <Field.Label>Name</Field.Label>
        <Field.Control placeholder="Jane" />
      </Field.Root>
    ));
    const input = (await screen.findByPlaceholderText("Jane")) as HTMLInputElement;
    expect(input.value).toBe("Ada");
    fireEvent.input(input, { target: { value: "Ada L" } });
    await flush();
    expect(input.value).toBe("Ada L");
    expect(onValueChange).toHaveBeenCalledWith("Ada L");
  });

  it("follows a controlled value prop", async () => {
    render(() => (
      <Field.Root value="Grace">
        <Field.Label>Name</Field.Label>
        <Field.Control placeholder="Jane" />
      </Field.Root>
    ));
    const input = (await screen.findByPlaceholderText("Jane")) as HTMLInputElement;
    expect(input.value).toBe("Grace");
  });

  it("renders FieldItem standalone with unlinked label and description", async () => {
    render(() => (
      <Field.Item>
        <Field.Label>Standalone</Field.Label>
        <Field.Description>No field ancestor.</Field.Description>
      </Field.Item>
    ));
    const label = (await screen.findByText("Standalone")) as HTMLLabelElement;
    const description = await screen.findByText("No field ancestor.");
    // Upstream `FieldItem` mints its own context, so the label has no control
    // to point at and no aria ids are wired.
    expect(label.hasAttribute("for")).toBe(false);
    expect(label.id).not.toBe("");
    expect(description.id).not.toBe("");
  });
});
