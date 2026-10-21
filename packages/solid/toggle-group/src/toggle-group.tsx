import { Show, omit, type Component } from "solid-js";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import { Primitive, ariaBoolean, type PrimitivePropsWithRef } from "@solidix/primitive";
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
  type RovingFocusGroupProps as RovingFocusGroupRootProps,
} from "@solidix/roving-focus";
import { Toggle, type ToggleProps } from "@solidix/toggle";
import { useControllableState } from "@solidix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup
 * -----------------------------------------------------------------------------------------------*/

const TOGGLE_GROUP_NAME = "ToggleGroup";

const ToggleGroupType = {
  Single: "single",
  Multiple: "multiple",
} as const;

type ToggleGroupType = (typeof ToggleGroupType)[keyof typeof ToggleGroupType];

type ScopedProps<P> = P & { __scopeToggleGroup?: Scope | undefined };
/** Creates the context and scope factories for the toggle group. */
const [createToggleGroupContext, createToggleGroupScope] = createContextScope(TOGGLE_GROUP_NAME, [
  createRovingFocusGroupScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();

interface ToggleGroupSingleProps extends ToggleGroupImplSingleProps {
  type: typeof ToggleGroupType.Single;
}
interface ToggleGroupMultipleProps extends ToggleGroupImplMultipleProps {
  type: typeof ToggleGroupType.Multiple;
}

/** Renders a single-selection radiogroup or multi-selection toolbar of toggle items. */
const ToggleGroup: Component<ScopedProps<ToggleGroupSingleProps | ToggleGroupMultipleProps>> = (
  props,
) => {
  const rest = omit(props, "type", "ref");

  if (props.type === ToggleGroupType.Single) {
    return (
      <ToggleGroupImplSingle
        role="radiogroup"
        {...(rest as ScopedProps<ToggleGroupImplSingleProps>)}
        ref={props.ref}
      />
    );
  }

  if (props.type === ToggleGroupType.Multiple) {
    return (
      <ToggleGroupImplMultiple
        role="toolbar"
        {...(rest as ScopedProps<ToggleGroupImplMultipleProps>)}
        ref={props.ref}
      />
    );
  }

  throw new Error(`Missing prop \`type\` expected on \`${TOGGLE_GROUP_NAME}\``);
};

/* -----------------------------------------------------------------------------------------------*/

type ToggleGroupValueContextValue = {
  type: ToggleGroupType;
  value: () => string[];
  onItemActivate(value: string): void;
  onItemDeactivate(value: string): void;
};

const [ToggleGroupValueProvider, useToggleGroupValueContext] =
  createToggleGroupContext<ToggleGroupValueContextValue>(TOGGLE_GROUP_NAME);

interface ToggleGroupImplSingleProps extends ToggleGroupImplProps {
  /**
   * The controlled stateful value of the item that is pressed.
   */
  value?: string | undefined;
  /**
   * The value of the item that is pressed when initially rendered. Use
   * `defaultValue` if you do not need to control the state of a toggle group.
   */
  defaultValue?: string | undefined;
  /**
   * The callback that fires when the value of the toggle group changes.
   */
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
}

const ToggleGroupImplSingle: Component<ScopedProps<ToggleGroupImplSingleProps>> = (props) => {
  const rest = omit(props, "__scopeToggleGroup", "value", "defaultValue", "onValueChange", "ref");

  const [value, setValue] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? "",
    onChange: props.onValueChange,
    caller: TOGGLE_GROUP_NAME,
  });

  const handleDeactivate = () => setValue("");

  return (
    <ToggleGroupValueProvider
      scope={props.__scopeToggleGroup}
      type={ToggleGroupType.Single}
      value={() => {
        const current = value();
        return current ? [current] : [];
      }}
      onItemActivate={setValue}
      onItemDeactivate={handleDeactivate}
    >
      <ToggleGroupImpl __scopeToggleGroup={props.__scopeToggleGroup} {...rest} ref={props.ref} />
    </ToggleGroupValueProvider>
  );
};

interface ToggleGroupImplMultipleProps extends ToggleGroupImplProps {
  /**
   * The controlled stateful value of the items that are pressed.
   */
  value?: string[] | undefined;
  /**
   * The value of the items that are pressed when initially rendered. Use
   * `defaultValue` if you do not need to control the state of a toggle group.
   */
  defaultValue?: string[] | undefined;
  /**
   * The callback that fires when the state of the toggle group changes.
   */
  onValueChange?: { bivarianceHack(value: string[]): void }["bivarianceHack"] | undefined;
}

