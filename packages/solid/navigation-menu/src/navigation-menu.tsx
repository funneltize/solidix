import { createCollection } from "@solidix/collection";
import { useComposedRefs, type Ref, type RefObject } from "@solidix/compose-refs";
import { createContextScope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import { DismissableLayer } from "@solidix/dismissable-layer";
import { useId } from "@solidix/id";
import { Presence } from "@solidix/presence";
import {
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  dispatchDiscreteCustomEvent,
  getOpenState,
  Primitive,
} from "@solidix/primitive";
import { createSlottable } from "@solidix/slot";
import { useCallbackRef } from "@solidix/use-callback-ref";
import { useControllableState } from "@solidix/use-controllable-state";
import { useLayoutEffect } from "@solidix/use-layout-effect";
import { usePrevious } from "@solidix/use-previous";
import * as VisuallyHiddenPrimitive from "@solidix/visually-hidden";
import { Portal as SolidPortal } from "@solidjs/web";
import {
  children,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
  type Component,
} from "solid-js";
import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";

import type { Scope } from "@solidix/context";
import type { DismissableLayerProps } from "@solidix/dismissable-layer";
import type { PrimitivePropsWithRef } from "@solidix/primitive";

const ActivationMode = {
  Automatic: "automatic",
  Manual: "manual",
} as const;

const Orientation = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type Orientation = (typeof Orientation)[keyof typeof Orientation];
type Direction = (typeof Direction)[keyof typeof Direction];
type ActivationMode = (typeof ActivationMode)[keyof typeof ActivationMode];

/** Solid native-event equivalents of the handler event types, for composing
 * optional consumer handlers (which may also be `[handler, data]` tuples). */
type ButtonEvent<E extends Event> = E & { currentTarget: HTMLButtonElement; target: Element };
type DivEvent<E extends Event> = E & { currentTarget: HTMLDivElement; target: Element };
type AnchorEvent<E extends Event> = E & { currentTarget: HTMLAnchorElement; target: Element };

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu
 * -----------------------------------------------------------------------------------------------*/

const NAVIGATION_MENU_NAME = "NavigationMenu";

const [Collection, useCollection, createCollectionScope] = createCollection<
  NavigationMenuTriggerElement,
  { value: string }
>(NAVIGATION_MENU_NAME);

const [FocusGroupCollection, useFocusGroupCollection, createFocusGroupCollectionScope] =
  createCollection<FocusGroupItemElement, {}>(NAVIGATION_MENU_NAME);

type ScopedProps<P> = P & { __scopeNavigationMenu?: Scope | undefined };
/** Creates the context and scope factories shared by the navigation-menu parts. */
const [createNavigationMenuContext, createNavigationMenuScope] = createContextScope(
  NAVIGATION_MENU_NAME,
  [createCollectionScope, createFocusGroupCollectionScope],
);

type ContentData = {
  ref?: Ref<ViewportContentMounterElement> | undefined;
} & ViewportContentMounterProps;

interface NavigationMenuContextValue {
  isRootMenu: boolean;
  value: () => string;
  previousValue: () => string;
  baseId: string;
  dir: Direction;
  orientation: Orientation;
  activationMode: ActivationMode;
  rootNavigationMenu: () => NavigationMenuElement | null;
  indicatorTrack: () => HTMLDivElement | null;
  onIndicatorTrackChange(indicatorTrack: HTMLDivElement | null): void;
  viewport: () => NavigationMenuViewportElement | null;
  onViewportChange(viewport: NavigationMenuViewportElement | null): void;
  onViewportContentChange(contentValue: string, contentData: ContentData): void;
  onViewportContentRemove(contentValue: string): void;
  onTriggerEnter(itemValue: string): void;
  onTriggerLeave(): void;
  onContentEnter(): void;
  onContentLeave(): void;
  onItemSelect(itemValue: string): void;
  onItemDismiss(): void;
}

const [NavigationMenuProviderImpl, useNavigationMenuContext] =
  createNavigationMenuContext<NavigationMenuContextValue>(NAVIGATION_MENU_NAME);

const [ViewportContentProvider, useViewportContentContext] = createNavigationMenuContext<{
  items: () => Map<string, ContentData>;
}>(NAVIGATION_MENU_NAME);

type NavigationMenuElement = HTMLElement;
type PrimitiveNavProps = PrimitivePropsWithRef<"nav">;
/** Props for the navigation-menu root, owning value, timing, orientation, and direction. */
export interface NavigationMenuProps
  extends
    Omit<NavigationMenuProviderProps, keyof NavigationMenuProviderPrivateProps>,
    PrimitiveNavProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
  dir?: Direction | undefined;
  orientation?: Orientation | undefined;
  /**
   * The duration from when the pointer enters the trigger until the tooltip
   * gets opened. When `activationMode` is `manual`, this prop is ignored.
   *
   * @default 200
   */
  delayDuration?: number | undefined;
  /**
   * How much time a user has to enter another trigger without incurring a delay
   * again. When `activationMode` is `manual`, this prop is ignored.
   *
   * @default 300
   */
  skipDelayDuration?: number | undefined;
  /**
   * Whether an item is activated automatically or manually.
   * - `"automatic"`: hovering or focusing a trigger opens its item, and moving
   *   away closes it after a short delay.
   * - `"manual"`: clicking a trigger toggles the item; hover and focus are ignored
   *
   * @default "automatic"
   */
  activationMode?: ActivationMode | undefined;
}

