import { colorProp } from "../../helpers/props";

/** Prop definitions driving `OTPField` props, classes, and defaults. */
const otpFieldPropDefs = {
  color: { ...colorProp, default: "gray" },
} satisfies {
  color: typeof colorProp;
};

export { otpFieldPropDefs };
