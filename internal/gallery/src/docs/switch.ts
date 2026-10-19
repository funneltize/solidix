import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "switch",
  title: "Switch",
  metaDescription: "A control that allows the user to toggle between checked and not checked.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/switch",
  description: "A control that allows the user to toggle between checked and not checked.",
  features: ["Full keyboard navigation.", "Can be controlled or uncontrolled."],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Switch } from "solidix";\n\nexport default () => (\n\t<Switch.Root>\n\t\t<Switch.Thumb />\n\t</Switch.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description:
        "Contains all the parts of a switch. An `input` will also render when used within a `form` to ensure events propagate correctly.",
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
          name: "defaultChecked",
          type: "boolean",
          description:
            "The state of the switch when it is initially rendered. Use when you do not need to control its state.",
        },
        {
          name: "checked",
          type: "boolean",
          description:
            "The controlled state of the switch. Must be used in conjunction with `onCheckedChange`.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the state of the switch changes.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the switch.",
        },
        {
          name: "required",
          type: "boolean",
          description:
            "When `true`, indicates that the user must check the switch before the owning form can be submitted.",
        },
        {
          name: "name",
          type: "string",
          description:
            "The name of the switch. Submitted with its owning form as part of a name/value pair.",
        },
        {
          name: "value",
          type: "string",
          default: "on",
          description: "The value given as data when submitted with a `name`.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["checked", "unchecked"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Thumb",
      description: "The thumb that is used to visually indicate whether the switch is on or off.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["checked", "unchecked"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
  ],
  examples: [
    {
      title: "Decoupling the hidden input",
      description:
        "By default, `Switch.Root` renders a visually hidden `input` for form submission. To recompose, move, or exclude that input, you can build the switch from its lower-level parts instead.\n\n> **Important:** These parts are unstable and prefixed with `unstable_`, so their API may change in a future release.\n\n- `Switch.unstable_Provider` provides the switch state and accepts the form-related props (`name`, `value`, `checked`, `defaultChecked`, `required`, `disabled`, `onCheckedChange`).\n- `Switch.unstable_Trigger` is the interactive button that wraps `Switch.Thumb`.\n- `Switch.unstable_BubbleInput` is the visually hidden input that `Switch.Root` renders by default. Omit it when you don't need form submission.",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: 'import { Switch } from "solidix";\n\nexport default () => (\n\t<Switch.Provider name="airplane-mode">\n\t\t<Switch.Trigger>\n\t\t\t<Switch.Thumb />\n\t\t</Switch.Trigger>\n\t\t{/* The hidden input can be omitted if you don\'t need form submission */}\n\t\t<Switch.BubbleInput />\n\t</Switch.Provider>\n);',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Adheres to the [`switch` role requirements](https://www.w3.org/WAI/ARIA/apg/patterns/switch).",
  keyboard: [
    {
      keys: ["Space"],
      description: "Toggles the component's state.",
    },
    {
      keys: ["Enter"],
      description: "Toggles the component's state.",
    },
  ],
  notes: "",
};
