// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/number-field/number-field.tsx

import {
  createContext,
  createMemo,
  createSignal,
  omit,
  untrack,
  useContext as useSolidContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { useControllableState } from "@solidix/use-controllable-state";
import { callEventHandler } from "@solidix/primitive";
import { composeEventHandlers } from "../../helpers/compose-event-handlers.js";
import { cx } from "../../helpers/cx.js";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props/index.js";
import { numberFieldPropDefs, numberFieldSlotPropDefs } from "./number-field.props.js";
import { IconButton } from "../icon-button/icon-button.js";

/**
 * Props for the `NumberFieldRoot` component: native div props plus the
 * number-field prop defs and the controlled value plumbing (`value`,
 * `defaultValue`, `onValueChange`, `min`, `max`, `step`, `largeStep`).
 */
interface NumberFieldRootProps
  extends
    Omit<PropsWithoutColor<"div">, "ref" | "onChange">,
    GetPropDefTypes<typeof numberFieldPropDefs> {
  /** Ref forwarded to the rendered group element. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Controlled numeric value; `null` clears the field. */
  value?: number | null | undefined;
  /** Uncontrolled initial value; defaults to `null`. */
  defaultValue?: number | null | undefined;
  /** Called with the next value and the event that produced it. */
  onValueChange?: ((value: number | null, event: Event) => void) | undefined;
  /** Smallest allowed value; stepping and blur clamp to it. */
  min?: number | undefined;
  /** Largest allowed value; stepping and blur clamp to it. */
  max?: number | undefined;
  /** Amount a single step (or Arrow key) moves the value; defaults to `1`. */
  step?: number | undefined;
  /** Amount a Shift+Arrow or Page key moves the value; defaults to `10`. */
  largeStep?: number | undefined;
  /** Whether the whole field (input and step buttons) is disabled. */
  disabled?: boolean | undefined;
  /** Whether the value can be focused but not changed. */
  readOnly?: boolean | undefined;
  /** Whether the input is required for form submission. */
  required?: boolean | undefined;
  /** Name forwarded to the input for form submission. */
  name?: string | undefined;
}

/** Prop-def values with defaults resolved, as shared through number-field context. */
type NumberFieldResolved = {
  [K in keyof GetPropDefTypes<typeof numberFieldPropDefs>]-?: Exclude<
    GetPropDefTypes<typeof numberFieldPropDefs>[K],
    undefined
  >;
};

/** Value shared from `NumberFieldRoot` to its input, slots, and step buttons. */
interface NumberFieldContextValue extends NumberFieldResolved {
  /** Current numeric value, `null` when cleared. */
  value: () => number | null;
  /** Writes the value and notifies `onValueChange` with the triggering event. */
  setValue: (next: number | null, event: Event) => void;
  /** Steps the value up by `step`, honoring `max`. */
  increment: (event: Event) => void;
  /** Steps the value down by `step`, honoring `min`. */
  decrement: (event: Event) => void;
  step: number;
  largeStep: number;
  min: number | undefined;
  max: number | undefined;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  name: string | undefined;
  /** Whether stepping up is currently blocked (disabled, read-only, or at `max`). */
  atMax: () => boolean;
  /** Whether stepping down is currently blocked (disabled, read-only, or at `min`). */
  atMin: () => boolean;
}

/** Context shared from `NumberFieldRoot` to its input, slots, and step buttons. */
const NumberFieldContext = createContext<NumberFieldContextValue | undefined>(undefined);

/** Counts the decimals of a step so rounding does not introduce float drift. */
function stepPrecision(n: number): number {
  const text = String(n);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/**
 * Rounds `value` to the nearest multiple of `step` from `base`, avoiding float drift
 * the way Base UI's step helpers do.
 */
function roundToStep(value: number, step: number, base: number): number {
  const precision = Math.max(stepPrecision(step), stepPrecision(base));
  const rounded = base + Math.round((value - base) / step) * step;
  return Number(rounded.toFixed(precision));
}

/**
 * Numeric field root, ported from upstream `NumberFieldRoot`. Renders the
 * `fui-NumberFieldRoot` + `fui-TextFieldRoot` group with optional auto-rendered
 * step buttons (split around the children, or trailing in a button group).
 */
const NumberFieldRoot: Component<NumberFieldRootProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "size",
    "variant",
    "color",
    "buttonLayout",
    "ref",
    "value",
    "defaultValue",
    "onValueChange",
    "min",
    "max",
    "step",
    "largeStep",
    "disabled",
    "readOnly",
    "required",
    "name",
    "onPointerDown",
  );
  const size = () => props.size ?? numberFieldPropDefs.size.default;
  const variant = () => props.variant ?? numberFieldPropDefs.variant.default;
  const color = () => props.color ?? numberFieldPropDefs.color.default;
  const buttonLayout = () => props.buttonLayout ?? numberFieldPropDefs.buttonLayout.default;
  const step = () => props.step ?? 1;
  const largeStep = () => props.largeStep ?? 10;
  const min = () => props.min;
  const max = () => props.max;
  const disabled = () => props.disabled ?? false;
  const readOnly = () => props.readOnly ?? false;

  const [value, setValueState] = useControllableState<number | null>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? null,
  });
  const setValue = (next: number | null, event: Event) => {
    setValueState(next);
    props.onValueChange?.(next, event);
  };

  const clampValue = (candidate: number): number => {
    const lo = min();
    const hi = max();
    if (lo !== undefined && candidate < lo) return lo;
    if (hi !== undefined && candidate > hi) return hi;
    return candidate;
  };
  const stepValue = (direction: 1 | -1, amount: number, event: Event) => {
    if (disabled() || readOnly()) return;
    const current = untrack(value) ?? 0;
    const next = clampValue(roundToStep(current + direction * amount, step(), min() ?? 0));
    // Skip no-op writes so holding at a bound does not spam `onValueChange`.
    if (next === current && untrack(value) !== null) return;
    setValue(next, event);
  };
  const increment = (event: Event) => stepValue(1, step(), event);
  const decrement = (event: Event) => stepValue(-1, step(), event);
  const largeStepBy = (direction: 1 | -1, event: Event) => stepValue(direction, largeStep(), event);
  const atMax = createMemo(() => {
    if (disabled() || readOnly()) return true;
    const hi = max();
    const current = value();
    return hi !== undefined && current !== null && current >= hi;
  });
  const atMin = createMemo(() => {
    if (disabled() || readOnly()) return true;
    const lo = min();
    const current = value();
    return lo !== undefined && current !== null && current <= lo;
  });

  const handlePointerDown = (event: PointerEvent & { currentTarget: HTMLDivElement }) => {
    const target = event.target as HTMLElement;
    if (target.closest("input, button, a")) return;
    const input = event.currentTarget.querySelector(
      ".fui-NumberFieldInput",
    ) as HTMLInputElement | null;
    if (!input) return;
    const position = input.compareDocumentPosition(target);
    const targetIsBeforeInput = (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
    const cursorPosition = targetIsBeforeInput ? 0 : input.value.length;
    requestAnimationFrame(() => {
      const selectableTypes = ["text", "search", "url", "tel", "password"];
      if (selectableTypes.includes(input.type)) {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
      input.focus();
    });
  };

  const contextValue: NumberFieldContextValue = {
    get size() {
      return size();
    },
    get variant() {
      return variant();
    },
    get color() {
      return color();
    },
    get buttonLayout() {
      return buttonLayout();
    },
    value,
    setValue,
    increment,
    decrement,
    get step() {
      return step();
    },
    get largeStep() {
      return largeStep();
    },
    get min() {
      return min();
    },
    get max() {
      return max();
    },
    get disabled() {
      return disabled();
    },
    get readOnly() {
      return readOnly();
    },
    get required() {
      return props.required ?? false;
    },
    get name() {
      return props.name;
    },
    atMax,
    atMin,
  };
  // Kept on the context object for key handlers; not part of the public context type.
  (
    contextValue as NumberFieldContextValue & {
      stepLarge: (direction: 1 | -1, event: Event) => void;
    }
  ).stepLarge = largeStepBy;

  const isSplit = createMemo(() => buttonLayout() === "split");
  const isTrailing = createMemo(() => buttonLayout() === "trailing");

  return (
    <div
      data-accent-color={color()}
      {...rest}
      role="group"
      data-disabled={disabled() ? "" : undefined}
      class={cx(
        "fui-NumberFieldRoot",
        "fui-TextFieldRoot",
        `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
        `fui-button-layout-${buttonLayout()}`,
        props.class,
      )}
      onPointerDown={(event) =>
        composeEventHandlers(
          (next: typeof event) => callEventHandler(props.onPointerDown, next),
          handlePointerDown,
        )(event)
      }
    >
      <NumberFieldContext value={contextValue}>
        {isSplit() ? <NumberFieldDecrement /> : null}
        {props.children}
        {isTrailing() ? (
          <div class="fui-NumberFieldButtonGroup">
            <NumberFieldDecrement />
            <NumberFieldIncrement />
          </div>
        ) : isSplit() ? (
          <NumberFieldIncrement />
        ) : null}
      </NumberFieldContext>
    </div>
  );
};

/**
 * Props for the `NumberFieldSlot` component: native div props plus the slot prop defs.
 */
interface NumberFieldSlotProps
  extends Omit<PropsWithoutColor<"div">, "ref">, GetPropDefTypes<typeof numberFieldSlotPropDefs> {
  /** Ref forwarded to the rendered slot element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Non-interactive leading/trailing adornment slot, ported from upstream `NumberFieldSlot`.
 * Inherits the root size for icon sizing.
 */
const NumberFieldSlot: Component<NumberFieldSlotProps> = (props) => {
  const rest = omit(props, "children", "class", "color", "ref");
  const context = useSolidContext(NumberFieldContext);
  const color = () => props.color ?? numberFieldSlotPropDefs.color.default;
  return (
    <div
      data-accent-color={color()}
      {...rest}
      ref={composeRefs(props.ref)}
      class={cx("fui-NumberFieldSlot", `fui-r-size-${context?.size}`, props.class)}
    >
      {props.children}
    </div>
  );
};

/**
 * Props for the `NumberFieldInput` component: native input props plus the root
 * prop-def overrides (size, variant, color; `buttonLayout` is accepted and ignored,
 * per upstream).
 */
interface NumberFieldInputProps
  extends
    Omit<PropsWithoutColor<"input">, "ref" | "size" | "value" | "onChange">,
    GetPropDefTypes<typeof numberFieldPropDefs> {
  /** Ref forwarded to the rendered input element. */
  ref?: Ref<HTMLInputElement> | undefined;
  /** Controlled text shown in the input; defaults to the formatted root value. */
  value?: string | undefined;
  /** Called when the user edits the text, before numeric parsing. */
  onChange?: JSX.InputEventHandler<HTMLInputElement, InputEvent> | undefined;
  /**
   * Upstream camelCase spelling of the native `readonly` prop; both spellings
   * are accepted and fall back to the root context.
   */
  readOnly?: boolean | undefined;
}

/**
 * Text input carrying the numeric value, ported from upstream `NumberFieldInput`.
 * Renders `role="spinbutton"` with the value bounds, steps on Arrow/Page keys,
 * and clamps on blur. Size, variant, and color fall back to the root context.
 */
const NumberFieldInput: Component<NumberFieldInputProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "size",
    "variant",
    "color",
    "buttonLayout",
    "ref",
    "value",
    "onChange",
    "onInput",
    "onBlur",
    "onKeyDown",
    "disabled",
    "readOnly",
    "readonly",
    "required",
    "name",
  );
  const context = useSolidContext(NumberFieldContext);
  const size = () => props.size ?? context?.size ?? numberFieldPropDefs.size.default;
  const variant = () => props.variant ?? context?.variant ?? numberFieldPropDefs.variant.default;
  const color = () => props.color ?? context?.color ?? numberFieldPropDefs.color.default;
  const disabled = () => props.disabled ?? context?.disabled ?? false;
  const readOnly = () => props.readonly ?? props.readOnly ?? context?.readOnly ?? false;

  const text = createMemo(() => {
    const fromRoot = context?.value();
    if (fromRoot === undefined) return props.value ?? "";
    return fromRoot === null ? "" : String(fromRoot);
  });
  // Raw in-progress text (e.g. `1.` or `-`) that parses to nothing committable yet;
  // the value binding shows this while focused instead of snapping back to `text()`.
  const [draft, setDraft] = createSignal<string | null>(null);
  const shown = () => props.value ?? draft() ?? text();

  const commitText = (raw: string, event: Event) => {
    if (!context) return;
    const trimmed = raw.trim();
    if (trimmed === "") {
      if (context.value() !== null) context.setValue(null, event);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;
    let next = parsed;
    if (context.min !== undefined && next < context.min) next = context.min;
    if (context.max !== undefined && next > context.max) next = context.max;
    if (next !== context.value()) context.setValue(next, event);
  };

  return (
    <input
      data-accent-color={color()}
      {...rest}
      ref={composeRefs(props.ref)}
      role="spinbutton"
      inputmode="decimal"
      autocomplete="off"
      autocorrect="off"
      spellcheck={false}
      disabled={disabled() || undefined}
      readonly={readOnly() || undefined}
      required={props.required ?? context?.required ?? undefined}
      name={props.name ?? context?.name}
      aria-valuemin={context?.min}
      aria-valuemax={context?.max}
      aria-valuenow={(() => {
        const current = context?.value();
        return current === undefined || current === null ? undefined : current;
      })()}
      aria-valuetext={(() => {
        const current = context?.value();
        return current === undefined || current === null ? undefined : String(current);
      })()}
      value={shown()}
      class={cx(
        "fui-NumberFieldInput",
        "fui-TextFieldInput",
        `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
        props.class,
      )}
      onInput={(event) => {
        callEventHandler(props.onInput, event);
        callEventHandler(props.onChange, event);
        if (event.defaultPrevented || disabled() || readOnly()) return;
        const raw = event.currentTarget.value;
        setDraft(raw);
        commitText(raw, event);
      }}
      onBlur={(event) => {
        callEventHandler(props.onBlur, event);
        if (event.defaultPrevented || !context || disabled() || readOnly()) return;
        // Clamp free-typed text into range; restore the box when it held garbage.
        const raw = event.currentTarget.value.trim();
        const parsed = raw === "" ? null : Number(raw);
        setDraft(null);
        if (parsed === null) {
          if (context.value() !== null) context.setValue(null, event);
        } else if (Number.isNaN(parsed)) {
          event.currentTarget.value = text();
        } else {
          commitText(raw, event);
          event.currentTarget.value = text();
        }
      }}
      onKeyDown={(event) => {
        callEventHandler(props.onKeyDown, event);
        if (event.defaultPrevented || !context || disabled() || readOnly()) return;
        setDraft(null);
        const stepLarge = (
          context as NumberFieldContextValue & {
            stepLarge?: (direction: 1 | -1, event: Event) => void;
          }
        ).stepLarge;
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            if (event.shiftKey) stepLarge?.(1, event);
            else context.increment(event);
            break;
          case "ArrowDown":
            event.preventDefault();
            if (event.shiftKey) stepLarge?.(-1, event);
            else context.decrement(event);
            break;
          case "PageUp":
            event.preventDefault();
            stepLarge?.(1, event);
            break;
          case "PageDown":
            event.preventDefault();
            stepLarge?.(-1, event);
            break;
          default:
            break;
        }
      }}
    />
  );
};

