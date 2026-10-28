import {
  children,
  createContext,
  createEffect,
  createSignal,
  merge,
  omit,
  onSettled,
  useContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import type { PropsWithoutColor } from "../../helpers/props";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { widgetStackRootPropDefs } from "./widget-stack.props";

/** Imperative navigation controls for the widget stack. */
type WidgetControls = {
  /** Scroll to the next widget. */
  next: () => void;
  /** Scroll to the previous widget. */
  prev: () => void;
  /** Scroll to the widget at the given index. */
  scrollToIndex: (index: number) => void;
} | null;

/** Value shared by the `WidgetStack` compound parts. */
interface WidgetStackContextValue {
  /** Whether the next button is disabled. */
  nextDisabled: () => boolean;
  /** Set the next-disabled flag. */
  setNextDisabled: (disabled: boolean) => void;
  /** Whether the previous button is disabled. */
  prevDisabled: () => boolean;
  /** Set the previous-disabled flag. */
  setPrevDisabled: (disabled: boolean) => void;
  /** Imperative navigation controls (set once the stack mounts). */
  controls: () => WidgetControls;
  /** Set the navigation controls. */
  setControls: (controls: WidgetControls) => void;
  /** Whether autoplay is permanently disabled (set by manual navigation). */
  disableAutoPlay: () => boolean;
  /** Permanently disable autoplay. */
  setDisableAutoPlay: (disabled: boolean) => void;
  /** Index of the currently visible widget. */
  currentWidgetIndex: () => number;
  /** Set the current widget index. */
  setCurrentWidgetIndex: (index: number) => void;
  /** Number of widgets in the stack. */
  widgetsCount: () => number | undefined;
  /** Set the widget count. */
  setWidgetsCount: (count: number) => void;
  /** Stack orientation. */
  orientation: () => "horizontal" | "vertical";
  /** Autoplay interval in ms, when enabled. */
  autoPlay: () => number | undefined;
}

const WidgetStackContext = createContext<WidgetStackContextValue>();

/** Internal context read for compound parts (throws the upstream scope error). */
function _useWidgetStack(): WidgetStackContextValue {
  try {
    return useContext(WidgetStackContext);
  } catch {
    throw new Error("WidgetStackContext must be used within a WidgetStackRoot");
  }
}

/**
 * Reads the `WidgetStack` context: disabled flags, autoplay-disabling
 * navigation controls, the current index, and the widget count. Throws
 * when used outside a `WidgetStack.Root`.
 */
function useWidgetStack() {
  let context: WidgetStackContextValue;
  try {
    context = useContext(WidgetStackContext);
  } catch {
    throw new Error("WidgetStackContext must be used within a WidgetStackRoot");
  }
  return {
    get nextDisabled() {
      return context.nextDisabled();
    },
    get prevDisabled() {
      return context.prevDisabled();
    },
    get controls() {
      const controls = context.controls();
      if (!controls) return null;
      // Manual navigation permanently disables autoplay.
      return {
        prev: () => {
          context.setDisableAutoPlay(true);
          controls.prev();
        },
        next: () => {
          context.setDisableAutoPlay(true);
          controls.next();
        },
        scrollToIndex: (index: number) => {
          context.setDisableAutoPlay(true);
          controls.scrollToIndex(index);
        },
      };
    },
    get currentWidgetIndex() {
      return context.currentWidgetIndex();
    },
    get widgetsCount() {
      return context.widgetsCount();
    },
  };
}

/** Own props of `WidgetStack.Root` derived from the prop defs (orientation). */
type WidgetStackRootOwnProps = GetPropDefTypes<typeof widgetStackRootPropDefs>;

/** Props for `WidgetStack.Root`. */
interface WidgetStackRootProps extends WidgetStackRootOwnProps {
  /** Stack, items, and navigation buttons. */
  children: JSX.Element;
  /** Autoplay interval in ms; when set, the stack advances on a ping-pong loop. */
  autoPlay?: number | undefined;
}

/**
 * Context-only provider for the `WidgetStack` compound (renders no DOM
 * element): owns the navigation controls, the current index, the
 * next/prev disabled flags, and autoplay state.
 *
 * Upstream: `widget-stack.tsx` (`WidgetStackRoot`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const WidgetStackRoot: Component<WidgetStackRootProps> = (props) => {
  const [controls, setControls] = createSignal<WidgetControls>(null);
  const [currentWidgetIndex, setCurrentWidgetIndex] = createSignal(0);
  const [nextDisabled, setNextDisabled] = createSignal(false);
  const [prevDisabled, setPrevDisabled] = createSignal(false);
  const [disableAutoPlay, setDisableAutoPlay] = createSignal(false);
  const [widgetsCount, setWidgetsCount] = createSignal<number | undefined>(0);

  const contextValue: WidgetStackContextValue = {
    nextDisabled,
    setNextDisabled,
    prevDisabled,
    setPrevDisabled,
    controls,
    setControls,
    disableAutoPlay,
    setDisableAutoPlay,
    currentWidgetIndex,
    setCurrentWidgetIndex,
    widgetsCount,
    setWidgetsCount,
    orientation: () => props.orientation ?? widgetStackRootPropDefs.orientation.default,
    autoPlay: () => props.autoPlay,
  };

  return <WidgetStackContext value={contextValue}>{props.children}</WidgetStackContext>;
};

/** Slot typed for `WidgetStackStack` div props. */
const StackSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "WidgetStackStack",
);
/** Slottable selecting the element-form `render` target for child injection. */
const StackSlottable = createSlottable("WidgetStackStack");

