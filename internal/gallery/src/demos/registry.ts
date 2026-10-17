import type { Component } from "solid-js";
import AccordionDemo from "./accordion";
import AccordionDemoCode from "./accordion?raw";
import AccordionCss from "./accordion.css?url";
import AlertDialogDemo from "./alert-dialog";
import AlertDialogDemoCode from "./alert-dialog?raw";
import AlertDialogCss from "./alert-dialog.css?url";
import AnnounceDemo from "./announce";
import AnnounceDemoCode from "./announce?raw";
import AnnounceCss from "./announce.css?url";
import AspectRatioDemo from "./aspect-ratio";
import AspectRatioDemoCode from "./aspect-ratio?raw";
import AspectRatioCss from "./aspect-ratio.css?url";
import AvatarDemo from "./avatar";
import AvatarDemoCode from "./avatar?raw";
import AvatarCss from "./avatar.css?url";
import CheckboxDemo from "./checkbox";
import CheckboxDemoCode from "./checkbox?raw";
import CheckboxCss from "./checkbox.css?url";
import CollapsibleDemo from "./collapsible";
import CollapsibleDemoCode from "./collapsible?raw";
import CollapsibleCss from "./collapsible.css?url";
import ContextMenuDemo from "./context-menu";
import ContextMenuDemoCode from "./context-menu?raw";
import ContextMenuCss from "./context-menu.css?url";
import DialogDemo from "./dialog";
import DialogDemoCode from "./dialog?raw";
import DialogCss from "./dialog.css?url";
import DropdownMenuDemo from "./dropdown-menu";
import DropdownMenuDemoCode from "./dropdown-menu?raw";
import DropdownMenuCss from "./dropdown-menu.css?url";
import FormDemo from "./form";
import FormDemoCode from "./form?raw";
import FormCss from "./form.css?url";
import HoverCardDemo from "./hover-card";
import HoverCardDemoCode from "./hover-card?raw";
import HoverCardCss from "./hover-card.css?url";
import LabelDemo from "./label";
import LabelDemoCode from "./label?raw";
import LabelCss from "./label.css?url";
import MenubarDemo from "./menubar";
import MenubarDemoCode from "./menubar?raw";
import MenubarCss from "./menubar.css?url";
import NavigationMenuDemo from "./navigation-menu";
import NavigationMenuDemoCode from "./navigation-menu?raw";
import NavigationMenuCss from "./navigation-menu.css?url";
import OneTimePasswordFieldDemo from "./one-time-password-field";
import OneTimePasswordFieldDemoCode from "./one-time-password-field?raw";
import OneTimePasswordFieldCss from "./one-time-password-field.css?url";
import PasswordToggleFieldDemo from "./password-toggle-field";
import PasswordToggleFieldDemoCode from "./password-toggle-field?raw";
import PasswordToggleFieldCss from "./password-toggle-field.css?url";
import PopoverDemo from "./popover";
import PopoverDemoCode from "./popover?raw";
import PopoverCss from "./popover.css?url";
import ProgressDemo from "./progress";
import ProgressDemoCode from "./progress?raw";
import ProgressCss from "./progress.css?url";
import RadioGroupDemo from "./radio-group";
import RadioGroupDemoCode from "./radio-group?raw";
import RadioGroupCss from "./radio-group.css?url";
import ScrollAreaDemo from "./scroll-area";
import ScrollAreaDemoCode from "./scroll-area?raw";
import ScrollAreaCss from "./scroll-area.css?url";
import SelectDemo from "./select";
import SelectDemoCode from "./select?raw";
import SelectCss from "./select.css?url";
import SeparatorDemo from "./separator";
import SeparatorDemoCode from "./separator?raw";
import SeparatorCss from "./separator.css?url";
import SliderDemo from "./slider";
import SliderDemoCode from "./slider?raw";
import SliderCss from "./slider.css?url";
import SwitchDemo from "./switch";
import SwitchDemoCode from "./switch?raw";
import SwitchCss from "./switch.css?url";
import TabsDemo from "./tabs";
import TabsDemoCode from "./tabs?raw";
import TabsCss from "./tabs.css?url";
import ToastDemo from "./toast";
import ToastDemoCode from "./toast?raw";
import ToastCss from "./toast.css?url";
import ToggleDemo from "./toggle";
import ToggleDemoCode from "./toggle?raw";
import ToggleCss from "./toggle.css?url";
import ToggleGroupDemo from "./toggle-group";
import ToggleGroupDemoCode from "./toggle-group?raw";
import ToggleGroupCss from "./toggle-group.css?url";
import ToolbarDemo from "./toolbar";
import ToolbarDemoCode from "./toolbar?raw";
import ToolbarCss from "./toolbar.css?url";
import TooltipDemo from "./tooltip";
import TooltipDemoCode from "./tooltip?raw";
import TooltipCss from "./tooltip.css?url";

