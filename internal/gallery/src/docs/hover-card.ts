import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "hover-card",
  "title": "Hover Card",
  "metaDescription": "For sighted users to preview content available behind a link.",
  "ariaLink": "",
  "description": "For sighted users to preview content available behind a link.",
  "features": [
    "Can be controlled or uncontrolled.",
    "Customize side, alignment, offsets, collision handling.",
    "Optionally render a pointing arrow.",
    "Supports custom open and close delays.",
    "Ignored by screen readers."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { HoverCard } from \"solidix\";\n\nexport default () => (\n\t<HoverCard.Root>\n\t\t<HoverCard.Trigger />\n\t\t<HoverCard.Portal>\n\t\t\t<HoverCard.Content>\n\t\t\t\t<HoverCard.Arrow />\n\t\t\t</HoverCard.Content>\n\t\t</HoverCard.Portal>\n\t</HoverCard.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a hover card.",
      "props": [
        {
          "name": "defaultOpen",
          "type": "boolean",
          "description": "The open state of the hover card when it is initially rendered. Use when you do not need to control its open state."
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "The controlled open state of the hover card. Must be used in conjunction with `onOpenChange`."
        },
        {
          "name": "onOpenChange",
          "type": "(open: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the open state of the hover card changes."
        },
        {
          "name": "openDelay",
          "type": "number",
          "default": 700,
          "description": "The duration from when the mouse enters the trigger until the hover card opens."
        },
        {
          "name": "closeDelay",
          "type": "number",
          "default": 300,
          "description": "The duration from when the mouse leaves the trigger or content until the hover card closes."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "The link that opens the hover card when hovered.",
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
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Portal",
      "description": "When used, portals the content part into the `body`.",
      "props": [
        {
          "name": "forceMount",
          "type": "boolean",
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `HoverCard.Content`."
        },
        {
          "name": "container",
          "type": "HTMLElement",
          "default": "document.body",
          "description": "Specify a container element to portal the content into."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Content",
      "description": "The component that pops out when the hover card is open.",
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `HoverCard.Portal`."
        },
        {
          "name": "side",
          "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
          "typeSimple": "enum",
          "default": "\"bottom\"",
          "description": "The preferred side of the trigger to render against when open. Will be reversed when collisions occur and `avoidCollisions` is enabled."
        },
        {
          "name": "sideOffset",
          "type": "number",
          "default": "0",
          "description": "The distance in pixels from the trigger."
        },
        {
          "name": "align",
          "type": "\"start\" | \"center\" | \"end\"",
          "typeSimple": "enum",
          "default": "\"center\"",
          "description": "The preferred alignment against the trigger. May change when collisions occur."
        },
        {
          "name": "alignOffset",
          "type": "number",
          "default": "0",
          "description": "An offset in pixels from the `\"start\"` or `\"end\"` alignment options."
        },
        {
          "name": "avoidCollisions",
          "type": "boolean",
          "default": "true",
          "description": "When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges."
        },
        {
          "name": "collisionBoundary",
          "type": "Element | null | Array<Element | null>",
          "typeSimple": "Boundary",
          "default": "[]",
          "description": "The element used as the collision boundary. By default this is the viewport, though you can provide additional element(s) to be included in this check."
        },
        {
          "name": "collisionPadding",
          "type": "number | Partial<Record<Side, number>>",
          "typeSimple": "number | Padding",
          "default": "0",
          "description": "The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object, for example: `{`{ top: 20, left: 20 }`}`."
        },
        {
          "name": "arrowPadding",
          "type": "number",
          "default": "0",
          "description": "The padding between the arrow and the edges of the content. If your content has `border-radius`, this will prevent it from overflowing the corners."
        },
        {
          "name": "sticky",
          "type": "\"partial\" | \"always\"",
          "typeSimple": "enum",
          "default": "\"partial\"",
          "description": "The sticky behavior on the align axis. `\"partial\"` will keep the content in the boundary as long as the trigger is at least partially in the boundary whilst `\"always\"` will keep the content in the boundary regardless."
        },
        {
          "name": "hideWhenDetached",
          "type": "boolean",
          "default": "false",
          "description": "Whether to hide the content when the trigger becomes fully occluded."
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
          "attribute": "[data-side]",
          "values": [
            "left",
            "right",
            "bottom",
            "top"
          ]
        },
        {
          "attribute": "[data-align]",
          "values": [
            "start",
            "end",
            "center"
          ]
        }
      ],
      "cssVariables": [
        {
          "cssVariable": "--radix-hover-card-content-transform-origin",
          "description": "The `transform-origin` computed from the content and arrow positions/offsets"
        },
        {
          "cssVariable": "--radix-hover-card-content-available-width",
          "description": "The remaining width between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-hover-card-content-available-height",
          "description": "The remaining height between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-hover-card-trigger-width",
          "description": "The width of the trigger"
        },
        {
          "cssVariable": "--radix-hover-card-trigger-height",
          "description": "The height of the trigger"
        }
      ]
    },
    {
      "name": "Arrow",
      "description": "An optional arrow element to render alongside the hover card. This can be used to help visually link the trigger with the `HoverCard.Content`. Must be rendered inside `HoverCard.Content`.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "width",
          "type": "number",
          "default": 10,
          "description": "The width of the arrow in pixels."
        },
        {
          "name": "height",
          "type": "number",
          "default": 5,
          "description": "The height of the arrow in pixels."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    }
  ],
  "examples": [
    {
      "title": "Show instantly",
      "description": "Use the `openDelay` prop to control the time it takes for the hover card to open.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4
          ],
          "code": "import { HoverCard } from \"solidix\";\n\nexport default () => (\n\t<HoverCard.Root openDelay={0}>\n\t\t<HoverCard.Trigger>…</HoverCard.Trigger>\n\t\t<HoverCard.Content>…</HoverCard.Content>\n\t</HoverCard.Root>\n);"
        }
      ]
    },
    {
      "title": "Constrain the content size",
      "description": "You may want to constrain the width of the content so that it matches the trigger width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-hover-card-trigger-width` and `--radix-hover-card-content-available-height` to support this. Use them to constrain the content dimensions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "// index.jsx\nimport { HoverCard } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<HoverCard.Root>\n\t\t<HoverCard.Trigger>…</HoverCard.Trigger>\n\t\t<HoverCard.Portal>\n\t\t\t<HoverCard.Content className=\"HoverCardContent\" sideOffset={5}>\n\t\t\t\t…\n\t\t\t</HoverCard.Content>\n\t\t</HoverCard.Portal>\n\t</HoverCard.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [],
          "code": "/* styles.css */\n.HoverCardContent {\n\twidth: var(--radix-hover-card-trigger-width);\n\tmax-height: var(--radix-hover-card-content-available-height);\n}"
        }
      ]
    },
    {
      "title": "Origin-aware animations",
      "description": "We expose a CSS custom property `--radix-hover-card-content-transform-origin`. Use it to animate the content from its computed origin based on `side`, `sideOffset`, `align`, `alignOffset` and any collisions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            8
          ],
          "code": "// index.jsx\nimport { HoverCard } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<HoverCard.Root>\n\t\t<HoverCard.Trigger>…</HoverCard.Trigger>\n\t\t<HoverCard.Content className=\"HoverCardContent\">…</HoverCard.Content>\n\t</HoverCard.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            3
          ],
          "code": "/* styles.css */\n.HoverCardContent {\n\ttransform-origin: var(--radix-hover-card-content-transform-origin);\n\tanimation: scaleIn 0.5s ease-out;\n}\n\n@keyframes scaleIn {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t}\n}"
        }
      ]
    },
    {
      "title": "Collision-aware animations",
      "description": "We expose `data-side` and `data-align` attributes. Their values will change at runtime to reflect collisions. Use them to create collision and direction-aware animations.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            8
          ],
          "code": "// index.jsx\nimport { HoverCard } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<HoverCard.Root>\n\t\t<HoverCard.Trigger>…</HoverCard.Trigger>\n\t\t<HoverCard.Content className=\"HoverCardContent\">…</HoverCard.Content>\n\t</HoverCard.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            6,
            7,
            8,
            9,
            10,
            11
          ],
          "code": "/* styles.css */\n.HoverCardContent {\n\tanimation-duration: 0.6s;\n\tanimation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);\n}\n.HoverCardContent[data-side=\"top\"] {\n\tanimation-name: slideUp;\n}\n.HoverCardContent[data-side=\"bottom\"] {\n\tanimation-name: slideDown;\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(-10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "The hover card is intended for sighted users only, the content will be inaccessible to keyboard users.",
  "keyboard": [
    {
      "keys": [
        "Tab"
      ],
      "description": "Opens/closes the hover card."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "Opens the hover card link"
    }
  ],
  "notes": ""
};
