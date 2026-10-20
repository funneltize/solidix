import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "toggle-group",
  title: "Toggle Group",
  metaDescription: "A set of two-state buttons that can be toggled on or off.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/button",
  description: "A set of two-state buttons that can be toggled on or off.",
  features: [
    "Full keyboard navigation.",
    "Supports horizontal/vertical orientation.",
    "Support single and multiple pressed buttons.",
    "Can be controlled or uncontrolled.",
  ],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { ToggleGroup } from "@solidix/solidix";\n\nexport default () => (\n\t<ToggleGroup.Root>\n\t\t<ToggleGroup.Item />\n\t</ToggleGroup.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the parts of a toggle group.",
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
          name: "type",
          required: true,
          type: '"single" | "multiple"',
          typeSimple: "enum",
          description: "Determines whether a single or multiple items can be pressed at a time.",
        },
        {
          name: "value",
          required: false,
          type: "string",
          description:
            'The controlled value of the pressed item when `type` is `"single"`. Must be used in conjunction with `onValueChange`.',
        },
        {
          name: "defaultValue",
          required: false,
          type: "string",
          description:
            'The value of the item to show as pressed when initially rendered and `type` is `"single"`. Use when you do not need to control the state of the items.',
        },
        {
          name: "onValueChange",
          required: false,
          type: "(value: string) => void",
          typeSimple: "function",
          description:
            'Event handler called when the pressed state of an item changes and `type` is `"single"`.',
        },
        {
          name: "value",
          required: false,
          default: "[]",
          type: "string[]",
          description:
            'The controlled value of the pressed items when `type` is `"multiple"`. Must be used in conjunction with `onValueChange`.',
        },
        {
          name: "defaultValue",
          required: false,
          default: "[]",
          type: "string[]",
          description:
            'The values of the items to show as pressed when initially rendered and `type` is `"multiple"`. Use when you do not need to control the state of the items.',
        },
        {
          name: "onValueChange",
          required: false,
          type: "(value: string[]) => void",
          typeSimple: "function",
          description:
            'Event handler called when the pressed state of an item changes and `type` is `"multiple"`.',
        },
        {
          name: "disabled",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "When `true`, prevents the user from interacting with the toggle group and all its items.",
        },
        {
          name: "rovingFocus",
          required: false,
          type: "boolean",
          default: "true",
          description:
            "When `false`, navigating through the items using arrow keys will be disabled.",
        },
        {
          name: "orientation",
          required: false,
          type: '"horizontal" | "vertical" | undefined',
          typeSimple: "enum",
          default: "undefined",
          description:
            "The orientation of the component, which determines how focus moves: `horizontal` for left/right arrows and `vertical` for up/down arrows.",
        },
        {
          name: "dir",
          required: false,
          type: '"ltr" | "rtl"',
          typeSimple: "enum",
          description:
            "The reading direction of the toggle group. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.",
        },
        {
          name: "loop",
          required: false,
          type: "boolean",
          default: "true",
          description:
            "When `true` and `rovingFocus` is `true`, keyboard navigation will loop from last item to first, and vice versa.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Item",
      description: "An item in the group.",
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
          name: "value",
          required: true,
          type: "string",
          description: "A unique value for the item.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the item.",
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
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [],
    },
  ],
  examples: [
    {
      title: "Ensuring there is always a value",
      description: "You can control the component to ensure a value.",
      blocks: [
        {
          lang: "jsx",
          highlights: [5, 8],
          code: 'import { createSignal } from "solid-js";\nimport { ToggleGroup } from "@solidix/solidix";\n\nexport default () => {\n\tconst [value, setValue] = createSignal("left");\n\n\treturn (\n\t\t<ToggleGroup.Root\n\t\t\ttype="single"\n\t\t\tvalue={value()}\n\t\t\tonValueChange={(value) => {\n\t\t\t\tif (value) setValue(value);\n\t\t\t}}\n\t\t>\n\t\t\t<ToggleGroup.Item value="left">\n\t\t\t\tLeft\n\t\t\t</ToggleGroup.Item>\n\t\t\t<ToggleGroup.Item value="center">\n\t\t\t\tCenter\n\t\t\t</ToggleGroup.Item>\n\t\t\t<ToggleGroup.Item value="right">\n\t\t\t\tRight\n\t\t\t</ToggleGroup.Item>\n\t\t</ToggleGroup.Root>\n\t);\n};',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Uses [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.2/examples/radio/radio.html) to manage focus movement among items.",
  keyboard: [
    {
      keys: ["Tab"],
      description: "Moves focus to either the pressed item or the first item in the group.",
    },
    {
      keys: ["Space"],
      description: "Activates/deactivates the item.",
    },
    {
      keys: ["Enter"],
      description: "Activates/deactivates the item.",
    },
    {
      keys: ["ArrowDown"],
      description: "Moves focus to the next item in the group.",
    },
    {
      keys: ["ArrowRight"],
      description: "Moves focus to the next item in the group.",
    },
    {
      keys: ["ArrowUp"],
      description: "Moves focus to the previous item in the group.",
    },
    {
      keys: ["ArrowLeft"],
      description: "Moves focus to the previous item in the group.",
    },
    {
      keys: ["Home"],
      description: "Moves focus to the first item.",
    },
    {
      keys: ["End"],
      description: "Moves focus to the last item.",
    },
  ],
  notes: "",
};
