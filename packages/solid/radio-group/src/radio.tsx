import { Show, createEffect, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useSize } from "@solidix/use-size";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";

const RADIO_NAME = "Radio";

type ScopedProps<P> = P & { __scopeRadio?: Scope | undefined };
/** Creates a radio scope for nesting multiple independent radios. */
const [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);

type RadioUserClick = {
  hasConsumerStoppedPropagation: boolean;
};

type RadioContextValue = {
  checked: () => boolean;
  disabled: () => boolean | undefined;
  required: () => boolean | undefined;
  name: () => string | undefined;
  form: () => string | undefined;
  value: () => string | number | readonly string[];
  control: () => HTMLButtonElement | null;
  setControl: (node: HTMLButtonElement | null) => void;
  userClick: () => RadioUserClick | null;
  onUserClick: (userClick: RadioUserClick) => void;
  isFormControl: () => boolean;
  bubbleInput: () => HTMLInputElement | null;
  setBubbleInput: (node: HTMLInputElement | null) => void;
  onCheck(): void;
};

/** Reads the radio context for the closest radio provider. */
const [RadioProviderImpl, useRadioContext] = createRadioContext<RadioContextValue>(RADIO_NAME);

/* -------------------------------------------------------------------------------------------------
 * RadioProvider
 * -----------------------------------------------------------------------------------------------*/

interface RadioProviderProps {
  checked?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  value?: string | number | readonly string[] | undefined;
  onCheck?: (() => void) | undefined;
  children?: JSX.Element | undefined;
}

/**
 * Internal props for `RadioProvider`. `internal_do_not_use_render` is how the
 * item renders its trigger plus the conditional bubble input; it is not part
 * of the public API.
 */
type RadioProviderInternalProps = RadioProviderProps & {
  internal_do_not_use_render?: ((context: RadioContextValue) => JSX.Element) | undefined;
};

