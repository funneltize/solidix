import { Show, createEffect, createSignal, omit, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
  type RovingFocusGroupProps as RovingFocusGroupRootProps,
} from "@solidix/roving-focus";
import { useControllableState } from "@solidix/use-controllable-state";
import {
  RadioBubbleInput,
  RadioIndicator,
  RadioProvider,
  RadioTrigger,
  createRadioScope,
  useRadioContext,
  type RadioBubbleInputProps,
  type RadioContextValue,
  type RadioIndicatorProps,
  type RadioProps,
  type RadioTriggerProps,
} from "./radio";

const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/* -------------------------------------------------------------------------------------------------
 * RadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = "RadioGroup";

type ScopedProps<P> = P & { __scopeRadioGroup?: Scope | undefined };
/** Creates a radio group scope for nesting multiple independent radio groups. */
const [createRadioGroupContext, createRadioGroupScope] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
  createRadioScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();
const useRadioScope = createRadioScope();

type RadioGroupContextValue = {
  name: () => string | undefined;
  form: () => string | undefined;
  required: () => boolean;
  disabled: () => boolean;
  value: () => string | null;
  onValueChange(value: string): void;
};

const [RadioGroupProvider, useRadioGroupContext] =
  createRadioGroupContext<RadioGroupContextValue>(RADIO_GROUP_NAME);

type RadioGroupElement = HTMLDivElement;
type RadioGroupProps = PrimitivePropsWithRef<"div"> & {
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  dir?: RovingFocusGroupRootProps["dir"] | undefined;
  orientation?: RovingFocusGroupRootProps["orientation"] | undefined;
  loop?: RovingFocusGroupRootProps["loop"] | undefined;
  defaultValue?: string | undefined;
  value?: string | null | undefined;
  onValueChange?: RadioGroupContextValue["onValueChange"] | undefined;
};

