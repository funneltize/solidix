import { createEffect, createSignal, omit, onCleanup, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createCollection } from "@solidix/collection";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection, type Direction } from "@solidix/direction";
import { DismissableLayer, type DismissableLayerProps } from "@solidix/dismissable-layer";
import { useFocusGuards } from "@solidix/focus-guards";
import { useId } from "@solidix/id";
import {
  FocusScope,
  FocusScopeBranchProvider,
  useFocusScopeBranch,
  useFocusScopeBranchRegistry,
  type FocusScopeProps,
} from "@solidix/focus-scope";
import {
  Popper,
  PopperAnchor,
  PopperArrow,
  PopperContent,
  createPopperScope,
  type PopperAnchorProps,
  type PopperArrowProps,
  type PopperContentProps,
} from "@solidix/popper";
import { Portal as PortalPrimitive, type PortalProps } from "@solidix/portal";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  dispatchDiscreteCustomEvent,
  hideOthers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
  type RovingFocusGroupProps,
} from "@solidix/roving-focus";
import { RemoveScroll } from "@solidix/remove-scroll";
import { useCallbackRef } from "@solidix/use-callback-ref";

const SELECTION_KEYS = ["Enter", " "];
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
const LAST_KEYS = ["ArrowUp", "PageDown", "End"];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SUB_OPEN_KEYS: Record<Direction, string[]> = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"],
};
const SUB_CLOSE_KEYS: Record<Direction, string[]> = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"],
};

/* -------------------------------------------------------------------------------------------------
 * Menu
 * -----------------------------------------------------------------------------------------------*/

const MENU_NAME = "Menu";

type ItemData = { disabled: boolean; textValue: string };
const [Collection, useCollection, createCollectionScope] = createCollection<
  MenuItemElement,
  ItemData
>(MENU_NAME);

type ScopedProps<P> = P & { __scopeMenu?: Scope | undefined };
const [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createCollectionScope,
  createPopperScope,
  createRovingFocusGroupScope,
]);
const usePopperScope = createPopperScope();
const useRovingFocusGroupScope = createRovingFocusGroupScope();

type MenuContextValue = {
  open: () => boolean;
  onOpenChange(open: boolean): void;
  content: () => MenuContentElement | null;
  onContentChange(content: MenuContentElement | null): void;
};

const [MenuProvider, useMenuContext] = createMenuContext<MenuContextValue>(MENU_NAME);

type MenuRootContextValue = {
  onClose(): void;
  isUsingKeyboardRef: { current: boolean };
  dir: Direction;
  modal: boolean;
};

const [MenuRootProvider, useMenuRootContext] = createMenuContext<MenuRootContextValue>(MENU_NAME);

type MenuProps = {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  dir?: Direction | undefined;
  modal?: boolean | undefined;
};

