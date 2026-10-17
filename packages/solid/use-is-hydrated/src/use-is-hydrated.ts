import { createSignal, onSettled } from "solid-js";

let _isHydrated = false;

/**
 * Determines whether or not the component tree has been hydrated.
 * Returns an accessor: `false` on first client render, `true` once settled.
 */
export function useIsHydrated(): () => boolean {
  const [isHydrated, setIsHydrated] = createSignal(_isHydrated);
  onSettled(() => {
    if (!_isHydrated) {
      _isHydrated = true;
      setIsHydrated(true);
    }
  });
  return isHydrated;
}
