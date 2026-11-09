import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "calendar",
  title: "Calendar",
  metaDescription:
    "A month grid calendar with single or range selection and full keyboard navigation.",
  ariaLink: "",
  description: "A month grid calendar with single or range selection and full keyboard navigation.",
  features: ["Full keyboard navigation.", "Can be controlled or uncontrolled."],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Calendar } from "@solidix/solidix";\n\nexport default () => <Calendar.Calendar defaultValue="2026-03-04" />;',
  },
  parts: [
    {
      name: "Calendar",
      description: "The month grid.",
      props: [
        {
          name: "value",
          type: "string",
          description: "Selected day (controlled), as an ISO day string.",
        },
        {
          name: "defaultValue",
          type: "string",
          description: "Initially selected day.",
        },
        {
          name: "onValueChange",
          type: "(day: string) => void",
          description: "Fires with the chosen day.",
        },
        {
          name: "mode",
          type: "'single' | 'range'",
          description: "Selection mode.",
          default: "single",
        },
        {
          name: "min",
          type: "string",
          description: "Earliest selectable day.",
        },
        {
          name: "max",
          type: "string",
          description: "Latest selectable day.",
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
      keys: ["Arrow keys"],
      description: "Move by day or week.",
    },
    {
      keys: ["PageUp", "PageDown"],
      description: "Move by month (with Shift, by year).",
    },
    {
      keys: ["Enter", "Space"],
      description: "Select the focused day.",
    },
  ],
  notes: "",
};
