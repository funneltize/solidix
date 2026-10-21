// Velocity-aware swipe gestures: pointer tracking with touch/mouse support,
// displacement + flick-velocity release decisions, and CSS-animated settle.
// Live feedback writes `transform` directly (no reactive churn); the browser
// animates the settle, so no rAF loop is needed.
import { createSignal, getOwner, onCleanup, type Accessor } from "solid-js";

/** Gesture phase of a swipe surface, mirrored to its `data-state` attribute. */
export type SwipeState = "idle" | "dragging" | "settling" | "dismissed";
/** Final result reported when a swipe settle animation completes. */
export type SwipeOutcome = "dismissed" | "snapped-back";

/** Live displacement and velocity reading along the swipe axis. */
export type SwipeDragInfo = {
  /** Signed displacement along the axis, in px. */
  displacement: number;
  /** Signed velocity along the axis, in px/ms, over a trailing window. */
  velocity: number;
};

/** Release-time drag reading plus the dismiss versus snap-back decision. */
export type SwipeRelease = SwipeDragInfo & {
  /** Whether the gesture completes (dismisses) rather than snapping back. */
  dismissed: boolean;
  /** Whether the gesture was cancelled by the browser (scroll takeover). */
  cancelled: boolean;
};

/** Axis, thresholds, animation, and callbacks configuring a swipe recognizer. */
export type SwipeOptions = {
  /** Drag axis. Defaults to `"x"`. */
  axis?: "x" | "y" | undefined;
  /** Allowed drag directions. Defaults to `"both"`. */
  direction?: "both" | "positive" | "negative" | undefined;
  /**
   * Displacement that completes the swipe, as a fraction of the element's
   * measured size along the axis (floored at 24px). Defaults to `0.4`.
   * Must be positive.
   */
  threshold?: number | undefined;
  /** Flick velocity (px/ms) that completes the swipe. Defaults to `0.5`. */
  velocityThreshold?: number | undefined;
  /** Settle animation length in ms. Defaults to `220`. `0` settles instantly. */
  duration?: number | undefined;
  /** Settle easing. Defaults to the snappy spring token with an `ease` fallback. */
  easing?: string | undefined;
  /**
   * Time source in ms. Defaults to `performance.now`, else `Date.now`.
   * Read live, like the callbacks below.
   */
  now?: (() => number) | undefined;
  /** Fired per move while dragging. Keep light - write styles directly. */
  onDrag?: ((info: SwipeDragInfo) => void) | undefined;
  /** Fired at release with the settle decision, before the animation runs. */
  onRelease?: ((decision: SwipeRelease) => void) | undefined;
  /** Fired exactly once when a settle completes. Never fires synchronously. */
  onSettled?: ((outcome: SwipeOutcome) => void) | undefined;
};

/** Attach ref, reactive state, and dispose handle returned by `createSwipe`. */
export type SwipeApi = {
  /**
   * Attach to the swipe surface. Handles remounts (detach + reattach);
   * cleanup also runs on owner disposal. The helper owns the element's
   * inline `transform` while attached.
   */
  ref: (element: HTMLElement | null) => void;
  /** Reactive gesture phase. Mirrored to `data-state` on the element. */
  state: Accessor<SwipeState>;
  /**
   * Detach from the element, restore inline styles, and reset to idle.
   * Runs automatically on `ref(null)` and owner disposal - call it directly
   * for non-JSX usage.
   */
  dispose: () => void;
};

// Movement below this is a tap, not a drag.
const SLOP = 4;
// Threshold floor so tiny or unlaid-out elements still need a real drag.
const MIN_THRESHOLD_PX = 24;
// Extra travel past the edge on dismiss, so the element fully exits.
const DISMISS_OVERSHOOT = 48;
// Fallback travel when the element has no measurable size.
const ZERO_SIZE_TRAVEL = 96;
// Trailing window for velocity, in ms.
const VELOCITY_WINDOW = 120;
// Spans below this report zero velocity: sub-frame sample pairs (tap jitter,
// synthetic events) would otherwise compute exploding px/ms values. Real
// flicks always span multiple frames.
const MIN_VELOCITY_SPAN = 16;
// Slack past `duration` before the transitionend fallback fires.
const SETTLE_BUFFER = 120;