export type DemoEntry = {
  slug: string;
  title: string;
  component: Component;
  /** Stylesheet URL for the current demo only (see App: one demo stylesheet at a time). */
  css: string;
  /** Demo source for the Code tab. */
  code: string;
  /** Stage that grows to contain overlays opening downward inside it. */
  stage?: "tall" | undefined;
};

export const demos: DemoEntry[] = [
  { slug: "accordion", title: "Accordion", component: AccordionDemo, css: AccordionCss, code: AccordionDemoCode },
  { slug: "alert-dialog", title: "Alert Dialog", component: AlertDialogDemo, css: AlertDialogCss, code: AlertDialogDemoCode },
  { slug: "announce", title: "Announce", component: AnnounceDemo, css: AnnounceCss, code: AnnounceDemoCode },
  { slug: "aspect-ratio", title: "Aspect Ratio", component: AspectRatioDemo, css: AspectRatioCss, code: AspectRatioDemoCode },
  { slug: "avatar", title: "Avatar", component: AvatarDemo, css: AvatarCss, code: AvatarDemoCode },
  { slug: "checkbox", title: "Checkbox", component: CheckboxDemo, css: CheckboxCss, code: CheckboxDemoCode },
  { slug: "collapsible", title: "Collapsible", component: CollapsibleDemo, css: CollapsibleCss, code: CollapsibleDemoCode },
  {
    slug: "context-menu",
    title: "Context Menu",
    component: ContextMenuDemo,
    css: ContextMenuCss,
    code: ContextMenuDemoCode,
  },
  { slug: "dialog", title: "Dialog", component: DialogDemo, css: DialogCss, code: DialogDemoCode },
  {
    slug: "dropdown-menu",
    title: "Dropdown Menu",
    component: DropdownMenuDemo,
    css: DropdownMenuCss,
    code: DropdownMenuDemoCode,
  },
  { slug: "form", title: "Form", component: FormDemo, css: FormCss, code: FormDemoCode },
  { slug: "hover-card", title: "Hover Card", component: HoverCardDemo, css: HoverCardCss, code: HoverCardDemoCode },
  { slug: "label", title: "Label", component: LabelDemo, css: LabelCss, code: LabelDemoCode },
  { slug: "menubar", title: "Menubar", component: MenubarDemo, css: MenubarCss, code: MenubarDemoCode },
  {
    slug: "navigation-menu",
    title: "Navigation Menu",
    component: NavigationMenuDemo,
    css: NavigationMenuCss,
    code: NavigationMenuDemoCode,
    stage: "tall",
  },
  {
    slug: "one-time-password-field",
    title: "One-Time Password Field",
    component: OneTimePasswordFieldDemo,
    css: OneTimePasswordFieldCss,
  code: OneTimePasswordFieldDemoCode },
  {
    slug: "password-toggle-field",
    title: "Password Toggle Field",
    component: PasswordToggleFieldDemo,
    css: PasswordToggleFieldCss,
  code: PasswordToggleFieldDemoCode },
  { slug: "popover", title: "Popover", component: PopoverDemo, css: PopoverCss, code: PopoverDemoCode },
  { slug: "progress", title: "Progress", component: ProgressDemo, css: ProgressCss, code: ProgressDemoCode },
  { slug: "radio-group", title: "Radio Group", component: RadioGroupDemo, css: RadioGroupCss, code: RadioGroupDemoCode },
  { slug: "scroll-area", title: "Scroll Area", component: ScrollAreaDemo, css: ScrollAreaCss, code: ScrollAreaDemoCode },
  { slug: "select", title: "Select", component: SelectDemo, css: SelectCss, code: SelectDemoCode },
  { slug: "separator", title: "Separator", component: SeparatorDemo, css: SeparatorCss, code: SeparatorDemoCode },
  { slug: "slider", title: "Slider", component: SliderDemo, css: SliderCss, code: SliderDemoCode },
  { slug: "switch", title: "Switch", component: SwitchDemo, css: SwitchCss, code: SwitchDemoCode },
  { slug: "tabs", title: "Tabs", component: TabsDemo, css: TabsCss, code: TabsDemoCode },
  { slug: "toast", title: "Toast", component: ToastDemo, css: ToastCss, code: ToastDemoCode },
  { slug: "toggle", title: "Toggle", component: ToggleDemo, css: ToggleCss, code: ToggleDemoCode },
  { slug: "toggle-group", title: "Toggle Group", component: ToggleGroupDemo, css: ToggleGroupCss, code: ToggleGroupDemoCode },
  { slug: "toolbar", title: "Toolbar", component: ToolbarDemo, css: ToolbarCss, code: ToolbarDemoCode },
  { slug: "tooltip", title: "Tooltip", component: TooltipDemo, css: TooltipCss, code: TooltipDemoCode },
];
