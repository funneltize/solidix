import { createSignal, omit, onSettled, untrack, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createContextScope, type Scope } from "@soldix/context";
import { useDirection } from "@soldix/direction";
import { useId } from "@soldix/id";
import { Presence } from "@soldix/presence";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@soldix/primitive";
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
  type RovingFocusGroupProps as RovingFocusGroupRootProps,
} from "@soldix/roving-focus";
import { useControllableState } from "@soldix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * Tabs
 * -----------------------------------------------------------------------------------------------*/

const TABS_NAME = "Tabs";

type ScopedProps<P> = P & { __scopeTabs?: Scope | undefined };
const [createTabsContext, createTabsScope] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();

type TabsContextValue = {
  baseId: string;
  value: () => string;
  onValueChange(value: string): void;
  orientation: () => RovingFocusGroupRootProps["orientation"];
  dir: () => RovingFocusGroupRootProps["dir"];
  activationMode: () => "automatic" | "manual";
};

const [TabsProvider, useTabsContext] = createTabsContext<TabsContextValue>(TABS_NAME);

type TabsProps = PrimitivePropsWithRef<"div"> & {
  /** @defaultValue "horizontal" */
  orientation?: RovingFocusGroupRootProps["orientation"] | undefined;
  dir?: RovingFocusGroupRootProps["dir"] | undefined;
  /**
   * When `automatic`, tabs are activated when receiving focus. When `manual`,
   * tabs are activated when clicked (or when `Enter`/`Space` is pressed while
   * focused).
   * @defaultValue "automatic"
   */
  activationMode?: "automatic" | "manual" | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
};

