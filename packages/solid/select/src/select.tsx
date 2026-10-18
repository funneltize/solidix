import { clamp } from "@solidix/number";
import { ariaBoolean, callEventHandler, composeEventHandlers } from "@solidix/primitive";
import { hideOthers } from "@solidix/primitive";
import { createCollection } from "@solidix/collection";
import { afterConnected, useComposedRefs } from "@solidix/compose-refs";
import { createContextScope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import { DismissableLayer } from "@solidix/dismissable-layer";
import { useFocusGuards } from "@solidix/focus-guards";
import { FocusScope } from "@solidix/focus-scope";
import { useId } from "@solidix/id";
import * as PopperPrimitive from "@solidix/popper";
import { Portal as PortalPrimitive } from "@solidix/portal";
import { Presence } from "@solidix/presence";
import { Primitive } from "@solidix/primitive";
import { useCallbackRef } from "@solidix/use-callback-ref";
import { useControllableState } from "@solidix/use-controllable-state";
import { useLayoutEffect } from "@solidix/use-layout-effect";
import { VISUALLY_HIDDEN_STYLES } from "@solidix/visually-hidden";
import { RemoveScroll } from "@solidix/remove-scroll";
import { Portal as SolidPortal } from "@solidjs/web";
import {
  children,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onSettled,
  Show,
  untrack,
  type Component,
} from "solid-js";
import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";

import type { Scope } from "@solidix/context";
import type { DismissableLayerProps } from "@solidix/dismissable-layer";
import type { FocusScopeProps } from "@solidix/focus-scope";
import type { PopperArrowProps, PopperContentProps } from "@solidix/popper";
import type { PrimitivePropsWithRef } from "@solidix/primitive";

const Position = {
  ItemAligned: "item-aligned",
  Popper: "popper",
} as const;

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type Position = (typeof Position)[keyof typeof Position];
type Direction = (typeof Direction)[keyof typeof Direction];

const OPEN_KEYS = [" ", "Enter", "ArrowUp", "ArrowDown"];
const SELECTION_KEYS = [" ", "Enter"];

/** Solid native-event equivalents of the handler event types, for composing
 * optional consumer handlers (which may also be `[handler, data]` tuples). */
type ButtonEvent<E extends Event> = E & { currentTarget: HTMLButtonElement; target: Element };
type DivEvent<E extends Event> = E & { currentTarget: HTMLDivElement; target: Element };

/* -------------------------------------------------------------------------------------------------
 * Select
 * -----------------------------------------------------------------------------------------------*/

const SELECT_NAME = "Select";

type ItemData = { value: string; disabled: boolean; textValue: string };
const [Collection, useCollection, createCollectionScope] = createCollection<
  SelectItemElement,
  ItemData
>(SELECT_NAME);

type ScopedProps<P> = P & { __scopeSelect?: Scope | undefined };
const [createSelectContext, createSelectScope] = createContextScope(SELECT_NAME, [
  createCollectionScope,
  PopperPrimitive.createPopperScope,
]);
const usePopperScope = PopperPrimitive.createPopperScope();

interface SelectUserSelection {
  value: string;
  hasConsumerStoppedPropagation: boolean;
}

interface SelectContextValue {
  trigger: () => SelectTriggerElement | null;
  onTriggerChange(node: SelectTriggerElement | null): void;
  valueNode: () => SelectValueElement | null;
  onValueNodeChange(node: SelectValueElement | null): void;
  valueNodeHasChildren: () => boolean;
  onValueNodeHasChildrenChange(hasChildren: boolean): void;
  contentId: string;
  value: () => string | undefined;
  onValueChange(value: string): void;
  hasConsumerStoppedPropagationRef: { current: boolean };
  userSelection: () => SelectUserSelection | null;
  onUserSelect(value: string): void;
  open: () => boolean;
  required?: boolean | undefined;
  onOpenChange(open: boolean): void;
  dir: SelectProps["dir"];
  triggerPointerDownPosRef: { current: { x: number; y: number } | null };
  disabled?: boolean | undefined;
  name?: string | undefined;
  autoComplete?: string | undefined;
  form?: string | undefined;
  nativeOptions: () => NativeOption[];
  nativeSelectKey: () => string;
  isFormControl: () => boolean;
}

const [SelectProviderImpl, useSelectContext] = createSelectContext<SelectContextValue>(SELECT_NAME);

/**
 * Unlike Radix, which collects React `<option>` elements built by each
 * `Select.ItemText`, Solidix collects plain option data plus a getter for the
 * item text. The JSX `<option>` elements are rendered by `SelectBubbleInput`
 * so the text stays reactive after it has been collected.
 */
type NativeOption = { value: string; disabled: boolean; text: () => string | null | undefined };

type SelectNativeOptionsContextValue = {
  onNativeOptionAdd(option: NativeOption): void;
  onNativeOptionRemove(option: NativeOption): void;
};
const [SelectNativeOptionsProvider, useSelectNativeOptionsContext] =
  createSelectContext<SelectNativeOptionsContextValue>(SELECT_NAME);

export interface SelectSharedProps {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  dir?: Direction | undefined;
  name?: string | undefined;
  autoComplete?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  form?: string | undefined;
}

export type SelectProps = SelectSharedProps & {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
};

/* -------------------------------------------------------------------------------------------------
 * SelectProvider
 * -----------------------------------------------------------------------------------------------*/

export interface SelectProviderProps extends SelectSharedProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
}

