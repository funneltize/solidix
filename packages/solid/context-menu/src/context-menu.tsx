import { createEffect, createSignal, omit, onCleanup, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";
import { createContextScope, type Scope } from "@solidix/context";
import {
  Menu as MenuRoot,
  MenuAnchor,
  MenuArrow,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  createMenuScope,
  type MenuArrowProps,
  type MenuCheckboxItemProps,
  type MenuContentProps,
  type MenuGroupProps,
  type MenuItemIndicatorProps,
  type MenuItemProps,
  type MenuLabelProps,
  type MenuPortalProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuSeparatorProps,
  type MenuSubContentProps,
  type MenuSubProps,
  type MenuSubTriggerProps,
} from "@solidix/menu";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * ContextMenu
 * -----------------------------------------------------------------------------------------------*/

const CONTEXT_MENU_NAME = "ContextMenu";

type ScopedProps<P> = P & { __scopeContextMenu?: Scope | undefined };
/**
 * `createContextMenuScope` creates a scope for composing `ContextMenu` parts with other Solidix primitives.
 */
const [createContextMenuContext, createContextMenuScope] = createContextScope(CONTEXT_MENU_NAME, [
  createMenuScope,
]);
const useMenuScope = createMenuScope();

type Point = { x: number; y: number };

type ContextMenuContextValue = {
  open: () => boolean;
  onOpenChange(open: boolean): void;
  modal: boolean;
  hasInteractedRef: { current: boolean };
};

const [ContextMenuProvider, useContextMenuContext] =
  createContextMenuContext<ContextMenuContextValue>(CONTEXT_MENU_NAME);

type ContextMenuProps = {
  children?: import("@solidjs/web").JSX.Element | undefined;
  open?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  dir?: "ltr" | "rtl" | undefined;
  modal?: boolean | undefined;
};

/**
 * `ContextMenu` contains all of the parts of a context menu.
 */
const ContextMenu: Component<ScopedProps<ContextMenuProps>> = (props) => {
  const modal = () => props.modal ?? true;
  const hasInteractedRef = { current: false };

  if (IS_DEVELOPMENT) {
    let hasWarned = false;
    createEffect(
      () => props.open,
      (openProp) => {
        if (openProp === true && !hasInteractedRef.current && !hasWarned) {
          hasWarned = true;
          // dev warning: open prop is controllable but its position has not been set
          // because the user has not interacted with the trigger. The controllable
          // state is only enabled so that the user can read or programatically close
          // the menu. Programatically opening the menu will anchor it to the most
          // recently interacted position.
          console.warn(
            "ContextMenu: The `open` prop has been set to `true` before the user has interacted with the trigger, so its position is indeterminate. This is likely unintended and will result in the menu being anchored to the top-left corner of the viewport.",
          );
        }
      },
    );
  }

  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: false,
    onChange: props.onOpenChange,
    caller: CONTEXT_MENU_NAME,
  });

  const menuScope = useMenuScope(props.__scopeContextMenu);

  return (
    <ContextMenuProvider
      scope={props.__scopeContextMenu}
      open={open}
      onOpenChange={setOpen}
      modal={modal()}
      hasInteractedRef={hasInteractedRef}
    >
      <MenuRoot {...menuScope} dir={props.dir} open={open()} onOpenChange={setOpen} modal={modal()}>
        {props.children}
      </MenuRoot>
    </ContextMenuProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "ContextMenuTrigger";

// Native pointerdown events that a trigger has already armed a long press for.
// Nested triggers all receive the same bubbling event, so only the innermost
// one (which handles it first) may start a long press timer.
const claimedLongPressEvents = /* @__PURE__ */ new WeakSet<Event>();

type ContextMenuTriggerProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  style?: JSX.CSSProperties | undefined;
  disabled?: boolean | undefined;
};

/**
 * `ContextMenuTrigger` is the area that opens the context menu on right-click. Wrap it around the target the menu opens from.
 */
