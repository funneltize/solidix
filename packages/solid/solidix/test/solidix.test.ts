import { describe, expect, it } from "vitest";
import * as Solidix from "../src/index";

const NAMESPACES = [
  "Accordion",
  "AlertDialog",
  "AspectRatio",
  "Avatar",
  "Backend",
  "Calendar",
  "Charts",
  "Checkbox",
  "Collapsible",
  "Combobox",
  "ContextMenu",
  "Dialog",
  "DropdownMenu",
  "Form",
  "Frosted",
  "Funnel",
  "HoverCard",
  "Label",
  "Menubar",
  "NavigationMenu",
  "OneTimePasswordField",
  "PasswordToggleField",
  "Popover",
  "Progress",
  "RadioGroup",
  "ScrollArea",
  "Select",
  "Sortable",
  "Separator",
  "Slider",
  "Switch",
  "Tabs",
  "Toast",
  "Toggle",
  "ToggleGroup",
  "Toolbar",
  "Tooltip",
];

describe("solidix meta-package", () => {
  it("re-exports every primitive namespace", () => {
    expect(Object.keys(Solidix).sort()).toEqual([...NAMESPACES].sort());
  });

  it("exposes a Root component in every namespace", () => {
    for (const name of NAMESPACES) {
      const namespace = Solidix[name as keyof typeof Solidix] as Record<string, unknown>;
      expect(namespace.Root, name).toBeDefined();
    }
  });
});
