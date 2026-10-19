import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "dropdown-menu",
  title: "Dropdown Menu",
  metaDescription:
    "Displays a menu to the user - such as a set of actions or functions - triggered by a button.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
  description:
    "Displays a menu to the user - such as a set of actions or functions - triggered by\n\ta button.",
  features: [
    "Can be controlled or uncontrolled.",
    "Supports submenus with configurable reading direction.",
    "Supports items, labels, groups of items.",
    "Supports checkable items (single or multiple) with optional indeterminate state.",
    "Supports modal and non-modal modes.",
    "Customize side, alignment, offsets, collision handling.",
    "Optionally render a pointing arrow.",
    "Focus is fully managed.",
    "Full keyboard navigation.",
    "Typeahead support.",
    "Dismissing and layering behavior is highly customizable.",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { DropdownMenu } from "solidix";\n\nexport default () => (\n\t<DropdownMenu.Root>\n\t\t<DropdownMenu.Trigger />\n\n\t\t<DropdownMenu.Portal>\n\t\t\t<DropdownMenu.Content>\n\t\t\t\t<DropdownMenu.Label />\n\t\t\t\t<DropdownMenu.Item />\n\n\t\t\t\t<DropdownMenu.Group>\n\t\t\t\t\t<DropdownMenu.Item />\n\t\t\t\t</DropdownMenu.Group>\n\n\t\t\t\t<DropdownMenu.CheckboxItem>\n\t\t\t\t\t<DropdownMenu.ItemIndicator />\n\t\t\t\t</DropdownMenu.CheckboxItem>\n\n\t\t\t\t<DropdownMenu.RadioGroup>\n\t\t\t\t\t<DropdownMenu.RadioItem>\n\t\t\t\t\t\t<DropdownMenu.ItemIndicator />\n\t\t\t\t\t</DropdownMenu.RadioItem>\n\t\t\t\t</DropdownMenu.RadioGroup>\n\n\t\t\t\t<DropdownMenu.Sub>\n\t\t\t\t\t<DropdownMenu.SubTrigger />\n\t\t\t\t\t<DropdownMenu.Portal>\n\t\t\t\t\t\t<DropdownMenu.SubContent />\n\t\t\t\t\t</DropdownMenu.Portal>\n\t\t\t\t</DropdownMenu.Sub>\n\n\t\t\t\t<DropdownMenu.Separator />\n\t\t\t\t<DropdownMenu.Arrow />\n\t\t\t</DropdownMenu.Content>\n\t\t</DropdownMenu.Portal>\n\t</DropdownMenu.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the parts of a dropdown menu.",
      props: [
        {
          name: "defaultOpen",
          type: "boolean",
          description:
            "The open state of the dropdown menu when it is initially rendered. Use when you do not need to control its open state.",
        },
        {
          name: "open",
          type: "boolean",
          description:
            "The controlled open state of the dropdown menu. Must be used in conjunction with `onOpenChange`.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the open state of the dropdown menu changes.",
        },
        {
          name: "modal",
          required: false,
          type: "boolean",
          default: "true",
          description:
            "The modality of the dropdown menu. When set to `true`, interaction with outside elements will be disabled and only menu content will be visible to screen readers.",
        },
        {
          name: "dir",
          required: false,
          type: '"ltr" | "rtl"',
          typeSimple: "enum",
          description:
            "The reading direction of submenus when applicable. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Trigger",
      description:
        "The button that toggles the dropdown menu. By default, the `DropdownMenu.Content` will position itself against the trigger.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["open", "closed"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Portal",
      description: "When used, portals the content part into the `body`.",
      props: [
        {
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `DropdownMenu.Content` and `DropdownMenu.SubContent` respectively.",
        },
        {
          name: "container",
          type: "HTMLElement",
          default: "document.body",
          description: "Specify a container element to portal the content into.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Content",
      description: "The component that pops out when the dropdown menu is open.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "loop",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "When `true`, keyboard navigation will loop from last item to first, and vice versa.",
        },
        {
          name: "onCloseAutoFocus",
          type: "(event: Event) => void",
          typeSimple: "function",
          description:
            "Event handler called when focus moves to the trigger after closing. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "onEscapeKeyDown",
          type: "(event: KeyboardEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`",
        },
        {
          name: "onPointerDownOutside",
          type: "(event: PointerDownOutsideEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "onFocusOutside",
          type: "(event: FocusOutsideEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when focus moves outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "onInteractOutside",
          type: "(event: PointerDownOutsideEvent | FocusOutsideEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `DropdownMenu.Portal`.",
        },
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          typeSimple: "enum",
          default: '"bottom"',
          description:
            "The preferred side of the trigger to render against when open. Will be reversed when collisions occur and `avoidCollisions` is enabled.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "0",
          description: "The distance in pixels from the trigger.",
        },
        {
          name: "align",
          type: '"start" | "center" | "end"',
          typeSimple: "enum",
          default: '"center"',
          description:
            "The preferred alignment against the trigger. May change when collisions occur.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: 'An offset in pixels from the `"start"` or `"end"` alignment options.',
        },
        {
          name: "avoidCollisions",
          type: "boolean",
          default: "true",
          description:
            "When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges.",
        },
        {
          name: "collisionBoundary",
          type: "Element | null | Array<Element | null>",
          typeSimple: "Boundary",
          default: "[]",
          description:
            "The element used as the collision boundary. By default this is the viewport, though you can provide additional element(s) to be included in this check.",
        },
        {
          name: "collisionPadding",
          type: "number | Partial<Record<Side, number>>",
          typeSimple: "number | Padding",
          default: "0",
          description:
            "The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object, for example: `{`{ top: 20, left: 20 }`}`.",
        },
        {
          name: "arrowPadding",
          type: "number",
          default: "0",
          description:
            "The padding between the arrow and the edges of the content. If your content has `border-radius`, this will prevent it from overflowing the corners.",
        },
        {
          name: "sticky",
          type: '"partial" | "always"',
          typeSimple: "enum",
          default: '"partial"',
          description:
            'The sticky behavior on the align axis. `"partial"` will keep the content in the boundary as long as the trigger is at least partially in the boundary whilst `"always"` will keep the content in the boundary regardless.',
        },
        {
          name: "hideWhenDetached",
          type: "boolean",
          default: "false",
          description: "Whether to hide the content when the trigger becomes fully occluded.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["open", "closed"],
        },
        {
          attribute: "[data-side]",
          values: ["left", "right", "bottom", "top"],
        },
        {
          attribute: "[data-align]",
          values: ["start", "end", "center"],
        },
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [
        {
          cssVariable: "--radix-dropdown-menu-content-transform-origin",
          description:
            "The `transform-origin` computed from the content and arrow positions/offsets",
        },
        {
          cssVariable: "--radix-dropdown-menu-content-available-width",
          description: "The remaining width between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-dropdown-menu-content-available-height",
          description: "The remaining height between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-dropdown-menu-trigger-width",
          description: "The width of the trigger",
        },
        {
          cssVariable: "--radix-dropdown-menu-trigger-height",
          description: "The height of the trigger",
        },
      ],
    },
    {
      name: "Arrow",
      description:
        "An optional arrow element to render alongside the dropdown menu. This can be used to help visually link the trigger with the `DropdownMenu.Content`. Must be rendered inside `DropdownMenu.Content`.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "width",
          type: "number",
          default: 10,
          description: "The width of the arrow in pixels.",
        },
        {
          name: "height",
          type: "number",
          default: 5,
          description: "The height of the arrow in pixels.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Item",
      description: "The component that contains the dropdown menu items.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the item.",
        },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          typeSimple: "function",
          description:
            "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.",
        },
        {
          name: "textValue",
          type: "string",
          description:
            "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
        {
          attribute: "[data-highlighted]",
          values: ["Present when highlighted"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Group",
      description: "Used to group multiple `DropdownMenu.Item`s.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Label",
      description: "Used to render a label. It won't be focusable using arrow keys.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "CheckboxItem",
      description: "An item that can be controlled and rendered like a checkbox.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "checked",
          type: "boolean | 'indeterminate'",
          description:
            "The controlled checked state of the item. Must be used in conjunction with `onCheckedChange`.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the checked state changes.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the item.",
        },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          typeSimple: "function",
          description:
            "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.",
        },
        {
          name: "textValue",
          type: "string",
          description:
            "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["checked", "unchecked", "indeterminate"],
        },
        {
          attribute: "[data-highlighted]",
          values: ["Present when highlighted"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "RadioGroup",
      description: "Used to group multiple `DropdownMenu.RadioItem`s.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "value",
          type: "string",
          description: "The value of the selected item in the group.",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          typeSimple: "function",
          description: "Event handler called when the value changes.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "RadioItem",
      description: "An item that can be controlled and rendered like a radio.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "value",
          type: "string",
          required: true,
          description: "The unique value of the item.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the item.",
        },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          typeSimple: "function",
          description:
            "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.",
        },
        {
          name: "textValue",
          type: "string",
          description:
            "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["checked", "unchecked", "indeterminate"],
        },
        {
          attribute: "[data-highlighted]",
          values: ["Present when highlighted"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "ItemIndicator",
      description:
        "Renders when the parent `DropdownMenu.CheckboxItem` or `DropdownMenu.RadioItem` is checked. You can style this element directly, or you can use it as a wrapper to put an icon into, or both.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["checked", "unchecked", "indeterminate"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Separator",
      description: "Used to visually separate items in the dropdown menu.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Sub",
      description: "Contains all the parts of a submenu.",
      props: [
        {
          name: "defaultOpen",
          type: "boolean",
          description:
            "The open state of the submenu when it is initially rendered. Use when you do not need to control its open state.",
        },
        {
          name: "open",
          type: "boolean",
          description:
            "The controlled open state of the submenu. Must be used in conjunction with `onOpenChange`.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the open state of the submenu changes.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SubTrigger",
      description: "An item that opens a submenu. Must be rendered inside `DropdownMenu.Sub`.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the item.",
        },
        {
          name: "textValue",
          type: "string",
          description:
            "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the item. Use this when the content is complex, or you have non-textual content inside.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["open", "closed"],
        },
        {
          attribute: "[data-highlighted]",
          values: ["Present when highlighted"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [
        {
          cssVariable: "--radix-dropdown-menu-content-transform-origin",
          description:
            "The `transform-origin` computed from the content and arrow positions/offsets",
        },
        {
          cssVariable: "--radix-dropdown-menu-content-available-width",
          description: "The remaining width between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-dropdown-menu-content-available-height",
          description: "The remaining height between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-dropdown-menu-trigger-width",
          description: "The width of the trigger",
        },
        {
          cssVariable: "--radix-dropdown-menu-trigger-height",
          description: "The height of the trigger",
        },
      ],
    },
    {
      name: "SubContent",
      description:
        "The component that pops out when a submenu is open. Must be rendered inside `DropdownMenu.Sub`.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details.",
        },
        {
          name: "loop",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "When `true`, keyboard navigation will loop from last item to first, and vice versa.",
        },
        {
          name: "onEscapeKeyDown",
          type: "(event: KeyboardEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`",
        },
        {
          name: "onPointerDownOutside",
          type: "(event: PointerDownOutsideEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "onFocusOutside",
          type: "(event: FocusOutsideEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when focus moves outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "onInteractOutside",
          type: "(event: PointerDownOutsideEvent | FocusOutsideEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `DropdownMenu.Portal`.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "0",
          description: "The distance in pixels from the trigger.",
        },
        {
          name: "align",
          type: '"start" | "end"',
          typeSimple: "enum",
          default: '"start"',
          description:
            "The direction the submenu appears from its anchor item. May change when collisions occur.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: 'An offset in pixels from the `"start"` or `"end"` alignment options.',
        },
        {
          name: "avoidCollisions",
          type: "boolean",
          default: "true",
          description:
            "When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges.",
        },
        {
          name: "collisionBoundary",
          type: "Element | null | Array<Element | null>",
          typeSimple: "Boundary",
          default: "[]",
          description:
            "The element used as the collision boundary. By default this is the viewport, though you can provide additional element(s) to be included in this check.",
        },
        {
          name: "collisionPadding",
          type: "number | Partial<Record<Side, number>>",
          typeSimple: "number | Padding",
          default: "0",
          description:
            "The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object, for example: `{`{ top: 20, left: 20 }`}`.",
        },
        {
          name: "arrowPadding",
          type: "number",
          default: "0",
          description:
            "The padding between the arrow and the edges of the content. If your content has `border-radius`, this will prevent it from overflowing the corners.",
        },
        {
          name: "sticky",
          type: '"partial" | "always"',
          typeSimple: "enum",
          default: '"partial"',
          description:
            'The sticky behavior on the align axis. `"partial"` will keep the content in the boundary as long as the trigger is at least partially in the boundary whilst `"always"` will keep the content in the boundary regardless.',
        },
        {
          name: "hideWhenDetached",
          type: "boolean",
          default: "false",
          description: "Whether to hide the content when the trigger becomes fully occluded.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["open", "closed"],
        },
        {
          attribute: "[data-side]",
          values: ["left", "right", "bottom", "top"],
        },
        {
          attribute: "[data-align]",
          values: ["start", "end", "center"],
        },
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
      title: "With submenus",
      description:
        "You can create submenus by using `DropdownMenu.Sub` in combination with its parts.",
      blocks: [
        {
          lang: "jsx",
          highlights: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
          code: "<DropdownMenu.Root>\n\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t<DropdownMenu.Portal>\n\t\t<DropdownMenu.Content>\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t<DropdownMenu.Separator />\n\t\t\t<DropdownMenu.Sub>\n\t\t\t\t<DropdownMenu.SubTrigger>Sub menu →</DropdownMenu.SubTrigger>\n\t\t\t\t<DropdownMenu.Portal>\n\t\t\t\t\t<DropdownMenu.SubContent>\n\t\t\t\t\t\t<DropdownMenu.Item>Sub menu item</DropdownMenu.Item>\n\t\t\t\t\t\t<DropdownMenu.Item>Sub menu item</DropdownMenu.Item>\n\t\t\t\t\t\t<DropdownMenu.Arrow />\n\t\t\t\t\t</DropdownMenu.SubContent>\n\t\t\t\t</DropdownMenu.Portal>\n\t\t\t</DropdownMenu.Sub>\n\t\t\t<DropdownMenu.Separator />\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t</DropdownMenu.Content>\n\t</DropdownMenu.Portal>\n</DropdownMenu.Root>",
        },
      ],
    },
    {
      title: "With disabled items",
      description:
        "You can add special styles to disabled items via the `data-disabled` attribute.",
      blocks: [
        {
          lang: "jsx",
          highlights: [10],
          code: '// index.jsx\nimport { DropdownMenu } from "solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<DropdownMenu.Root>\n\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t<DropdownMenu.Portal>\n\t\t\t<DropdownMenu.Content>\n\t\t\t\t<DropdownMenu.Item className="DropdownMenuItem" disabled>\n\t\t\t\t\t…\n\t\t\t\t</DropdownMenu.Item>\n\t\t\t\t<DropdownMenu.Item class="DropdownMenuItem">…</DropdownMenu.Item>\n\t\t\t</DropdownMenu.Content>\n\t\t</DropdownMenu.Portal>\n\t</DropdownMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [2],
          code: "/* styles.css */\n.DropdownMenuItem[data-disabled] {\n\tcolor: gainsboro;\n}",
        },
      ],
    },
    {
      title: "With separators",
      description: "Use the `Separator` part to add a separator between items.",
      blocks: [
        {
          lang: "jsx",
          highlights: [6, 8],
          code: "<DropdownMenu.Root>\n\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t<DropdownMenu.Portal>\n\t\t<DropdownMenu.Content>\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t<DropdownMenu.Separator />\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t<DropdownMenu.Separator />\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t</DropdownMenu.Content>\n\t</DropdownMenu.Portal>\n</DropdownMenu.Root>",
        },
      ],
    },
    {
      title: "With labels",
      description: "Use the `Label` part to help label a section.",
      blocks: [
        {
          lang: "jsx",
          highlights: [5],
          code: "<DropdownMenu.Root>\n\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t<DropdownMenu.Portal>\n\t\t<DropdownMenu.Content>\n\t\t\t<DropdownMenu.Label>Label</DropdownMenu.Label>\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t</DropdownMenu.Content>\n\t</DropdownMenu.Portal>\n</DropdownMenu.Root>",
        },
      ],
    },
    {
      title: "With checkbox items",
      description: "Use the `CheckboxItem` part to add an item that can be checked.",
      blocks: [
        {
          lang: "jsx",
          highlights: [6, 16, 17, 18, 19, 20, 21],
          code: 'import { CheckIcon } from "@radix-ui/react-icons";\nimport { DropdownMenu } from "solidix";\n\nexport default () => {\n\tconst [checked, setChecked] = createSignal(true);\n\n\treturn (\n\t\t<DropdownMenu.Root>\n\t\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t\t<DropdownMenu.Portal>\n\t\t\t\t<DropdownMenu.Content>\n\t\t\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t\t\t<DropdownMenu.Item>…</DropdownMenu.Item>\n\t\t\t\t\t<DropdownMenu.Separator />\n\t\t\t\t\t<DropdownMenu.CheckboxItem\n\t\t\t\t\t\tchecked={checked()}\n\t\t\t\t\t\tonCheckedChange={setChecked}\n\t\t\t\t\t>\n\t\t\t\t\t\t<DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t</DropdownMenu.ItemIndicator>\n\t\t\t\t\t\tCheckbox item\n\t\t\t\t\t</DropdownMenu.CheckboxItem>\n\t\t\t\t</DropdownMenu.Content>\n\t\t\t</DropdownMenu.Portal>\n\t\t</DropdownMenu.Root>\n\t);\n};',
        },
      ],
    },
    {
      title: "With radio items",
      description:
        "Use the `RadioGroup` and `RadioItem` parts to add an item that can be checked amongst others.",
      blocks: [
        {
          lang: "jsx",
          highlights: [
            6, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
          ],
          code: 'import { CheckIcon } from "@radix-ui/react-icons";\nimport { DropdownMenu } from "solidix";\n\nexport default () => {\n\tconst [color, setColor] = createSignal("blue");\n\n\treturn (\n\t\t<DropdownMenu.Root>\n\t\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t\t<DropdownMenu.Portal>\n\t\t\t\t<DropdownMenu.Content>\n\t\t\t\t\t<DropdownMenu.RadioGroup value={color()} onValueChange={setColor}>\n\t\t\t\t\t\t<DropdownMenu.RadioItem value="red">\n\t\t\t\t\t\t\t<DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t\t</DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\tRed\n\t\t\t\t\t\t</DropdownMenu.RadioItem>\n\t\t\t\t\t\t<DropdownMenu.RadioItem value="blue">\n\t\t\t\t\t\t\t<DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t\t</DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\tBlue\n\t\t\t\t\t\t</DropdownMenu.RadioItem>\n\t\t\t\t\t\t<DropdownMenu.RadioItem value="green">\n\t\t\t\t\t\t\t<DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\t\t<CheckIcon />\n\t\t\t\t\t\t\t</DropdownMenu.ItemIndicator>\n\t\t\t\t\t\t\tGreen\n\t\t\t\t\t\t</DropdownMenu.RadioItem>\n\t\t\t\t\t</DropdownMenu.RadioGroup>\n\t\t\t\t</DropdownMenu.Content>\n\t\t\t</DropdownMenu.Portal>\n\t\t</DropdownMenu.Root>\n\t);\n};',
        },
      ],
    },
    {
      title: "With complex items",
      description: "You can add extra decorative elements in the `Item` parts, such as images.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9, 13],
          code: 'import { DropdownMenu } from "solidix";\n\nexport default () => (\n\t<DropdownMenu.Root>\n\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t<DropdownMenu.Portal>\n\t\t\t<DropdownMenu.Content>\n\t\t\t\t<DropdownMenu.Item>\n\t\t\t\t\t<img src="…" />\n\t\t\t\t\tAdolfo Hess\n\t\t\t\t</DropdownMenu.Item>\n\t\t\t\t<DropdownMenu.Item>\n\t\t\t\t\t<img src="…" />\n\t\t\t\t\tMiyah Myles\n\t\t\t\t</DropdownMenu.Item>\n\t\t\t</DropdownMenu.Content>\n\t\t</DropdownMenu.Portal>\n\t</DropdownMenu.Root>\n);',
        },
      ],
    },
    {
      title: "Constrain the content/sub-content size",
      description:
        "You may want to constrain the width of the content (or sub-content) so that it matches the trigger (or sub-trigger) width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-dropdown-menu-trigger-width` and `--radix-dropdown-menu-content-available-height` to support this. Use them to constrain the content dimensions.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9],
          code: '// index.jsx\nimport { DropdownMenu } from "solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<DropdownMenu.Root>\n\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t<DropdownMenu.Portal>\n\t\t\t<DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>\n\t\t\t\t…\n\t\t\t</DropdownMenu.Content>\n\t\t</DropdownMenu.Portal>\n\t</DropdownMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [],
          code: "/* styles.css */\n.DropdownMenuContent {\n\twidth: var(--radix-dropdown-menu-trigger-width);\n\tmax-height: var(--radix-dropdown-menu-content-available-height);\n}",
        },
      ],
    },
    {
      title: "Origin-aware animations",
      description:
        "We expose a CSS custom property `--radix-dropdown-menu-content-transform-origin`. Use it to animate the content from its computed origin based on `side`, `sideOffset`, `align`, `alignOffset` and any collisions.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9],
          code: '// index.jsx\nimport { DropdownMenu } from "solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<DropdownMenu.Root>\n\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t<DropdownMenu.Portal>\n\t\t\t<DropdownMenu.Content className="DropdownMenuContent">\n\t\t\t\t…\n\t\t\t</DropdownMenu.Content>\n\t\t</DropdownMenu.Portal>\n\t</DropdownMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [3],
          code: "/* styles.css */\n.DropdownMenuContent {\n\ttransform-origin: var(--radix-dropdown-menu-content-transform-origin);\n\tanimation: scaleIn 0.5s ease-out;\n}\n\n@keyframes scaleIn {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t}\n}",
        },
      ],
    },
    {
      title: "Collision-aware animations",
      description:
        "We expose `data-side` and `data-align` attributes. Their values will change at runtime to reflect collisions. Use them to create collision and direction-aware animations.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9],
          code: '// index.jsx\nimport { DropdownMenu } from "solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<DropdownMenu.Root>\n\t\t<DropdownMenu.Trigger>…</DropdownMenu.Trigger>\n\t\t<DropdownMenu.Portal>\n\t\t\t<DropdownMenu.Content className="DropdownMenuContent">\n\t\t\t\t…\n\t\t\t</DropdownMenu.Content>\n\t\t</DropdownMenu.Portal>\n\t</DropdownMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [6, 7, 8, 9, 10, 11],
          code: '/* styles.css */\n.DropdownMenuContent {\n\tanimation-duration: 0.6s;\n\tanimation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);\n}\n.DropdownMenuContent[data-side="top"] {\n\tanimation-name: slideUp;\n}\n.DropdownMenuContent[data-side="bottom"] {\n\tanimation-name: slideDown;\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(-10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}',
        },
      ],
    },
  ],
  customApis: [
    {
      title: "Abstract the arrow and item indicators",
      description:
        "This example abstracts the `DropdownMenu.Arrow` and `DropdownMenu.ItemIndicator` parts. It also wraps implementation details for `CheckboxItem` and `RadioItem`.\n\n#### Usage\n\n\n\n#### Implementation",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: 'import {\n\tDropdownMenu,\n\tDropdownMenuTrigger,\n\tDropdownMenuContent,\n\tDropdownMenuLabel,\n\tDropdownMenuItem,\n\tDropdownMenuGroup,\n\tDropdownMenuCheckboxItem,\n\tDropdownMenuRadioGroup,\n\tDropdownMenuRadioItem,\n\tDropdownMenuSeparator,\n} from "./your-dropdown-menu";\n\nexport default () => (\n\t<DropdownMenu>\n\t\t<DropdownMenuTrigger>DropdownMenu trigger</DropdownMenuTrigger>\n\t\t<DropdownMenuContent>\n\t\t\t<DropdownMenuItem>Item</DropdownMenuItem>\n\t\t\t<DropdownMenuLabel>Label</DropdownMenuLabel>\n\t\t\t<DropdownMenuGroup>Group</DropdownMenuGroup>\n\t\t\t<DropdownMenuCheckboxItem>CheckboxItem</DropdownMenuCheckboxItem>\n\t\t\t<DropdownMenuSeparator>Separator</DropdownMenuSeparator>\n\t\t\t<DropdownMenuRadioGroup>\n\t\t\t\t<DropdownMenuRadioItem>RadioItem</DropdownMenuRadioItem>\n\t\t\t\t<DropdownMenuRadioItem>RadioItem</DropdownMenuRadioItem>\n\t\t\t</DropdownMenuRadioGroup>\n\t\t</DropdownMenuContent>\n\t</DropdownMenu>\n);',
        },
        {
          lang: "jsx",
          highlights: [],
          code: '// your-dropdown-menu.jsx\nimport { omit } from "solid-js";\nimport { DropdownMenu as DropdownMenuPrimitive } from "solidix";\nimport { CheckIcon, DividerHorizontalIcon } from "@radix-ui/react-icons";\n\nexport const DropdownMenu = DropdownMenuPrimitive.Root;\nexport const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;\n\nexport const DropdownMenuContent = (props) => {\n\tconst rest = omit(props, "children", "ref");\n\treturn (\n\t\t<DropdownMenuPrimitive.Portal>\n\t\t\t<DropdownMenuPrimitive.Content {...rest} ref={props.ref}>\n\t\t\t\t{props.children}\n\t\t\t\t<DropdownMenuPrimitive.Arrow />\n\t\t\t</DropdownMenuPrimitive.Content>\n\t\t</DropdownMenuPrimitive.Portal>\n\t);\n};\n\nexport const DropdownMenuLabel = DropdownMenuPrimitive.Label;\nexport const DropdownMenuItem = DropdownMenuPrimitive.Item;\nexport const DropdownMenuGroup = DropdownMenuPrimitive.Group;\n\nexport const DropdownMenuCheckboxItem = (props) => {\n\tconst rest = omit(props, "children", "ref");\n\treturn (\n\t\t<DropdownMenuPrimitive.CheckboxItem {...rest} ref={props.ref}>\n\t\t\t{props.children}\n\t\t\t<DropdownMenuPrimitive.ItemIndicator>\n\t\t\t\t{props.checked === "indeterminate" && <DividerHorizontalIcon />}\n\t\t\t\t{props.checked === true && <CheckIcon />}\n\t\t\t</DropdownMenuPrimitive.ItemIndicator>\n\t\t</DropdownMenuPrimitive.CheckboxItem>\n\t);\n};\n\nexport const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;\n\nexport const DropdownMenuRadioItem = (props) => {\n\tconst rest = omit(props, "children", "ref");\n\treturn (\n\t\t<DropdownMenuPrimitive.RadioItem {...rest} ref={props.ref}>\n\t\t\t{props.children}\n\t\t\t<DropdownMenuPrimitive.ItemIndicator>\n\t\t\t\t<CheckIcon />\n\t\t\t\t</DropdownMenuPrimitive.ItemIndicator>\n\t\t</DropdownMenuPrimitive.RadioItem>\n\t);\n};\n\nexport const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;',
        },
      ],
    },
  ],
  accessibility:
    "Adheres to the [Menu Button WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and uses [roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex) to manage focus movement among menu items.",
  keyboard: [
    {
      keys: ["Space"],
      description:
        "When focus is on `DropdownMenu.Trigger`, opens the dropdown menu and focuses the first item.\n\nWhen focus is on an item, activates the focused item.",
    },
    {
      keys: ["Enter"],
      description:
        "When focus is on `DropdownMenu.Trigger`, opens the dropdown menu and focuses the first item.\n\nWhen focus is on an item, activates the focused item.",
    },
    {
      keys: ["ArrowDown"],
      description:
        "When focus is on `DropdownMenu.Trigger`, opens the dropdown menu.\n\nWhen focus is on an item, moves focus to the next item.",
    },
    {
      keys: ["ArrowUp"],
      description: "When focus is on an item, moves focus to the previous item.",
    },
    {
      keys: ["ArrowRight", "ArrowLeft"],
      description:
        "When focus is on `DropdownMenu.SubTrigger`, opens or closes the submenu depending on reading direction.",
    },
    {
      keys: ["Esc"],
      description: "Closes the dropdown menu and moves focus to `DropdownMenu.Trigger`.",
    },
  ],
  notes: "",
};
