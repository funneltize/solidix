import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "password-toggle-field",
  title: "Password Toggle Field",
  metaDescription:
    "A password input field with an integrated button to toggle the value's visibility",
  ariaLink: "",
  description:
    "A password input field with an integrated button to toggle the value's\n\tvisibility.",
  features: [
    "Returns focus to the input when toggling with a pointer",
    "Maintains button focus when toggling with keyboard or virtual navigation",
    "Resets visibility to hidden after form submission to prevent accidental storage",
    "Implicit accessible labeling for icon-based toggle buttons",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { PasswordToggleField } from "@solidix/solidix";\nexport default () => (\n\t<PasswordToggleField.Root>\n\t\t<PasswordToggleField.Input />\n\t\t<PasswordToggleField.Toggle>\n\t\t\t<PasswordToggleField.Icon\n\t\t\t\tvisible={<span aria-hidden="true">Hide</span>}\n\t\t\t\thidden={<span aria-hidden="true">Show</span>}\n\t\t\t/>\n\t\t</PasswordToggleField.Toggle>\n\t</PasswordToggleField.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Contains all the parts of a password toggle field.",
      props: [
        {
          name: "id",
          required: false,
          type: "string",
          description:
            "The ID of the field. This ID is used as a basis for nested DOM element IDs used for accessibility attributes.",
        },
        {
          name: "visible",
          required: false,
          type: "boolean",
          description:
            "The controlled visibility state of the field. Must be used in conjunction with `onVisiblityChange`.",
        },
        {
          name: "defaultVisible",
          required: false,
          type: "boolean",
          description:
            "The visibility state of the field when initially rendered. Use when you do not need to control the visibility state.",
        },
        {
          name: "onVisiblityChange",
          required: false,
          type: "(visible: boolean) => void",
          typeSimple: "function",
          description: "Event handler called when the field's visibility state changes.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Input",
      description: "Renders a the input containing the password value.",
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
          name: "autoComplete",
          required: false,
          type: '"current-password" | "new-password" | "off"',
          typeSimple: "enum",
          default: '"current-password"',
          description:
            "Specifies what - if any - permission the user agent has to provide automated assistance in filling out form field values, as well as guidance to the browser as to the type of information expected in the field.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Toggle",
      description: "",
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
      name: "Slot",
      description: "",
      props: [
        {
          name: "render",
          required: false,
          type: "(args: { visible: boolean }) => JSX.Element",
          typeSimple: "function",
          description:
            "A function that returns JSX to render. Can be used for more control over rendering.",
        },
        {
          name: "visible",
          required: false,
          type: "JSX.Element",
          description: "The content to render when the field's visibility state is visible.",
        },
        {
          name: "hidden",
          required: false,
          type: "JSX.Element",
          description: "The content to render when the field's visibility state is hidden.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Icon",
      description: "",
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
          name: "visible",
          required: true,
          type: "JSX.Element",
          description: "The icon to render when the field's visibility state is visible.",
        },
        {
          name: "hidden",
          required: true,
          type: "JSX.Element",
          description: "The icon to render when the field's visibility state is hidden.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [
    {
      title: "Basic usage",
      description: "",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: '<PasswordToggleField.Root>\n\t<PasswordToggleField.Input />\n\t<PasswordToggleField.Toggle>\n\t\t<PasswordToggleField.Icon\n\t\t\tvisible={<span aria-hidden="true">Hide</span>}\n\t\t\thidden={<span aria-hidden="true">Show</span>}\n\t\t/>\n\t</PasswordToggleField.Toggle>\n</PasswordToggleField.Root>',
        },
      ],
    },
    {
      title: "With `Slot`",
      description: "",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: '<PasswordToggleField.Root>\n\t<PasswordToggleField.Input />\n\t<PasswordToggleField.Toggle>\n\t\t<PasswordToggleField.Slot visible="🙊" hidden="🙈" />\n\t</PasswordToggleField.Toggle>\n</PasswordToggleField.Root>',
        },
      ],
    },
    {
      title: "With `Slot` + `render` prop",
      description: "",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: '<PasswordToggleField.Root>\n\t<PasswordToggleField.Input />\n\t<PasswordToggleField.Toggle>\n\t\t<PasswordToggleField.Slot\n\t\t\trender={({ visible }) => (\n\t\t\t\t<svg aria-hidden="true" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t<path d={visible ? "M1 1 L2 2" : "M2 1 L1 2"} />\n\t\t\t\t</svg>\n\t\t\t)}\n\t\t/>\n\t</PasswordToggleField.Toggle>\n</PasswordToggleField.Root>',
        },
      ],
    },
  ],
  customApis: [],
  accessibility: "",
  keyboard: [],
  notes: "",
};
