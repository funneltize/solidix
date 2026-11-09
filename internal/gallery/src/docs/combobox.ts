import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "combobox",
  title: "Combobox",
  metaDescription:
    "A text input with a filterable listbox popup, following the WAI combobox pattern.",
  ariaLink: "",
  description: "A text input with a filterable listbox popup, following the WAI combobox pattern.",
  features: ["Full keyboard navigation.", "Can be controlled or uncontrolled."],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Combobox } from "@solidix/solidix";\n\nexport default () => (\n  <Combobox.Combobox>\n    <Combobox.ComboboxInput />\n    <Combobox.ComboboxListbox>\n      <Combobox.ComboboxOption value="a">Apple</Combobox.ComboboxOption>\n    </Combobox.ComboboxListbox>\n  </Combobox.Combobox>\n);',
  },
  parts: [
    {
      name: "Combobox",
      description: "Root: owns open, input, selection, and highlight state.",
      props: [
        {
          name: "value",
          type: "string",
          description: "Selected option value (controlled).",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Fires when a selection is made.",
        },
        {
          name: "inputValue",
          type: "string",
          description: "Input text (controlled); filtering is the consumer's job.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ComboboxOption",
      description: "One option in the listbox.",
      props: [
        {
          name: "value",
          type: "string",
          description: "Value reported on selection.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility: "",
  keyboard: [
    {
      keys: ["ArrowDown", "ArrowUp"],
      description: "Move the highlight.",
    },
    {
      keys: ["Enter"],
      description: "Select the highlighted option.",
    },
    {
      keys: ["Escape"],
      description: "Close the popup.",
    },
  ],
  notes: "",
};
