import { createEffect, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Slot } from "@solidix/slot";
import { composeRefs, type Ref, type RefObject } from "@solidix/compose-refs";

/**
 * Removes the page scrollbar and contains scroll within the lock.
 *
 * Port of `react-remove-scroll` (minus its SSR sidecar medium, which Solid
 * doesn't need — the lock is purely client-side here). The scroll-decision
 * logic (`handleScroll`, `locationCouldBeScrolled`), the style singleton, the
 * `data-scroll-locked` counter, and the document listener lifecycle match the
 * original. Callback indirection the original needs for fresh React closures
 * (`setCallbacks`, `lastProps`) is intentionally dropped: Solid closures read
 * reactive state lazily.
 */

export type RemoveScrollShard = { current: HTMLElement | null } | HTMLElement | null | undefined;

export type RemoveScrollProps = {
  asChild?: boolean | undefined;
  children?: JSX.Element | undefined;
  class?: string | undefined;
  style?: JSX.CSSProperties | string | undefined;
  ref?: Ref<HTMLElement> | undefined;
  /**
   * Switches the behavior of the component on/off.
   * @defaultValue true
   */
  enabled?: boolean | undefined;
  /**
   * Controls the body scroll bar removal.
   * @defaultValue true
   */
  removeScrollBar?: boolean | undefined;
  /**
   * Elements (or refs to elements) that are considered part of the lock even
   * though they render outside of it, e.g. portalled branches.
   */
  shards?: RemoveScrollShard[] | undefined;
  /**
   * Prevents `position="relative"` being set on the body.
   * @defaultValue false
   */
  noRelative?: boolean | undefined;
  /**
   * Disables "event isolation" (suppressing of events happening outside of the lock).
   * @defaultValue false
   */
  noIsolation?: boolean | undefined;
  /**
   * Enables complete lock isolation using `pointer-events: none` for anything
   * outside the lock.
   * @defaultValue false
   */
  inert?: boolean | undefined;
  /**
   * Allows pinch-zoom, however might work not perfectly for normal scroll.
   */
  allowPinchZoom?: boolean | undefined;
  gapMode?: "margin" | "padding" | undefined;
};

type Axis = "v" | "h";

const lockAttribute = "data-scroll-locked";
const zeroRightClassName = "right-scroll-bar-position";
const fullWidthClassName = "width-before-scroll-bar";
const noScrollbarsClassName = "with-scroll-bars-hidden";
const removedBarSizeVariable = "--removed-body-scroll-bar-size";

const zeroGap = { left: 0, top: 0, right: 0, gap: 0 };

function parse(value: string | null): number {
  return parseInt(value || "", 10) || 0;
}

function getGapWidth(gapMode: "margin" | "padding" = "margin") {
  if (typeof window === "undefined") {
    return zeroGap;
  }
  const cs = window.getComputedStyle(document.body);
  const left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  const top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
  const right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
  const offsets = [parse(left), parse(top), parse(right)];
  const documentWidth = document.documentElement.clientWidth;
  const windowWidth = window.innerWidth;
  return {
    left: offsets[0]!,
    top: offsets[1]!,
    right: offsets[2]!,
    gap: Math.max(0, windowWidth - documentWidth + offsets[2]! - offsets[0]!),
  };
}

function getStyles(
  gap: { left: number; top: number; right: number; gap: number },
  allowRelative: boolean,
  gapMode: "margin" | "padding" = "margin",
  important: string,
): string {
  const { left, top, right, gap: gapValue } = gap;
  return `
  .${noScrollbarsClassName} {
   overflow: hidden ${important};
   padding-right: ${gapValue}px ${important};
  }
  body[${lockAttribute}] {
    overflow: hidden ${important};
    overscroll-behavior: contain;
    ${[
      allowRelative && `position: relative ${important};`,
      gapMode === "margin" &&
        `
    padding-left: ${left}px;
    padding-top: ${top}px;
    padding-right: ${right}px;
    margin-left:0;
    margin-top:0;
    margin-right: ${gapValue}px ${important};
    `,
      gapMode === "padding" && `padding-right: ${gapValue}px ${important};`,
    ]
      .filter(Boolean)
      .join("")}
  }

  .${zeroRightClassName} {
    right: ${gapValue}px ${important};
  }

  .${fullWidthClassName} {
    margin-right: ${gapValue}px ${important};
  }

  .${zeroRightClassName} .${zeroRightClassName} {
    right: 0 ${important};
  }

  .${fullWidthClassName} .${fullWidthClassName} {
    margin-right: 0 ${important};
  }

  body[${lockAttribute}] {
    ${removedBarSizeVariable}: ${gapValue}px;
  }
`;
}

function getCurrentUseCounter(): number {
  const counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
  return isFinite(counter) ? counter : 0;
}

