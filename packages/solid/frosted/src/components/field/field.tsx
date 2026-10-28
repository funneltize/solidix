// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/field/field.tsx
import {
  children,
  createContext,
  createMemo,
  createSignal,
  omit,
  Show,
  useContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { useId } from "@solidix/id";
import { callEventHandler } from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import { Text, type TextProps, type TextRenderProp } from "../text/text";

/**
 * Snapshot of the native `ValidityState` flags plus the control value, exposed
 * to `Field.Validity` render props. Read from the live control element, so it
 * always reflects the browser's constraint validation state.
 */
interface FieldValidityState {
  /** The control's current value. */
  value: string;
  /** Whether the control currently satisfies all constraints. */
  valid: boolean;
  /** Whether a required value is missing. */
  valueMissing: boolean;
  /** Whether the value fails the input type's format. */
  typeMismatch: boolean;
  /** Whether the value fails the `pattern` attribute. */
  patternMismatch: boolean;
  /** Whether the value exceeds `maxLength`. */
  tooLong: boolean;
  /** Whether the value is shorter than `minLength`. */
  tooShort: boolean;
  /** Whether the value is below `min`. */
  rangeUnderflow: boolean;
  /** Whether the value is above `max`. */
  rangeOverflow: boolean;
  /** Whether the value violates `step`. */
  stepMismatch: boolean;
  /** Whether the value cannot be converted (for example a bad number). */
  badInput: boolean;
  /** Whether a custom validity message is set. */
  customError: boolean;
}

/** Initial validity snapshot: empty and valid until the control reports in. */
const initialValidity: FieldValidityState = {
  value: "",
  valid: true,
  valueMissing: false,
  typeMismatch: false,
  patternMismatch: false,
  tooLong: false,
  tooShort: false,
  rangeUnderflow: false,
  rangeOverflow: false,
  stepMismatch: false,
  badInput: false,
  customError: false,
};

/** Read a validity snapshot from a live control element. */
function readValidity(control: HTMLInputElement | null): FieldValidityState {
  if (!control) return initialValidity;
  const state = control.validity;
  return {
    value: control.value,
    valid: state.valid,
    valueMissing: state.valueMissing,
    typeMismatch: state.typeMismatch,
    patternMismatch: state.patternMismatch,
    tooLong: state.tooLong,
    tooShort: state.tooShort,
    rangeUnderflow: state.rangeUnderflow,
    rangeOverflow: state.rangeOverflow,
    stepMismatch: state.stepMismatch,
    badInput: state.badInput,
    customError: state.customError,
  };
}

/** Internal context shared between `Field.Root` and its parts. */
interface FieldContextValue {
  /**
   * Id wired to the control and the label's `for` attribute.
   * `undefined` under a standalone `Field.Item`, which has no control.
   */
  controlId: string | undefined;
  /** Id of the label element itself. */
  labelId: string;
  /** Id of the description element, referenced by `aria-describedby`. */
  descriptionId: string;
  /** Id of the error element, referenced by `aria-describedby` when invalid. */
  errorId: string;
  /** Field name forwarded to the control. */
  name: () => string | undefined;
  /** Whether the field is disabled. */
  disabled: () => boolean;
  /** Whether the field is invalid (explicit prop or failing validity). */
  invalid: () => boolean;
  /** Whether the control has been blurred at least once. */
  touched: () => boolean;
  /** Whether the control value differs from its initial value. */
  dirty: () => boolean;
  /** Latest validity snapshot read from the control. */
  validity: () => FieldValidityState;
  /** Re-read validity, touched, and dirty state from the control element. */
  refresh: (control: HTMLInputElement | null) => void;
  /** Record that the control has been blurred at least once. */
  markTouched: () => void;
  /** Current control value, owned by `Field.Root`. */
  fieldValue: () => string;
  /** Update the control value (controlled or uncontrolled). */
  setFieldValue: (next: string) => void;
}

/** Field context: provides ids, validity, and value state to field parts and bespoke roots. */
const FieldContext = createContext<FieldContextValue>();

/** Resolve the field context or throw the Radix-style scope error. */
function useFieldContext(component: string): FieldContextValue {
  const context = useContext(FieldContext);
  if (!context) throw new Error(`\`${component}\` must be used within \`Field.Root\``);
  return context;
}

/**
 * Props for `Field.Root`: field state plus native div props. `invalid`
 * overrides touch gating; `touched` and `dirty` are derived from the control
 * and reported through `Field.Validity`. The Root owns the control value
 * (`value` / `defaultValue` / `onValueChange`) - Solidix divergence, since
 * Base UI keeps value state on its Control while the label/description/error
 * wiring needs it at the field level.
 */
interface FieldRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Field name forwarded to the control. */
  name?: string | undefined;
  /** Whether the field is disabled. */
  disabled?: boolean | undefined;
  /**
   * Whether the field is invalid, overriding touch gating.
   * When omitted, the field becomes invalid once the control is blurred.
   */
  invalid?: boolean | undefined;
  /**
   * Error message rendered when no explicit `Field.Error` child is present.
   * Setting it also marks the field invalid immediately (before touch).
   * Solidix addition: upstream Base UI derives errors from validation modes.
   */
  error?: string | undefined;
  /** Controlled control value. */
  value?: string | undefined;
  /** Initial control value for uncontrolled usage. */
  defaultValue?: string | undefined;
  /** Called with the next value when the control value changes. */
  onValueChange?: ((next: string) => void) | undefined;
  /**
   * Internal: set by standalone `Field.Item` so the field mints no control
   * id and labels stay unlinked. Consumers should not set this.
   */
  noControlId?: boolean | undefined;
  /** Field parts: label, control, description, error. */
  children?: JSX.Element | undefined;
}

