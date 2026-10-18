import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "form",
  "title": "Form",
  "metaDescription": "Collect information from your users using validation rules.",
  "ariaLink": "",
  "description": "Collect information from your users using validation rules.",
  "features": [
    " ",
    "https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation",
    "Supports built-in validation.",
    "Supports custom validation.",
    "Full customization of validation messages.",
    "Accessible validation messages.",
    "Supports client-side and server-side scenarios.",
    "Focus is fully managed."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Form } from \"solidix\";\n\nexport default () => (\n\t<Form.Root>\n\t\t<Form.Field>\n\t\t\t<Form.Label />\n\t\t\t<Form.Control />\n\t\t\t<Form.Message />\n\t\t\t<Form.ValidityState />\n\t\t</Form.Field>\n\n\t\t<Form.Message />\n\t\t<Form.ValidityState />\n\n\t\t<Form.Submit />\n\t</Form.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a form.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "onClearServerErrors",
          "required": false,
          "type": "() => void",
          "typeSimple": "function",
          "description": "Event handler called when the form is submitted or reset and the server errors need to be cleared."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Field",
      "description": "The wrapper for a field. It handles id/name and label accessibility automatically.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "name",
          "required": true,
          "type": "string",
          "description": "The name of the field that will be passed down to the control and used to match with validation messages."
        },
        {
          "name": "serverInvalid",
          "required": false,
          "type": "boolean",
          "description": "Use this prop to mark the field as invalid on the server."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-invalid]",
          "values": [
            "Present when the field is invalid"
          ]
        },
        {
          "attribute": "[data-valid]",
          "values": [
            "Present when the field is valid"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Label",
      "description": "A label element which is automatically wired when nested inside a `Field` part.",
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
          "attribute": "[data-invalid]",
          "values": [
            "Present when the field is invalid"
          ]
        },
        {
          "attribute": "[data-valid]",
          "values": [
            "Present when the field is valid"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Control",
      "description": "A control element (by default an `input`) which is automatically wired when nested inside a `Field` part.",
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
          "attribute": "[data-invalid]",
          "values": [
            "Present when the field is invalid"
          ]
        },
        {
          "attribute": "[data-valid]",
          "values": [
            "Present when the field is valid"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Message",
      "description": "A validation message which is automatically wired (functionality and accessibility) to a given control when nested inside a `Field` part. It can be used for built-in and custom client-side validation, as well as server-side validation. When used outside a `Field` you must pass a `name` prop matching a field.\n\n`Form.Message` accepts a `match` prop which is used to determine when the message should show. It matches the native HTML validity state (`ValidityState` on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)) which validates against attributes such as `required`, `min`, `max`. The message will show if the given `match` is `true` on the control’s validity state.\n\nYou can also pass a function to `match` to provide custom validation rules.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "match",
          "required": false,
          "type": "| 'badInput' | 'patternMismatch' | 'rangeOverflow' | 'rangeUnderflow' | 'stepMismatch' | 'tooLong' | 'tooShort' | 'typeMismatch' | 'valid' | 'valueMissing' | ((value: string, formData: FormData) => boolean) | ((value: string, formData: FormData) => Promise )",
          "typeSimple": "Matcher",
          "description": "Used to indicate on which condition the message should be visible."
        },
        {
          "name": "forceMatch",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Forces the message to be shown. This is useful when using server-side validation."
        },
        {
          "name": "name",
          "required": false,
          "type": "string",
          "description": "Used to target a specific field by name when rendering outside of a `Field` part."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "ValidityState",
      "description": "Use this render-prop component to access a given field’s validity state in render (see `ValidityState` on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)). A field's validity is available automatically when nested inside a `Field` part, otherwise you must pass a `name` prop to associate it.",
      "props": [
        {
          "name": "children",
          "required": false,
          "type": "(validity: ValidityState | undefined) => JSX.Element",
          "typeSimple": "function",
          "description": "A render function that receives the validity state of the field."
        },
        {
          "name": "name",
          "required": false,
          "type": "string",
          "description": "Used to target a specific field by name when rendering outside of a `Field` part."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Submit",
      "description": "The submit button.",
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
      "title": "Composing with your own components",
      "description": "Using `asChild` you can compose the `Form` primitive parts with your own components.\n\n\n\nIt can also be used to compose other types of controls, such as a `select`:\n\n\n\n> Note: At the moment, it is not possible to compose `Form` with Radix's other form primitives such as `Checkbox`, `Select`, etc. We are working on a solution for this.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            3
          ],
          "code": "<Form.Field name=\"name\">\n\t<Form.Label>Full name</Form.Label>\n\t<Form.Control asChild>\n\t\t<TextField.Input variant=\"primary\" />\n\t</Form.Control>\n</Form.Field>"
        },
        {
          "lang": "jsx",
          "highlights": [
            3
          ],
          "code": "<Form.Field name=\"country\">\n\t<Form.Label>Country</Form.Label>\n\t<Form.Control asChild>\n\t\t<select>\n\t\t\t<option value=\"uk\">United Kingdom</option>…\n\t\t</select>\n\t</Form.Control>\n</Form.Field>"
        }
      ]
    },
    {
      "title": "Providing your own validation messages",
      "description": "When no `children` are provided, `Form.Message` will render a default error message for the given `match`.\n\n\n\nYou can provide a more meaningful message by passing your own `children`. This is also useful for internationalization.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// will yield \"This value is missing\"\n<Form.Message match=\"valueMissing\" />"
        },
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// will yield \"Please provide a name\"\n<Form.Message match=\"valueMissing\">Please provide a name</Form.Message>"
        }
      ]
    },
    {
      "title": "Custom validation",
      "description": "On top of all the built-in client-side validation matches described above you can also provide your own custom validation whilst still making use of the platform's validation abilities. It uses the `customError` type present in the [constraint validition API](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation).\n\nYou can pass your own validation function into the `match` prop on `Form.Message`. Here's an example:\n\n\n\n> `match` will be called with the current value of the control as first argument and the entire `FormData` as second argument.\n> `match` can also be an `async` function (or return a promise) to perform async validation.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4
          ],
          "code": "<Form.Field name=\"name\">\n\t<Form.Label>Full name</Form.Label>\n\t<Form.Control />\n\t<Form.Message match={(value, formData) => value !== \"John\"}>\n\t\tOnly John is allowed.\n\t</Form.Message>\n</Form.Field>"
        }
      ]
    },
    {
      "title": "Styling based on validity",
      "description": "We add `data-valid` and `data-invalid` attributes to the relevant parts. Use it to style your components accordingly.\nHere is an example styling the `Label` part.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            8
          ],
          "code": "//index.jsx\nimport { Form } from \"solidix\";\n\nexport default () => (\n\t<Form.Root>\n\t\t<Form.Field name=\"email\">\n\t\t\t<Form.Label className=\"FormLabel\">Email</Form.Label>\n\t\t\t<Form.Control type=\"email\" />\n\t\t</Form.Field>\n\t</Form.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            2,
            5
          ],
          "code": "/* styles.css */\n.FormLabel[data-invalid] {\n\tcolor: red;\n}\n.FormLabel[data-valid] {\n\tcolor: green;\n}"
        }
      ]
    },
    {
      "title": "Accessing the validity state for more control",
      "description": "You may need to access the raw validity state of a field in order to display your own icons, or interface with a component library via it's defined props. You can do this by using the `Form.ValidityState` part:",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            3,
            4,
            7,
            8
          ],
          "code": "<Form.Field name=\"name\">\n\t<Form.Label>Full name</Form.Label>\n\t<Form.ValidityState>\n\t\t{(validity) => (\n\t\t\t<Form.Control asChild>\n\t\t\t\t<TextField.Input\n\t\t\t\t\tvariant=\"primary\"\n\t\t\t\t\tstate={getTextFieldInputState(validity)}\n\t\t\t\t/>\n\t\t\t</Form.Control>\n\t\t)}\n\t</Form.ValidityState>\n</Form.Field>"
        }
      ]
    },
    {
      "title": "Server-side validation",
      "description": "The component also supports server-side validation using the same `Form.Message` component.\nYou can re-use the same messages you defined for client-side errors by passing a `forceMatch` prop which will force the message to show regardless of the client-side matching logic.\n\nIf the message doesn't exist on the client-side, you can render a `Form.Message` without a `match` too.\nThe field is marked as invalid by passing a `serverInvalid` boolean prop to the `Form.Field` part.\n\nHere's an example with server-side error handling:\n\n\n\nYou should clear the server errors using the `onClearServerErrors` callback prop on the `Form.Root` part. It will clear the server errors before the form is re-submitted, and when the form is reset.\n\nIn addition, this provides control over when to reset single server errors. For example you could reset the email server error as soon as the user edits it:",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            5,
            6,
            7,
            8,
            13,
            23,
            28,
            29,
            30,
            49,
            50,
            51,
            52,
            53,
            54
          ],
          "code": "import { Form } from \"solidix\";\n\nfunction Page() {\n\tconst [serverErrors, setServerErrors] = createSignal({\n\t\temail: false,\n\t\tpassword: false,\n\t});\n\n\treturn (\n\t\t<Form.Root\n\t\t\t// `onSubmit` only triggered if it passes client-side validation\n\t\t\tonSubmit={(event) => {\n\t\t\t\tconst data = Object.fromEntries(new FormData(event.currentTarget));\n\n\t\t\t\t// Submit form data and catch errors in the response\n\t\t\t\tsubmitForm(data)\n\t\t\t\t\t.then(() => {})\n\t\t\t\t\t/**\n\t\t\t\t\t * Map errors from your server response into a structure you'd like to work with.\n\t\t\t\t\t * In this case resulting in this object: `{ email: false, password: true }`\n\t\t\t\t\t */\n\t\t\t\t\t.catch((errors) => setServerErrors(mapServerErrors(errors)));\n\n\t\t\t\t// prevent default form submission\n\t\t\t\tevent.preventDefault();\n\t\t\t}}\n\t\t\tonClearServerErrors={() =>\n\t\t\t\tsetServerErrors({ email: false, password: false })\n\t\t\t}\n\t\t>\n\t\t\t<Form.Field name=\"email\" serverInvalid={serverErrors().email}>\n\t\t\t\t<Form.Label>Email address</Form.Label>\n\t\t\t\t<Form.Control type=\"email\" required />\n\t\t\t\t<Form.Message match=\"valueMissing\">\n\t\t\t\t\tPlease enter your email.\n\t\t\t\t</Form.Message>\n\t\t\t\t<Form.Message match=\"typeMismatch\" forceMatch={serverErrors().email}>\n\t\t\t\t\tPlease provide a valid email.\n\t\t\t\t</Form.Message>\n\t\t\t</Form.Field>\n\n\t\t\t<Form.Field name=\"password\" serverInvalid={serverErrors().password}>\n\t\t\t\t<Form.Label>Password</Form.Label>\n\t\t\t\t<Form.Control type=\"password\" required />\n\t\t\t\t<Form.Message match=\"valueMissing\">\n\t\t\t\t\tPlease enter a password.\n\t\t\t\t</Form.Message>\n\t\t\t\t{serverErrors().password && (\n\t\t\t\t\t<Form.Message>\n\t\t\t\t\t\tPlease provide a valid password. It should contain at least 1 number\n\t\t\t\t\t\tand 1 special character.\n\t\t\t\t\t</Form.Message>\n\t\t\t\t)}\n\t\t\t</Form.Field>\n\n\t\t\t<Form.Submit>Submit</Form.Submit>\n\t\t</Form.Root>\n\t);\n}"
        },
        {
          "lang": "jsx",
          "highlights": [
            3
          ],
          "code": "import { createSignal } from \"solid-js\";\n\n<Form.Field name=\"email\" serverInvalid={serverErrors().email}>\n\t<Form.Label>Email address</Form.Label>\n\t<Form.Control\n\t\ttype=\"email\"\n\t\tonChange={() => setServerErrors((prev) => ({ ...prev, email: false }))}\n\t/>\n\t<Form.Message match=\"valueMissing\">Please enter your email.</Form.Message>\n\t<Form.Message match=\"typeMismatch\" forceMatch={serverErrors().email}>\n\t\tPlease provide a valid email.\n\t</Form.Message>\n</Form.Field>"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "The component follows the \"inline errors\" pattern for validation:\n\n- Label and control are associated using the `name` provided on `Form.Field`\n- When one or more client-side error messages display, they are automatically associated with their matching control and announced accordingly\n- Focus is moved to the first invalid control",
  "keyboard": [],
  "notes": ""
};
