import { createEffect, createSignal, untrack } from "solid-js";

/**
 * Returns an accessor for the previous value. Accepts a plain value or a
 * reactive getter; pass a getter for values that change over time.
 */
export function usePrevious<T>(value: T | (() => T)): () => T {
  const get = typeof value === "function" ? (value as () => T) : () => value;
  const [previous, setPrevious] = createSignal<T>(untrack(get) as Exclude<T, Function>);
  let initialized = false;

  createEffect(
    () => get(),
    (current, prev) => {
      // skip the initial run, then mirror Radix: report the value from
      // before the latest change.
      if (initialized && !Object.is(prev, current)) {
        const next = prev;
        setPrevious(() => next as T);
      }
      initialized = true;
    },
  );

  return previous;
}
