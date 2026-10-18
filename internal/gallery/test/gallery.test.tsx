import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AccordionDemo from "../src/demos/accordion";
import AlertDialogDemo from "../src/demos/alert-dialog";
import AnnounceDemo from "../src/demos/announce";
import AspectRatioDemo from "../src/demos/aspect-ratio";
import AvatarDemo from "../src/demos/avatar";
import CheckboxDemo from "../src/demos/checkbox";
import CollapsibleDemo from "../src/demos/collapsible";
import ContextMenuDemo from "../src/demos/context-menu";
import DialogDemo from "../src/demos/dialog";
import DropdownMenuDemo from "../src/demos/dropdown-menu";
import FormDemo from "../src/demos/form";
import HoverCardDemo from "../src/demos/hover-card";
import LabelDemo from "../src/demos/label";
import MenubarDemo from "../src/demos/menubar";
import MotionDemo from "../src/demos/motion";
import NavigationMenuDemo from "../src/demos/navigation-menu";
import OneTimePasswordFieldDemo from "../src/demos/one-time-password-field";
import PasswordToggleFieldDemo from "../src/demos/password-toggle-field";
import PopoverDemo from "../src/demos/popover";
import ProgressDemo from "../src/demos/progress";
import RadioGroupDemo from "../src/demos/radio-group";
import ScrollAreaDemo from "../src/demos/scroll-area";
import SelectDemo from "../src/demos/select";
import SeparatorDemo from "../src/demos/separator";
import SliderDemo from "../src/demos/slider";
import SwitchDemo from "../src/demos/switch";
import TabsDemo from "../src/demos/tabs";
import ToastDemo from "../src/demos/toast";
import ToggleDemo from "../src/demos/toggle";
import ToggleGroupDemo from "../src/demos/toggle-group";
import ToolbarDemo from "../src/demos/toolbar";
import TooltipDemo from "../src/demos/tooltip";

