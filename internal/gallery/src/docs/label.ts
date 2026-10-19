import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "label",
  title: "Label",
  metaDescription: "Renders an accessible label associated with controls.",
  ariaLink: "",
  description: "Renders an accessible label associated with controls.",
  features: [
    "Text selection is prevented when double clicking label.",
    "Supports nested controls.",
  ],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Label } from "solidix";\n\nexport default () => <Label.Root />;',
  },
  parts: [
    {
      name: "Root",
      description: "Contains the content for the label.",
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
          name: "htmlFor",
          type: "string",
          description: "The id of the element the label is associated with.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility:
    "This component is based on the native `label` element, it will automatically apply the correct labelling when wrapping controls or using the `htmlFor` attribute. For your own custom controls to work correctly, ensure they use native elements such as `button` or `input` as a base.",
  keyboard: [],
  notes: "",
};