/** Root nav element owning menu value, timing, orientation, and direction state. */
const NavigationMenu: Component<ScopedProps<NavigationMenuProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeNavigationMenu",
    "value",
    "onValueChange",
    "defaultValue",
    "delayDuration",
    "skipDelayDuration",
    "orientation",
    "dir",
    "activationMode",
    "ref",
  );
  const delayDuration = () => props.delayDuration ?? 200;
  const skipDelayDuration = () => props.skipDelayDuration ?? 300;
  const orientation = props.orientation ?? Orientation.Horizontal;
  const activationMode = props.activationMode ?? ActivationMode.Automatic;
  const [navigationMenu, setNavigationMenu] = createSignal<NavigationMenuElement | null>(null);
  const composedRef = useComposedRefs(props.ref, setNavigationMenu);
  const direction = useDirection(props.dir);
  const openTimerRef = { current: 0 };
  const closeTimerRef = { current: 0 };
  const skipDelayTimerRef = { current: 0 };
  const [isOpenDelayed, setIsOpenDelayed] = createSignal(true);
  const [value, setValue] = useControllableState({
    prop: () => props.value,
    onChange: (next) => {
      const isOpen = next !== "";
      const hasSkipDelayDuration = skipDelayDuration() > 0;

      if (isOpen) {
        window.clearTimeout(skipDelayTimerRef.current);
        if (hasSkipDelayDuration) setIsOpenDelayed(false);
      } else {
        window.clearTimeout(skipDelayTimerRef.current);
        skipDelayTimerRef.current = window.setTimeout(
          () => setIsOpenDelayed(true),
          skipDelayDuration(),
        );
      }

      (props.onValueChange as ((value: string) => void) | undefined)?.(next);
    },
    defaultProp: props.defaultValue ?? "",
    caller: NAVIGATION_MENU_NAME,
  });

  const startCloseTimer = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setValue(""), 150);
  };

  const handleOpen = (itemValue: string) => {
    window.clearTimeout(closeTimerRef.current);
    setValue(itemValue);
  };

  const handleDelayedOpen = (itemValue: string) => {
    const isOpenItem = value() === itemValue;
    if (isOpenItem) {
      // If the item is already open (e.g. we're transitioning from the content to the trigger)
      // then we want to clear the close timer immediately.
      window.clearTimeout(closeTimerRef.current);
    } else {
      openTimerRef.current = window.setTimeout(() => {
        window.clearTimeout(closeTimerRef.current);
        setValue(itemValue);
      }, delayDuration());
    }
  };

  onCleanup(() => {
    window.clearTimeout(openTimerRef.current);
    window.clearTimeout(closeTimerRef.current);
    window.clearTimeout(skipDelayTimerRef.current);
  });

  return (
    <NavigationMenuProvider
      scope={props.__scopeNavigationMenu}
      isRootMenu={true}
      value={value}
      dir={direction}
      orientation={orientation}
      activationMode={activationMode}
      rootNavigationMenu={navigationMenu}
      onTriggerEnter={(itemValue) => {
        if (activationMode === ActivationMode.Automatic) {
          window.clearTimeout(openTimerRef.current);
          if (isOpenDelayed()) {
            handleDelayedOpen(itemValue);
          } else {
            handleOpen(itemValue);
          }
        }
      }}
      onTriggerLeave={() => {
        if (activationMode === ActivationMode.Automatic) {
          window.clearTimeout(openTimerRef.current);
          startCloseTimer();
        }
      }}
      onContentEnter={() => {
        if (activationMode === ActivationMode.Automatic) {
          window.clearTimeout(closeTimerRef.current);
        }
      }}
      onContentLeave={() => {
        if (activationMode === ActivationMode.Automatic) {
          startCloseTimer();
        }
      }}
      onItemSelect={(itemValue) => {
        setValue((prevValue) => (prevValue === itemValue ? "" : itemValue));
      }}
      onItemDismiss={() => setValue("")}
    >
      <Primitive.nav
        aria-label="Main"
        data-orientation={orientation}
        dir={direction}
        {...rest}
        ref={composedRef}
      />
    </NavigationMenuProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = "NavigationMenuSub";

/** Shared div props for navigation-menu parts. `style` is object-only: parts merge their own
 * base styles into it, which string styles cannot participate in. */
type PrimitiveDivProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};
/** Props for the submenu root, providing an independent menu value and orientation context. */
export interface NavigationMenuSubProps
  extends
    Omit<NavigationMenuProviderProps, keyof NavigationMenuProviderPrivateProps>,
    PrimitiveDivProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
  orientation?: Orientation | undefined;
  /**
   * Whether an item is activated automatically or manually.
   * - `"automatic"`: hovering or focusing a trigger opens its item, and moving
   *   away closes it after a short delay.
   * - `"manual"`: clicking a trigger toggles the item; hover and focus are
   *   ignored
   *
   * The default value is inherited from the parent Navigation Menu root
   * component. If no value is provided to the parent, the default value is
   * `"automatic"`.
   */
  activationMode?: ActivationMode | undefined;
  /**
   * When true, clicking a sub-menu item's trigger once it's active will not deactivate it.
   *
   * @default true
   */
  disableToggle?: boolean | undefined;
}

