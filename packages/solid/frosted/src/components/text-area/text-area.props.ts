import { colorProp, type PropDef } from "../../helpers/props/index.js";

const sizes = ["1", "2", "3", "4"] as const;
const variants = ["surface", "soft"] as const;

/** Prop definitions backing the `TextArea` styling props. */
const textAreaPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  variant: { type: "enum", values: variants, default: "surface" },
  color: { ...colorProp, default: "gray" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  color: typeof colorProp;
};

/** Styling props accepted by `TextArea`. */
type TextAreaOwnProps = {
  size?: (typeof textAreaPropDefs.size.values)[number] | undefined;
  variant?: (typeof textAreaPropDefs.variant.values)[number] | undefined;
  color?: (typeof textAreaPropDefs.color.values)[number] | undefined;
};

export { textAreaPropDefs };
export type { TextAreaOwnProps };
