import { Show, createEffect, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";
import { useId } from "@solidix/id";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import { useEffectEvent } from "@solidix/use-effect-event";
import { useIsHydrated } from "@solidix/use-is-hydrated";
import { useLayoutEffect } from "@solidix/use-layout-effect";

const PASSWORD_TOGGLE_FIELD_NAME = "PasswordToggleField";

const AutoComplete = {
  CurrentPassword: "current-password",
  NewPassword: "new-password",
} as const;

type AutoComplete = (typeof AutoComplete)[keyof typeof AutoComplete];

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldProvider
 * -----------------------------------------------------------------------------------------------*/

type InternalFocusState = {
  clickTriggered: boolean;
  selectionStart: number | null;
  selectionEnd: number | null;
};

type PasswordToggleFieldContextValue = {
  inputId: () => string;
  inputRef: RefObject<HTMLInputElement | null>;
  visible: () => boolean;
  setVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  syncInputId: (providedId: string | number | false | undefined) => void;
  focusState: RefObject<InternalFocusState>;
};

const [createPasswordToggleFieldContext] = createContextScope(PASSWORD_TOGGLE_FIELD_NAME);
const [PasswordToggleFieldProvider, usePasswordToggleFieldContext] =
  createPasswordToggleFieldContext<PasswordToggleFieldContextValue>(PASSWORD_TOGGLE_FIELD_NAME);

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleField
 * -----------------------------------------------------------------------------------------------*/

type ScopedProps<P> = P & { __scopePasswordToggleField?: Scope | undefined };

/** Props accepted by the password toggle field root. */
type PasswordToggleFieldProps = {
  id?: string | undefined;
  visible?: boolean | undefined;
  defaultVisible?: boolean | undefined;
  onVisibilityChange?: { bivarianceHack(visible: boolean): void }["bivarianceHack"] | undefined;
  children?: JSX.Element | undefined;
};

const INITIAL_FOCUS_STATE: InternalFocusState = {
  clickTriggered: false,
  selectionStart: null,
  selectionEnd: null,
};

/** Root provider holding the visible state shared by the password field parts. */
const PasswordToggleField: Component<ScopedProps<PasswordToggleFieldProps>> = (props) => {
  const baseId = useId(props.id);
  const defaultInputId = `${baseId}-input`;
  const [inputIdState, setInputIdState] = createSignal<null | string>(defaultInputId);
  const inputId = () => inputIdState() ?? defaultInputId;
  const syncInputId = (providedId: string | number | false | undefined) =>
    setInputIdState(providedId == null || providedId === false ? null : String(providedId));

  let onVisibilityChange = props.onVisibilityChange;
  let shouldWarn = false;
  if (
    !onVisibilityChange &&
    "onVisiblityChange" in props &&
    typeof (props as Record<string, unknown>).onVisiblityChange === "function"
  ) {
    shouldWarn = true;
    onVisibilityChange = (props as Record<string, unknown>).onVisiblityChange as (
      visible: boolean,
    ) => void;
  } else {
    onVisibilityChange = props.onVisibilityChange;
  }

  if (IS_DEVELOPMENT) {
    useLayoutEffect(() => {
      if (shouldWarn) {
        console.warn(
          "PasswordToggleField: The misspelled `onVisiblityChange` prop has been removed. Please use `onVisibilityChange` instead.",
        );
      }
    });
  }

  const [visible, setVisible] = useControllableState({
    caller: PASSWORD_TOGGLE_FIELD_NAME,
    prop: () => props.visible,
    defaultProp: props.defaultVisible ?? false,
    onChange: onVisibilityChange,
  });

  const inputRef: RefObject<HTMLInputElement | null> = { current: null };
  const focusState: RefObject<InternalFocusState> = { current: INITIAL_FOCUS_STATE };

  return (
    <PasswordToggleFieldProvider
      scope={props.__scopePasswordToggleField}
      inputId={inputId}
      inputRef={inputRef}
      setVisible={setVisible}
      syncInputId={syncInputId}
      visible={visible}
      focusState={focusState}
    >
      {props.children}
    </PasswordToggleFieldProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldInput
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_INPUT_NAME = PASSWORD_TOGGLE_FIELD_NAME + "Input";

type PrimitiveInputProps = PrimitivePropsWithRef<"input">;

type PasswordToggleFieldOwnProps = {
  autoComplete?: AutoComplete | undefined;
};

/** Props accepted by the password toggle field input. */
type PasswordToggleFieldInputProps = PasswordToggleFieldOwnProps &
  Omit<PrimitiveInputProps, keyof PasswordToggleFieldOwnProps | "type"> & {
    autoComplete?: AutoComplete | undefined;
  };

/** Password input whose type switches between password and text with visibility. */
const PasswordToggleFieldInput: Component<ScopedProps<PasswordToggleFieldInputProps>> = (props) => {
  const rest = omit(
    props,
    "__scopePasswordToggleField",
    "autoComplete",
    "autocapitalize",
    "spellcheck",
    "id",
    "ref",
  );
  const autoComplete = () => props.autoComplete ?? AutoComplete.CurrentPassword;
  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_INPUT_NAME,
    props.__scopePasswordToggleField,
  );

  createEffect(
    () => props.id,
    (idProp) => {
      context.syncInputId(idProp);
    },
  );

  // We want to reset the visibility to `false` to revert the input to
  // `type="password"` when:
  // - The form is reset (for consistency with other form controls)
  // - The form is submitted (to prevent the browser from remembering the
  //   input's value.
  //
  // See "Keeping things secure":
  //   https://technology.blog.gov.uk/2021/04/19/simple-things-are-complicated-making-a-show-password-option/)
  const setVisible = useEffectEvent(context.setVisible);
  useLayoutEffect(() => {
    const inputElement = context.inputRef.current;
    const form = inputElement?.form;
    if (!form) {
      return;
    }

    const controller = new AbortController();
    form.addEventListener(
      "reset",
      (event) => {
        if (!event.defaultPrevented) {
          setVisible(false);
        }
      },
      { signal: controller.signal },
    );
    form.addEventListener(
      "submit",
      () => {
        // always reset the visibility on submit regardless of whether the
        // default action is prevented
        setVisible(false);
      },
      { signal: controller.signal },
    );
    return () => {
      controller.abort();
    };
  });

  return (
    <Primitive.input
      {...rest}
      id={props.id === false || props.id == null ? context.inputId() : props.id}
      autocapitalize={props.autocapitalize ?? "off"}
      autocomplete={autoComplete()}
      ref={useComposedRefs(props.ref, context.inputRef)}
      spellcheck={props.spellcheck ?? false}
      type={context.visible() ? "text" : "password"}
      onBlur={composeEventHandlers(
        (event) => callEventHandler(props.onBlur, event),
        (event) => {
          // get the cursor position
          const { selectionStart, selectionEnd } = event.currentTarget;
          context.focusState.current.selectionStart = selectionStart;
          context.focusState.current.selectionEnd = selectionEnd;
        },
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldToggle
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_TOGGLE_NAME = PASSWORD_TOGGLE_FIELD_NAME + "Toggle";

type PrimitiveButtonProps = PrimitivePropsWithRef<"button">;

/** Props accepted by the password toggle field visibility toggle. */
type PasswordToggleFieldToggleProps = Omit<PrimitiveButtonProps, "type">;

/** Button toggling password visibility while preserving input focus and selection. */
const PasswordToggleFieldToggle: Component<ScopedProps<PasswordToggleFieldToggleProps>> = (
  props,
) => {
  const rest = omit(
    props,
    "__scopePasswordToggleField",
    "onClick",
    "onPointerDown",
    "onPointerCancel",
    "onPointerUp",
    "onFocus",
    "children",
    "aria-label",
    "aria-controls",
    "aria-hidden",
    "tabindex",
    "ref",
  );
  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_TOGGLE_NAME,
    props.__scopePasswordToggleField,
  );
  const [internalAriaLabel, setInternalAriaLabel] = createSignal<string | undefined>(undefined);
  const elementRef: RefObject<HTMLButtonElement | null> = { current: null };
  const ref = useComposedRefs(props.ref, elementRef);
  const isHydrated = useIsHydrated();

  createEffect(
    () => ({ visible: context.visible(), ariaLabelProp: props["aria-label"] }),
    ({ visible, ariaLabelProp }) => {
      const element = elementRef.current;
      if (!element || ariaLabelProp) {
        setInternalAriaLabel(undefined);
        return;
      }

      const DEFAULT_ARIA_LABEL = visible ? "Hide password" : "Show password";

      function checkForInnerTextLabel(textContent: string | undefined | null) {
        const text = textContent ? textContent : undefined;
        // If the element has inner text, no need to force an aria-label.
        setInternalAriaLabel(text ? undefined : DEFAULT_ARIA_LABEL);
      }

      checkForInnerTextLabel(element.textContent);

      const observer = new MutationObserver((entries) => {
        let textContent: string | undefined;
        for (const entry of entries) {
          if (entry.type === "characterData") {
            if (element.textContent) {
              textContent = element.textContent;
            }
          }
        }
        checkForInnerTextLabel(textContent);
      });
      observer.observe(element, { characterData: true, subtree: true });
      return () => {
        observer.disconnect();
      };
    },
  );

  const ariaLabel = () => props["aria-label"] || internalAriaLabel();

  // Before hydration the button will not work, but we want to render it
  // regardless to prevent potential layout shift. Hide it from assistive tech
  // by default. Post-hydration it will be visible, focusable and associated
  // with the input via aria-controls.
  const ariaHidden = () => (isHydrated() ? props["aria-hidden"] : (props["aria-hidden"] ?? "true"));
  const tabIndex = () => (isHydrated() ? props.tabindex : (props.tabindex ?? -1));
  const ariaControls = () =>
    isHydrated() ? (props["aria-controls"] ?? context.inputId()) : props["aria-controls"];

  useLayoutEffect(() => {
    let cleanup = () => {};
    const ownerWindow = elementRef.current?.ownerDocument?.defaultView || window;
    const reset = () => (context.focusState.current.clickTriggered = false);
    const handlePointerUp = () => (cleanup = requestIdleCallback(ownerWindow, reset));
    ownerWindow.addEventListener("pointerup", handlePointerUp);
    return () => {
      cleanup();
      ownerWindow.removeEventListener("pointerup", handlePointerUp);
    };
  });

  return (
    <Primitive.button
      aria-controls={ariaControls()}
      aria-hidden={ariaHidden()}
      aria-label={ariaLabel()}
      ref={ref}
      id={context.inputId()}
      // Radix computes the pre-hydration `tabIndex` but never renders it;
      // Solidix renders it so the button is actually unfocusable pre-hydration.
      tabindex={tabIndex()}
      {...rest}
      onPointerDown={composeEventHandlers(
        (event) => callEventHandler(props.onPointerDown, event),
        () => {
          context.focusState.current.clickTriggered = true;
        },
      )}
      onPointerCancel={(event) => {
        // do not use `composeEventHandlers` here because we always want to
        // reset the ref on cancellation, regardless of whether the user has
        // called preventDefault on the event
        callEventHandler(props.onPointerCancel, event);
        context.focusState.current = INITIAL_FOCUS_STATE;
      }}
      // do not use `composeEventHandlers` here because we always want to
      // reset the ref after click, regardless of whether the user has
      // called preventDefault on the event
      onClick={(event) => {
        callEventHandler(props.onClick, event);
        if (event.defaultPrevented) {
          context.focusState.current = INITIAL_FOCUS_STATE;
          return;
        }

        // Solid applies signal updates synchronously (no `flushSync`
        // equivalent needed); the `type` attribute flush follows in a
        // microtask, ahead of the `requestAnimationFrame` below.
        context.setVisible((s) => !s);
        if (context.focusState.current.clickTriggered) {
          const input = context.inputRef.current;
          if (input) {
            const { selectionStart, selectionEnd } = context.focusState.current;
            input.focus();
            if (selectionStart !== null || selectionEnd !== null) {
              // wait a tick so that focus has settled, then restore select position
              requestAnimationFrame(() => {
                // make sure the input still has focus (developer may have
                // programatically moved focus elsewhere)
                if (input.ownerDocument.activeElement === input) {
                  input.selectionStart = selectionStart;
                  input.selectionEnd = selectionEnd;
                }
              });
            }
          }
        }
        context.focusState.current = INITIAL_FOCUS_STATE;
      }}
      onPointerUp={(event) => {
        callEventHandler(props.onPointerUp, event);
        // if click handler hasn't been called at this point, it may have been
        // intercepted, in which case we still want to reset our internal
        // state
        setTimeout(() => {
          context.focusState.current = INITIAL_FOCUS_STATE;
        }, 50);
      }}
      type="button"
    >
      {props.children}
    </Primitive.button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldSlot
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_SLOT_NAME = PASSWORD_TOGGLE_FIELD_NAME + "Slot";

type PasswordToggleFieldSlotDeclarativeProps = {
  visible: JSX.Element;
  hidden: JSX.Element;
};

type PasswordToggleFieldSlotRenderProps = {
  render: (args: { visible: boolean }) => JSX.Element;
};

/** Props accepted by the password toggle field slot. */
type PasswordToggleFieldSlotProps =
  | PasswordToggleFieldSlotDeclarativeProps
  | PasswordToggleFieldSlotRenderProps;

/** Renders visibility-dependent content, declaratively or via a render prop. */
const PasswordToggleFieldSlot: Component<ScopedProps<PasswordToggleFieldSlotProps>> = (props) => {
  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_SLOT_NAME,
    props.__scopePasswordToggleField,
  );

  return (
    <Show
      when={"render" in props}
      fallback={
        context.visible()
          ? (props as PasswordToggleFieldSlotDeclarativeProps).visible
          : (props as PasswordToggleFieldSlotDeclarativeProps).hidden
      }
    >
      {(props as PasswordToggleFieldSlotRenderProps).render({ visible: context.visible() })}
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldIcon
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_ICON_NAME = PASSWORD_TOGGLE_FIELD_NAME + "Icon";

type PrimitiveSvgProps = PrimitivePropsWithRef<"svg">;

/** Props accepted by the password toggle field icon. */
type PasswordToggleFieldIconProps = Omit<PrimitiveSvgProps, "children"> & {
  visible: JSX.Element;
  hidden: JSX.Element;
};

/** SVG swapping between the visible and hidden icons with visibility. */
const PasswordToggleFieldIcon: Component<ScopedProps<PasswordToggleFieldIconProps>> = (props) => {
  // `children` is not part of the props type (like Radix, which strips it
  // with a `@ts-expect-error` destructure); only the `visible`/`hidden`
  // icons render, as the slotted child below.
  const domProps = omit(props, "__scopePasswordToggleField", "visible", "hidden", "ref");
  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_ICON_NAME,
    props.__scopePasswordToggleField,
  );
  return (
    <Primitive.svg {...domProps} ref={props.ref} aria-hidden="true" asChild>
      {context.visible() ? props.visible : props.hidden}
    </Primitive.svg>
  );
};

export {
  PasswordToggleField,
  PasswordToggleFieldInput,
  PasswordToggleFieldToggle,
  PasswordToggleFieldSlot,
  PasswordToggleFieldIcon,
  //
  PasswordToggleField as Root,
  PasswordToggleFieldInput as Input,
  PasswordToggleFieldToggle as Toggle,
  PasswordToggleFieldSlot as Slot,
  PasswordToggleFieldIcon as Icon,
};
export type {
  PasswordToggleFieldProps,
  PasswordToggleFieldInputProps,
  PasswordToggleFieldToggleProps,
  PasswordToggleFieldIconProps,
  PasswordToggleFieldSlotProps,
};

function requestIdleCallback(
  window: Window,
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
): () => void {
  if ((window as unknown as Record<string, unknown>).requestIdleCallback) {
    const id = window.requestIdleCallback(callback, options);
    return () => {
      window.cancelIdleCallback(id);
    };
  }
  const start = Date.now();
  const id = window.setTimeout(() => {
    const timeRemaining = () => Math.max(0, 50 - (Date.now() - start));
    callback({ didTimeout: false, timeRemaining });
  }, 1);
  return () => {
    window.clearTimeout(id);
  };
}
