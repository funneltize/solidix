import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "toolbar",
  title: "Toolbar",
  metaDescription:
    "A container for grouping a set of controls, such as buttons, toggle groups or dropdown menus.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/toolbar",
  description:
    "A container for grouping a set of controls, such as buttons, toggle groups or\n\tdropdown menus.",
  features: ["Full keyboard navigation."],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Toolbar } from "@solidix/solidix";\n\nexport default () => (\n\t<Toolbar.Root>\n\t\t<Toolbar.Button />\n\t\t<Toolbar.Separator />\n\t\t<Toolbar.Link />\n\t\t<Toolbar.ToggleGroup>\n\t\t\t<Toolbar.ToggleItem />\n\t\t</Toolbar.ToggleGroup>\n\t</Toolbar.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the toolbar component parts.",
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
          name: "orientation",
          required: false,
          type: '"horizontal" | "vertical" | undefined',
          typeSimple: "enum",
          default: '"horizontal"',
          description: "The orientation of the toolbar.",
        },
        {
          name: "dir",
          required: false,
          type: '"ltr" | "rtl"',
          typeSimple: "enum",
          description:
            "The reading direction of the toolbar. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.",
        },
        {
          name: "loop",
          required: false,
          type: "boolean",
          default: "true",
          description:
            "When `true`, keyboard navigation will loop from last tab to first, and vice versa.",
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
      name: "Button",
      description: "A button item.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
      name: "Link",
      description: "A link item.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ToggleGroup",
      description: "A set of two-state buttons that can be toggled on or off.",
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
      name: "ToggleItem",
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
    {
      name: "Separator",
      description: "Used to visually separate items in the toolbar.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
  ],
  examples: [
    {
      title: "Use with other primitives",
      description:
        "All our primitives which expose a `Trigger` part, such as `Dialog`, `AlertDialog`, `Popover`, `DropdownMenu` can be composed within a toolbar by using the `asChild` prop.\n\nHere is an example using our `DropdownMenu` primitive.",
      blocks: [
        {
          lang: "jsx",
          highlights: [8, 9, 10],
          code: 'import { Toolbar, DropdownMenu } from "@solidix/solidix";\n\nexport default () => (\n\t<Toolbar.Root>\n\t\t<Toolbar.Button>Action 1</Toolbar.Button>\n\t\t<Toolbar.Separator />\n\t\t<DropdownMenu.Root>\n\t\t\t<Toolbar.Button asChild>\n\t\t\t\t<DropdownMenu.Trigger>Trigger</DropdownMenu.Trigger>\n\t\t\t</Toolbar.Button>\n\t\t\t<DropdownMenu.Content>…</DropdownMenu.Content>\n\t\t</DropdownMenu.Root>\n\t</Toolbar.Root>\n);',
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
      description: "Moves focus to the first item in the group.",
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
      description: "Moves focus to the next item depending on `orientation`.",
    },
    {
      keys: ["ArrowRight"],
      description: "Moves focus to the next item depending on `orientation`.",
    },
    {
      keys: ["ArrowUp"],
      description: "Moves focus to the previous item depending on `orientation` .",
    },
    {
      keys: ["ArrowLeft"],
      description: "Moves focus to the previous item depending on `orientation` .",
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