const SelectProvider: Component<ScopedProps<SelectProviderProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSelect",
    "children",
    "open",
    "defaultOpen",
    "onOpenChange",
    "value",
    "defaultValue",
    "onValueChange",
    "dir",
    "name",
    "autoComplete",
    "disabled",
    "required",
    "form",
  );
  const popperScope = usePopperScope(props.__scopeSelect);
  const [trigger, setTrigger] = createSignal<SelectTriggerElement | null>(null);
  const [valueNode, setValueNode] = createSignal<SelectValueElement | null>(null);
  const [valueNodeHasChildren, setValueNodeHasChildren] = createSignal(false);
  const direction = useDirection(props.dir);
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: (next) => props.onOpenChange?.(next),
    caller: SELECT_NAME,
  });
  const [value, setValue] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue,
    onChange: (next) =>
      (props.onValueChange as ((value: string | undefined) => void) | undefined)?.(next),
    caller: SELECT_NAME,
  });
  const triggerPointerDownPosRef: { current: { x: number; y: number } | null } = { current: null };
  const hasConsumerStoppedPropagationRef = { current: false };

  // The latest value selected by the user. The bubble input notifies the form
  // of it once the framework has handled the selection, whether or not the value
  // changes in the same render.
  //
  // See https://github.com/radix-ui/primitives/issues/4102
  const [userSelection, setUserSelection] = createSignal<SelectUserSelection | null>(null);
  const handleUserSelect = (nextValue: string) => {
    setUserSelection({
      value: nextValue,
      hasConsumerStoppedPropagation: hasConsumerStoppedPropagationRef.current,
    });
    setValue(nextValue);
  };

  const initialValue = value();
  createEffect(
    () => ({ form: props.form, trigger: trigger() }),
    ({ form, trigger }) => {
      const associatedForm = form ? trigger?.ownerDocument.getElementById(form) : trigger?.form;
      if (associatedForm instanceof HTMLFormElement) {
        const reset = () => setValue(initialValue);
        associatedForm.addEventListener("reset", reset);
        return () => associatedForm.removeEventListener("reset", reset);
      }
    },
  );

  // We set this to true by default so that events bubble to forms without JS (SSR)
  const isFormControl = () => {
    const triggerNode = trigger();
    return triggerNode ? !!props.form || !!triggerNode.closest("form") : true;
  };
  const [nativeOptionsSet, setNativeOptionsSet] = createSignal(new Set<NativeOption>());
  const contentId = useId();

  // The native `select` only associates the correct default value if the corresponding
  // `option` is rendered as a child **at the same time** as itself.
  // Because it might take a few renders for our items to gather the information to build
  // the native `option`(s), we generate a key on the `select` to make sure it is rebuilt
  // each time the options change.
  const nativeOptions = createMemo(() => Array.from(nativeOptionsSet()));
  const nativeSelectKey = createMemo(() =>
    nativeOptions()
      .map((option) => option.value)
      .join(";"),
  );

  const handleNativeOptionAdd = (option: NativeOption) => {
    setNativeOptionsSet((prev) => new Set(prev).add(option));
  };

  const handleNativeOptionRemove = (option: NativeOption) => {
    setNativeOptionsSet((prev) => {
      const optionsSet = new Set(prev);
      optionsSet.delete(option);
      return optionsSet;
    });
  };

  const context: SelectContextValue = {
    required: props.required,
    trigger,
    onTriggerChange: setTrigger,
    valueNode,
    onValueNodeChange: setValueNode,
    valueNodeHasChildren,
    onValueNodeHasChildrenChange: setValueNodeHasChildren,
    contentId,
    value,
    onValueChange: setValue,
    hasConsumerStoppedPropagationRef,
    userSelection,
    onUserSelect: handleUserSelect,
    open,
    onOpenChange: setOpen,
    dir: direction,
    triggerPointerDownPosRef,
    disabled: props.disabled,
    name: props.name,
    autoComplete: props.autoComplete,
    form: props.form,
    nativeOptions,
    nativeSelectKey,
    isFormControl,
  };

  // The internal render prop (used by `Select`) is invoked exactly once with
  // the live context. Children are read directly (never memoized): a
  // `children()` memo created here would capture the wrong owner and hide the
  // providers below from context lookup. The branch below never re-runs (the
  // render prop is static and the call is untracked), so the single read is
  // stable. Reactive values stay reactive inside the render output via their
  // getters (`Show`, etc.).
  type InternalRender = (context: SelectContextValue) => JSX.Element;
  const internalRender = (rest as unknown as { internal_do_not_use_render?: unknown })
    .internal_do_not_use_render;

  return (
    <PopperPrimitive.Root {...popperScope}>
      <SelectProviderImpl scope={props.__scopeSelect} {...context}>
        <Collection.Provider scope={props.__scopeSelect}>
          <SelectNativeOptionsProvider
            scope={props.__scopeSelect}
            onNativeOptionAdd={handleNativeOptionAdd}
            onNativeOptionRemove={handleNativeOptionRemove}
          >
            {
              untrack(() =>
                isFunction(internalRender)
                  ? (internalRender as InternalRender)(context)
                  : props.children,
              ) as unknown as JSX.Element
            }
          </SelectNativeOptionsProvider>
        </Collection.Provider>
      </SelectProviderImpl>
    </PopperPrimitive.Root>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Select
 * -----------------------------------------------------------------------------------------------*/

const Select: Component<ScopedProps<SelectProps>> = (props) => {
  const rest = omit(props, "__scopeSelect", "children");
  return (
    <SelectProvider
      __scopeSelect={props.__scopeSelect}
      {...rest}
      // @ts-expect-error internal render prop
      internal_do_not_use_render={({ isFormControl }: SelectContextValue) => (
        <>
          {props.children}
          <Show when={isFormControl()}>
            <SelectBubbleInput __scopeSelect={props.__scopeSelect} />
          </Show>
        </>
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "SelectTrigger";

type SelectTriggerElement = HTMLButtonElement;
export type SelectTriggerProps = PrimitivePropsWithRef<"button">;

const SelectTrigger: Component<ScopedProps<SelectTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeSelect", "disabled");
  const popperScope = usePopperScope(props.__scopeSelect);
  const context = useSelectContext(TRIGGER_NAME, props.__scopeSelect);
  const isDisabled = () => context.disabled || props.disabled === true;
  const composedRefs = useComposedRefs(props.ref, context.onTriggerChange);
  const getItems = useCollection(props.__scopeSelect);
  const pointerTypeRef: { current: PointerEvent["pointerType"] } = { current: "touch" };

  const [searchRef, handleTypeaheadSearch, resetTypeahead] = useTypeaheadSearch((search) => {
    const enabledItems = getItems().filter((item) => !item.disabled);
    const currentItem = enabledItems.find((item) => item.value === context.value());
    const nextItem = findNextItem(enabledItems, search, currentItem);
    if (nextItem !== undefined) {
      context.onUserSelect(nextItem.value);
    }
  });

  const handleOpen = (pointerEvent?: MouseEvent | PointerEvent) => {
    if (!isDisabled()) {
      context.onOpenChange(true);
      // reset typeahead when we open
      resetTypeahead();
    }

    if (pointerEvent) {
      context.triggerPointerDownPosRef.current = {
        x: Math.round(pointerEvent.pageX),
        y: Math.round(pointerEvent.pageY),
      };
    }
  };

  return (
    <PopperPrimitive.Anchor asChild {...popperScope}>
      <Primitive.button
        type="button"
        role="combobox"
        aria-controls={context.open() ? context.contentId : undefined}
        aria-expanded={ariaBoolean(context.open())}
        aria-required={ariaBoolean(context.required)}
        aria-autocomplete="none"
        dir={context.dir}
        data-state={context.open() ? "open" : "closed"}
        disabled={isDisabled()}
        data-disabled={isDisabled() ? "" : undefined}
        data-placeholder={shouldShowPlaceholder(context.value()) ? "" : undefined}
        {...rest}
        ref={composedRefs}
        // Enable compatibility with native label or custom `Label` "click" for Safari:
        onClick={composeEventHandlers(
          (event: ButtonEvent<MouseEvent>) => callEventHandler(rest.onClick, event),
          (event) => {
            // Whilst browsers generally have no issue focusing the trigger when clicking
            // on a label, Safari seems to struggle with the fact that there's no `onClick`.
            // We force `focus` in this case. Note: this doesn't create any other side-effect
            // because we are preventing default in `onPointerDown` so effectively
            // this only runs for a label "click"
            event.currentTarget.focus();

            // Open on click when using a touch or pen device
            if (pointerTypeRef.current !== "mouse") {
              handleOpen(event);
            }
          },
        )}
        onPointerDown={composeEventHandlers(
          (event: ButtonEvent<PointerEvent>) => callEventHandler(rest.onPointerDown, event),
          (event) => {
            pointerTypeRef.current = event.pointerType;

            // prevent implicit pointer capture
            // https://www.w3.org/TR/pointerevents3/#implicit-pointer-capture
            const target = event.target as HTMLElement;
            if (target.hasPointerCapture(event.pointerId)) {
              target.releasePointerCapture(event.pointerId);
            }

            // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
            // but not when the control key is pressed (avoiding MacOS right click); also not for touch
            // devices because that would open the menu on scroll. (pen devices behave as touch on iOS).
            if (event.button === 0 && event.ctrlKey === false && event.pointerType === "mouse") {
              handleOpen(event);
              // prevent trigger from stealing focus from the active item after opening.
              event.preventDefault();
            }
          },
        )}
        onKeyDown={composeEventHandlers(
          (event: ButtonEvent<KeyboardEvent>) => callEventHandler(rest.onKeyDown, event),
          (event) => {
            const isTypingAhead = searchRef.current !== "";
            const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
            if (!isModifierKey && event.key.length === 1) {
              context.hasConsumerStoppedPropagationRef.current = event.cancelBubble;
              handleTypeaheadSearch(event.key);
            }
            if (isTypingAhead && event.key === " ") return;
            if (OPEN_KEYS.includes(event.key)) {
              handleOpen();
              event.preventDefault();
            }
          },
        )}
      />
    </PopperPrimitive.Anchor>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectValue
 * -----------------------------------------------------------------------------------------------*/

const VALUE_NAME = "SelectValue";

type SelectValueElement = HTMLSpanElement;
type PrimitiveSpanProps = PrimitivePropsWithRef<"span">;
export interface SelectValueProps extends Omit<PrimitiveSpanProps, "placeholder"> {
  placeholder?: JSX.Element | undefined;
}

const SelectValue: Component<ScopedProps<SelectValueProps>> = (props) => {
  // We ignore `class` and `style` as this part shouldn't be styled.
  const rest = omit(props, "__scopeSelect", "class", "style", "children", "placeholder");
  const context = useSelectContext(VALUE_NAME, props.__scopeSelect);
  const composedRefs = useComposedRefs(props.ref, context.onValueNodeChange);
  // Resolved once: the branch below re-runs when the value changes, and a raw
  // `props.children` read would re-instantiate the subtree on every flip.
  const resolvedChildren = children(() => props.children);

  createEffect(
    () => props.children !== undefined,
    (hasChildren) => {
      context.onValueNodeHasChildrenChange(hasChildren);
    },
  );

  const showPlaceholder = () => shouldShowPlaceholder(context.value());

  return (
    <Primitive.span
      {...rest}
      asChild={showPlaceholder() ? false : rest.asChild}
      ref={composedRefs}
      // we don't want events from the portalled `SelectValue` children to bubble
      // through the item they came from
      style={{ "pointer-events": "none" }}
    >
      {showPlaceholder() ? (props.placeholder ?? "") : resolvedChildren()}
    </Primitive.span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectIcon
 * -----------------------------------------------------------------------------------------------*/

export type SelectIconProps = PrimitiveSpanProps;

const SelectIcon: Component<ScopedProps<SelectIconProps>> = (props) => {
  // Always hidden: the icon is decorative by design.
  const rest = omit(props, "__scopeSelect", "children", "aria-hidden");
  return (
    <Primitive.span aria-hidden="true" {...rest} ref={props.ref}>
      {props.children ?? "▼"}
    </Primitive.span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "SelectPortal";

type PortalContextValue = { forceMount?: true | undefined };
const [PortalProvider, usePortalContext] = createSelectContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

export interface SelectPortalProps {
  children?: JSX.Element | undefined;
  /**
   * Specify a container element to portal the content into.
   */
  container?: HTMLElement | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when controlling
   * animation with animation libraries.
   */
  forceMount?: true | undefined;
}

const SelectPortal: Component<ScopedProps<SelectPortalProps>> = (props) => {
  return (
    <PortalProvider scope={props.__scopeSelect} forceMount={props.forceMount}>
      <PortalPrimitive container={props.container}>{props.children}</PortalPrimitive>
    </PortalProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "SelectContent";

type SelectContentElement = SelectContentImplElement;
export interface SelectContentProps extends SelectContentImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
}

const SelectContent: Component<ScopedProps<SelectContentProps>> = (props) => {
  const rest = omit(props, "__scopeSelect", "forceMount");
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeSelect);
  const forceMount = () => props.forceMount ?? portalContext.forceMount;
  const context = useSelectContext(CONTENT_NAME, props.__scopeSelect);
  const [fragment, setFragment] = createSignal<DocumentFragment>();

  // setting the fragment in `useLayoutEffect` as `DocumentFragment` doesn't exist on the server
  useLayoutEffect(() => {
    setFragment(new DocumentFragment());
  });

  // The `Select` items collect their data (e.g. to build the native `option`s
  // and to display the selected value) by mounting their children. We keep
  // them mounted in a detached fragment whenever the content isn't present so
  // that this data stays up to date even while the select is closed (or
  // animating out).
  return (
    <Presence present={forceMount() || context.open()}>
      {({ present }) =>
        present() ? (
          <SelectContentImpl {...rest} ref={props.ref} />
        ) : (
          <SelectContentFragment {...rest} fragment={fragment()} ref={props.ref} />
        )
      }
    </Presence>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectContentFragment
 * -----------------------------------------------------------------------------------------------*/

interface SelectContentFragmentProps extends SelectContentImplProps {
  fragment?: DocumentFragment | undefined;
}

const SelectContentFragment: Component<ScopedProps<SelectContentFragmentProps>> = (props) => {
  const divRef = useComposedRefs(props.ref);
  return (
    <Show when={props.fragment} keyed>
      {(fragment) => (
        // Solid types `mount` as `Element`; fragments work at runtime.
        <SolidPortal mount={fragment as unknown as Element}>
          <SelectContentProvider scope={props.__scopeSelect}>
            <Collection.Slot scope={props.__scopeSelect}>
              <div ref={divRef}>{props.children}</div>
            </Collection.Slot>
          </SelectContentProvider>
        </SolidPortal>
      )}
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectContentImpl
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_MARGIN = 10;

type SelectContentContextValue = {
  content?: (() => SelectContentElement | null) | undefined;
  viewport?: (() => SelectViewportElement | null) | undefined;
  onViewportChange?: ((node: SelectViewportElement | null) => void) | undefined;
  itemRefCallback?:
    | ((node: SelectItemElement | null, value: string, disabled: boolean) => void)
    | undefined;
  selectedItem?: (() => SelectItemElement | null) | undefined;
  onItemLeave?: (() => void) | undefined;
  itemTextRefCallback?:
    | ((node: SelectItemTextElement | null, value: string, disabled: boolean) => void)
    | undefined;
  focusSelectedItem?: (() => void) | undefined;
  selectedItemText?: (() => SelectItemTextElement | null) | undefined;
  position?: SelectContentProps["position"] | undefined;
  isPositioned?: (() => boolean) | undefined;
  searchRef?: { current: string } | undefined;
};

const [SelectContentProvider, useSelectContentContext] =
  createSelectContext<SelectContentContextValue>(CONTENT_NAME, {});

type SelectContentImplElement = SelectPopperPositionElement | SelectItemAlignedPositionElement;

/** Shared div props for select parts. `style` is object-only: parts merge their own
 * base styles into it, which string styles cannot participate in. */
type PrimitiveDivProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

type SelectPopperPrivateProps = { onPlaced?: PopperContentProps["onPlaced"] | undefined };

export interface SelectContentImplProps
  extends
    Omit<SelectPopperPositionProps, keyof SelectPopperPrivateProps>,
    Omit<SelectItemAlignedPositionProps, keyof SelectPopperPrivateProps> {
  /**
   * Event handler called when auto-focusing on close.
   * Can be prevented.
   */
  onCloseAutoFocus?: FocusScopeProps["onUnmountAutoFocus"] | undefined;
  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: DismissableLayerProps["onEscapeKeyDown"] | undefined;
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onPointerDownOutside?: DismissableLayerProps["onPointerDownOutside"] | undefined;

  position?: Position | undefined;
}

const SelectContentImpl: Component<ScopedProps<SelectContentImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSelect",
    "position",
    "onCloseAutoFocus",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    // PopperContent props
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "arrowPadding",
    "collisionBoundary",
    "collisionPadding",
    "sticky",
    "hideWhenDetached",
    "avoidCollisions",
  );
  const position = () => props.position ?? Position.ItemAligned;
  const context = useSelectContext(CONTENT_NAME, props.__scopeSelect);
  const [content, setContent] = createSignal<SelectContentImplElement | null>(null);
  const [viewport, setViewport] = createSignal<SelectViewportElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setContent);
  const [selectedItem, setSelectedItem] = createSignal<SelectItemElement | null>(null);
  const [selectedItemText, setSelectedItemText] = createSignal<SelectItemTextElement | null>(null);
  const getItems = useCollection(props.__scopeSelect);
  const [isPositioned, setIsPositioned] = createSignal(false);
  const firstValidItemFoundRef = { current: false };
  const firstItemFoundRef = { current: false };
  const firstItemTextFoundRef = { current: false };

  // aria-hide everything except the content (better supported equivalent to setting aria-modal)
  onSettled(() => {
    const node = content();
    if (!node) {
      return;
    }
    // A ref being set does not imply the node is connected yet (slotted children
    // resolve lazily); hiding requires a connected target with a real document.
    return afterConnected(node, () => {
      return hideOthers(new Set<Element>([node]), node.ownerDocument.body);
    });
  });

  // Make sure the whole tree has focus guards as our `Select` may be
  // the last element in the DOM (because of the `Portal`)
  useFocusGuards();

  const focusFirst = (candidates: Array<HTMLElement | null>) => {
    const [firstItem, ...restItems] = getItems().map((item) => item.ref.current);
    const [lastItem] = restItems.slice(-1);

    const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
    const viewportNode = viewport();
    for (const candidate of candidates) {
      // if focus is already where we want to go, we don't want to keep going through the candidates
      if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
      candidate?.scrollIntoView({ block: "nearest" });
      // viewport might have padding so scroll to its edges when focusing first/last items.
      if (candidate === firstItem && viewportNode) viewportNode.scrollTop = 0;
      if (candidate === lastItem && viewportNode)
        viewportNode.scrollTop = viewportNode.scrollHeight;
      candidate?.focus();
      if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
    }
  };

  const focusSelectedItem = () => focusFirst([selectedItem(), content()]);

  // Since this is not dependent on layout, we want to ensure this runs at the same time as
  // other effects across components. Hence why we don't call `focusSelectedItem` inside `position`.
  createEffect(
    () => isPositioned(),
    (positioned) => {
      if (positioned) {
        focusSelectedItem();
      }
    },
  );

  // prevent selecting items on `pointerup` in some cases after opening from `pointerdown`
  // and close on `pointerup` outside.
  const { onOpenChange, triggerPointerDownPosRef } = context;
  createEffect(
    () => content(),
    (contentNode) => {
      if (contentNode) {
        let pointerMoveDelta = { x: 0, y: 0 };

        const handlePointerMove = (event: PointerEvent) => {
          pointerMoveDelta = {
            x: Math.abs(Math.round(event.pageX) - (triggerPointerDownPosRef.current?.x ?? 0)),
            y: Math.abs(Math.round(event.pageY) - (triggerPointerDownPosRef.current?.y ?? 0)),
          };
        };
        const handlePointerUp = (event: PointerEvent) => {
          // If the pointer hasn't moved by a certain threshold then we prevent selecting item on `pointerup`.
          if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) {
            event.preventDefault();
          } else {
            // otherwise, if the event was outside the content, close.
            // `event.target` is retargeted to the shadow host for this
            // document-level listener, so use `composedPath()` which pierces
            // open shadow roots to reliably detect events inside the content.
            if (!event.composedPath().includes(contentNode)) {
              onOpenChange(false);
            }
          }
          document.removeEventListener("pointermove", handlePointerMove);
          triggerPointerDownPosRef.current = null;
        };

        if (triggerPointerDownPosRef.current !== null) {
          document.addEventListener("pointermove", handlePointerMove);
          document.addEventListener("pointerup", handlePointerUp, { capture: true, once: true });
        }

        return () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp, { capture: true });
        };
      }
    },
  );

  useLayoutEffect(() => {
    const close = () => onOpenChange(false);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
    };
  });

  const [searchRef, handleTypeaheadSearch] = useTypeaheadSearch((search) => {
    const enabledItems = getItems().filter((item) => !item.disabled);
    const currentItem = enabledItems.find((item) => item.ref.current === document.activeElement);
    const nextItem = findNextItem(enabledItems, search, currentItem);
    if (nextItem) {
      /**
       * Imperative focus during keydown is risky so we prevent the framework's batching updates
       * to avoid potential bugs. See: https://github.com/facebook/react/issues/20332
       */
      setTimeout(() => nextItem.ref.current?.focus());
    }
  });

  const itemRefCallback = (node: SelectItemElement | null, value: string, disabled: boolean) => {
    const isFirstItem = !firstItemFoundRef.current;
    if (isFirstItem) firstItemFoundRef.current = true;

    const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
    const isSelectedItem = context.value() !== undefined && context.value() === value;
    if (isSelectedItem || isFirstValidItem) {
      setSelectedItem(node);
      if (isFirstValidItem) firstValidItemFoundRef.current = true;
    } else if (isFirstItem) {
      setSelectedItem(node);
    }
  };
  const handleItemLeave = () => content()?.focus();
  const itemTextRefCallback = (
    node: SelectItemTextElement | null,
    value: string,
    disabled: boolean,
  ) => {
    if (!node) return;

    const isFirstItem = !firstItemTextFoundRef.current;
    if (isFirstItem) firstItemTextFoundRef.current = true;

    const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
    const isSelectedItem = context.value() !== undefined && context.value() === value;
    if (isSelectedItem || isFirstValidItem) {
      setSelectedItemText(node);
    } else if (isFirstItem) {
      setSelectedItemText(node);
    }
  };

  const isPopperPosition = () => position() === Position.Popper;

  const positionStyle = (): JSX.CSSProperties => ({
    // flex layout so we can place the scroll buttons properly
    display: "flex",
    "flex-direction": "column",
    // reset the outline by default as the content MAY get focused
    outline: "none",
    ...rest.style,
  });

  const handleContentKeyDown = composeEventHandlers(
    (event: DivEvent<KeyboardEvent>) => callEventHandler(rest.onKeyDown, event),
    (event) => {
      const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;

      // select should not be navigated using tab key so we prevent it
      if (event.key === "Tab") event.preventDefault();

      if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key);

      if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        const items = getItems().filter((item) => !item.disabled);
        let candidateNodes = items.map((item) => item.ref.current!);

        if (["ArrowUp", "End"].includes(event.key)) {
          candidateNodes = candidateNodes.slice().reverse();
        }
        if (["ArrowUp", "ArrowDown"].includes(event.key)) {
          const currentElement = event.target as SelectItemElement;
          const currentIndex = candidateNodes.indexOf(currentElement);
          candidateNodes = candidateNodes.slice(currentIndex + 1);
        }

        /**
         * Imperative focus during keydown is risky so we prevent the framework's batching updates
         * to avoid potential bugs. See: https://github.com/facebook/react/issues/20332
         */
        setTimeout(() => focusFirst(candidateNodes));

        event.preventDefault();
      }
    },
  );

  const handlePlaced = () => setIsPositioned(true);
  const preventContextMenu = (event: MouseEvent) => event.preventDefault();

  return (
    <SelectContentProvider
      scope={props.__scopeSelect}
      content={content}
      viewport={viewport}
      onViewportChange={setViewport}
      itemRefCallback={itemRefCallback}
      selectedItem={selectedItem}
      onItemLeave={handleItemLeave}
      itemTextRefCallback={itemTextRefCallback}
      focusSelectedItem={focusSelectedItem}
      selectedItemText={selectedItemText}
      position={position()}
      isPositioned={isPositioned}
      searchRef={searchRef}
    >
      <RemoveScroll asChild allowPinchZoom>
        <FocusScope
          asChild
          // we make sure we're not trapping once it's been closed
          // (closed !== unmounted when animating out)
          trapped={context.open()}
          onMountAutoFocus={(event) => {
            // we prevent open autofocus because we manually focus the selected item
            event.preventDefault();
          }}
          onUnmountAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event) => {
            context.trigger()?.focus({ preventScroll: true });
            event.preventDefault();
          })}
        >
          <DismissableLayer
            asChild
            disableOutsidePointerEvents
            onEscapeKeyDown={props.onEscapeKeyDown}
            onPointerDownOutside={props.onPointerDownOutside}
            // When focus is trapped, a focusout event may still happen.
            // We make sure we don't trigger our `onDismiss` in such case.
            onFocusOutside={(event) => event.preventDefault()}
            onDismiss={() => context.onOpenChange(false)}
          >
            <Show
              when={isPopperPosition()}
              fallback={
                <SelectItemAlignedPosition
                  role="listbox"
                  id={context.contentId}
                  data-state={context.open() ? "open" : "closed"}
                  dir={context.dir}
                  onContextMenu={preventContextMenu}
                  {...rest}
                  onPlaced={handlePlaced}
                  ref={composedRefs}
                  style={positionStyle()}
                  onKeyDown={handleContentKeyDown}
                />
              }
            >
              {/* Silently ignore props that are not supported by `SelectItemAlignedPosition` */}
              <SelectPopperPosition
                role="listbox"
                id={context.contentId}
                data-state={context.open() ? "open" : "closed"}
                dir={context.dir}
                onContextMenu={preventContextMenu}
                side={props.side}
                sideOffset={props.sideOffset}
                align={props.align}
                alignOffset={props.alignOffset}
                arrowPadding={props.arrowPadding}
                collisionBoundary={props.collisionBoundary}
                collisionPadding={props.collisionPadding}
                sticky={props.sticky}
                hideWhenDetached={props.hideWhenDetached}
                avoidCollisions={props.avoidCollisions}
                {...rest}
                onPlaced={handlePlaced}
                ref={composedRefs}
                style={positionStyle()}
                onKeyDown={handleContentKeyDown}
              />
            </Show>
          </DismissableLayer>
        </FocusScope>
      </RemoveScroll>
    </SelectContentProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectItemAlignedPosition
 * -----------------------------------------------------------------------------------------------*/

type SelectItemAlignedPositionElement = HTMLDivElement;
export type SelectItemAlignedPositionProps = PrimitiveDivProps & SelectPopperPrivateProps;

const SelectItemAlignedPosition: Component<ScopedProps<SelectItemAlignedPositionProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeSelect", "onPlaced", "ref");
  const context = useSelectContext(CONTENT_NAME, props.__scopeSelect);
  const contentContext = useSelectContentContext(CONTENT_NAME, props.__scopeSelect);
  const [contentWrapper, setContentWrapper] = createSignal<HTMLDivElement | null>(null);
  const [content, setContent] = createSignal<SelectItemAlignedPositionElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setContent);
  const getItems = useCollection(props.__scopeSelect);
  const shouldExpandOnScrollRef = { current: false };
  const shouldRepositionRef = { current: true };

  const position = () => {
    const trigger = context.trigger();
    const valueNode = context.valueNode();
    const wrapper = contentWrapper();
    const contentNode = content();
    const viewport = contentContext.viewport?.();
    const selectedItem = contentContext.selectedItem?.();
    const selectedItemText = contentContext.selectedItemText?.();
    if (
      trigger &&
      valueNode &&
      wrapper &&
      contentNode &&
      viewport &&
      selectedItem &&
      selectedItemText
    ) {
      const triggerRect = trigger.getBoundingClientRect();

      // -----------------------------------------------------------------------------------------
      //  Horizontal positioning
      // -----------------------------------------------------------------------------------------
      const contentRect = contentNode.getBoundingClientRect();
      const valueNodeRect = valueNode.getBoundingClientRect();
      const itemTextRect = selectedItemText.getBoundingClientRect();

      if (context.dir !== Direction.RTL) {
        const itemTextOffset = itemTextRect.left - contentRect.left;
        const left = valueNodeRect.left - itemTextOffset;
        const leftDelta = triggerRect.left - left;
        const minContentWidth = triggerRect.width + leftDelta;
        const contentWidth = Math.max(minContentWidth, contentRect.width);
        const rightEdge = window.innerWidth - CONTENT_MARGIN;
        const clampedLeft = clamp(left, [
          CONTENT_MARGIN,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(CONTENT_MARGIN, rightEdge - contentWidth),
        ]);

        wrapper.style.minWidth = minContentWidth + "px";
        wrapper.style.left = clampedLeft + "px";
      } else {
        const itemTextOffset = contentRect.right - itemTextRect.right;
        const right = window.innerWidth - valueNodeRect.right - itemTextOffset;
        const rightDelta = window.innerWidth - triggerRect.right - right;
        const minContentWidth = triggerRect.width + rightDelta;
        const contentWidth = Math.max(minContentWidth, contentRect.width);
        const leftEdge = window.innerWidth - CONTENT_MARGIN;
        const clampedRight = clamp(right, [
          CONTENT_MARGIN,
          Math.max(CONTENT_MARGIN, leftEdge - contentWidth),
        ]);

        wrapper.style.minWidth = minContentWidth + "px";
        wrapper.style.right = clampedRight + "px";
      }

      // -----------------------------------------------------------------------------------------
      // Vertical positioning
      // -----------------------------------------------------------------------------------------
      const items = getItems();
      const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
      const itemsHeight = viewport.scrollHeight;

      const contentStyles = window.getComputedStyle(contentNode);
      const contentBorderTopWidth = parseInt(contentStyles.borderTopWidth, 10);
      const contentPaddingTop = parseInt(contentStyles.paddingTop, 10);
      const contentBorderBottomWidth = parseInt(contentStyles.borderBottomWidth, 10);
      const contentPaddingBottom = parseInt(contentStyles.paddingBottom, 10);
      const fullContentHeight =
        contentBorderTopWidth +
        contentPaddingTop +
        itemsHeight +
        contentPaddingBottom +
        contentBorderBottomWidth;
      const minContentHeight = Math.min(selectedItem.offsetHeight * 5, fullContentHeight);

      const viewportStyles = window.getComputedStyle(viewport);
      const viewportPaddingTop = parseInt(viewportStyles.paddingTop, 10);
      const viewportPaddingBottom = parseInt(viewportStyles.paddingBottom, 10);

      const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
      const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;

      const selectedItemHalfHeight = selectedItem.offsetHeight / 2;
      const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight;
      const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
      const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;

      const willAlignWithoutTopOverflow = contentTopToItemMiddle <= topEdgeToTriggerMiddle;

      if (willAlignWithoutTopOverflow) {
        const isLastItem =
          items.length > 0 && selectedItem === items[items.length - 1]!.ref.current;
        wrapper.style.bottom = 0 + "px";
        const viewportOffsetBottom =
          contentNode.clientHeight - viewport.offsetTop - viewport.offsetHeight;
        const clampedTriggerMiddleToBottomEdge = Math.max(
          triggerMiddleToBottomEdge,
          selectedItemHalfHeight +
            // viewport might have padding bottom, include it to avoid a scrollable viewport
            (isLastItem ? viewportPaddingBottom : 0) +
            viewportOffsetBottom +
            contentBorderBottomWidth,
        );
        const height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge;
        wrapper.style.height = height + "px";
      } else {
        const isFirstItem = items.length > 0 && selectedItem === items[0]!.ref.current;
        wrapper.style.top = 0 + "px";
        const clampedTopEdgeToTriggerMiddle = Math.max(
          topEdgeToTriggerMiddle,
          contentBorderTopWidth +
            viewport.offsetTop +
            // viewport might have padding top, include it to avoid a scrollable viewport
            (isFirstItem ? viewportPaddingTop : 0) +
            selectedItemHalfHeight,
        );
        const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
        wrapper.style.height = height + "px";
        viewport.scrollTop = contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop;
      }

      wrapper.style.margin = `${CONTENT_MARGIN}px 0`;
      wrapper.style.minHeight = minContentHeight + "px";
      wrapper.style.maxHeight = availableHeight + "px";
      // -----------------------------------------------------------------------------------------

      props.onPlaced?.();

      // we don't want the initial scroll position adjustment to trigger "expand on scroll"
      // so we explicitly turn it on only after they've registered.
      requestAnimationFrame(() => (shouldExpandOnScrollRef.current = true));
    }
  };

  // Re-run positioning once every participating node has been collected. Unlike
  // React, where each state update re-renders and re-runs the layout effect,
  // signals notify exactly: track each input explicitly.
  createEffect(
    () => ({
      trigger: context.trigger(),
      valueNode: context.valueNode(),
      wrapper: contentWrapper(),
      content: content(),
      viewport: contentContext.viewport?.(),
      selectedItem: contentContext.selectedItem?.(),
      selectedItemText: contentContext.selectedItemText?.(),
    }),
    () => {
      position();
    },
  );

  // copy z-index from content to wrapper
  const [contentZIndex, setContentZIndex] = createSignal<string>();
  createEffect(
    () => content(),
    (contentNode) => {
      if (contentNode) setContentZIndex(window.getComputedStyle(contentNode).zIndex);
    },
  );

  // When the viewport becomes scrollable at the top, the scroll up button will mount.
  // Because it is part of the normal flow, it will push down the viewport, thus throwing our
  // trigger => selectedItem alignment off by the amount the viewport was pushed down.
  // We wait for this to happen and then re-run the positining logic one more time to account for it.
  const handleScrollButtonChange = (node: SelectScrollButtonImplElement | null) => {
    if (node && shouldRepositionRef.current === true) {
      position();
      contentContext.focusSelectedItem?.();
      shouldRepositionRef.current = false;
    }
  };

  return (
    <SelectViewportProvider
      scope={props.__scopeSelect}
      contentWrapper={contentWrapper}
      shouldExpandOnScrollRef={shouldExpandOnScrollRef}
      onScrollButtonChange={handleScrollButtonChange}
    >
      <div
        ref={setContentWrapper}
        style={{
          display: "flex",
          "flex-direction": "column",
          position: "fixed",
          "z-index": contentZIndex(),
        }}
      >
        <Primitive.div
          {...rest}
          ref={composedRefs}
          style={{
            // When we get the height of the content, it includes borders. If we were to set
            // the height without having `boxSizing: 'border-box'` it would be too big.
            "box-sizing": "border-box",
            // We need to ensure the content doesn't get taller than the wrapper
            "max-height": "100%",
            ...rest.style,
          }}
        />
      </div>
    </SelectViewportProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectPopperPosition
 * -----------------------------------------------------------------------------------------------*/

type SelectPopperPositionElement = HTMLDivElement;
export interface SelectPopperPositionProps extends PopperContentProps, SelectPopperPrivateProps {}

const SelectPopperPosition: Component<ScopedProps<SelectPopperPositionProps>> = (props) => {
  const rest = omit(props, "__scopeSelect", "align", "collisionPadding", "ref");
  const popperScope = usePopperScope(props.__scopeSelect);

  return (
    <PopperPrimitive.Content
      {...popperScope}
      {...rest}
      ref={props.ref}
      align={props.align ?? "start"}
      collisionPadding={props.collisionPadding ?? CONTENT_MARGIN}
      style={{
        // Ensure border-box for floating-ui calculations
        "box-sizing": "border-box",
        ...rest.style,
        // re-namespace exposed content custom properties
        "--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-select-content-available-width": "var(--radix-popper-available-width)",
        "--radix-select-content-available-height": "var(--radix-popper-available-height)",
        "--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-select-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectViewport
 * -----------------------------------------------------------------------------------------------*/

type SelectViewportContextValue = {
  contentWrapper?: (() => HTMLDivElement | null) | undefined;
  shouldExpandOnScrollRef?: { current: boolean } | undefined;
  onScrollButtonChange?: ((node: SelectScrollButtonImplElement | null) => void) | undefined;
};

const [SelectViewportProvider, useSelectViewportContext] =
  createSelectContext<SelectViewportContextValue>(CONTENT_NAME, {});

const VIEWPORT_NAME = "SelectViewport";

type SelectViewportElement = HTMLDivElement;
export interface SelectViewportProps extends PrimitiveDivProps {
  nonce?: string | undefined;
}

const SelectViewport: Component<ScopedProps<SelectViewportProps>> = (props) => {
  const rest = omit(props, "__scopeSelect", "nonce");
  const contentContext = useSelectContentContext(VIEWPORT_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(VIEWPORT_NAME, props.__scopeSelect);
  const composedRefs = useComposedRefs(props.ref, contentContext.onViewportChange);
  const prevScrollTopRef = { current: 0 };
  return (
    <>
      {/* Hide scrollbars cross-browser and enable momentum scroll for touch devices */}
      <style nonce={props.nonce}>
        {`[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}`}
      </style>
      <Collection.Slot scope={props.__scopeSelect}>
        <Primitive.div
          data-radix-select-viewport=""
          role="presentation"
          {...rest}
          ref={composedRefs}
          style={{
            // we use position: 'relative' here on the `viewport` so that when we call
            // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
            // (independent of the scrollUpButton).
            position: "relative",
            flex: 1,
            // Viewport should only be scrollable in the vertical direction.
            // This won't work in vertical writing modes, so we'll need to
            // revisit this if/when that is supported
            // https://developer.chrome.com/blog/vertical-form-controls
            "overflow-x": "hidden",
            "overflow-y": "auto",
            ...rest.style,
          }}
          onScroll={composeEventHandlers(
            (event: DivEvent<Event>) => callEventHandler(rest.onScroll, event),
            (event) => {
              const viewport = event.currentTarget;
              const { contentWrapper, shouldExpandOnScrollRef } = viewportContext;
              const wrapper = contentWrapper?.();
              if (shouldExpandOnScrollRef?.current && wrapper) {
                const scrolledBy = Math.abs(prevScrollTopRef.current - viewport.scrollTop);
                if (scrolledBy > 0) {
                  const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
                  const cssMinHeight = parseFloat(wrapper.style.minHeight);
                  const cssHeight = parseFloat(wrapper.style.height);
                  const prevHeight = Math.max(cssMinHeight, cssHeight);

                  if (prevHeight < availableHeight) {
                    const nextHeight = prevHeight + scrolledBy;
                    const clampedNextHeight = Math.min(availableHeight, nextHeight);
                    const heightDiff = nextHeight - clampedNextHeight;

                    wrapper.style.height = clampedNextHeight + "px";
                    if (wrapper.style.bottom === "0px") {
                      viewport.scrollTop = heightDiff > 0 ? heightDiff : 0;
                      // ensure the content stays pinned to the bottom
                      wrapper.style.justifyContent = "flex-end";
                    }
                  }
                }
              }
              prevScrollTopRef.current = viewport.scrollTop;
            },
          )}
        />
      </Collection.Slot>
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = "SelectGroup";

type SelectGroupContextValue = { id: string };

const [SelectGroupContextProvider, useSelectGroupContext] =
  createSelectContext<SelectGroupContextValue>(GROUP_NAME);

export type SelectGroupProps = PrimitiveDivProps;

const SelectGroup: Component<ScopedProps<SelectGroupProps>> = (props) => {
  const rest = omit(props, "__scopeSelect");
  const groupId = useId();
  return (
    <SelectGroupContextProvider scope={props.__scopeSelect} id={groupId}>
      <Primitive.div role="group" aria-labelledby={groupId} {...rest} ref={props.ref} />
    </SelectGroupContextProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = "SelectLabel";

export type SelectLabelProps = PrimitiveDivProps;

const SelectLabel: Component<ScopedProps<SelectLabelProps>> = (props) => {
  const rest = omit(props, "__scopeSelect");
  const groupContext = useSelectGroupContext(LABEL_NAME, props.__scopeSelect);
  return <Primitive.div id={groupContext.id} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "SelectItem";

type SelectItemContextValue = {
  value: string;
  disabled: boolean;
  textId: string;
  isSelected: () => boolean;
  onItemTextChange(node: SelectItemTextElement | null): void;
};

const [SelectItemContextProvider, useSelectItemContext] =
  createSelectContext<SelectItemContextValue>(ITEM_NAME);

type SelectItemElement = HTMLDivElement;
export interface SelectItemProps extends PrimitiveDivProps {
  value: string;
  disabled?: boolean | undefined;
  textValue?: string | undefined;
}

const SelectItem: Component<ScopedProps<SelectItemProps>> = (props) => {
  const rest = omit(props, "__scopeSelect", "value", "disabled", "textValue");
  const context = useSelectContext(ITEM_NAME, props.__scopeSelect);
  const contentContext = useSelectContentContext(ITEM_NAME, props.__scopeSelect);
  const isSelected = () => context.value() === props.value;
  const [textValue, setTextValue] = createSignal(props.textValue ?? "");
  const [isFocused, setIsFocused] = createSignal(false);
  const handleItemRefCallback = useCallbackRef((node: SelectItemElement | null) =>
    contentContext.itemRefCallback?.(node, props.value, props.disabled ?? false),
  );
  const composedRefs = useComposedRefs(props.ref, handleItemRefCallback);
  const textId = useId();
  const pointerTypeRef: { current: PointerEvent["pointerType"] } = { current: "touch" };

  function handleSelect(event: { cancelBubble: boolean }) {
    context.hasConsumerStoppedPropagationRef.current = event.cancelBubble;
    context.onUserSelect(props.value);
    context.onOpenChange(false);
  }

  const handleItemTextChange = (node: SelectItemTextElement | null) => {
    setTextValue((prevTextValue) => prevTextValue || (node?.textContent ?? "").trim());
  };

  return (
    <SelectItemContextProvider
      scope={props.__scopeSelect}
      value={props.value}
      disabled={props.disabled ?? false}
      textId={textId}
      isSelected={isSelected}
      onItemTextChange={handleItemTextChange}
    >
      <Collection.ItemSlot
        scope={props.__scopeSelect}
        value={props.value}
        disabled={props.disabled ?? false}
        // Passed as a getter: the text is read from the DOM after mount.
        textValue={textValue}
      >
        <Primitive.div
          role="option"
          aria-labelledby={textId}
          data-highlighted={isFocused() ? "" : undefined}
          // `isFocused` caveat fixes stuttering in VoiceOver
          aria-selected={ariaBoolean(isSelected() && isFocused())}
          data-state={isSelected() ? "checked" : "unchecked"}
          aria-disabled={props.disabled ? "true" : undefined}
          data-disabled={props.disabled ? "" : undefined}
          tabindex={props.disabled ? undefined : -1}
          {...rest}
          ref={composedRefs}
          onFocus={composeEventHandlers(
            (event: DivEvent<FocusEvent>) => callEventHandler(rest.onFocus, event),
            () => setIsFocused(true),
          )}
          onBlur={composeEventHandlers(
            (event: DivEvent<FocusEvent>) => callEventHandler(rest.onBlur, event),
            () => setIsFocused(false),
          )}
          onClick={composeEventHandlers(
            (event: DivEvent<MouseEvent>) => callEventHandler(rest.onClick, event),
            (event) => {
              if (props.disabled) {
                return;
              }

              // Open on click when using a touch or pen device
              if (pointerTypeRef.current !== "mouse") {
                handleSelect(event);
              }
            },
          )}
          onPointerUp={composeEventHandlers(
            (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerUp, event),
            (event) => {
              if (props.disabled) {
                return;
              }

              // Using a mouse you should be able to do pointer down, move through
              // the list, and release the pointer over the item to select it.
              if (pointerTypeRef.current === "mouse") {
                handleSelect(event);
              }
            },
          )}
          onPointerDown={composeEventHandlers(
            (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerDown, event),
            (event) => {
              pointerTypeRef.current = event.pointerType;
            },
          )}
          onPointerMove={composeEventHandlers(
            (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerMove, event),
            (event) => {
              // Remember pointer type when sliding over to this item from another one
              pointerTypeRef.current = event.pointerType;
              if (props.disabled) {
                contentContext.onItemLeave?.();
              } else if (pointerTypeRef.current === "mouse") {
                // even though safari doesn't support this option, it's acceptable
                // as it only means it might scroll a few pixels when using the pointer.
                event.currentTarget.focus({ preventScroll: true });
              }
            },
          )}
          onPointerLeave={composeEventHandlers(
            (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerLeave, event),
            (event) => {
              if (event.currentTarget === document.activeElement) {
                contentContext.onItemLeave?.();
              }
            },
          )}
          onKeyDown={composeEventHandlers(
            (event: DivEvent<KeyboardEvent>) => callEventHandler(rest.onKeyDown, event),
            (event) => {
              // Only react to keys originating from the item itself. Focusable
              // descendants (eg. an `input` inside a `Dialog` rendered within
              // the item) bubble their key events here through the event
              // system even when portaled out of the item's DOM subtree.
              // See: https://github.com/radix-ui/primitives/issues/3232
              if (props.disabled || event.target !== event.currentTarget) {
                return;
              }

              const isTypingAhead = contentContext.searchRef?.current !== "";
              if (isTypingAhead && event.key === " ") {
                return;
              }

              if (SELECTION_KEYS.includes(event.key)) {
                handleSelect(event);
              }
              // prevent page scroll if using the space key to select an item
              if (event.key === " ") {
                event.preventDefault();
              }
            },
          )}
        />
      </Collection.ItemSlot>
    </SelectItemContextProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectItemText
 * -----------------------------------------------------------------------------------------------*/

const ITEM_TEXT_NAME = "SelectItemText";

type SelectItemTextElement = HTMLSpanElement;
export type SelectItemTextProps = PrimitiveSpanProps;

const SelectItemText: Component<ScopedProps<SelectItemTextProps>> = (props) => {
  // We ignore `class` and `style` as this part shouldn't be styled.
  const rest = omit(props, "__scopeSelect", "class", "style");
  const context = useSelectContext(ITEM_TEXT_NAME, props.__scopeSelect);
  const contentContext = useSelectContentContext(ITEM_TEXT_NAME, props.__scopeSelect);
  const itemContext = useSelectItemContext(ITEM_TEXT_NAME, props.__scopeSelect);
  const nativeOptionsContext = useSelectNativeOptionsContext(ITEM_TEXT_NAME, props.__scopeSelect);
  const [itemTextNode, setItemTextNode] = createSignal<SelectItemTextElement | null>(null);
  const handleItemTextRefCallback = useCallbackRef((node: SelectItemTextElement | null) =>
    contentContext.itemTextRefCallback?.(node, itemContext.value, itemContext.disabled),
  );
  const composedRefs = useComposedRefs(
    props.ref,
    setItemTextNode,
    itemContext.onItemTextChange,
    handleItemTextRefCallback,
  );

  const textContent = () => itemTextNode()?.textContent;

  // Re-sync the item text once children are inserted: refs fire before text
  // insertion, so the ref-time `onItemTextChange` above captures an empty
  // string. (The `prevTextValue || …` guard keeps an explicit `textValue`.)
  useLayoutEffect(() => {
    const node = itemTextNode();
    if (node) itemContext.onItemTextChange(node);
  });

  // Register this item's native option. Unlike Radix (which memoizes a React
  // element), the option stores a text getter so the bubble input always
  // renders the current text.
  createEffect(
    () => ({
      text: textContent(),
      value: itemContext.value,
      disabled: itemContext.disabled,
    }),
    ({ value, disabled }) => {
      const option: NativeOption = { value, disabled, text: textContent };
      nativeOptionsContext.onNativeOptionAdd(option);
      return () => nativeOptionsContext.onNativeOptionRemove(option);
    },
  );

  const portalTarget = () =>
    itemContext.isSelected() &&
    !context.valueNodeHasChildren() &&
    !shouldShowPlaceholder(context.value())
      ? context.valueNode()
      : null;

  return (
    <>
      <Primitive.span id={itemContext.textId} {...rest} ref={composedRefs} />

      {/* Portal the select item text into the trigger value node.
          When the value is empty we show the placeholder instead, so a
          selected "clear" item (empty value) must not portal its text. */}
      <Show when={portalTarget()} keyed>
        {(node) => <SolidPortal mount={node}>{rest.children}</SolidPortal>}
      </Show>
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const ITEM_INDICATOR_NAME = "SelectItemIndicator";

export type SelectItemIndicatorProps = PrimitiveSpanProps;

const SelectItemIndicator: Component<ScopedProps<SelectItemIndicatorProps>> = (props) => {
  // Always hidden: the indicator is decorative by design.
  const rest = omit(props, "__scopeSelect", "aria-hidden");
  const itemContext = useSelectItemContext(ITEM_INDICATOR_NAME, props.__scopeSelect);
  return (
    <Show when={itemContext.isSelected()}>
      <Primitive.span aria-hidden="true" {...rest} ref={props.ref} />
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectScrollUpButton
 * -----------------------------------------------------------------------------------------------*/

const SCROLL_UP_BUTTON_NAME = "SelectScrollUpButton";

export type SelectScrollUpButtonProps = Omit<SelectScrollButtonImplProps, "onAutoScroll">;

const SelectScrollUpButton: Component<ScopedProps<SelectScrollUpButtonProps>> = (props) => {
  const rest = omit(props, "__scopeSelect");
  const contentContext = useSelectContentContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
  const [canScrollUp, setCanScrollUp] = createSignal(false);
  const composedRefs = useComposedRefs(props.ref, viewportContext.onScrollButtonChange);

  createEffect(
    () => ({
      viewport: contentContext.viewport?.(),
      isPositioned: contentContext.isPositioned?.(),
    }),
    ({ viewport, isPositioned }) => {
      if (viewport && isPositioned) {
        const handleScroll = () => {
          const canScrollUp = viewport.scrollTop > 0;
          setCanScrollUp(canScrollUp);
        };
        handleScroll();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    },
  );

  return (
    <Show when={canScrollUp()}>
      <SelectScrollButtonImpl
        {...rest}
        ref={composedRefs}
        onAutoScroll={() => {
          const viewport = contentContext.viewport?.();
          const selectedItem = contentContext.selectedItem?.();
          if (viewport && selectedItem) {
            viewport.scrollTop = viewport.scrollTop - selectedItem.offsetHeight;
          }
        }}
      />
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectScrollDownButton
 * -----------------------------------------------------------------------------------------------*/

const SCROLL_DOWN_BUTTON_NAME = "SelectScrollDownButton";

export type SelectScrollDownButtonProps = Omit<SelectScrollButtonImplProps, "onAutoScroll">;

const SelectScrollDownButton: Component<ScopedProps<SelectScrollDownButtonProps>> = (props) => {
  const rest = omit(props, "__scopeSelect");
  const contentContext = useSelectContentContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
  const [canScrollDown, setCanScrollDown] = createSignal(false);
  const composedRefs = useComposedRefs(props.ref, viewportContext.onScrollButtonChange);

  createEffect(
    () => ({
      viewport: contentContext.viewport?.(),
      isPositioned: contentContext.isPositioned?.(),
    }),
    ({ viewport, isPositioned }) => {
      if (viewport && isPositioned) {
        const handleScroll = () => {
          const maxScroll = viewport.scrollHeight - viewport.clientHeight;
          // we use Math.ceil here because if the UI is zoomed-in
          // `scrollTop` is not always reported as an integer
          const canScrollDown = Math.ceil(viewport.scrollTop) < maxScroll;
          setCanScrollDown(canScrollDown);
        };
        handleScroll();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    },
  );

  return (
    <Show when={canScrollDown()}>
      <SelectScrollButtonImpl
        {...rest}
        ref={composedRefs}
        onAutoScroll={() => {
          const viewport = contentContext.viewport?.();
          const selectedItem = contentContext.selectedItem?.();
          if (viewport && selectedItem) {
            viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
          }
        }}
      />
    </Show>
  );
};

type SelectScrollButtonImplElement = HTMLDivElement;
interface SelectScrollButtonImplProps extends PrimitiveDivProps {
  onAutoScroll(): void;
}

const SelectScrollButtonImpl: Component<ScopedProps<SelectScrollButtonImplProps>> = (props) => {
  // Always hidden: scroll buttons are decorative by design.
  const rest = omit(props, "__scopeSelect", "onAutoScroll", "aria-hidden");
  const contentContext = useSelectContentContext("SelectScrollButton", props.__scopeSelect);
  const autoScrollTimerRef: { current: number | null } = { current: null };
  const getItems = useCollection(props.__scopeSelect);

  const clearAutoScrollTimer = () => {
    if (autoScrollTimerRef.current !== null) {
      window.clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  };

  onCleanup(() => clearAutoScrollTimer());

  // When the viewport becomes scrollable on either side, the relevant scroll button will mount.
  // Because it is part of the normal flow, it will push down (top button) or shrink (bottom button)
  // the viewport, potentially causing the active item to now be partially out of view.
  // We re-run the `scrollIntoView` logic to make sure it stays within the viewport.
  useLayoutEffect(() => {
    const activeItem = getItems().find((item) => item.ref.current === document.activeElement);
    activeItem?.ref.current?.scrollIntoView({ block: "nearest" });
  });

  return (
    <Primitive.div
      aria-hidden="true"
      {...rest}
      ref={props.ref}
      style={{ "flex-shrink": 0, ...rest.style }}
      onPointerDown={composeEventHandlers(
        (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerDown, event),
        () => {
          if (autoScrollTimerRef.current === null) {
            autoScrollTimerRef.current = window.setInterval(props.onAutoScroll, 50);
          }
        },
      )}
      onPointerMove={composeEventHandlers(
        (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerMove, event),
        () => {
          contentContext.onItemLeave?.();
          if (autoScrollTimerRef.current === null) {
            autoScrollTimerRef.current = window.setInterval(props.onAutoScroll, 50);
          }
        },
      )}
      onPointerLeave={composeEventHandlers(
        (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerLeave, event),
        () => {
          clearAutoScrollTimer();
        },
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectSeparator
 * -----------------------------------------------------------------------------------------------*/

export type SelectSeparatorProps = PrimitiveDivProps;

const SelectSeparator: Component<ScopedProps<SelectSeparatorProps>> = (props) => {
  // Always hidden: the separator is decorative by design.
  const rest = omit(props, "__scopeSelect", "aria-hidden");
  return <Primitive.div aria-hidden="true" {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = "SelectArrow";

export type SelectArrowProps = PopperArrowProps;

const SelectArrow: Component<ScopedProps<SelectArrowProps>> = (props) => {
  const rest = omit(props, "__scopeSelect");
  const popperScope = usePopperScope(props.__scopeSelect);
  const contentContext = useSelectContentContext(ARROW_NAME, props.__scopeSelect);
  return (
    <Show when={contentContext.position === Position.Popper}>
      <PopperPrimitive.Arrow {...popperScope} {...rest} ref={props.ref} />
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SelectBubbleInput
 * -----------------------------------------------------------------------------------------------*/

const BUBBLE_INPUT_NAME = "SelectBubbleInput";

type SelectBubbleInputElement = HTMLSelectElement;
export interface SelectBubbleInputProps extends Omit<
  PrimitivePropsWithRef<"select">,
  "value" | "style"
> {
  style?: JSX.CSSProperties | undefined;
}

const SelectBubbleInput: Component<ScopedProps<SelectBubbleInputProps>> = (props) => {
  // Always hidden: the bubble input is visually hidden by design.
  const rest = omit(props, "__scopeSelect", "aria-hidden");
  const context = useSelectContext(BUBBLE_INPUT_NAME, props.__scopeSelect);
  const selectRef: { current: SelectBubbleInputElement | null } = { current: null };
  const composedRefs = useComposedRefs(props.ref, selectRef);
  const selectValue = () => context.value() ?? "";
  const prevValueRef = { current: selectValue() };
  // The user selection this input last accounted for, so each selection
  // notifies the form once.
  const handledUserSelectionRef: { current: SelectUserSelection | null } = {
    current: context.userSelection(),
  };
  const isDispatchingUserSelectionRef = { current: false };

  // A consumer may render a `Select.Item` with an empty value to act as a
  // "clear" option. In that case it already provides a native `<option>` with
  // an empty value, so we avoid rendering our synthetic placeholder option to
  // prevent duplicate empty options in the native `select`.
  const hasEmptyValueOption = () =>
    context.nativeOptions().some((option) => (option.value ?? "") === "");

  // Bubble value change to parents (e.g form change event)
  createEffect(
    () => ({ value: selectValue(), userSelection: context.userSelection() }),
    ({ value, userSelection }) => {
      const select = selectRef.current;
      if (!select) return;

      const selectProto = window.HTMLSelectElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        selectProto,
        "value",
      ) as PropertyDescriptor;
      const setValue = descriptor.set;

      const isNewUserSelection =
        userSelection !== null && userSelection !== handledUserSelectionRef.current;
      handledUserSelectionRef.current = userSelection;
      const valueChanged = prevValueRef.current !== value;
      prevValueRef.current = value;
      const isUserInteraction = isNewUserSelection && valueChanged;

      if (
        isNewUserSelection &&
        !valueChanged &&
        userSelection.value !== value &&
        !userSelection.hasConsumerStoppedPropagation &&
        setValue
      ) {
        // The user selected a value that a controlled parent hasn't applied
        // yet. Notify the form of the selection now, since applying it later
        // can't be told apart from a programmatic update.
        isDispatchingUserSelectionRef.current = true;
        try {
          setValue.call(select, userSelection.value);
          select.dispatchEvent(new Event("change", { bubbles: true }));
        } finally {
          isDispatchingUserSelectionRef.current = false;
          setValue.call(select, value);
        }
        return;
      }

      // Select dispatches `change` directly. A programmatic update must still
      // sync the native select so form submission sees the value, but the event
      // must not bubble to ancestor `onChange` handlers. User-driven selections
      // bubble unless the consumer already stopped propagation.
      const bubbles = isUserInteraction && !(userSelection?.hasConsumerStoppedPropagation ?? false);
      if (valueChanged && setValue) {
        const event = new Event("change", { bubbles });
        setValue.call(select, value);
        select.dispatchEvent(event);
      }
    },
  );

  // Apply the current value to the native `select` once its `<option>`
  // children exist. Refs fire before children are inserted (so a ref-time set
  // never matches an option and insertion then auto-selects the first one),
  // while this effect runs after the options are in the DOM - matching
  // React's `defaultValue` semantics: establish the selection without binding
  // `value`, which would swallow the programmatic `change` dispatch above.
  // Plain `.value` assignment dispatches no event, so this never double-fires.
  // Tracked on option identity (not just the key): options unregister and
  // re-register across open/close swaps even when the value set is unchanged,
  // and each re-insertion resets the selection to the first option.
  createEffect(
    () => ({ options: context.nativeOptions(), node: selectRef.current }),
    ({ options, node }, prev) => {
      // Re-apply whenever the options were rebuilt or the node itself is new;
      // skip when only the value changed - the bubble effect above owns that
      // sync (with its dispatch semantics).
      if (node && (!prev || prev.options !== options || prev.node !== node)) {
        node.value = selectValue();
      }
    },
  );

  /**
   * We purposefully use a `select` here to support form autofill as much as
   * possible.
   *
   * We purposefully do not add the `value` attribute here to allow the value
   * to be set programmatically and bubble a `change` event for user-driven
   * selections. Adding the `value` will cause the framework to consider the
   * programmatic dispatch a duplicate and it will get swallowed.
   *
   * We use visually hidden styles rather than `display: "none"` because
   * Safari autofill won't work otherwise.
   *
   * The native `select` only associates the correct default value if the
   * corresponding `option` is rendered as a child **at the same time** as
   * itself. Because it might take a few renders for our items to gather the
   * information to build the native `option`(s), we key the `select` to make
   * sure it is rebuilt each time the options change.
   */
  // Solid 2 has no `Key`: a single-item `For` recreates the `select` whenever
  // the key changes, matching the keyed-remount behavior.
  return (
    <For each={[context.nativeSelectKey()]}>
      {() => (
        <Primitive.select
          aria-hidden="true"
          required={context.required}
          tabindex={-1}
          name={context.name}
          autocomplete={context.autoComplete}
          disabled={context.disabled}
          form={context.form}
          onChange={(event) => {
            // A selection the controlled parent hasn't applied must not be
            // applied again here.
            if (!isDispatchingUserSelectionRef.current) {
              context.onValueChange(event.target.value);
            }
          }}
          {...rest}
          style={{ ...VISUALLY_HIDDEN_STYLES, ...rest.style }}
          ref={composedRefs}
        >
          <Show when={shouldShowPlaceholder(context.value()) && !hasEmptyValueOption()}>
            <option value="" />
          </Show>
          <For each={context.nativeOptions()}>
            {(option) => (
              <option value={option.value} disabled={option.disabled}>
                {option.text()}
              </option>
            )}
          </For>
        </Primitive.select>
      )}
    </For>
  );
};

/* -----------------------------------------------------------------------------------------------*/

function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}

function shouldShowPlaceholder(value?: string) {
  return value === "" || value === undefined;
}

function useTypeaheadSearch(onSearchChange: (search: string) => void) {
  const handleSearchChange = useCallbackRef(onSearchChange);
  const searchRef = { current: "" };
  const timerRef: { current: number } = { current: 0 };

  const handleTypeaheadSearch = (key: string) => {
    const search = searchRef.current + key;
    handleSearchChange(search);

    function updateSearch(value: string) {
      searchRef.current = value;
      window.clearTimeout(timerRef.current);
      // Reset `searchRef` 1 second after it was last updated
      if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1000);
    }
    updateSearch(search);
  };

  const resetTypeahead = () => {
    searchRef.current = "";
    window.clearTimeout(timerRef.current);
  };

  onCleanup(() => window.clearTimeout(timerRef.current));

  return [searchRef, handleTypeaheadSearch, resetTypeahead] as const;
}

/**
 * This is the "meat" of the typeahead matching logic. It takes in a list of items,
 * the search and the current item, and returns the next item (or `undefined`).
 *
 * We normalize the search because if a user has repeatedly pressed a character,
 * we want the exact same behavior as if we only had that one character
 * (ie. cycle through items starting with that character)
 *
 * We also reorder the items by wrapping the array around the current item.
 * This is so we always look forward from the current item, and picking the first
 * item will always be the correct one.
 *
 * Finally, if the normalized search is exactly one character, we exclude the
 * current item from the values because otherwise it would be the first to match always
 * and focus would never move. This is as opposed to the regular case, where we
 * don't want focus to move if the current item still matches.
 */
function findNextItem<T extends { textValue: string }>(
  items: T[],
  search: string,
  currentItem?: T,
) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0]! : search;
  const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1;
  let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0));
  const excludeCurrentItem = normalizedSearch.length === 1;
  if (excludeCurrentItem) wrappedItems = wrappedItems.filter((v) => v !== currentItem);
  const nextItem = wrappedItems.find((item) =>
    item.textValue.toLowerCase().startsWith(normalizedSearch.toLowerCase()),
  );
  return nextItem !== currentItem ? nextItem : undefined;
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!);
}

export {
  createSelectScope,
  //
  Select,
  SelectProvider,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
  SelectArrow,
  SelectBubbleInput,
  //
  Select as Root,
  SelectProvider as Provider,
  SelectTrigger as Trigger,
  SelectValue as Value,
  SelectIcon as Icon,
  SelectPortal as Portal,
  SelectContent as Content,
  SelectViewport as Viewport,
  SelectGroup as Group,
  SelectLabel as Label,
  SelectItem as Item,
  SelectItemText as ItemText,
  SelectItemIndicator as ItemIndicator,
  SelectScrollUpButton as ScrollUpButton,
  SelectScrollDownButton as ScrollDownButton,
  SelectSeparator as Separator,
  SelectArrow as Arrow,
  SelectBubbleInput as BubbleInput,
};