// Only the first mounted lock's measured styles are applied (matching
// `react-style-singleton`'s first-wins behavior); the tag is removed once the
// last lock unmounts.
let lockStyleElement: HTMLStyleElement | null = null;
let lockStyleCount = 0;

function addLockStyle(css: string): () => void {
  if (typeof document === "undefined") return () => {};
  if (!lockStyleElement) {
    lockStyleElement = document.createElement("style");
    lockStyleElement.setAttribute("data-solidix", "remove-scroll-bar");
    lockStyleElement.textContent = css;
    document.head.appendChild(lockStyleElement);
  }
  lockStyleCount++;
  return () => {
    lockStyleCount--;
    if (lockStyleCount <= 0 && lockStyleElement) {
      lockStyleElement.remove();
      lockStyleElement = null;
      lockStyleCount = 0;
    }
  };
}

function addLockAttribute(): () => void {
  document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
  return () => {
    const newCounter = getCurrentUseCounter() - 1;
    if (newCounter <= 0) {
      document.body.removeAttribute(lockAttribute);
    } else {
      document.body.setAttribute(lockAttribute, newCounter.toString());
    }
  };
}

let passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    const options = Object.defineProperty({}, "passive", {
      get() {
        passiveSupported = true;
        return true;
      },
    });
    // @ts-expect-error — feature-detecting passive listener support
    window.addEventListener("test", options, options);
    // @ts-expect-error — feature-detecting passive listener support
    window.removeEventListener("test", options, options);
  } catch {
    passiveSupported = false;
  }
}
const nonPassive: AddEventListenerOptions | boolean = passiveSupported ? { passive: false } : false;

function getTouchXY(event: TouchEvent | WheelEvent): [number, number] {
  return "changedTouches" in event
    ? [event.changedTouches[0]!.clientX, event.changedTouches[0]!.clientY]
    : [0, 0];
}

function getDeltaXY(event: WheelEvent): [number, number] {
  return [event.deltaX, event.deltaY];
}

function extractRef(ref: RemoveScrollShard): HTMLElement | null | undefined {
  return ref && "current" in ref ? ref.current : ref;
}

function deltaCompare(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function alwaysContainsScroll(node: Element): boolean {
  // textarea will always _contain_ scroll inside self. It only can be hidden
  return node.tagName === "TEXTAREA";
}

function elementCanBeScrolled(node: EventTarget | null, overflow: "overflowX" | "overflowY") {
  if (!(node instanceof Element)) {
    return false;
  }
  const styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" &&
    // contains scroll inside self
    !(
      styles.overflowY === styles.overflowX &&
      !alwaysContainsScroll(node) &&
      styles[overflow] === "visible"
    )
  );
}

function elementCouldBeScrolled(axis: Axis, node: EventTarget | null): boolean {
  return axis === "v"
    ? elementCanBeScrolled(node, "overflowY")
    : elementCanBeScrolled(node, "overflowX");
}

function locationCouldBeScrolled(axis: Axis, node: EventTarget | null): boolean {
  const element = node as Element | null;
  const ownerDocument = element?.ownerDocument;
  let current: EventTarget | null = node;
  do {
    // Skip over shadow root
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    const isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      const [, scroll, capacity] = getScrollVariables(axis, current as HTMLElement);
      if (scroll > capacity) {
        return true;
      }
    }
    current = (current as Node | null)?.parentNode ?? null;
  } while (current && current !== ownerDocument?.body);
  return false;
}

function getScrollVariables(
  axis: Axis,
  node: HTMLElement,
): [position: number, scroll: number, capacity: number] {
  return axis === "v"
    ? [node.scrollTop, node.scrollHeight, node.clientHeight]
    : [node.scrollLeft, node.scrollWidth, node.clientWidth];
}

function getDirectionFactor(axis: Axis, direction: string): number {
  /**
   * If the element's direction is rtl (right-to-left), then scrollLeft is 0 when the scrollbar is at its rightmost position,
   * and then increasingly negative as you scroll towards the end of the content.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
   */
  return axis === "h" && direction === "rtl" ? -1 : 1;
}

