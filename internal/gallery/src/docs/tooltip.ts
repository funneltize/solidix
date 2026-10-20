import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "tooltip",
  title: "Tooltip",
  metaDescription:
    "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/tooltip",
  description:
    "A popup that displays information related to an element when the element\n\treceives keyboard focus or the mouse hovers over it.",
  features: [
    "Provider to control display delay globally.",
    "Opens when the trigger is focused or hovered.",
    "Closes when the trigger is activated or when pressing escape.",
    "Supports custom timings.",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Tooltip } from "@solidix/solidix";\n\nexport default () => (\n\t<Tooltip.Provider>\n\t\t<Tooltip.Root>\n\t\t\t<Tooltip.Trigger />\n\t\t\t<Tooltip.Portal>\n\t\t\t\t<Tooltip.Content>\n\t\t\t\t\t<Tooltip.Arrow />\n\t\t\t\t</Tooltip.Content>\n\t\t\t</Tooltip.Portal>\n\t\t</Tooltip.Root>\n\t</Tooltip.Provider>\n);',
  },
  parts: [
    {
      name: "Provider",
      description: "Wraps your app to provide global functionality to your tooltips.",
      props: [
        {
          name: "delayDuration",
          type: "number",
          default: 700,
          description:
            "The duration from when the mouse enters a tooltip trigger until the tooltip opens.",
        },
        {
          name: "skipDelayDuration",
          type: "number",
          default: 300,
          description:
            "How much time a user has to enter another trigger without incurring a delay again.",
        },
        {
          name: "disableHoverableContent",
          type: "boolean",
          description:
            "Prevents `Tooltip.Content` from remaining open when hovering. Disabling this has accessibility consequences.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Root",
      description: "Contains all the parts of a tooltip.",
      props: [
        {
          name: "defaultOpen",
          type: "boolean",
          description:
            "The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state.",
        },
        {
          name: "open",
          type: "boolean",
          description:
            "The controlled open state of the tooltip. Must be used in conjunction with `onOpenChange`.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the open state of the tooltip changes.",
        },
        {
          name: "delayDuration",
          type: "number",
          default: 700,
          description:
            "Override the duration given to the `Provider` to customise the open delay for a specific tooltip.",
        },
        {
          name: "disableHoverableContent",
          type: "boolean",
          default: false,
          description:
            "Prevents `Tooltip.Content` from remaining open when hovering. Disabling this has accessibility consequences. Inherits from `Tooltip.Provider`.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Trigger",
      description:
        "The button that toggles the tooltip. By default, the `Tooltip.Content` will position itself against the trigger.",
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
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["closed", "delayed-open", "instant-open"],
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
            "Used to force mounting when more control is needed. Useful when controlling animation with CSS (see the Animation guide). If used on this part, it will be inherited by `Tooltip.Content`.",
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
      description: "The component that pops out when the tooltip is open.",
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
          name: "aria-label",
          type: "string",
          description:
            "By default, screenreaders will announce the content inside the component. If this is not descriptive enough, or you have content that cannot be announced, use `aria-label` as a more descriptive label.",
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
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with CSS (see the Animation guide). It inherits from `Tooltip.Portal`.",
        },
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          typeSimple: "enum",
          default: '"top"',
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
          values: ["closed", "delayed-open", "instant-open"],
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
          cssVariable: "--radix-tooltip-content-transform-origin",
          description:
            "The `transform-origin` computed from the content and arrow positions/offsets",
        },
        {
          cssVariable: "--radix-tooltip-content-available-width",
          description: "The remaining width between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-tooltip-content-available-height",
          description: "The remaining height between the trigger and the boundary edge",
        },
        {
          cssVariable: "--radix-tooltip-trigger-width",
          description: "The width of the trigger",
        },
        {
          cssVariable: "--radix-tooltip-trigger-height",
          description: "The height of the trigger",
        },
      ],
    },
    {
      name: "Arrow",
      description:
        "An optional arrow element to render alongside the tooltip. This can be used to help visually link the trigger with the `Tooltip.Content`. Must be rendered inside `Tooltip.Content`.",
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
  ],
  examples: [
    {
      title: "Configure globally",
      description:
        "Use the `Provider` to control `delayDuration` and `skipDelayDuration` globally.",
      blocks: [
        {
          lang: "jsx",
          highlights: [4],
          code: 'import { Tooltip } from "@solidix/solidix";\n\nexport default () => (\n\t<Tooltip.Provider delayDuration={800} skipDelayDuration={500}>\n\t\t<Tooltip.Root>\n\t\t\t<Tooltip.Trigger>…</Tooltip.Trigger>\n\t\t\t<Tooltip.Content>…</Tooltip.Content>\n\t\t</Tooltip.Root>\n\t\t<Tooltip.Root>\n\t\t\t<Tooltip.Trigger>…</Tooltip.Trigger>\n\t\t\t<Tooltip.Content>…</Tooltip.Content>\n\t\t</Tooltip.Root>\n\t</Tooltip.Provider>\n);',
        },
      ],
    },
    {
      title: "Show instantly",
      description:
        "Use the `delayDuration` prop to control the time it takes for the tooltip to open.",
      blocks: [
        {
          lang: "jsx",
          highlights: [4],
          code: 'import { Tooltip } from "@solidix/solidix";\n\nexport default () => (\n\t<Tooltip.Root delayDuration={0}>\n\t\t<Tooltip.Trigger>…</Tooltip.Trigger>\n\t\t<Tooltip.Content>…</Tooltip.Content>\n\t</Tooltip.Root>\n);',
        },
      ],
    },
    {
      title: "Constrain the content size",
      description:
        "You may want to constrain the width of the content so that it matches the trigger width. You may also want to constrain its height to not exceed the viewport.\n\nWe expose several CSS custom properties such as `--radix-tooltip-trigger-width` and `--radix-tooltip-content-available-height` to support this. Use them to constrain the content dimensions.",
      blocks: [
        {
          lang: "jsx",
          highlights: [9],
          code: '// index.tsx\nimport { Tooltip } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<Tooltip.Root>\n\t\t<Tooltip.Trigger>…</Tooltip.Trigger>\n\t\t<Tooltip.Portal>\n\t\t\t<Tooltip.Content class="TooltipContent" sideOffset={5}>\n\t\t\t\t…\n\t\t\t</Tooltip.Content>\n\t\t</Tooltip.Portal>\n\t</Tooltip.Root>\n);',
        },
        {
          lang: "css",
          highlights: [],
          code: "/* styles.css */\n.TooltipContent {\n\twidth: var(--radix-tooltip-trigger-width);\n\tmax-height: var(--radix-tooltip-content-available-height);\n}",
        },
      ],
    },
    {
      title: "Origin-aware animations",
      description:
        "We expose a CSS custom property `--radix-tooltip-content-transform-origin`. Use it to animate the content from its computed origin based on `side`, `sideOffset`, `align`, `alignOffset` and any collisions.",
      blocks: [
        {
          lang: "jsx",
          highlights: [8],
          code: '// index.tsx\nimport { Tooltip } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<Tooltip.Root>\n\t\t<Tooltip.Trigger>…</Tooltip.Trigger>\n\t\t<Tooltip.Content class="TooltipContent">…</Tooltip.Content>\n\t</Tooltip.Root>\n);',
        },
        {
          lang: "css",
          highlights: [3, 4],
          code: "/* styles.css */\n.TooltipContent {\n\ttransform-origin: var(--radix-tooltip-content-transform-origin);\n\tanimation: scaleIn 0.5s ease-out;\n}\n\n@keyframes scaleIn {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: scale(1);\n\t}\n}",
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
          highlights: [8],
          code: '// index.tsx\nimport { Tooltip } from "@solidix/solidix";\nimport "./styles.css";\n\nexport default () => (\n\t<Tooltip.Root>\n\t\t<Tooltip.Trigger>…</Tooltip.Trigger>\n\t\t<Tooltip.Content class="TooltipContent">…</Tooltip.Content>\n\t</Tooltip.Root>\n);',
        },
        {
          lang: "css",
          highlights: [6, 9],
          code: '/* styles.css */\n.TooltipContent {\n\tanimation-duration: 0.6s;\n\tanimation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);\n}\n.TooltipContent[data-side="top"] {\n\tanimation-name: slideUp;\n}\n.TooltipContent[data-side="bottom"] {\n\tanimation-name: slideDown;\n}\n\n@keyframes slideDown {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(-10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}\n\n@keyframes slideUp {\n\tfrom {\n\t\topacity: 0;\n\t\ttransform: translateY(10px);\n\t}\n\tto {\n\t\topacity: 1;\n\t\ttransform: translateY(0);\n\t}\n}',
        },
      ],
    },
  ],
  customApis: [
    {
      title: "Abstract parts and introduce a content prop",
      description:
        "This example abstracts all of the `Tooltip` parts and introduces a new `content` prop.\n\n#### Usage\n\n\n\n#### Implementation\n\nUse the `asChild` prop to convert the trigger part into a slottable area. It will replace the trigger with the child that gets passed to it.",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: 'import { Tooltip } from "./your-tooltip";\n\nexport default () => (\n\t<Tooltip content="Tooltip content">\n\t\t<button>Tooltip trigger</button>\n\t</Tooltip>\n);',
        },
        {
          lang: "jsx",
          highlights: [8, 9, 10],
          code: '// your-tooltip.tsx\nimport { Tooltip as TooltipPrimitive } from "@solidix/solidix";\n\nexport function Tooltip({\n\tchildren,\n\tcontent,\n\topen,\n\tdefaultOpen,\n\tonOpenChange,\n\t...props\n}) {\n\treturn (\n\t\t<TooltipPrimitive.Root\n\t\t\topen={open}\n\t\t\tdefaultOpen={defaultOpen}\n\t\t\tonOpenChange={onOpenChange}\n\t\t>\n\t\t\t<TooltipPrimitive.Trigger asChild>\n\t\t\t\t{children}\n\t\t\t</TooltipPrimitive.Trigger>\n\t\t\t<TooltipPrimitive.Content side="top" align="center" {...props}>\n\t\t\t\t{content}\n\t\t\t\t<TooltipPrimitive.Arrow width={11} height={5} />\n\t\t\t</TooltipPrimitive.Content>\n\t\t</TooltipPrimitive.Root>\n\t);\n}',
        },
      ],
    },
  ],
  accessibility: "",
  keyboard: [
    {
      keys: ["Tab"],
      description: "Opens/closes the tooltip without delay.",
    },
    {
      keys: ["Space"],
      description: "If open, closes the tooltip without delay.",
    },
    {
      keys: ["Enter"],
      description: "If open, closes the tooltip without delay.",
    },
    {
      keys: ["Escape"],
      description: "If open, closes the tooltip without delay.",
    },
  ],
  notes: "",
};
