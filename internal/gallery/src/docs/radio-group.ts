import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "radio-group",
  "title": "Radio Group",
  "metaDescription": "A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/radio",
  "description": "A set of checkable buttons—known as radio buttons—where no more than one of\n\tthe buttons can be checked at a time.",
  "features": [
    "Full keyboard navigation.",
    "Supports horizontal/vertical orientation.",
    "Can be controlled or uncontrolled."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { RadioGroup } from \"solidix\";\n\nexport default () => (\n\t<RadioGroup.Root>\n\t\t<RadioGroup.Item>\n\t\t\t<RadioGroup.Indicator />\n\t\t</RadioGroup.Item>\n\t</RadioGroup.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a radio group.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "The value of the radio item that should be checked when initially rendered. Use when you do not need to control the state of the radio items."
        },
        {
          "name": "value",
          "type": "string",
          "description": "The controlled value of the radio item to check. Should be used in conjunction with `onValueChange`."
        },
        {
          "name": "onValueChange",
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with radio items."
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name of the group. Submitted with its owning form as part of a name/value pair."
        },
        {
          "name": "required",
          "type": "boolean",
          "description": "When `true`, indicates that the user must check a radio item before the owning form can be submitted."
        },
        {
          "name": "orientation",
          "required": false,
          "type": "\"horizontal\" | \"vertical\" | undefined",
          "typeSimple": "enum",
          "default": "undefined",
          "description": "The orientation of the component."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "description": "The reading direction of the radio group. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "loop",
          "required": false,
          "type": "boolean",
          "default": "true",
          "description": "When `true`, keyboard navigation will loop from last item to first, and vice versa."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Item",
      "description": "An item in the group that can be checked. An `input` will also render when used within a `form` to ensure events propagate correctly.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "value",
          "type": "string",
          "description": "The value given as data when submitted with a `name`."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the radio item."
        },
        {
          "name": "required",
          "type": "boolean",
          "description": "When `true`, indicates that the user must check the radio item before the owning form can be submitted."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "checked",
            "unchecked"
          ]
        },
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Indicator",
      "description": "Renders when the radio item is in a checked state. You can style this element directly, or you can use it as a wrapper to put an icon into, or both.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "forceMount",
          "type": "boolean",
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "checked",
            "unchecked"
          ]
        },
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        }
      ],
      "cssVariables": []
    }
  ],
  "examples": [
    {
      "title": "Decoupling the hidden input",
      "description": "By default, `RadioGroup.Item` renders a visually hidden `input` for form submission. To recompose, move, or exclude that input, you can build each item from its lower-level parts instead.\n\n> **Important:** These parts are unstable and prefixed with `unstable_`, so their API may change in a future release.\n\n- `RadioGroup.unstable_ItemProvider` provides the item state and accepts the item's `value` and `disabled` props.\n- `RadioGroup.unstable_ItemTrigger` is the interactive element that wraps `RadioGroup.Indicator`.\n- `RadioGroup.unstable_ItemBubbleInput` is the visually hidden input that `RadioGroup.Item` renders by default. Omit it when you don't need form submission.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { RadioGroup } from \"solidix\";\n\nexport default () => (\n\t<RadioGroup.Root>\n\t\t{[\"one\", \"two\", \"three\"].map((value) => (\n\t\t\t<RadioGroup.ItemProvider key={value} value={value}>\n\t\t\t\t<RadioGroup.ItemTrigger>\n\t\t\t\t\t<RadioGroup.Indicator />\n\t\t\t\t</RadioGroup.ItemTrigger>\n\t\t\t\t<RadioGroup.ItemBubbleInput />\n\t\t\t</RadioGroup.ItemProvider>\n\t\t))}\n\t</RadioGroup.Root>\n);"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Radio Group WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio) and uses [roving tabindex](https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio) to manage focus movement among radio items.",
  "keyboard": [
    {
      "keys": [
        "Tab"
      ],
      "description": "Moves focus to either the checked radio item or the first radio item in the group."
    },
    {
      "keys": [
        "Space"
      ],
      "description": "When focus is on an unchecked radio item, checks it."
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "Moves focus and checks the next radio item in the group."
    },
    {
      "keys": [
        "ArrowRight"
      ],
      "description": "Moves focus and checks the next radio item in the group."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "Moves focus to the previous radio item in the group."
    },
    {
      "keys": [
        "ArrowLeft"
      ],
      "description": "Moves focus to the previous radio item in the group."
    }
  ],
  "notes": ""
};
