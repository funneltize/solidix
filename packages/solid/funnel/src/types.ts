import type { JSX } from "@solidjs/web";

/**
 * Props for funnel blocks rendered as plain elements that `Primitive` does
 * not cover (`section`, `blockquote`, ...). Unlike primitives, blocks are
 * fixed-structure and take callback refs only.
 */
export type FunnelElementProps<
  E extends keyof JSX.IntrinsicElements,
  El extends EventTarget = Element,
> = Omit<JSX.IntrinsicElements[E], "ref"> & {
  ref?: ((element: El | null) => void) | undefined;
};
