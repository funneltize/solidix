import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "tabs",
  "title": "Tabs",
  "metaDescription": "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/tabs",
  "description": "A set of layered sections of content—known as tab panels—that are displayed\n\tone at a time.",
  "features": [
    "Can be controlled or uncontrolled.",
    "Supports horizontal/vertical orientation.",
    "Supports automatic/manual activation.",
    "Full keyboard navigation."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Tabs } from \"solidix\";\n\nexport default () => (\n\t<Tabs.Root>\n\t\t<Tabs.List>\n\t\t\t<Tabs.Trigger />\n\t\t</Tabs.List>\n\t\t<Tabs.Content />\n\t</Tabs.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the tabs component parts.",
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
          "required": false,
          "type": "string",
          "description": "The value of the tab that should be active when initially rendered. Use when you do not need to control the state of the tabs."
        },
        {
          "name": "value",
          "required": false,
          "type": "string",
          "description": "The controlled value of the tab to activate. Should be used in conjunction with `onValueChange`."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes."
        },
        {
          "name": "orientation",
          "required": false,
          "type": "\"horizontal\" | \"vertical\" | undefined",
          "typeSimple": "enum",
          "default": "\"horizontal\"",
          "description": "The orientation of the component."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "description": "The reading direction of the tabs. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "activationMode",
          "required": false,
          "type": "\"automatic\" | \"manual\"",
          "typeSimple": "enum",
          "default": "\"automatic\"",
          "description": "When `automatic`, tabs are activated when receiving focus. When `manual`, tabs are activated when clicked."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "List",
      "description": "Contains the triggers that are aligned along the edge of the active content.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "loop",
          "required": false,
          "type": "boolean",
          "default": "true",
          "description": "When `true`, keyboard navigation will loop from last tab to first, and vice versa."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "The button that activates its associated content.",
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
          "required": true,
          "type": "string",
          "description": "A unique value that associates the trigger with a content."
        },
        {
          "name": "disabled",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "When `true`, prevents the user from interacting with the tab."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "active",
            "inactive"
          ]
        },
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        },
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Content",
      "description": "Contains the content associated with each trigger.",
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
          "required": true,
          "type": "string",
          "description": "A unique value that associates the content with a trigger."
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
            "active",
            "inactive"
          ]
        },
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    }
  ],
  "examples": [
    {
      "title": "Vertical",
      "description": "You can create vertical tabs by using the `orientation` prop.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4
          ],
          "code": "import { Tabs } from \"solidix\";\n\nexport default () => (\n\t<Tabs.Root defaultValue=\"tab1\" orientation=\"vertical\">\n\t\t<Tabs.List aria-label=\"tabs example\">\n\t\t\t<Tabs.Trigger value=\"tab1\">One</Tabs.Trigger>\n\t\t\t<Tabs.Trigger value=\"tab2\">Two</Tabs.Trigger>\n\t\t\t<Tabs.Trigger value=\"tab3\">Three</Tabs.Trigger>\n\t\t</Tabs.List>\n\t\t<Tabs.Content value=\"tab1\">Tab one content</Tabs.Content>\n\t\t<Tabs.Content value=\"tab2\">Tab two content</Tabs.Content>\n\t\t<Tabs.Content value=\"tab3\">Tab three content</Tabs.Content>\n\t</Tabs.Root>\n);"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Tabs WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs).",
  "keyboard": [
    {
      "keys": [
        "Tab"
      ],
      "description": "When focus moves onto the tabs, focuses the active trigger. When a trigger is focused, moves focus to the active content."
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "Moves focus to the next trigger depending on `orientation` and activates its associated content."
    },
    {
      "keys": [
        "ArrowRight"
      ],
      "description": "Moves focus to the next trigger depending on `orientation` and activates its associated content."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "Moves focus to the previous trigger depending on `orientation` and activates its associated content."
    },
    {
      "keys": [
        "ArrowLeft"
      ],
      "description": "Moves focus to the previous trigger depending on `orientation` and activates its associated content."
    },
    {
      "keys": [
        "Home"
      ],
      "description": "Moves focus to the first trigger and activates its associated content."
    },
    {
      "keys": [
        "End"
      ],
      "description": "Moves focus to the last trigger and activates its associated content."
    }
  ],
  "notes": ""
};
