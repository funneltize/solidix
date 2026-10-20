import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "context-menu",
  title: "Context Menu",
  metaDescription:
    "Displays a menu located at the pointer, triggered by a right click or a long press.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/menu",
  description:
    "Displays a menu located at the pointer, triggered by a right click or a long\n\tpress.",
  features: [
    "Supports submenus with configurable reading direction.",
    "Supports items, labels, groups of items.",
    "Supports checkable items (single or multiple) with optional indeterminate state.",
    "Supports modal and non-modal modes.",
    "Customize side, alignment, offsets, collision handling.",
    "Focus is fully managed.",
    "Full keyboard navigation.",
    "Typeahead support.",
    "Dismissing and layering behavior is highly customizable.",
    "Triggers with a long press on touch devices",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { ContextMenu } from "@solidix/solidix";\n\nexport default () => (\n\t<ContextMenu.Root>\n\t\t<ContextMenu.Trigger />\n\n\t\t<ContextMenu.Portal>\n\t\t\t<ContextMenu.Content>\n\t\t\t\t<ContextMenu.Label />\n\t\t\t\t<ContextMenu.Item />\n\n\t\t\t\t<ContextMenu.Group>\n\t\t\t\t\t<ContextMenu.Item />\n\t\t\t\t</ContextMenu.Group>\n\n\t\t\t\t<ContextMenu.CheckboxItem>\n\t\t\t\t\t<ContextMenu.ItemIndicator />\n\t\t\t\t</ContextMenu.CheckboxItem>\n\n\t\t\t\t<ContextMenu.RadioGroup>\n\t\t\t\t\t<ContextMenu.RadioItem>\n\t\t\t\t\t\t<ContextMenu.ItemIndicator />\n\t\t\t\t\t</ContextMenu.RadioItem>\n\t\t\t\t</ContextMenu.RadioGroup>\n\n\t\t\t\t<ContextMenu.Sub>\n\t\t\t\t\t<ContextMenu.SubTrigger />\n\t\t\t\t\t<ContextMenu.Portal>\n\t\t\t\t\t\t<ContextMenu.SubContent />\n\t\t\t\t\t</ContextMenu.Portal>\n\t\t\t\t</ContextMenu.Sub>\n\n\t\t\t\t<ContextMenu.Separator />\n\t\t\t</ContextMenu.Content>\n\t\t</ContextMenu.Portal>\n\t</ContextMenu.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the parts of a context menu.",
      props: [
        {
          name: "dir",
          required: false,
          type: '"ltr" | "rtl"',
          typeSimple: "enum",
          description:
            "The reading direction of submenus when applicable. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.",
        },
        {
          name: "open",
          type: "boolean",
          description:
            "The controlled open state of the context menu. Must be used in conjunction with `onOpenChange`. This is intended for reading the open state and closing the menu programmatically - we discourage opening the menu programmatically, since opening it depends on user interaction to position the menu.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the open state of the context menu changes.",
        },
        {
          name: "modal",
          required: false,
          type: "boolean",
          default: "true",
          description:
            "The modality of the context menu. When set to `true`, interaction with outside elements will be disabled and only menu content will be visible to screen readers.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Trigger",
      description:
        "The area that opens the context menu. Wrap it around the target you want the context menu to open from when right-clicking (or using the relevant keyboard shortcuts).",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
        },
        {
          name: "disabled",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "When `true`, the context menu won't open when right-clicking. Note that this will also restore the native context menu.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["open", "closed"],
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
            "Used to force mounting when more control is needed. Useful when controlling animation with CSS (see the Animation guide). If used on this part, it will be inherited by `ContextMenu.Content` and `ContextMenu.SubContent` respectively.",
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
      description: "The component that pops out in an open context menu.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Event handler called when focus moves back after closing. It can be prevented by calling `event.preventDefault`.",
        },
        {
          name: "onEscapeKeyDown",
          type: "(event: KeyboardEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.",
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
            "Used to force mounting when more control is needed. Useful when controlling animation with CSS (see the Animation guide). It inherits from `ContextMenu.Portal`.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "The vertical distance in pixels from the anchor.",
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
      ],
      cssVariables: [
        {
          cssVariable: "--radix-context-menu-content-transform-origin",
          description:
            "The `transform-origin` computed from the content and arrow positions/offsets",
        },
        {
          cssVariable: "--radix-context-menu-content-available-width",
          description: "The remaining width between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-context-menu-content-available-height",
          description: "The remaining height between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-context-menu-trigger-width",
          description: "The width of the trigger",
        },
        {
          cssVariable: "--radix-context-menu-trigger-height",
          description: "The height of the trigger",
        },
      ],
    },
    {
      name: "Arrow",
      description:
        "An optional arrow element to render alongside a submenu. This can be used to help visually link the trigger item with the `ContextMenu.Content`. Must be rendered inside `ContextMenu.Content`.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
      description: "The component that contains the context menu items.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the context menu from closing when selecting that item.",
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
      description: "Used to group multiple `ContextMenu.Item`s.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the context menu from closing when selecting that item.",
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
      description: "Used to group multiple `ContextMenu.RadioItem`s.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the context menu from closing when selecting that item.",
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
        "Renders when the parent `ContextMenu.CheckboxItem` or `ContextMenu.RadioItem` is checked. You can style this element directly, or you can use it as a wrapper to put an icon into, or both.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
        },
        {
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with CSS (see the Animation guide).",
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
      description: "Used to visually separate items in the context menu.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
      description: "An item that opens a submenu. Must be rendered inside `ContextMenu.Sub`.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
      cssVariables: [],
    },
    {
      name: "SubContent",
      description:
        "The component that pops out when a submenu is open. Must be rendered inside `ContextMenu.Sub`.",
      props: [
        {
          name: "asChild",
          required: false,
          type: "boolean",
          default: "false",
          description:
            "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead the [Composition guide](#/guides/composition) for more details.",
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
            "Used to force mounting when more control is needed. Useful when controlling animation with CSS (see the Animation guide). It inherits from `ContextMenu.Portal`.",
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
      ],
      cssVariables: [
        {
          cssVariable: "--radix-context-menu-content-transform-origin",
          description:
            "The `transform-origin` computed from the content and arrow positions/offsets",
        },
        {
          cssVariable: "--radix-context-menu-content-available-width",
          description: "The remaining width between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-context-menu-content-available-height",
          description: "The remaining height between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-context-menu-trigger-width",
          description: "The width of the trigger",
        },
        {
          cssVariable: "--radix-context-menu-trigger-height",
          description: "The height of the trigger",
        },
      ],
    },
  ],
  examples: [
    {
      title: "With submenus",
      description:
        "You can create submenus by using `ContextMenu.Sub` in combination with its parts.",
      blocks: [
        {
          lang: "jsx",
          highlights: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
          code: "<ContextMenu.Root>\n\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t<ContextMenu.Portal>\n\t\t<ContextMenu.Content>\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t<ContextMenu.Separator />\n\t\t\t<ContextMenu.Sub>\n\t\t\t\t<ContextMenu.SubTrigger>Sub menu →</ContextMenu.SubTrigger>\n\t\t\t\t<ContextMenu.Portal>\n\t\t\t\t\t<ContextMenu.SubContent>\n\t\t\t\t\t\t<ContextMenu.Item>Sub menu item</ContextMenu.Item>\n\t\t\t\t\t\t<ContextMenu.Item>Sub menu item</ContextMenu.Item>\n\t\t\t\t\t\t<ContextMenu.Arrow />\n\t\t\t\t\t</ContextMenu.SubContent>\n\t\t\t\t</ContextMenu.Portal>\n\t\t\t</ContextMenu.Sub>\n\t\t\t<ContextMenu.Separator />\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t</ContextMenu.Content>\n\t</ContextMenu.Portal>\n</ContextMenu.Root>",
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
          code: '// index.tsx\nimport { ContextMenu } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<ContextMenu.Root>\n\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t<ContextMenu.Portal>\n\t\t\t<ContextMenu.Content>\n\t\t\t\t<ContextMenu.Item class="ContextMenuItem" disabled>\n\t\t\t\t\t…\n\t\t\t\t</ContextMenu.Item>\n\t\t\t\t<ContextMenu.Item class="ContextMenuItem">…</ContextMenu.Item>\n\t\t\t</ContextMenu.Content>\n\t\t</ContextMenu.Portal>\n\t</ContextMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [2],
          code: "/* styles.css */\n.ContextMenuItem[data-disabled] {\n\tcolor: gainsboro;\n}",
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
          code: "<ContextMenu.Root>\n\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t<ContextMenu.Portal>\n\t\t<ContextMenu.Content>\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t<ContextMenu.Separator />\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t<ContextMenu.Separator />\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t</ContextMenu.Content>\n\t</ContextMenu.Portal>\n</ContextMenu.Root>",
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
          code: "<ContextMenu.Root>\n\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t<ContextMenu.Portal>\n\t\t<ContextMenu.Content>\n\t\t\t<ContextMenu.Label>Label</ContextMenu.Label>\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t</ContextMenu.Content>\n\t</ContextMenu.Portal>\n</ContextMenu.Root>",
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
          code: 'import { createSignal } from "solid-js";\nimport { ContextMenu } from "@solidix/solidix";\n\nexport default () => {\n\tconst [checked, setChecked] = createSignal(true);\n\n\treturn (\n\t\t<ContextMenu.Root>\n\t\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t\t<ContextMenu.Portal>\n\t\t\t\t<ContextMenu.Content>\n\t\t\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t\t\t<ContextMenu.Item>…</ContextMenu.Item>\n\t\t\t\t\t<ContextMenu.Separator />\n\t\t\t\t\t<ContextMenu.CheckboxItem\n\t\t\t\t\t\tchecked={checked()}\n\t\t\t\t\t\tonCheckedChange={setChecked}\n\t\t\t\t\t>\n\t\t\t\t\t\t<ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\t<span aria-hidden="true">✓</span>\n\t\t\t\t\t\t</ContextMenu.ItemIndicator>\n\t\t\t\t\t\tCheckbox item\n\t\t\t\t\t</ContextMenu.CheckboxItem>\n\t\t\t\t</ContextMenu.Content>\n\t\t\t</ContextMenu.Portal>\n\t\t</ContextMenu.Root>\n\t);\n};',
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
          code: 'import { createSignal } from "solid-js";\nimport { ContextMenu } from "@solidix/solidix";\n\nexport default () => {\n\tconst [color, setColor] = createSignal("blue");\n\n\treturn (\n\t\t<ContextMenu.Root>\n\t\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t\t<ContextMenu.Portal>\n\t\t\t\t<ContextMenu.Content>\n\t\t\t\t\t<ContextMenu.RadioGroup value={color()} onValueChange={setColor}>\n\t\t\t\t\t\t<ContextMenu.RadioItem value="red">\n\t\t\t\t\t\t\t<ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\t\t<span aria-hidden="true">✓</span>\n\t\t\t\t\t\t\t</ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\tRed\n\t\t\t\t\t\t</ContextMenu.RadioItem>\n\t\t\t\t\t\t<ContextMenu.RadioItem value="blue">\n\t\t\t\t\t\t\t<ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\t\t<span aria-hidden="true">✓</span>\n\t\t\t\t\t\t\t</ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\tBlue\n\t\t\t\t\t\t</ContextMenu.RadioItem>\n\t\t\t\t\t\t<ContextMenu.RadioItem value="green">\n\t\t\t\t\t\t\t<ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\t\t<span aria-hidden="true">✓</span>\n\t\t\t\t\t\t\t</ContextMenu.ItemIndicator>\n\t\t\t\t\t\t\tGreen\n\t\t\t\t\t\t</ContextMenu.RadioItem>\n\t\t\t\t\t</ContextMenu.RadioGroup>\n\t\t\t\t</ContextMenu.Content>\n\t\t\t</ContextMenu.Portal>\n\t\t</ContextMenu.Root>\n\t);\n};',
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
          code: 'import { ContextMenu } from "@solidix/solidix";\n\nexport default () => (\n\t<ContextMenu.Root>\n\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t<ContextMenu.Portal>\n\t\t\t<ContextMenu.Content>\n\t\t\t\t<ContextMenu.Item>\n\t\t\t\t\t<img src="…" />\n\t\t\t\t\tAdolfo Hess\n\t\t\t\t</ContextMenu.Item>\n\t\t\t\t<ContextMenu.Item>\n\t\t\t\t\t<img src="…" />\n\t\t\t\t\tMiyah Myles\n\t\t\t\t</ContextMenu.Item>\n\t\t\t</ContextMenu.Content>\n\t\t</ContextMenu.Portal>\n\t</ContextMenu.Root>\n);',
        },
      ],
    },
    {
      title: "Constrain the content/sub-content size",
      description:
        "You may want to constrain the width of the content (or sub-content) so that it matches the trigger (or sub-trigger) width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-context-menu-trigger-width` and `--radix-context-menu-content-available-height` to support this. Use them to constrain the content dimensions.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9],
          code: '// index.tsx\nimport { ContextMenu } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<ContextMenu.Root>\n\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t<ContextMenu.Portal>\n\t\t\t<ContextMenu.Content class="ContextMenuContent">\n\t\t\t\t…\n\t\t\t</ContextMenu.Content>\n\t\t</ContextMenu.Portal>\n\t</ContextMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [],
          code: "/* styles.css */\n.ContextMenuContent {\n\twidth: var(--radix-context-menu-trigger-width);\n\tmax-height: var(--radix-context-menu-content-available-height);\n}",
        },
      ],
    },
    {
      title: "Origin-aware animations",
      description:
        "We expose a CSS custom property `--radix-context-menu-content-transform-origin`. Use it to animate the content from its computed origin based on `side`, `sideOffset`, `align`, `alignOffset` and any collisions.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9],
          code: '// index.tsx\nimport { ContextMenu } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<ContextMenu.Root>\n\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t<ContextMenu.Portal>\n\t\t\t<ContextMenu.Content class="ContextMenuContent">\n\t\t\t\t…\n\t\t\t</ContextMenu.Content>\n\t\t</ContextMenu.Portal>\n\t</ContextMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [3],
          code: "/* styles.css */\n.ContextMenuContent {\n\ttransform-origin: var(--radix-context-menu-content-transform-origin);\n\tanimation: scaleIn 0.5s ease-out;\n}\n\n@keyframes scaleIn {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t}\n}",
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
          code: '// index.tsx\nimport { ContextMenu } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<ContextMenu.Root>\n\t\t<ContextMenu.Trigger>…</ContextMenu.Trigger>\n\t\t<ContextMenu.Portal>\n\t\t\t<ContextMenu.Content class="ContextMenuContent">\n\t\t\t\t…\n\t\t\t</ContextMenu.Content>\n\t\t</ContextMenu.Portal>\n\t</ContextMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [6, 7, 8, 9, 10, 11],
          code: '/* styles.css */\n.ContextMenuContent {\n\tanimation-duration: 0.6s;\n\tanimation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);\n}\n.ContextMenuContent[data-side="top"] {\n\tanimation-name: slideUp;\n}\n.ContextMenuContent[data-side="bottom"] {\n\tanimation-name: slideDown;\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(-10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Uses [roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex) to manage focus movement among menu items.",
  keyboard: [
    {
      keys: ["Space"],
      description: "Activates the focused item.",
    },
    {
      keys: ["Enter"],
      description: "Activates the focused item.",
    },
    {
      keys: ["ArrowDown"],
      description: "Moves focus to the next item.",
    },
    {
      keys: ["ArrowUp"],
      description: "Moves focus to the previous item.",
    },
    {
      keys: ["ArrowRight", "ArrowLeft"],
      description:
        "When focus is on `ContextMenu.SubTrigger`, opens or closes the submenu depending on reading direction.",
    },
    {
      keys: ["Esc"],
      description: "Closes the context menu",
    },
  ],
  notes: "",
};
