import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "toast",
  "title": "Toast",
  "metaDescription": "A succinct message that is displayed temporarily.",
  "ariaLink": "https://www.w3.org/TR/wai-aria/#aria-live",
  "description": "A succinct message that is displayed temporarily.",
  "features": [
    "Automatically closes.",
    "Pauses closing on hover, focus and window blur.",
    "Supports hotkey to jump to toast viewport.",
    "Supports closing via swipe gesture.",
    "Exposes CSS variables for swipe gesture animations.",
    "Can be controlled or uncontrolled."
  ],
  "anatomyIntro": "Import the component.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Toast } from \"solidix\";\n\nexport default () => (\n\t<Toast.Provider>\n\t\t<Toast.Root>\n\t\t\t<Toast.Title />\n\t\t\t<Toast.Description />\n\t\t\t<Toast.Action />\n\t\t\t<Toast.Close />\n\t\t</Toast.Root>\n\n\t\t<Toast.Viewport />\n\t</Toast.Provider>\n);"
  },
  "parts": [
    {
      "name": "Provider",
      "description": "The provider that wraps your toasts and toast viewport. It usually wraps the application.",
      "props": [
        {
          "name": "duration",
          "type": "number",
          "default": 5000,
          "description": "The time in milliseconds that should elapse before automatically closing each toast."
        },
        {
          "name": "label",
          "required": true,
          "type": "string",
          "default": "\"Notification\"",
          "description": "An author-localized label for each toast. Used to help screen reader users associate the interruption with a toast."
        },
        {
          "name": "swipeDirection",
          "type": "\"right\" | \"left\" | \"up\" | \"down\"",
          "typeSimple": "enum",
          "default": "\"right\"",
          "description": "The direction of the pointer swipe that should close the toast."
        },
        {
          "name": "swipeThreshold",
          "type": "number",
          "default": 50,
          "description": "The distance in pixels that the swipe gesture must travel before a close is triggered."
        },
        {
          "name": "announcerContainer",
          "type": "Element | DocumentFragment",
          "typeSimple": "Element",
          "default": "document.body",
          "description": "An optional container where the toast announcements should be appended. This is useful when working with focus traps or modal dialogs that make other elements inert."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Viewport",
      "description": "The fixed area where toasts appear. Users can jump to the viewport by pressing a hotkey. It is up to you to ensure the discoverability of the hotkey for keyboard users.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "hotkey",
          "type": "string[]",
          "default": "[\"F8\"]",
          "description": "The keys to use as the keyboard shortcut that will move focus to the toast viewport. Use `event.code` value for each key from [keycode.info](https://keycode.info/) . For meta keys, use `ctrlKey`, `shiftKey`, `altKey` and/or `metaKey`."
        },
        {
          "name": "label",
          "type": "string",
          "default": "\"Notifications ({hotkey})\"",
          "description": "An author-localized label for the toast region to provide context for screen reader users when navigating page landmarks. The available `{hotkey}` placeholder will be replaced for you."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Root",
      "description": "The toast that automatically closes. It should not be held open to acquire a user response.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "type",
          "type": "\"foreground\" | \"background\"",
          "typeSimple": "enum",
          "default": "\"foreground\"",
          "description": "Control the sensitivity of the toast for accessibility purposes. For toasts that are the result of a user action, choose `foreground`. Toasts generated from background tasks should use `background`."
        },
        {
          "name": "duration",
          "type": "number",
          "description": "The time in milliseconds that should elapse before automatically closing the toast. This will override the value supplied to the provider."
        },
        {
          "name": "defaultOpen",
          "type": "boolean",
          "default": "true",
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
        },
        {
          "name": "onEscapeKeyDown",
          "type": "(event: KeyboardEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onPause",
          "type": "() => void",
          "typeSimple": "function",
          "description": "Event handler called when the dismiss timer is paused. This occurs when the pointer is moved over the viewport, the viewport is focused or when the window is blurred."
        },
        {
          "name": "onResume",
          "type": "() => void",
          "typeSimple": "function",
          "description": "Event handler called when the dismiss timer is resumed. This occurs when the pointer is moved away from the viewport, the viewport is blurred or when the window is focused."
        },
        {
          "name": "onSwipeStart",
          "type": "(event: SwipeEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when starting a swipe interaction. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onSwipeMove",
          "type": "(event: SwipeEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called during a swipe interaction. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onSwipeEnd",
          "type": "(event: SwipeEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called at the end of a swipe interaction. It can be prevented by calling `event.preventDefault`."
        },
        {
          "name": "onSwipeCancel",
          "type": "(event: SwipeEvent) => void",
          "typeSimple": "function",
          "description": "Event handler called when a swipe interaction is cancelled. It can be prevented by calling `event.preventDefault`."
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
            "open",
            "closed"
          ]
        },
        {
          "attribute": "[data-swipe]",
          "values": [
            "start",
            "move",
            "cancel",
            "end"
          ]
        },
        {
          "attribute": "[data-swipe-direction]",
          "values": [
            "up",
            "down",
            "left",
            "right"
          ]
        }
      ],
      "cssVariables": [
        {
          "cssVariable": "--radix-toast-swipe-move-x",
          "description": "The offset position of the toast when horizontally swiping"
        },
        {
          "cssVariable": "--radix-toast-swipe-move-y",
          "description": "The offset position of the toast when vertically swiping"
        },
        {
          "cssVariable": "--radix-toast-swipe-end-x",
          "description": "The offset end position of the toast after horizontally swiping"
        },
        {
          "cssVariable": "--radix-toast-swipe-end-y",
          "description": "The offset end position of the toast after vertically swiping"
        }
      ]
    },
    {
      "name": "Title",
      "description": "An optional title for the toast.",
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
      "description": "The toast message.",
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
      "description": "An action that is safe to ignore to ensure users are not expected to complete tasks with unexpected side effects as a result of a [time limit](https://www.w3.org/TR/UNDERSTANDING-WCAG20/time-limits-required-behaviors.html).\n\nWhen obtaining a user response is necessary, portal an `AlertDialog` styled as a toast into the viewport instead.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "altText",
          "required": true,
          "type": "string",
          "description": "Describe an alternative way to achieve the action for screen reader users who cannot access the toast easily."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Close",
      "description": "A button that allows users to dismiss the toast before its duration has elapsed.",
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
      "title": "Custom hotkey",
      "description": "Override the default hotkey using the `event.code` value for each key from [keycode.info](https://keycode.info/).",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            3
          ],
          "code": "<Toast.Provider>\n\t{/* ... */}\n\t<Toast.Viewport hotkey={[\"altKey\", \"KeyT\"]} />\n</Toast.Provider>"
        }
      ]
    },
    {
      "title": "Custom duration",
      "description": "Customise the duration of a toast to override the provider value.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1
          ],
          "code": "<Toast.Root duration={3000}>\n\t<Toast.Description>Saved!</Toast.Description>\n</Toast.Root>"
        }
      ]
    },
    {
      "title": "Duplicate toasts",
      "description": "When a toast must appear every time a user clicks a button, use state to render multiple instances of the same toast (see below). Alternatively, you can abstract the parts to create your own imperative API.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6,
            11,
            12,
            13,
            14,
            15
          ],
          "code": "import { For, createSignal } from \"solid-js\";\n\nexport default () => {\n\tconst [savedCount, setSavedCount] = createSignal(0);\n\n\treturn (\n\t\t<div>\n\t\t\t<form onSubmit={() => setSavedCount((count) => count + 1)}>\n\t\t\t\t{/* ... */}\n\t\t\t\t<button>save</button>\n\t\t\t</form>\n\n\t\t\t<For each={Array.from({ length: savedCount() })}>\n\t\t\t\t{() => (\n\t\t\t\t\t<Toast.Root>\n\t\t\t\t\t\t<Toast.Description>Saved!</Toast.Description>\n\t\t\t\t\t</Toast.Root>\n\t\t\t\t)}\n\t\t\t</For>\n\t\t</div>\n\t);\n};"
        }
      ]
    },
    {
      "title": "Animating swipe gesture",
      "description": "Combine `--radix-toast-swipe-move-[x|y]` and `--radix-toast-swipe-end-[x|y]` CSS variables with `data-swipe=\"[start|move|cancel|end]\"` attributes to animate a swipe to close gesture. Here's an example:",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6,
            7
          ],
          "code": "// index.jsx\nimport { Toast } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Toast.Provider swipeDirection=\"right\">\n\t\t<Toast.Root className=\"ToastRoot\">...</Toast.Root>\n\t\t<Toast.Viewport />\n\t</Toast.Provider>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            2,
            3,
            5,
            9,
            15
          ],
          "code": "/* styles.css */\n.ToastRoot[data-swipe=\"move\"] {\n\ttransform: translateX(var(--radix-toast-swipe-move-x));\n}\n.ToastRoot[data-swipe=\"cancel\"] {\n\ttransform: translateX(0);\n\ttransition: transform 200ms ease-out;\n}\n.ToastRoot[data-swipe=\"end\"] {\n\tanimation: slideRight 100ms ease-out;\n}\n\n@keyframes slideRight {\n\tfrom {\n\t\ttransform: translateX(var(--radix-toast-swipe-end-x));\n\t}\n\tto {\n\t\ttransform: translateX(100%);\n\t}\n}"
        }
      ]
    }
  ],
  "customApis": [
    {
      "title": "Abstract parts",
      "description": "Create your own API by abstracting the primitive parts into your own component.\n\n#### Usage\n\n\n\n#### Implementation",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { Toast } from \"./your-toast\";\n\nexport default () => (\n\t<Toast title=\"Upgrade available\" content=\"We've just released Radix 3.0!\">\n\t\t<button onClick={handleUpgrade}>Upgrade</button>\n\t</Toast>\n);"
        },
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// your-toast.jsx\nimport { Toast as ToastPrimitive } from \"solidix\";\n\nexport const Toast = ({ title, content, children, ...props }) => {\n\treturn (\n\t\t<ToastPrimitive.Root {...props}>\n\t\t\t{title && <ToastPrimitive.Title>{title}</ToastPrimitive.Title>}\n\t\t\t<ToastPrimitive.Description>{content}</ToastPrimitive.Description>\n\t\t\t{children && (\n\t\t\t\t<ToastPrimitive.Action asChild>{children}</ToastPrimitive.Action>\n\t\t\t)}\n\t\t\t<ToastPrimitive.Close aria-label=\"Close\">\n\t\t\t\t<span aria-hidden>×</span>\n\t\t\t</ToastPrimitive.Close>\n\t\t</ToastPrimitive.Root>\n\t);\n};"
        }
      ]
    },
    {
      "title": "Imperative API",
      "description": "Create your own imperative API to allow toast duplication if preferred.\n\n#### Usage\n\n\n\n#### Implementation",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { Toast } from \"./your-toast\";\n\nexport default () => {\n\tlet toastRef;\n\treturn (\n\t\t<div>\n\t\t\t<form onSubmit={() => toastRef?.publish()}>\n\t\t\t\t{/* ... */}\n\t\t\t\t<button>Save</button>\n\t\t\t</form>\n\t\t\t<Toast ref={(handle) => (toastRef = handle)}>Saved successfully!</Toast>\n\t\t</div>\n\t);\n};"
        },
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// your-toast.jsx\nimport { For, createSignal, omit } from \"solid-js\";\nimport { Toast as ToastPrimitive } from \"solidix\";\n\nexport const Toast = (props) => {\n\tconst rest = omit(props, \"children\", \"ref\");\n\tconst [count, setCount] = createSignal(0);\n\n\t// Expose an imperative handle through the ref callback.\n\tprops.ref?.({ publish: () => setCount((count) => count + 1) });\n\n\treturn (\n\t\t<For each={Array.from({ length: count() })}>\n\t\t\t{() => (\n\t\t\t\t<ToastPrimitive.Root {...rest}>\n\t\t\t\t\t<ToastPrimitive.Description>{props.children}</ToastPrimitive.Description>\n\t\t\t\t\t<ToastPrimitive.Close>Dismiss</ToastPrimitive.Close>\n\t\t\t\t</ToastPrimitive.Root>\n\t\t\t\t)}\n\t\t\t</For>\n\t);\n};"
        }
      ]
    }
  ],
  "accessibility": "Adheres to the [`aria-live` requirements](https://www.w3.org/TR/wai-aria/#aria-live).",
  "keyboard": [
    {
      "keys": [
        "F8"
      ],
      "description": "Focuses toasts viewport."
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
        "Space"
      ],
      "description": "When focus is on a `Toast.Action` or `Toast.Close`, closes the toast."
    },
    {
      "keys": [
        "Enter"
      ],
      "description": "When focus is on a `Toast.Action` or `Toast.Close`, closes the toast."
    },
    {
      "keys": [
        "Esc"
      ],
      "description": "When focus is on a `Toast`, closes the toast."
    }
  ],
  "notes": ""
};
