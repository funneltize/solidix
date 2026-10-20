import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "toggle",
  title: "Toggle",
  metaDescription: "A two-state button that can be either on or off.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/button",
  description: "A two-state button that can be either on or off.",
  features: ["Full keyboard navigation.", "Can be controlled or uncontrolled."],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Toggle } from "@solidix/solidix";\n\nexport default () => <Toggle.Root />;',
  },
  parts: [
    {
      name: "Root",
      description: "The toggle.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
        },
        {
          name: "defaultPressed",
          type: "boolean",
          description:
            "The pressed state of the toggle when it is initially rendered. Use when you do not need to control its pressed state.",
        },
        {
          name: "pressed",
          type: "boolean",
          description:
            "The controlled pressed state of the toggle. Must be used in conjunction with `onPressedChange`.",
        },
        {
          name: "onPressedChange",
          type: "(pressed: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the pressed state of the toggle changes.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the toggle.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["on", "off"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility: "",
  keyboard: [
    {
      keys: ["Space"],
      description: "Activates/deactivates the toggle.",
    },
    {
      keys: ["Enter"],
      description: "Activates/deactivates the toggle.",
    },
  ],
  notes: "",
};