describe("gallery demos", () => {
  test("accordion renders with the default item expanded", async () => {
    render(() => <AccordionDemo />);
    const trigger = await screen.findByRole("button", { name: /is it accessible\?/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(await screen.findByText("Yes. It adheres to the WAI-ARIA design pattern.")).not.toBe(
      null,
    );
  });

  test("alert-dialog opens from its trigger", async () => {
    render(() => <AlertDialogDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete account" }));
    expect(await screen.findByRole("alertdialog")).not.toBe(null);
  });

  test("announce creates its live region and mirrors updates", async () => {
    render(() => <AnnounceDemo />);
    await vi.waitFor(() => {
      expect(document.querySelector("[data-radix-announce-region-gallery-notifications]")).not.toBe(
        null,
      );
    });
    fireEvent.click(await screen.findByRole("button", { name: /notify/i }));
    await vi.waitFor(() => {
      expect(
        document.querySelector("[data-radix-announce-region-gallery-notifications]")?.textContent,
      ).toContain("1 notification");
    });
  });

  test("aspect-ratio renders its image", async () => {
    render(() => <AspectRatioDemo />);
    expect(await screen.findByAltText("Landscape photograph by Tobias Tullius")).not.toBe(null);
  });

  test("avatar falls back without a loadable image", async () => {
    render(() => <AvatarDemo />);
    expect(await screen.findByText("PD")).not.toBe(null);
  });

  test("checkbox starts checked", async () => {
    render(() => <CheckboxDemo />);
    expect((await screen.findByRole("checkbox")).getAttribute("aria-checked")).toBe("true");
  });

  test("collapsible reveals its content on trigger click", async () => {
    render(() => <CollapsibleDemo />);
    expect(screen.queryByText("@radix-ui/colors")).toBe(null);
    fireEvent.click((await screen.findAllByRole("button"))[0]!);
    expect(await screen.findByText("@radix-ui/colors")).not.toBe(null);
  });

  test("context-menu opens on right-click", async () => {
    render(() => <ContextMenuDemo />);
    fireEvent.contextMenu(await screen.findByText("Right-click here."));
    expect(await screen.findByRole("menu")).not.toBe(null);
  });

  test("dialog opens from its trigger", async () => {
    render(() => <DialogDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Edit profile" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).not.toBe(null);
    expect(screen.getByRole("heading", { name: "Edit profile" })).not.toBe(null);
  });

  test("dropdown-menu opens from its trigger", async () => {
    render(() => <DropdownMenuDemo />);
    fireEvent.pointerDown(await screen.findByRole("button", { name: "Customise options" }), {
      button: 0,
    });
    expect(await screen.findByRole("menu")).not.toBe(null);
  });

  test("form renders fields and submit", async () => {
    render(() => <FormDemo />);
    expect(await screen.findByText("Email")).not.toBe(null);
    expect(screen.getByText("Question")).not.toBe(null);
    expect(screen.getByRole("button", { name: "Post question" })).not.toBe(null);
  });

  test("hover-card renders its trigger", async () => {
    render(() => <HoverCardDemo />);
    expect(await screen.findByRole("link", { name: "solidix" })).not.toBe(null);
  });

  test("label associates with its input", async () => {
    render(() => <LabelDemo />);
    const input = (await screen.findByLabelText("First name")) as HTMLInputElement;
    expect(input.value).toBe("Pedro Duarte");
  });

  test("menubar renders its menus", async () => {
    render(() => <MenubarDemo />);
    expect(await screen.findByRole("menubar")).not.toBe(null);
    expect(screen.getByRole("menuitem", { name: "File" })).not.toBe(null);
  });

  test("motion switches spring presets and morphs tabs", async () => {
    const { container } = render(() => <MotionDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Bouncy" }));
    expect(await screen.findByText("Bouncy · 550ms")).not.toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Ping" }));
    await vi.waitFor(() => {
      expect(
        (container.querySelector(".MotionDot") as HTMLElement).style.transform,
      ).toContain("216");
    });
    // No startViewTransition in jsdom — the helper applies the update instantly.
    fireEvent.click(screen.getByRole("tab", { name: "Morphing" }));
    expect(await screen.findByText(/Shared view-transition names morph/)).not.toBe(null);
    expect(screen.getByRole("tab", { name: "Morphing" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  test("motion dismisses its swipe card", async () => {
    render(() => <MotionDemo />);
    const card = (await screen.findByText("Drag me left or right")).closest(
      ".MotionSwipeCard",
    ) as HTMLElement;
    const pointer = (type: string, clientX: number) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX });
      (event as unknown as { pointerId: number }).pointerId = 1;
      card.dispatchEvent(event);
    };
    // Zero layout in jsdom: the 24px threshold floor decides.
    pointer("pointerdown", 100);
    pointer("pointermove", 130);
    pointer("pointermove", 170);
    pointer("pointerup", 170);
    expect(await screen.findByText("Card dismissed.")).not.toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(await screen.findByText("Drag me left or right")).not.toBe(null);
  });

  test("motion dismisses its swipe card from the keyboard with focus recovery", async () => {
    render(() => <MotionDemo />);
    const dismiss = await screen.findByRole("button", { name: "Dismiss" });
    dismiss.focus();
    fireEvent.click(dismiss);
    expect(await screen.findByText("Card dismissed.")).not.toBe(null);
    // Focus rode along to Reset instead of being lost with the card.
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reset" }));
    });
  });

  test("navigation-menu renders triggers and links", async () => {
    render(() => <NavigationMenuDemo />);
    expect(await screen.findByRole("navigation")).not.toBe(null);
    expect(screen.getByRole("button", { name: /primitives/i })).not.toBe(null);
    expect(screen.getByRole("link", { name: "GitHub" })).not.toBe(null);
  });

  test("one-time-password-field renders six inputs plus a hidden input", async () => {
    const { container } = render(() => <OneTimePasswordFieldDemo />);
    await vi.waitFor(() => {
      expect(container.querySelectorAll("input").length).toBe(7);
    });
  });

  test("password-toggle-field toggles input type", async () => {
    const { container } = render(() => <PasswordToggleFieldDemo />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    await vi.waitFor(() => {
      expect((container.querySelector("input") as HTMLInputElement).type).toBe("text");
    });
  });

  test("popover opens from its trigger", async () => {
    render(() => <PopoverDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Update dimensions" }));
    expect(await screen.findByText("Dimensions")).not.toBe(null);
  });

  test("progress advances on its timer", async () => {
    render(() => <ProgressDemo />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("13");
    await vi.waitFor(() => {
      expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("66");
    });
  });

  test("radio-group starts on the default value", async () => {
    render(() => <RadioGroupDemo />);
    expect(await screen.findByRole("radiogroup")).not.toBe(null);
    expect((screen.getByRole("radio", { name: "Default" }) as HTMLInputElement).dataset.state).toBe(
      "checked",
    );
  });

  test("scroll-area renders its tag list", async () => {
    render(() => <ScrollAreaDemo />);
    expect(await screen.findByText("v1.2.0-beta.50")).not.toBe(null);
    expect(screen.getByText("v1.2.0-beta.1")).not.toBe(null);
  });

  test("select opens its listbox from the trigger", async () => {
    render(() => <SelectDemo />);
    fireEvent.click(await screen.findByRole("combobox"));
    expect(await screen.findByRole("listbox")).not.toBe(null);
  });

  test("separator renders between content", async () => {
    render(() => <SeparatorDemo />);
    expect(await screen.findByText("Blog")).not.toBe(null);
    expect(screen.getAllByRole("separator").length).toBeGreaterThanOrEqual(1);
  });

  test("slider renders its thumb", async () => {
    render(() => <SliderDemo />);
    expect(await screen.findByRole("slider", { name: "Volume" })).not.toBe(null);
  });

  test("switch toggles on click", async () => {
    render(() => <SwitchDemo />);
    const root = await screen.findByRole("switch");
    expect(root.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(root);
    await vi.waitFor(() => {
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    });
  });

  test("tabs switch content on trigger click", async () => {
    const user = userEvent.setup();
    render(() => <TabsDemo />);
    expect(await screen.findByRole("tab", { selected: true })).toHaveProperty(
      "textContent",
      "Account",
    );
    await user.click(screen.getByRole("tab", { name: "Password" }));
    expect(await screen.findByText(/change your password here/i)).not.toBe(null);
  });

  test("toast appears after the button timer", async () => {
    render(() => <ToastDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Add to calendar" }));
    expect(await screen.findByText("Scheduled: Catch up")).not.toBe(null);
  });

  test("toggle flips pressed state on click", async () => {
    render(() => <ToggleDemo />);
    const root = await screen.findByRole("button", { name: "Toggle italic" });
    expect(root.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(root);
    await vi.waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Toggle italic" }).getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });

  test("toggle-group starts on the default value", async () => {
    render(() => <ToggleGroupDemo />);
    // Single-select groups expose radio semantics (Radix parity).
    const items = await screen.findAllByRole("radio");
    expect(items.length).toBe(3);
    expect(items[1]!.getAttribute("aria-checked")).toBe("true");
  });

  test("toolbar renders its controls", async () => {
    render(() => <ToolbarDemo />);
    // Nested toggle groups are toolbars too — disambiguate by name.
    expect(await screen.findByRole("toolbar", { name: "Formatting options" })).not.toBe(null);
    expect(screen.getByRole("button", { name: "Bold" })).not.toBe(null);
    expect(screen.getByRole("link", { name: /edited 2 hours ago/i })).not.toBe(null);
  });

  test("tooltip opens on hover", async () => {
    const user = userEvent.setup();
    render(() => <TooltipDemo />);
    await user.hover(document.querySelector(".IconButton") as HTMLElement);
    expect(await screen.findByRole("tooltip", undefined, { timeout: 2500 })).not.toBe(null);
  });
});
