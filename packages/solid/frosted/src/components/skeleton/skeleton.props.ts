/** Prop definitions for the `Skeleton` subcomponents. */
import type { PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";
import { textPropDefs } from "../text/text.props";

// Matches `avatarPropDefs` in the pinned upstream (avatar ships in a later
// wave): sizes 0-9 defaulting to '3', shapes defaulting to 'circle'.
const sizes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const shapes = ["circle", "square"] as const;

/** Prop definitions driving `SkeletonAvatar` props, classes, and defaults. */
const skeletonAvatarPropDefs = {
  size: { type: "enum", values: sizes, default: "3" },
  shape: { type: "enum", values: shapes, default: "circle" },
  color: { ...colorProp, default: "gray" },
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  shape: PropDef<(typeof shapes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

/** Prop definitions driving `SkeletonText` props, classes, and defaults. */
const skeletonTextPropDefs = {
  size: { ...textPropDefs.size, default: "3" },
  color: { ...colorProp, default: "gray" },
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof textPropDefs.size.values)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

/** Prop definitions driving `SkeletonRect` props, classes, and defaults. */
const skeletonRectPropDefs = {
  color: { ...colorProp, default: "gray" },
  highContrast: highContrastProp,
} satisfies {
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

export { skeletonAvatarPropDefs, skeletonRectPropDefs, skeletonTextPropDefs };