const Menu: Component<ScopedProps<MenuProps>> = (props) => {
  const popperScope = usePopperScope(props.__scopeMenu);
  const [content, setContent] = createSignal<MenuContentElement | null>(null);
  const isUsingKeyboardRef = { current: false };
  const handleOpenChange = useCallbackRef((open: boolean) => {
    callEventHandler(props.onOpenChange, open);
  });
  const direction = useDirection(props.dir);
  const open = () => props.open ?? false;
  const modal = () => props.modal ?? true;

  createEffect(
    () => undefined,
    () => {
      // Capture phase ensures we set the boolean before any side effects execute
      // in response to the key or pointer event as they might depend on this value.
      const handleKeyDown = () => {
        isUsingKeyboardRef.current = true;
        document.addEventListener("pointerdown", handlePointer, { capture: true, once: true });
        document.addEventListener("pointermove", handlePointer, { capture: true, once: true });
      };
      const handlePointer = () => (isUsingKeyboardRef.current = false);
      document.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => {
        document.removeEventListener("keydown", handleKeyDown, { capture: true });
        document.removeEventListener("pointerdown", handlePointer, { capture: true });
        document.removeEventListener("pointermove", handlePointer, { capture: true });
      };
    },
  );

  // Close the menu (and any open submenus) when the window loses focus, e.g. when
  // switching to another browser tab or application. Without this, submenus would
  // remain open when the page is re-focused, leaving the menu in an inconsistent state.
  // See: https://github.com/radix-ui/primitives/issues/3257
  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen) return;
      const handleBlur = () => handleOpenChange(false);
      window.addEventListener("blur", handleBlur);
      return () => window.removeEventListener("blur", handleBlur);
    },
  );

  return (
    <Popper {...popperScope}>
      <MenuProvider
        scope={props.__scopeMenu}
        open={open}
        onOpenChange={handleOpenChange}
        content={content}
        onContentChange={setContent}
      >
        <MenuRootProvider
          scope={props.__scopeMenu}
          onClose={() => handleOpenChange(false)}
          isUsingKeyboardRef={isUsingKeyboardRef}
          dir={direction}
          modal={modal()}
        >
          {props.children}
        </MenuRootProvider>
      </MenuProvider>
    </Popper>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuAnchor
 * -----------------------------------------------------------------------------------------------*/

type MenuAnchorProps = PopperAnchorProps;

const MenuAnchor: Component<ScopedProps<MenuAnchorProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "ref");
  const popperScope = usePopperScope(props.__scopeMenu);
  return <PopperAnchor {...popperScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenuPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "MenuPortal";

type PortalContextValue = { forceMount?: true | undefined };
const [PortalProvider, usePortalContext] = createMenuContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

type MenuPortalProps = {
  children?: JSX.Element | undefined;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps["container"] | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with CSS (see the Animation guide).
   */
  forceMount?: true | undefined;
};

const MenuPortal: Component<ScopedProps<MenuPortalProps>> = (props) => {
  const context = useMenuContext(PORTAL_NAME, props.__scopeMenu);
  // NOTE: Radix nests the portal inside `Presence`; Solidix inverts this.
  // Solid portals resolve to a text marker, so a `Presence` around the
  // portal cannot resolve (or track for exit animations) the portalled
  // content. With `Presence` inside, it resolves the content directly.
  // Deviation: empty portal markers stay in the container while closed.
  return (
    <PortalProvider scope={props.__scopeMenu} forceMount={props.forceMount}>
      <PortalPrimitive container={props.container}>
        <Presence present={() => props.forceMount || context.open()}>{props.children}</Presence>
      </PortalPrimitive>
    </PortalProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "MenuContent";

type MenuContentContextValue = {
  onItemEnter(event: PointerEvent): void;
  onItemLeave(event: PointerEvent): void;
  onTriggerLeave(event: PointerEvent): void;
  searchRef: { current: string };
  pointerGraceTimerRef: { current: number };
  onPointerGraceIntentChange(intent: GraceIntent | null): void;
};
const [MenuContentProvider, useMenuContentContext] =
  createMenuContext<MenuContentContextValue>(CONTENT_NAME);

type MenuContentElement = MenuRootContentTypeElement;
/**
 * We purposefully don't union MenuRootContent and MenuSubContent props here because
 * they have conflicting prop types. We agreed that we would allow MenuSubContent to
 * accept props that it would just ignore.
 */
type MenuContentProps = MenuRootContentTypeProps & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with CSS (see the Animation guide).
   */
  forceMount?: true | undefined;
};

const MenuContent: Component<ScopedProps<MenuContentProps>> = (props) => {
  const rest = omit(props, "forceMount", "ref");
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeMenu);
  const context = useMenuContext(CONTENT_NAME, props.__scopeMenu);
  const rootContext = useMenuRootContext(CONTENT_NAME, props.__scopeMenu);
  const forceMount = () => props.forceMount ?? portalContext.forceMount;

  return (
    <Collection.Provider scope={props.__scopeMenu}>
      <Presence present={() => forceMount() || context.open()}>
        <Collection.Slot scope={props.__scopeMenu}>
          {rootContext.modal ? (
            <MenuRootContentModal {...rest} ref={props.ref} />
          ) : (
            <MenuRootContentNonModal {...rest} ref={props.ref} />
          )}
        </Collection.Slot>
      </Presence>
    </Collection.Provider>
  );
};

/* ---------------------------------------------------------------------------------------------- */

type MenuRootContentTypeElement = MenuContentImplElement;
type MenuRootContentTypeProps = Omit<MenuContentImplProps, keyof MenuContentImplPrivateProps>;

const MenuRootContentModal: Component<ScopedProps<MenuRootContentTypeProps>> = (props) => {
  const rest = omit(props, "ref");
  const context = useMenuContext(CONTENT_NAME, props.__scopeMenu);
  const contentRef: RefObject<MenuRootContentTypeElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, contentRef);

  // Hide everything from ARIA except the `MenuContent`
  createEffect(
    () => undefined,
    () => {
      const content = contentRef.current;
      if (content) {
        return hideOthers(new Set([content]), content.ownerDocument.body);
      }
    },
  );

  return (
    <MenuContentImpl
      {...rest}
      ref={composedRefs}
      // we make sure we're not trapping once it's been closed
      // (closed !== unmounted when animating out)
      trapFocus={context.open()}
      // make sure to only disable pointer events when open
      // this avoids blocking interactions while animating out
      disableOutsidePointerEvents={context.open()}
      disableOutsideScroll
      // When focus is trapped, a `focusout` event may still happen.
      // We make sure we don't trigger our `onDismiss` in such case.
      onFocusOutside={composeEventHandlers(
        (event) => callEventHandler(rest.onFocusOutside, event),
        (event) => event.preventDefault(),
        { checkForDefaultPrevented: false },
      )}
      onDismiss={() => context.onOpenChange(false)}
    />
  );
};

const MenuRootContentNonModal: Component<ScopedProps<MenuRootContentTypeProps>> = (props) => {
  const rest = omit(props, "ref");
  const context = useMenuContext(CONTENT_NAME, props.__scopeMenu);
  return (
    <MenuContentImpl
      {...rest}
      ref={props.ref}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      disableOutsideScroll={false}
      onDismiss={() => context.onOpenChange(false)}
    />
  );
};

/* ---------------------------------------------------------------------------------------------- */

type MenuContentImplElement = HTMLDivElement;
type MenuContentImplPrivateProps = {
  onOpenAutoFocus?: FocusScopeProps["onMountAutoFocus"] | undefined;
  onDismiss?: DismissableLayerProps["onDismiss"] | undefined;
  disableOutsidePointerEvents?: DismissableLayerProps["disableOutsidePointerEvents"] | undefined;

  /**
   * Whether scrolling outside the `MenuContent` should be prevented
   * (default: `false`)
   */
  disableOutsideScroll?: boolean | undefined;

  /**
   * Whether focus should be trapped within the `MenuContent`
   * (default: false)
   */
  trapFocus?: FocusScopeProps["trapped"] | undefined;
};
type MenuContentImplProps = MenuContentImplPrivateProps &
  Omit<PopperContentProps, "dir" | "onPlaced"> & {
    /**
     * Event handler called when auto-focusing on close.
     * Can be prevented.
     */
    onCloseAutoFocus?: FocusScopeProps["onUnmountAutoFocus"] | undefined;

    /**
     * Whether keyboard navigation should loop around
     * @defaultValue false
     */
    loop?: RovingFocusGroupProps["loop"] | undefined;

    onEntryFocus?: RovingFocusGroupProps["onEntryFocus"] | undefined;
    onEscapeKeyDown?: DismissableLayerProps["onEscapeKeyDown"] | undefined;
    onPointerDownOutside?: DismissableLayerProps["onPointerDownOutside"] | undefined;
    onFocusOutside?: DismissableLayerProps["onFocusOutside"] | undefined;
    onInteractOutside?: DismissableLayerProps["onInteractOutside"] | undefined;
  };

