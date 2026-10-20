import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "progress",
  title: "Progress",
  metaDescription:
    "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/patterns/meter",
  description:
    "Displays an indicator showing the completion progress of a task, typically\n\tdisplayed as a progress bar.",
  features: ["Provides context for assistive technology to read the progress of a task."],
  anatomyIntro: "",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: "",
  },
  parts: [
    {
      name: "Root",
      description: "Contains all of the progress parts.",
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
          name: "value",
          type: "number | null",
          description: "The progress value.",
        },
        {
          name: "max",
          type: "number",
          description: "The maximum progress value.",
        },
        {
          name: "getValueLabel",
          type: "(value: number, max: number) => string",
          typeSimple: "function",
          description:
            "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as the numeric value as a percentage of the max value.",
        },
      ],
      dataAttributes: [
        {
          attribute: "[data-state]",
          values: ["complete", "indeterminate", "loading"],
        },
        {
          attribute: "[data-value]",
          values: ["The current value"],
        },
        {
          attribute: "[data-max]",
          values: ["The max value"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Indicator",
      description:
        "Used to show the progress visually. It also makes progress accessible to assistive technologies.",
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
          values: ["complete", "indeterminate", "loading"],
        },
        {
          attribute: "[data-value]",
          values: ["The current value"],
        },
        {
          attribute: "[data-max]",
          values: ["The max value"],
        },
      ],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility:
    "Adheres to the [`progressbar` role requirements](https://www.w3.org/WAI/ARIA/apg/patterns/meter).",
  keyboard: [],
  notes: "",
};
