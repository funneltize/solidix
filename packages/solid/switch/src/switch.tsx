import { Show, createEffect, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import { useSize } from "@solidix/use-size";

const SWITCH_NAME = "Switch";

type ScopedProps<P> = P & { __scopeSwitch?: Scope | undefined };
const [createSwitchContext, createSwitchScope] = createContextScope(SWITCH_NAME);

interface SwitchUserClick {
  requestedChecked: boolean;
  hasConsumerStoppedPropagation: boolean;
}

type SwitchContextValue = {
  checked: () => boolean;
  setChecked: (next: boolean | ((prev: boolean) => boolean)) => void;
  disabled: () => boolean | undefined;
  control: () => HTMLButtonElement | null;
  setControl: (node: HTMLButtonElement | null) => void;
  name: () => string | undefined;
  form: () => string | undefined;
  value: () => string | number | readonly string[];
  userClick: () => SwitchUserClick | null;
  onUserClick: (userClick: SwitchUserClick) => void;
  required: () => boolean | undefined;
  defaultChecked: () => boolean | undefined;
  isFormControl: () => boolean;
  bubbleInput: () => HTMLInputElement | null;
  setBubbleInput: (node: HTMLInputElement | null) => void;
};

const [SwitchProviderImpl, useSwitchContext] = createSwitchContext<SwitchContextValue>(SWITCH_NAME);

/* -------------------------------------------------------------------------------------------------
 * SwitchProvider
 * -----------------------------------------------------------------------------------------------*/

interface SwitchProviderProps {
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  required?: boolean | undefined;
  onCheckedChange?: { bivarianceHack(checked: boolean): void }["bivarianceHack"] | undefined;
  name?: string | undefined;
  form?: string | undefined;
  disabled?: boolean | undefined;
  value?: string | number | readonly string[] | undefined;
  children?: JSX.Element | undefined;
}

/**
 * Internal props for `SwitchProvider`. `internal_do_not_use_render` is how
 * `Switch` renders its trigger plus the conditional bubble input; it is not
 * part of the public API.
 */
type SwitchProviderInternalProps = SwitchProviderProps & {
  internal_do_not_use_render?: ((context: SwitchContextValue) => JSX.Element) | undefined;
};

const SwitchProvider: Component<ScopedProps<SwitchProviderInternalProps>> = (props) => {
  const [checked, setChecked] = useControllableState({
    prop: () => props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: props.onCheckedChange,
    caller: SWITCH_NAME,
  });
  const [control, setControl] = createSignal<HTMLButtonElement | null>(null);
  const [bubbleInput, setBubbleInput] = createSignal<HTMLInputElement | null>(null);
  // The latest user click on the trigger. The bubble input dispatches the click
  // to the form once the update has propagated, whether or not `checked`
  // changes in the same flush.
  const [userClick, setUserClick] = createSignal<SwitchUserClick | null>(null);

  const isFormControl = () => {
    const element = control();
    return element
      ? !!props.form || !!element.closest("form")
      : // We set this to true by default so that events bubble to forms without JS (SSR)
        true;
  };

  const contextValue: SwitchContextValue = {
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
    defaultChecked: () => props.defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput,
  };

  return (
    <SwitchProviderImpl scope={props.__scopeSwitch} {...contextValue}>
      {props.internal_do_not_use_render
        ? props.internal_do_not_use_render(contextValue)
        : props.children}
    </SwitchProviderImpl>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SwitchTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "SwitchTrigger";

type SwitchTriggerProps = Omit<PrimitivePropsWithRef<"button">, keyof SwitchProviderProps> & {
  children?: JSX.Element | undefined;
};

const SwitchTrigger: Component<ScopedProps<SwitchTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeSwitch", "onClick", "ref");
  const context = useSwitchContext(TRIGGER_NAME, props.__scopeSwitch);
  const composedRefs = useComposedRefs(props.ref, context.setControl);

  const initialChecked = context.checked();
  createEffect(
    () => ({ control: context.control(), form: context.form() }),
    ({ control, form }) => {
      const associatedForm = form ? control?.ownerDocument.getElementById(form) : control?.form;
      if (associatedForm instanceof HTMLFormElement) {
        const reset = () => context.setChecked(initialChecked);
        associatedForm.addEventListener("reset", reset);
        return () => associatedForm.removeEventListener("reset", reset);
      }
    },
  );

  const handleClick = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onClick, event),
    (event) => {
      // Solid handlers receive native events, which have no
      // `isPropagationStopped` - `cancelBubble` reports the same thing.
      const hasConsumerStoppedPropagation = event.cancelBubble;
      context.onUserClick({
        requestedChecked: !context.checked(),
        hasConsumerStoppedPropagation,
      });
      context.setChecked((prevChecked) => !prevChecked);
      if (context.bubbleInput() && context.isFormControl()) {
        // if switch has a bubble input and is a form control, stop
        // propagation from the button so that we only propagate one click
        // event. We propagate changes from an input so that native form
        // validation works and form events reflect switch updates.
        if (!hasConsumerStoppedPropagation) {
          event.stopPropagation();
        }
      }
    },
  );

  return (
    <Primitive.button
      type="button"
      role="switch"
      aria-checked={ariaBoolean(context.checked())}
      aria-required={ariaBoolean(context.required())}
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
 * Switch
 * -----------------------------------------------------------------------------------------------*/

type SwitchProps = Omit<
  PrimitivePropsWithRef<"button">,
  "checked" | "defaultChecked" | "required" | "disabled" | "name" | "form" | "value"
> & {
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  value?: string | number | readonly string[] | undefined;
  onCheckedChange?: { bivarianceHack(checked: boolean): void }["bivarianceHack"] | undefined;
};

const Switch: Component<ScopedProps<SwitchProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSwitch",
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
    <SwitchProvider
      __scopeSwitch={props.__scopeSwitch}
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
          <SwitchTrigger {...rest} ref={props.ref} __scopeSwitch={props.__scopeSwitch} />
          <Show when={context.isFormControl()}>
            <SwitchBubbleInput __scopeSwitch={props.__scopeSwitch} />
          </Show>
        </>
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SwitchThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = "SwitchThumb";

type SwitchThumbProps = PrimitivePropsWithRef<"span">;

const SwitchThumb: Component<ScopedProps<SwitchThumbProps>> = (props) => {
  const rest = omit(props, "__scopeSwitch", "ref");
  const context = useSwitchContext(THUMB_NAME, props.__scopeSwitch);
  return (
    <Primitive.span
      data-state={getState(context.checked())}
      data-disabled={context.disabled() ? "" : undefined}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SwitchBubbleInput
 * -----------------------------------------------------------------------------------------------*/

const BUBBLE_INPUT_NAME = "SwitchBubbleInput";

type SwitchBubbleInputProps = Omit<PrimitivePropsWithRef<"input">, "checked" | "style"> & {
  style?: JSX.CSSProperties | undefined;
};

const SwitchBubbleInput: Component<ScopedProps<SwitchBubbleInputProps>> = (props) => {
  const rest = omit(props, "__scopeSwitch", "onClick", "style", "ref");
  const context = useSwitchContext(BUBBLE_INPUT_NAME, props.__scopeSwitch);

  const composedRefs = useComposedRefs(props.ref, context.setBubbleInput);
  const controlSize = useSize(context.control);
  // When the checked change is not driven by a user interaction (e.g. a
  // controlled `checked` update), the `click` event we dispatch to notify
  // forms must not reach ancestor `onClick` handlers. We can't simply make it
  // non-bubbling because the form derives the switch's `change` event from a
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
  let pendingUserClick: SwitchUserClick | null = null;

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
      if (!setChecked) {
        return;
      }

      const checkedChanged = prevChecked !== checked;
      prevChecked = checked;
      const isNewUserClick = userClick !== null && userClick !== handledUserClick;
      handledUserClick = userClick;

      if (isNewUserClick) {
        // Dispatch the user's click even if `checked` hasn't changed yet, so
        // ancestors are notified of every click on the trigger.
        pendingUserClick = checkedChanged ? null : userClick;
        if (checkedChanged) {
          setChecked.call(input, checked);
        }
        dispatchBubbleEvents(input, !userClick.hasConsumerStoppedPropagation, checkedChanged);
      } else if (checkedChanged) {
        const pending = pendingUserClick;
        pendingUserClick = null;
        const isPendingUserChange = pending?.requestedChecked === checked;
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

/* -----------------------------------------------------------------------------------------------*/

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
  createSwitchScope,
  //
  Switch,
  SwitchProvider,
  SwitchTrigger,
  SwitchThumb,
  SwitchBubbleInput,
  //
  Switch as Root,
  SwitchProvider as Provider,
  SwitchTrigger as Trigger,
  SwitchThumb as Thumb,
  SwitchBubbleInput as BubbleInput,
};
export type {
  SwitchProps,
  SwitchProviderProps,
  SwitchTriggerProps,
  SwitchThumbProps,
  SwitchBubbleInputProps,
};