/**
 * Field root: owns the control value, the control/label/description/error
 * ids, and derives `invalid`/`touched`/`dirty`/validity from the live
 * control. Renders a plain `div` with `fui-FieldRoot`.
 */
/**
 * Props consumed by the field state hook: the stateful subset of
 * `FieldRootProps`, so bespoke roots can satisfy it without the div props.
 */
type FieldRootStateProps = Pick<
  FieldRootProps,
  | "noControlId"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "disabled"
  | "invalid"
  | "error"
  | "name"
>;

/**
 * Builds the field context value: ids, validity/touched/dirty state, and
 * the Root-owned control value. Shared by `Field.Root` and bespoke roots
 * (e.g. `CreditCard.Field`) that need field semantics under their own class.
 */
function useFieldRootState(props: FieldRootStateProps): FieldContextValue {
  // Standalone `Field.Item` renders through a root with no control, so the
  // root mints no control id and its labels stay unlinked (Base UI parity).
  const mintedControlId = useId();
  const controlId = props.noControlId ? undefined : mintedControlId;
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [validity, setValidity] = createSignal<FieldValidityState>(initialValidity);
  const [touched, setTouched] = createSignal(false);
  const [dirty, setDirty] = createSignal(false);
  // Plain closure: write-once snapshot for dirty checks, never rendered,
  // so no signal (avoids untracked signal reads from ref callbacks).
  let initialValue: string | null = null;
  const [fieldValue, setFieldValue] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? "",
    onChange: (next) => props.onValueChange?.(next),
    caller: "Field.Root",
  });

  const disabled = () => props.disabled ?? false;
  // Solidix invalid rule: explicit prop wins; a Root-level `error` message
  // forces invalid immediately; otherwise blur (touch) reveals invalidity.
  // Upstream Base UI gates on `touched`/`dirty`/validation modes instead.
  const invalid = () => props.invalid ?? (props.error ? true : touched());

  const refresh = (control: HTMLInputElement | null) => {
    if (!control) return;
    if (initialValue === null) initialValue = control.defaultValue;
    setValidity(readValidity(control));
    setDirty(control.value !== (initialValue ?? control.defaultValue));
  };
  const markTouched = () => setTouched(true);

  return {
    controlId,
    labelId,
    descriptionId,
    errorId,
    name: () => props.name,
    disabled,
    invalid,
    touched,
    dirty,
    validity,
    refresh,
    markTouched,
    fieldValue,
    setFieldValue,
  };
}

const FieldRoot: Component<FieldRootProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "defaultValue",
    "disabled",
    "error",
    "invalid",
    "name",
    "noControlId",
    "onValueChange",
    "value",
  );
  // NOTE: children render directly inside the provider (text-field precedent).
  // A children() memo resolved here would execute them in FieldRoot's owner,
  // outside the provider, so useFieldContext would throw.
  const context = useFieldRootState(props);

  return (
    <FieldContext value={context}>
      <div
        {...rest}
        data-disabled={context.disabled() ? "" : undefined}
        data-invalid={context.invalid() ? "" : undefined}
        class={cx("fui-FieldRoot", props.class)}
      >
        {props.children}
        {props.error ? <FieldError>{props.error}</FieldError> : null}
      </div>
    </FieldContext>
  );
};

/**
 * Props for `Field.Label`: themed `Text` props rendered as a `label` bound to
 * the control. `render` swaps the element, as on `Text`.
 */