function defaultNow(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

function assertOption(valid: boolean, message: string): void {
  if (!valid) throw new RangeError(`[motion] ${message}`);
}

/** Creates a configurable swipe-gesture recognizer that reports swipe state for a target. */
export function createSwipe(options: SwipeOptions = {}): SwipeApi {
  if (options === null || typeof options !== "object") {
    throw new TypeError(`[motion] options must be an object (got ${String(options)}).`);
  }
  const axis = options.axis ?? "x";
  assertOption(axis === "x" || axis === "y", `axis must be "x" or "y" (got ${String(axis)}).`);
  const direction = options.direction ?? "both";
  assertOption(
    direction === "both" || direction === "positive" || direction === "negative",
    `direction must be "both", "positive", or "negative" (got ${String(direction)}).`,
  );
  const threshold = options.threshold ?? 0.4;
  assertOption(
    typeof threshold === "number" && Number.isFinite(threshold) && threshold > 0,
    `threshold must be a positive finite number (got ${String(threshold)}).`,
  );
  const velocityThreshold = options.velocityThreshold ?? 0.5;
  assertOption(
    typeof velocityThreshold === "number" &&
      Number.isFinite(velocityThreshold) &&
      velocityThreshold > 0,
    `velocityThreshold must be a positive finite number (got ${String(velocityThreshold)}).`,
  );
  const duration = options.duration ?? 220;
  assertOption(
    typeof duration === "number" && Number.isFinite(duration) && duration >= 0,
    `duration must be a finite number >= 0 (got ${String(duration)}).`,
  );
  const easing = options.easing ?? "var(--solidix-spring-snappy, ease)";
  if (typeof easing !== "string" || easing === "") {
    throw new TypeError(`[motion] easing must be a non-empty string (got ${String(easing)}).`);
  }
  if (options.now !== undefined && typeof options.now !== "function") {
    throw new TypeError(`[motion] now must be a function (got ${String(options.now)}).`);
  }
  // Callbacks and the clock read live from the options object, so replacing
  // them takes effect immediately; every other option is snapshotted above.
  const now = (): number => (options.now ?? defaultNow)();
  for (const name of ["onDrag", "onRelease", "onSettled"] as const) {
    const callback = options[name];
    if (callback !== undefined && typeof callback !== "function") {
      throw new TypeError(`[motion] ${name} must be a function (got ${String(callback)}).`);
    }
  }

  const [state, setState] = createSignal<SwipeState>("idle");

  let element: HTMLElement | null = null;
  let pointerId: number | null = null;
  let startPos = 0;
  let baseOffset = 0;
  let dragging = false;
  let samples: { time: number; displacement: number }[] = [];
  let lastApplied = 0;
  let settleToken = 0;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let savedTransition: string | undefined;
  let savedUserSelect: string | undefined;
  let savedTouchAction = "";
  // Pre-gesture snapshot, so a tap restores rather than resets state.
  let downTransform = "";
  let downApplied = 0;
  let downDismissed = false;

  const setPhase = (phase: SwipeState): void => {
    setState(phase);
    if (element) element.dataset.state = phase;
  };

  const apply = (displacement: number): void => {
    if (!element) return;
    lastApplied = displacement;
    const value = axis === "x" ? `${displacement}px, 0px, 0px` : `0px, ${displacement}px, 0px`;
    element.style.transform = `translate3d(${value})`;
  };

  const clamp = (displacement: number): number => {
    if (direction === "positive") return Math.max(0, displacement);
    if (direction === "negative") return Math.min(0, displacement);
    return displacement;
  };

  const velocity = (): number => {
    const cutoff = now() - VELOCITY_WINDOW;
    samples = samples.filter((sample) => sample.time >= cutoff);
    const first = samples[0];
    const last = samples[samples.length - 1];
    if (!first || !last) return 0;
    const dt = last.time - first.time;
    if (dt < MIN_VELOCITY_SPAN) return 0;
    return (last.displacement - first.displacement) / dt;
  };

  // Visual position mid-settle, so re-grabs continue without jumping.
  // Falls back to the last applied value when unreadable (e.g. jsdom).
  const currentOffset = (): number => {
    if (element) {
      const match = /^matrix(?:3d)?\((.+)\)$/.exec(getComputedStyle(element).transform);
      if (match) {
        const parts = match[1]!.split(",").map(Number);
        const index = parts.length === 16 ? (axis === "x" ? 12 : 13) : axis === "x" ? 4 : 5;
        const parsed = parts[index];
        if (parsed !== undefined && Number.isFinite(parsed)) return parsed;
      }
    }
    return lastApplied;
  };

  const clearSettle = (): void => {
    settleToken += 1;
    if (settleTimer !== undefined) {
      clearTimeout(settleTimer);
      settleTimer = undefined;
    }
    if (element) {
      element.removeEventListener("transitionend", onTransitionEnd);
      // Restore only what suppression saved: an untouched inline transition
      // (fresh attach, tap-only gestures) must survive verbatim.
      if (savedTransition !== undefined) {
        element.style.transition = savedTransition;
        savedTransition = undefined;
      }
    }
  };

  // Author `transform` transitions (hover lifts, recipe transitions) would
  // lag live drag feedback and animate instant settles, so gestures run with
  // transitions suppressed; `clearSettle` restores the saved value after.
  const suppressTransition = (): void => {
    if (element && savedTransition === undefined) {
      savedTransition = element.style.transition;
      element.style.transition = "none";
    }
  };

  const measure = (): number => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return axis === "x" ? rect.width : rect.height;
  };

  function onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === "transform") completeSettle();
  }

  let pendingOutcome: SwipeOutcome | null = null;
  let pendingTarget = 0;
  // Exactly-once: the first of `transitionend` / timeout wins by nulling
  // `pendingOutcome`; the loser (and any stale token) no-ops.
  function completeSettle(): void {
    if (pendingOutcome === null) return;
    const outcome = pendingOutcome;
    pendingOutcome = null;
    clearSettle();
    if (outcome === "snapped-back") {
      lastApplied = 0;
      if (element) element.style.transform = "";
      setPhase("idle");
    } else {
      setPhase("dismissed");
    }
    options.onSettled?.(outcome);
  }

  const settle = (target: number, outcome: SwipeOutcome): void => {
    if (!element) return;
    pendingOutcome = outcome;
    pendingTarget = target;
    const reduceMotion =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || duration === 0) {
      suppressTransition();
      apply(target);
      queueMicrotask(() => completeSettle());
      return;
    }
    setPhase("settling");
    // Suppression may already hold the pre-drag value; never overwrite it
    // with the mid-drag `"none"`.
    suppressTransition();
    element.style.transition = `transform ${duration}ms ${easing}`;
    apply(target);
    element.addEventListener("transitionend", onTransitionEnd);
    const token = settleToken;
    settleTimer = setTimeout(() => {
      if (token === settleToken) completeSettle();
    }, duration + SETTLE_BUFFER);
  };

  const resetGesture = (): void => {
    pointerId = null;
    dragging = false;
    samples = [];
    baseOffset = 0;
    // Guarded for SSR: listeners are only ever added from a real pointerdown.
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onWindowPointerUp, true);
      window.removeEventListener("pointercancel", onWindowPointerCancel, true);
    }
    if (element) {
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerCancel);
      if (savedUserSelect !== undefined) {
        element.style.userSelect = savedUserSelect;
        savedUserSelect = undefined;
      }
    }
  };

  const finishGesture = (cancelled: boolean): void => {
    const node = element;
    const wasDragging = dragging;
    const displacement = lastApplied;
    // Capture before resetGesture() clears the samples.
    const releaseVelocity = cancelled || !wasDragging ? 0 : velocity();
    resetGesture();
    if (!node) return;
    if (!wasDragging) {
      if (pendingOutcome !== null) {
        // Tap during a settle: resume the interrupted animation.
        settle(pendingTarget, pendingOutcome);
      } else {
        // A plain tap restores the pre-gesture state - a kept-mounted
        // dismissed element stays dismissed, everything else is untouched.
        lastApplied = downApplied;
        node.style.transform = downTransform;
        setPhase(downDismissed ? "dismissed" : "idle");
      }
      return;
    }
    // A drag ending over the surface would click through - swallow it.
    node.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true, once: true },
    );
    const size = measure();
    const thresholdPx = Math.max(MIN_THRESHOLD_PX, threshold * size);
    // Acute intent wins: a hard flick decides even against displacement.
    let side: 1 | -1 | 0 = 0;
    if (releaseVelocity >= velocityThreshold && direction !== "negative") side = 1;
    else if (releaseVelocity <= -velocityThreshold && direction !== "positive") side = -1;
    else if (displacement >= thresholdPx && direction !== "negative") side = 1;
    else if (displacement <= -thresholdPx && direction !== "positive") side = -1;
    const dismissed = side !== 0;
    options.onRelease?.({ dismissed, displacement, velocity: releaseVelocity, cancelled });
    const target = dismissed ? side * (size > 0 ? size + DISMISS_OVERSHOOT : ZERO_SIZE_TRAVEL) : 0;
    settle(target, dismissed ? "dismissed" : "snapped-back");
  };

  function onPointerMove(event: PointerEvent): void {
    if (!element || event.pointerId !== pointerId) return;
    const pos = axis === "x" ? event.clientX : event.clientY;
    let raw = pos - startPos;
    if (!dragging) {
      if (Math.abs(raw) <= SLOP) return;
      // Re-anchor past the slop so motion grows continuously from zero.
      startPos += Math.sign(raw) * SLOP;
      raw = pos - startPos;
      dragging = true;
      // A new gesture supersedes any interrupted settle.
      pendingOutcome = null;
      // Commit to the drag: capture keeps tracking outside the window.
      // Taps never reach this, so their click targeting stays native.
      try {
        element.setPointerCapture?.(event.pointerId);
      } catch {
        // Synthetic pointer ids (tests) or already-released pointers.
      }
      savedUserSelect = element.style.userSelect;
      element.style.userSelect = "none";
      suppressTransition();
      samples = [{ time: now(), displacement: baseOffset }];
      setPhase("dragging");
    }
    const displacement = clamp(baseOffset + raw);
    apply(displacement);
    samples.push({ time: now(), displacement });
    options.onDrag?.({ displacement, velocity: velocity() });
  }

  function onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== pointerId) return;
    finishGesture(false);
  }

  function onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== pointerId) return;
    finishGesture(true);
  }

  // Failsafe for failed pointer capture (or releases far off-element): the
  // element listeners never fire, so finish from the window instead. Capture
  // phase runs before the element handlers; whichever runs first nulls
  // `pointerId`, so the other no-ops on the guard.
  function onWindowPointerUp(event: PointerEvent): void {
    if (event.pointerId !== pointerId) return;
    finishGesture(false);
  }

  function onWindowPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== pointerId) return;
    finishGesture(true);
  }

  function onPointerDown(event: PointerEvent): void {
    if (!element || event.button !== 0 || pointerId !== null) return;
    // Snapshot for the tap path; event handlers run untracked, so the signal
    // read is safe here.
    downTransform = element.style.transform;
    downApplied = lastApplied;
    downDismissed = state() === "dismissed";
    // A re-grab mid-settle freezes the animation and continues from the
    // visual position; the outcome resumes if this turns out to be a tap.
    clearSettle();
    if (pendingOutcome !== null) {
      baseOffset = currentOffset();
      apply(baseOffset);
    } else {
      baseOffset = 0;
    }
    pointerId = event.pointerId;
    startPos = axis === "x" ? event.clientX : event.clientY;
    samples = [];
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerCancel);
    // Moves track from the window so a fast flick that leaves the surface in
    // a single event still starts the drag. Capture is deliberately NOT set
    // here: an uncaptured tap keeps native click targeting, so interactive
    // children (buttons, links) stay clickable.
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onWindowPointerUp, true);
    window.addEventListener("pointercancel", onWindowPointerCancel, true);
  }

  function detach(): void {
    clearSettle();
    pendingOutcome = null;
    pendingTarget = 0;
    resetGesture();
    if (element) {
      element.removeEventListener("pointerdown", onPointerDown);
      element.style.touchAction = savedTouchAction;
      // clearSettle() above already restored any suppressed transition.
      element.style.transform = "";
      delete element.dataset.state;
      element = null;
    }
    lastApplied = 0;
    setState("idle");
  }

  function dispose(): void {
    detach();
  }

  const ref = (node: HTMLElement | null): void => {
    // Solid never nulls callback refs natively; a new node detaches the old.
    if (element !== null && element !== node) detach();
    if (node === null || node === element) return;
    element = node;
    savedTouchAction = node.style.touchAction;
    node.style.touchAction = axis === "x" ? "pan-y" : "pan-x";
    node.addEventListener("pointerdown", onPointerDown);
    setPhase("idle");
  };

  if (getOwner()) onCleanup(dispose);

  return { ref, state, dispose };
}
