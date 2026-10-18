import { children, createEffect, createSignal, untrack, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useStateMachine } from "./use-state-machine";

interface PresenceProps {
  children: JSX.Element | ((props: { present: () => boolean }) => JSX.Element);
  present: boolean | (() => boolean);
}

const Presence: Component<PresenceProps> = (props) => {
  const presence = usePresence(() =>
    typeof props.present === "function" ? props.present() : props.present,
  );

  // NOTE: `props.children` is a lazy getter - every raw read re-instantiates
  // the subtree, so resolve it exactly once through this memo. Solid's
  // `children()` only unwraps zero-arg thunks, so a render prop (which
  // declares parameters) passes through uncalled and is detected from the
  // resolved value - no speculative read, no orphan instances, no leaked
  // ref calls from discarded setups.
  const resolved = children(() => props.children as JSX.Element);
  // NOTE: dynamic component children also arrive as functions (zero-arg
  // thunks, already unwrapped above), so only functions with declared
  // parameters are render props. (A zero-arg render prop would be resolved
  // as a thunk instead; use a plain element there, since it cannot read
  // presence state anyway.) Invocation is memoized so open/close flips
  // reuse the same instances instead of remounting on every presence change.
  // `present` is passed as an accessor so the invocation stays stable while
  // the value updates reactively.
  const rendered = children(() => {
    const value = resolved();
    return typeof value === "function" && (value as (...args: never[]) => unknown).length > 0
      ? (value as (props: { present: () => boolean }) => JSX.Element)({
          present: () => presence.isPresent(),
        })
      : value;
  });

  // Eager render-prop detection WITHOUT reading `props.children` (a raw read
  // of a lazy getter would instantiate the subtree): value-form children
  // expose `value` on the descriptor, so a function with declared parameters
  // is a render prop. Render-prop children mount while closed (Radix
  // `forceMount` parity - e.g. Select keeps its items mounted in a detached
  // fragment for data collection). Getter-form children keep the lazy
  // detection below. Element children are unaffected either way.
  const childrenDescriptor = Object.getOwnPropertyDescriptor(props, "children");
  const childrenValue =
    childrenDescriptor && "value" in childrenDescriptor ? childrenDescriptor.value : undefined;
  const isRenderProp =
    typeof childrenValue === "function" &&
    (childrenValue as (...args: never[]) => unknown).length > 0;

  // NOTE: the memos stay lazy - resolving while unmounted would
  // instantiate the subtree without inserting it, leaving effects to run on
  // detached DOM. Track reactively so late opens are observed too; the
  // change guard skips the null-blip that would corrupt exit animations.
  let tracked: HTMLElement | null = null;
  createEffect(
    () => (presence.isPresent() ? resolvedSingleElement(rendered.toArray()) : null),
    (node) => {
      if (node !== tracked) {
        tracked = node;
        presence.track(node);
      }
    },
  );

  // NOTE: Radix always mounts render-prop children (`forceMount`), even
  // while closed - the render prop itself decides what `present: false`
  // looks like. Element children unmount when closed instead.
  let detectedRenderProp: boolean | undefined;
  return (
    <>
      {() => {
        if (presence.isPresent()) {
          const content = rendered();
          if (detectedRenderProp === undefined) {
            const value = resolved();
            detectedRenderProp =
              typeof value === "function" && (value as (...args: never[]) => unknown).length > 0;
          }
          return content;
        }
        // Closed: mount render-prop output (eagerly detected above, or lazily
        // once observed while open); element children stay unmounted.
        const renderWhileClosed =
          detectedRenderProp === true || (detectedRenderProp === undefined && isRenderProp);
        return renderWhileClosed ? rendered() : null;
      }}
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * usePresence
 * -----------------------------------------------------------------------------------------------*/

function usePresence(present: boolean | (() => boolean)) {
  const getPresent = typeof present === "function" ? present : () => present;
  const [node, setNode] = createSignal<HTMLElement | null>(null);
  let styles: CSSStyleDeclaration | null = null;
  let prevPresent = untrack(getPresent);
  let prevAnimationName = "none";
  let mountAnimationName: string | undefined = undefined;
  const initialState = untrack(getPresent) ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended",
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted",
    },
    unmounted: {
      MOUNT: "mounted",
    },
  });

  createEffect(
    () => state(),
    (current) => {
      if (current === "mounted") {
        // Use the animation name captured during the layout phase (or the ref
        // callback on first mount). By the time this effect runs, sibling
        // effects may have dirtied body styles, so re-reading from the live
        // CSSStyleDeclaration here would force an expensive synchronous style
        // recalculation.
        // See: https://github.com/radix-ui/primitives/issues/1634
        prevAnimationName = mountAnimationName ?? getAnimationName(styles);
        mountAnimationName = undefined;
      } else {
        prevAnimationName = "none";
      }
    },
  );

  createEffect(
    () => getPresent(),
    (isPresent) => {
      const wasPresent = prevPresent;
      const hasPresentChanged = wasPresent !== isPresent;

      if (hasPresentChanged) {
        const prevName = prevAnimationName;
        const currentAnimationName = getAnimationName(styles);

        if (isPresent) {
          // Capture the animation name now, while styles are still "clean".
          // The state effect above reads from this variable instead of the
          // live CSSStyleDeclaration, avoiding a forced style recalculation.
          mountAnimationName = currentAnimationName;
          send("MOUNT");
        } else if (currentAnimationName === "none" || styles?.display === "none") {
          // If there is no exit animation or the element is hidden, animations won't run
          // so we unmount instantly
          send("UNMOUNT");
        } else {
          /**
           * When `present` changes to `false`, we check changes to animation-name to
           * determine whether an animation has started. We chose this approach (reading
           * computed styles) because there is no `animationrun` event and `animationstart`
           * fires after `animation-delay` has expired which would be too late.
           */
          const isAnimating = prevName !== currentAnimationName;

          if (wasPresent && isAnimating) {
            send("ANIMATION_OUT");
          } else {
            send("UNMOUNT");
          }
        }

        prevPresent = isPresent;
      }
    },
  );

  createEffect(
    () => node(),
    (current) => {
      if (current) {
        const target = current;
        let timeoutId: number | undefined;
        const ownerWindow = target.ownerDocument.defaultView ?? window;
        /**
         * Triggering an ANIMATION_OUT during an ANIMATION_IN will fire an `animationcancel`
         * event for ANIMATION_IN after we have entered `unmountSuspended` state. So, we
         * make sure we only trigger ANIMATION_END for the currently active animation.
         */
        const handleAnimationEnd = (event: AnimationEvent) => {
          const currentAnimationName = getAnimationName(styles);
          // The event.animationName is unescaped for CSS syntax,
          // so we need to escape it to compare with the animationName computed from the style.
          const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
          if (event.target === target && isCurrentAnimation) {
            // With exit animations this keeps the node mounted with the last
            // keyframe's styles until the unmount lands, avoiding a flash of
            // visible content. See https://github.com/radix-ui/primitives/pull/1849
            send("ANIMATION_END");
            if (!untrack(getPresent)) {
              const currentFillMode = target.style.animationFillMode;
              target.style.animationFillMode = "forwards";
              // Reset the style after the node had time to unmount (for cases
              // where the component chooses not to unmount). Doing this any
              // sooner than `setTimeout` (e.g. with `requestAnimationFrame`)
              // still causes a flash.
              timeoutId = ownerWindow.setTimeout(() => {
                if (target.style.animationFillMode === "forwards") {
                  target.style.animationFillMode = currentFillMode;
                }
              });
            }
          }
        };
        const handleAnimationStart = (event: AnimationEvent) => {
          if (event.target === target) {
            // if animation occurred, store its name as the previous animation.
            prevAnimationName = getAnimationName(styles);
          }
        };
        target.addEventListener("animationstart", handleAnimationStart);
        target.addEventListener("animationcancel", handleAnimationEnd);
        target.addEventListener("animationend", handleAnimationEnd);
        return () => {
          if (timeoutId !== undefined) ownerWindow.clearTimeout(timeoutId);
          target.removeEventListener("animationstart", handleAnimationStart);
          target.removeEventListener("animationcancel", handleAnimationEnd);
          target.removeEventListener("animationend", handleAnimationEnd);
        };
      }
      // Transition to the unmounted state if the node is removed prematurely.
      send("ANIMATION_END");
      return;
    },
  );

  function track(tracked: HTMLElement | null) {
    if (tracked) {
      const computed = getComputedStyle(tracked);
      styles = computed;
      // Eagerly read the animation name while styles are clean. This cached
      // value is consumed by the state effect, letting it skip a redundant
      // (and expensive) live-style read.
      mountAnimationName = getAnimationName(computed);
    } else {
      styles = null;
    }
    setNode(() => tracked);
  }

  return {
    isPresent: () => ["mounted", "unmountSuspended"].includes(state()),
    track,
  };
}

/* -----------------------------------------------------------------------------------------------*/

function resolvedSingleElement(nodes: ReadonlyArray<unknown>): HTMLElement | null {
  const elements = nodes.filter((node): node is HTMLElement => node instanceof HTMLElement);
  // Solid control flow (`Show`, keyed branches, `Portal` placeholders) leaves
  // comment anchors and empty text markers behind; React has no equivalent
  // artifacts, so ignore them (Radix tolerates null renders - there is simply
  // nothing to track for exit animations). Anything else that is not the
  // single element is still an error.
  const content = nodes.filter((node) => !isIgnorableMarker(node));
  if (content.length === 0) return null;
  if (elements.length === 1 && content.length === 1) return elements[0]!;
  throw new Error("Presence failed to resolve its child. Expected a single element child.");
}

function isIgnorableMarker(node: unknown): boolean {
  if (
    node === null ||
    node === undefined ||
    node === false ||
    node === true ||
    node instanceof Comment
  ) {
    return true;
  }
  return node instanceof Text && (node.textContent ?? "") === "";
}

function getAnimationName(styles: CSSStyleDeclaration | null) {
  return styles?.animationName || "none";
}

export {
  Presence,
  //
  Presence as Root,
};
export type { PresenceProps };
