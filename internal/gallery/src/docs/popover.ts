import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "popover",
  "title": "Popover",
  "metaDescription": "Displays rich content in a portal, triggered by a button.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal",
  "description": "Displays rich content in a portal, triggered by a button.",
  "features": [
    "Can be controlled or uncontrolled.",
    "Customize side, alignment, offsets, collision handling.",
    "Optionally render a pointing arrow.",
    "Focus is fully managed and customizable.",
    "Supports modal and non-modal modes.",
    "Dismissing and layering behavior is highly customizable."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Popover } from \"solidix\";\n\nexport default () => (\n\t<Popover.Root>\n\t\t<Popover.Trigger />\n\t\t<Popover.Anchor />\n\t\t<Popover.Portal>\n\t\t\t<Popover.Content>\n\t\t\t\t<Popover.Close />\n\t\t\t\t<Popover.Arrow />\n\t\t\t</Popover.Content>\n\t\t</Popover.Portal>\n\t</Popover.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a popover.",
      "props": [
        {
          "name": "defaultOpen",
          "type": "boolean",
          "description": "The open state of the popover when it is initially rendered. Use when you do not need to control its open state."
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "The controlled open state of the popover. Must be used in conjunction with `onOpenChange`."
        },
        {
          "name": "onOpenChange",
          "type": "(open: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the open state of the popover changes."
        },
        {
          "name": "modal",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "The modality of the popover. When set to `true`, interaction with outside elements will be disabled and only popover content will be visible to screen readers."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "The button that toggles the popover. By default, the `Popover.Content` will position itself against the trigger.",
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
      "name": "Anchor",
      "description": "An optional element to position the `Popover.Content` against. If this part is not used, the content will position alongside the `Popover.Trigger`.",
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
      "name": "Portal",
      "description": "When used, portals the content part into the `body`.",
      "props": [
        {
          "name": "forceMount",
          "type": "boolean",
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `Popover.Content`."
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
      "description": "The component that pops out when the popover is open.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "onOpenAutoFocus",
          "type": "(event: Event) => void",
          "typeSimple": "function",
          "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onCloseAutoFocus",
          "type": "(event: Event) => void",
          "typeSimple": "function",
          "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onEscapeKeyDown",
          "type": "(event: KeyboardEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onPointerDownOutside",
          "type": "(event: PointerDownOutsideEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onFocusOutside",
          "type": "(event: FocusOutsideEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when focus moves outside the bounds of the component. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onInteractOutside",
          "type": "(event: PointerDownOutsideEvent | FocusOutsideEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "forceMount",
          "type": "boolean",
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `Popover.Portal`."
        },
        {
          "name": "side",
          "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
          "typeSimple": "enum",
          "default": "\"bottom\"",
          "description": "The preferred side of the anchor to render against when open. Will be reversed when collisions occur and `avoidCollisions` is enabled."
        },
        {
          "name": "sideOffset",
          "type": "number",
          "default": "0",
          "description": "The distance in pixels from the anchor."
        },
        {
          "name": "align",
          "type": "\"start\" | \"center\" | \"end\"",
          "typeSimple": "enum",
          "default": "\"center\"",
          "description": "The preferred alignment against the anchor. May change when collisions occur."
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
          "cssVariable": "--radix-popover-content-transform-origin",
          "description": "The `transform-origin` computed from the content and arrow positions/offsets"
        },
        {
          "cssVariable": "--radix-popover-content-available-width",
          "description": "The remaining width between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-popover-content-available-height",
          "description": "The remaining height between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-popover-trigger-width",
          "description": "The width of the trigger"
        },
        {
          "cssVariable": "--radix-popover-trigger-height",
          "description": "The height of the trigger"
        }
      ]
    },
    {
      "name": "Arrow",
      "description": "An optional arrow element to render alongside the popover. This can be used to help visually link the anchor with the `Popover.Content`. Must be rendered inside `Popover.Content`.",
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
    },
    {
      "name": "Close",
      "description": "The button that closes an open popover.",
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
  "examples": [
    {
      "title": "Constrain the content size",
      "description": "You may want to constrain the width of the content so that it matches the trigger width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-popover-trigger-width` and `--radix-popover-content-available-height` to support this. Use them to constrain the content dimensions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "// index.jsx\nimport { Popover } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Popover.Root>\n\t\t<Popover.Trigger>…</Popover.Trigger>\n\t\t<Popover.Portal>\n\t\t\t<Popover.Content className=\"PopoverContent\" sideOffset={5}>\n\t\t\t\t…\n\t\t\t</Popover.Content>\n\t\t</Popover.Portal>\n\t</Popover.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [],
          "code": "/* styles.css */\n.PopoverContent {\n\twidth: var(--radix-popover-trigger-width);\n\tmax-height: var(--radix-popover-content-available-height);\n}"
        }
      ]
    },
    {
      "title": "Origin-aware animations",
      "description": "We expose a CSS custom property `--radix-popover-content-transform-origin`. Use it to animate the content from its computed origin based on `side`, `sideOffset`, `align`, `alignOffset` and any collisions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "// index.jsx\nimport { Popover } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Popover.Root>\n\t\t<Popover.Trigger>…</Popover.Trigger>\n\t\t<Popover.Portal>\n\t\t\t<Popover.Content className=\"PopoverContent\">…</Popover.Content>\n\t\t</Popover.Portal>\n\t</Popover.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            3
          ],
          "code": "/* styles.css */\n.PopoverContent {\n\ttransform-origin: var(--radix-popover-content-transform-origin);\n\tanimation: scaleIn 0.5s ease-out;\n}\n\n@keyframes scaleIn {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t}\n}"
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
            9
          ],
          "code": "// index.jsx\nimport { Popover } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Popover.Root>\n\t\t<Popover.Trigger>…</Popover.Trigger>\n\t\t<Popover.Portal>\n\t\t\t<Popover.Content className=\"PopoverContent\">…</Popover.Content>\n\t\t</Popover.Portal>\n\t</Popover.Root>\n);"
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
          "code": "/* styles.css */\n.PopoverContent {\n\tanimation-duration: 0.6s;\n\tanimation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);\n}\n.PopoverContent[data-side=\"top\"] {\n\tanimation-name: slideUp;\n}\n.PopoverContent[data-side=\"bottom\"] {\n\tanimation-name: slideDown;\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(-10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}"
        }
      ]
    },
    {
      "title": "With custom anchor",
      "description": "You can anchor the content to another element if you do not want to use the trigger as the anchor.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            7,
            8,
            9,
            10,
            11
          ],
          "code": "// index.jsx\nimport { Popover } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Popover.Root>\n\t\t<Popover.Anchor asChild>\n\t\t\t<div class=\"Row\">\n\t\t\t\tRow as anchor <Popover.Trigger>Trigger</Popover.Trigger>\n\t\t\t</div>\n\t\t</Popover.Anchor>\n\n\t\t<Popover.Portal>\n\t\t\t<Popover.Content>…</Popover.Content>\n\t\t</Popover.Portal>\n\t</Popover.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [],
          "code": "/* styles.css */\n.Row {\n\tbackground-color: gainsboro;\n\tpadding: 20px;\n}"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Dialog WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal).",
  "keyboard": [
    {
      "keys": [
        "Space"
      ],
      "description": "Opens/closes the popover."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "Opens/closes the popover."
    },
    {
      "keys": [
        "Tab"
      ],
      "description": "Moves focus to the next focusable element"
    },
    {
      "keys": [
        "Shift + Tab"
      ],
      "description": "Moves focus to the previous focusable element"
    },
    {
      "keys": [
        "Esc"
      ],
      "description": "Closes the popover and moves focus to `Popover.Trigger`."
    }
  ],
  "notes": ""
};
