import { onCleanup } from "solid-js";

export interface RefObject<T> {
  current: T;
}

export type Ref<T> = ((element: T | null) => void) | RefObject<T | null> | null;

type PossibleRef<T> = Ref<T> | undefined;

/**
 * Set a given ref to a given value.
 * This utility takes care of different types of refs: callback refs and RefObjects.
 */
function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

/**
 * A utility to compose multiple refs together.
 * Accepts callback refs and RefObjects.
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

/**
 * Composes multiple refs. Accepts callback refs and RefObjects.
 * Solid components run setup once, so the composed callback is inherently stable.
 *
 * The composed callback notifies on change only: the same node can be pushed
 * through nested composed callbacks and slot effects more than once (and
 * unmount nulls every level), but consumers must observe exactly one mount
 * notification and one unmount notification (React parity).
 *
 * React nulls refs on unmount; Solid does not null callback refs natively,
 * so the composed callback is nulled on owner disposal (Radix parity).
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
  let last: T | null | undefined;
  let initialized = false;
  const composed = (node: T | null) => {
    if (initialized && node === last) return;
    initialized = true;
    last = node;
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
  onCleanup(() => composed(null));
  return composed;
}

export { composeRefs, useComposedRefs };
export type { PossibleRef };