const MenuContentImpl: Component<ScopedProps<MenuContentImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeMenu",
    "loop",
    "trapFocus",
    "onOpenAutoFocus",
    "onCloseAutoFocus",
    "disableOutsidePointerEvents",
    "onEntryFocus",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "onDismiss",
    "disableOutsideScroll",
    "ref",
  );
  const context = useMenuContext(CONTENT_NAME, props.__scopeMenu);
  const rootContext = useMenuRootContext(CONTENT_NAME, props.__scopeMenu);
  const popperScope = usePopperScope(props.__scopeMenu);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeMenu);
  const getItems = useCollection(props.__scopeMenu);
  const [currentItemId, setCurrentItemId] = createSignal<string | null>(null);
  const contentRef: RefObject<HTMLDivElement | null> = { current: null };

  // When this `Menu` is nested inside a modal layer (eg. a `Dialog`) but portalled outside of it,
  // register its content with the ancestor layer so focus isn't reclaimed and scroll isn't locked
  // for it (only relevant for non-modal menus, which don't trap focus / lock scroll themselves).
  // It also exposes its own registry so nested, portalled layers can do the same against it.
  // See: https://github.com/radix-ui/primitives/issues/3423
  const [branchNode, setBranchNode] = createSignal<HTMLElement | null>(null);
  useFocusScopeBranch(branchNode);
  const { nodes: branchNodes, registry: branchRegistry } = useFocusScopeBranchRegistry();
  // Only modal menus trap focus / lock scroll, so only they need to host branches. Non-modal
  // menus stay transparent and let nested layers register against the next modal ancestor.
  // NOTE: a thunk, not a setup-time const - the props can flip while mounted
  // (modal content untraps while animating out) and a frozen read would also
  // trip Solid 2's strict untracked-read diagnostic.
  const isModal = () => Boolean(props.trapFocus || props.disableOutsideScroll);
  const composedRefs = useComposedRefs(
    props.ref,
    contentRef,
    context.onContentChange,
    setBranchNode,
  );
  let timer = 0;
  const searchRef = { current: "" };
  const pointerGraceTimerRef = { current: 0 };
  const pointerGraceIntentRef: { current: GraceIntent | null } = { current: null };
  const pointerDirRef: { current: Side } = { current: "right" };
  const lastPointerXRef = { current: 0 };

  onCleanup(() => window.clearTimeout(timer));

  // Make sure the whole tree has focus guards as our `MenuContent` may be
  // the last element in the DOM (because of the `Portal`)
  useFocusGuards();

  const handleTypeaheadSearch = (key: string) => {
    const search = searchRef.current + key;
    const items = getItems().filter((item) => !item.disabled);
    const currentItem = document.activeElement;
    const currentMatch = items.find((item) => item.ref.current === currentItem);
    const currentMatchValue = currentMatch && getItemTextValue(currentMatch);
    const values = items.map((item) => getItemTextValue(item));
    const nextMatch = getNextMatch(values, search, currentMatchValue || undefined);
    const newItem = items.find((item) => getItemTextValue(item) === nextMatch)?.ref.current;

    function updateSearch(value: string) {
      searchRef.current = value;
      window.clearTimeout(timer);
      // Reset `searchRef` 1 second after it was last updated
      if (value !== "") timer = window.setTimeout(() => updateSearch(""), 1000);
    }
    updateSearch(search);

    if (newItem) {
      /**
       * Imperative focus during keydown is risky so we prevent React's batching updates
       * to avoid potential bugs. See: https://github.com/facebook/react/issues/20332
       */
      setTimeout(() => (newItem as HTMLElement).focus());
    }
  };

  const isPointerMovingToSubmenu = (event: PointerEvent) => {
    // A pointerleave can be the first event after a coalesced move, so use its coordinates
    // instead of relying on the direction recorded by the last pointermove.
    let pointerDir = pointerDirRef.current;
    if (event.type === "pointerleave" && event.clientX !== lastPointerXRef.current) {
      pointerDir = event.clientX > lastPointerXRef.current ? "right" : "left";
    }
    const isMovingTowards = pointerDir === pointerGraceIntentRef.current?.side;
    return isMovingTowards && isPointerInGraceArea(event, pointerGraceIntentRef.current?.area);
  };

  // NOTE: built by a render function called inside the JSX below (not a
  // hoisted value): Solid context flows through setup nesting, so the
  // subtree must instantiate while resolving through `MenuContentProvider`
  // above - a value created here would miss its context.
  const renderFocusScopeTree = () => (
    <FocusScope
      asChild
      trapped={props.trapFocus}
      branches={branchNodes()}
      onMountAutoFocus={composeEventHandlers(
        (event) => callEventHandler(props.onOpenAutoFocus, event),
        (event) => {
          // when opening, explicitly focus the content area only and leave
          // `onEntryFocus` in  control of focusing first item
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        },
      )}
      onUnmountAutoFocus={props.onCloseAutoFocus}
    >
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={props.disableOutsidePointerEvents}
        onEscapeKeyDown={props.onEscapeKeyDown}
        onPointerDownOutside={props.onPointerDownOutside}
        onFocusOutside={props.onFocusOutside}
        onInteractOutside={props.onInteractOutside}
        onDismiss={props.onDismiss}
      >
        <RovingFocusGroup
          asChild
          {...rovingFocusGroupScope}
          dir={rootContext.dir}
          orientation="vertical"
          loop={props.loop ?? false}
          currentTabStopId={currentItemId()}
          onCurrentTabStopIdChange={setCurrentItemId}
          onEntryFocus={composeEventHandlers(
            (event) => callEventHandler(props.onEntryFocus, event),
            (event) => {
              // only focus first item when using keyboard
              if (!rootContext.isUsingKeyboardRef.current) event.preventDefault();
            },
          )}
          preventScrollOnEntryFocus
        >
          <PopperContent
            role="menu"
            aria-orientation="vertical"
            data-state={getOpenState(context.open())}
            data-radix-menu-content=""
            dir={rootContext.dir}
            {...popperScope}
            {...rest}
            ref={composedRefs}
            style={{ outline: "none", ...rest.style }}
            onKeyDown={composeEventHandlers(
              (event: KeyboardEvent) => callEventHandler(rest.onKeyDown, event),
              (event) => {
                // submenu key events bubble through portals. We only care
                // about keys in this menu.
                const target = event.target as HTMLElement;
                const isKeyDownInside =
                  target.closest("[data-radix-menu-content]") ===
                  (event.currentTarget as HTMLElement);
                const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                const isCharacterKey = event.key.length === 1;
                if (isKeyDownInside) {
                  // menus should not be navigated using tab key so we
                  // prevent it
                  if (event.key === "Tab") event.preventDefault();
                  if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key);
                }
                // focus first/last item based on key pressed
                const content = contentRef.current;
                if (event.target !== content) return;
                if (!FIRST_LAST_KEYS.includes(event.key)) return;
                event.preventDefault();
                const items = getItems().filter((item) => !item.disabled);
                const candidateNodes = items.map((item) => item.ref.current!);
                if (LAST_KEYS.includes(event.key)) candidateNodes.reverse();
                focusFirst(candidateNodes);
              },
            )}
            onBlur={composeEventHandlers(
              (event: FocusEvent) => callEventHandler(rest.onBlur, event),
              (event) => {
                // clear search buffer when leaving the menu
                if (!(event.currentTarget as HTMLElement).contains(event.target as Node | null)) {
                  window.clearTimeout(timer);
                  searchRef.current = "";
                }
              },
            )}
            onPointerMove={composeEventHandlers(
              (event: PointerEvent) => callEventHandler(rest.onPointerMove, event),
              whenMouse((event) => {
                const target = event.target as HTMLElement;
                const pointerXHasChanged = lastPointerXRef.current !== event.clientX;

                // We don't use `event.movementX` for this check because
                // Safari will always return `0` on a pointer event.
                if ((event.currentTarget as HTMLElement).contains(target) && pointerXHasChanged) {
                  const newDir = event.clientX > lastPointerXRef.current ? "right" : "left";
                  pointerDirRef.current = newDir;
                  lastPointerXRef.current = event.clientX;
                }
              }),
            )}
          />
        </RovingFocusGroup>
      </DismissableLayer>
    </FocusScope>
  );

  return (
    <MenuContentProvider
      scope={props.__scopeMenu}
      searchRef={searchRef}
      // ignore pointer movement once closed, the content stays mounted while animating out
      onItemEnter={(event) => {
        if (!context.open() || isPointerMovingToSubmenu(event)) event.preventDefault();
      }}
      onItemLeave={(event) => {
        if (!context.open() || isPointerMovingToSubmenu(event)) return;
        contentRef.current?.focus();
        setCurrentItemId(null);
      }}
      onTriggerLeave={(event) => {
        if (isPointerMovingToSubmenu(event)) event.preventDefault();
      }}
      pointerGraceTimerRef={pointerGraceTimerRef}
      onPointerGraceIntentChange={(intent) => {
        pointerGraceIntentRef.current = intent;
      }}
    >
      <FocusScopeBranchProvider registry={isModal() ? branchRegistry : null}>
        {props.disableOutsideScroll ? (
          <RemoveScroll
            asChild
            allowPinchZoom
            shards={[
              contentRef,
              ...branchNodes().map((node) => ({ current: node as HTMLElement | null })),
            ]}
          >
            {renderFocusScopeTree()}
          </RemoveScroll>
        ) : (
          renderFocusScopeTree()
        )}
      </FocusScopeBranchProvider>
    </MenuContentProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuGroup
 * -----------------------------------------------------------------------------------------------*/

type MenuGroupProps = PrimitivePropsWithRef<"div">;

const MenuGroup: Component<ScopedProps<MenuGroupProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "ref");
  return <Primitive.div role="group" {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenuLabel
 * -----------------------------------------------------------------------------------------------*/

type MenuLabelProps = PrimitivePropsWithRef<"div">;

const MenuLabel: Component<ScopedProps<MenuLabelProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "ref");
  return <Primitive.div {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "MenuItem";

type MenuItemElement = HTMLDivElement;
type MenuItemProps = MenuItemImplProps & {
  onSelect?: ((event: Event) => void) | undefined;
};

const MenuItem: Component<ScopedProps<MenuItemProps>> = (props) => {
  const rest = omit(props, "disabled", "onSelect", "ref");
  const disabled = () => props.disabled ?? false;
  const ref: RefObject<HTMLDivElement | null> = { current: null };
  const rootContext = useMenuRootContext(ITEM_NAME, props.__scopeMenu);
  const contentContext = useMenuContentContext(ITEM_NAME, props.__scopeMenu);
  const composedRefs = useComposedRefs(props.ref, ref);
  const isPointerDownRef = { current: false };

  const handleSelect = () => {
    const menuItem = ref.current;
    if (!disabled() && menuItem) {
      const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true });
      menuItem.addEventListener(ITEM_SELECT, (event) => props.onSelect?.(event), { once: true });
      dispatchDiscreteCustomEvent(menuItem, itemSelectEvent);
      if (itemSelectEvent.defaultPrevented) {
        isPointerDownRef.current = false;
      } else {
        rootContext.onClose();
      }
    }
  };

  return (
    <MenuItemImpl
      {...rest}
      ref={composedRefs}
      disabled={disabled()}
      onClick={composeEventHandlers(
        (event: MouseEvent) => callEventHandler(props.onClick, event),
        handleSelect,
      )}
      onPointerDown={(event: PointerEvent) => {
        callEventHandler(props.onPointerDown, event);
        isPointerDownRef.current = true;
      }}
      onPointerUp={composeEventHandlers(
        (event: PointerEvent) => callEventHandler(props.onPointerUp, event),
        (event) => {
          // Pointer down can move to a different menu item which should activate it on pointer up.
          // We dispatch a click for selection to allow composition with click based triggers and to
          // prevent Firefox from getting stuck in text selection mode when the menu closes.
          if (!isPointerDownRef.current) (event.currentTarget as HTMLElement | null)?.click();
        },
      )}
      onKeyDown={composeEventHandlers(
        (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
        (event) => {
          // Only react to keys originating from the item itself. Keys from
          // focusable descendants in the item's DOM subtree (eg. an `input`)
          // bubble here natively and must not trigger selection.
          // See: https://github.com/radix-ui/primitives/issues/3232
          if (disabled() || event.target !== event.currentTarget) {
            return;
          }

          const isTypingAhead = contentContext.searchRef.current !== "";
          if (isTypingAhead && event.key === " ") {
            return;
          }

          if (SELECTION_KEYS.includes(event.key)) {
            (event.currentTarget as HTMLElement | null)?.click();
            /**
             * We prevent default browser behaviour for selection keys as they should trigger
             * a selection only:
             * - prevents space from scrolling the page.
             * - if keydown causes focus to move, prevents keydown from firing on the new target.
             */
            event.preventDefault();
          }
        },
      )}
    />
  );
};

