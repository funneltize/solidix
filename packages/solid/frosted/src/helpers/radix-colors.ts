/** Regular Radix hue scales, with Whop brand colors appended. */
const radixColorScalesRegular = [
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
  "brown",
  // Whop Brand Colors
  "blue",
  "orange",
  "indigo",
] as const;

/** Bright Radix hue scales, with Whop brand colors appended. */
const radixColorScalesBright = [
  "sky",
  "mint",
  "yellow",
  "amber",
  // Whop Brand Colors
  "lime",
  "lemon",
  "magenta",
] as const;

/** Metallic Radix hue scales. */
const radixColorScalesMetal = ["gold", "bronze"] as const;

/** Every Radix hue scale: regular, bright, then metallic. */
const radixColorScales = [
  ...radixColorScalesRegular,
  ...radixColorScalesBright,
  ...radixColorScalesMetal,
] as const;

/** The pure (untinted) Radix gray scale. */
const radixGrayScalePure = "gray" as const;

/** Desaturated Radix gray scales. */
const radixGrayScalesDesaturated = ["mauve", "slate", "sage", "olive", "sand"] as const;

/** Every Radix gray scale: pure first, then desaturated. */
const radixGrayScales = [radixGrayScalePure, ...radixGrayScalesDesaturated] as const;

/** Returns the gray scale that pairs with a hue scale. */
function radixGetMatchingGrayScale(
  colorScale: (typeof radixColorScales)[number],
): (typeof radixGrayScales)[number] {
  switch (colorScale) {
    case "tomato":
    case "red":
    case "ruby":
    case "crimson":
    case "pink":
    case "plum":
    case "purple":
    case "violet":
      return "mauve";
    case "sky":
    case "cyan":
      return "slate";
    case "teal":
    case "jade":
    case "mint":
    case "green":
      return "sage";
    case "grass":
      return "olive";
    case "yellow":
    case "amber":
    case "brown":
    case "gold":
    case "bronze":
      return "sand";
    case "iris":
    case "blue":
    case "orange":
    case "indigo":
    case "magenta":
    case "lime":
    case "lemon":
      return "gray";
  }
}

export {
  radixColorScales,
  radixColorScalesBright,
  radixColorScalesMetal,
  radixColorScalesRegular,
  radixGetMatchingGrayScale,
  radixGrayScalePure,
  radixGrayScales,
  radixGrayScalesDesaturated,
};