/**
 * `render` prop accepted by `WidgetStack.Stack`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props.
 */
type WidgetStackStackRenderProp = JSX.Element | ((props: PropsWithoutColor<"div">) => JSX.Element);

/** Props for `WidgetStack.Stack`. */
interface WidgetStackStackProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: WidgetStackStackRenderProp | undefined;
}

/**
 * The scrollable widget viewport: builds the navigation controls,
 * runs autoplay, tracks per-item intersection ratios for the stack
 * effects, and drives the next/prev disabled flags.
 *
 * Upstream: `widget-stack.tsx` (`WidgetStackStack`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const WidgetStackStack: Component<WidgetStackStackProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "onMouseEnter", "onMouseLeave");
  const composedRefs = composeRefs(props.ref);
  const {
    currentWidgetIndex,
    orientation,
    setCurrentWidgetIndex,
    setControls,
    setNextDisabled,
    setPrevDisabled,
    autoPlay,
    disableAutoPlay,
    setWidgetsCount,
    controls,
  } = _useWidgetStack();
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  let scrollAreaElement: HTMLDivElement | null = null;

  // Widget count from the resolved children (upstream `Children.toArray`
  // parity: arrays count truthy entries, single children count one).
  createEffect(
    () => resolved(),
    (value) => {
      const count = Array.isArray(value)
        ? value.filter(Boolean).length
        : value === undefined || value === null || value === false
          ? 0
          : 1;
      setWidgetsCount(count);
    },
  );

  // Latest index for the autoplay tick (plain variable synced by effect,
  // upstream ref parity).
  let latestIndex = 0;
  createEffect(
    () => currentWidgetIndex(),
    (index) => {
      latestIndex = index;
    },
  );

  // Build the navigation controls. The scrollable items are captured once
  // per orientation change, matching upstream.
  createEffect(
    () => orientation(),
    (o) => {
      const scrollArea = scrollAreaElement;
      if (!scrollArea) return;
      const items = [...scrollArea.children] as HTMLElement[];

      // ScrollIntoView animation is interrupted in Chrome when a prev/next
      // button click triggers the animation and turns disabled, so
      // scrollBy is used instead.
      const dir = o === "vertical" ? "top" : "left";
      const scrollTo = (target: HTMLElement | undefined) => {
        if (!target) return;
        const targetRect = target.getBoundingClientRect();
        const scrollAreaRect = scrollArea.getBoundingClientRect();
        const distance = targetRect[dir] - scrollAreaRect[dir];
        scrollArea.scrollBy({ [dir]: distance, behavior: "smooth" });
      };
      setControls({
        next: () => scrollTo(items[latestIndex + 1]),
        prev: () => scrollTo(items[latestIndex - 1]),
        scrollToIndex: (index: number) => scrollTo(items[index]),
      });
    },
  );

  const [isHovering, setIsHovering] = createSignal(false);

  // Autoplay ping-pong loop. Pauses on hover and stops permanently once
  // manual navigation disables it.
  let direction: "forward" | "backward" = "forward";
  createEffect(
    () => ({
      interval: autoPlay(),
      hovering: isHovering(),
      disabled: disableAutoPlay(),
    }),
    ({ interval, hovering, disabled }) => {
      if (!interval || disabled || hovering) return;
      const scrollArea = scrollAreaElement;
      if (!scrollArea) return;

      const id = setInterval(() => {
        if (disableAutoPlay()) return;
        const area = scrollAreaElement;
        if (!area) return;
        const items = [...area.children];

        const nextIndex = direction === "forward" ? latestIndex + 1 : latestIndex - 1;
        if (nextIndex < 0) {
          direction = "forward";
        } else if (nextIndex >= items.length) {
          direction = "backward";
        }
        if (direction === "forward") {
          controls()?.next();
        } else {
          controls()?.prev();
        }
      }, interval);

      return () => clearInterval(id);
    },
  );

  // Per-item intersection ratios for the stack visuals, refreshed on scroll.
  createEffect(
    () => {
      resolved();
      return orientation();
    },
    (o) => {
      const scrollArea = scrollAreaElement;
      if (!scrollArea) return;

      const updateIntersectionRatios = () => {
        const items = [...scrollArea.children] as HTMLElement[];
        for (const item of items) {
          const targetScrollPosition = o === "vertical" ? item.offsetTop : item.offsetLeft;
          // Upstream parity: the ratio always normalizes by height, even
          // for horizontal stacks.
          const itemHeight = item.clientHeight;
          const scrollPosition = o === "vertical" ? scrollArea.scrollTop : scrollArea.scrollLeft;
          const dist = Math.abs(targetScrollPosition - scrollPosition);
          const ratio = 1 - Math.min(dist / itemHeight, 1);
          item.style.setProperty("--intersection-ratio", ratio.toString());
        }
      };

      updateIntersectionRatios();
      scrollArea.addEventListener("scroll", updateIntersectionRatios, { passive: true });
      return () => scrollArea.removeEventListener("scroll", updateIntersectionRatios);
    },
  );

  // Next/prev button states from item visibility.
  createEffect(
    () => resolved(),
    () => {
      const scrollArea = scrollAreaElement;
      if (!scrollArea) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const items = [...scrollArea.children];
            const index = items.indexOf(entry.target as HTMLElement);
            if (index === 0) {
              setPrevDisabled(true);
              if (items.length > 1) {
                setNextDisabled(false);
              }
            } else if (index === items.length - 1) {
              setNextDisabled(true);
              if (items.length > 1) {
                setPrevDisabled(false);
              }
            } else {
              setNextDisabled(false);
              setPrevDisabled(false);
            }
            setCurrentWidgetIndex(index);
          }
        },
        { root: scrollArea, rootMargin: "0px", threshold: 0.5 },
      );

      for (const child of scrollArea.children) {
        observer.observe(child);
      }
      return () => observer.disconnect();
    },
  );

  const onMouseEnter = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onMouseEnter, event),
    () => setIsHovering(true),
  );
  const onMouseLeave = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onMouseLeave, event),
    () => setIsHovering(false),
  );

  const classes = () => cx("fui-WidgetStackStack", props.class);

  const scrollArea = () => (
    <div
      class="fui-WidgetStackScrollArea"
      data-orientation={orientation()}
      ref={(el) => {
        scrollAreaElement = el;
      }}
    >
      {resolved()}
    </div>
  );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get onMouseEnter() {
        return onMouseEnter;
      },
      get onMouseLeave() {
        return onMouseLeave;
      },
      get children() {
        return scrollArea();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as PropsWithoutColor<"div">);
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the scroll area renders inside it.
    return (
      <StackSlot
        {...rest}
        class={classes()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={composedRefs}
      >
        <StackSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : scrollArea())}
        </StackSlottable>
      </StackSlot>
    );
  }

  return (
    <div
      {...rest}
      class={classes()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={composedRefs}
    >
      {scrollArea()}
    </div>
  );
};

const WidgetStackItemContext = createContext<{ isFullyVisible: () => boolean }>();

/**
 * Reads whether the surrounding `WidgetStack.Item` is fully visible.
 * Throws when used outside a `WidgetStack.Item`.
 */
