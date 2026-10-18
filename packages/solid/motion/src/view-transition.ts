// View Transitions helper: runs a reactive state update inside
// `document.startViewTransition()` so layout morphs animate natively,
// falling back to an instant update where transitions are unavailable
// (SSR, unsupported engines) or unwanted (reduced motion).
import { flush } from "solid-js";

/**
 * Runs `update` — a synchronous state change — inside a same-document view
 * transition. Morphs between elements sharing a `view-transition-name`.
 *
 * Returns the `ViewTransition` (await `finished` to sequence follow-ups), or
 * `null` when the update ran instantly: no `document` (SSR), no
 * `startViewTransition` support, or `prefers-reduced-motion: reduce`.
 * Instant updates are always correct, just not animated.
 */
export function viewTransition(update: () => void): ViewTransition | null {
  if (typeof update !== "function") {
    throw new TypeError(`[motion] update must be a function (got ${String(update)}).`);
  }
  if (typeof document === "undefined") {
    update();
    return null;
  }
  const startViewTransition =
    typeof document.startViewTransition === "function"
      ? document.startViewTransition.bind(document)
      : undefined;
  const reduceMotion =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (startViewTransition === undefined || reduceMotion) {
    update();
    return null;
  }
  return startViewTransition(() => {
    update();
    // Solid 2 batches writes to microtask; drain synchronously so the
    // "after" snapshot sees the new DOM.
    flush();
  });
}