/* ---------------------------------------------------------------------------------------------- */

type MenuItemImplElement = HTMLDivElement;
type MenuItemImplProps = PrimitivePropsWithRef<"div"> & {
  disabled?: boolean | undefined;
  textValue?: string | undefined;
};

const MenuItemImpl: Component<ScopedProps<MenuItemImplProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "disabled", "textValue", "ref");
  const disabled = () => props.disabled ?? false;
  const contentContext = useMenuContentContext(ITEM_NAME, props.__scopeMenu);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeMenu);
  const ref: RefObject<HTMLDivElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, ref);
  const [isFocused, setIsFocused] = createSignal(false);

  return (
    <Collection.ItemSlot
      scope={props.__scopeMenu}
      disabled={disabled()}
      // NOTE: with no explicit `textValue`, typeahead reads the live DOM
      // text at match time (`getItemTextValue`) instead of the registered
      // value - Solid props freeze at setup and can't pick up the post-mount
      // `.textContent` sync the way Radix's re-render does.
      textValue={props.textValue ?? ""}
    >
      <RovingFocusGroupItem asChild {...rovingFocusGroupScope} focusable={!disabled()}>
        <Primitive.div
          role="menuitem"
          data-highlighted={isFocused() ? "" : undefined}
          aria-disabled={disabled() ? "true" : undefined}
          data-disabled={disabled() ? "" : undefined}
          {...rest}
          ref={composedRefs}
          /**
           * We focus items on `pointerMove` to achieve the following:
           *
           * - Mouse over an item (it focuses)
           * - Leave mouse where it is and use keyboard to focus a different item
           * - Wiggle mouse without it leaving previously focused item
           * - Previously focused item should re-focus
           *
           * If we used `mouseOver`/`mouseEnter` it would not re-focus when the mouse
           * wiggles. This is to match native menu implementation.
           */
          onPointerMove={composeEventHandlers(
            (event: PointerEvent) => callEventHandler(props.onPointerMove, event),
            whenMouse((event) => {
              if (disabled()) {
                contentContext.onItemLeave(event);
              } else {
                contentContext.onItemEnter(event);
                if (!event.defaultPrevented) {
                  const item = event.currentTarget as HTMLElement;
                  item.focus({ preventScroll: true });
                }
              }
            }),
          )}
          onPointerLeave={composeEventHandlers(
            (event: PointerEvent) => callEventHandler(props.onPointerLeave, event),
            whenMouse((event) => contentContext.onItemLeave(event)),
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
      </RovingFocusGroupItem>
    </Collection.ItemSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

type CheckedState = boolean | "indeterminate";

type MenuCheckboxItemProps = MenuItemProps & {
  checked?: CheckedState | undefined;
  // `onCheckedChange` can never be called with `"indeterminate"` from the inside
  onCheckedChange?: { bivarianceHack(checked: boolean): void }["bivarianceHack"] | undefined;
};

const MenuCheckboxItem: Component<ScopedProps<MenuCheckboxItemProps>> = (props) => {
  const rest = omit(props, "checked", "onCheckedChange", "ref");
  const checked = () => props.checked ?? false;
  return (
    <ItemIndicatorProvider scope={props.__scopeMenu} checked={checked}>
      <MenuItem
        role="menuitemcheckbox"
        aria-checked={getAriaChecked(checked())}
        {...rest}
        ref={props.ref}
        data-state={getCheckedState(checked())}
        onSelect={composeEventHandlers(
          (event) => callEventHandler(rest.onSelect, event),
          () =>
            callEventHandler(props.onCheckedChange, isIndeterminate(checked()) ? true : !checked()),
          { checkForDefaultPrevented: false },
        )}
      />
    </ItemIndicatorProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = "MenuRadioGroup";

type RadioGroupContextValue = {
  value: () => string | undefined;
  onValueChange: (value: string) => void;
};

const [RadioGroupProvider, useRadioGroupContext] = createMenuContext<RadioGroupContextValue>(
  RADIO_GROUP_NAME,
  { value: () => undefined, onValueChange: () => {} },
);

type MenuRadioGroupProps = MenuGroupProps & {
  value?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
};

const MenuRadioGroup: Component<ScopedProps<MenuRadioGroupProps>> = (props) => {
  const rest = omit(props, "value", "onValueChange", "ref");
  const handleValueChange = useCallbackRef((value: string) => {
    callEventHandler(props.onValueChange, value);
  });
  return (
    <RadioGroupProvider
      scope={props.__scopeMenu}
      value={() => props.value}
      onValueChange={handleValueChange}
    >
      <MenuGroup {...rest} ref={props.ref} />
    </RadioGroupProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = "MenuRadioItem";

type MenuRadioItemProps = MenuItemProps & {
  value: string;
};

const MenuRadioItem: Component<ScopedProps<MenuRadioItemProps>> = (props) => {
  const rest = omit(props, "value", "ref");
  const context = useRadioGroupContext(RADIO_ITEM_NAME, props.__scopeMenu);
  const checked = () => props.value === context.value();
  return (
    <ItemIndicatorProvider scope={props.__scopeMenu} checked={checked}>
      <MenuItem
        role="menuitemradio"
        aria-checked={ariaBoolean(checked())}
        {...rest}
        ref={props.ref}
        data-state={getCheckedState(checked())}
        onSelect={composeEventHandlers(
          (event) => callEventHandler(rest.onSelect, event),
          () => context.onValueChange?.(props.value),
          { checkForDefaultPrevented: false },
        )}
      />
    </ItemIndicatorProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const ITEM_INDICATOR_NAME = "MenuItemIndicator";

type CheckboxContextValue = { checked: () => CheckedState };

const [ItemIndicatorProvider, useItemIndicatorContext] = createMenuContext<CheckboxContextValue>(
  ITEM_INDICATOR_NAME,
  { checked: () => false },
);

type MenuItemIndicatorProps = PrimitivePropsWithRef<"span"> & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with CSS (see the Animation guide).
   */
  forceMount?: true | undefined;
};

const MenuItemIndicator: Component<ScopedProps<MenuItemIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "forceMount", "ref");
  const indicatorContext = useItemIndicatorContext(ITEM_INDICATOR_NAME, props.__scopeMenu);
  const checked = () => indicatorContext.checked();
  return (
    <Presence
      present={() => Boolean(props.forceMount || isIndeterminate(checked()) || checked() === true)}
    >
      <Primitive.span {...rest} ref={props.ref} data-state={getCheckedState(checked())} />
    </Presence>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuSeparator
 * -----------------------------------------------------------------------------------------------*/

type MenuSeparatorProps = PrimitivePropsWithRef<"div">;

const MenuSeparator: Component<ScopedProps<MenuSeparatorProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "ref");
  return <Primitive.div role="separator" aria-orientation="horizontal" {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenuArrow
 * -----------------------------------------------------------------------------------------------*/

type MenuArrowProps = PopperArrowProps;

const MenuArrow: Component<ScopedProps<MenuArrowProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "ref");
  const popperScope = usePopperScope(props.__scopeMenu);
  return <PopperArrow {...popperScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * MenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = "MenuSub";

type MenuSubContextValue = {
  contentId: string;
  triggerId: string;
  trigger: () => MenuSubTriggerElement | null;
  onTriggerChange(trigger: MenuSubTriggerElement | null): void;
};

const [MenuSubProvider, useMenuSubContext] = createMenuContext<MenuSubContextValue>(SUB_NAME);

type MenuSubProps = {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
};

const MenuSub: Component<ScopedProps<MenuSubProps>> = (props) => {
  const parentMenuContext = useMenuContext(SUB_NAME, props.__scopeMenu);
  const popperScope = usePopperScope(props.__scopeMenu);
  const [trigger, setTrigger] = createSignal<MenuSubTriggerElement | null>(null);
  const [content, setContent] = createSignal<MenuContentElement | null>(null);
  const handleOpenChange = useCallbackRef((open: boolean) => {
    callEventHandler(props.onOpenChange, open);
  });
  const open = () => props.open ?? false;
  // NOTE: ids are minted at setup, not inline in the JSX below. Nested JSX
  // re-evaluates on every children-getter read, which would mint new ids per
  // read and desynchronize `aria-controls` from the sub content's `id`.
  const subContentId = useId();
  const subTriggerId = useId();
  createEffect(
    () => parentMenuContext.open(),
    (parentOpen) => {
      if (parentOpen === false) handleOpenChange(false);
      return () => handleOpenChange(false);
    },
  );

  return (
    // TODO: remove the `Popper` indirection once `Sub` no longer needs its own scope
    // (mirrors Radix, which has kept it for the same reason).
    <Popper {...popperScope}>
      <MenuProvider
        scope={props.__scopeMenu}
        open={open}
        onOpenChange={handleOpenChange}
        content={content}
        onContentChange={setContent}
      >
        <MenuSubProvider
          scope={props.__scopeMenu}
          contentId={subContentId}
          triggerId={subTriggerId}
          trigger={trigger}
          onTriggerChange={setTrigger}
        >
          {props.children}
        </MenuSubProvider>
      </MenuProvider>
    </Popper>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = "MenuSubTrigger";

type MenuSubTriggerElement = MenuItemImplElement;
type MenuSubTriggerProps = MenuItemImplProps;

const MenuSubTrigger: Component<ScopedProps<MenuSubTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeMenu", "ref");
  const context = useMenuContext(SUB_TRIGGER_NAME, props.__scopeMenu);
  const rootContext = useMenuRootContext(SUB_TRIGGER_NAME, props.__scopeMenu);
  const subContext = useMenuSubContext(SUB_TRIGGER_NAME, props.__scopeMenu);
  const contentContext = useMenuContentContext(SUB_TRIGGER_NAME, props.__scopeMenu);
  let openTimer: number | null = null;
  const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext;
  const scope = { __scopeMenu: props.__scopeMenu };

  const clearOpenTimer = () => {
    if (openTimer) window.clearTimeout(openTimer);
    openTimer = null;
  };

  onCleanup(clearOpenTimer);
  onCleanup(() => {
    window.clearTimeout(pointerGraceTimerRef.current);
    onPointerGraceIntentChange(null);
  });

  const composedRefs = useComposedRefs(props.ref, subContext.onTriggerChange);

  return (
    <MenuAnchor asChild {...scope}>
      <MenuItemImpl
        {...scope}
        id={subContext.triggerId}
        aria-haspopup="menu"
        aria-expanded={ariaBoolean(context.open())}
        aria-controls={context.open() ? subContext.contentId : undefined}
        data-state={getOpenState(context.open())}
        {...rest}
        ref={composedRefs}
        // This is redundant for mouse users but we cannot determine pointer type from
        // click event and we cannot use pointerup event (see git history for reasons why)
        onClick={(event: MouseEvent) => {
          callEventHandler(props.onClick, event);
          if (props.disabled || event.defaultPrevented) return;
          /**
           * We manually focus because iOS Safari doesn't always focus on click (e.g. buttons)
           * and we rely heavily on `onFocusOutside` for submenus to close when switching
           * between separate submenus.
           */
          (event.currentTarget as HTMLElement).focus();
          if (!context.open()) context.onOpenChange(true);
        }}
        onPointerMove={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerMove, event),
          whenMouse((event) => {
            contentContext.onItemEnter(event);
            if (event.defaultPrevented) return;
            if (!props.disabled && !context.open() && !openTimer) {
              contentContext.onPointerGraceIntentChange(null);
              openTimer = window.setTimeout(() => {
                context.onOpenChange(true);
                clearOpenTimer();
              }, 100);
            }
          }),
        )}
        onPointerLeave={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerLeave, event),
          whenMouse((event) => {
            clearOpenTimer();

            const contentRect = context.content()?.getBoundingClientRect();
            if (contentRect) {
              // TODO: make sure to update this when we change positioning logic
              const side = context.content()?.dataset.side as Side;
              const rightSide = side === "right";
              const bleed = rightSide ? -5 : +5;
              const contentNearEdge = contentRect[rightSide ? "left" : "right"];
              const contentFarEdge = contentRect[rightSide ? "right" : "left"];

              contentContext.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: event.clientX + bleed, y: event.clientY },
                  { x: contentNearEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.bottom },
                  { x: contentNearEdge, y: contentRect.bottom },
                ],
                side,
              });

              window.clearTimeout(pointerGraceTimerRef.current);
              pointerGraceTimerRef.current = window.setTimeout(
                () => contentContext.onPointerGraceIntentChange(null),
                300,
              );
            } else {
              contentContext.onTriggerLeave(event);
              if (event.defaultPrevented) return;

              // There's 100ms where the user may leave an item before the submenu was opened.
              contentContext.onPointerGraceIntentChange(null);
            }
          }),
        )}
        onKeyDown={composeEventHandlers(
          (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
          (event) => {
            // Only react to keys originating from the trigger itself. Keys from
            // focusable descendants in the trigger's DOM subtree bubble here
            // natively and must not trigger submenu behavior.
            // See: https://github.com/radix-ui/primitives/issues/3232
            if (props.disabled || event.target !== event.currentTarget) {
              return;
            }

            const isTypingAhead = contentContext.searchRef.current !== "";
            if (isTypingAhead && event.key === " ") {
              return;
            }

            if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
              context.onOpenChange(true);
              // The trigger may hold focus if opened via pointer interaction
              // so we ensure content is given focus again when switching to keyboard.
              context.content()?.focus();
              // prevent window from scrolling
              event.preventDefault();
            }
          },
        )}
      />
    </MenuAnchor>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MenuSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = "MenuSubContent";

type MenuSubContentProps = Omit<
  MenuContentImplProps,
  keyof MenuContentImplPrivateProps | "onCloseAutoFocus" | "onEntryFocus" | "side" | "align"
> & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with CSS (see the Animation guide).
   */
  forceMount?: true | undefined;

  /**
   * Controls the direction the subcontent appears from its anchor menu item
   * Default: start
   */
  align?: Exclude<NonNullable<PopperContentProps["align"]>, "center"> | undefined;
};

const MenuSubContent: Component<ScopedProps<MenuSubContentProps>> = (props) => {
  const rest = omit(props, "forceMount", "align", "ref");
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeMenu);
  const forceMount = () => props.forceMount ?? portalContext.forceMount;
  const context = useMenuContext(CONTENT_NAME, props.__scopeMenu);
  const rootContext = useMenuRootContext(CONTENT_NAME, props.__scopeMenu);
  const subContext = useMenuSubContext(SUB_CONTENT_NAME, props.__scopeMenu);
  const ref: RefObject<MenuSubContentElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, ref);
  return (
    <Collection.Provider scope={props.__scopeMenu}>
      <Presence present={() => forceMount() || context.open()}>
        <Collection.Slot scope={props.__scopeMenu}>
          <MenuContentImpl
            id={subContext.contentId}
            aria-labelledby={subContext.triggerId}
            {...rest}
            ref={composedRefs}
            align={props.align ?? "start"}
            side={rootContext.dir === "rtl" ? "left" : "right"}
            disableOutsidePointerEvents={false}
            disableOutsideScroll={false}
            trapFocus={false}
            onOpenAutoFocus={(event) => {
              // when opening a submenu, focus content for keyboard users only
              if (rootContext.isUsingKeyboardRef.current) ref.current?.focus();
              event.preventDefault();
            }}
            // The menu might close because of focusing another menu item in the parent menu. We
            // don't want it to refocus the trigger in that case so we handle trigger focus ourselves.
            onCloseAutoFocus={(event) => event.preventDefault()}
            onFocusOutside={composeEventHandlers(
              (event) => callEventHandler(rest.onFocusOutside, event),
              (event) => {
                // We prevent closing when the trigger is focused to avoid triggering a re-open animation
                // on pointer interaction.
                if (event.target !== subContext.trigger()) context.onOpenChange(false);
              },
            )}
            onEscapeKeyDown={composeEventHandlers(
              (event) => callEventHandler(rest.onEscapeKeyDown, event),
              (event) => {
                rootContext.onClose();
                // ensure pressing escape in submenu doesn't escape full screen mode
                event.preventDefault();
              },
            )}
            onKeyDown={composeEventHandlers(
              (event: KeyboardEvent) => callEventHandler(rest.onKeyDown, event),
              (event) => {
                // Submenu key events bubble through portals. We only care about keys in this menu.
                const isKeyDownInside = (event.currentTarget as HTMLElement).contains(
                  event.target as HTMLElement,
                );
                const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key);
                if (isKeyDownInside && isCloseKey) {
                  context.onOpenChange(false);
                  // We focus manually because we prevented it in `onCloseAutoFocus`
                  subContext.trigger()?.focus();
                  // prevent window from scrolling
                  event.preventDefault();
                }
              },
            )}
          />
        </Collection.Slot>
      </Presence>
    </Collection.Provider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

const ITEM_SELECT = "menu.itemSelect";

type MenuSubContentElement = MenuContentImplElement;

function getOpenState(open: boolean) {
  return open ? "open" : "closed";
}

function isIndeterminate(checked?: CheckedState): checked is "indeterminate" {
  return checked === "indeterminate";
}

function getCheckedState(checked: CheckedState) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}