function useWidgetStackItem() {
  try {
    return useContext(WidgetStackItemContext);
  } catch {
    throw new Error("WidgetStackItemContext must be used within a WidgetStackItem");
  }
}

/** Props for `WidgetStack.Item`. */
interface WidgetStackItemProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered item element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * One widget slide. Tracks full visibility with an `IntersectionObserver`,
 * hides non-visible slides from assistive technology with `inert`, and
 * exposes the visibility through `useWidgetStackItem`.
 *
 * Upstream: `widget-stack.tsx` (`WidgetStackItem`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const WidgetStackItem: Component<WidgetStackItemProps> = (props) => {
  const rest = omit(props, "children", "class", "ref");

  let widgetElement: HTMLDivElement | null = null;
  const composedRefs = composeRefs((node: HTMLDivElement | null) => {
    widgetElement = node;
  }, props.ref);
  const [isFullyVisible, setIsFullyVisible] = createSignal(false);

  // Observed once on mount: the watched node is the item itself, which is
  // stable regardless of children changes.
  onSettled(() => {
    const widget = widgetElement;
    const stack = widget?.parentElement;
    if (!stack || !widget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsFullyVisible(entry.intersectionRatio === 1);
        }
      },
      { root: stack, rootMargin: "0px", threshold: [0, 1] },
    );
    observer.observe(widget);
    return () => observer.disconnect();
  });

  return (
    <WidgetStackItemContext value={{ isFullyVisible }}>
      <div
        {...rest}
        ref={composedRefs}
        class={cx("fui-WidgetStackItem", props.class)}
        role="group"
        aria-roledescription="slide"
        data-fully-visible={isFullyVisible() ? "true" : undefined}
        inert={!isFullyVisible()}
      >
        {/*
         * Raw single children read (never a `children()` memo): the memo
         * would instantiate consumers in setup scope, above the item
         * provider, and they would miss the visibility context.
         */}
        <div class="fui-WidgetStackItemContent">{props.children}</div>
      </div>
    </WidgetStackItemContext>
  );
};