function handleScroll(
  axis: Axis,
  endTarget: HTMLElement,
  event: WheelEvent | TouchEvent,
  sourceDelta: number,
  noOverscroll: boolean,
): boolean {
  const directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  const delta = directionFactor * sourceDelta;
  // find scrollable target
  const target = event.target as HTMLElement | null;
  const targetInLock = !!target && endTarget.contains(target);
  let shouldCancelScroll = false;
  const isDeltaPositive = delta > 0;
  let availableScroll = 0;
  let availableScrollTop = 0;
  let current: HTMLElement | null = target;
  do {
    if (!current) {
      break;
    }
    const [position, scroll, capacity] = getScrollVariables(axis, current);
    const elementScroll = scroll - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, current)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    const parent = current.parentNode;
    // we will "bubble" from ShadowDom in case we are, or just to the parent in normal case
    current = (
      parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        ? (parent as ShadowRoot).host
        : parent
    ) as HTMLElement | null;
  } while (
    // portaled content
    (!targetInLock && current !== document.body) ||
    // self content
    (targetInLock && (endTarget.contains(current) || endTarget === current))
  );
  // handle epsilon around 0 (non standard zoom levels)
  if (
    isDeltaPositive &&
    ((noOverscroll && Math.abs(availableScroll) < 1) || (!noOverscroll && delta > availableScroll))
  ) {
    shouldCancelScroll = true;
  } else if (
    !isDeltaPositive &&
    ((noOverscroll && Math.abs(availableScrollTop) < 1) ||
      (!noOverscroll && -delta > availableScrollTop))
  ) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
}

function getOutermostShadowParent(node: EventTarget | null): EventTarget | null {
  let shadowParent: EventTarget | null = null;
  let current: (EventTarget & Partial<Node>) | null = node;
  while (current !== null) {
    if (current instanceof ShadowRoot) {
      shadowParent = current.host;
      current = current.host;
    }
    current = current.parentNode ?? null;
  }
  return shadowParent;
}

let idCounter = 0;
let lockStack: Array<object> = [];

type PreventQueueEntry = {
  name: string;
  delta: [number, number];
  target: EventTarget | null;
  should: boolean;
  shadowParent: EventTarget | null;
};