/** Props for the `NumberFieldDecrement` component: button props plus an optional class. */
interface NumberFieldDecrementProps extends Omit<PropsWithoutColor<"button">, "ref" | "disabled"> {
  /** Ref forwarded to the rendered button element. */
  ref?: Ref<HTMLButtonElement> | undefined;
}

/**
 * Step-down button, ported from upstream `NumberFieldDecrement`. Renders an
 * `IconButton` with a minus glyph, inheriting root size/variant/color.
 */
const NumberFieldDecrement: Component<NumberFieldDecrementProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "onClick", "tabindex");
  const context = useSolidContext(NumberFieldContext);
  return (
    <IconButton
      {...rest}
      ref={props.ref}
      type="button"
      tabindex={untrack(() => props.tabindex) ?? -1}
      disabled={context?.atMin() ?? false}
      aria-label="Decrease value"
      size={context?.size}
      variant={context?.variant}
      color={context?.color}
      class={cx("fui-NumberFieldButton", "fui-NumberFieldDecrement", props.class)}
      onClick={(event) => {
        callEventHandler(props.onClick, event);
        if (event.defaultPrevented) return;
        context?.decrement(event);
      }}
    >
      {untrack(() => props.children) ?? <MinusIcon />}
    </IconButton>
  );
};