/** Slot typed for `WidgetStackNext` button props. */
const NextSlot = createSlot<
  HTMLButtonElement,
  Omit<PropsWithoutColor<"button">, "children" | "ref">
>("WidgetStackNext");
/** Slottable selecting the element-form `render` target for child injection. */
const NextSlottable = createSlottable("WidgetStackNext");

/**
 * `render` prop accepted by `WidgetStack.Next`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props.
 */
type WidgetStackNextRenderProp =
  | JSX.Element
  | ((props: PropsWithoutColor<"button">) => JSX.Element);

/** Props for `WidgetStack.Next`. */
interface WidgetStackNextProps extends Omit<
  PropsWithoutColor<"button">,
  "disabled" | "onClick" | "ref"
> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: WidgetStackNextRenderProp | undefined;
  /** Click handler; runs before the built-in navigation. */
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined;
}

/**
 * Advances the stack to the next widget. Disabled at the end; manual
 * navigation permanently disables autoplay.
 *
 * Upstream: `widget-stack.tsx` (`WidgetStackNext`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const WidgetStackNext: Component<WidgetStackNextProps> = (props) => {
  const rest = omit(props, "children", "ref", "render", "onClick");
  const composedRefs = composeRefs(props.ref);
  // No destructuring: the hook exposes getters, and destructuring would
  // freeze them at setup values (controls arrive after the stack mounts).
  const stack = useWidgetStack();
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const onClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => stack.controls?.next(),
  );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get disabled() {
        return stack.nextDisabled;
      },
      get "data-disabled"() {
        return stack.nextDisabled || undefined;
      },
      get onClick() {
        return onClick;
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as PropsWithoutColor<"button">);
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <NextSlot
        {...rest}
        disabled={stack.nextDisabled}
        data-disabled={stack.nextDisabled || undefined}
        onClick={onClick}
        ref={composedRefs}
      >
        <NextSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </NextSlottable>
      </NextSlot>
    );
  }

  return (
    <button
      {...rest}
      disabled={stack.nextDisabled}
      data-disabled={stack.nextDisabled || undefined}
      onClick={onClick}
      ref={composedRefs}
    >
      {resolved()}
    </button>
  );
};

/** Slot typed for `WidgetStackPrev` button props. */
const PrevSlot = createSlot<
  HTMLButtonElement,
  Omit<PropsWithoutColor<"button">, "children" | "ref">
