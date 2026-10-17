import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "accordion",
  "title": "Accordion",
  "metaDescription": "A vertically stacked set of interactive headings that each reveal an associated section of content.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/accordion",
  "description": "A vertically stacked set of interactive headings that each reveal an\n\tassociated section of content.",
  "features": [
    "Full keyboard navigation.",
    "Supports horizontal/vertical orientation.",
    "Supports Right to Left direction.",
    "Can expand one or multiple items.",
    "Can be controlled or uncontrolled."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Accordion } from \"soldix\";\n\nexport default () => (\n\t<Accordion.Root>\n\t\t<Accordion.Item>\n\t\t\t<Accordion.Header>\n\t\t\t\t<Accordion.Trigger />\n\t\t\t</Accordion.Header>\n\t\t\t<Accordion.Content />\n\t\t</Accordion.Item>\n\t</Accordion.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of an accordion.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "type",
          "required": true,
          "type": "\"single\" | \"multiple\"",
          "typeSimple": "enum",
          "description": "Determines whether one or multiple items can be opened at the same time."
        },
        {
          "name": "value",
          "required": false,
          "type": "string",
          "description": "The controlled value of the item to expand when `type` is `\"single\"`. Must be used in conjunction with `onValueChange`."
        },
        {
          "name": "defaultValue",
          "required": false,
          "type": "string",
          "description": "The value of the item to expand when initially rendered and `type` is `\"single\"`. Use when you do not need to control the state of the items."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the expanded state of an item changes and `type` is `\"single\"`."
        },
        {
          "name": "value",
          "required": false,
          "default": "[]",
          "type": "string[]",
          "description": "The controlled value of the item to expand when `type` is `\"multiple\"`. Must be used in conjunction with `onValueChange`."
        },
        {
          "name": "defaultValue",
          "required": false,
          "default": "[]",
          "type": "string[]",
          "description": "The value of the item to expand when initially rendered when `type` is `\"multiple\"`. Use when you do not need to control the state of the items."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "(value: string[]) => void",
          "typeSimple": "function",
          "description": "Event handler called when the expanded state of an item changes and `type` is `\"multiple\"`."
        },
        {
          "name": "collapsible",
          "required": false,
          "default": "false",
          "type": "boolean",
          "description": "When `type` is `\"single\"`, allows closing content when clicking trigger for an open item."
        },
        {
          "name": "disabled",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "When `true`, prevents the user from interacting with the accordion and all its items."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "default": "\"ltr\"",
          "description": "The reading direction of the accordion when applicable. If omitted, assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "orientation",
          "required": false,
          "type": "\"horizontal\" | \"vertical\"",
          "typeSimple": "enum",
          "default": "\"vertical\"",
          "description": "The orientation of the accordion."
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
      "name": "Item",
      "description": "Contains all the parts of a collapsible section.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "disabled",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "When `true`, prevents the user from interacting with the item."
        },
        {
          "name": "value",
          "required": true,
          "type": "string",
          "description": "A unique value for the item."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "open",
            "closed"
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
      "name": "Header",
      "description": "Wraps an `Accordion.Trigger`. Use the `asChild` prop to update it to the appropriate heading level for your page.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "open",
            "closed"
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
      "name": "Trigger",
      "description": "Toggles the collapsed state of its associated item. It should be nested inside of an `Accordion.Header`.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "open",
            "closed"
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
      "description": "Contains the collapsible content for an item.",
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
            "open",
            "closed"
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
      "cssVariables": [
        {
          "cssVariable": "--radix-accordion-content-width",
          "description": "The width of the content when it opens/closes"
        },
        {
          "cssVariable": "--radix-accordion-content-height",
          "description": "The height of the content when it opens/closes"
        }
      ]
    }
  ],
  "examples": [
    {
      "title": "Expanded by default",
      "description": "Use the `defaultValue` prop to define the open item by default.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1
          ],
          "code": "<Accordion.Root type=\"single\" defaultValue=\"item-2\">\n\t<Accordion.Item value=\"item-1\">…</Accordion.Item>\n\t<Accordion.Item value=\"item-2\">…</Accordion.Item>\n</Accordion.Root>"
        }
      ]
    },
    {
      "title": "Allow collapsing all items",
      "description": "Use the `collapsible` prop to allow all items to close.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1
          ],
          "code": "<Accordion.Root type=\"single\" collapsible>\n\t<Accordion.Item value=\"item-1\">…</Accordion.Item>\n\t<Accordion.Item value=\"item-2\">…</Accordion.Item>\n</Accordion.Root>"
        }
      ]
    },
    {
      "title": "Multiple items open at the same time",
      "description": "Set the `type` prop to `multiple` to enable opening multiple items at once.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1
          ],
          "code": "<Accordion.Root type=\"multiple\">\n\t<Accordion.Item value=\"item-1\">…</Accordion.Item>\n\t<Accordion.Item value=\"item-2\">…</Accordion.Item>\n</Accordion.Root>"
        }
      ]
    },
    {
      "title": "Rotated icon when open",
      "description": "You can add extra decorative elements, such as chevrons, and rotate it when the item is open.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            12
          ],
          "code": "// index.jsx\nimport { Accordion } from \"soldix\";\nimport { ChevronDownIcon } from \"@radix-ui/react-icons\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Accordion.Root type=\"single\">\n\t\t<Accordion.Item value=\"item-1\">\n\t\t\t<Accordion.Header>\n\t\t\t\t<Accordion.Trigger class=\"AccordionTrigger\">\n\t\t\t\t\t<span>Trigger text</span>\n\t\t\t\t\t<ChevronDownIcon className=\"AccordionChevron\" aria-hidden />\n\t\t\t\t</Accordion.Trigger>\n\t\t\t</Accordion.Header>\n\t\t\t<Accordion.Content>…</Accordion.Content>\n\t\t</Accordion.Item>\n\t</Accordion.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            5,
            6,
            7
          ],
          "code": "/* styles.css */\n.AccordionChevron {\n\ttransition: transform 300ms;\n}\n.AccordionTrigger[data-state=\"open\"] > .AccordionChevron {\n\ttransform: rotate(180deg);\n}"
        }
      ]
    },
    {
      "title": "Horizontal orientation",
      "description": "Use the `orientation` prop to create a horizontal accordion.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1
          ],
          "code": "<Accordion.Root orientation=\"horizontal\">\n\t<Accordion.Item value=\"item-1\">…</Accordion.Item>\n\t<Accordion.Item value=\"item-2\">…</Accordion.Item>\n</Accordion.Root>"
        }
      ]
    },
    {
      "title": "Animating content size",
      "description": "Use the `--radix-accordion-content-width` and/or `--radix-accordion-content-height` CSS variables to animate the size of the content when it opens/closes:",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "// index.jsx\nimport { Accordion } from \"soldix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Accordion.Root type=\"single\">\n\t\t<Accordion.Item value=\"item-1\">\n\t\t\t<Accordion.Header>…</Accordion.Header>\n\t\t\t<Accordion.Content className=\"AccordionContent\">…</Accordion.Content>\n\t\t</Accordion.Item>\n\t</Accordion.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            21,
            27
          ],
          "code": "/* styles.css */\n.AccordionContent {\n\toverflow: hidden;\n}\n.AccordionContent[data-state=\"open\"] {\n\tanimation: slideDown 300ms ease-out;\n}\n.AccordionContent[data-state=\"closed\"] {\n\tanimation: slideUp 300ms ease-out;\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\theight: 0;\n\t}\n\tto {\n\t\theight: var(--radix-accordion-content-height);\n\t}\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\theight: var(--radix-accordion-content-height);\n\t}\n\tto {\n\t\theight: 0;\n\t}\n}"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Accordion WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion).",
  "keyboard": [
    {
      "keys": [
        "Space"
      ],
      "description": "When focus is on an `Accordion.Trigger` of a collapsed section, expands the section."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "When focus is on an `Accordion.Trigger` of a collapsed section, expands the section."
    },
    {
      "keys": [
        "Tab"
      ],
      "description": "Moves focus to the next focusable element."
    },
    {
      "keys": [
        "Shift + Tab"
      ],
      "description": "Moves focus to the previous focusable element."
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "Moves focus to the next `Accordion.Trigger` when `orientation` is `vertical`."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "Moves focus to the previous `Accordion.Trigger` when `orientation` is `vertical`."
    },
    {
      "keys": [
        "ArrowRight"
      ],
      "description": "Moves focus to the next `Accordion.Trigger` when `orientation` is `horizontal`."
    },
    {
      "keys": [
        "ArrowLeft"
      ],
      "description": "Moves focus to the previous `Accordion.Trigger` when `orientation` is `horizontal`."
    },
    {
      "keys": [
        "Home"
      ],
      "description": "When focus is on an `Accordion.Trigger`, moves focus to the first `Accordion.Trigger`."
    },
    {
      "keys": [
        "End"
      ],
      "description": "When focus is on an `Accordion.Trigger`, moves focus to the last `Accordion.Trigger`."
    }
  ],
  "notes": ""
};
