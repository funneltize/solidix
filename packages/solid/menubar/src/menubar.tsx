import { createEffect, createSignal, omit, type Component } from "solid-js";
import { createCollection } from "@soldix/collection";
import { useComposedRefs, type RefObject } from "@soldix/compose-refs";
import { createContextScope, type Scope } from "@soldix/context";
import { Direction, useDirection } from "@soldix/direction";
import { useId } from "@soldix/id";
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
} from "@soldix/menu";
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
} from "@soldix/roving-focus";
import { useControllableState } from "@soldix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * Menubar
 * -----------------------------------------------------------------------------------------------*/

const MENUBAR_NAME = "Menubar";

type ItemData = { value: string; disabled: boolean };
const [Collection, useCollection, createCollectionScope] = createCollection<
  MenubarTriggerElement,
  ItemData
>(MENUBAR_NAME);

type ScopedProps<P> = P & { __scopeMenubar?: Scope | undefined };
const [createMenubarContext, createMenubarScope] = createContextScope(MENUBAR_NAME, [
  createCollectionScope,
  createRovingFocusGroupScope,
]);

const useMenuScope = createMenuScope();
const useRovingFocusGroupScope = createRovingFocusGroupScope();

type MenubarContextValue = {
  value: () => string;
  dir: "ltr" | "rtl";
  loop: boolean;
  onMenuOpen(value: string): void;
  onMenuClose(): void;
  onMenuToggle(value: string): void;
};

const [MenubarContextProvider, useMenubarContext] =
  createMenubarContext<MenubarContextValue>(MENUBAR_NAME);

type MenubarProps = Omit<PrimitivePropsWithRef<"div">, "dir"> & {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
  loop?: boolean | undefined;
  dir?: "ltr" | "rtl" | undefined;
};