interface FieldLabelProps extends Omit<TextProps, "render"> {
  /** Element or render function overriding the default `label` output. */
  render?: TextRenderProp | undefined;
}

/**
 * Field label: `Text` as `size-2` rendered as a `label` element bound to the
 * control via `for`, with `fui-FieldLabel`.
 */
const FieldLabel: Component<FieldLabelProps> = (props) => {
  const context = useFieldContext("Field.Label");
  const rest = omit(props, "children", "class", "render");
  const resolved = children(() => props.children);
  const renderProp = props.render;
  // Label-flavored passthrough (`for`, label handlers) into span-typed `Text`
  // props: sound at runtime (the default branch renders a label) and
  // upstream-identical (`{...labelProps}` into `Text`).
  const textProps = rest as unknown as TextProps;
  // `for` is not a span attribute, so it rides a cast object; `Text` spreads
  // unknown props onto the slotted `label`, where it belongs.
  const labelFor = { for: context.controlId } as unknown as TextProps;
  return (
    <Text
      {...textProps}
      {...labelFor}
      id={context.labelId}
      size="2"
      render={renderProp ?? <label />}
      class={cx("fui-FieldLabel", props.class)}
    >
      {resolved()}
    </Text>
  );
};

/**
 * Props for `Field.Control`: native input props bound to the field. `id`,
 * `name`, `disabled`, `aria-invalid`, and `aria-describedby` come from the
 * field context, and the value lives on `Field.Root` (`value` /
 * `defaultValue` / `onValueChange`) - Solidix divergence from upstream
 * Base UI, where Control owns value state.
 */
interface FieldControlProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "children" | "disabled" | "id" | "name" | "ref" | "value"
> {
  /** Ref to the underlying input element. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Field control: the native input wired to the field context (`id`, `name`,
 * `disabled`, `aria-invalid`, `aria-describedby`), with controlled or
 * uncontrolled value state. Validity, touched, and dirty state refresh from
 * the live element on input, change, and blur.
 */
const FieldControl: Component<FieldControlProps> = (props) => {
  const context = useFieldContext("Field.Control");
  const rest = omit(props, "class", "onBlur", "onChange", "onInput", "ref");

  const describedBy = () =>
    context.invalid() ? `${context.descriptionId} ${context.errorId}` : context.descriptionId;

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
    callEventHandler(props.onInput, event);
    if (event.defaultPrevented) return;
    const next = event.currentTarget.value;
    // Root owns the value; setting it here flows back through the context
    // and fires Root's `onValueChange`.
    context.setFieldValue(next);
    context.refresh(event.currentTarget);
  };
  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (event) => {
    callEventHandler(props.onChange, event);
    if (event.defaultPrevented) return;
    context.refresh(event.currentTarget);
  };
  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    callEventHandler(props.onBlur, event);
    if (event.defaultPrevented) return;
    context.markTouched();
    context.refresh(event.currentTarget);
  };

  return (
    <input
      {...rest}
      ref={composeRefs(props.ref, (element) => {
        // Read initial validity once the element exists; attribute props are
        // assigned before refs fire, so constraint flags are already correct.
        if (element) context.refresh(element);
      })}
      id={context.controlId}
      name={context.name()}
      disabled={context.disabled()}
      aria-invalid={context.invalid() ? "true" : undefined}
      aria-describedby={describedBy()}
      data-disabled={context.disabled() ? "" : undefined}
      data-invalid={context.invalid() ? "" : undefined}
      data-touched={context.touched() ? "" : undefined}
      data-dirty={context.dirty() ? "" : undefined}
      value={context.fieldValue()}
      class={cx("fui-reset", props.class)}
      onInput={handleInput}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

/**
 * Props for `Field.Description`: themed `Text` props rendered as a `p`
 * referenced by the control's `aria-describedby`.
 */
interface FieldDescriptionProps extends Omit<TextProps, "render"> {
  /** Element or render function overriding the default `p` output. */
  render?: TextRenderProp | undefined;
}

/**
 * Field description: `Text` as `size-1` rendered as a paragraph with
 * `fui-FieldDescription`, referenced by the control for assistive tech.
 */
const FieldDescription: Component<FieldDescriptionProps> = (props) => {
  const context = useFieldContext("Field.Description");
  const rest = omit(props, "children", "class", "render");
  const resolved = children(() => props.children);
  const renderProp = props.render;
  const textProps = rest as unknown as TextProps;
  return (
    <Text
      {...textProps}
      id={context.descriptionId}
      size="1"
      render={renderProp ?? <p />}
      class={cx("fui-FieldDescription", props.class)}
    >
      {resolved()}
    </Text>
  );
};

/**
 * Props for `Field.Error`: themed `Text` props rendered only while the field
 * is invalid.
 */
interface FieldErrorProps extends Omit<TextProps, "render" | "style"> {
  /**
   * Style overrides for the error text. Object-only so the value merges
   * through `Slot` (string styles cannot merge with the slotted child).
   */
  style?: JSX.CSSProperties | undefined;
  /** Element or render function overriding the default `p` output. */
  render?: TextRenderProp | undefined;
  /**
   * Which validity flag gates the error. Defaults to any failing validity
   * (or the explicit `invalid` prop).
   */
  match?: keyof Omit<FieldValidityState, "value" | "valid"> | undefined;
}

/**
 * Field error: `Text` as `size-1` rendered as a paragraph with `fui-FieldError`
 * when the field is invalid (optionally gated on one validity flag via
 * `match`).
 */
const FieldError: Component<FieldErrorProps> = (props) => {
  const context = useFieldContext("Field.Error");
  const rest = omit(props, "children", "class", "match", "render");
  const resolved = children(() => props.children);
  const renderProp = props.render;
  const textProps = rest as unknown as TextProps;
  const match = () => props.match;
  const show = () => {
    if (!context.invalid()) return false;
    const flag = match();
    if (!flag) return true;
    return context.validity()[flag];
  };
  // Upstream `field.css` ships no hiding rule for `.fui-FieldError`: Base UI
  // `Field.Error` renders null unless the field is invalid, so the element
  // mounts only while the error shows.
  return (
    <Show when={show()}>
      <Text
        {...textProps}
        id={context.errorId}
        size="1"
        render={renderProp ?? <p />}
        class={cx("fui-FieldError", props.class)}
      >
        {resolved()}
      </Text>
    </Show>
  );
};

/**
 * Props for `Field.Item`: groups one control with its label, description, and
 * error inside a field that renders several controls (for example a group of
 * checkboxes or radios).
 */
interface FieldItemProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The item's label, control, description, and error parts. */
  children?: JSX.Element | undefined;
}

