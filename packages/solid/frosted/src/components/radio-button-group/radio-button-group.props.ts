import { colorProp, highContrastProp } from "../../helpers/props";

/**
 * Prop definitions driving `RadioButtonGroupRoot` (color and highContrast).
 * Ported from `radio-button-group.props.ts` at whopio/frosted-ui commit 56787900bfe0.
 */
const radioButtonGroupPropDefs = {
  color: colorProp,
  highContrast: highContrastProp,
} satisfies {
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

export { radioButtonGroupPropDefs };
