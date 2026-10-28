// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/otp-field/otp-field.tsx
import { createContext, createSignal, omit, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  OneTimePasswordField as OTPPrimitive,
  OneTimePasswordFieldHiddenInput,
  OneTimePasswordFieldInput,
} from "@solidix/one-time-password-field";
import type {
  OneTimePasswordFieldHiddenInputProps,
  OneTimePasswordFieldInputProps,
  OneTimePasswordFieldProps,
} from "@solidix/one-time-password-field";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers.js";
import type { GetPropDefTypes } from "../../helpers/props";
import { otpFieldPropDefs } from "./otp-field.props";

/** Props owned by the OTP field itself (accent color). */
type OTPFieldOwnProps = GetPropDefTypes<typeof otpFieldPropDefs>;

/**
 * Accent color shared by every group under a root. Groups read it unless
 * they declare their own `color` override.
 */
interface OTPFieldContextValue {
  /** Accent color applied to the slot focus ring. */
  color: OTPFieldOwnProps["color"];
}

const OTPFieldContext = createContext<OTPFieldContextValue>();

/** Resolve the OTP color context, or `undefined` outside a root. */
function useOTPFieldContext(): OTPFieldContextValue | undefined {
  return useContext(OTPFieldContext);
}

/**
 * Props for `OTPField.Root`: the one-time-password state plus an accent
 * color. State props (`value`, `defaultValue`, `onValueChange`,
 * `onAutoSubmit`, `autoSubmit`, `name`, `disabled`, `placeholder`,
 * `autoFocus`, `form`, `sanitizeValue`) come straight from
 * `@solidix/one-time-password-field`; the digit count is the number of
 * `OTPField.Slot` children (like the primitive). Solidix divergence:
 * upstream renders `input-otp`'s `OTPInput` (one hidden input plus div slots
 * with a fake caret); this port renders one real input per slot, which
 * keeps each digit natively focusable and editable.
 */
interface OTPFieldRootProps extends OTPFieldOwnProps, Omit<OneTimePasswordFieldProps, "children"> {
  /** Slot groups, slots, and separators that make up the field. */
  children?: JSX.Element | undefined;
}

/**
 * Root state provider for an OTP field. Renders `fui-OTPFieldRoot` and
 * shares the accent color with every group below it.
 */
const OTPFieldRoot: Component<OTPFieldRootProps> = (props) => {
  const color = () => props.color ?? otpFieldPropDefs.color.default;
  const domProps = omit(props, "color", "class");

  return (
    <OTPFieldContext value={{ color: color() }}>
      <OTPPrimitive {...domProps} class={cx("fui-OTPFieldRoot", "fui-reset", props.class)}>
        {props.children}
      </OTPPrimitive>
    </OTPFieldContext>
  );
};

/**
 * Props for `OTPField.Group`: a row of slots, optionally overriding the
 * root accent color.
 */
interface OTPFieldGroupProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "color">, Partial<OTPFieldOwnProps> {}

/**
 * Groups slots into one row. Carries `data-accent-color` so the slot
 * focus ring matches the root color (or the group override).
 */
const OTPFieldGroup: Component<OTPFieldGroupProps> = (props) => {
  const context = useOTPFieldContext();
  const color = () => props.color ?? context?.color ?? otpFieldPropDefs.color.default;
  const domProps = omit(props, "color", "class");

  return (
    <div
      {...domProps}
      data-accent-color={color()}
      class={cx("fui-OTPFieldGroup", "fui-reset", props.class)}
    />
  );
};

/**
 * Props for `OTPField.Slot`: one digit input. Solidix divergence: upstream
 * `SlotProps` (`char`, `hasFakeCaret`, `isActive`) come from `input-otp`'s
 * render-prop slots; here the slot is a real input whose value the
 * primitive manages, and `data-otp-active` tracks focus instead of the
 * input-otp caret position.
 */
interface OTPFieldSlotProps extends Omit<
  OneTimePasswordFieldInputProps,
  "class" | "onFocus" | "onBlur" | "onInput" | "onChange"
> {
  /** Extra classes merged onto the slot input. */
  class?: string | undefined;
  /** Focus handler, composed before active-state tracking. */
  onFocus?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> | undefined;
  /** Blur handler, composed before active-state tracking. */
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> | undefined;
  /** Input handler, composed before the primitive's digit handling. */
  onInput?: JSX.InputEventHandler<HTMLInputElement, InputEvent> | undefined;
  /** Change handler, composed before the primitive's digit handling. */
  onChange?: JSX.ChangeEventHandler<HTMLInputElement, Event> | undefined;
}

/**
 * One digit slot. Renders a real input styled as `fui-OTPFieldSlot` with
 * `data-otp-active` while focused. The native caret replaces upstream's
 * fake-caret element.
 */
const OTPFieldSlot: Component<OTPFieldSlotProps> = (props) => {
  const [active, setActive] = createSignal(false);
  const domProps = omit(props, "class", "onFocus", "onBlur", "onInput", "onChange");

  return (
    <OneTimePasswordFieldInput
      {...domProps}
      class={cx("fui-OTPFieldSlot", "fui-reset", props.class)}
      data-otp-active={active() ? "true" : undefined}
      onFocus={composeEventHandlers(props.onFocus, () => setActive(true))}
      onBlur={composeEventHandlers(props.onBlur, () => setActive(false))}
      onInput={props.onInput}
      onChange={props.onChange}
    />
  );
};

/** Props for `OTPField.Separator`: native div separator props. */
interface OTPFieldSeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Visual separator between slot groups. Renders `fui-OTPFieldSeparator`
 * with `role="separator"`.
 */
const OTPFieldSeparator: Component<OTPFieldSeparatorProps> = (props) => {
  const domProps = omit(props, "class");
  return (
    <div
      role="separator"
      {...domProps}
      class={cx("fui-OTPFieldSeparator", "fui-reset", props.class)}
    />
  );
};

/**
 * Hidden input that submits the OTP value with native forms. Renders the
 * primitive's hidden input unchanged.
 */
const OTPFieldHiddenInput: Component<OneTimePasswordFieldHiddenInputProps> = (props) => {
  return <OneTimePasswordFieldHiddenInput {...props} />;
};

export { OTPFieldGroup, OTPFieldHiddenInput, OTPFieldRoot, OTPFieldSeparator, OTPFieldSlot };
export type {
  OTPFieldGroupProps,
  OTPFieldOwnProps,
  OTPFieldRootProps,
  OTPFieldSeparatorProps,
  OTPFieldSlotProps,
};