/** The root container that manages the selected value across its radio items. */
const RadioGroup: Component<ScopedProps<RadioGroupProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeRadioGroup",
    "name",
    "form",
    "defaultValue",
    "value",
    "required",
    "disabled",
    "orientation",
    "dir",
    "loop",
    "onValueChange",
    "ref",
  );
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeRadioGroup);
  const direction = useDirection(props.dir);
  const required = () => props.required ?? false;
  const disabled = () => props.disabled ?? false;

  const [value, setValue] = useControllableState<string | null>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? null,
    onChange: props.onValueChange as ((value: string | null) => void) | undefined,
    caller: RADIO_GROUP_NAME,
  });

  const [control, setControl] = createSignal<RadioGroupElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setControl);

  const initialValue = value();
  createEffect(
    () => ({ control: control(), form: props.form }),
    ({ control, form }) => {
      const associatedForm = form
        ? control?.ownerDocument.getElementById(form)
        : control?.closest("form");
      if (associatedForm instanceof HTMLFormElement) {
        const reset = () => setValue(initialValue);
        associatedForm.addEventListener("reset", reset);
        return () => associatedForm.removeEventListener("reset", reset);
      }
    },
  );

  return (
    <RadioGroupProvider
      scope={props.__scopeRadioGroup}
      name={() => props.name}
      form={() => props.form}
      required={required}
      disabled={disabled}
      value={value}
      onValueChange={setValue}
    >
      <RovingFocusGroup
        asChild
        {...rovingFocusGroupScope}
        orientation={props.orientation}
        dir={direction}
        loop={props.loop ?? true}
      >
        <Primitive.div
          role="radiogroup"
          aria-required={ariaBoolean(required())}
          aria-orientation={props.orientation}
          aria-disabled={ariaBoolean(disabled() || undefined)}
          data-disabled={disabled() ? "" : undefined}
          dir={direction}
          {...rest}
          ref={composedRefs}
        />
      </RovingFocusGroup>
    </RadioGroupProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioGroupItemProvider
 * -----------------------------------------------------------------------------------------------*/

const ITEM_PROVIDER_NAME = "RadioGroupItemProvider";
const ITEM_TRIGGER_NAME = "RadioGroupItemTrigger";

interface RadioGroupItemProviderProps {
  value: string;
  disabled?: boolean | undefined;
  children?: JSX.Element | undefined;
}

type RadioGroupItemProviderInternalProps = RadioGroupItemProviderProps & {
  internal_do_not_use_render?: ((context: RadioContextValue) => JSX.Element) | undefined;
};

/** Provides the radio item context for composing a custom radio item. */
const RadioGroupItemProvider: Component<ScopedProps<RadioGroupItemProviderInternalProps>> = (
  props,
) => {
  const context = useRadioGroupContext(ITEM_PROVIDER_NAME, props.__scopeRadioGroup);
  const radioScope = useRadioScope(props.__scopeRadioGroup);
  const isDisabled = () => context.disabled() || props.disabled;

  return (
    <RadioProvider
      {...radioScope}
      checked={context.value() === props.value}
      disabled={isDisabled()}
      required={context.required()}
      name={context.name()}
      form={context.form()}
      value={props.value}
      onCheck={() => context.onValueChange(props.value)}
      internal_do_not_use_render={props.internal_do_not_use_render}
    >
      {props.children}
    </RadioProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioGroupItemTrigger
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupItemTriggerElement = HTMLButtonElement;
type RadioGroupItemTriggerProps = RadioTriggerProps;

/** The button that selects the radio item when activated. */
const RadioGroupItemTrigger: Component<ScopedProps<RadioGroupItemTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeRadioGroup", "onKeyDown", "onFocus", "ref");
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeRadioGroup);
  const radioScope = useRadioScope(props.__scopeRadioGroup);
  const radioContext = useRadioContext(ITEM_TRIGGER_NAME, radioScope.__scopeRadio);
  let trigger: RadioGroupItemTriggerElement | null = null;
  const composedRefs = useComposedRefs(props.ref, (node: RadioGroupItemTriggerElement | null) => {
    trigger = node;
  });
  let isArrowKeyPressed = false;

  onSettled(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (ARROW_KEYS.includes(event.key)) {
        isArrowKeyPressed = true;
      }
    };
    const handleKeyUp = () => (isArrowKeyPressed = false);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  });

  const handleKeyDown = composeEventHandlers(
    (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
    (event) => {
      // According to WAI ARIA, radio groups don't activate items on enter
      // keypress
      if (event.key === "Enter") event.preventDefault();
    },
  );

  const handleFocus = composeEventHandlers(
    (event: FocusEvent) => callEventHandler(props.onFocus, event),
    () => {
      /**
       * Our `RovingFocusGroup` will focus the radio when navigating with
       * arrow keys and we need to "check" it in that case. We click it to
       * "check" it (instead of updating `context.value`) so that the radio
       * change event fires.
       */
      if (isArrowKeyPressed) {
        trigger?.click();
      }
    },
  );

  return (
    <RovingFocusGroupItem
      asChild
      {...rovingFocusGroupScope}
      focusable={!radioContext.disabled()}
      active={radioContext.checked()}
    >
      <RadioTrigger
        {...radioScope}
        {...rest}
        ref={composedRefs}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
    </RovingFocusGroupItem>
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioGroupItem
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupItemProps = Omit<RadioProps, "onCheck" | "name"> & {
  value: string;
};

/** A single selectable radio button within the group. */
const RadioGroupItem: Component<ScopedProps<RadioGroupItemProps>> = (props) => {
  const rest = omit(props, "__scopeRadioGroup", "value", "disabled", "ref");

  return (
    <RadioGroupItemProvider
      __scopeRadioGroup={props.__scopeRadioGroup}
      value={props.value}
      disabled={props.disabled}
      internal_do_not_use_render={(context) => (
        <>
          <RadioGroupItemTrigger
            {...rest}
            ref={props.ref}
            __scopeRadioGroup={props.__scopeRadioGroup}
          />
          <Show when={context.isFormControl()}>
            <RadioGroupItemBubbleInput __scopeRadioGroup={props.__scopeRadioGroup} />
          </Show>
        </>
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * RadioGroupItemBubbleInput
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupItemBubbleInputProps = RadioBubbleInputProps;

/** The hidden native input that syncs the radio item value with forms. */
const RadioGroupItemBubbleInput: Component<ScopedProps<RadioGroupItemBubbleInputProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeRadioGroup", "ref");
  const radioScope = useRadioScope(props.__scopeRadioGroup);
  return <RadioBubbleInput {...radioScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * RadioGroupIndicator
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupIndicatorProps = RadioIndicatorProps;

/** The visual element rendered inside the radio item when it is checked. */
const RadioGroupIndicator: Component<ScopedProps<RadioGroupIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeRadioGroup", "ref");
  const radioScope = useRadioScope(props.__scopeRadioGroup);
  return <RadioIndicator {...radioScope} {...rest} ref={props.ref} />;
};

/* ---------------------------------------------------------------------------------------------- */

export {
  createRadioGroupScope,
  //
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemProvider,
  RadioGroupItemTrigger,
  RadioGroupItemBubbleInput,
  RadioGroupIndicator,
  //
  RadioGroup as Root,
  RadioGroupItem as Item,
  RadioGroupItemProvider as ItemProvider,
  RadioGroupItemTrigger as ItemTrigger,
  RadioGroupItemBubbleInput as ItemBubbleInput,
  RadioGroupIndicator as Indicator,
};
export type {
  RadioGroupProps,
  RadioGroupItemProps,
  RadioGroupItemProviderProps,
  RadioGroupItemTriggerProps,
  RadioGroupItemBubbleInputProps,
  RadioGroupIndicatorProps,
};
