import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "scroll-area",
  "title": "Scroll Area",
  "metaDescription": "Augments native scroll functionality for custom, cross-browser styling.",
  "ariaLink": "",
  "description": "Augments native scroll functionality for custom, cross-browser styling.",
  "features": [
    "Scrollbar sits on top of the scrollable content, taking up no space.",
    "Scrolling is native; no underlying position movements via CSS transformations.",
    "Shims pointer behaviors only when interacting with the controls, so keyboard controls are unaffected.",
    "Supports Right to Left direction."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { ScrollArea } from \"solidix\";\n\nexport default () => (\n\t<ScrollArea.Root>\n\t\t<ScrollArea.Viewport />\n\t\t<ScrollArea.Scrollbar orientation=\"horizontal\">\n\t\t\t<ScrollArea.Thumb />\n\t\t</ScrollArea.Scrollbar>\n\t\t<ScrollArea.Scrollbar orientation=\"vertical\">\n\t\t\t<ScrollArea.Thumb />\n\t\t</ScrollArea.Scrollbar>\n\t\t<ScrollArea.Corner />\n\t</ScrollArea.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a scroll area.",
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
          "type": "\"auto\" | \"always\" | \"scroll\" | \"hover\"",
          "typeSimple": "enum",
          "default": "\"hover\"",
          "description": "Describes the nature of scrollbar visibility, similar to how the scrollbar preferences in MacOS control visibility of native scrollbars.\n\n`\"auto\"` means that scrollbars are visible when content is overflowing on the corresponding orientation.\n\n`\"always\"` means that scrollbars are always visible regardless of whether the content is overflowing.\n\n`\"scroll\"` means that scrollbars are visible when the user is scrolling along its corresponding orientation.\n\n`\"hover\"` when the user is scrolling along its corresponding orientation and when the user is hovering over the scroll area."
        },
        {
          "name": "scrollHideDelay",
          "type": "number",
          "default": "600",
          "description": "If `type` is set to either `\"scroll\"` or `\"hover\"`, this prop determines the length of time, in milliseconds, before the scrollbars are hidden after the user stops interacting with scrollbars."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "description": "The reading direction of the scroll area. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "nonce",
          "required": false,
          "type": "string",
          "description": "An optional nonce attribute that is passed to the inline styles for use in CSP-enabled environments that use strict rules to enhance security."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Viewport",
      "description": "The viewport area of the scroll area.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Scrollbar",
      "description": "The vertical scrollbar. Add a second `Scrollbar` with an `orientation` prop to enable horizontal scrolling.",
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
        },
        {
          "name": "orientation",
          "required": false,
          "type": "\"horizontal\" | \"vertical\"",
          "typeSimple": "enum",
          "default": "vertical",
          "description": "The orientation of the scrollbar"
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-state]",
          "values": [
            "visible",
            "hidden"
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
      "name": "Thumb",
      "description": "The thumb to be used in `ScrollArea.Scrollbar`.",
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
            "visible",
            "hidden"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Corner",
      "description": "The corner where both vertical and horizontal scrollbars meet.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    }
  ],
  "examples": [],
  "customApis": [],
  "accessibility": "In most cases, it's best to rely on native scrolling and work with the customization options available in CSS. When that isn't enough, `ScrollArea` provides additional customizability while maintaining the browser's native scroll behavior (as well as accessibility features, like keyboard scrolling).",
  "keyboard": [],
  "notes": ""
};