/** Provides the radio context for composing a custom radio. */
const RadioProvider: Component<ScopedProps<RadioProviderInternalProps>> = (props) => {
  const [control, setControl] = createSignal<HTMLButtonElement | null>(null);
  const [bubbleInput, setBubbleInput] = createSignal<HTMLInputElement | null>(null);
  // The latest user click on the trigger that checks the radio. The bubble
  // input dispatches the click to the form once the update has propagated,
  // whether or not `checked` changes in the same flush.
  const [userClick, setUserClick] = createSignal<RadioUserClick | null>(null);

  const isFormControl = () => {
    const element = control();
    return element
      ? !!props.form || !!element.closest("form")
      : // We set this to true by default so that events bubble to forms without JS (SSR)
        true;
  };

  const contextValue: RadioContextValue = {
    checked: () => props.checked ?? false,
    disabled: () => props.disabled,
    required: () => props.required,
    name: () => props.name,
    form: () => props.form,
    value: () => props.value ?? "on",
    control,
    setControl,
    userClick,
    onUserClick: setUserClick,
    isFormControl,
    bubbleInput,
    setBubbleInput,
    onCheck: () => props.onCheck?.(),
  };

  return (
    <RadioProviderImpl scope={props.__scopeRadio} {...contextValue}>
      {props.internal_do_not_use_render
        ? props.internal_do_not_use_render(contextValue)
        : props.children}
    </RadioProviderImpl>
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "RadioTrigger";

type RadioTriggerProps = Omit<PrimitivePropsWithRef<"button">, keyof RadioProviderProps> & {
  children?: JSX.Element | undefined;
};

/** The button that checks the radio when activated. */
const RadioTrigger: Component<ScopedProps<RadioTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeRadio", "onClick", "ref");
  const context = useRadioContext(TRIGGER_NAME, props.__scopeRadio);
  const composedRefs = useComposedRefs(props.ref, context.setControl);

  const handleClick = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onClick, event),
    (event) => {
      // Solid handlers receive native events, which have no
      // `isPropagationStopped` - `cancelBubble` reports the same thing.
      const hasConsumerStoppedPropagation = event.cancelBubble;
      // radios cannot be unchecked so we only communicate a checked state.
      if (!context.checked()) {
        context.onUserClick({ hasConsumerStoppedPropagation });
        context.onCheck();
      }

      if (context.bubbleInput() && context.isFormControl()) {
        // if radio has a bubble input and is a form control, stop
        // propagation from the button so that we only propagate one click
        // event (from the input). We propagate changes from an input so
        // that native form validation works and form events reflect radio
        // updates.
        if (!hasConsumerStoppedPropagation) {
          event.stopPropagation();
        }
      }
    },
  );

  return (
    <Primitive.button
      type="button"
      role="radio"
      aria-checked={ariaBoolean(context.checked())}
      data-state={getState(context.checked())}
      data-disabled={context.disabled() ? "" : undefined}
      disabled={context.disabled()}
      value={String(context.value())}
      {...rest}
      ref={composedRefs}
      onClick={handleClick}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Radio
 * -----------------------------------------------------------------------------------------------*/

type RadioProps = Omit<
  PrimitivePropsWithRef<"button">,
  "checked" | "required" | "disabled" | "name" | "form" | "value"
> & {
  checked?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  value?: string | number | readonly string[] | undefined;
  onCheck?: (() => void) | undefined;
};

/** A standalone radio button with managed checked state. */
const Radio: Component<ScopedProps<RadioProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeRadio",
    "name",
    "checked",
    "required",
    "disabled",
    "value",
    "onCheck",
    "form",
    "ref",
  );

  return (
    <RadioProvider
      __scopeRadio={props.__scopeRadio}
      checked={props.checked}
      disabled={props.disabled}
      required={props.required}
      onCheck={props.onCheck}
      name={props.name}
      form={props.form}
      value={props.value}
      internal_do_not_use_render={(context) => (
        <>
          <RadioTrigger {...rest} ref={props.ref} __scopeRadio={props.__scopeRadio} />
          <Show when={context.isFormControl()}>
            <RadioBubbleInput __scopeRadio={props.__scopeRadio} />
          </Show>
        </>
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = "RadioIndicator";

interface RadioIndicatorProps extends PrimitivePropsWithRef<"span"> {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
}

/** The visual element rendered inside the radio when it is checked. */
const RadioIndicator: Component<ScopedProps<RadioIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeRadio", "forceMount", "ref");
  const context = useRadioContext(INDICATOR_NAME, props.__scopeRadio);
  return (
    <Presence present={() => props.forceMount || context.checked()}>
      <Primitive.span
        data-state={getState(context.checked())}
        data-disabled={context.disabled() ? "" : undefined}
        {...rest}
        ref={props.ref}
      />
    </Presence>
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioBubbleInput
 * -----------------------------------------------------------------------------------------------*/

const BUBBLE_INPUT_NAME = "RadioBubbleInput";

type RadioBubbleInputProps = Omit<PrimitivePropsWithRef<"input">, "checked" | "style"> & {
  style?: JSX.CSSProperties | undefined;
};

/** The hidden native input that syncs the radio value with forms. */
const RadioBubbleInput: Component<ScopedProps<RadioBubbleInputProps>> = (props) => {
  const rest = omit(props, "__scopeRadio", "onClick", "style", "ref");
  const context = useRadioContext(BUBBLE_INPUT_NAME, props.__scopeRadio);

  const composedRefs = useComposedRefs(props.ref, context.setBubbleInput);
  const controlSize = useSize(context.control);
  // When the checked change is not driven by a user interaction (e.g. a
  // controlled `checked` update), the `click` event we dispatch to notify
  // forms must not reach ancestor `onClick` handlers. We can't simply make it
  // non-bubbling because the form derives the radio's `change` event from a
  // bubbling `click`. Instead we stop propagation of the synthetic click,
  // which still lets the `change` event reach the form.
  let shouldStopClickPropagation = false;
  let prevChecked = context.checked();
  // The user click this input last dispatched, so each click is dispatched
  // once.
  let handledUserClick = context.userClick();
  // A dispatched user click whose check hasn't been applied yet (e.g. a
  // controlled parent applying it later). When it is applied, it must still
  // respect the consumer stopping the click's propagation.
  let pendingUserClick: RadioUserClick | null = null;

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
        // Dispatch the user's click even if the radio isn't checked (yet), so
        // ancestors are notified of every click on the trigger.
        pendingUserClick = checkedChanged ? null : userClick;
        if (checkedChanged) {
          setChecked.call(input, checked);
        }
        dispatchBubbleEvents(input, !userClick.hasConsumerStoppedPropagation, checkedChanged);
      } else if (checkedChanged) {
        const pending = pendingUserClick;
        pendingUserClick = null;
        const isPendingUserChange = checked && pending !== null;
        // The user's click already reached ancestors, and programmatic
        // updates never do, so this click only notifies the form.
        shouldStopClickPropagation = true;
        setChecked.call(input, checked);
        dispatchBubbleEvents(
          input,
          !(isPendingUserChange && pending.hasConsumerStoppedPropagation),
          true,
        );
        shouldStopClickPropagation = false;
      }
    },
  );

  const defaultCheckedInitial = context.checked();
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
      type="radio"
      // NOTE: explicit `"true"` - Solid renders a bare boolean as `""`, which
      // does not hide the element from assistive technology.
      aria-hidden="true"
      defaultChecked={defaultCheckedInitial}
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

function getState(checked: boolean) {
  return checked ? "checked" : "unchecked";
}

export {
  createRadioScope,
  useRadioContext,
  //
  Radio,
  RadioProvider,
  RadioTrigger,
  RadioIndicator,
  RadioBubbleInput,
};
export type {
  RadioProps,
  RadioProviderProps,
  RadioTriggerProps,
  RadioIndicatorProps,
  RadioBubbleInputProps,
  RadioContextValue,
};
