import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "checkbox",
  title: "Checkbox",
  metaDescription: "A control that allows the user to toggle between checked and not checked.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/checkbox",
  description: "A control that allows the user to toggle between checked and not checked.",
  features: [
    "Supports indeterminate state.",
    "Full keyboard navigation.",
    "Can be controlled or uncontrolled.",
  ],
  anatomyIntro: "Import all parts and piece them together.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Checkbox } from "solidix";\n\nexport default () => (\n\t<Checkbox.Root>\n\t\t<Checkbox.Indicator />\n\t</Checkbox.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description:
        "Contains all the parts of a checkbox. An `input` will also render when used within a `form` to ensure events propagate correctly.",
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
          name: "defaultChecked",
          type: "boolean | 'indeterminate'",
          description:
            "The checked state of the checkbox when it is initially rendered. Use when you do not need to control its checked state.",
        },
        {
          name: "checked",
          type: "boolean | 'indeterminate'",
          description:
            "The controlled checked state of the checkbox. Must be used in conjunction with `onCheckedChange`.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean | 'indeterminate') => void",
          typeSimple: "function",
          description: "Event handler called when the checked state of the checkbox changes.",
        },
        {
          name: "disabled",
          type: "boolean",
          description: "When `true`, prevents the user from interacting with the checkbox.",
        },
        {
          name: "required",
          type: "boolean",
          description:
            "When `true`, indicates that the user must check the checkbox before the owning form can be submitted.",
        },
        {
          name: "name",
          type: "string",
          description:
            "The name of the checkbox. Submitted with its owning form as part of a name/value pair.",
        },
        {
          name: "value",
          type: "string",
          default: "on",
          description: "The value given as data when submitted with a `name`.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["checked", "unchecked", "indeterminate"],
        },
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Indicator",
      description:
        "Renders when the checkbox is in a checked or indeterminate state. You can style this element directly, or you can use it as a wrapper to put an icon into, or both.",
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
        {
          attribute: "[data-disabled]",
          values: ["Present when disabled"],
        },
      ],
      cssVariables: [],
    },
  ],
  examples: [
    {
      title: "Indeterminate",
      description: "You can set the checkbox to `indeterminate` by taking control of its state.",
      blocks: [
        {
          lang: "jsx",
          highlights: [5, 9, 10, 11, 12, 13, 14, 16],
          code: 'import { DividerHorizontalIcon, CheckIcon } from "@radix-ui/react-icons";\nimport { Checkbox } from "solidix";\n\nexport default () => {\n\tconst [checked, setChecked] = createSignal("indeterminate");\n\n\treturn (\n\t\t<>\n\t\t\t<StyledCheckbox checked={checked()} onCheckedChange={setChecked}>\n\t\t\t\t<Checkbox.Indicator>\n\t\t\t\t\t{checked() === "indeterminate" && <DividerHorizontalIcon />}\n\t\t\t\t\t{checked() === true && <CheckIcon />}\n\t\t\t\t</Checkbox.Indicator>\n\t\t\t</StyledCheckbox>\n\n\t\t\t<button\n\t\t\t\ttype="button"\n\t\t\t\tonClick={() =>\n\t\t\t\t\tsetChecked((prevIsChecked) =>\n\t\t\t\t\t\tprevIsChecked === "indeterminate" ? false : "indeterminate",\n\t\t\t\t\t)\n\t\t\t\t}\n\t\t\t>\n\t\t\t\tToggle indeterminate\n\t\t\t</button>\n\t\t</>\n\t);\n};',
        },
      ],
    },
    {
      title: "Decoupling the hidden input",
      description:
        "By default, `Checkbox.Root` renders a visually hidden `input` for form submission. To recompose, move, or exclude that input, you can build the checkbox from its lower-level parts instead.\n\n> **Important:** These parts are unstable and prefixed with `unstable_`, so their API may change in a future release.\n\n- `Checkbox.unstable_Provider` provides the checkbox state and accepts the form-related props (`name`, `value`, `checked`, `defaultChecked`, `required`, `disabled`, `onCheckedChange`).\n- `Checkbox.unstable_Trigger` is the interactive button that wraps `Checkbox.Indicator`.\n- `Checkbox.unstable_BubbleInput` is the visually hidden input that `Checkbox.Root` renders by default. Omit it when you don't need form submission.",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: 'import { Checkbox } from "solidix";\n\nexport default () => (\n\t<Checkbox.Provider name="terms">\n\t\t<Checkbox.Trigger>\n\t\t\t<Checkbox.Indicator />\n\t\t</Checkbox.Trigger>\n\t\t<Checkbox.BubbleInput />\n\t</Checkbox.Provider>\n);',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Adheres to the [tri-state Checkbox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox).",
  keyboard: [
    {
      keys: ["Space"],
      description: "Checks/unchecks the checkbox.",
    },
  ],
  notes: "",
};
