import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const sizes = ["1", "2", "3"] as const;
const variants = ["surface", "outline", "ghost"] as const;

/**
 * Prop definitions for `Table.Root`.
 *
 * Upstream: `table.props.ts` (`tableRootPropDefs`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const tableRootPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  variant: { type: "enum", values: variants, default: "surface" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

/** Table root props derived from {@link tableRootPropDefs}. */
type TableRootOwnProps = GetPropDefTypes<typeof tableRootPropDefs>;

export { tableRootPropDefs };
export type { TableRootOwnProps };
