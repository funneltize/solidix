import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "collapsible",
  "title": "Collapsible",
  "metaDescription": "An interactive component which expands/collapses a panel.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure",
  "description": "An interactive component which expands/collapses a panel.",
  "features": [
    "Full keyboard navigation.",
    "Can be controlled or uncontrolled."
  ],
  "anatomyIntro": "Import the components and piece the parts together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Collapsible } from \"soldix\";\n\nexport default () => (\n\t<Collapsible.Root>\n\t\t<Collapsible.Trigger />\n\t\t<Collapsible.Content />\n\t</Collapsible.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a collapsible.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "defaultOpen",
          "type": "boolean",
          "description": "The open state of the collapsible when it is initially rendered. Use when you do not need to control its open state."
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "The controlled open state of the collapsible. Must be used in conjunction with `onOpenChange`."
        },
        {
          "name": "onOpenChange",
          "type": "(open: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the open state of the collapsible changes."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the collapsible."
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
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "The button that toggles the collapsible.",
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
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Content",
      "description": "The component that contains the collapsible content.",
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
        }
      ],
      "cssVariables": [
        {
          "cssVariable": "--radix-collapsible-content-width",
          "description": "The width of the content when it opens/closes"
        },
        {
          "cssVariable": "--radix-collapsible-content-height",
          "description": "The height of the content when it opens/closes"
        }
      ]
    }
  ],
  "examples": [
    {
      "title": "Animating content size",
      "description": "Use the `--radix-collapsible-content-width` and/or `--radix-collapsible-content-height` CSS variables to animate the size of the content when it opens/closes. Here's a demo:",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            8
          ],
          "code": "// index.jsx\nimport { Collapsible } from \"soldix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Collapsible.Root>\n\t\t<Collapsible.Trigger>…</Collapsible.Trigger>\n\t\t<Collapsible.Content className=\"CollapsibleContent\">\n\t\t\t…\n\t\t</Collapsible.Content>\n\t</Collapsible.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            17,
            23
          ],
          "code": "/* styles.css */\n.CollapsibleContent {\n\toverflow: hidden;\n}\n.CollapsibleContent[data-state=\"open\"] {\n\tanimation: slideDown 300ms ease-out;\n}\n.CollapsibleContent[data-state=\"closed\"] {\n\tanimation: slideUp 300ms ease-out;\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\theight: 0;\n\t}\n\tto {\n\t\theight: var(--radix-collapsible-content-height);\n\t}\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\theight: var(--radix-collapsible-content-height);\n\t}\n\tto {\n\t\theight: 0;\n\t}\n}"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Disclosure WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure).",
  "keyboard": [
    {
      "keys": [
        "Space"
      ],
      "description": "Opens/closes the collapsible."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "Opens/closes the collapsible."
    }
  ],
  "notes": ""
};
