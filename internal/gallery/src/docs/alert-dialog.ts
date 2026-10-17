import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "alert-dialog",
  "title": "Alert Dialog",
  "metaDescription": "A modal dialog that interrupts the user with important content and expects a response.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog",
  "description": "A modal dialog that interrupts the user with important content and expects a\n\tresponse.",
  "features": [
    "Focus is automatically trapped.",
    "Can be controlled or uncontrolled.",
    "Manages screen reader announcements with `Title` and `Description` components.",
    "Esc closes the component automatically."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { AlertDialog } from \"soldix\";\n\nexport default () => (\n\t<AlertDialog.Root>\n\t\t<AlertDialog.Trigger />\n\t\t<AlertDialog.Portal>\n\t\t\t<AlertDialog.Overlay />\n\t\t\t<AlertDialog.Content>\n\t\t\t\t<AlertDialog.Title />\n\t\t\t\t<AlertDialog.Description />\n\t\t\t\t<AlertDialog.Cancel />\n\t\t\t\t<AlertDialog.Action />\n\t\t\t</AlertDialog.Content>\n\t\t</AlertDialog.Portal>\n\t</AlertDialog.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of an alert dialog.",
      "props": [
        {
          "name": "defaultOpen",
          "type": "boolean",
          "description": "The open state of the dialog when it is initially rendered. Use when you do not need to control its open state."
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "The controlled open state of the dialog. Must be used in conjunction with `onOpenChange`."
        },
        {
          "name": "onOpenChange",
          "type": "(open: boolean) => void",
          "typeSimple": "function",
          "description": "Event handler called when the open state of the dialog changes."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Trigger",
      "description": "A button that opens the dialog.",
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
      "description": "When used, portals your overlay and content parts into the `body`.",
      "props": [
        {
          "name": "forceMount",
          "type": "boolean",
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. If used on this part, it will be inherited by `AlertDialog.Overlay` and `AlertDialog.Content`."
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
      "name": "Overlay",
      "description": "A layer that covers the inert portion of the view when the dialog is open.",
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `AlertDialog.Portal`."
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
      "name": "Content",
      "description": "Contains content to be rendered when the dialog is open.",
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
          "description": "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. It inherits from `AlertDialog.Portal`."
        },
        {
          "name": "onOpenAutoFocus",
          "type": "(event: Event) => void",
          "typeSimple": "function",
          "description": "Event handler called when focus moves to the destructive action after opening. It can be prevented by calling `event.preventDefault`."
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
      "name": "Cancel",
      "description": "A button that closes the dialog. This button should be distinguished visually from `AlertDialog.Action` buttons.",
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
      "name": "Action",
      "description": "A button that closes the dialog. These buttons should be distinguished visually from the `AlertDialog.Cancel` button.",
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
      "name": "Title",
      "description": "An accessible name to be announced when the dialog is opened. Alternatively, you can provide `aria-label` or `aria-labelledby` to `AlertDialog.Content` and exclude this component.",
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
      "name": "Description",
      "description": "An accessible description to be announced when the dialog is opened. Alternatively, you can provide `aria-describedby` to `AlertDialog.Content` and exclude this component.",
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
      "title": "Close after asynchronous form submission",
      "description": "Use the controlled props to programmatically close the Alert Dialog after an async operation has completed.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4,
            7,
            10,
            15,
            17
          ],
          "code": "import { AlertDialog } from \"soldix\";\n\nconst wait = () => new Promise((resolve) => setTimeout(resolve, 1000));\n\nexport default () => {\n\tconst [open, setOpen] = createSignal(false);\n\n\treturn (\n\t\t<AlertDialog.Root open={open()} onOpenChange={setOpen}>\n\t\t\t<AlertDialog.Trigger>Open</AlertDialog.Trigger>\n\t\t\t<AlertDialog.Portal>\n\t\t\t\t<AlertDialog.Overlay />\n\t\t\t\t<AlertDialog.Content>\n\t\t\t\t\t<form\n\t\t\t\t\t\tonSubmit={(event) => {\n\t\t\t\t\t\t\twait().then(() => setOpen(false));\n\t\t\t\t\t\t\tevent.preventDefault();\n\t\t\t\t\t\t}}\n\t\t\t\t\t>\n\t\t\t\t\t\t{/* some inputs */}\n\t\t\t\t\t\t<button type=\"submit\">Submit</button>\n\t\t\t\t\t</form>\n\t\t\t\t</AlertDialog.Content>\n\t\t\t</AlertDialog.Portal>\n\t\t</AlertDialog.Root>\n\t);\n};"
        }
      ]
    },
    {
      "title": "Custom portal container",
      "description": "Customise the element that your alert dialog portals into.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            2,
            13
          ],
          "code": "export default () => {\n\tconst [container, setContainer] = createSignal(null);\n\treturn (\n\t\t<div>\n\t\t\t<AlertDialog.Root>\n\t\t\t\t<AlertDialog.Trigger />\n\t\t\t\t<AlertDialog.Portal container={container()}>\n\t\t\t\t\t<AlertDialog.Overlay />\n\t\t\t\t\t<AlertDialog.Content>...</AlertDialog.Content>\n\t\t\t\t</AlertDialog.Portal>\n\t\t\t</AlertDialog.Root>\n\n\t\t\t<div ref={setContainer} />\n\t\t</div>\n\t);\n};"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "Adheres to the [Alert and Message Dialogs WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog).",
  "keyboard": [
    {
      "keys": [
        "Space"
      ],
      "description": "Opens/closes the dialog."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "Opens/closes the dialog."
    },
    {
      "keys": [
        "Tab"
      ],
      "description": "Moves focus to the next focusable element."
    },
    {
      "keys": [
        "Shift + Tab"
      ],
      "description": "Moves focus to the previous focusable element."
    },
    {
      "keys": [
        "Esc"
      ],
      "description": "Closes the dialog and moves focus to `AlertDialog.Trigger`."
    }
  ],
  "notes": ""
};
