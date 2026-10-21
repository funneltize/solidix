type AnyFunction = (...args: any[]) => any;

/**
 * A custom hook that converts a callback to a ref to avoid triggering
 * re-renders when passed as a prop or avoid re-executing effects when passed as
 * a dependency.
 *
 * Solid components run setup once, so the given callback is captured once.
 * Pass a stable closure that reads reactive sources at call time, e.g.
 * `(event) => props.onEvent?.(event)`; never pass `props.onEvent` directly,
 * as that freezes the setup-time value and drops later handler identities.
 */
export function useCallbackRef<T extends AnyFunction>(callback: T | undefined): T {
  return ((...args: any[]) => callback?.(...args)) as T;
}
