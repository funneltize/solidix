import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "aspect-ratio",
  title: "Aspect Ratio",
  metaDescription: "Displays content within a desired ratio.",
  ariaLink: "",
  description: "Displays content within a desired ratio.",
  features: ["Accepts any custom ratio."],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { AspectRatio } from "solidix";\n\nexport default () => <AspectRatio.Root />;',
  },
  parts: [
    {
      name: "Root",
      description: "Contains the content you want to constrain to a given ratio.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "ratio",
          type: "number",
          default: "1",
          description: "The desired ratio",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility: "",
  keyboard: [],
  notes: "",
};
