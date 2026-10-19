import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "dialog",
  title: "Dialog",
  metaDescription:
    "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal",
  description:
    "A window overlaid on either the primary window or another dialog window,\n\trendering the content underneath inert.",
  features: [
    "Supports modal and non-modal modes.",
    "Focus is automatically trapped within modal.",
    "Can be controlled or uncontrolled.",
    "Manages screen reader announcements with `Title` and `Description` components.",
    "Esc closes the component automatically.",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Dialog } from "solidix";\n\nexport default () => (\n\t<Dialog.Root>\n\t\t<Dialog.Trigger />\n\t\t<Dialog.Portal>\n\t\t\t<Dialog.Overlay />\n\t\t\t<Dialog.Content>\n\t\t\t\t<Dialog.Title />\n\t\t\t\t<Dialog.Description />\n\t\t\t\t<Dialog.Close />\n\t\t\t</Dialog.Content>\n\t\t</Dialog.Portal>\n\t</Dialog.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the parts of a dialog.",
      props: [
        {
          name: "defaultOpen",
          type: "boolean",
          description:
            "The open state of the dialog when it is initially rendered. Use when you do not need to control its open state.",
        },
        {
          name: "open",
          type: "boolean",
          description:
            "The controlled open state of the dialog. Must be used in conjunction with `onOpenChange`.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the open state of the dialog changes.",
        },
        {
          name: "modal",
          required: false,
          type: "boolean",
          default: "true",
          description:
            "The modality of the dialog. When set to `true`, interaction with outside elements will be disabled and only dialog content will be visible to screen readers.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Trigger",
      description: "The button that opens the dialog.",
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
      ],
      cssVariables: [],
    },
    {
      name: "Portal",
      description: "When used, portals your overlay and content parts into the `body`.",
      props: [
        {
          name: "forceMount",
          type: "boolean",
          description:
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `Dialog.Overlay` and `Dialog.Content`.",
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
      name: "Overlay",
      description: "A layer that covers the inert portion of the view when the dialog is open.",
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
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `Dialog.Portal`.",
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
      name: "Content",
      description: "Contains content to be rendered in the open dialog.",
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
            "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `Dialog.Portal`.",
        },
        {
          name: "onOpenAutoFocus",
          type: "(event: Event) => void",
          typeSimple: "function",
          description:
            "Event handler called when focus moves into the component after opening. It can be prevented by calling `event.preventDefault`.",
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
          name: "onInteractOutside",
          type: "(event: FocusEvent | MouseEvent | TouchEvent) => void",
          typeSimple: "function",
          description:
            "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling `event.preventDefault`.",
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
      name: "Close",
      description: "The button that closes the dialog.",
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
      name: "Title",
      description:
        "An accessible title to be announced when the dialog is opened.\n\nIf you want to hide the title, wrap it inside our Visually Hidden utility like this `<VisuallyHidden asChild>`.",
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
      name: "Description",
      description:
        "An optional accessible description to be announced when the dialog is opened.\n\nIf you want to hide the description, wrap it inside our Visually Hidden utility like this `<VisuallyHidden asChild>`. If you want to remove the description entirely, remove this part and pass `aria-describedby={undefined}` to `Dialog.Content`.",
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
  ],
  examples: [
    {
      title: "Close after asynchronous form submission",
      description:
        "Use the controlled props to programmatically close the Dialog after an async operation has completed.",
      blocks: [
        {
          lang: "jsx",
          highlights: [4, 7, 10, 15, 17],
          code: 'import { Dialog } from "solidix";\n\nconst wait = () => new Promise((resolve) => setTimeout(resolve, 1000));\n\nexport default () => {\n\tconst [open, setOpen] = createSignal(false);\n\n\treturn (\n\t\t<Dialog.Root open={open()} onOpenChange={setOpen}>\n\t\t\t<Dialog.Trigger>Open</Dialog.Trigger>\n\t\t\t<Dialog.Portal>\n\t\t\t\t<Dialog.Overlay />\n\t\t\t\t<Dialog.Content>\n\t\t\t\t\t<form\n\t\t\t\t\t\tonSubmit={(event) => {\n\t\t\t\t\t\t\twait().then(() => setOpen(false));\n\t\t\t\t\t\t\tevent.preventDefault();\n\t\t\t\t\t\t}}\n\t\t\t\t\t>\n\t\t\t\t\t\t{/* some inputs */}\n\t\t\t\t\t\t<button type="submit">Submit</button>\n\t\t\t\t\t</form>\n\t\t\t\t</Dialog.Content>\n\t\t\t</Dialog.Portal>\n\t\t</Dialog.Root>\n\t);\n};',
        },
      ],
    },
    {
      title: "Scrollable overlay",
      description: "Move the content inside the overlay to render a dialog with overflow.",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: '// index.jsx\nimport { Dialog } from "solidix";\nimport "./styles.css";\n\nexport default () => {\n\treturn (\n\t\t<Dialog.Root>\n\t\t\t<Dialog.Trigger />\n\t\t\t<Dialog.Portal>\n\t\t\t\t<Dialog.Overlay class="DialogOverlay">\n\t\t\t\t\t<Dialog.Content class="DialogContent">...</Dialog.Content>\n\t\t\t\t</Dialog.Overlay>\n\t\t\t</Dialog.Portal>\n\t\t</Dialog.Root>\n\t);\n};',
        },
        {
          lang: "css",
          highlights: [],
          code: "/* styles.css */\n.DialogOverlay {\n\tbackground: rgba(0 0 0 / 0.5);\n\tposition: fixed;\n\ttop: 0;\n\tleft: 0;\n\tright: 0;\n\tbottom: 0;\n\tdisplay: grid;\n\tplace-items: center;\n\toverflow-y: auto;\n}\n\n.DialogContent {\n\tmin-width: 300px;\n\tbackground: white;\n\tpadding: 30px;\n\tborder-radius: 4px;\n}",
        },
      ],
    },
    {
      title: "Custom portal container",
      description: "Customise the element that your dialog portals into.",
      blocks: [
        {
          lang: "jsx",
          highlights: [5, 10, 16],
          code: 'import { Dialog } from "solidix";\n\nexport default () => {\n\tconst [container, setContainer] = createSignal(null);\n\treturn (\n\t\t<div>\n\t\t\t<Dialog.Root>\n\t\t\t\t<Dialog.Trigger />\n\t\t\t\t<Dialog.Portal container={container()}>\n\t\t\t\t\t<Dialog.Overlay />\n\t\t\t\t\t<Dialog.Content>...</Dialog.Content>\n\t\t\t\t</Dialog.Portal>\n\t\t\t</Dialog.Root>\n\n\t\t\t<div ref={setContainer} />\n\t\t</div>\n\t);\n};',
        },
      ],
    },
  ],
  customApis: [
    {
      title: "Abstract the overlay and the close button",
      description:
        "This example abstracts the `Dialog.Overlay` and `Dialog.Close` parts.\n\n#### Usage\n\n\n\n#### Implementation",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: 'import { Dialog, DialogTrigger, DialogContent } from "./your-dialog";\n\nexport default () => (\n\t<Dialog>\n\t\t<DialogTrigger>Dialog trigger</DialogTrigger>\n\t\t<DialogContent>Dialog Content</DialogContent>\n\t</Dialog>\n);',
        },
        {
          lang: "jsx",
          highlights: [],
          code: '// your-dialog.jsx\nimport { omit } from "solid-js";\nimport { Dialog as DialogPrimitive } from "solidix";\nimport { Cross1Icon } from "@radix-ui/react-icons";\n\nexport const DialogContent = (props) => {\n\tconst rest = omit(props, "children", "ref");\n\treturn (\n\t\t<DialogPrimitive.Portal>\n\t\t\t<DialogPrimitive.Overlay />\n\t\t\t<DialogPrimitive.Content {...rest} ref={props.ref}>\n\t\t\t\t{props.children}\n\t\t\t\t<DialogPrimitive.Close aria-label="Close">\n\t\t\t\t\t<Cross1Icon />\n\t\t\t\t</DialogPrimitive.Close>\n\t\t\t</DialogPrimitive.Content>\n\t\t</DialogPrimitive.Portal>\n\t);\n};\n\nexport const Dialog = DialogPrimitive.Root;\nexport const DialogTrigger = DialogPrimitive.Trigger;',
        },
      ],
    },
  ],
  accessibility:
    "Adheres to the [Dialog WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal).",
  keyboard: [
    {
      keys: ["Space"],
      description: "Opens/closes the dialog.",
    },
    {
      keys: ["Enter"],
      description: "Opens/closes the dialog.",
    },
    {
      keys: ["Tab"],
      description: "Moves focus to the next focusable element.",
    },
    {
      keys: ["Shift + Tab"],
      description: "Moves focus to the previous focusable element.",
    },
    {
      keys: ["Esc"],
      description: "Closes the dialog and moves focus to `Dialog.Trigger`.",
    },
  ],
  notes: "",
};