const Menubar: Component<ScopedProps<MenubarProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeMenubar",
    "value",
    "onValueChange",
    "defaultValue",
    "loop",
    "dir",
    "ref",
  );
  const direction = useDirection(props.dir);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeMenubar);
  const loop = () => props.loop ?? true;
  const [value, setValue] = useControllableState({
    prop: () => props.value,
    onChange: props.onValueChange,
    defaultProp: props.defaultValue ?? "",
    caller: MENUBAR_NAME,
  });

  // We need to manage tab stop id manually as `RovingFocusGroup` updates the stop
  // based on focus, and in some situations our triggers won't ever be given focus
  // (e.g. click to open and then outside to close)
  const [currentTabStopId, setCurrentTabStopId] = createSignal<string | null>(null);

  const onMenuOpen = (nextValue: string) => {
    setValue(nextValue);
    setCurrentTabStopId(nextValue);
  };
  const onMenuClose = () => setValue("");
  const onMenuToggle = (nextValue: string) => {
    setValue((prevValue) => (prevValue ? "" : nextValue));
    // `openMenuOpen` and `onMenuToggle` are called exclusively so we
    // need to update the id in either case.
    setCurrentTabStopId(nextValue);
  };

  return (
    <MenubarContextProvider
      scope={props.__scopeMenubar}
      value={value}
      onMenuOpen={onMenuOpen}
      onMenuClose={onMenuClose}
      onMenuToggle={onMenuToggle}
      dir={direction}
      loop={loop()}
    >
      <Collection.Provider scope={props.__scopeMenubar}>
        <Collection.Slot scope={props.__scopeMenubar}>
          <RovingFocusGroup
            asChild
            {...rovingFocusGroupScope}
            orientation="horizontal"
            loop={loop()}
            dir={direction}
            currentTabStopId={currentTabStopId()}
            onCurrentTabStopIdChange={setCurrentTabStopId}
          >
            <Primitive.div role="menubar" {...rest} ref={props.ref} />
          </RovingFocusGroup>
        </Collection.Slot>
      </Collection.Provider>
    </MenubarContextProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenubarMenu
 * -----------------------------------------------------------------------------------------------*/

const MENU_NAME = "MenubarMenu";

type MenubarMenuContextValue = {
  value: string;
  triggerId: string;
  triggerRef: RefObject<MenubarTriggerElement | null>;
  contentId: string;
  wasKeyboardTriggerOpenRef: { current: boolean };
};

const [MenubarMenuProvider, useMenubarMenuContext] =
  createMenubarContext<MenubarMenuContextValue>(MENU_NAME);

type MenubarMenuProps = {
  value?: string | undefined;
  children?: import("@solidjs/web").JSX.Element | undefined;
};

const MenubarMenu: Component<ScopedProps<MenubarMenuProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "value");
  const autoValue = useId();
  // Radix falls back to `'LEGACY_REACT_AUTO_VALUE'` because `useId` returns
  // an empty string on the first React render (SSR); Solid's `useId` is
  // synchronous and never empty, so the fallback is unreachable here.
  const value = () => props.value || autoValue;
  const context = useMenubarContext(MENU_NAME, props.__scopeMenubar);
  const menuScope = useMenuScope(props.__scopeMenubar);
  const triggerRef: RefObject<MenubarTriggerElement | null> = { current: null };
  const wasKeyboardTriggerOpenRef = { current: false };
  const open = () => context.value() === value();
  // NOTE: ids are minted at setup, not inline in the JSX below. Nested JSX
  // re-evaluates on every children-getter read, which would mint new ids per
  // read and desynchronize `aria-controls` from the content's `id`.
  const triggerId = useId();
  const contentId = useId();

  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen) wasKeyboardTriggerOpenRef.current = false;
    },
  );

  return (
    <MenubarMenuProvider
      scope={props.__scopeMenubar}
      value={value()}
      triggerId={triggerId}
      triggerRef={triggerRef}
      contentId={contentId}
      wasKeyboardTriggerOpenRef={wasKeyboardTriggerOpenRef}
    >
      <MenuRoot
        {...menuScope}
        open={open()}
        onOpenChange={(nextOpen) => {
          // Menu only calls `onOpenChange` when dismissing so we
          // want to close our MenuBar based on the same events.
          if (!nextOpen) context.onMenuClose();
        }}
        modal={false}
        dir={context.dir}
        {...rest}
      />
    </MenubarMenuProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenubarTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "MenubarTrigger";

type MenubarTriggerElement = HTMLButtonElement;
type MenubarTriggerProps = Omit<PrimitivePropsWithRef<"button">, "disabled"> & {
  disabled?: boolean | undefined;
};

const MenubarTrigger: Component<ScopedProps<MenubarTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "disabled", "ref");
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeMenubar);
  const menuScope = useMenuScope(props.__scopeMenubar);
  const context = useMenubarContext(TRIGGER_NAME, props.__scopeMenubar);
  const menuContext = useMenubarMenuContext(TRIGGER_NAME, props.__scopeMenubar);
  const disabled = () => props.disabled ?? false;
  const ref: RefObject<MenubarTriggerElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, ref, menuContext.triggerRef);
  const [isFocused, setIsFocused] = createSignal(false);
  const open = () => context.value() === menuContext.value;

  return (
    <Collection.ItemSlot
      scope={props.__scopeMenubar}
      value={menuContext.value}
      disabled={disabled()}
    >
      <RovingFocusGroupItem
        asChild
        {...rovingFocusGroupScope}
        focusable={!disabled()}
        tabStopId={menuContext.value}
      >
        <MenuAnchor asChild {...menuScope}>
          <Primitive.button
            type="button"
            role="menuitem"
            id={menuContext.triggerId}
            aria-haspopup="menu"
            aria-expanded={ariaBoolean(open())}
            aria-controls={open() ? menuContext.contentId : undefined}
            data-highlighted={isFocused() ? "" : undefined}
            data-state={open() ? "open" : "closed"}
            data-disabled={disabled() ? "" : undefined}
            disabled={disabled()}
            {...rest}
            ref={composedRefs}
            onPointerDown={composeEventHandlers(
              (event: PointerEvent) => callEventHandler(props.onPointerDown, event),
              (event) => {
                // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
                // but not when the control key is pressed (avoiding MacOS right click)
                if (!disabled() && event.button === 0 && event.ctrlKey === false) {
                  context.onMenuOpen(menuContext.value);
                  // prevent trigger focusing when opening
                  // this allows the content to be given focus without competition
                  if (!open()) event.preventDefault();
                }
              },
            )}
            onPointerEnter={composeEventHandlers(
              (event: PointerEvent) => callEventHandler(props.onPointerEnter, event),
              () => {
                const menubarOpen = Boolean(context.value());
                if (menubarOpen && !open()) {
                  context.onMenuOpen(menuContext.value);
                  ref.current?.focus();
                }
              },
            )}
            onKeyDown={composeEventHandlers(
              (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
              (event) => {
                if (disabled()) return;
                if (["Enter", " "].includes(event.key)) context.onMenuToggle(menuContext.value);
                if (event.key === "ArrowDown") context.onMenuOpen(menuContext.value);
                // prevent keydown from scrolling window / first focused item to execute
                // that keydown (inadvertently closing the menu)
                if (["Enter", " ", "ArrowDown"].includes(event.key)) {
                  menuContext.wasKeyboardTriggerOpenRef.current = true;
                  event.preventDefault();
                }
              },
            )}
            onFocus={composeEventHandlers(
              (event: FocusEvent) => callEventHandler(props.onFocus, event),
              () => setIsFocused(true),
            )}
            onBlur={composeEventHandlers(
              (event: FocusEvent) => callEventHandler(props.onBlur, event),
              () => setIsFocused(false),
            )}
          />
        </MenuAnchor>
      </RovingFocusGroupItem>
    </Collection.ItemSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenubarPortal
 * -----------------------------------------------------------------------------------------------*/

type MenubarPortalProps = MenuPortalProps;

const MenubarPortal: Component<ScopedProps<MenubarPortalProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuPortal {...menuScope} {...rest} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "MenubarContent";

type MenubarContentProps = Omit<MenuContentProps, "onEntryFocus">;

const MenubarContent: Component<ScopedProps<MenubarContentProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "align", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  const context = useMenubarContext(CONTENT_NAME, props.__scopeMenubar);
  const menuContext = useMenubarMenuContext(CONTENT_NAME, props.__scopeMenubar);
  const getItems = useCollection(props.__scopeMenubar);
  const hasInteractedOutsideRef = { current: false };

  return (
    <MenuContent
      id={menuContext.contentId}
      aria-labelledby={menuContext.triggerId}
      data-radix-menubar-content=""
      {...menuScope}
      {...rest}
      ref={props.ref}
      align={props.align ?? "start"}
      onCloseAutoFocus={composeEventHandlers(
        (event: Event) => callEventHandler(rest.onCloseAutoFocus, event),
        (event) => {
          const menubarOpen = Boolean(context.value());
          if (!menubarOpen && !hasInteractedOutsideRef.current) {
            menuContext.triggerRef.current?.focus();
          }

          hasInteractedOutsideRef.current = false;
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        },
      )}
      onFocusOutside={composeEventHandlers(
        (event) => callEventHandler(rest.onFocusOutside, event),
        (event) => {
          const target = event.target as HTMLElement;
          const isMenubarTrigger = getItems().some((item) => item.ref.current?.contains(target));
          if (isMenubarTrigger) event.preventDefault();
        },
      )}
      onInteractOutside={composeEventHandlers(
        (event) => callEventHandler(rest.onInteractOutside, event),
        () => {
          hasInteractedOutsideRef.current = true;
        },
      )}
      onEntryFocus={(event) => {
        if (!menuContext.wasKeyboardTriggerOpenRef.current) event.preventDefault();
      }}
      onKeyDown={composeEventHandlers(
        (event: KeyboardEvent) => callEventHandler(rest.onKeyDown, event),
        (event) => {
          if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
            const target = event.target as HTMLElement;
            const targetIsSubTrigger = target.hasAttribute("data-radix-menubar-subtrigger");
            const isKeyDownInsideSubMenu =
              target.closest("[data-radix-menubar-content]") !== event.currentTarget;

            const prevMenuKey = context.dir === Direction.RTL ? "ArrowRight" : "ArrowLeft";
            const isPrevKey = prevMenuKey === event.key;
            const isNextKey = !isPrevKey;

            // Prevent navigation when we're opening a submenu
            if (isNextKey && targetIsSubTrigger) return;
            // or we're inside a submenu and are moving backwards to close it
            if (isKeyDownInsideSubMenu && isPrevKey) return;

            const items = getItems().filter((item) => !item.disabled);
            let candidateValues = items.map((item) => item.value);
            if (isPrevKey) candidateValues.reverse();

            const currentIndex = candidateValues.indexOf(menuContext.value);

            candidateValues = context.loop
              ? wrapArray(candidateValues, currentIndex + 1)
              : candidateValues.slice(currentIndex + 1);

            const [nextValue] = candidateValues;
            if (nextValue) context.onMenuOpen(nextValue);
          }
        },
        { checkForDefaultPrevented: false },
      )}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        "--radix-menubar-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-menubar-content-available-width": "var(--radix-popper-available-width)",
        "--radix-menubar-content-available-height": "var(--radix-popper-available-height)",
        "--radix-menubar-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-menubar-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenubarGroup
 * -----------------------------------------------------------------------------------------------*/

type MenubarGroupProps = MenuGroupProps;

const MenubarGroup: Component<ScopedProps<MenubarGroupProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuGroup {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarLabel
 * -----------------------------------------------------------------------------------------------*/

type MenubarLabelProps = MenuLabelProps;

const MenubarLabel: Component<ScopedProps<MenubarLabelProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuLabel {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarItem
 * -----------------------------------------------------------------------------------------------*/

type MenubarItemProps = MenuItemProps;

const MenubarItem: Component<ScopedProps<MenubarItemProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

type MenubarCheckboxItemProps = MenuCheckboxItemProps;

const MenubarCheckboxItem: Component<ScopedProps<MenubarCheckboxItemProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuCheckboxItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarRadioGroup
 * -----------------------------------------------------------------------------------------------*/

type MenubarRadioGroupProps = MenuRadioGroupProps;

const MenubarRadioGroup: Component<ScopedProps<MenubarRadioGroupProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuRadioGroup {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarRadioItem
 * -----------------------------------------------------------------------------------------------*/

type MenubarRadioItemProps = MenuRadioItemProps;

const MenubarRadioItem: Component<ScopedProps<MenubarRadioItemProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuRadioItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type MenubarItemIndicatorProps = MenuItemIndicatorProps;

const MenubarItemIndicator: Component<ScopedProps<MenubarItemIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuItemIndicator {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarSeparator
 * -----------------------------------------------------------------------------------------------*/

type MenubarSeparatorProps = MenuSeparatorProps;

const MenubarSeparator: Component<ScopedProps<MenubarSeparatorProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuSeparator {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarArrow
 * -----------------------------------------------------------------------------------------------*/

type MenubarArrowProps = MenuArrowProps;

const MenubarArrow: Component<ScopedProps<MenubarArrowProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return <MenuArrow {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenubarSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = "MenubarSub";

type MenubarSubProps = MenuSubProps & {
  defaultOpen?: boolean | undefined;
};

const MenubarSub: Component<ScopedProps<MenubarSubProps>> = (props) => {
  const menuScope = useMenuScope(props.__scopeMenubar);
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
 * MenubarSubTrigger
 * -----------------------------------------------------------------------------------------------*/

type MenubarSubTriggerProps = MenuSubTriggerProps;

const MenubarSubTrigger: Component<ScopedProps<MenubarSubTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);
  return (
    <MenuSubTrigger data-radix-menubar-subtrigger="" {...menuScope} {...rest} ref={props.ref} />
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenubarSubContent
 * -----------------------------------------------------------------------------------------------*/

type MenubarSubContentProps = MenuSubContentProps;

const MenubarSubContent: Component<ScopedProps<MenubarSubContentProps>> = (props) => {
  const rest = omit(props, "__scopeMenubar", "ref");
  const menuScope = useMenuScope(props.__scopeMenubar);

  return (
    <MenuSubContent
      {...menuScope}
      data-radix-menubar-content=""
      {...rest}
      ref={props.ref}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        "--radix-menubar-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-menubar-content-available-width": "var(--radix-popper-available-width)",
        "--radix-menubar-content-available-height": "var(--radix-popper-available-height)",
        "--radix-menubar-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-menubar-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!);
}

export {
  createMenubarScope,
  //
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarItemIndicator,
  MenubarSeparator,
  MenubarArrow,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  //
  Menubar as Root,
  MenubarMenu as Menu,
  MenubarTrigger as Trigger,
  MenubarPortal as Portal,
  MenubarContent as Content,
  MenubarGroup as Group,
  MenubarLabel as Label,
  MenubarItem as Item,
  MenubarCheckboxItem as CheckboxItem,
  MenubarRadioGroup as RadioGroup,
  MenubarRadioItem as RadioItem,
  MenubarItemIndicator as ItemIndicator,
  MenubarSeparator as Separator,
  MenubarArrow as Arrow,
  MenubarSub as Sub,
  MenubarSubTrigger as SubTrigger,
  MenubarSubContent as SubContent,
};
export type {
  MenubarProps,
  MenubarMenuProps,
  MenubarTriggerProps,
  MenubarPortalProps,
  MenubarContentProps,
  MenubarGroupProps,
  MenubarLabelProps,
  MenubarItemProps,
  MenubarCheckboxItemProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarItemIndicatorProps,
  MenubarSeparatorProps,
  MenubarArrowProps,
  MenubarSubProps,
  MenubarSubTriggerProps,
  MenubarSubContentProps,
};
