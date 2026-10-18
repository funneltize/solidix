import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "avatar",
  "title": "Avatar",
  "metaDescription": "An image element with a fallback for representing the user.",
  "ariaLink": "",
  "description": "An image element with a fallback for representing the user.",
  "features": [
    "Automatic and manual control over when the image renders.",
    "Fallback part accepts any children.",
    "Optionally delay fallback rendering to avoid content flashing."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Avatar } from \"solidix\";\n\nexport default () => (\n\t<Avatar.Root>\n\t\t<Avatar.Image />\n\t\t<Avatar.Fallback />\n\t</Avatar.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of an avatar.",
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
      "name": "Image",
      "description": "The image to render. By default it will only render when it has loaded. You can use the `onLoadingStatusChange` handler if you need more control.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "onLoadingStatusChange",
          "type": "(status: \"idle\" | \"loading\" | \"loaded\" | \"error\") => void",
          "typeSimple": "function",
          "description": "A callback providing information about the loading status of the image. This is useful in case you want to control more precisely what to render as the image is loading."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    },
    {
      "name": "Fallback",
      "description": "An element that renders when the image hasn't loaded. This means whilst it's loading, or if there was an error. If you notice a flash during loading, you can provide a `delayMs` prop to delay its rendering so it only renders for those with slower connections. For more control, use the `onLoadingStatusChange` handler on `Avatar.Image`.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "delayMs",
          "type": "number",
          "description": "Useful for delaying rendering so it only appears for those with slower connections."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    }
  ],
  "examples": [
    {
      "title": "Clickable Avatar with tooltip",
      "description": "You can compose the Avatar with a Tooltip to display extra information.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            1,
            4,
            5,
            7,
            9,
            10,
            11,
            12,
            13
          ],
          "code": "import { Avatar, Tooltip } from \"solidix\";\n\nexport default () => (\n\t<Tooltip.Root>\n\t\t<Tooltip.Trigger>\n\t\t\t<Avatar.Root>…</Avatar.Root>\n\t\t</Tooltip.Trigger>\n\n\t\t<Tooltip.Content side=\"top\">\n\t\t\tTooltip content\n\t\t\t<Tooltip.Arrow />\n\t\t</Tooltip.Content>\n\t</Tooltip.Root>\n);"
        }
      ]
    }
  ],
  "customApis": [],
  "accessibility": "",
  "keyboard": [],
  "notes": ""
};
