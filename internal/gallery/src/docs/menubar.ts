import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "menubar",
  "title": "Menubar",
  "metaDescription": "A visually persistent menu common in desktop applications that provides quick",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/menu/",
  "description": "A visually persistent menu common in desktop applications that provides quick\n\taccess to a consistent set of commands.",
  "features": [
    "Can be controlled or uncontrolled.",
    "Supports submenus with configurable reading direction.",
    "Supports items, labels, groups of items.",
    "Supports checkable items (single or multiple).",
    "Customize side, alignment, offsets, collision handling.",
    "Optionally render a pointing arrow.",
    "Focus is fully managed.",
    "Full keyboard navigation.",
    "Typeahead support."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Menubar } from \"solidix\";\n\nexport default () => (\n\t<Menubar.Root>\n\t\t<Menubar.Menu>\n\t\t\t<Menubar.Trigger />\n\t\t\t<Menubar.Portal>\n\t\t\t\t<Menubar.Content>\n\t\t\t\t\t<Menubar.Label />\n\t\t\t\t\t<Menubar.Item />\n\n\t\t\t\t\t<Menubar.Group>\n\t\t\t\t\t\t<Menubar.Item />\n\t\t\t\t\t</Menubar.Group>\n\n\t\t\t\t\t<Menubar.CheckboxItem>\n\t\t\t\t\t\t<Menubar.ItemIndicator />\n\t\t\t\t\t</Menubar.CheckboxItem>\n\n\t\t\t\t\t<Menubar.RadioGroup>\n\t\t\t\t\t\t<Menubar.RadioItem>\n\t\t\t\t\t\t\t<Menubar.ItemIndicator />\n\t\t\t\t\t\t</Menubar.RadioItem>\n\t\t\t\t\t</Menubar.RadioGroup>\n\n\t\t\t\t\t<Menubar.Sub>\n\t\t\t\t\t\t<Menubar.SubTrigger />\n\t\t\t\t\t\t<Menubar.Portal>\n\t\t\t\t\t\t\t<Menubar.SubContent />\n\t\t\t\t\t\t</Menubar.Portal>\n\t\t\t\t\t</Menubar.Sub>\n\n\t\t\t\t\t<Menubar.Separator />\n\t\t\t\t\t<Menubar.Arrow />\n\t\t\t\t</Menubar.Content>\n\t\t\t</Menubar.Portal>\n\t\t</Menubar.Menu>\n\t</Menubar.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a menubar.",
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
          "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state."
        },
        {
          "name": "value",
          "required": false,
          "type": "string",
          "description": "The controlled value of the menu to open. Should be used in conjunction with `onValueChange`."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "description": "The reading direction. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "loop",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "When `true`, keyboard navigation will loop from last item to first, and vice versa."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Menu",
      "description": "A top level menu item, contains a trigger with content combination.",
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
          "required": false,
          "type": "string",
          "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "The button that toggles the content. By default, the `Menubar.Content` will position itself against the trigger.",
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
      "name": "Portal",
      "description": "When used, portals the content part into the `body`.",
      "props": [
        {
          "name": "forceMount",
          "type": "boolean",
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `Menubar.Content` and `Menubar.SubContent` respectively."
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
      "description": "The component that pops out when a menu is open.",
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
          "default": "false",
          "description": "When `true`, keyboard navigation will loop from last item to first, and vice versa."
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
          "description": "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`"
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `Menubar.Portal`."
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
          "cssVariable": "--radix-menubar-content-transform-origin",
          "description": "The `transform-origin` computed from the content and arrow positions/offsets"
        },
        {
          "cssVariable": "--radix-menubar-content-available-width",
          "description": "The remaining width between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-menubar-content-available-height",
          "description": "The remaining height between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-menubar-trigger-width",
          "description": "The width of the trigger"
        },
        {
          "cssVariable": "--radix-menubar-trigger-height",
          "description": "The height of the trigger"
        }
      ]
    },
    {
      "name": "Arrow",
      "description": "An optional arrow element to render alongside a menubar menu. This can be used to help visually link the trigger with the `Menubar.Content`. Must be rendered inside `Menubar.Content`.",
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
      "name": "Item",
      "description": "The component that contains the menubar items.",
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
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the item."
        },
        {
          "name": "onSelect",
          "type": "(event: Event) => void",
          "typeSimple": "function",
          "description": "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the menubar from closing when selecting that item."
        },
        {
          "name": "textValue",
          "type": "string",
          "description": "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside."
        }
      ],
      "dataAttributes": [
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
      "name": "Group",
      "description": "Used to group multiple `Menubar.Item`s.",
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
      "description": "Used to render a label. It won't be focusable using arrow keys.",
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
      "name": "CheckboxItem",
      "description": "An item that can be controlled and rendered like a checkbox.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "checked",
          "type": "boolean | 'indeterminate'",
          "description": "The controlled checked state of the item. Must be used in conjunction with `onCheckedChange`."
        },
        {
          "name": "onCheckedChange",
          "type": "(checked: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the checked state changes."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the item."
        },
        {
          "name": "onSelect",
          "type": "(event: Event) => void",
          "typeSimple": "function",
          "description": "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the menubar from closing when selecting that item."
        },
        {
          "name": "textValue",
          "type": "string",
          "description": "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside."
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
      "name": "RadioGroup",
      "description": "Used to group multiple `Menubar.RadioItem`s.",
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
          "description": "The value of the selected item in the group."
        },
        {
          "name": "onValueChange",
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "RadioItem",
      "description": "An item that can be controlled and rendered like a radio.",
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
          "required": true,
          "description": "The unique value of the item."
        },
        {
          "name": "disabled",
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the item."
        },
        {
          "name": "onSelect",
          "type": "(event: Event) => void",
          "typeSimple": "function",
          "description": "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the menubar from closing when selecting that item."
        },
        {
          "name": "textValue",
          "type": "string",
          "description": "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside."
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
      "name": "ItemIndicator",
      "description": "Renders when the parent `Menubar.CheckboxItem` or `Menubar.RadioItem` is checked. You can style this element directly, or you can use it as a wrapper to put an icon into, or both.",
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
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Separator",
      "description": "Used to visually separate items in a menubar menu.",
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
      "name": "Sub",
      "description": "Contains all the parts of a submenu.",
      "props": [
        {
          "name": "defaultOpen",
          "type": "boolean",
          "description": "The open state of the submenu when it is initially rendered. Use when you do not need to control its open state."
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "The controlled open state of the submenu. Must be used in conjunction with `onOpenChange`."
        },
        {
          "name": "onOpenChange",
          "type": "(open: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the open state of the submenu changes."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "SubTrigger",
      "description": "An item that opens a submenu. Must be rendered inside `Menubar.Sub`.",
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
          "type": "boolean",
          "description": "When `true`, prevents the user from interacting with the item."
        },
        {
          "name": "textValue",
          "type": "string",
          "description": "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside."
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
      "name": "SubContent",
      "description": "The component that pops out when a submenu is open. Must be rendered inside `Menubar.Sub`.",
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
          "default": "false",
          "description": "When `true`, keyboard navigation will loop from last item to first, and vice versa."
        },
        {
          "name": "onEscapeKeyDown",
          "type": "(event: KeyboardEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`"
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `Menubar.Portal`."
        },
        {
          "name": "sideOffset",
          "type": "number",
          "default": "0",
          "description": "The distance in pixels from the trigger."
        },
        {
          "name": "align",
          "type": "\"start\" | \"end\"",
          "typeSimple": "enum",
          "default": "\"start\"",
          "description": "The direction the submenu appears from its anchor item. May change when collisions occur."
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
          "cssVariable": "--radix-menubar-content-transform-origin",
          "description": "The `transform-origin` computed from the content and arrow positions/offsets"
        },
        {
          "cssVariable": "--radix-menubar-content-available-width",
          "description": "The remaining width between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-menubar-content-available-height",
          "description": "The remaining height between the trigger and the boundary edge"
        },
        {
          "cssVariable": "--radix-menubar-trigger-width",
          "description": "The width of the trigger"
        },
        {
          "cssVariable": "--radix-menubar-trigger-height",
          "description": "The height of the trigger"
        }
      ]
    }
  ],
  "examples": [
    {
      "title": "With submenus",
      "description": "You can create submenus by using `Menubar.Sub` in combination with its parts.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18
          ],
          "code": "<Menubar.Root>\n\t<Menubar.Menu>\n\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t<Menubar.Portal>\n\t\t\t<Menubar.Content>\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t<Menubar.Separator />\n\t\t\t\t<Menubar.Sub>\n\t\t\t\t\t<Menubar.SubTrigger>Sub menu →</Menubar.SubTrigger>\n\t\t\t\t\t<Menubar.Portal>\n\t\t\t\t\t\t<Menubar.SubContent>\n\t\t\t\t\t\t\t<Menubar.Item>Sub menu item</Menubar.Item>\n\t\t\t\t\t\t\t<Menubar.Item>Sub menu item</Menubar.Item>\n\t\t\t\t\t\t\t<Menubar.Arrow />\n\t\t\t\t\t\t</Menubar.SubContent>\n\t\t\t\t\t</Menubar.Portal>\n\t\t\t\t</Menubar.Sub>\n\t\t\t\t<Menubar.Separator />\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t</Menubar.Content>\n\t\t</Menubar.Portal>\n\t</Menubar.Menu>\n</Menubar.Root>"
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
          "code": "// index.jsx\nimport { Menubar } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Menubar.Root>\n\t\t<Menubar.Menu>\n\t\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t\t<Menubar.Portal>\n\t\t\t\t<Menubar.Content>\n\t\t\t\t\t<Menubar.Item className=\"MenubarItem\" disabled>\n\t\t\t\t\t\t…\n\t\t\t\t\t</Menubar.Item>\n\t\t\t\t\t<Menubar.Item class=\"MenubarItem\">…</Menubar.Item>\n\t\t\t\t</Menubar.Content>\n\t\t\t</Menubar.Portal>\n\t\t</Menubar.Menu>\n\t</Menubar.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            2
          ],
          "code": "/* styles.css */\n.MenubarItem[data-disabled] {\n\tcolor: gainsboro;\n}"
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
            7,
            9
          ],
          "code": "<Menubar.Root>\n\t<Menubar.Menu>\n\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t<Menubar.Portal>\n\t\t\t<Menubar.Content>\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t<Menubar.Separator />\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t<Menubar.Separator />\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t</Menubar.Content>\n\t\t</Menubar.Portal>\n\t</Menubar.Menu>\n</Menubar.Root>"
        }
      ]
    },
    {
      "title": "With labels",
      "description": "Use the `Label` part to help label a section.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6
          ],
          "code": "<Menubar.Root>\n\t<Menubar.Menu>\n\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t<Menubar.Portal>\n\t\t\t<Menubar.Content>\n\t\t\t\t<Menubar.Label>Label</Menubar.Label>\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t</Menubar.Content>\n\t\t</Menubar.Portal>\n\t</Menubar.Menu>\n</Menubar.Root>"
        }
      ]
    },
    {
      "title": "With checkbox items",
      "description": "Use the `CheckboxItem` part to add an item that can be checked.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6,
            17,
            18,
            19,
            20,
            21,
            22
          ],
          "code": "import { CheckIcon } from \"@radix-ui/react-icons\";\nimport { Menubar } from \"solidix\";\n\nexport default () => {\n\tconst [checked, setChecked] = createSignal(true);\n\n\treturn (\n\t\t<Menubar.Root>\n\t\t\t<Menubar.Menu>\n\t\t\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t\t\t<Menubar.Portal>\n\t\t\t\t\t<Menubar.Content>\n\t\t\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t\t\t<Menubar.Item>…</Menubar.Item>\n\t\t\t\t\t\t<Menubar.Separator />\n\t\t\t\t\t\t<Menubar.CheckboxItem\n\t\t\t\t\t\t\tchecked={checked()}\n\t\t\t\t\t\t\tonCheckedChange={setChecked}\n\t\t\t\t\t\t>\n\t\t\t\t\t\t\t<Menubar.ItemIndicator>\n\t\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t\t</Menubar.ItemIndicator>\n\t\t\t\t\t\t\tCheckbox item\n\t\t\t\t\t\t</Menubar.CheckboxItem>\n\t\t\t\t\t</Menubar.Content>\n\t\t\t\t</Menubar.Portal>\n\t\t\t</Menubar.Menu>\n\t\t</Menubar.Root>\n\t);\n};"
        }
      ]
    },
    {
      "title": "With radio items",
      "description": "Use the `RadioGroup` and `RadioItem` parts to add an item that can be checked amongst others.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27
          ],
          "code": "import { CheckIcon } from \"@radix-ui/react-icons\";\nimport { Menubar } from \"solidix\";\n\nexport default () => {\n\tconst [color, setColor] = createSignal(\"blue\");\n\n\treturn (\n\t\t<Menubar.Root>\n\t\t\t<Menubar.Menu>\n\t\t\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t\t\t<Menubar.Portal>\n\t\t\t\t\t<Menubar.Content>\n\t\t\t\t\t\t<Menubar.RadioGroup value={color()} onValueChange={setColor}>\n\t\t\t\t\t\t\t<Menubar.RadioItem value=\"red\">\n\t\t\t\t\t\t\t\t<Menubar.ItemIndicator>\n\t\t\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t\t\t</Menubar.ItemIndicator>\n\t\t\t\t\t\t\t\tRed\n\t\t\t\t\t\t\t</Menubar.RadioItem>\n\t\t\t\t\t\t\t<Menubar.RadioItem value=\"blue\">\n\t\t\t\t\t\t\t\t<Menubar.ItemIndicator>\n\t\t\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t\t\t</Menubar.ItemIndicator>\n\t\t\t\t\t\t\t\tBlue\n\t\t\t\t\t\t\t</Menubar.RadioItem>\n\t\t\t\t\t\t</Menubar.RadioGroup>\n\t\t\t\t\t</Menubar.Content>\n\t\t\t\t</Menubar.Portal>\n\t\t\t</Menubar.Menu>\n\t\t</Menubar.Root>\n\t);\n};"
        }
      ]
    },
    {
      "title": "With complex items",
      "description": "You can add extra decorative elements in the `Item` parts, such as images.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            10,
            14
          ],
          "code": "import { Menubar } from \"solidix\";\n\nexport default () => (\n\t<Menubar.Root>\n\t\t<Menubar.Menu>\n\t\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t\t<Menubar.Portal>\n\t\t\t\t<Menubar.Content>\n\t\t\t\t\t<Menubar.Item>\n\t\t\t\t\t\t<img src=\"…\" />\n\t\t\t\t\t\tAdolfo Hess\n\t\t\t\t\t</Menubar.Item>\n\t\t\t\t\t<Menubar.Item>\n\t\t\t\t\t\t<img src=\"…\" />\n\t\t\t\t\t\tMiyah Myles\n\t\t\t\t\t</Menubar.Item>\n\t\t\t\t</Menubar.Content>\n\t\t\t</Menubar.Portal>\n\t\t</Menubar.Menu>\n\t</Menubar.Root>\n);"
        }
      ]
    },
    {
      "title": "Constrain the content/sub-content size",
      "description": "You may want to constrain the width of the content (or sub-content) so that it matches the trigger (or sub-trigger) width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-menubar-trigger-width` and `--radix-menubar-content-available-height` to support this. Use them to constrain the content dimensions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            9
          ],
          "code": "// index.jsx\nimport { Menubar } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Menubar.Root>\n\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t<Menubar.Portal>\n\t\t\t<Menubar.Content className=\"MenubarContent\" sideOffset={5}>\n\t\t\t\t…\n\t\t\t</Menubar.Content>\n\t\t</Menubar.Portal>\n\t</Menubar.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [],
          "code": "/* styles.css */\n.MenubarContent {\n\twidth: var(--radix-menubar-trigger-width);\n\tmax-height: var(--radix-menubar-content-available-height);\n}"
        }
      ]
    },
    {
      "title": "Origin-aware animations",
      "description": "We expose a CSS custom property `--radix-menubar-content-transform-origin`. Use it to animate the content from its computed origin based on `side`, `sideOffset`, `align`, `alignOffset` and any collisions.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            10
          ],
          "code": "// index.jsx\nimport { Menubar } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Menubar.Root>\n\t\t<Menubar.Menu>\n\t\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t\t<Menubar.Portal>\n\t\t\t\t<Menubar.Content className=\"MenubarContent\">…</Menubar.Content>\n\t\t\t</Menubar.Portal>\n\t\t</Menubar.Menu>\n\t</Menubar.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            3
          ],
          "code": "/* styles.css */\n.MenubarContent {\n\ttransform-origin: var(--radix-menubar-content-transform-origin);\n\tanimation: scaleIn 0.5s ease-out;\n}\n\n@keyframes scaleIn {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t}\n}"
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
            10
          ],
          "code": "// index.jsx\nimport { Menubar } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Menubar.Root>\n\t\t<Menubar.Menu>\n\t\t\t<Menubar.Trigger>…</Menubar.Trigger>\n\t\t\t<Menubar.Portal>\n\t\t\t\t<Menubar.Content className=\"MenubarContent\">…</Menubar.Content>\n\t\t\t</Menubar.Portal>\n\t\t</Menubar.Menu>\n\t</Menubar.Root>\n);"
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
          "code": "/* styles.css */\n.MenubarContent {\n\tanimation-duration: 0.6s;\n\tanimation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);\n}\n.MenubarContent[data-side=\"top\"] {\n\tanimation-name: slideUp;\n}\n.MenubarContent[data-side=\"bottom\"] {\n\tanimation-name: slideDown;\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(-10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Menu Button WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and uses [roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex) to manage focus movement among menu items.",
  "keyboard": [
    {
      "keys": [
        "Space"
      ],
      "description": "When focus is on `Menubar.Trigger`, opens the menubar and focuses the first item.\n\nWhen focus is on an item, activates the focused item."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "When focus is on `Menubar.Trigger`, opens the associated menu.\n\nWhen focus is on an item, activates the focused item."
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "When focus is on `Menubar.Trigger`, opens the associated menu.\n\nWhen focus is on an item, moves focus to the next item."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "When focus is on an item, moves focus to the previous item."
    },
    {
      "keys": [
        "ArrowRight",
        "ArrowLeft"
      ],
      "description": "When focus is on a `Menubar.Trigger`, moves focus to the next or previous item.\n\nWhen focus is on a `Menubar.SubTrigger`, opens or closes the submenu depending on reading direction.\n\nWhen focus is within a `Menubar.Content`, opens the next menu in the menubar."
    },
    {
      "keys": [
        "Esc"
      ],
      "description": "Closes the currently open menu and moves focus to its `Menubar.Trigger`."
    }
  ],
  "notes": ""
};