const Tabs: Component<ScopedProps<TabsProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeTabs",
    "value",
    "onValueChange",
    "defaultValue",
    "orientation",
    "dir",
    "activationMode",
    "ref",
  );
  const direction = useDirection(props.dir);
  const baseId = useId();
  const [value, setValue] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? "",
    onChange: props.onValueChange,
    caller: TABS_NAME,
  });
  const orientation = () => props.orientation ?? "horizontal";
  const activationMode = () => props.activationMode ?? "automatic";

  return (
    <TabsProvider
      scope={props.__scopeTabs}
      baseId={baseId}
      value={value}
      onValueChange={setValue}
      orientation={orientation}
      dir={() => direction}
      activationMode={activationMode}
    >
      <Primitive.div dir={direction} data-orientation={orientation()} {...rest} ref={props.ref} />
    </TabsProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TabsList
 * -----------------------------------------------------------------------------------------------*/

const LIST_NAME = "TabsList";

type TabsListProps = PrimitivePropsWithRef<"div"> & {
  loop?: RovingFocusGroupRootProps["loop"] | undefined;
};

const TabsList: Component<ScopedProps<TabsListProps>> = (props) => {
  const rest = omit(props, "__scopeTabs", "loop", "ref");
  const context = useTabsContext(LIST_NAME, props.__scopeTabs);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeTabs);

  return (
    <RovingFocusGroup
      asChild
      {...rovingFocusGroupScope}
      orientation={context.orientation()}
      dir={context.dir()}
      loop={props.loop ?? true}
    >
      <Primitive.div
        role="tablist"
        aria-orientation={context.orientation()}
        {...rest}
        ref={props.ref}
      />
    </RovingFocusGroup>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TabsTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "TabsTrigger";

type TabsTriggerProps = PrimitivePropsWithRef<"button"> & {
  value: string;
  disabled?: boolean | undefined;
};

const TabsTrigger: Component<ScopedProps<TabsTriggerProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeTabs",
    "value",
    "disabled",
    "onMouseDown",
    "onKeyDown",
    "onFocus",
    "ref",
  );
  const context = useTabsContext(TRIGGER_NAME, props.__scopeTabs);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeTabs);
  const disabled = () => props.disabled ?? false;
  const triggerId = makeTriggerId(context.baseId, props.value);
  const contentId = makeContentId(context.baseId, props.value);
  const isSelected = () => props.value === context.value();

  const handleMouseDown = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onMouseDown, event),
    (event) => {
      // only call handler if it's the left button (mousedown gets called for all mouse buttons)
      // but not when the control key is pressed (avoiding MacOS right click);
      if (!disabled() && event.button === 0 && event.ctrlKey === false) {
        const target = event.currentTarget;
        if (target instanceof HTMLElement) target.focus();
        context.onValueChange(props.value);
      } else {
        // prevent focus to avoid accidental activation
        event.preventDefault();
      }
    },
  );

  const handleKeyDown = composeEventHandlers(
    (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
    // Manual activation is achieved by `onKeyDown` and not `onPress`/`onClick`
    // because it would be triggered by a keypress and the event target would
    // be the trigger, not the item, so `disabled` would be ignored.
    (event) => {
      if (disabled() || event.target !== event.currentTarget) {
        return;
      }
      if ([" ", "Enter"].includes(event.key)) {
        context.onValueChange(props.value);
      }
    },
  );

  const handleFocus = composeEventHandlers(
    (event: FocusEvent) => callEventHandler(props.onFocus, event),
    () => {
      // handle "automatic" activation if necessary
      // aka activate tab following focus
      const isAutomaticActivation = context.activationMode() !== "manual";
      if (!isSelected() && !disabled() && isAutomaticActivation) {
        context.onValueChange(props.value);
      }
    },
  );

  return (
    <RovingFocusGroupItem
      asChild
      {...rovingFocusGroupScope}
      focusable={!disabled()}
      active={isSelected()}
    >
      <Primitive.button
        type="button"
        role="tab"
        aria-selected={ariaBoolean(isSelected())}
        aria-controls={contentId}
        data-state={isSelected() ? "active" : "inactive"}
        data-disabled={disabled() ? "" : undefined}
        disabled={disabled()}
        id={triggerId}
        {...rest}
        ref={props.ref}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
    </RovingFocusGroupItem>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TabsContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "TabsContent";

type TabsContentProps = Omit<PrimitivePropsWithRef<"div">, "value" | "style"> & {
  value: string;
  forceMount?: true | undefined;
  style?: JSX.CSSProperties | undefined;
};

const TabsContent: Component<ScopedProps<TabsContentProps>> = (props) => {
  const rest = omit(props, "__scopeTabs", "children", "value", "forceMount", "style", "ref");
  const context = useTabsContext(CONTENT_NAME, props.__scopeTabs);
  const triggerId = makeTriggerId(context.baseId, props.value);
  const contentId = makeContentId(context.baseId, props.value);
  const isSelected = () => props.value === context.value();
  const [mountAnimationPrevented, setMountAnimationPrevented] = createSignal(untrack(isSelected));

  onSettled(() => {
    const rAF = requestAnimationFrame(() => setMountAnimationPrevented(false));
    return () => cancelAnimationFrame(rAF);
  });

  return (
    <Presence present={() => props.forceMount || isSelected()}>
      {({ present }) => (
        <Primitive.div
          data-state={isSelected() ? "active" : "inactive"}
          data-orientation={context.orientation()}
          role="tabpanel"
          aria-labelledby={triggerId}
          hidden={!present()}
          id={contentId}
          tabindex={0}
          {...rest}
          ref={props.ref}
          style={{
            ...props.style,
            "animation-duration": mountAnimationPrevented() ? "0s" : undefined,
          }}
        >
          {present() && props.children}
        </Primitive.div>
      )}
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

function makeTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`;
}

function makeContentId(baseId: string, value: string) {
  return `${baseId}-content-${value}`;
}

export {
  createTabsScope,
  //
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  //
  Tabs as Root,
  TabsList as List,
  TabsTrigger as Trigger,
  TabsContent as Content,
};
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
