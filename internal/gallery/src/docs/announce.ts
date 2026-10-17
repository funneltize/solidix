import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "announce",
  "title": "Announce",
  "metaDescription": "Mirrors content into a shared ARIA live region for screen reader announcements.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/",
  "description": "Renders its children into a visually hidden mirror element while a shared live region announces content changes to assistive technologies.",
  "features": [
    "Shared live region per identifier — several announcers cooperate.",
    "Politeness, role, atomicity, and relevance are all configurable.",
    "Content is mirrored, so what sighted users read stays intact.",
    "No visual output; styling is never required."
  ],
  "anatomyIntro": "Import the part and render it with the content to announce.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Announce } from \"@soldix/announce\";\n\nexport default () => (\n\t<Announce regionIdentifier=\"notifications\" type=\"polite\">\n\t\tYou have 3 notifications.\n\t</Announce>\n);"
  },
  "parts": [
    {
      "name": "Announce",
      "description": "Mirrors children into the shared live region for its identifier.",
      "props": [
        {
          "name": "regionIdentifier",
          "type": "string",
          "description": "Optional unique identifier for the live region. Announcers sharing an identifier share one region element."
        },
        {
          "name": "type",
          "type": "\"polite\" | \"assertive\" | \"off\"",
          "default": "\"polite\"",
          "description": "Mirrors the `aria-live` attribute: the priority with which screen readers treat region updates."
        },
        {
          "name": "role",
          "type": "\"status\" | \"alert\" | \"log\" | \"none\"",
          "description": "Role of the live region. Defaults from `type` (`status` for polite, `alert` for assertive, `none` for off)."
        },
        {
          "name": "aria-atomic",
          "type": "boolean | \"true\" | \"false\"",
          "description": "Whether assistive technologies present all, or only parts, of the changed region."
        },
        {
          "name": "aria-relevant",
          "type": "AriaAttributes['aria-relevant']",
          "description": "Which changes to the region are relevant and should be announced. Omitted by default."
        },
        {
          "name": "children",
          "type": "JSX.Element",
          "required": true,
          "description": "Content to mirror into the live region."
        }
      ],
      "dataAttributes": [],
      "cssVariables": []
    }
  ],
  "examples": [],
  "customApis": [],
  "accessibility": "Announcements are exposed through a single shared live region, so rapid updates from several announcers queue politely instead of overlapping. Prefer `polite` for status updates and reserve `assertive` for urgent interruptions.",
  "keyboard": [],
  "notes": ""
};
