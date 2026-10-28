import type { GetPropDefTypes, PropDef } from "./prop-def";

/** Prop def for the shared `asChild` composition escape hatch. */
const asChildProp: PropDef<boolean> = { type: "boolean", default: false };

/** Props contributed by `asChildProp`. */
interface AsChildProps {
  asChild?: boolean | undefined;
}

export { asChildProp };
export type { AsChildProps };
export type { GetPropDefTypes as AsChildPropDefTypes };
