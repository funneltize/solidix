import { describe, expect, it } from "vitest";
import * as Solidix from "../src/index";

const NAMESPACES = [
  "Accordion",
  "AlertDialog",
  "AspectRatio",
  "Avatar",
  "Checkbox",
  "Collapsible",
  "ContextMenu",
  "Dialog",
  "DropdownMenu",
  "Form",
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