/**
 * Field item: a `div` with `fui-FieldItem` grouping one control and its parts.
 * Inside a `Field.Root` it renders the grouping alone; standalone it
 * self-provides a `Field.Root` (text-field precedent) so the control parts
 * resolve their context.
 */
const FieldItem: Component<FieldItemProps> = (props) => {
  // `useContext` throws without a provider, so detect a parent Root with
  // try/catch (same `ContextNotFoundError` pattern as `useFieldContext`).
  let parent: FieldContextValue | null = null;
  try {
    parent = useContext(FieldContext);
  } catch {
    parent = null;
  }
  const rest = omit(props, "children", "class");
  // Render function (not a hoisted const): the subtree must instantiate under
  // the provider owner when the standalone branch wraps it in a Root.
  const body = () => (
    <div {...rest} class={cx("fui-FieldItem", props.class)}>
      {props.children}
    </div>
  );
  if (parent) return body();
  // Standalone item: no control exists, so the wrapping root mints no
  // control id and labels stay unlinked (Base UI `Field.Item` parity).
  return <FieldRoot noControlId>{body()}</FieldRoot>;
};

/** Render-prop children for `Field.Validity`: receives the validity snapshot. */
type FieldValidityRenderProp = (state: FieldValidityState) => JSX.Element;

/**
 * Props for `Field.Validity`: render-prop access to the field's validity
 * snapshot (`value`, `valid`, and the native constraint flags).
 */
interface FieldValidityProps {
  /** Render function receiving the current validity snapshot. */
  children: FieldValidityRenderProp;
}

/**
 * Field validity: calls its render-prop child with the live validity
 * snapshot so consumers can branch on individual constraint flags.
 */
const FieldValidity: Component<FieldValidityProps> = (props) => {
  const context = useFieldContext("Field.Validity");
  // Reactive snapshot: Base UI re-renders `Field.Validity` children whenever
  // validity state changes, so re-invoke the render prop from a memo instead
  // of snapshotting it once.
  const rendered = createMemo(() => props.children(context.validity()));
  return <>{rendered()}</>;
};

/**
 * Field namespace: `Root`, `Label`, `Control`, `Description`, `Error`, `Item`,
 * and `Validity`, matching the upstream export shape.
 */
const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
  Item: FieldItem,
  Validity: FieldValidity,
};

export { Field, FieldContext, useFieldContext, useFieldRootState };
export type {
  FieldContextValue,
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldItemProps,
  FieldLabelProps,
  FieldRootProps,
  FieldRootStateProps,
  FieldValidityProps,
  FieldValidityRenderProp,
  FieldValidityState,
};