function getAriaChecked(checked: CheckedState) {
  return isIndeterminate(checked) ? ("mixed" as const) : ariaBoolean(checked);
}

type CollectionItem = { ref: RefObject<HTMLElement | null>; textValue: string };

function getItemTextValue(item: CollectionItem): string {
  // An explicit `textValue` prop wins; otherwise fall back to the live DOM
  // text. (Solid props freeze at setup, so the registered value can't pick
  // up the post-mount `.textContent` sync the way Radix's re-render does.)
  return item.textValue || (item.ref.current?.textContent ?? "").trim();
}

function focusFirst(candidates: HTMLElement[]) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    // if focus is already where we want to go, we don't want to keep going through the candidates
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!);
}

/**
 * This is the "meat" of the typeahead matching logic. It takes in all the values,
 * the search and the current match, and returns the next match (or `undefined`).
 *
 * We normalize the search because if a user has repeatedly pressed a character,
 * we want the exact same behavior as if we only had that one character
 * (ie. cycle through options starting with that character)
 *
 * We also reorder the values by wrapping the array around the current match.
 * This is so we always look forward from the current match, and picking the first
 * match will always be the correct one.
 *
 * Finally, if the normalized search is exactly one character, we exclude the
 * current match from the values because otherwise it would be the first to match always
 * and focus would never move. This is as opposed to the regular case, where we
 * don't want focus to move if the current match still matches.
 */
