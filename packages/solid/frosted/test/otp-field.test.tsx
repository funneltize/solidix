import { render } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  OTPFieldGroup,
  OTPFieldHiddenInput,
  OTPFieldRoot,
  OTPFieldSeparator,
  OTPFieldSlot,
} from "../src/index";

/**
 * No upstream OTP test ships at the pinned commit, so these tests assert the
 * observed port behavior: `fui-*` classes, `data-accent-color` resolution
 * (group override beats the root default), `data-otp-active` focus tracking,
 * the digit-count-equals-slots rule, typed-digit plumbing through the
 * primitive, and the hidden form input.
 */

function renderField(props: { color?: "blue" | "red" } = {}) {
  return render(() => (
    <OTPFieldRoot {...props}>
      <OTPFieldGroup data-testid="group">
        <OTPFieldSlot />
        <OTPFieldSlot />
        <OTPFieldSeparator data-testid="sep" />
        <OTPFieldSlot />
      </OTPFieldGroup>
      <OTPFieldHiddenInput name="code" />
    </OTPFieldRoot>
  ));
}

describe("OTPField", () => {
  it("renders the root, group, slots, separator, and hidden input", async () => {
    const { container, findByTestId } = renderField();
    await findByTestId("group");
    expect(container.querySelector(".fui-OTPFieldRoot")).not.toBeNull();
    expect(container.querySelector(".fui-OTPFieldGroup")).not.toBeNull();
    expect(container.querySelectorAll(".fui-OTPFieldSlot")).toHaveLength(3);
    expect(container.querySelector(".fui-OTPFieldSeparator")).not.toBeNull();
    expect(container.querySelector('input[type="hidden"]')).not.toBeNull();
  });

  it("slots are real single-character inputs", async () => {
    const { container, findByTestId } = renderField();
    await findByTestId("group");
    const slots = Array.from(container.querySelectorAll<HTMLInputElement>(".fui-OTPFieldSlot"));
    // The autocomplete slot (first) accepts the full paste, the rest one char.
    expect(slots[0].maxLength).toBe(slots.length);
    expect(slots[1].maxLength).toBe(1);
    expect(slots[2].maxLength).toBe(1);
    for (const slot of slots) {
      expect(slot.tagName).toBe("INPUT");
    }
  });

  it("defaults the accent color to gray and lets the group override it", async () => {
    const { findByTestId } = renderField();
    expect((await findByTestId("group")).getAttribute("data-accent-color")).toBe("gray");
    const red = render(() => (
      <OTPFieldRoot color="blue">
        <OTPFieldGroup color="red" data-testid="red-group">
          <OTPFieldSlot />
        </OTPFieldGroup>
      </OTPFieldRoot>
    ));
    expect((await red.findByTestId("red-group")).getAttribute("data-accent-color")).toBe("red");
  });

  it("tracks data-otp-active on the focused slot", async () => {
    const { container, findByTestId } = renderField();
    await findByTestId("group");
    const slots = Array.from(container.querySelectorAll<HTMLInputElement>(".fui-OTPFieldSlot"));
    expect(slots[0].dataset.otpActive).toBeUndefined();
    slots[1].focus();
    await flush();
    expect(slots[1].dataset.otpActive).toBe("true");
    slots[1].blur();
    await flush();
    expect(slots[1].dataset.otpActive).toBeUndefined();
  });

  it("plumbs typed digits through the primitive to value and the hidden input", async () => {
    const onValueChange = vi.fn();
    const { container, findByTestId } = render(() => (
      <OTPFieldRoot onValueChange={onValueChange}>
        <OTPFieldGroup data-testid="group">
          <OTPFieldSlot />
          <OTPFieldSlot />
        </OTPFieldGroup>
        <OTPFieldHiddenInput name="code" />
      </OTPFieldRoot>
    ));
    await findByTestId("group");
    const slots = Array.from(container.querySelectorAll<HTMLInputElement>(".fui-OTPFieldSlot"));
    slots[0].focus();
    await flush();
    const { fireEvent } = await import("@solidjs/testing-library");
    fireEvent.input(slots[0], { target: { value: "4" } });
    await flush();
    expect(onValueChange).toHaveBeenCalledWith("4");
    expect((container.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe("4");
  });
});