const ContextMenuTrigger: Component<ScopedProps<ContextMenuTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "disabled", "ref");
  const context = useContextMenuContext(TRIGGER_NAME, props.__scopeContextMenu);
  const menuScope = useMenuScope(props.__scopeContextMenu);
  const disabled = () => props.disabled ?? false;
  const [point, setPoint] = createSignal<Point>({ x: 0, y: 0 });

  // A getter (not a recreated object like Radix's `useMemo`) so the content
  // re-anchors to the latest point when the menu is re-triggered while
  // already open (e.g. right-clicking in a new location, #2611). The anchor
  // effect re-runs reactively on every point change.
  const virtualRef = () => ({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...point() }),
  });

  let longPressTimer = 0;
  const clearLongPress = () => window.clearTimeout(longPressTimer);

  const handleOpen = (event: MouseEvent | PointerEvent) => {
    context.hasInteractedRef.current = true;
    setPoint({ x: event.clientX, y: event.clientY });
    context.onOpenChange(true);
  };

  onCleanup(clearLongPress);
  createEffect(
    () => disabled(),
    (isDisabled) => {
      if (isDisabled) clearLongPress();
    },
  );

  return (
    <>
      <MenuAnchor {...menuScope} virtualRef={virtualRef} />
      <Primitive.span
        data-state={context.open() ? "open" : "closed"}
        data-disabled={disabled() ? "" : undefined}
        {...rest}
        ref={props.ref}
        // prevent iOS context menu from appearing
        style={{ "-webkit-touch-callout": "none", ...props.style }}
        // if trigger is disabled, enable the native Context Menu
        onContextMenu={
          disabled()
            ? props.onContextMenu
            : composeEventHandlers(
                (event: MouseEvent) => callEventHandler(props.onContextMenu, event),
                (event) => {
                  // clearing the long press here because some platforms already support
                  // long press to trigger a `contextmenu` event
                  clearLongPress();
                  handleOpen(event);
                  event.preventDefault();
                },
              )
        }
        onPointerDown={
          disabled()
            ? props.onPointerDown
            : composeEventHandlers(
                (event: PointerEvent) => callEventHandler(props.onPointerDown, event),
                whenTouchOrPen((event) => {
                  // clear the long press here in case there's multiple touch points
                  clearLongPress();
                  if (context.open()) {
                    context.onOpenChange(false);
                  }
                  if (claimedLongPressEvents.has(event)) {
                    return;
                  }
                  claimedLongPressEvents.add(event);
                  longPressTimer = window.setTimeout(() => handleOpen(event), 700);
                }),
              )
        }
        onPointerMove={
          disabled()
            ? props.onPointerMove
            : composeEventHandlers(
                (event: PointerEvent) => callEventHandler(props.onPointerMove, event),
                whenTouchOrPen(clearLongPress),
              )
        }
        onPointerCancel={
          disabled()
            ? props.onPointerCancel
            : composeEventHandlers(
                (event: PointerEvent) => callEventHandler(props.onPointerCancel, event),
                whenTouchOrPen(clearLongPress),
              )
        }
        onPointerUp={
          disabled()
            ? props.onPointerUp
            : composeEventHandlers(
                (event: PointerEvent) => callEventHandler(props.onPointerUp, event),
                whenTouchOrPen(clearLongPress),
              )
        }
      />
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuPortal
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuPortalProps = MenuPortalProps;

/**
 * `ContextMenuPortal` portals the content parts into the `body` when used.
 */
const ContextMenuPortal: Component<ScopedProps<ContextMenuPortalProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuPortal {...menuScope} {...rest} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "ContextMenuContent";

type ContextMenuContentProps = Omit<MenuContentProps, "onEntryFocus">;

/**
 * `ContextMenuContent` is the component that pops out when the context menu is open.
 */
const ContextMenuContent: Component<ScopedProps<ContextMenuContentProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const context = useContextMenuContext(CONTENT_NAME, props.__scopeContextMenu);
  const menuScope = useMenuScope(props.__scopeContextMenu);
  const hasInteractedOutsideRef = { current: false };

  return (
    <MenuContent
      {...menuScope}
      side="right"
      sideOffset={2}
      align="start"
      {...rest}
      ref={props.ref}
      onCloseAutoFocus={(event) => {
        callEventHandler(rest.onCloseAutoFocus, event);

        if (!event.defaultPrevented && hasInteractedOutsideRef.current) {
          event.preventDefault();
        }

        hasInteractedOutsideRef.current = false;
      }}
      onInteractOutside={(event) => {
        callEventHandler(rest.onInteractOutside, event);

        if (!event.defaultPrevented && !context.modal) hasInteractedOutsideRef.current = true;
      }}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        "--radix-context-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-context-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-context-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-context-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-context-menu-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuGroup
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuGroupProps = MenuGroupProps;

/**
 * `ContextMenuGroup` is used to group multiple `ContextMenuItem`s.
 */
const ContextMenuGroup: Component<ScopedProps<ContextMenuGroupProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuGroup {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuLabel
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuLabelProps = MenuLabelProps;

/**
 * `ContextMenuLabel` is used to render a label. It won't be focusable using arrow keys.
 */
const ContextMenuLabel: Component<ScopedProps<ContextMenuLabelProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuLabel {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuItem
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuItemProps = MenuItemProps;

/**
 * `ContextMenuItem` is a selectable item in the menu.
 */
const ContextMenuItem: Component<ScopedProps<ContextMenuItemProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;

/**
 * `ContextMenuCheckboxItem` is an item that can be controlled and rendered like a checkbox.
 */
const ContextMenuCheckboxItem: Component<ScopedProps<ContextMenuCheckboxItemProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuCheckboxItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuRadioGroupProps = MenuRadioGroupProps;

/**
 * `ContextMenuRadioGroup` is used to group multiple `ContextMenuRadioItem`s.
 */
const ContextMenuRadioGroup: Component<ScopedProps<ContextMenuRadioGroupProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuRadioGroup {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuRadioItemProps = MenuRadioItemProps;

/**
 * `ContextMenuRadioItem` is an item that can be controlled and rendered like a radio.
 */
const ContextMenuRadioItem: Component<ScopedProps<ContextMenuRadioItemProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuRadioItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuItemIndicatorProps = MenuItemIndicatorProps;

/**
 * `ContextMenuItemIndicator` renders when the parent `ContextMenuCheckboxItem` or `ContextMenuRadioItem` is checked.
 */
const ContextMenuItemIndicator: Component<ScopedProps<ContextMenuItemIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuItemIndicator {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSeparator
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuSeparatorProps = MenuSeparatorProps;

/**
 * `ContextMenuSeparator` is used to visually separate items in a menu.
 */
const ContextMenuSeparator: Component<ScopedProps<ContextMenuSeparatorProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuSeparator {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuArrow
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuArrowProps = MenuArrowProps;

/**
 * `ContextMenuArrow` is an optional arrow element to render alongside the menu, visually linking the trigger with the content.
 */
const ContextMenuArrow: Component<ScopedProps<ContextMenuArrowProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuArrow {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = "ContextMenuSub";

type ContextMenuSubProps = MenuSubProps & {
  defaultOpen?: boolean | undefined;
};

/**
 * `ContextMenuSub` contains all of the parts of a submenu.
 */
const ContextMenuSub: Component<ScopedProps<ContextMenuSubProps>> = (props) => {
  const menuScope = useMenuScope(props.__scopeContextMenu);
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: SUB_NAME,
  });

  return (
    <MenuSub {...menuScope} open={open()} onOpenChange={setOpen}>
      {props.children}
    </MenuSub>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuSubTriggerProps = MenuSubTriggerProps;

/**
 * `ContextMenuSubTrigger` is an item that opens a submenu. It must be rendered inside `ContextMenuSub`.
 */
const ContextMenuSubTrigger: Component<ScopedProps<ContextMenuSubTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);
  return <MenuSubTrigger {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSubContent
 * -----------------------------------------------------------------------------------------------*/

type ContextMenuSubContentProps = MenuSubContentProps;

/**
 * `ContextMenuSubContent` is the component that pops out when a submenu is open. It must be rendered inside `ContextMenuSub`.
 */
const ContextMenuSubContent: Component<ScopedProps<ContextMenuSubContentProps>> = (props) => {
  const rest = omit(props, "__scopeContextMenu", "ref");
  const menuScope = useMenuScope(props.__scopeContextMenu);

  return (
    <MenuSubContent
      {...menuScope}
      {...rest}
      ref={props.ref}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        "--radix-context-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-context-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-context-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-context-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-context-menu-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

function whenTouchOrPen<E extends PointerEvent>(handler: (event: E) => void): (event: E) => void {
  return (event) => {
    if (event.pointerType !== "mouse") handler(event);
  };
}

export {
  createContextMenuScope,
  //
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuItemIndicator,
  ContextMenuSeparator,
  ContextMenuArrow,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  //
  ContextMenu as Root,
  ContextMenuTrigger as Trigger,
  ContextMenuPortal as Portal,
  ContextMenuContent as Content,
  ContextMenuGroup as Group,
  ContextMenuLabel as Label,
  ContextMenuItem as Item,
  ContextMenuCheckboxItem as CheckboxItem,
  ContextMenuRadioGroup as RadioGroup,
  ContextMenuRadioItem as RadioItem,
  ContextMenuItemIndicator as ItemIndicator,
  ContextMenuSeparator as Separator,
  ContextMenuArrow as Arrow,
  ContextMenuSub as Sub,
  ContextMenuSubTrigger as SubTrigger,
  ContextMenuSubContent as SubContent,
};
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuPortalProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuLabelProps,
  ContextMenuItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuItemIndicatorProps,
  ContextMenuSeparatorProps,
  ContextMenuArrowProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
};