/** Props for the `NumberFieldIncrement` component: button props plus an optional class. */
interface NumberFieldIncrementProps extends Omit<PropsWithoutColor<"button">, "ref" | "disabled"> {
  /** Ref forwarded to the rendered button element. */
  ref?: Ref<HTMLButtonElement> | undefined;
}

/**
 * Step-up button, ported from upstream `NumberFieldIncrement`. Renders an
 * `IconButton` with a plus glyph, inheriting root size/variant/color.
 */
const NumberFieldIncrement: Component<NumberFieldIncrementProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "onClick", "tabindex");
  const context = useSolidContext(NumberFieldContext);
  return (
    <IconButton
      {...rest}
      ref={props.ref}
      type="button"
      tabindex={untrack(() => props.tabindex) ?? -1}
      disabled={context?.atMax() ?? false}
      aria-label="Increase value"
      size={context?.size}
      variant={context?.variant}
      color={context?.color}
      class={cx("fui-NumberFieldButton", "fui-NumberFieldIncrement", props.class)}
      onClick={(event) => {
        callEventHandler(props.onClick, event);
        if (event.defaultPrevented) return;
        context?.increment(event);
      }}
    >
      {untrack(() => props.children) ?? <PlusIcon />}
    </IconButton>
  );
};

/** Minus glyph shown inside the decrement button, ported from upstream. */
const MinusIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (props) => {
  const rest = omit(props, "width", "height");
  return (
    <svg
      width={props.width ?? 12}
      height={props.height ?? 12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-fui-icon="true"
      {...rest}
    >
      <path
        d="M10.25 5.25C10.6642 5.25 11 5.58579 11 6C11 6.41421 10.6642 6.75 10.25 6.75H1.75C1.33579 6.75 1 6.41421 1 6C1 5.58579 1.33579 5.25 1.75 5.25H10.25Z"
        fill="currentColor"
      />
    </svg>
  );
};

/** Plus glyph shown inside the increment button, ported from upstream. */
const PlusIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (props) => {
  const rest = omit(props, "width", "height");
  return (
    <svg
      width={props.width ?? 12}
      height={props.height ?? 12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-fui-icon="true"
      {...rest}
    >
      <path
        d="M6 1C6.41421 1 6.75 1.33579 6.75 1.75V5.25H10.25C10.6642 5.25 11 5.58579 11 6C11 6.41421 10.6642 6.75 10.25 6.75H6.75V10.25C6.75 10.6642 6.41421 11 6 11C5.58579 11 5.25 10.6642 5.25 10.25V6.75H1.75C1.33579 6.75 1 6.41421 1 6C1 5.58579 1.33579 5.25 1.75 5.25H5.25V1.75C5.25 1.33579 5.58579 1 6 1Z"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * Namespace pairing the number field parts for dotted usage
 * (`NumberField.Root`, `NumberField.Slot`, `NumberField.Input`,
 * `NumberField.Decrement`, `NumberField.Increment`).
 */
const NumberField = {
  Decrement: NumberFieldDecrement,
  Increment: NumberFieldIncrement,
  Input: NumberFieldInput,
  Root: NumberFieldRoot,
  Slot: NumberFieldSlot,
};

export {
  NumberField,
  NumberFieldDecrement as Decrement,
  NumberFieldIncrement as Increment,
  NumberFieldInput as Input,
  NumberFieldRoot as Root,
  NumberFieldSlot as Slot,
};

export type {
  NumberFieldDecrementProps as DecrementProps,
  NumberFieldIncrementProps as IncrementProps,
  NumberFieldInputProps as InputProps,
  NumberFieldRootProps as RootProps,
  NumberFieldSlotProps as SlotProps,
};