>("WidgetStackPrev");
/** Slottable selecting the element-form `render` target for child injection. */
const PrevSlottable = createSlottable("WidgetStackPrev");

/**
 * `render` prop accepted by `WidgetStack.Prev`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props.
 */
type WidgetStackPrevRenderProp =
  | JSX.Element
  | ((props: PropsWithoutColor<"button">) => JSX.Element);

/** Props for `WidgetStack.Prev`. */
interface WidgetStackPrevProps extends Omit<
  PropsWithoutColor<"button">,
  "disabled" | "onClick" | "ref"
> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: WidgetStackPrevRenderProp | undefined;
  /** Click handler; runs before the built-in navigation. */
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined;
}

/**
 * Moves the stack to the previous widget. Disabled at the start; manual
 * navigation permanently disables autoplay.
 *
 * Upstream: `widget-stack.tsx` (`WidgetStackPrev`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const WidgetStackPrev: Component<WidgetStackPrevProps> = (props) => {
  const rest = omit(props, "children", "ref", "render", "onClick");
  const composedRefs = composeRefs(props.ref);
  // No destructuring: the hook exposes getters, and destructuring would
  // freeze them at setup values (controls arrive after the stack mounts).
  const stack = useWidgetStack();
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const onClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => stack.controls?.prev(),
  );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get disabled() {
        return stack.prevDisabled;
      },
      get "data-disabled"() {
        return stack.prevDisabled || undefined;
      },
      get onClick() {
        return onClick;
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as PropsWithoutColor<"button">);
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <PrevSlot
        {...rest}
        disabled={stack.prevDisabled}
        data-disabled={stack.prevDisabled || undefined}
        onClick={onClick}
        ref={composedRefs}
      >
        <PrevSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </PrevSlottable>
      </PrevSlot>
    );
  }

  return (
    <button
      {...rest}
      disabled={stack.prevDisabled}
      data-disabled={stack.prevDisabled || undefined}
      onClick={onClick}
      ref={composedRefs}
    >
      {resolved()}
    </button>
  );
};

/** Frosted widget-stack namespace, matching the upstream `* as WidgetStack`. */
const WidgetStack = {
  Root: WidgetStackRoot,
  Stack: WidgetStackStack,
  Item: WidgetStackItem,
  Next: WidgetStackNext,
  Prev: WidgetStackPrev,
};

export {
  useWidgetStack,
  useWidgetStackItem,
  WidgetStack,
  WidgetStackItem,
  WidgetStackNext,
  WidgetStackPrev,
  WidgetStackRoot,
  WidgetStackStack,
};
export type {
  WidgetControls,
  WidgetStackContextValue,
  WidgetStackItemProps,
  WidgetStackNextProps,
  WidgetStackNextRenderProp,
  WidgetStackPrevProps,
  WidgetStackPrevRenderProp,
  WidgetStackRootOwnProps,
  WidgetStackRootProps,
  WidgetStackStackProps,
  WidgetStackStackRenderProp,
};
