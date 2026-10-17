type AnyFunction = (...args: any[]) => any;

/**
 * A custom hook that converts a callback to a ref to avoid triggering
 * re-renders when passed as a prop or avoid re-executing effects when passed as
 * a dependency.
 */
export function useCallbackRef<T extends AnyFunction>(callback: T | undefined): T {
  // Solid closures read reactive state lazily, so the latest values are always
  // seen when the returned function is invoked — no ref syncing needed.
  return ((...args: any[]) => callback?.(...args)) as T;
}
