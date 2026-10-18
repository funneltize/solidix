import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "one-time-password-field",
  "title": "One-Time Password Field",
  "metaDescription": "A group of single-character text inputs to handle one-time password verification",
  "ariaLink": "",
  "description": "A group of single-character text inputs to handle one-time password\n\tverification.",
  "features": [
    "Keyboard navigation mimicking the behavior of a single input field",
    "Overriding values on paste",
    "Password manager autofill support",
    "Input validation for numeric and alphanumeric values",
    "Auto-submit on completion",
    "Hidden input to provide a single value to form data"
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { OneTimePasswordField } from \"solidix\";\n\nexport default () => (\n\t<OneTimePasswordField.Root>\n\t\t{/* one Input for each character of the value */}\n\t\t<OneTimePasswordField.Input />\n\t\t{/* single HiddenInput to store the full value */}\n\t\t<OneTimePasswordField.HiddenInput />\n\t</OneTimePasswordField.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a one-time password field.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "autoComplete",
          "required": false,
          "type": "\"off\" | \"one-time-code\"",
          "typeSimple": "enum",
          "default": "one-time-code",
          "description": "Specifies what - if any - permission the user agent has to provide automated assistance in filling out form field values, as well as guidance to the browser as to the type of information expected in the field."
        },
        {
          "name": "autoFocus",
          "required": false,
          "type": "boolean",
          "description": "Whether or not the first fillable input should be focused on page-load."
        },
        {
          "name": "value",
          "required": false,
          "type": "string",
          "description": "The controlled value of the field. Must be used in conjunction with `onValueChange`."
        },
        {
          "name": "defaultValue",
          "required": false,
          "type": "string",
          "description": "The value of the field when initially rendered. Use when you do not need to control the state of the field."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "Event handler called when the value of the field changes."
        },
        {
          "name": "autoSubmit",
          "required": false,
          "default": "false",
          "type": "boolean",
          "description": "Whether the component should attempt to automatically submit when all fields are filled. If the field is associated with an HTML `form` element, the form's `requestSubmit` method will be called."
        },
        {
          "name": "onAutoSubmit",
          "required": false,
          "type": "(value: string) => void",
          "typeSimple": "function",
          "description": "When the `autoSubmit` prop is set to `true`, this callback will be fired before attempting to submit the associated form. It will be called whether or not a form is located, or if submission is not allowed. No-op when `autoSubmit` is set to `false`."
        },
        {
          "name": "disabled",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Whether or not the the field's input elements are disabled."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "default": "\"ltr\"",
          "description": "The reading direction of the field when applicable. If omitted, assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "orientation",
          "required": false,
          "type": "\"horizontal\" | \"vertical\"",
          "typeSimple": "enum",
          "default": "\"vertical\"",
          "description": "The vertical orientation of the input elements."
        },
        {
          "name": "form",
          "required": false,
          "type": "string",
          "description": "A string specifying the `form` element with which the input is associated. This string's value, if present, must match the ID of a `form` element in the same document."
        },
        {
          "name": "name",
          "required": false,
          "type": "string",
          "description": "A string specifying a name for the input control. This name is submitted along with the control's value when the form data is submitted."
        },
        {
          "name": "placeholder",
          "required": false,
          "type": "string",
          "description": "Defines the text displayed in a form control when the control has no value. Split into single-character placeholders for each Input rendered."
        },
        {
          "name": "readOnly",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Whether or not the input elements can be updated by the user."
        },
        {
          "name": "sanitizeValue",
          "required": false,
          "type": "(value: string) => string",
          "typeSimple": "function",
          "description": "Function for custom sanitization when `validationType` is set to `\"none\"`. This function will be called before updating values in response to user interactions."
        },
        {
          "name": "type",
          "required": false,
          "type": "\"text\" | \"password\"",
          "typeSimple": "enum",
          "default": "\"text\"",
          "description": "The input type of the field's input elements."
        },
        {
          "name": "validationType",
          "required": false,
          "type": "\"none\" | \"numeric\" | \"alpha\" | \"alphanumeric\"",
          "typeSimple": "enum",
          "default": "\"numeric\"",
          "description": "Specifies the type of input validation to be used."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Input",
      "description": "Renders a text input representing a single character in the value.",
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
          "attribute": "[data-index]",
          "values": [
            "The index corresponding with the index of the character relative to the root field value"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "HiddenInput",
      "description": "",
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
      "title": "Basic usage",
      "description": "",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// This will render a field with 6 inputs, for use with\n// 6-character passwords. Render an Input component for\n// each character of accepted password's length.\n<OneTimePasswordField.Root>\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.HiddenInput />\n</OneTimePasswordField.Root>"
        }
      ]
    },
    {
      "title": "Segmented controls",
      "description": "The `Root` component accepts arbitrary children, so rendering a visually segmented list is as simple as rendering separators between inputs. We recommend hiding decorative elements from assistive tech with `aria-hidden` and avoid rendering other meaningful content within `Root` since each child element is expected to belong to the parent with the `group` role.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            3,
            5,
            7
          ],
          "code": "<OneTimePasswordField.Root>\n\t<OneTimePasswordField.Input />\n\t<Separator.Root aria-hidden />\n\t<OneTimePasswordField.Input />\n\t<Separator.Root aria-hidden />\n\t<OneTimePasswordField.Input />\n\t<Separator.Root aria-hidden />\n\t<OneTimePasswordField.Input />\n\t<OneTimePasswordField.HiddenInput />\n</OneTimePasswordField.Root>"
        }
      ]
    },
    {
      "title": "Auto-submit form when password is entered",
      "description": "Use the `autoSubmit` prop to submit an associated form when all inputs are filled.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "function Verify({ validCode }) {\n\tconst PASSWORD_LENGTH = 6;\n\tfunction handleSubmit(event) {\n\t\tevent.preventDefault();\n\t\tconst formData = event.formData;\n\t\tif (formData.get(\"otp\") === validCode) {\n\t\t\tredirect(\"/authenticated\");\n\t\t} else {\n\t\t\twindow.alert(\"Invalid code\");\n\t\t}\n\t}\n\treturn (\n\t\t<form onSubmit={handleSubmit}>\n\t\t\t<OneTimePasswordField.Root name=\"otp\" autoSubmit>\n\t\t\t\t{PASSWORD_LENGTH.map((_, i) => (\n\t\t\t\t\t<OneTimePasswordField.Input key={i} />\n\t\t\t\t))}\n\t\t\t\t{/* HiddenInput is required for the form to have data associated with the field */}\n\t\t\t\t<OneTimePasswordField.HiddenInput />\n\t\t\t</OneTimePasswordField.Root>\n\t\t\t<button>Submit</button>\n\t\t</form>\n\t);\n}"
        }
      ]
    },
    {
      "title": "Controlled value",
      "description": "",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { For, createSignal } from \"solid-js\";\n\nfunction Verify({ validCode }) {\n\tconst [value, setValue] = createSignal(\"\");\n\tconst PASSWORD_LENGTH = 6;\n\tfunction handleSubmit() {\n\t\tif (value() === validCode) {\n\t\t\tredirect(\"/authenticated\");\n\t\t} else {\n\t\t\twindow.alert(\"Invalid code\");\n\t\t}\n\t}\n\treturn (\n\t\t<OneTimePasswordField.Root\n\t\t\tautoSubmit\n\t\t\tvalue={value()}\n\t\t\tonAutoSubmit={handleSubmit}\n\t\t\t\tonValueChange={setValue}\n\t\t>\n\t\t\t<For each={Array.from({ length: PASSWORD_LENGTH })}>\n\t\t\t\t{() => <OneTimePasswordField.Input />}\n\t\t\t</For>\n\t\t</OneTimePasswordField.Root>\n\t);\n}"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "At the time of writing, there is no singular established pattern in WCAG guidelines for implementing one-time password fields as separate inputs. The behavior aims to get as close as possible to having the field act as a single input, with a few exceptions to match user expectations based on our initial research, testing, and gathering feedback.\n\nThis component is implemented as `input` elements within a container with a role of `group` to indicate that child inputs are related. Inputs can be navigated and focused using direction keys, and typing input will move focus to the next input until the last input is reached.\n\nPasting a value into the field will replace the contents of all inputs, regardless of the currently focused input. Based on our research this seems to align with most user expectations, where values are often pasted from password-managers or an email.",
  "keyboard": [
    {
      "keys": [
        "Enter"
      ],
      "description": "Attempts to submit an associated `form` if one is found"
    },
    {
      "keys": [
        "Tab"
      ],
      "description": "Moves focus to the next focusable element outside of the `Root`"
    },
    {
      "keys": [
        "Shift + Tab"
      ],
      "description": "Moves focus to the previous focusable element outside of the `Root`"
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "Moves focus to the next `Input` when `orientation` is `vertical`."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "Moves focus to the previous `Input` when `orientation` is `vertical`."
    },
    {
      "keys": [
        "ArrowRight"
      ],
      "description": "Moves focus to the next `Input` when `orientation` is `horizontal`."
    },
    {
      "keys": [
        "ArrowLeft"
      ],
      "description": "Moves focus to the previous `Input` when `orientation` is `horizontal`."
    },
    {
      "keys": [
        "Home"
      ],
      "description": "Moves focus to the first `Input`."
    },
    {
      "keys": [
        "End"
      ],
      "description": "Moves focus to the last `Input`."
    },
    {
      "keys": [
        "Delete"
      ],
      "description": "Removes the character in the currently focused `Input` and shifts later values back"
    },
    {
      "keys": [
        "Backspace"
      ],
      "description": "Removes the character in the currently focused `Input` and moves focus to the previous `Input`"
    },
    {
      "keys": [
        "Command + Backspace"
      ],
      "description": "Clears the value of all `Input` elements"
    }
  ],
  "notes": ""
};