const ToggleGroupImplMultiple: Component<ScopedProps<ToggleGroupImplMultipleProps>> = (props) => {
  const rest = omit(props, "__scopeToggleGroup", "value", "defaultValue", "onValueChange", "ref");

  const [value, setValue] = useControllableState<string[]>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? [],
    onChange: props.onValueChange,
    caller: TOGGLE_GROUP_NAME,
  });

  const handleButtonActivate = (itemValue: string) =>
    setValue((prevValue) => [...prevValue, itemValue]);
  const handleButtonDeactivate = (itemValue: string) =>
    setValue((prevValue) => prevValue.filter((value) => value !== itemValue));

  return (
    <ToggleGroupValueProvider
      scope={props.__scopeToggleGroup}
      type={ToggleGroupType.Multiple}
      value={value}
      onItemActivate={handleButtonActivate}
      onItemDeactivate={handleButtonDeactivate}
    >
      <ToggleGroupImpl __scopeToggleGroup={props.__scopeToggleGroup} {...rest} ref={props.ref} />
    </ToggleGroupValueProvider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type ToggleGroupContextValue = { rovingFocus: () => boolean; disabled: () => boolean };

const [ToggleGroupContext, useToggleGroupContext] =
  createToggleGroupContext<ToggleGroupContextValue>(TOGGLE_GROUP_NAME);

interface ToggleGroupImplProps extends PrimitivePropsWithRef<"div"> {
  /**
   * Whether the group is disabled from user interaction.
   * @defaultValue false
   */
  disabled?: boolean | undefined;
  /**
   * Whether the group should maintain roving focus of its buttons.
   * @defaultValue true
   */
  rovingFocus?: boolean | undefined;
  loop?: RovingFocusGroupRootProps["loop"] | undefined;
  orientation?: RovingFocusGroupRootProps["orientation"] | undefined;
  dir?: RovingFocusGroupRootProps["dir"] | undefined;
}

const ToggleGroupImpl: Component<ScopedProps<ToggleGroupImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeToggleGroup",
    "disabled",
    "rovingFocus",
    "orientation",
    "dir",
    "loop",
    "ref",
  );
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToggleGroup);
  const direction = useDirection(props.dir);
  const rovingFocus = () => props.rovingFocus ?? true;

  return (
    <ToggleGroupContext
      scope={props.__scopeToggleGroup}
      rovingFocus={rovingFocus}
      disabled={() => props.disabled ?? false}
    >
      <Show
        when={rovingFocus()}
        fallback={<Primitive.div dir={direction} {...rest} ref={props.ref} />}
      >
        <RovingFocusGroup
          asChild
          {...rovingFocusGroupScope}
          orientation={props.orientation}
          dir={direction}
          loop={props.loop ?? true}
        >
          <Primitive.div dir={direction} {...rest} ref={props.ref} />
        </RovingFocusGroup>
      </Show>
    </ToggleGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "ToggleGroupItem";

interface ToggleGroupItemProps extends Omit<ToggleGroupItemImplProps, "pressed"> {}

/** Renders a toggle item that reflects and updates the group's selected value. */
const ToggleGroupItem: Component<ScopedProps<ToggleGroupItemProps>> = (props) => {
  const rest = omit(props, "__scopeToggleGroup", "ref");
  const valueContext = useToggleGroupValueContext(ITEM_NAME, props.__scopeToggleGroup);
  const context = useToggleGroupContext(ITEM_NAME, props.__scopeToggleGroup);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToggleGroup);
  const pressed = () => valueContext.value().includes(props.value);
  const disabled = () => context.disabled() || props.disabled;

  const item = () => (
    <ToggleGroupItemImpl
      {...rest}
      __scopeToggleGroup={props.__scopeToggleGroup}
      pressed={pressed()}
      disabled={disabled()}
      ref={props.ref}
    />
  );

  return (
    <Show when={context.rovingFocus()} fallback={item()}>
      <RovingFocusGroupItem
        asChild
        {...rovingFocusGroupScope}
        focusable={!disabled()}
        active={pressed()}
      >
        {item()}
      </RovingFocusGroupItem>
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type ToggleGroupItemImplProps = Omit<ToggleProps, "defaultPressed" | "onPressedChange"> & {
  /**
   * A string value for the toggle group item. All items within a toggle group should use a unique value.
   */
  value: string;
};

const ToggleGroupItemImpl: Component<ScopedProps<ToggleGroupItemImplProps>> = (props) => {
  const rest = omit(props, "__scopeToggleGroup", "value", "ref");
  const valueContext = useToggleGroupValueContext(ITEM_NAME, props.__scopeToggleGroup);
  const isSingle = () => valueContext.type === ToggleGroupType.Single;

  const handlePressedChange = (pressed: boolean) => {
    if (pressed) {
      valueContext.onItemActivate(props.value);
    } else {
      valueContext.onItemDeactivate(props.value);
    }
  };

  return (
    <Toggle
      {...(isSingle()
        ? { role: "radio", "aria-checked": ariaBoolean(props.pressed), "aria-pressed": undefined }
        : {})}
      {...rest}
      ref={props.ref}
      onPressedChange={handlePressedChange}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  createToggleGroupScope,
  //
  ToggleGroup,
  ToggleGroupItem,
  //
  ToggleGroup as Root,
  ToggleGroupItem as Item,
};
export type { ToggleGroupSingleProps, ToggleGroupMultipleProps, ToggleGroupItemProps };
