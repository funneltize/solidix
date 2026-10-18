import { Show, createEffect, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import { useSize } from "@solidix/use-size";

const CHECKBOX_NAME = "Checkbox";

type ScopedProps<P> = P & { __scopeCheckbox?: Scope | undefined };
const [createCheckboxContext, createCheckboxScope] = createContextScope(CHECKBOX_NAME);

type CheckedState = boolean | "indeterminate";

interface CheckboxUserClick {
  requestedChecked: boolean;
  hasConsumerStoppedPropagation: boolean;
}

type CheckboxContextValue<State extends CheckedState | boolean = CheckedState> = {
  checked: () => State | boolean;
  setChecked: (next: State | boolean | ((prev: State | boolean) => State | boolean)) => void;
  disabled: () => boolean | undefined;
  control: () => HTMLButtonElement | null;
  setControl: (node: HTMLButtonElement | null) => void;
  name: () => string | undefined;
  form: () => string | undefined;
  value: () => string | number | readonly string[];
  userClick: () => CheckboxUserClick | null;
  onUserClick: (userClick: CheckboxUserClick) => void;
  required: () => boolean | undefined;
  defaultChecked: () => boolean | undefined;
  isFormControl: () => boolean;
  bubbleInput: () => HTMLInputElement | null;
  setBubbleInput: (node: HTMLInputElement | null) => void;
};

const [CheckboxProviderImpl, useCheckboxContext] =
  createCheckboxContext<CheckboxContextValue>(CHECKBOX_NAME);

/* -------------------------------------------------------------------------------------------------
 * CheckboxProvider
 * -----------------------------------------------------------------------------------------------*/

interface CheckboxProviderProps<State extends CheckedState = CheckedState> {
  checked?: State | boolean | undefined;
  defaultChecked?: State | boolean | undefined;
  required?: boolean | undefined;
  onCheckedChange?:
    | { bivarianceHack(checked: State | boolean): void }["bivarianceHack"]
    | undefined;
  name?: string | undefined;
  form?: string | undefined;
  disabled?: boolean | undefined;
  value?: string | number | readonly string[] | undefined;
  children?: JSX.Element | undefined;
}

/**
 * Internal props for `CheckboxProvider`. `internal_do_not_use_render` is how
 * `Checkbox` renders its trigger plus the conditional bubble input; it is not
 * part of the public API.
 */
type CheckboxProviderInternalProps<State extends CheckedState = CheckedState> =
  CheckboxProviderProps<State> & {
    internal_do_not_use_render?:
      | ((context: CheckboxContextValue<State>) => JSX.Element)
      | undefined;
  };

function CheckboxProvider<State extends CheckedState = CheckedState>(
  props: ScopedProps<CheckboxProviderInternalProps<State>>,
): JSX.Element {
  const [checked, setChecked] = useControllableState<State | boolean>({
    prop: () => props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: props.onCheckedChange,
    caller: CHECKBOX_NAME,
  });
  const [control, setControl] = createSignal<HTMLButtonElement | null>(null);
  const [bubbleInput, setBubbleInput] = createSignal<HTMLInputElement | null>(null);
  // The latest user click on the trigger. The bubble input dispatches the click
  // to the form once the update has propagated, whether or not `checked`
  // changes in the same flush.
  const [userClick, setUserClick] = createSignal<CheckboxUserClick | null>(null);

  const isFormControl = () => {
    const element = control();
    return element
      ? !!props.form || !!element.closest("form")
      : // We set this to true by default so that events bubble to forms without JS (SSR)
        true;
  };

  const contextValue: CheckboxContextValue<State> = {
    checked,
    setChecked,
    disabled: () => props.disabled,
    control,
    setControl,
    name: () => props.name,
    form: () => props.form,
    value: () => props.value ?? "on",
    userClick,
    onUserClick: setUserClick,
    required: () => props.required,
    defaultChecked: () => {
      const defaultChecked = props.defaultChecked;
      return isIndeterminate(defaultChecked) ? false : defaultChecked;
    },
    isFormControl,
    bubbleInput,
    setBubbleInput,
  };

  return (
    <CheckboxProviderImpl
      scope={props.__scopeCheckbox}
      {...(contextValue as unknown as CheckboxContextValue<CheckedState>)}
    >
      {props.internal_do_not_use_render
        ? props.internal_do_not_use_render(contextValue)
        : props.children}
    </CheckboxProviderImpl>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CheckboxTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "CheckboxTrigger";

type CheckboxTriggerProps = Omit<PrimitivePropsWithRef<"button">, keyof CheckboxProviderProps> & {
  children?: JSX.Element | undefined;
};

const CheckboxTrigger: Component<ScopedProps<CheckboxTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeCheckbox", "onKeyDown", "onClick", "ref");
  const context = useCheckboxContext(TRIGGER_NAME, props.__scopeCheckbox);
  const composedRefs = useComposedRefs(props.ref, context.setControl);

  const initialChecked = context.checked();
  createEffect(
    () => context.control(),
    (control) => {
      const form = control?.form;
      if (form) {
        const reset = () => context.setChecked(initialChecked);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    },
  );

  const handleKeyDown = composeEventHandlers(
    (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
    (event) => {
      // According to WAI ARIA, Checkboxes don't activate on enter keypress
      if (event.key === "Enter") event.preventDefault();
    },
  );

  const handleClick = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onClick, event),
    (event) => {
      // Solid handlers receive native events, which have no
      // `isPropagationStopped` - `cancelBubble` reports the same thing.
      const hasConsumerStoppedPropagation = event.cancelBubble;
      const checked = context.checked();
      context.onUserClick({
        requestedChecked: isIndeterminate(checked) ? true : !checked,
        hasConsumerStoppedPropagation,
      });
      context.setChecked((prevChecked) => (isIndeterminate(prevChecked) ? true : !prevChecked));
      if (context.bubbleInput() && context.isFormControl()) {
        // if checkbox has a bubble input and is a form control, stop
        // propagation from the button so that we only propagate one click
        // event (from the input). We propagate changes from an input so
        // that native form validation works and form events reflect
        // checkbox updates.
        if (!hasConsumerStoppedPropagation) event.stopPropagation();
      }
    },
  );

  return (
    <Primitive.button
      type="button"
      role="checkbox"
      aria-checked={getAriaChecked(context.checked())}
      aria-required={ariaBoolean(context.required())}
      data-state={getState(context.checked())}
      data-disabled={context.disabled() ? "" : undefined}
      disabled={context.disabled()}
      value={String(context.value())}
      {...rest}
      ref={composedRefs}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Checkbox
 * -----------------------------------------------------------------------------------------------*/

type CheckboxProps = Omit<
  PrimitivePropsWithRef<"button">,
  "checked" | "defaultChecked" | "required" | "disabled" | "name" | "form" | "value"
> & {
  checked?: CheckedState | undefined;
  defaultChecked?: CheckedState | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  value?: string | number | readonly string[] | undefined;
  onCheckedChange?: { bivarianceHack(checked: CheckedState): void }["bivarianceHack"] | undefined;
};

const Checkbox: Component<ScopedProps<CheckboxProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeCheckbox",
    "name",
    "checked",
    "defaultChecked",
    "required",
    "disabled",
    "value",
    "onCheckedChange",
    "form",
    "ref",
  );

  return (
    <CheckboxProvider
      __scopeCheckbox={props.__scopeCheckbox}
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      disabled={props.disabled}
      required={props.required}
      onCheckedChange={props.onCheckedChange}
      name={props.name}
      form={props.form}
      value={props.value}
      internal_do_not_use_render={(context) => (
        <>
          <CheckboxTrigger {...rest} ref={props.ref} __scopeCheckbox={props.__scopeCheckbox} />
          <Show when={context.isFormControl()}>
            <CheckboxBubbleInput __scopeCheckbox={props.__scopeCheckbox} />
          </Show>
        </>
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * CheckboxIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = "CheckboxIndicator";

type CheckboxIndicatorProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
  style?: JSX.CSSProperties | undefined;
};

const CheckboxIndicator: Component<ScopedProps<CheckboxIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeCheckbox", "forceMount", "style", "ref");
  const context = useCheckboxContext(INDICATOR_NAME, props.__scopeCheckbox);
  return (
    <Presence
      present={() =>
        props.forceMount || isIndeterminate(context.checked()) || context.checked() === true
      }
    >
      <Primitive.span
        data-state={getState(context.checked())}
        data-disabled={context.disabled() ? "" : undefined}
        {...rest}
        ref={props.ref}
        style={{ "pointer-events": "none", ...props.style }}
      />
    </Presence>
  );
};

/* -------------------------------------------------------------------------------------------------
 * CheckboxBubbleInput
 * -----------------------------------------------------------------------------------------------*/

const BUBBLE_INPUT_NAME = "CheckboxBubbleInput";

type CheckboxBubbleInputProps = Omit<PrimitivePropsWithRef<"input">, "checked" | "style"> & {
  style?: JSX.CSSProperties | undefined;
};

const CheckboxBubbleInput: Component<ScopedProps<CheckboxBubbleInputProps>> = (props) => {
  const rest = omit(props, "__scopeCheckbox", "onClick", "style", "ref");
  const context = useCheckboxContext(BUBBLE_INPUT_NAME, props.__scopeCheckbox);

  const composedRefs = useComposedRefs(props.ref, context.setBubbleInput);
  const controlSize = useSize(context.control);
  // When the checked change is not driven by a user interaction (e.g. a
  // controlled `checked` update), the `click` event we dispatch to notify
  // forms must not reach ancestor `onClick` handlers. We can't simply make it
  // non-bubbling because the form derives the checkbox's `change` event from a
  // bubbling `click`. Instead we stop propagation of the synthetic click,
  // which still lets the `change` event reach the form.
  let shouldStopClickPropagation = false;
  let prevChecked = context.checked();
  // The user click this input last dispatched, so each click is dispatched
  // once.
  let handledUserClick = context.userClick();
  // A dispatched user click whose `checked` change hasn't been applied yet
  // (e.g. a controlled parent applying it later). When it is applied, it
  // must still respect the consumer stopping the click's propagation.
  let pendingUserClick: CheckboxUserClick | null = null;

  // Bubble checked change to parents (e.g form change event)
  createEffect(
    () => ({
      input: context.bubbleInput(),
      checked: context.checked(),
      userClick: context.userClick(),
    }),
    ({ input, checked, userClick }) => {
      if (!input) return;

      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked",
      ) as PropertyDescriptor;
      const setChecked = descriptor.set;
      if (!setChecked) return;

      const checkedChanged = prevChecked !== checked;
      prevChecked = checked;
      const isNewUserClick = userClick !== null && userClick !== handledUserClick;
      handledUserClick = userClick;

      if (isNewUserClick) {
        // Dispatch the user's click even if `checked` hasn't changed (yet), so
        // ancestors are notified of every click on the trigger.
        pendingUserClick = checkedChanged ? null : userClick;
        if (checkedChanged) {
          input.indeterminate = isIndeterminate(checked);
          setChecked.call(input, isIndeterminate(checked) ? false : checked);
        }
        dispatchBubbleEvents(input, !userClick.hasConsumerStoppedPropagation, checkedChanged);
      } else if (checkedChanged) {
        const pending = pendingUserClick;
        pendingUserClick = null;
        const isPendingUserChange = pending?.requestedChecked === checked;
        // The user's click already reached ancestors, and programmatic
        // updates never do, so this click only notifies the form.
        shouldStopClickPropagation = true;
        input.indeterminate = isIndeterminate(checked);
        setChecked.call(input, isIndeterminate(checked) ? false : checked);
        dispatchBubbleEvents(
          input,
          !(isPendingUserChange && pending.hasConsumerStoppedPropagation),
          true,
        );
        shouldStopClickPropagation = false;
      }
    },
  );

  const checkedInitial = context.checked();
  const defaultCheckedInitial = isIndeterminate(checkedInitial) ? false : checkedInitial;
  const handleClick = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onClick, event),
    (event) => {
      // Prevent the synthetic click dispatched on controlled/programmatic
      // updates from triggering ancestor `onClick` handlers, while still
      // allowing the resulting `change` event to reach the form.
      if (shouldStopClickPropagation) {
        event.stopPropagation();
      }
    },
  );

  // Solid does not append `px` to numeric style values the way React does.
  const sizeStyle = () => {
    const size = controlSize();
    return size ? { width: `${size.width}px`, height: `${size.height}px` } : {};
  };

  return (
    <Primitive.input
      type="checkbox"
      // NOTE: explicit `"true"` - Solid renders a bare boolean as `""`, which
      // does not hide the element from assistive technology.
      aria-hidden="true"
      defaultChecked={context.defaultChecked() ?? defaultCheckedInitial}
      required={context.required()}
      disabled={context.disabled()}
      name={context.name()}
      value={String(context.value())}
      form={context.form()}
      {...rest}
      tabindex={-1}
      ref={composedRefs}
      onClick={handleClick}
      style={{
        ...props.style,
        ...sizeStyle(),
        position: "absolute",
        "pointer-events": "none",
        opacity: 0,
        margin: 0,
        // We transform because the input is absolutely positioned but we have
        // rendered it **after** the button. This pulls it back to sit on top
        // of the button.
        transform: "translateX(-100%)",
      }}
    />
  );
};

/* ---------------------------------------------------------------------------------------------- */

function isIndeterminate(checked?: CheckedState | boolean): checked is "indeterminate" {
  return checked === "indeterminate";
}

function getAriaChecked(checked: CheckedState | boolean): "true" | "false" | "mixed" {
  if (isIndeterminate(checked)) return "mixed";
  return checked ? "true" : "false";
}

/**
 * Notifies ancestors and forms of a user click. The `click` preserves Radix's
 * ancestor-notification semantics exactly; `input`/`change` additionally notify
 * forms, which Solid - unlike React - does not derive from clicks (React
 * synthesizes `onChange` from bubbling clicks, Solid listens natively). Form
 * events fire only when `checked` actually changed (matching React's change
 * detection) and are withheld when the click must not propagate, so a consumer
 * stopping propagation still silences form notification.
 */
function dispatchBubbleEvents(input: HTMLInputElement, bubbles: boolean, notifyForm: boolean) {
  input.dispatchEvent(new Event("click", { bubbles }));
  if (bubbles && notifyForm) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function getState(checked: CheckedState | boolean) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}

export {
  createCheckboxScope,
  //
  Checkbox,
  CheckboxProvider,
  CheckboxTrigger,
  CheckboxIndicator,
  CheckboxBubbleInput,
  //
  Checkbox as Root,
  CheckboxProvider as Provider,
  CheckboxTrigger as Trigger,
  CheckboxIndicator as Indicator,
  CheckboxBubbleInput as BubbleInput,
};
export type {
  CheckboxProps,
  CheckboxProviderProps,
  CheckboxTriggerProps,
  CheckboxIndicatorProps,
  CheckboxBubbleInputProps,
  CheckedState,
};