/** Submenu root providing an independent menu value, orientation, and activation context. */
const NavigationMenuSub: Component<ScopedProps<NavigationMenuSubProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeNavigationMenu",
    "value",
    "onValueChange",
    "defaultValue",
    "orientation",
    "activationMode",
    "disableToggle",
    "ref",
  );
  const context = useNavigationMenuContext(SUB_NAME, props.__scopeNavigationMenu);
  const orientation = props.orientation ?? Orientation.Horizontal;
  const activationMode = props.activationMode ?? context.activationMode;
  const disableToggle = () => props.disableToggle ?? true;
  const [value, setValue] = useControllableState({
    prop: () => props.value,
    onChange: (next) => (props.onValueChange as ((value: string) => void) | undefined)?.(next),
    defaultProp: props.defaultValue ?? "",
    caller: SUB_NAME,
  });

  return (
    <NavigationMenuProvider
      scope={props.__scopeNavigationMenu}
      isRootMenu={false}
      value={value}
      dir={context.dir}
      orientation={orientation}
      activationMode={activationMode}
      rootNavigationMenu={context.rootNavigationMenu}
      onTriggerEnter={(itemValue) => {
        if (activationMode === ActivationMode.Automatic) {
          setValue(itemValue);
        }
      }}
      onItemSelect={(itemValue) => {
        setValue((prevValue) => (disableToggle() || prevValue !== itemValue ? itemValue : ""));
      }}
      onItemDismiss={() => setValue("")}
    >
      <Primitive.div data-orientation={orientation} {...rest} ref={props.ref} />
    </NavigationMenuProvider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

interface NavigationMenuProviderPrivateProps {
  isRootMenu: boolean;
  scope: Scope;
  children: JSX.Element;
  orientation: Orientation;
  dir: Direction;
  activationMode: ActivationMode;
  // Passed as getters: values change over time and Solid props freeze at setup.
  rootNavigationMenu: () => NavigationMenuElement | null;
  value: () => string;
  onTriggerEnter(itemValue: string): void;
  onTriggerLeave?: (() => void) | undefined;
  onContentEnter?: (() => void) | undefined;
  onContentLeave?: (() => void) | undefined;
  onItemSelect(itemValue: string): void;
  onItemDismiss(): void;
}

type NavigationMenuProviderProps = NavigationMenuProviderPrivateProps;

const NavigationMenuProvider: Component<NavigationMenuProviderProps> = (props) => {
  const [viewport, setViewport] = createSignal<NavigationMenuViewportElement | null>(null);
  const [viewportContent, setViewportContent] = createSignal<Map<string, ContentData>>(new Map());
  const [indicatorTrack, setIndicatorTrack] = createSignal<HTMLDivElement | null>(null);
  const previousValue = usePrevious(props.value);
  const baseId = useId();
  const onTriggerEnter = useCallbackRef((itemValue: string) => props.onTriggerEnter(itemValue));
  const onTriggerLeave = useCallbackRef(() => props.onTriggerLeave?.());
  const onContentEnter = useCallbackRef(() => props.onContentEnter?.());
  const onContentLeave = useCallbackRef(() => props.onContentLeave?.());
  const onItemSelect = useCallbackRef((itemValue: string) => props.onItemSelect(itemValue));
  const onItemDismiss = useCallbackRef(() => props.onItemDismiss());

  const handleViewportContentChange = (contentValue: string, contentData: ContentData) => {
    setViewportContent((prevContent) => {
      prevContent.set(contentValue, contentData);
      return new Map(prevContent);
    });
  };
  const handleViewportContentRemove = (contentValue: string) => {
    setViewportContent((prevContent) => {
      if (!prevContent.has(contentValue)) return prevContent;
      prevContent.delete(contentValue);
      return new Map(prevContent);
    });
  };

  return (
    <NavigationMenuProviderImpl
      scope={props.scope}
      isRootMenu={props.isRootMenu}
      rootNavigationMenu={props.rootNavigationMenu}
      value={props.value}
      previousValue={previousValue}
      baseId={baseId}
      dir={props.dir}
      orientation={props.orientation}
      activationMode={props.activationMode}
      viewport={viewport}
      onViewportChange={setViewport}
      indicatorTrack={indicatorTrack}
      onIndicatorTrackChange={setIndicatorTrack}
      onTriggerEnter={onTriggerEnter}
      onTriggerLeave={onTriggerLeave}
      onContentEnter={onContentEnter}
      onContentLeave={onContentLeave}
      onItemSelect={onItemSelect}
      onItemDismiss={onItemDismiss}
      onViewportContentChange={handleViewportContentChange}
      onViewportContentRemove={handleViewportContentRemove}
    >
      <Collection.Provider scope={props.scope}>
        <ViewportContentProvider scope={props.scope} items={viewportContent}>
          {props.children}
        </ViewportContentProvider>
      </Collection.Provider>
    </NavigationMenuProviderImpl>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuList
 * -----------------------------------------------------------------------------------------------*/

const LIST_NAME = "NavigationMenuList";

type PrimitiveUnorderedListProps = PrimitivePropsWithRef<"ul">;
/** Props for the list element holding the menu items. */
export type NavigationMenuListProps = PrimitiveUnorderedListProps;

/** List element holding the menu items, roving-tabindex managed at the root. */
const NavigationMenuList: Component<ScopedProps<NavigationMenuListProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "ref");
  const context = useNavigationMenuContext(LIST_NAME, props.__scopeNavigationMenu);

  return (
    <Primitive.div style={{ position: "relative" }} ref={context.onIndicatorTrackChange}>
      <Collection.Slot scope={props.__scopeNavigationMenu}>
        {context.isRootMenu ? (
          <FocusGroup asChild>
            <Primitive.ul data-orientation={context.orientation} {...rest} ref={props.ref} />
          </FocusGroup>
        ) : (
          <Primitive.ul data-orientation={context.orientation} {...rest} ref={props.ref} />
        )}
      </Collection.Slot>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "NavigationMenuItem";

type FocusProxyElement = HTMLSpanElement;

type NavigationMenuItemContextValue = {
  value: string;
  triggerRef: RefObject<NavigationMenuTriggerElement | null>;
  contentRef: RefObject<NavigationMenuContentElement | null>;
  focusProxyRef: RefObject<FocusProxyElement | null>;
  wasEscapeCloseRef: { current: boolean };
  onEntryKeyDown(): void;
  onFocusProxyEnter(side: "start" | "end"): void;
  onRootContentClose(): void;
  onContentFocusOutside(): void;
};

const [NavigationMenuItemContextProvider, useNavigationMenuItemContext] =
  createNavigationMenuContext<NavigationMenuItemContextValue>(ITEM_NAME);

type PrimitiveListItemProps = PrimitivePropsWithRef<"li">;
/** Props for the item wrapper exposing its value and trigger/content refs. */
export interface NavigationMenuItemProps extends PrimitiveListItemProps {
  value?: string | undefined;
}

/** Item wrapper providing its value and trigger/content refs to the menu machinery. */
const NavigationMenuItem: Component<ScopedProps<NavigationMenuItemProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "value", "ref");
  const autoValue = useId();
  // We need to provide an initial deterministic value as `useId` will return
  // empty string on the first render and we don't want to match our internal "closed" value.
  const value = props.value || autoValue || "LEGACY_REACT_AUTO_VALUE";
  const contentRef: RefObject<NavigationMenuContentElement | null> = { current: null };
  const triggerRef: RefObject<NavigationMenuTriggerElement | null> = { current: null };
  const focusProxyRef: RefObject<FocusProxyElement | null> = { current: null };
  const restoreContentTabOrderRef: { current: () => void } = { current: () => {} };
  const wasEscapeCloseRef = { current: false };

  const handleContentEntry = (side: "start" | "end" = "start") => {
    if (contentRef.current) {
      restoreContentTabOrderRef.current();
      const candidates = getTabbableCandidates(contentRef.current);
      if (candidates.length) focusFirst(side === "start" ? candidates : candidates.reverse());
    }
  };

  const handleContentExit = () => {
    if (contentRef.current) {
      const candidates = getTabbableCandidates(contentRef.current);
      if (candidates.length) restoreContentTabOrderRef.current = removeFromTabOrder(candidates);
    }
  };

  return (
    <NavigationMenuItemContextProvider
      scope={props.__scopeNavigationMenu}
      value={value}
      triggerRef={triggerRef}
      contentRef={contentRef}
      focusProxyRef={focusProxyRef}
      wasEscapeCloseRef={wasEscapeCloseRef}
      onEntryKeyDown={handleContentEntry}
      onFocusProxyEnter={handleContentEntry}
      onRootContentClose={handleContentExit}
      onContentFocusOutside={handleContentExit}
    >
      <Primitive.li {...rest} ref={props.ref} />
    </NavigationMenuItemContextProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "NavigationMenuTrigger";

type NavigationMenuTriggerElement = HTMLButtonElement;
type PrimitiveButtonProps = PrimitivePropsWithRef<"button">;
/** Props for the trigger button opening, closing, and announcing its content panel. */
export type NavigationMenuTriggerProps = PrimitiveButtonProps;

/** Button opening, closing, and announcing its item's content panel. */
const NavigationMenuTrigger: Component<ScopedProps<NavigationMenuTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "disabled", "ref");
  const context = useNavigationMenuContext(TRIGGER_NAME, props.__scopeNavigationMenu);
  const itemContext = useNavigationMenuItemContext(TRIGGER_NAME, props.__scopeNavigationMenu);
  const ref: RefObject<NavigationMenuTriggerElement | null> = { current: null };
  const composedRefs = useComposedRefs(ref, itemContext.triggerRef, props.ref);
  const triggerId = makeTriggerId(context.baseId, itemContext.value);
  const contentId = makeContentId(context.baseId, itemContext.value);
  const hasPointerMoveOpenedRef = { current: false };
  const wasClickCloseRef = { current: false };
  const open = () => itemContext.value === context.value();

  return (
    <>
      <Collection.ItemSlot scope={props.__scopeNavigationMenu} value={itemContext.value}>
        <FocusGroupItem asChild>
          <Primitive.button
            id={triggerId}
            disabled={props.disabled}
            data-disabled={props.disabled ? "" : undefined}
            data-state={getOpenState(open())}
            aria-expanded={ariaBoolean(open())}
            aria-controls={open() ? contentId : undefined}
            {...rest}
            ref={composedRefs}
            onPointerEnter={composeEventHandlers(
              (event: ButtonEvent<PointerEvent>) => callEventHandler(rest.onPointerEnter, event),
              () => {
                wasClickCloseRef.current = false;
                itemContext.wasEscapeCloseRef.current = false;
              },
            )}
            onPointerMove={composeEventHandlers(
              (event: ButtonEvent<PointerEvent>) => callEventHandler(rest.onPointerMove, event),
              whenMouse(() => {
                if (
                  props.disabled ||
                  wasClickCloseRef.current ||
                  itemContext.wasEscapeCloseRef.current ||
                  hasPointerMoveOpenedRef.current
                )
                  return;
                context.onTriggerEnter(itemContext.value);
                hasPointerMoveOpenedRef.current = true;
              }),
            )}
            onPointerLeave={composeEventHandlers(
              (event: ButtonEvent<PointerEvent>) => callEventHandler(rest.onPointerLeave, event),
              whenMouse(() => {
                if (props.disabled) return;
                context.onTriggerLeave();
                hasPointerMoveOpenedRef.current = false;
              }),
            )}
            onClick={composeEventHandlers(
              (event: ButtonEvent<MouseEvent>) => callEventHandler(rest.onClick, event),
              () => {
                context.onItemSelect(itemContext.value);
                wasClickCloseRef.current = open();
              },
            )}
            onKeyDown={composeEventHandlers(
              (event: ButtonEvent<KeyboardEvent>) => callEventHandler(rest.onKeyDown, event),
              (event) => {
                const verticalEntryKey = context.dir === Direction.RTL ? "ArrowLeft" : "ArrowRight";
                const entryKey = { horizontal: "ArrowDown", vertical: verticalEntryKey }[
                  context.orientation
                ];
                if (open() && event.key === entryKey) {
                  itemContext.onEntryKeyDown();
                  // Prevent FocusGroupItem from handling the event
                  event.preventDefault();
                }
              },
            )}
          />
        </FocusGroupItem>
      </Collection.ItemSlot>

      {/* Proxy tab order between trigger and content */}
      <Show when={open()}>
        <VisuallyHiddenPrimitive.Root
          aria-hidden="true"
          tabindex={0}
          ref={itemContext.focusProxyRef}
          onFocus={(event) => {
            const content = itemContext.contentRef.current;
            const prevFocusedElement = event.relatedTarget as HTMLElement | null;
            const wasTriggerFocused = prevFocusedElement === ref.current;
            const wasFocusFromContent = content?.contains(prevFocusedElement);

            if (wasTriggerFocused || !wasFocusFromContent) {
              itemContext.onFocusProxyEnter(wasTriggerFocused ? "start" : "end");
            }
          }}
        />

        {/* Restructure a11y tree to make content accessible to screen reader when using the viewport */}
        <Show when={context.viewport()}>
          <span aria-owns={contentId} />
        </Show>
      </Show>
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuLink
 * -----------------------------------------------------------------------------------------------*/

const LINK_SELECT = "navigationMenu.linkSelect";

type PrimitiveLinkProps = PrimitivePropsWithRef<"a">;
/** Props for the link dispatching select and closing root content on activation. */
export interface NavigationMenuLinkProps extends Omit<PrimitiveLinkProps, "onSelect"> {
  active?: boolean | undefined;
  onSelect?: { bivarianceHack(event: Event): void }["bivarianceHack"] | undefined;
}

/** Link dispatching a select event and closing root content on activation. */
const NavigationMenuLink: Component<ScopedProps<NavigationMenuLinkProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "active", "onSelect", "ref");

  return (
    <FocusGroupItem asChild>
      <Primitive.a
        data-active={props.active ? "" : undefined}
        aria-current={props.active ? "page" : undefined}
        {...rest}
        ref={props.ref}
        onClick={composeEventHandlers(
          (event: AnchorEvent<MouseEvent>) => callEventHandler(rest.onClick, event),
          (event) => {
            const target = event.target as HTMLElement;
            const linkSelectEvent = new CustomEvent(LINK_SELECT, {
              bubbles: true,
              cancelable: true,
            });
            target.addEventListener(
              LINK_SELECT,
              (event) => (props.onSelect as ((event: Event) => void) | undefined)?.(event),
              { once: true },
            );
            dispatchDiscreteCustomEvent(target, linkSelectEvent);

            if (!linkSelectEvent.defaultPrevented && !event.metaKey) {
              const rootContentDismissEvent = new CustomEvent(ROOT_CONTENT_DISMISS, {
                bubbles: true,
                cancelable: true,
              });
              dispatchDiscreteCustomEvent(target, rootContentDismissEvent);
            }
          },
          { checkForDefaultPrevented: false },
        )}
      />
    </FocusGroupItem>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = "NavigationMenuIndicator";

/** Props for the indicator tracking the active trigger position. */
export interface NavigationMenuIndicatorProps extends NavigationMenuIndicatorImplProps {
  forceMount?: true | undefined;
}

/** Indicator tracking the active trigger position, positioned by live size reads. */
const NavigationMenuIndicator: Component<ScopedProps<NavigationMenuIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "forceMount", "ref");
  const context = useNavigationMenuContext(INDICATOR_NAME, props.__scopeNavigationMenu);
  const isVisible = () => Boolean(context.value());

  return (
    <Show when={context.indicatorTrack()} keyed>
      {(track) => (
        <SolidPortal mount={track}>
          <Presence present={props.forceMount || isVisible()}>
            <NavigationMenuIndicatorImpl
              __scopeNavigationMenu={props.__scopeNavigationMenu}
              {...rest}
              ref={props.ref}
            />
          </Presence>
        </SolidPortal>
      )}
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

/** Props for the indicator implementation rendering the positioned element. */
export type NavigationMenuIndicatorImplProps = PrimitiveDivProps;

const NavigationMenuIndicatorImpl: Component<ScopedProps<NavigationMenuIndicatorImplProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeNavigationMenu", "ref", "style");
  const context = useNavigationMenuContext(INDICATOR_NAME, props.__scopeNavigationMenu);
  const [activeTrigger, setActiveTrigger] = createSignal<NavigationMenuTriggerElement | null>(null);
  const [position, setPosition] = createSignal<{ size: number; offset: number } | null>(null);
  const isHorizontal = () => context.orientation === Orientation.Horizontal;
  const isVisible = () => Boolean(context.value());
  const getItems = useCollection(props.__scopeNavigationMenu);

  const handlePositionChange = () => {
    const triggerNode = activeTrigger();
    if (triggerNode) {
      setPosition({
        size: isHorizontal() ? triggerNode.offsetWidth : triggerNode.offsetHeight,
        offset: isHorizontal() ? triggerNode.offsetLeft : triggerNode.offsetTop,
      });
    }
  };

  createEffect(
    () => context.value(),
    () => {
      const items = getItems();
      const triggerNode = items.find((item) => item.value === context.value())?.ref.current;
      if (triggerNode) setActiveTrigger(triggerNode);
    },
  );

  useResizeObserver(activeTrigger, handlePositionChange);
  useResizeObserver(context.indicatorTrack, handlePositionChange);

  return (
    <Show when={position()}>
      {(pos) => (
        <Primitive.div
          aria-hidden="true"
          data-state={isVisible() ? "visible" : "hidden"}
          data-orientation={context.orientation}
          {...rest}
          ref={props.ref}
          style={{
            position: "absolute",
            ...(isHorizontal()
              ? {
                  left: 0,
                  width: `${pos().size}px`,
                  transform: `translateX(${pos().offset}px)`,
                  "--radix-navigation-menu-indicator-translate-x": `${pos().offset}px`,
                }
              : {
                  top: 0,
                  height: `${pos().size}px`,
                  transform: `translateY(${pos().offset}px)`,
                  "--radix-navigation-menu-indicator-translate-y": `${pos().offset}px`,
                }),
            ...props.style,
          }}
        />
      )}
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "NavigationMenuContent";

type NavigationMenuContentElement = HTMLDivElement;
/** Props for the content panel of an item. */
export interface NavigationMenuContentProps extends Omit<
  NavigationMenuContentImplProps,
  keyof NavigationMenuContentImplPrivateProps | "style"
> {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
  /** Object-only (parts merge base styles into it). */
  style?: JSX.CSSProperties | undefined;
}

/** Content panel for its item, focus-guarded and portal-addressed when in a viewport. */
const NavigationMenuContent: Component<ScopedProps<NavigationMenuContentProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "forceMount", "ref", "style");
  const context = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu);
  const itemContext = useNavigationMenuItemContext(CONTENT_NAME, props.__scopeNavigationMenu);
  const composedRefs = useComposedRefs(itemContext.contentRef, props.ref);
  const open = () => itemContext.value === context.value();
  const openState = () => getOpenState(open());
  const commonProps = {
    value: itemContext.value,
    triggerRef: itemContext.triggerRef,
    focusProxyRef: itemContext.focusProxyRef,
    wasEscapeCloseRef: itemContext.wasEscapeCloseRef,
    onContentFocusOutside: itemContext.onContentFocusOutside,
    onRootContentClose: itemContext.onRootContentClose,
    ...rest,
  };

  return (
    <Show
      when={context.viewport()}
      fallback={
        <Presence present={props.forceMount || open()}>
          <NavigationMenuContentImpl
            __scopeNavigationMenu={props.__scopeNavigationMenu}
            data-state={openState()}
            {...commonProps}
            ref={composedRefs}
            onPointerEnter={composeEventHandlers(
              (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerEnter, event),
              context.onContentEnter,
            )}
            onPointerLeave={composeEventHandlers(
              (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerLeave, event),
              whenMouse(context.onContentLeave),
            )}
            style={{
              // Prevent interaction when animating out
              "pointer-events": !open() && context.isRootMenu ? "none" : undefined,
              ...props.style,
            }}
          />
        </Presence>
      }
    >
      <ViewportContentMounter
        __scopeNavigationMenu={props.__scopeNavigationMenu}
        data-state={openState()}
        forceMount={props.forceMount}
        {...commonProps}
        ref={composedRefs}
      />
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type ViewportContentMounterElement = NavigationMenuContentImplElement;
/** Props for the internal mounter rendering item content inside the viewport. */
export interface ViewportContentMounterProps extends NavigationMenuContentImplProps {
  forceMount?: boolean | undefined;
}

const ViewportContentMounter: Component<ScopedProps<ViewportContentMounterProps>> = (props) => {
  const context = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu);

  // Props never change identity in Solid, so register once - matching the
  // net effect of Radix's layout effect, which re-registers every render.
  // (`data-state` is recomputed reactively downstream in
  // `NavigationMenuViewportItem` instead.)
  useLayoutEffect(() => {
    context.onViewportContentChange(props.value, {
      ref: props.ref,
      ...props,
    });
  });

  useLayoutEffect(() => {
    return () => context.onViewportContentRemove(props.value);
  });

  // Content is proxied into the viewport
  return null;
};

/* -----------------------------------------------------------------------------------------------*/

const ROOT_CONTENT_DISMISS = "navigationMenu.rootContentDismiss";

type MotionAttribute = "to-start" | "to-end" | "from-start" | "from-end";
type NavigationMenuContentImplElement = HTMLDivElement;

interface NavigationMenuContentImplPrivateProps {
  value: string;
  triggerRef: RefObject<NavigationMenuTriggerElement | null>;
  focusProxyRef: RefObject<FocusProxyElement | null>;
  wasEscapeCloseRef: { current: boolean };
  onContentFocusOutside(): void;
  onRootContentClose(): void;
}
/** Props for the content implementation, focus-guarded and portal-addressed in viewports. */
export interface NavigationMenuContentImplProps
  extends
    Omit<DismissableLayerProps, "onDismiss" | "disableOutsidePointerEvents">,
    NavigationMenuContentImplPrivateProps {}

const NavigationMenuContentImpl: Component<ScopedProps<NavigationMenuContentImplProps>> = (
  props,
) => {
  const rest = omit(
    props,
    "__scopeNavigationMenu",
    "value",
    "triggerRef",
    "focusProxyRef",
    "wasEscapeCloseRef",
    "onRootContentClose",
    "onContentFocusOutside",
    "ref",
  );
  const context = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu);
  const ref: RefObject<NavigationMenuContentImplElement | null> = { current: null };
  const composedRefs = useComposedRefs(ref, props.ref);
  const triggerId = makeTriggerId(context.baseId, props.value);
  const contentId = makeContentId(context.baseId, props.value);
  const getItems = useCollection(props.__scopeNavigationMenu);
  const prevMotionAttributeRef = { current: null as MotionAttribute | null };

  const { onItemDismiss } = context;

  createEffect(
    () => ({ isRootMenu: context.isRootMenu, value: props.value }),
    ({ isRootMenu }) => {
      const content = ref.current;

      // Bubble dismiss to the root content node and focus its trigger
      if (isRootMenu && content) {
        const handleClose = () => {
          onItemDismiss();
          props.onRootContentClose();
          if (content.contains(document.activeElement)) props.triggerRef.current?.focus();
        };
        content.addEventListener(ROOT_CONTENT_DISMISS, handleClose);
        return () => content.removeEventListener(ROOT_CONTENT_DISMISS, handleClose);
      }
    },
  );

  const motionAttribute = createMemo(() => {
    const items = getItems();
    const values = items.map((item) => item.value);
    if (context.dir === Direction.RTL) values.reverse();
    const index = values.indexOf(context.value());
    const prevIndex = values.indexOf(context.previousValue());
    const isSelected = props.value === context.value();
    const wasSelected = prevIndex === values.indexOf(props.value);

    // We only want to update selected and the last selected content
    // this avoids animations being interrupted outside of that range
    if (!isSelected && !wasSelected) return prevMotionAttributeRef.current;

    const attribute = (() => {
      // Don't provide a direction on the initial open
      if (index !== prevIndex) {
        // If we're moving to this item from another
        if (isSelected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start";
        // If we're leaving this item for another
        if (wasSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end";
      }
      // Otherwise we're entering from closed or leaving the list
      // entirely and should not animate in any direction
      return null;
    })();

    prevMotionAttributeRef.current = attribute;
    return attribute;
  });

  return (
    <FocusGroup asChild>
      <DismissableLayer
        id={contentId}
        aria-labelledby={triggerId}
        data-motion={motionAttribute()}
        data-orientation={context.orientation}
        {...rest}
        ref={composedRefs}
        disableOutsidePointerEvents={false}
        onDismiss={() => {
          const rootContentDismissEvent = new Event(ROOT_CONTENT_DISMISS, {
            bubbles: true,
            cancelable: true,
          });
          ref.current?.dispatchEvent(rootContentDismissEvent);
        }}
        onFocusOutside={composeEventHandlers(rest.onFocusOutside, (event) => {
          props.onContentFocusOutside();
          const target = event.target as Node | null;
          const relatedTarget = event.detail.originalEvent.relatedTarget as Node | null;
          const focusMovedIntoMenu = context.rootNavigationMenu()?.contains(target);
          const focusCameFromMenu = context.rootNavigationMenu()?.contains(relatedTarget);
          // Only dismiss content when focus actually leaves the menu. If focus
          // moves into the menu, or it never originated from within the menu
          // (e.g. an external layer such as a Dialog auto-focusing on open),
          // keep the content open.
          // See https://github.com/radix-ui/primitives/issues/3473
          if (focusMovedIntoMenu || !focusCameFromMenu) {
            event.preventDefault();
          }
        })}
        onPointerDownOutside={composeEventHandlers(rest.onPointerDownOutside, (event) => {
          const target = event.target as HTMLElement;
          const isTrigger = getItems().some((item) => item.ref.current?.contains(target));
          const isRootViewport = context.isRootMenu && context.viewport()?.contains(target);
          if (isTrigger || isRootViewport || !context.isRootMenu) event.preventDefault();
        })}
        onKeyDown={composeEventHandlers(
          (event: DivEvent<KeyboardEvent>) => callEventHandler(rest.onKeyDown, event),
          (event) => {
            const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
            const isTabKey = event.key === "Tab" && !isMetaKey;
            if (isTabKey) {
              const candidates = getTabbableCandidates(event.currentTarget);
              const focusedElement = document.activeElement;
              const index = candidates.findIndex((candidate) => candidate === focusedElement);
              const isMovingBackwards = event.shiftKey;
              const nextCandidates = isMovingBackwards
                ? candidates.slice(0, index).reverse()
                : candidates.slice(index + 1, candidates.length);

              if (focusFirst(nextCandidates)) {
                // prevent browser tab keydown because we've handled focus
                event.preventDefault();
              } else {
                // If we can't focus that means we're at the edges
                // so focus the proxy and let browser handle
                // tab/shift+tab keypress on the proxy instead
                props.focusProxyRef.current?.focus();
              }
            }
          },
        )}
        onEscapeKeyDown={composeEventHandlers(rest.onEscapeKeyDown, () => {
          // prevent the dropdown from reopening
          // after the escape key has been pressed
          props.wasEscapeCloseRef.current = true;
        })}
      />
    </FocusGroup>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = "NavigationMenuViewport";
const ViewportSlottable = createSlottable(VIEWPORT_NAME);

type NavigationMenuViewportElement = NavigationMenuViewportImplElement;

/** Props for the viewport rendering active content with open/close animations. */
export interface NavigationMenuViewportProps extends NavigationMenuViewportImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
}

/** Viewport rendering the active content with snapshotted open/close animations. */
const NavigationMenuViewport: Component<ScopedProps<NavigationMenuViewportProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "forceMount", "ref");
  const context = useNavigationMenuContext(VIEWPORT_NAME, props.__scopeNavigationMenu);
  const open = () => Boolean(context.value());
  return (
    <Presence present={props.forceMount || open()}>
      <NavigationMenuViewportImpl
        __scopeNavigationMenu={props.__scopeNavigationMenu}
        {...rest}
        ref={props.ref}
      />
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type NavigationMenuViewportImplElement = HTMLElement;
/** Props for the viewport implementation rendering the animated content host. */
export type NavigationMenuViewportImplProps = PrimitiveDivProps;

const NavigationMenuViewportImpl: Component<ScopedProps<NavigationMenuViewportImplProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeNavigationMenu", "ref");
  const context = useNavigationMenuContext(VIEWPORT_NAME, props.__scopeNavigationMenu);
  const viewportContentContext = useViewportContentContext(
    VIEWPORT_NAME,
    props.__scopeNavigationMenu,
  );
  const composedRefs = useComposedRefs(props.ref, context.onViewportChange);
  const [size, setSize] = createSignal<{ width: number; height: number } | null>(null);
  const [content, setContent] = createSignal<NavigationMenuContentElement | null>(null);
  const viewportSize = () => {
    const current = size();
    return {
      width: current ? `${current.width}px` : undefined,
      height: current ? `${current.height}px` : undefined,
    };
  };
  const open = () => Boolean(context.value());
  // We persist the last active content value as the viewport may be animating out
  // and we want the content to remain mounted for the lifecycle of the viewport.
  const activeContentValue = () => (open() ? context.value() : context.previousValue());

  /**
   * Update viewport size to match the active content node.
   * We prefer offset dimensions over `getBoundingClientRect` as the latter respects CSS transform.
   * For example, if content animates in from `scale(0.5)` the dimensions would be anything
   * from `0.5` to `1` of the intended size.
   */
  const handleSizeChange = () => {
    const contentNode = content();
    if (contentNode) {
      setSize({ width: contentNode.offsetWidth, height: contentNode.offsetHeight });
    }
  };
  useResizeObserver(content, handleSizeChange);

  return (
    <Primitive.div
      data-state={getOpenState(open())}
      data-orientation={context.orientation}
      {...rest}
      ref={composedRefs}
      style={{
        "pointer-events": !open() && context.isRootMenu ? "none" : undefined,
        "--radix-navigation-menu-viewport-width": viewportSize().width,
        "--radix-navigation-menu-viewport-height": viewportSize().height,
        ...props.style,
      }}
      onPointerEnter={composeEventHandlers(
        (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerEnter, event),
        context.onContentEnter,
      )}
      onPointerLeave={composeEventHandlers(
        (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerLeave, event),
        whenMouse(context.onContentLeave),
      )}
    >
      <Show
        when={rest.asChild}
        fallback={
          <>
            <ViewportSlottable>{props.children}</ViewportSlottable>
            <ViewportContentList
              __scopeNavigationMenu={props.__scopeNavigationMenu}
              items={viewportContentContext.items}
              activeContentValue={activeContentValue}
              onActiveContentChange={setContent}
            />
          </>
        }
      >
        <ViewportAsChildContent
          __scopeNavigationMenu={props.__scopeNavigationMenu}
          items={viewportContentContext.items}
          activeContentValue={activeContentValue}
          onActiveContentChange={setContent}
        >
          {props.children}
        </ViewportAsChildContent>
      </Show>
    </Primitive.div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

interface ViewportAsChildContentProps extends ViewportContentListProps {
  children: JSX.Element;
}

/**
 * `asChild` viewport plumbing. The consumer's element replaces the viewport
 * div, so the proxied contents are portaled into it: siblings + `Slot`'s
 * deferred sibling-move would leave `Presence` resolving two top-level
 * elements (and break exit-animation tracking), and the registry only fills
 * once mount effects flush (so the content list cannot render inline into a
 * `Slottable` render fn either). Children resolve through one memo so a lazy
 * child thunk instantiates exactly once.
 */
const ViewportAsChildContent: Component<ScopedProps<ViewportAsChildContentProps>> = (props) => {
  const resolvedChildren = children(() => props.children);
  const target = () => {
    const nodes = resolvedChildren.toArray();
    return nodes.length === 1 && nodes[0] instanceof Element ? nodes[0] : null;
  };

  return (
    <>
      <ViewportSlottable>{resolvedChildren()}</ViewportSlottable>
      <Show when={target()}>
        {(mount) => (
          <SolidPortal mount={mount()}>
            <ViewportContentList
              __scopeNavigationMenu={props.__scopeNavigationMenu}
              items={props.items}
              activeContentValue={props.activeContentValue}
              onActiveContentChange={props.onActiveContentChange}
            />
          </SolidPortal>
        )}
      </Show>
    </>
  );
};

/* -----------------------------------------------------------------------------------------------*/

interface ViewportContentListProps {
  items: () => Map<string, ContentData>;
  // Getter form (Radix passes a boolean re-rendered on change): `For` rows
  // render once, so the active checks must stay reactive to mount/unmount
  // each content as the value changes.
  activeContentValue: () => string;
  onActiveContentChange(node: NavigationMenuContentElement | null): void;
}

const ViewportContentList: Component<ScopedProps<ViewportContentListProps>> = (props) => {
  return (
    <For each={[...props.items()]}>
      {([value, { ref: contentRef, forceMount, ...contentProps }]) => (
        <Presence present={() => forceMount || props.activeContentValue() === value}>
          <NavigationMenuViewportItem
            __scopeNavigationMenu={props.__scopeNavigationMenu}
            {...contentProps}
            contentRef={contentRef}
            isActive={() => props.activeContentValue() === value}
            onActiveContentChange={props.onActiveContentChange}
          />
        </Presence>
      )}
    </For>
  );
};

/* -----------------------------------------------------------------------------------------------*/

interface NavigationMenuViewportItemProps extends NavigationMenuContentImplProps {
  contentRef?: Ref<ViewportContentMounterElement> | undefined;
  // Getter form (Radix passes a boolean re-rendered on change): rows render
  // once, so the active check must stay reactive for content measurement.
  isActive: () => boolean;
  onActiveContentChange(node: NavigationMenuContentElement | null): void;
}

const NavigationMenuViewportItem: Component<ScopedProps<NavigationMenuViewportItemProps>> = (
  props,
) => {
  const rest = omit(
    props,
    "__scopeNavigationMenu",
    "contentRef",
    "isActive",
    "onActiveContentChange",
    "ref",
  );

  const handleContentChange = (node: NavigationMenuContentElement | null) => {
    // We only want to update the stored node when another is available
    // as we need to smoothly transition between them.
    if (props.isActive() && node) {
      props.onActiveContentChange(node);
    }
  };
  const composedRefs = useComposedRefs(props.contentRef, handleContentChange);
  return (
    <NavigationMenuContentImpl
      __scopeNavigationMenu={props.__scopeNavigationMenu}
      {...rest}
      ref={composedRefs}
      // Recomputed (Radix re-registers on every render): the registered
      // snapshot would freeze the state from mount time.
      data-state={getOpenState(props.isActive())}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

const FOCUS_GROUP_NAME = "FocusGroup";
/** Props for the focus group managing roving tabindex among its items. */
export interface FocusGroupProps extends PrimitiveDivProps {}

const FocusGroup: Component<ScopedProps<FocusGroupProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "ref");
  const context = useNavigationMenuContext(FOCUS_GROUP_NAME, props.__scopeNavigationMenu);
  return (
    <FocusGroupCollection.Provider scope={props.__scopeNavigationMenu}>
      <FocusGroupCollection.Slot scope={props.__scopeNavigationMenu}>
        <Primitive.div dir={context.dir} {...rest} ref={props.ref} />
      </FocusGroupCollection.Slot>
    </FocusGroupCollection.Provider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

const ARROW_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
const FOCUS_GROUP_ITEM_NAME = "FocusGroupItem";

type FocusGroupItemElement = HTMLButtonElement;
/** Props for a focus-group item participating in roving-tabindex navigation. */
export interface FocusGroupItemProps extends PrimitivePropsWithRef<"button"> {}

const FocusGroupItem: Component<ScopedProps<FocusGroupItemProps>> = (props) => {
  const rest = omit(props, "__scopeNavigationMenu", "ref");
  const getItems = useFocusGroupCollection(props.__scopeNavigationMenu);
  const context = useNavigationMenuContext(FOCUS_GROUP_ITEM_NAME, props.__scopeNavigationMenu);

  return (
    <FocusGroupCollection.ItemSlot scope={props.__scopeNavigationMenu}>
      <Primitive.button
        {...rest}
        ref={props.ref}
        onKeyDown={composeEventHandlers(
          (event: ButtonEvent<KeyboardEvent>) => callEventHandler(rest.onKeyDown, event),
          (event) => {
            const isFocusNavigationKey = ["Home", "End", ...ARROW_KEYS].includes(event.key);
            if (isFocusNavigationKey) {
              let candidateNodes = getItems()
                .map((item) => item.ref.current)
                .filter((node): node is FocusGroupItemElement => node !== null);
              const prevItemKey = context.dir === Direction.RTL ? "ArrowRight" : "ArrowLeft";
              const prevKeys = [prevItemKey, "ArrowUp", "End"];
              if (prevKeys.includes(event.key)) candidateNodes.reverse();
              if (ARROW_KEYS.includes(event.key)) {
                const currentIndex = candidateNodes.indexOf(
                  event.currentTarget as FocusGroupItemElement,
                );
                candidateNodes = candidateNodes.slice(currentIndex + 1);
              }
              /**
               * Imperative focus during keydown is risky so we prevent the framework's batching updates
               * to avoid potential bugs. See: https://github.com/facebook/react/issues/20332
               */
              setTimeout(() => focusFirst(candidateNodes));

              // Prevent page scroll while navigating
              event.preventDefault();
            }
          },
        )}
      />
    </FocusGroupCollection.ItemSlot>
  );
};

/* -----------------------------------------------------------------------------------------------*/

function whenMouse<E extends { pointerType: string }>(handler: (event: E) => void) {
  return (event: E) => (event.pointerType === "mouse" ? handler(event) : undefined);
}

function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: any) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
      // runtime's understanding of tabbability, so this automatically accounts
      // for any kind of element that could be tabbed to.
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  // we do not take into account the order of nodes with positive `tabIndex` as it
  // defeats the purpose of preserving natuaral tab order of the content. For more
  // info see https://github.com/radix-ui/primitives/pull/2412#issuecomment-2134894930
  // **NOTE** we leave the tab order as it appears in the DOM on purpose
  return nodes;
}

function focusFirst(candidates: HTMLElement[]) {
  const previouslyFocusedElement = document.activeElement;
  return candidates.some((candidate) => {
    // if focus is already where we want to go, we don't want to keep going through the candidates
    if (candidate === previouslyFocusedElement) return true;
    candidate.focus();
    return document.activeElement !== previouslyFocusedElement;
  });
}

/**
 * This is a hacky way to prevent tab order from being broken by the content of
 * the menu. We need to remove all elements from the tab order except the first
 * one. This is because the content is rendered in a portal and the tab order
 * is not preserved.
 */
function removeFromTabOrder(candidates: HTMLElement[]) {
  candidates.forEach((candidate) => {
    candidate.dataset.tabindex = candidate.getAttribute("tabindex") || "";
    candidate.setAttribute("tabindex", "-1");
  });
  return () => {
    candidates.forEach((candidate) => {
      const prevTabindex = candidate.dataset.tabindex as string;
      candidate.setAttribute("tabindex", prevTabindex);
    });
  };
}

function useResizeObserver(element: () => HTMLElement | null, onResize: () => void) {
  const handleResize = useCallbackRef(onResize);
  createEffect(
    () => element(),
    (current) => {
      if (!current) return;
      const target = current;
      let rAF = 0;
      /**
       * Resize Observer will throw an often benign error that says `ResizeObserver loop
       * completed with undelivered notifications`. This means that ResizeObserver was not
       * able to deliver all observations within a single animation frame, so we use
       * `requestAnimationFrame` to ensure we don't deliver unnecessary observations.
       * Further reading: https://github.com/WICG/resize-observer/issues/38
       */
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(target);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(target);
      };
    },
  );
}

function makeTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`;
}

function makeContentId(baseId: string, value: string) {
  return `${baseId}-content-${value}`;
}

/* -----------------------------------------------------------------------------------------------*/

export {
  createNavigationMenuScope,
  //
  NavigationMenu,
  NavigationMenuSub,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  //
  NavigationMenu as Root,
  NavigationMenuSub as Sub,
  NavigationMenuList as List,
  NavigationMenuItem as Item,
  NavigationMenuTrigger as Trigger,
  NavigationMenuLink as Link,
  NavigationMenuContent as Content,
  NavigationMenuIndicator as Indicator,
  NavigationMenuViewport as Viewport,
};