function getNextMatch(values: string[], search: string, currentMatch?: string) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0]! : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) =>
    value.toLowerCase().startsWith(normalizedSearch.toLowerCase()),
  );
  return nextMatch !== currentMatch ? nextMatch : undefined;
}

type Point = { x: number; y: number };
type Polygon = Point[];
type Side = "left" | "right";
type GraceIntent = { area: Polygon; side: Side };

// Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i]!;
    const jj = polygon[j]!;
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;

    // oxfmt-ignore
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function isPointerInGraceArea(event: PointerEvent, area?: Polygon) {
  if (!area) return false;
  const cursorPos = { x: event.clientX, y: event.clientY };
  return isPointInPolygon(cursorPos, area);
}

function whenMouse<E extends PointerEvent>(handler: (event: E) => void): (event: E) => void {
  return (event) => (event.pointerType === "mouse" ? handler(event) : undefined);
}

export {
  createMenuScope,
  //
  Menu,
  MenuAnchor,
  MenuPortal,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  MenuSeparator,
  MenuArrow,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  //
  Menu as Root,
  MenuAnchor as Anchor,
  MenuPortal as Portal,
  MenuContent as Content,
  MenuGroup as Group,
  MenuLabel as Label,
  MenuItem as Item,
  MenuCheckboxItem as CheckboxItem,
  MenuRadioGroup as RadioGroup,
  MenuRadioItem as RadioItem,
  MenuItemIndicator as ItemIndicator,
  MenuSeparator as Separator,
  MenuArrow as Arrow,
  MenuSub as Sub,
  MenuSubTrigger as SubTrigger,
  MenuSubContent as SubContent,
};
export type {
  MenuProps,
  MenuAnchorProps,
  MenuPortalProps,
  MenuContentProps,
  MenuGroupProps,
  MenuLabelProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuItemIndicatorProps,
  MenuSeparatorProps,
  MenuArrowProps,
  MenuSubProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
};
