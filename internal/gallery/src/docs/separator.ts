import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "separator",
  "title": "Separator",
  "metaDescription": "Visually or semantically separates content.",
  "ariaLink": "https://www.w3.org/TR/wai-aria-1.2/#separator",
  "description": "Visually or semantically separates content.",
  "features": [
    "Supports horizontal and vertical orientations."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Separator } from \"solidix\";\n\nexport default () => <Separator.Root />;"
  },
  "parts": [
    {
      "name": "Root",
      "description": "The separator.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "orientation",
          "type": "\"horizontal\" | \"vertical\"",
          "typeSimple": "enum",
          "default": "\"horizontal\"",
          "description": "The orientation of the separator."
        },
        {
          "name": "decorative",
          "type": "boolean",
          "description": "When `true`, signifies that it is purely visual, carries no semantic meaning, and ensures it is not present in the accessibility tree."
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
    }
  ],
  "examples": [],
  "customApis": [],
  "accessibility": "Adheres to the [`separator` role requirements](https://www.w3.org/TR/wai-aria-1.2/#separator).",
  "keyboard": [],
  "notes": ""
};
