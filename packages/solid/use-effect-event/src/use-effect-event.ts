type AnyFunction = (...args: any[]) => any;

/**
 * Returns a stable function that always calls the latest callback.
 * (Solid port of Radix's `useEffectEvent` shim.)
 */
export function useEffectEvent<T extends AnyFunction>(callback?: T): T {
  return ((...args: any[]) => callback?.(...args)) as T;
}
