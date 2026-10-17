import { onSettled } from "solid-js";

/**
 * Runs `fn` once the component is settled (mounted), client-side only.
 * On the server this is a noop.
 *
 * Unlike Radix's `useLayoutEffect`, this is intentionally **not** reactive:
 * for work that must re-run when dependencies change, use `createEffect`
 * (with explicit tracking) instead.
 */
export function useLayoutEffect(fn: () => void | (() => void)): void {
  if (globalThis?.document) {
    onSettled(() => {
      const cleanup = fn();
      if (typeof cleanup === "function") return cleanup;
    });
  }
}
