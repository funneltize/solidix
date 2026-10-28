import {
  radixColorScales,
  radixColorScalesBright,
  radixColorScalesMetal,
  radixColorScalesRegular,
  radixGetMatchingGrayScale,
  radixGrayScalePure,
  radixGrayScales,
  radixGrayScalesDesaturated,
} from "./helpers/radix-colors";
import type { GetPropDefTypes, PropDef } from "./helpers/props/prop-def";

/** Panel-elevation color token name. */
const colorPanelElevationColors = ["color-panel-elevation"] as const;

/** Semantic color token names. */
const semanticColors = ["danger", "warning", "success", "info"] as const;

/** Theme appearances: inherit from the document or force light/dark. */
const appearances = ["inherit", "light", "dark"] as const;

/** Accent colors: every hue scale plus gray. */
const accentColors = [...radixColorScales, "gray"] as const;

/** Gray colors: every gray scale plus auto-matching. */
const grayColors = [...radixGrayScales, "auto"] as const;

/** Danger color ramp choices. */
const dangerColors = ["tomato", "red", "ruby"] as const;

/** Warning color ramp choices. */
const warningColors = ["yellow", "amber"] as const;

/** Success color ramp choices. */
const successColors = ["teal", "jade", "green", "grass", "lime"] as const;

/** Info color ramp choices. */
const infoColors = ["blue", "sky"] as const;

/** Prop definitions for the theme options. */
const themePropDefs = {
  hasBackground: { type: "boolean", default: true },
  appearance: { type: "enum", values: appearances, default: "inherit" },
  accentColor: { type: "enum", values: accentColors, default: "blue" },
  grayColor: { type: "enum", values: grayColors, default: "gray" },
  dangerColor: { type: "enum", values: dangerColors, default: "red" },
  warningColor: { type: "enum", values: warningColors, default: "amber" },
  successColor: { type: "enum", values: successColors, default: "lime" },
  infoColor: { type: "enum", values: infoColors, default: "sky" },
} satisfies {
  hasBackground: PropDef<boolean>;
  appearance: PropDef<(typeof appearances)[number]>;
  accentColor: PropDef<(typeof accentColors)[number]>;
  grayColor: PropDef<(typeof grayColors)[number]>;
  dangerColor: PropDef<(typeof dangerColors)[number]>;
  warningColor: PropDef<(typeof warningColors)[number]>;
  successColor: PropDef<(typeof successColors)[number]>;
  infoColor: PropDef<(typeof infoColors)[number]>;
};

/** Theme props resolved from `themePropDefs`. */
type ThemeProps = GetPropDefTypes<typeof themePropDefs>;

/** Theme appearance, excluding undefined. */
type ThemeAppearance = NonNullable<ThemeProps["appearance"]>;
/** Theme accent color, excluding undefined. */
type ThemeAccentColor = NonNullable<ThemeProps["accentColor"]>;
/** Theme gray color, excluding undefined. */
type ThemeGrayColor = NonNullable<ThemeProps["grayColor"]>;
/** Theme danger color, excluding undefined. */
type ThemeDangerColor = NonNullable<ThemeProps["dangerColor"]>;
/** Theme warning color, excluding undefined. */
type ThemeWarningColor = NonNullable<ThemeProps["warningColor"]>;
/** Theme success color, excluding undefined. */
type ThemeSuccessColor = NonNullable<ThemeProps["successColor"]>;
/** Theme info color, excluding undefined. */
type ThemeInfoColor = NonNullable<ThemeProps["infoColor"]>;

/** Fully resolved theme options: every color key required. */
type ThemeOptions = {
  appearance: ThemeAppearance;
  accentColor: ThemeAccentColor;
  grayColor: ThemeGrayColor;
  dangerColor: ThemeDangerColor;
  warningColor: ThemeWarningColor;
  successColor: ThemeSuccessColor;
  infoColor: ThemeInfoColor;
};

/** Accent colors grouped by family for pickers. */
const themeAccentColorsGrouped = [
  {
    label: "Regulars",
    values: [...radixColorScalesRegular] as ThemeAccentColor[],
  },
  {
    label: "Brights",
    values: [...radixColorScalesBright] as ThemeAccentColor[],
  },
  {
    label: "Metals",
    values: [...radixColorScalesMetal] as ThemeAccentColor[],
  },
  { label: "Gray", values: ["gray"] as ThemeAccentColor[] },
];

/** Accent colors in display order, ending with Whop brand colors. */
const themeAccentColorsOrdered = [
  "gray",
  "gold",
  "bronze",
  "brown",
  "yellow",
  "amber",
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "mint",
  "sky",
  // Whop Brand Colors
  "blue",
  "orange",
  "indigo",
  "magenta",
  "lemon",
  "lime",
] as ThemeAccentColor[];

/** Gray colors grouped for pickers. */
const themeGrayColorsGrouped = [
  { label: "Pure", values: [radixGrayScalePure] as ThemeGrayColor[] },
  {
    label: "Desaturated",
    values: ["auto", ...radixGrayScalesDesaturated] as ThemeGrayColor[],
  },
];

/** Returns the concrete gray scale that pairs with an accent color. */
function getMatchingGrayColor(accentColor: ThemeAccentColor): (typeof radixGrayScales)[number] {
  if (accentColor === "gray") return "gray";
  return radixGetMatchingGrayScale(accentColor);
}

export {
  colorPanelElevationColors,
  dangerColors,
  getMatchingGrayColor,
  infoColors,
  semanticColors,
  successColors,
  themeAccentColorsGrouped,
  themeAccentColorsOrdered,
  themeGrayColorsGrouped,
  themePropDefs,
  warningColors,
};
export type { ThemeOptions };