const RemoveScroll: Component<RemoveScrollProps> = (props) => {
  const rest = omit(
    props,
    "asChild",
    "children",
    "class",
    "style",
    "ref",
    "enabled",
    "removeScrollBar",
    "shards",
    "noRelative",
    "noIsolation",
    "inert",
    "allowPinchZoom",
    "gapMode",
  );
  const enabled = () => props.enabled ?? true;
  const removeScrollBar = () => props.removeScrollBar ?? true;
  const lockRef: RefObject<HTMLElement | null> = { current: null };
  const lockToken = {};
  const id = idCounter++;

  const shouldPreventQueue: PreventQueueEntry[] = [];
  let touchStart: [number, number] = [0, 0];
  let activeAxis: Axis | undefined;

  const generateStyle = (styleId: number) =>
    `\n  .block-interactivity-${styleId} {pointer-events: none;}\n  .allow-interactivity-${styleId} {pointer-events: all;}\n`;

  function shouldCancelEvent(event: WheelEvent | TouchEvent, parent: HTMLElement | null): boolean {
    if (
      ("touches" in event && event.touches.length === 2) ||
      (event.type === "wheel" && (event as WheelEvent).ctrlKey)
    ) {
      return !props.allowPinchZoom;
    }
    const touch = getTouchXY(event);
    const [startX, startY] = touchStart;
    const deltaX = "deltaX" in event ? event.deltaX : startX - touch[0];
    const deltaY = "deltaY" in event ? event.deltaY : startY - touch[1];
    let currentAxis: Axis | undefined;
    const target = event.target as Element | null;
    const moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    // allow horizontal touch move on Range inputs. They will not cause any scroll
    if (
      "touches" in event &&
      moveDirection === "h" &&
      target instanceof HTMLInputElement &&
      target.type === "range"
    ) {
      return false;
    }
    // allow drag selection (iOS); check if selection's anchorNode is the same as target or contains target
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    const isTouchingSelection = anchorNode
      ? anchorNode === target || anchorNode.contains(target as Node | null)
      : false;
    if (isTouchingSelection) {
      return false;
    }
    const canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      // other axis might be not scrollable
    }
    if (!currentAxis) {
      return true;
    }
    if (!activeAxis && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    const cancelingAxis = activeAxis || currentAxis;
    return handleScroll(
      cancelingAxis,
      parent as HTMLElement,
      event,
      cancelingAxis === "h" ? deltaX : deltaY,
      true,
    );
  }

  function shouldPrevent(event: WheelEvent | TouchEvent): void {
    if (!lockStack.length || lockStack[lockStack.length - 1] !== lockToken) {
      // not the last active
      return;
    }
    const delta =
      "deltaY" in event ? getDeltaXY(event as WheelEvent) : getTouchXY(event as TouchEvent);
    const sourceEvent = shouldPreventQueue.filter(
      (entry) =>
        entry.name === event.type &&
        (entry.target === event.target || event.target === entry.shadowParent) &&
        deltaCompare(entry.delta, delta),
    )[0];
    // self event, and should be canceled
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    // outside or shard event
    if (!sourceEvent) {
      const shardNodes = (props.shards || [])
        .map(extractRef)
        .filter((node): node is HTMLElement => !!node)
        .filter((node) => node.contains(event.target as Node | null));
      const shouldStop =
        shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]!) : !props.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }

  function shouldCancel(
    name: string,
    delta: [number, number],
    target: EventTarget | null,
    should: boolean,
  ): void {
    const entry: PreventQueueEntry = {
      name,
      delta,
      target,
      should,
      shadowParent: getOutermostShadowParent(target),
    };
    shouldPreventQueue.push(entry);
    setTimeout(() => {
      const index = shouldPreventQueue.indexOf(entry);
      if (index !== -1) shouldPreventQueue.splice(index, 1);
    }, 1);
  }

  function scrollTouchStart(event: TouchEvent): void {
    touchStart = getTouchXY(event);
    activeAxis = undefined;
  }

  function scrollWheel(event: WheelEvent): void {
    if (!enabled()) return;
    shouldCancel(
      event.type,
      getDeltaXY(event),
      event.target,
      shouldCancelEvent(event, lockRef.current),
    );
  }

  function scrollTouchMove(event: TouchEvent): void {
    if (!enabled()) return;
    shouldCancel(
      event.type,
      getTouchXY(event),
      event.target,
      shouldCancelEvent(event, lockRef.current),
    );
  }

  // Container capture listeners attach via the ref callback (synchronous and
  // order-independent), rather than through a mount effect, so they are always
  // in place before the document listeners can observe anything.
  let attachedNode: HTMLElement | null = null;
  function detachContainerListeners(): void {
    if (!attachedNode) return;
    attachedNode.removeEventListener("scroll", scrollWheel as EventListener, true);
    attachedNode.removeEventListener("wheel", scrollWheel as EventListener, true);
    attachedNode.removeEventListener("touchmove", scrollTouchMove as EventListener, true);
    attachedNode = null;
  }
  const handleLockRef = (node: HTMLElement | null) => {
    detachContainerListeners();
    lockRef.current = node;
    if (node) {
      node.addEventListener("scroll", scrollWheel as EventListener, true);
      node.addEventListener("wheel", scrollWheel as EventListener, true);
      node.addEventListener("touchmove", scrollTouchMove as EventListener, true);
      attachedNode = node;
    }
  };
  const composedRefs = composeRefs(props.ref, handleLockRef);

  createEffect(
    () => enabled(),
    (isEnabled) => {
      if (!isEnabled || typeof document === "undefined") return;
      lockStack.push(lockToken);
      const preventListener = shouldPrevent as EventListener;
      const touchStartListener = scrollTouchStart as EventListener;
      document.addEventListener("wheel", preventListener, nonPassive);
      document.addEventListener("touchmove", preventListener, nonPassive);
      document.addEventListener("touchstart", touchStartListener, nonPassive);
      return () => {
        lockStack = lockStack.filter((token) => token !== lockToken);
        document.removeEventListener("wheel", preventListener, nonPassive);
        document.removeEventListener("touchmove", preventListener, nonPassive);
        document.removeEventListener("touchstart", touchStartListener, nonPassive);
      };
    },
  );

  createEffect(
    () => enabled() && removeScrollBar(),
    (shouldLock) => {
      if (!shouldLock || typeof document === "undefined") return;
      const gap = getGapWidth(props.gapMode);
      const releaseStyle = addLockStyle(
        getStyles(gap, !props.noRelative, props.gapMode, "!important"),
      );
      const releaseAttribute = addLockAttribute();
      return () => {
        releaseStyle();
        releaseAttribute();
      };
    },
  );

  createEffect(
    () => ({ on: enabled() && !!props.inert, shards: props.shards }),
    ({ on }) => {
      if (!on || typeof document === "undefined") return;
      document.body.classList.add(`block-interactivity-${id}`);
      const styleElement = document.createElement("style");
      styleElement.textContent = generateStyle(id);
      document.head.appendChild(styleElement);
      const allowed = [lockRef.current, ...(props.shards || []).map(extractRef)].filter(
        (node): node is HTMLElement => !!node,
      );
      for (const element of allowed) element.classList.add(`allow-interactivity-${id}`);
      return () => {
        document.body.classList.remove(`block-interactivity-${id}`);
        for (const element of allowed) element.classList.remove(`allow-interactivity-${id}`);
        styleElement.remove();
      };
    },
  );

  if (props.asChild) {
    return (
      <Slot {...rest} class={props.class} style={props.style} ref={composedRefs}>
        {props.children as JSX.Element}
      </Slot>
    );
  }

  return (
    <div {...rest} class={props.class} style={props.style} ref={composedRefs}>
      {props.children}
    </div>
  );
};

const RemoveScrollWithClassNames = Object.assign(RemoveScroll, {
  classNames: { fullWidth: fullWidthClassName, zeroRight: zeroRightClassName },
});

export { RemoveScrollWithClassNames as RemoveScroll };
