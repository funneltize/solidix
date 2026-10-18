import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "select",
  "title": "Select",
  "metaDescription": "Displays a list of options for the user to pick from - triggered by a button.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/listbox",
  "description": "Displays a list of options for the user to pick from - triggered by a button.",
  "features": [
    "Can be controlled or uncontrolled.",
    "Offers 2 positioning modes.",
    "Supports items, labels, groups of items.",
    "Focus is fully managed.",
    "Full keyboard navigation.",
    "Supports custom placeholder.",
    "Typeahead support.",
    "Supports Right to Left direction."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Select } from \"solidix\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger>\n\t\t\t<Select.Value />\n\t\t\t<Select.Icon />\n\t\t</Select.Trigger>\n\n\t\t<Select.Portal>\n\t\t\t<Select.Content>\n\t\t\t\t<Select.ScrollUpButton />\n\t\t\t\t<Select.Viewport>\n\t\t\t\t\t<Select.Item>\n\t\t\t\t\t\t<Select.ItemText />\n\t\t\t\t\t\t<Select.ItemIndicator />\n\t\t\t\t\t</Select.Item>\n\n\t\t\t\t\t<Select.Group>\n\t\t\t\t\t\t<Select.Label />\n\t\t\t\t\t\t<Select.Item>\n\t\t\t\t\t\t\t<Select.ItemText />\n\t\t\t\t\t\t\t<Select.ItemIndicator />\n\t\t\t\t\t\t</Select.Item>\n\t\t\t\t\t</Select.Group>\n\n\t\t\t\t\t<Select.Separator />\n\t\t\t\t</Select.Viewport>\n\t\t\t\t<Select.ScrollDownButton />\n\t\t\t\t<Select.Arrow />\n\t\t\t</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a select.",
      "props": [
        {
          "name": "defaultValue",
          "required": false,
          "type": "string",
          "description": "The value of the select when initially rendered. Use when you do not need to control the state of the select."
        },
        {
          "name": "value",
          "required": false,
          "type": "string",
          "description": "The controlled value of the select. Should be used in conjunction with `onValueChange`."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes."
        },
        {
          "name": "defaultOpen",
          "type": "boolean",
          "description": "The open state of the select when it is initially rendered. Use when you do not need to control its open state."
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "The controlled open state of the select. Must be used in conjunction with `onOpenChange`."
        },
        {
          "name": "onOpenChange",
          "type": "(open: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the open state of the select changes."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "description": "The reading direction of the select when applicable. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name of the select. Submitted with its owning form as part of a name/value pair."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with select."
        },
        {
          "name": "required",
          "type": "boolean",
          "description": "When `true`, indicates that the user must select a value before the owning form can be submitted."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "The button that toggles the select. The `Select.Content` will position itself by aligning over the trigger.",
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
          "attribute": "[data-placeholder]",
          "values": [
            "Present when has placeholder"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Value",
      "description": "The part that reflects the selected value. By default the selected item's text will be rendered. if you require more control, you can instead control the select and pass your own `children`. It should not be styled to ensure correct positioning. An optional `placeholder` prop is also available for when the select has no value.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "placeholder",
          "required": false,
          "type": "ReactNode",
          "description": "The content that will be rendered inside the `Select.Value` when no `value` or `defaultValue` is set."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Icon",
      "description": "A small icon often displayed next to the value as a visual affordance for the fact it can be open. By default renders ▼ but you can use your own icon via `asChild` or use `children`.",
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `Select.Content`."
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
      "description": "The component that pops out when the select is open.",
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `Select.Portal`."
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
          "name": "position",
          "type": "\"item-aligned\" | \"popper\"",
          "typeSimple": "enum",
          "default": "\"item-aligned\"",
          "description": "The positioning mode to use, `item-aligned` is the default and behaves similarly to a native MacOS menu by positioning content relative to the active item. `popper` positions content in the same way as our other primitives, for example `Popover` or `DropdownMenu`."
        },
        {
          "name": "side",
          "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
          "typeSimple": "enum",
          "default": "\"bottom\"",
          "description": "The preferred side of the anchor to render against when open. Will be reversed when collisions occur and `avoidCollisions` is enabled. Only available when `position` is set to `popper`."
        },
        {
          "name": "sideOffset",
          "type": "number",
          "default": "0",
          "description": "The distance in pixels from the anchor. Only available when `position` is set to `popper`."
        },
        {
          "name": "align",
          "type": "\"start\" | \"center\" | \"end\"",
          "typeSimple": "enum",
          "default": "\"start\"",
          "description": "The preferred alignment against the anchor. May change when collisions occur. Only available when `position` is set to `popper`."
        },
        {
          "name": "alignOffset",
          "type": "number",
          "default": "0",
          "description": "An offset in pixels from the `\"start\"` or `\"end\"` alignment options. Only available when `position` is set to `popper`."
        },
        {
          "name": "avoidCollisions",
          "type": "boolean",
          "default": "true",
          "description": "When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges. Only available when `position` is set to `popper`."
        },
        {
          "name": "collisionBoundary",
          "type": "Element | null | Array<Element | null>",
          "typeSimple": "Boundary",
          "default": "[]",
          "description": "The element used as the collision boundary. By default this is the viewport, though you can provide additional element(s) to be included in this check. Only available when `position` is set to `popper`."
        },
        {
          "name": "collisionPadding",
          "type": "number | Partial<Record<Side, number>>",
          "typeSimple": "number | Padding",
          "default": "10",
          "description": "The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object, for example: `{`{ top: 20, left: 20 }`}`. Only available when `position` is set to `popper`."
        },
        {
          "name": "arrowPadding",
          "type": "number",
          "default": "0",
          "description": "The padding between the arrow and the edges of the content. If your content has `border-radius`, this will prevent it from overflowing the corners. Only available when `position` is set to `popper`."
        },
        {
          "name": "sticky",
          "type": "\"partial\" | \"always\"",
          "typeSimple": "enum",
          "default": "\"partial\"",
          "description": "The sticky behavior on the align axis. `\"partial\"` will keep the content in the boundary as long as the trigger is at least partially in the boundary whilst `\"always\"` will keep the content in the boundary regardless. Only available when `position` is set to `popper`."
        },
        {
          "name": "hideWhenDetached",
          "type": "boolean",
          "default": "false",
          "description": "Whether to hide the content when the trigger becomes fully occluded. Only available when `position` is set to `popper`."
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
          "cssVariable": "--radix-select-content-transform-origin",
          "description": "The `transform-origin` computed from the content and arrow positions/offsets. Only present when `position=\"popper\"`."
        },
        {
          "cssVariable": "--radix-select-content-available-width",
          "description": "The remaining width between the trigger and the boundary edge. Only present when `position=\"popper\"`."
        },
        {
          "cssVariable": "--radix-select-content-available-height",
          "description": "The remaining height between the trigger and the boundary edge. Only present when `position=\"popper\"`."
        },
        {
          "cssVariable": "--radix-select-trigger-width",
          "description": "The width of the trigger. Only present when `position=\"popper\"`."
        },
        {
          "cssVariable": "--radix-select-trigger-height",
          "description": "The height of the trigger. Only present when `position=\"popper\"`."
        }
      ]
    },
    {
      "name": "Viewport",
      "description": "The scrolling viewport that contains all of the items.",
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
      "name": "Item",
      "description": "The component that contains the select items.",
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
          "description": "The value given as data when submitted with a `name`."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the item."
        },
        {
          "name": "textValue",
          "type": "string",
          "description": "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the `Select.ItemText` part. Use this when the content is complex, or you have non-textual content inside."
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
          "attribute": "[data-highlighted]",
          "values": [
            "Present when highlighted"
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
      "name": "ItemText",
      "description": "The textual part of the item. It should only contain the text you want to see in the trigger when that item is selected. It should not be styled to ensure correct positioning.",
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
      "name": "ItemIndicator",
      "description": "Renders when the item is selected. You can style this element directly, or you can use it as a wrapper to put an icon into, or both.",
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
      "name": "ScrollUpButton",
      "description": "An optional button used as an affordance to show the viewport overflow as well as functionally enable scrolling upwards.",
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
      "name": "ScrollDownButton",
      "description": "An optional button used as an affordance to show the viewport overflow as well as functionally enable scrolling downwards.",
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
      "name": "Group",
      "description": "Used to group multiple items. use in conjunction with `Select.Label` to ensure good accessibility via automatic labelling.",
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
      "name": "Label",
      "description": "Used to render the label of a group. It won't be focusable using arrow keys.",
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
      "name": "Separator",
      "description": "Used to visually separate items in the select.",
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
      "name": "Arrow",
      "description": "An optional arrow element to render alongside the content. This can be used to help visually link the trigger with the `Select.Content`. Must be rendered inside `Select.Content`. Only available when `position` is set to `popper`.",
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
      "title": "Change the positioning mode",
      "description": "By default, `Select` will behave similarly to a native MacOS menu by positioning `Select.Content` relative to the active item. If you would prefer an alternative positioning approach similar to `Popover` or `DropdownMenu` then you can set `position` to `popper` and make use of additional alignment options such as `side`, `sideOffset` and more.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            8
          ],
          "code": "// index.jsx\nimport { Select } from \"solidix\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger>…</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content position=\"popper\" sideOffset={5}>\n\t\t\t\t…\n\t\t\t</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
        }
      ]
    },
    {
      "title": "Constrain the content size",
      "description": "When using `position=\"popper\"` on `Select.Content`, you may want to constrain the width of the content so that it matches the trigger width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-select-trigger-width` and `--radix-select-content-available-height` to support this. Use them to constrain the content dimensions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "// index.jsx\nimport { Select } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger>…</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content\n\t\t\t\tclassName=\"SelectContent\"\n\t\t\t\tposition=\"popper\"\n\t\t\t\tsideOffset={5}\n\t\t\t>\n\t\t\t\t…\n\t\t\t</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [],
          "code": "/* styles.css */\n.SelectContent {\n\twidth: var(--radix-select-trigger-width);\n\tmax-height: var(--radix-select-content-available-height);\n}"
        }
      ]
    },
    {
      "title": "With disabled items",
      "description": "You can add special styles to disabled items via the `data-disabled` attribute.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            11
          ],
          "code": "// index.jsx\nimport { Select } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger>…</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content>\n\t\t\t\t<Select.Viewport>\n\t\t\t\t\t<Select.Item className=\"SelectItem\" disabled>\n\t\t\t\t\t\t…\n\t\t\t\t\t</Select.Item>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t</Select.Viewport>\n\t\t\t</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            2
          ],
          "code": "/* styles.css */\n.SelectItem[data-disabled] {\n\tcolor: \"gainsboro\";\n}"
        }
      ]
    },
    {
      "title": "With a placeholder",
      "description": "You can use the `placeholder` prop on `Value` for when the select has no value. There's also a `data-placeholder` attribute on `Trigger` to help with styling.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            7,
            8
          ],
          "code": "// index.jsx\nimport { Select } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger className=\"SelectTrigger\">\n\t\t\t<Select.Value placeholder=\"Pick an option\" />\n\t\t\t<Select.Icon />\n\t\t</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content>…</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            2
          ],
          "code": "/* styles.css */\n.SelectTrigger[data-placeholder] {\n\tcolor: \"gainsboro\";\n}"
        }
      ]
    },
    {
      "title": "With separators",
      "description": "Use the `Separator` part to add a separator between items.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "<Select.Root>\n\t<Select.Trigger>…</Select.Trigger>\n\t<Select.Portal>\n\t\t<Select.Content>\n\t\t\t<Select.Viewport>\n\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t<Select.Separator />\n\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t</Select.Viewport>\n\t\t</Select.Content>\n\t</Select.Portal>\n</Select.Root>"
        }
      ]
    },
    {
      "title": "With grouped items",
      "description": "Use the `Group` and `Label` parts to group items in a section.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6,
            7,
            11
          ],
          "code": "<Select.Root>\n\t<Select.Trigger>…</Select.Trigger>\n\t<Select.Portal>\n\t\t<Select.Content>\n\t\t\t<Select.Viewport>\n\t\t\t\t<Select.Group>\n\t\t\t\t\t<Select.Label>Label</Select.Label>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t</Select.Group>\n\t\t\t</Select.Viewport>\n\t\t</Select.Content>\n\t</Select.Portal>\n</Select.Root>"
        }
      ]
    },
    {
      "title": "With complex items",
      "description": "You can use custom content in your items.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            11
          ],
          "code": "import { Select } from \"solidix\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger>…</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content>\n\t\t\t\t<Select.Viewport>\n\t\t\t\t\t<Select.Item>\n\t\t\t\t\t\t<Select.ItemText>\n\t\t\t\t\t\t\t<img src=\"…\" />\n\t\t\t\t\t\t\tAdolfo Hess\n\t\t\t\t\t\t</Select.ItemText>\n\t\t\t\t\t\t<Select.ItemIndicator>…</Select.ItemIndicator>\n\t\t\t\t\t</Select.Item>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t\t<Select.Item>…</Select.Item>\n\t\t\t\t</Select.Viewport>\n\t\t\t</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
        }
      ]
    },
    {
      "title": "Controlling the value displayed in the trigger",
      "description": "By default the trigger will automatically display the selected item `ItemText`'s content. You can control what appears by chosing to put things inside/outside the `ItemText` part.\n\nIf you need more flexibility, you can control the component using `value`/`onValueChange` props and passing `children` to `SelectValue`. Remember to make sure what you put in there is accessible.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1,
            4,
            6
          ],
          "code": "const countries = { france: \"🇫🇷\", \"united-kingdom\": \"🇬🇧\", spain: \"🇪🇸\" };\n\nexport default () => {\n\tconst [value, setValue] = createSignal(\"france\");\n\treturn (\n\t\t<Select.Root value={value()} onValueChange={setValue}>\n\t\t\t<Select.Trigger>\n\t\t\t\t<Select.Value aria-label={value()}>\n\t\t\t\t\t{countries[value()]}\n\t\t\t\t</Select.Value>\n\t\t\t\t<Select.Icon />\n\t\t\t</Select.Trigger>\n\t\t\t<Select.Portal>\n\t\t\t<Select.Content>\n\t\t\t\t<Select.Viewport>\n\t\t\t\t\t<Select.Item value=\"france\">\n\t\t\t\t\t\t<Select.ItemText>France</Select.ItemText>\n\t\t\t\t\t\t<Select.ItemIndicator>…</Select.ItemIndicator>\n\t\t\t\t\t</Select.Item>\n\t\t\t\t\t<Select.Item value=\"united-kingdom\">\n\t\t\t\t\t\t<Select.ItemText>United Kingdom</Select.ItemText>\n\t\t\t\t\t\t<Select.ItemIndicator>…</Select.ItemIndicator>\n\t\t\t\t\t</Select.Item>\n\t\t\t\t\t<Select.Item value=\"spain\">\n\t\t\t\t\t\t<Select.ItemText>Spain</Select.ItemText>\n\t\t\t\t\t\t<Select.ItemIndicator>…</Select.ItemIndicator>\n\t\t\t\t\t</Select.Item>\n\t\t\t\t</Select.Viewport>\n\t\t\t</Select.Content>\n\t\t\t</Select.Portal>\n\t\t</Select.Root>\n\t);\n};"
        }
      ]
    },
    {
      "title": "With custom scrollbar",
      "description": "The native scrollbar is hidden by default as we recommend using the `ScrollUpButton` and `ScrollDownButton` parts for the best UX. If you do not want to use these parts, compose your select with our Scroll Area primitive.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            10,
            12,
            18,
            19,
            20
          ],
          "code": "// index.jsx\nimport { Select, ScrollArea } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Select.Root>\n\t\t<Select.Trigger>…</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content>\n\t\t\t\t<ScrollArea.Root className=\"ScrollAreaRoot\" type=\"auto\">\n\t\t\t\t\t<Select.Viewport asChild>\n\t\t\t\t\t\t<ScrollArea.Viewport className=\"ScrollAreaViewport\">\n\t\t\t\t\t\t\t<StyledItem>…</StyledItem>\n\t\t\t\t\t\t\t<StyledItem>…</StyledItem>\n\t\t\t\t\t\t\t<StyledItem>…</StyledItem>\n\t\t\t\t\t\t</ScrollArea.Viewport>\n\t\t\t\t\t</Select.Viewport>\n\t\t\t\t\t<ScrollArea.Scrollbar\n\t\t\t\t\t\tclassName=\"ScrollAreaScrollbar\"\n\t\t\t\t\t\torientation=\"vertical\"\n\t\t\t\t\t>\n\t\t\t\t\t\t<ScrollArea.Thumb className=\"ScrollAreaThumb\" />\n\t\t\t\t\t</ScrollArea.Scrollbar>\n\t\t\t\t</ScrollArea.Root>\n\t\t\t</Select.Content>\n\t\t</Select.Portal>\n\t</Select.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [],
          "code": "/* styles.css */\n.ScrollAreaRoot {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.ScrollAreaViewport {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.ScrollAreaScrollbar {\n\twidth: 4px;\n\tpadding: 5px 2px;\n}\n\n.ScrollAreaThumb {\n\tbackground: rgba(0, 0, 0, 0.3);\n\tborder-radius: 3px;\n}"
        }
      ]
    },
    {
      "title": "Decoupling the hidden input",
      "description": "By default, `Select.Root` renders a visually hidden `select` for form submission. To recompose, move, or exclude that element, you can build the select from its lower-level parts instead.\n\n> **Important:** These parts are unstable and prefixed with `unstable_`, so their API may change in a future release.\n\n- `Select.unstable_Provider` provides the select state and accepts the form-related and state props (`name`, `value`, `defaultValue`, `onValueChange`, etc.).\n- `Select.unstable_BubbleInput` is the visually hidden `select` that `Select.Root` renders by default. Omit it when you don't need form submission.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { Select } from \"solidix\";\n\nexport default () => (\n\t<Select.Provider name=\"fruit\">\n\t\t<Select.Trigger>\n\t\t\t<Select.Value placeholder=\"Pick an option\" />\n\t\t\t<Select.Icon />\n\t\t</Select.Trigger>\n\t\t<Select.Portal>\n\t\t\t<Select.Content>{/* Your content */}</Select.Content>\n\t\t</Select.Portal>\n\t\t<Select.BubbleInput />\n\t</Select.Provider>\n);"
        }
      ]
    }
  ],
  "customApis": [
    {
      "title": "Abstract down to `Select` and `SelectItem`",
      "description": "This example abstracts most of the parts.\n\n#### Usage\n\n\n\n#### Implementation",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { Select, SelectItem } from \"./your-select\";\n\nexport default () => (\n\t<Select defaultValue=\"2\">\n\t\t<SelectItem value=\"1\">Item 1</SelectItem>\n\t\t<SelectItem value=\"2\">Item 2</SelectItem>\n\t\t<SelectItem value=\"3\">Item 3</SelectItem>\n\t</Select>\n);"
        },
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// your-select.jsx\nimport { omit } from \"solid-js\";\nimport { Select as SelectPrimitive } from \"solidix\";\nimport {\n\tCheckIcon,\n\tChevronDownIcon,\n\tChevronUpIcon,\n} from \"@radix-ui/react-icons\";\n\nexport const Select = (props) => {\n\tconst rest = omit(props, \"children\", \"ref\");\n\treturn (\n\t\t<SelectPrimitive.Root {...rest}>\n\t\t\t<SelectPrimitive.Trigger ref={props.ref}>\n\t\t\t\t<SelectPrimitive.Value />\n\t\t\t\t<SelectPrimitive.Icon>\n\t\t\t\t\t<ChevronDownIcon />\n\t\t\t\t\t</SelectPrimitive.Icon>\n\t\t\t</SelectPrimitive.Trigger>\n\t\t\t<SelectPrimitive.Portal>\n\t\t\t\t<SelectPrimitive.Content>\n\t\t\t\t\t<SelectPrimitive.ScrollUpButton>\n\t\t\t\t\t\t<ChevronUpIcon />\n\t\t\t\t\t</SelectPrimitive.ScrollUpButton>\n\t\t\t\t\t<SelectPrimitive.Viewport>{props.children}</SelectPrimitive.Viewport>\n\t\t\t\t\t<SelectPrimitive.ScrollDownButton>\n\t\t\t\t\t\t<ChevronDownIcon />\n\t\t\t\t\t</SelectPrimitive.ScrollDownButton>\n\t\t\t\t</SelectPrimitive.Content>\n\t\t\t</SelectPrimitive.Portal>\n\t\t</SelectPrimitive.Root>\n\t);\n};\n\nexport const SelectItem = (props) => {\n\tconst rest = omit(props, \"children\", \"ref\");\n\treturn (\n\t\t<SelectPrimitive.Item {...rest} ref={props.ref}>\n\t\t\t<SelectPrimitive.ItemText>{props.children}</SelectPrimitive.ItemText>\n\t\t\t<SelectPrimitive.ItemIndicator>\n\t\t\t\t<CheckIcon />\n\t\t\t\t</SelectPrimitive.ItemIndicator>\n\t\t</SelectPrimitive.Item>\n\t);\n};"
        }
      ]
    }
  ],
  "accessibility": "Adheres to the [ListBox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox).\n\nSee the W3C [Select-Only Combobox](https://www.w3.org/TR/wai-aria-practices/examples/combobox/combobox-select-only.html) example for more information.",
  "keyboard": [
    {
      "keys": [
        "Space"
      ],
      "description": "When focus is on `Select.Trigger`, opens the select and focuses the selected item.\n\nWhen focus is on an item, selects the focused item."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "When focus is on `Select.Trigger`, opens the select and focuses the first item.\n\nWhen focus is on an item, selects the focused item."
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "When focus is on `Select.Trigger`, opens the select.\n\nWhen focus is on an item, moves focus to the next item."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "When focus is on `Select.Trigger`, opens the select.\n\nWhen focus is on an item, moves focus to the previous item."
    },
    {
      "keys": [
        "Esc"
      ],
      "description": "Closes the select and moves focus to `Select.Trigger`."
    }
  ],
  "notes": ""
};
