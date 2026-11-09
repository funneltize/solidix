import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "sortable",
  title: "Sortable",
  metaDescription:
    "A sortable list with a keyboard pickup, move, drop, and cancel model plus pointer drag.",
  ariaLink: "",
  description:
    "A sortable list with a keyboard pickup, move, drop, and cancel model plus pointer drag.",
  features: ["Full keyboard navigation.", "Can be controlled or uncontrolled."],
  anatomyIntro: "Import the component.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Sortable } from "@solidix/solidix";\n\nexport default () => (\n  <Sortable.Sortable items={["a", "b"]} onOrderChange={setItems}>\n    <Sortable.SortableItem itemId="a">\n      <Sortable.SortableHandle />\n      <span>A</span>\n    </Sortable.SortableItem>\n  </Sortable.Sortable>\n);',
  },
  parts: [
    {
      name: "Sortable",
      description: "Root: order is consumer state, reported through onOrderChange.",
      props: [
        {
          name: "items",
          type: "string[]",
          description: "Item ids in display order.",
        },
        {
          name: "onOrderChange",
          type: "(items: string[]) => void",
          description: "Fires with the full new order after every move.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SortableHandle",
      description: "The drag handle inside an item.",
      props: [
        {
          name: "aria-label",
          type: "string",
          description: "Accessible name for the handle.",
          default: "Reorder item",
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
      keys: ["Space", "Enter"],
      description: "Pick up or drop the item.",
    },
    {
      keys: ["Arrow keys"],
      description: "Move while picked up.",
    },
    {
      keys: ["Escape"],
      description: "Cancel and restore the order.",
    },
  ],
  notes: "",
};
