type AnyFunction = (...args: any[]) => any;

/**
 * Returns a stable function calling the given callback.
 * (Solid port of Radix's `useEffectEvent` shim.)
 *
 * Solid components run setup once, so the given callback is captured once.
 * Pass a stable closure that reads reactive sources at call time, e.g.
 * `(value) => props.onChange?.(value)`; never pass `props.onChange` directly,
 * as that freezes the setup-time value and drops later handler identities.
 */
export function useEffectEvent<T extends AnyFunction>(callback?: T): T {
  return ((...args: any[]) => callback?.(...args)) as T;
}
