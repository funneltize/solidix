import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "navigation-menu",
  title: "Navigation Menu",
  metaDescription: "A collection of links for navigating websites.",
  ariaLink: "https://www.w3.org/TR/wai-aria/#navigation",
  description: "A collection of links for navigating websites.",
  features: [
    "Can be controlled or uncontrolled.",
    "Flexible layout structure with managed tab focus.",
    "Supports submenus.",
    "Optional active item indicator.",
    "Full keyboard navigation.",
    "Exposes CSS variables for advanced animation.",
    "Supports custom timings.",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { NavigationMenu } from "solidix";\n\nexport default () => (\n\t<NavigationMenu.Root>\n\t\t<NavigationMenu.List>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Trigger />\n\t\t\t\t<NavigationMenu.Content>\n\t\t\t\t\t<NavigationMenu.Link />\n\t\t\t\t</NavigationMenu.Content>\n\t\t\t</NavigationMenu.Item>\n\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Link />\n\t\t\t</NavigationMenu.Item>\n\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Trigger />\n\t\t\t\t<NavigationMenu.Content>\n\t\t\t\t\t<NavigationMenu.Sub>\n\t\t\t\t\t\t<NavigationMenu.List />\n\t\t\t\t\t\t<NavigationMenu.Viewport />\n\t\t\t\t\t</NavigationMenu.Sub>\n\t\t\t\t</NavigationMenu.Content>\n\t\t\t</NavigationMenu.Item>\n\n\t\t\t<NavigationMenu.Indicator />\n\t\t</NavigationMenu.List>\n\n\t\t<NavigationMenu.Viewport />\n\t</NavigationMenu.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the parts of a navigation menu.",
      props: [
        {
          name: "defaultValue",
          required: false,
          type: "string",
          description:
            "The value of the menu item that should be active when initially rendered. Use when you do not need to control the value state.",
        },
        {
          name: "value",
          required: false,
          type: "string",
          description:
            "The controlled value of the menu item to activate. Should be used in conjunction with `onValueChange`.",
        },
        {
          name: "onValueChange",
          required: false,
          type: "(value: string) => void",
          typeSimple: "function",
          description: "Event handler called when the value changes.",
        },
        {
          name: "delayDuration",
          type: "number",
          default: 200,
          description: "The duration from when the mouse enters a trigger until the content opens.",
        },
        {
          name: "skipDelayDuration",
          type: "number",
          default: 300,
          description:
            "How much time a user has to enter another trigger without incurring a delay again.",
        },
        {
          name: "dir",
          required: false,
          type: '"ltr" | "rtl"',
          typeSimple: "enum",
          description:
            "The reading direction of the menu when applicable. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.",
        },
        {
          name: "orientation",
          required: false,
          type: '"horizontal" | "vertical"',
          typeSimple: "enum",
          default: '"horizontal"',
          description: "The orientation of the menu.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Sub",
      description:
        "Signifies a submenu. Use it in place of the root part when nested to create a submenu.",
      props: [
        {
          name: "defaultValue",
          required: false,
          type: "string",
          description:
            "The value of the menu item that should be active when initially rendered. Use when you do not need to control the value state.",
        },
        {
          name: "value",
          required: false,
          type: "string",
          description:
            "The controlled value of the sub menu item to activate. Should be used in conjunction with `onValueChange`.",
        },
        {
          name: "onValueChange",
          required: false,
          type: "(value: string) => void",
          typeSimple: "function",
          description: "Event handler called when the value changes.",
        },
        {
          name: "orientation",
          required: false,
          type: '"horizontal" | "vertical"',
          typeSimple: "enum",
          default: '"horizontal"',
          description: "The orientation of the menu.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "List",
      description: "Contains the top level menu items.",
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
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Item",
      description: "A top level menu item, contains a link or trigger with content combination.",
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
          required: false,
          type: "string",
          description:
            "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Trigger",
      description: "The button that toggles the content.",
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
      name: "Content",
      description: "Contains the content associated with each trigger.",
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
          type: "(event: FocusEvent | MouseEvent | TouchEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
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
          values: ["open", "closed"],
        },
        {
          attribute: "[data-motion]",
          values: ["to-start", "to-end", "from-start", "from-end"],
        },
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Link",
      description: "A navigational link.",
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
          name: "active",
          required: false,
          type: "boolean",
          default: "false",
          description: "Used to identify the link as the currently active page.",
        },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          typeSimple: "function",
          description:
            "Event handler called when the user selects a link (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the navigation menu from closing when selecting that link.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-active]",
          values: ["Present when active"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Indicator",
      description:
        "An optional indicator element that renders below the list, is used to highlight the currently active trigger.",
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
          values: ["visible", "hidden"],
        },
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [
        {
          cssVariable: "--radix-navigation-menu-indicator-translate-x",
          description:
            "The horizontal offset of the indicator, computed from the active trigger's position. Present when the menu is horizontal.",
        },
        {
          cssVariable: "--radix-navigation-menu-indicator-translate-y",
          description:
            "The vertical offset of the indicator, computed from the active trigger's position. Present when the menu is vertical.",
        },
      ],
    },
    {
      name: "Viewport",
      description:
        "An optional viewport element that is used to render active content outside of the list.",
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
          values: ["open", "closed"],
        },
        {
          attribute: "[data-orientation]",
          values: ["vertical", "horizontal"],
        },
      ],
      cssVariables: [
        {
          cssVariable: "--radix-navigation-menu-viewport-width",
          description:
            "The width of the viewport when visible/hidden, computed from the active content",
        },
        {
          cssVariable: "--radix-navigation-menu-viewport-height",
          description:
            "The height of the viewport when visible/hidden, computed from the active content",
        },
      ],
    },
  ],
  examples: [
    {
      title: "Vertical",
      description: "You can create a vertical menu by using the `orientation` prop.",
      blocks: [
        {
          lang: "jsx",
          highlights: [1],
          code: '<NavigationMenu.Root orientation="vertical">\n\t<NavigationMenu.List>\n\t\t<NavigationMenu.Item>\n\t\t\t<NavigationMenu.Trigger>Item one</NavigationMenu.Trigger>\n\t\t\t<NavigationMenu.Content>Item one content</NavigationMenu.Content>\n\t\t</NavigationMenu.Item>\n\t\t<NavigationMenu.Item>\n\t\t\t<NavigationMenu.Trigger>Item two</NavigationMenu.Trigger>\n\t\t\t<NavigationMenu.Content>Item Two content</NavigationMenu.Content>\n\t\t</NavigationMenu.Item>\n\t</NavigationMenu.List>\n</NavigationMenu.Root>',
        },
      ],
    },
    {
      title: "Flexible layouts",
      description:
        "Use the `Viewport` part when you need extra control over where `Content` is rendered. This can be helpful when your design\nrequires an adjusted DOM structure or if you need flexibility to achieve advanced animation.\nTab focus will be maintained automatically.",
      blocks: [
        {
          lang: "jsx",
          highlights: [14],
          code: "<NavigationMenu.Root>\n\t<NavigationMenu.List>\n\t\t<NavigationMenu.Item>\n\t\t\t<NavigationMenu.Trigger>Item one</NavigationMenu.Trigger>\n\t\t\t<NavigationMenu.Content>Item one content</NavigationMenu.Content>\n\t\t</NavigationMenu.Item>\n\t\t<NavigationMenu.Item>\n\t\t\t<NavigationMenu.Trigger>Item two</NavigationMenu.Trigger>\n\t\t\t<NavigationMenu.Content>Item two content</NavigationMenu.Content>\n\t\t</NavigationMenu.Item>\n\t</NavigationMenu.List>\n\n\t{/* NavigationMenu.Content will be rendered here when active */}\n\t<NavigationMenu.Viewport />\n</NavigationMenu.Root>",
        },
      ],
    },
    {
      title: "With indicator",
      description:
        "You can use the optional `Indicator` part to highlight the currently active `Trigger`, this is useful when you want to provide\nan animated visual cue such as an arrow or highlight to accompany the `Viewport`.",
      blocks: [
        {
          lang: "jsx",
          highlights: [17],
          code: '// index.jsx\nimport { NavigationMenu } from "solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<NavigationMenu.Root>\n\t\t<NavigationMenu.List>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Trigger>Item one</NavigationMenu.Trigger>\n\t\t\t\t<NavigationMenu.Content>Item one content</NavigationMenu.Content>\n\t\t\t</NavigationMenu.Item>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Trigger>Item two</NavigationMenu.Trigger>\n\t\t\t\t<NavigationMenu.Content>Item two content</NavigationMenu.Content>\n\t\t\t</NavigationMenu.Item>\n\n\t\t\t<NavigationMenu.Indicator className="NavigationMenuIndicator" />\n\t\t</NavigationMenu.List>\n\n\t\t<NavigationMenu.Viewport />\n\t</NavigationMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [],
          code: '/* styles.css */\n.NavigationMenuIndicator {\n\tbackground-color: grey;\n}\n.NavigationMenuIndicator[data-orientation="horizontal"] {\n\theight: 3px;\n\ttransition:\n\t\twidth,\n\t\ttransform,\n\t\t250ms ease;\n}',
        },
      ],
    },
    {
      title: "With submenus",
      description:
        "Create a submenu by nesting your `NavigationMenu` and using the `Sub` part in place of its `Root`.\nSubmenus work differently to `Root` navigation menus and are similar to `Tabs` in that one item should always be active, so be\nsure to assign and set a `defaultValue`.",
      blocks: [
        {
          lang: "jsx",
          highlights: [10, 25],
          code: '<NavigationMenu.Root>\n\t<NavigationMenu.List>\n\t\t<NavigationMenu.Item>\n\t\t\t<NavigationMenu.Trigger>Item one</NavigationMenu.Trigger>\n\t\t\t<NavigationMenu.Content>Item one content</NavigationMenu.Content>\n\t\t</NavigationMenu.Item>\n\t\t<NavigationMenu.Item>\n\t\t\t<NavigationMenu.Trigger>Item two</NavigationMenu.Trigger>\n\t\t\t<NavigationMenu.Content>\n\t\t\t\t<NavigationMenu.Sub defaultValue="sub1">\n\t\t\t\t\t<NavigationMenu.List>\n\t\t\t\t\t\t<NavigationMenu.Item value="sub1">\n\t\t\t\t\t\t\t<NavigationMenu.Trigger>Sub item one</NavigationMenu.Trigger>\n\t\t\t\t\t\t\t<NavigationMenu.Content>\n\t\t\t\t\t\t\t\tSub item one content\n\t\t\t\t\t\t\t</NavigationMenu.Content>\n\t\t\t\t\t\t</NavigationMenu.Item>\n\t\t\t\t\t\t<NavigationMenu.Item value="sub2">\n\t\t\t\t\t\t\t<NavigationMenu.Trigger>Sub item two</NavigationMenu.Trigger>\n\t\t\t\t\t\t\t<NavigationMenu.Content>\n\t\t\t\t\t\t\t\tSub item two content\n\t\t\t\t\t\t\t</NavigationMenu.Content>\n\t\t\t\t\t\t</NavigationMenu.Item>\n\t\t\t\t\t</NavigationMenu.List>\n\t\t\t\t</NavigationMenu.Sub>\n\t\t\t</NavigationMenu.Content>\n\t\t</NavigationMenu.Item>\n\t</NavigationMenu.List>\n</NavigationMenu.Root>',
        },
      ],
    },
    {
      title: "With client side routing",
      description:
        "If you need to use the `Link` component provided by your routing package then we recommend composing with `NavigationMenu.Link` via a custom component.\nThis will ensure accessibility and consistent keyboard control is maintained. Here's an example using Next.js:",
      blocks: [
        {
          lang: "jsx",
          highlights: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 22, 25],
          code: '// index.jsx\nimport { usePathname } from "next/navigation";\nimport NextLink from "next/link";\nimport { NavigationMenu } from "solidix";\nimport "./styles.css";\n\nconst Link = ({ href, ...props }) => {\n\tconst pathname = usePathname();\n\tconst isActive = href === pathname;\n\n\treturn (\n\t\t<NavigationMenu.Link asChild active={isActive}>\n\t\t\t<NextLink href={href} class="NavigationMenuLink" {...props} />\n\t\t</NavigationMenu.Link>\n\t);\n};\n\nexport default () => (\n\t<NavigationMenu.Root>\n\t\t<NavigationMenu.List>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<Link href="/">Home</Link>\n\t\t\t</NavigationMenu.Item>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<Link href="/about">About</Link>\n\t\t\t</NavigationMenu.Item>\n\t\t</NavigationMenu.List>\n\t</NavigationMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [],
          code: '/* styles.css */\n.NavigationMenuLink {\n\ttext-decoration: none;\n}\n.NavigationMenuLink[data-active] {\n\ttext-decoration: "underline";\n}',
        },
      ],
    },
    {
      title: "Advanced animation",
      description:
        "We expose `--radix-navigation-menu-viewport-[width|height]` and `data-motion['from-start'|'to-start'|'from-end'|'to-end']` attributes\nto allow you to animate `Viewport` size and `Content` position based on the enter/exit direction.\n\nCombining these with `position: absolute;` allows you to create smooth overlapping animation effects when moving between items.",
      blocks: [
        {
          lang: "jsx",
          highlights: [10, 11, 12, 16, 17, 18, 22],
          code: '// index.jsx\nimport { NavigationMenu } from "solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<NavigationMenu.Root>\n\t\t<NavigationMenu.List>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Trigger>Item one</NavigationMenu.Trigger>\n\t\t\t\t<NavigationMenu.Content className="NavigationMenuContent">\n\t\t\t\t\tItem one content\n\t\t\t\t</NavigationMenu.Content>\n\t\t\t</NavigationMenu.Item>\n\t\t\t<NavigationMenu.Item>\n\t\t\t\t<NavigationMenu.Trigger>Item two</NavigationMenu.Trigger>\n\t\t\t\t<NavigationMenu.Content className="NavigationMenuContent">\n\t\t\t\t\tItem two content\n\t\t\t\t</NavigationMenu.Content>\n\t\t\t</NavigationMenu.Item>\n\t\t</NavigationMenu.List>\n\n\t\t<NavigationMenu.Viewport className="NavigationMenuViewport" />\n\t</NavigationMenu.Root>\n);',
        },
        {
          lang: "css",
          highlights: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 25],
          code: '/* styles.css */\n.NavigationMenuContent {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tanimation-duration: 250ms;\n\tanimation-timing-function: ease;\n}\n.NavigationMenuContent[data-motion="from-start"] {\n\tanimation-name: enterFromLeft;\n}\n.NavigationMenuContent[data-motion="from-end"] {\n\tanimation-name: enterFromRight;\n}\n.NavigationMenuContent[data-motion="to-start"] {\n\tanimation-name: exitToLeft;\n}\n.NavigationMenuContent[data-motion="to-end"] {\n\tanimation-name: exitToRight;\n}\n\n.NavigationMenuViewport {\n\tposition: relative;\n\twidth: var(--radix-navigation-menu-viewport-width);\n\theight: var(--radix-navigation-menu-viewport-height);\n\ttransition:\n\t\twidth,\n\t\theight,\n\t\t250ms ease;\n}\n\n@keyframes enterFromRight {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateX(200px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateX(0);\n\t}\n}\n\n@keyframes enterFromLeft {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateX(-200px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateX(0);\n\t}\n}\n\n@keyframes exitToRight {\n\tfrom {\n\t\topacity: 1;\n\t\ttransform: translateX(0);\n\t}\n\tto {\n\t\topacity: 0;\n\t\ttransform: translateX(200px);\n\t}\n}\n\n@keyframes exitToLeft {\n\tfrom {\n\t\topacity: 1;\n\t\ttransform: translateX(0);\n\t}\n\tto {\n\t\topacity: 0;\n\t\ttransform: translateX(-200px);\n\t}\n}',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Adheres to the [`navigation` role requirements](https://www.w3.org/TR/wai-aria-1.2/#navigation).",
  keyboard: [
    {
      keys: ["Space", "Enter"],
      description: "When focus is on `NavigationMenu.Trigger`, opens the content.",
    },
    {
      keys: ["Tab"],
      description: "Moves focus to the next focusable element.",
    },
    {
      keys: ["ArrowDown"],
      description:
        "When `horizontal` and focus is on an open `NavigationMenu.Trigger`, moves focus into `NavigationMenu.Content`.\n\nMoves focus to the next `NavigationMenu.Trigger` or `NavigationMenu.Link`.",
    },
    {
      keys: ["ArrowUp"],
      description: "Moves focus to the previous `NavigationMenu.Trigger` or `NavigationMenu.Link`.",
    },
    {
      keys: ["ArrowRight", "ArrowLeft"],
      description:
        "When `vertical` and focus is on an open `NavigationMenu.Trigger`, moves focus into its `NavigationMenu.Content`.\n\nMoves focus to the next / previous `NavigationMenu.Trigger` or `NavigationMenu.Link`.",
    },
    {
      keys: ["Home", "End"],
      description:
        "Moves focus to the first/last `NavigationMenu.Trigger` or `NavigationMenu.Link`.",
    },
    {
      keys: ["Esc"],
      description:
        "Closes open `NavigationMenu.Content` and moves focus to its `NavigationMenu.Trigger`.",
    },
  ],
  notes: "",
};
