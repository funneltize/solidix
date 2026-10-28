import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "frosted",
  title: "Frosted",
  metaDescription:
    "Styled components ported from frosted-ui: theme plus type, layout, feedback, form-control, overlay, navigation, data, and complex compounds.",
  ariaLink: "",
  description:
    "A Solid port of frosted-ui: styled, themeable components (type, layout, feedback, form controls, overlays, navigation, data display, and complex compounds) that keep the upstream `fui-*` classes. Wrap the app in `Theme`, import the stylesheet once, and compose the components below.",
  features: [
    "Theme provider with accent color, gray color, radius, scaling, and appearance.",
    "Type scale shared across heading, text, code, and kbd components.",
    "Layout atoms (inset, separator) plus skeleton and spinner feedback states.",
    "Form controls (button, text field, checkbox, switch, slider, select, and more) wrapping the headless primitives.",
    "Overlays (dialog, popover, tooltip, menus, lightbox) with focus management and keyboard navigation.",
    "Navigation and data display (tabs, segmented controls, breadcrumbs, tables, avatars, progress, scroll containers) over the headless primitives.",
    "Complex compounds (credit card, bot avatar, widget stack, scroll gallery, charts, flags, filters) ported as custom logic where no headless base exists.",
    "Upstream `fui-*` classes preserved, scoped under the Theme root.",
  ],
  anatomyIntro: "Theme the tree, then compose components.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Frosted } from "@solidix/solidix";\nimport "@solidix/frosted/styles.css";\n\nexport default () => (\n\t<Frosted.Theme accentColor="indigo">\n\t\t<Frosted.Heading size="6">Hello</Frosted.Heading>\n\t\t<Frosted.Text size="3">Styled by fui-* classes.</Frosted.Text>\n\t</Frosted.Theme>\n);',
  },
  parts: [
    {
      name: "Theme",
      description:
        "Theme scope and token provider. Also exported as `Root` for the umbrella contract.",
      props: [
        {
          name: "accentColor",
          type: "string",
          default: '"indigo"',
          description: "Accent hue token used by themed components.",
        },
        {
          name: "appearance",
          type: '"light" | "dark" | "inherit"',
          default: '"inherit"',
          description: "Color scheme for the themed subtree.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Heading",
      description: "Renders an `h1` with the shared type scale.",
      props: [
        {
          name: "size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Type size step.",
        },
        {
          name: "weight",
          type: "string",
          description: "Font weight token.",
        },
        {
          name: "align",
          type: "string",
          description: "Text alignment token.",
        },
        {
          name: "color",
          type: "string",
          description: "Text color token.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Text",
      description: "Renders a `span` with the shared type scale.",
      props: [
        {
          name: "size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Type size step.",
        },
        {
          name: "weight",
          type: "string",
          description: "Font weight token.",
        },
        {
          name: "color",
          type: "string",
          description: "Text color token.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Link",
      description: "Renders an anchor with underline styling.",
      props: [
        {
          name: "underline",
          type: '"auto" | "hover" | "always"',
          description: "When the underline shows.",
        },
        {
          name: "color",
          type: "string",
          description: "Text color token.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Code",
      description: "Renders inline `code` with tone variants.",
      props: [
        {
          name: "size",
          type: '"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Type size step.",
        },
        {
          name: "variant",
          type: '"solid" | "soft" | "outline" | "ghost"',
          description: "Visual tone.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Blockquote",
      description: "Renders a styled `blockquote`.",
      props: [
        {
          name: "size",
          type: "string",
          description: "Type size step.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Kbd",
      description: "Renders a keyboard shortcut in `kbd`.",
      props: [
        {
          name: "size",
          type: '"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Type size step.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Em",
      description: "Renders an `em` with italic styling. No extra props.",
      props: [],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Quote",
      description: "Renders a `q` with quotation styling. No extra props.",
      props: [],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Inset",
      description: "Bleeds content to the padded edges of its container.",
      props: [
        {
          name: "side",
          type: '"all" | "x" | "y" | "top" | "bottom" | "left" | "right"',
          description: "Which edges bleed.",
        },
        {
          name: "clip",
          type: '"border-box" | "padding-box"',
          description: "Box the bleed clips to.",
        },
        {
          name: "p",
          type: '"current" | "0"',
          description: "Padding override.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Separator",
      description: "Thematic divider wrapping the headless separator primitive.",
      props: [
        {
          name: "size",
          type: '"1" | "2" | "3" | "4"',
          description: "Thickness step.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Divider direction.",
        },
        {
          name: "decorative",
          type: "boolean",
          description: "Hides the separator from assistive technology when true.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SkeletonAvatar",
      description: "Circular or square avatar placeholder.",
      props: [
        {
          name: "size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          default: '"3"',
          description: "Avatar size step.",
        },
        {
          name: "shape",
          type: '"circle" | "square"',
          default: '"circle"',
          description: "Avatar shape.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SkeletonText",
      description: "Text-line placeholder.",
      props: [
        {
          name: "size",
          type: "string",
          description: "Type size step matching the text it stands in for.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SkeletonRect",
      description: "Block placeholder with no size props.",
      props: [],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Spinner",
      description: "Loading indicator; with children it overlays the dimmed content.",
      props: [
        {
          name: "size",
          type: '"1" | "2" | "3" | "4" | "5" | "6"',
          description: "Spinner size step.",
        },
        {
          name: "loading",
          type: "boolean",
          description: "When false the children render bare with no spinner.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Button",
      description: "Themed button with size, variant, color, and loading state.",
      props: [
        { name: "size", type: '"1" | "2" | "3" | "4"', description: "Button size." },
        {
          name: "variant",
          type: '"solid" | "soft" | "outline" | "ghost"',
          description: "Button style.",
        },
        {
          name: "loading",
          type: "boolean",
          description: "Shows a spinner and disables the button.",
        },
        {
          name: "fullWidth",
          type: "boolean",
          description: "Stretches the button to its container.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "IconButton",
      description: "Square themed button for icon-only content.",
      props: [
        {
          name: "aria-label",
          type: "string",
          description: "Accessible name for the icon action.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "TextField",
      description: "Text input with themed shell, slots, and size variants.",
      props: [
        { name: "Root.size", type: '"1" | "2" | "3"', description: "Input size." },
        {
          name: "Input.placeholder",
          type: "string",
          description: "Placeholder text for the input.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "TextArea",
      description: "Themed multiline text input with size and resize controls.",
      props: [
        { name: "size", type: '"1" | "2" | "3"', description: "Text size." },
        {
          name: "resize",
          type: '"none" | "vertical" | "horizontal" | "both"',
          description: "Allowed resize directions.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "NumberField",
      description: "Numeric input with increment and decrement steppers.",
      props: [
        {
          name: "defaultValue",
          type: "number",
          description: "Uncontrolled initial value.",
        },
        { name: "min", type: "number", description: "Minimum allowed value." },
        { name: "max", type: "number", description: "Maximum allowed value." },
        { name: "step", type: "number", description: "Step size for the steppers." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Select",
      description: "Themed dropdown select over the headless select primitive.",
      props: [
        {
          name: "Trigger.placeholder",
          type: "string",
          description: "Text shown when nothing is selected.",
        },
        {
          name: "Item.value",
          type: "string",
          description: "Value submitted when the item is picked.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Checkbox",
      description: "Themed checkbox with indeterminate support.",
      props: [
        {
          name: "defaultChecked",
          type: "boolean",
          description: "Uncontrolled initial checked state.",
        },
        {
          name: "indeterminate",
          type: "boolean",
          description: "Forces the indeterminate visual.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "RadioGroup",
      description: "Themed radio group with orientation support.",
      props: [
        {
          name: "Root.defaultValue",
          type: "string",
          description: "Uncontrolled initial selection.",
        },
        {
          name: "Root.orientation",
          type: '"horizontal" | "vertical"',
          description: "Layout direction.",
        },
        {
          name: "Item.value",
          type: "string",
          description: "Value selected when the item is picked.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "RadioButtonGroup",
      description: "Radio options rendered as a segmented button group.",
      props: [
        {
          name: "Root.defaultValue",
          type: "string",
          description: "Uncontrolled initial selection.",
        },
        {
          name: "Item.value",
          type: "string",
          description: "Value selected when the item is picked.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Switch",
      description: "Themed on/off switch.",
      props: [
        {
          name: "defaultChecked",
          type: "boolean",
          description: "Uncontrolled initial checked state.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Slider",
      description: "Themed range slider over the headless slider primitive.",
      props: [
        {
          name: "defaultValue",
          type: "number | number[]",
          description: "Uncontrolled initial value.",
        },
        {
          name: "aria-label",
          type: "string",
          description: "Accessible name announced by assistive tech.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Field",
      description: "Field wrapper wiring label, control, description, and error text.",
      props: [
        {
          name: "Root.name",
          type: "string",
          description: "Field name used for error association.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Fieldset",
      description: "Grouped fields with a legend or label heading.",
      props: [
        {
          name: "Root.variant",
          type: '"legend" | "label"',
          description: "Heading style.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Form",
      description: "Styled form root over the headless form primitive.",
      props: [
        {
          name: "onSubmit",
          type: "(event: Event) => void",
          description: "Submit handler called with the submit event.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "OTPField",
      description: "One-time-passcode input with per-digit slots.",
      props: [
        {
          name: "Root.maxLength",
          type: "number",
          description: "Number of digits to collect.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Dialog",
      description:
        "Modal dialog compound (Root, Trigger, Content, Title, Description, Close) over the headless dialog.",
      props: [
        {
          name: "Content.size",
          type: '"1" | "2" | "3" | "4"',
          description: "Content width step, cascaded to Title and Description.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "AlertDialog",
      description:
        "Modal confirmation dialog compound (Root, Trigger, Content, Title, Description, Cancel, Action, Close).",
      props: [
        {
          name: "Content.size",
          type: '"1" | "2" | "3" | "4"',
          description: "Content width step, cascaded to Title and Description.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Drawer",
      description:
        "Slide-in panel compound (Root, Trigger, Content, Header, Body, StickyFooter, Title, Close).",
      props: [],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Popover",
      description:
        "Anchored popup compound (Root, Trigger, Content, Close) over the headless popover.",
      props: [
        {
          name: "Content.size",
          type: "string",
          description: "Content size token cascaded to nested text.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Tooltip",
      description:
        "Hover tooltip convenience component plus a separate opt-in TooltipProvider for delay grouping.",
      props: [
        {
          name: "content",
          type: "JSX.Element",
          description: "Tooltip body, rendered as Text in the popup.",
        },
        {
          name: "delay",
          type: "number",
          default: "400",
          description: "Delay in ms before the tooltip opens.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "HoverCard",
      description: "Hover preview card compound (Root, Trigger, Content).",
      props: [
        {
          name: "Root.openDelay",
          type: "number",
          default: "200",
          description: "Delay in ms before the card opens.",
        },
        {
          name: "Root.closeDelay",
          type: "number",
          default: "150",
          description: "Delay in ms before the card closes.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "DropdownMenu",
      description:
        "Menu compound (Root, Trigger, Content, items, groups, checkbox/radio items, submenus) over the headless dropdown menu.",
      props: [
        {
          name: "Content.size",
          type: '"1" | "2" | "3"',
          description: "Item text size, inherited by submenu content.",
        },
        {
          name: "Item.shortcut",
          type: "JSX.Element",
          description: "Trailing shortcut hint.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ContextMenu",
      description:
        "Right-click menu compound with the same parts and theming as DropdownMenu, over the headless context menu.",
      props: [
        {
          name: "Content.size",
          type: '"1" | "2" | "3"',
          description: "Item text size, inherited by submenu content.",
        },
        {
          name: "Item.shortcut",
          type: "JSX.Element",
          description: "Trailing shortcut hint.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Lightbox",
      description:
        "Modal media-viewer compound (Root, Trigger, Content, ItemGroup, Item, Previous, Next, Counter, Caption, thumbnails, Zoom) with no headless base.",
      props: [
        {
          name: "Root.loop",
          type: "boolean",
          default: "false",
          description: "Wrap navigation at the ends.",
        },
        {
          name: "Item.index",
          type: "number",
          description: "Item position; registered for the counter and navigation.",
        },
        {
          name: "Item.caption",
          type: "JSX.Element",
          description: "Caption content displayed by Caption for this item.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Card",
      description: "Themed content container with size and variant steps.",
      props: [
        { name: "size", type: '"1" | "2" | "3" | "4" | "5"', description: "Card size step." },
        {
          name: "variant",
          type: '"surface" | "outline" | "ghost" | "soft"',
          description: "Card style.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Badge",
      description: "Small themed status label with size, variant, and color steps.",
      props: [
        { name: "size", type: '"1" | "2"', description: "Badge size step." },
        {
          name: "variant",
          type: '"solid" | "soft" | "surface" | "outline"',
          description: "Badge style.",
        },
        { name: "color", type: "string", description: "Accent color token." },
        {
          name: "highContrast",
          type: "boolean",
          description: "Boosts text contrast against the badge fill.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Callout",
      description:
        "Alert banner compound (Root, Icon, Title, Description, Actions, Action) pairing an icon with supporting text.",
      props: [
        { name: "Root.color", type: "string", description: "Accent color token." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Breadcrumbs",
      description:
        "Breadcrumb trail (Root, Item, Dropdown, DropdownItem): ghost-button crumbs with separators, collapsing into a dropdown menu.",
      props: [
        {
          name: "Root.color",
          type: "string",
          default: '"gray"',
          description: "Crumb color token.",
        },
        {
          name: "Item.onClick",
          type: "(event: Event) => void",
          description: "Makes the crumb a button; the last item without one renders as plain text.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "DataList",
      description:
        "Description-list compound (Root, Item, Label, Value) for label/value rows in either orientation.",
      props: [
        {
          name: "Root.orientation",
          type: '"horizontal" | "vertical"',
          description: "Row layout direction.",
        },
        { name: "Root.size", type: '"1" | "2" | "3"', description: "Type size step." },
        { name: "Root.trim", type: "string", description: "Leading-trim token for the rows." },
        {
          name: "Item.align",
          type: '"start" | "center" | "end" | "baseline" | "stretch"',
          description: "Cross-axis alignment of the row.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Table",
      description:
        "Themed table compound (Root, Table, Header, Body, Footer, Row, RowHeader, Cell, ColumnHeaderCell) over native table elements.",
      props: [
        { name: "Root.size", type: '"1" | "2" | "3"', description: "Cell density step." },
        {
          name: "Root.variant",
          type: '"surface" | "outline" | "ghost"',
          description: "Table style.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Progress",
      description: "Themed linear progress bar over the headless progress primitive.",
      props: [
        { name: "value", type: "number", description: "Completed amount." },
        { name: "max", type: "number", default: "100", description: "Total amount." },
        {
          name: "size",
          type: '"1" | "2" | "3" | "4" | "5" | "6"',
          description: "Bar thickness step.",
        },
        { name: "color", type: "string", description: "Accent color token." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "CircularProgress",
      description: "Themed ring progress indicator with the same value semantics as Progress.",
      props: [
        { name: "value", type: "number", description: "Completed amount." },
        { name: "max", type: "number", default: "100", description: "Total amount." },
        {
          name: "size",
          type: '"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Ring diameter step.",
        },
        { name: "color", type: "string", description: "Accent color token." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Avatar",
      description: "User avatar: an image with an initials fallback, over the headless avatar.",
      props: [
        {
          name: "size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Avatar size step.",
        },
        { name: "shape", type: '"circle" | "square"', description: "Avatar shape." },
        { name: "fallback", type: "JSX.Element", description: "Fallback content (initials)." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "AvatarGroup",
      description: "Overlapping avatar row (Root, Avatar) sharing one size, shape, and color.",
      props: [
        {
          name: "Root.size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Avatar size step shared by the group.",
        },
        {
          name: "Root.shape",
          type: '"circle" | "square"',
          description: "Avatar shape shared by the group.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "AvatarStack",
      description: "Reversed-overlap avatar stack (Root, Avatar) cascading one size.",
      props: [
        {
          name: "Root.size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          description: "Avatar size step shared by the stack.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Tabs",
      description:
        "Themed tab compound (Root, List, Trigger, Content) over the headless tabs primitive.",
      props: [
        {
          name: "Root.defaultValue",
          type: "string",
          description: "Uncontrolled initially active tab.",
        },
        { name: "List.size", type: '"1" | "2"', description: "Tab list size step." },
        {
          name: "Trigger.value",
          type: "string",
          description: "Tab value activated when the trigger is picked.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "TabsNav",
      description: "Tab-styled navigation row (Root, Link) with active-link indication.",
      props: [
        { name: "Root.size", type: '"1" | "2"', description: "Nav size step." },
        { name: "Link.href", type: "string", description: "Link destination." },
        {
          name: "Link.active",
          type: "boolean",
          description: "Marks the current page (`aria-current`).",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SegmentedControl",
      description:
        "Segmented option strip (Root, List, Trigger, Content) over the headless tabs primitive.",
      props: [
        {
          name: "Root.defaultValue",
          type: "string",
          description: "Uncontrolled initially selected segment.",
        },
        {
          name: "Trigger.value",
          type: "string",
          description: "Segment value selected when the trigger is picked.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SegmentedControlNav",
      description: "Segmented navigation row (Root, Link) over the headless navigation menu.",
      props: [
        { name: "Link.href", type: "string", description: "Link destination." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SegmentedControlRadioGroup",
      description: "Segmented options as a real radio group (Root, Item) over headless radio.",
      props: [
        {
          name: "Root.defaultValue",
          type: "string",
          description: "Uncontrolled initially checked value.",
        },
        {
          name: "Item.value",
          type: "string",
          description: "Value checked when the item is picked.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ScrollArea",
      description:
        "Themed scroll container with custom scrollbars and a corner, over the headless scroll area.",
      props: [
        { name: "size", type: '"1" | "2" | "3"', description: "Scrollbar thickness step." },
        {
          name: "scrollbars",
          type: '"both" | "vertical" | "horizontal"',
          default: '"both"',
          description: "Which scrollbar orientations render.",
        },
        {
          name: "type",
          type: '"always" | "scroll" | "hover" | "auto"',
          default: '"hover"',
          description: "When scrollbars are visible.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ScrollGallery",
      description:
        "Headless scrollable gallery compound (Root, Viewport, Item, Previous, Next, ScrollMarkerGroup, ScrollMarker) with page-based buttons and marker navigation. No headless base; ported as custom logic.",
      props: [
        {
          name: "Root.defaultValue",
          type: "number",
          default: "0",
          description: "Uncontrolled initially active item index.",
        },
        {
          name: "Root.loop",
          type: "boolean",
          default: "false",
          description: "Wrap navigation at the boundaries.",
        },
        {
          name: "Root.orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Scroll direction.",
        },
        {
          name: "Previous.step / Next.step",
          type: "number",
          description: "Items to scroll per click; omitted scrolls one page (85% of the viewport).",
        },
        {
          name: "ScrollMarker.index",
          type: "number",
          description: "Item index the marker scrolls to.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Strong",
      description: "Themed strong emphasis element.",
      props: [],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Shine",
      description:
        "Pointer-tracked specular shine over its children via an SVG light filter.",
      props: [
        {
          name: "puffyness",
          type: '"0.5" | "0.75" | "1" | "1.25" | "1.5" | "1.75" | "2"',
          default: '"1"',
          description: "Blur radius of the specular light filter.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "EmptyState",
      description:
        "Empty-state compound (Root, Header, Media, Title, Description, Actions) for blank views.",
      props: [
        {
          name: "Media.variant",
          type: '"ghost" | "soft"',
          default: '"soft"',
          description: "Media container style.",
        },
        {
          name: "Media.color",
          type: "string",
          default: '"gray"',
          description: "Media accent color token.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Portal",
      description:
        "Renders a wrapper element into a container (`document.body` by default).",
      props: [
        {
          name: "container",
          type: "Element | null",
          description: "Container receiving the portaled content.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "VisuallyHidden",
      description:
        "Hides content visually while keeping it available to assistive technology.",
      props: [
        {
          name: "style",
          type: "JSX.CSSProperties",
          description: "Styles merged over the hiding styles.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "FilterChip",
      description:
        "Toggleable filter chip over the headless checkbox, with checked/unchecked data attributes.",
      props: [
        { name: "size", type: '"1" | "2" | "3"', default: '"2"', description: "Chip size step." },
        { name: "color", type: "string", description: "Accent color token." },
        { name: "checked", type: "boolean", description: "Controlled checked state." },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "CountryFlag",
      description: "Flag image for an ISO country code, served from the flag-icons CDN.",
      props: [
        {
          name: "countryCode",
          type: "string",
          description: "ISO 3166-1 alpha-2 code (case-insensitive).",
        },
        {
          name: "size",
          type: '"1" | "2" | "3" | "4"',
          default: '"2"',
          description: "Flag size step.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "StackedHorizontalBarChart",
      description:
        "Horizontal bar split into labeled, tooltip-annotated segments sized by value.",
      props: [
        {
          name: "data",
          type: "{ label: string | ((value: number, percent: string) => string); value: number; color: string }[]",
          description: "Bar segments; widths are proportional to the values' sum.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "WidgetStack",
      description:
        "Carousel compound (Root, Stack, Item, Next, Prev) with autoplay, visibility tracking, and navigation controls. No headless base; ported as custom logic.",
      props: [
        {
          name: "Root.orientation",
          type: '"horizontal" | "vertical"',
          default: '"vertical"',
          description: "Scroll direction.",
        },
        {
          name: "Root.autoPlay",
          type: "number",
          description: "Autoplay interval in ms; manual navigation disables it permanently.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Accordion",
      description:
        "Themed accordion compound (Root, Item, Trigger, Content) over the headless accordion.",
      props: [
        {
          name: "Root.multiple",
          type: "boolean",
          default: "false",
          description: "Allow several items open at once.",
        },
        {
          name: "Root.defaultValue",
          type: "string[]",
          description: "Uncontrolled initially expanded item values.",
        },
        {
          name: "Item.value",
          type: "string",
          description: "Item value tracked in the expanded set.",
        },
        {
          name: "Content.keepMounted",
          type: "boolean",
          default: "true",
          description: "Keep the panel mounted while collapsed.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "CreditCard",
      description:
        "Interactive 3D card compound (Root, Content, Front, Back, Trigger, face slots, brand logo, fieldset, fields, inputs) with brand detection. No headless base; ported as custom logic.",
      props: [
        {
          name: "Root.defaultFace",
          type: '"front" | "back"',
          default: '"front"',
          description: "Uncontrolled initially shown face.",
        },
        {
          name: "Content.color",
          type: "string",
          description: "Accent color inherited by the faces.",
        },
        {
          name: "BrandLogo.brand",
          type: "string",
          description: "Brand override; defaults to the detected brand.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "BotAvatar",
      description:
        "Procedural bot avatar: clipped silhouette, morphing SVG face, gaze tracking, status expressions, and an imperative handle. No headless base; ported as custom logic.",
      props: [
        {
          name: "size",
          type: '"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
          default: '"3"',
          description: "Avatar size step.",
        },
        {
          name: "identity",
          type: "string",
          description: "Stable identifier deriving shape and color.",
        },
        {
          name: "expression",
          type: '"neutral" | "happy" | "wide" | "wink" | "sleepy" | "angry" | "sad" | "suspicious"',
          description: "Face expression; overrides the status mapping.",
        },
        {
          name: "status",
          type: '"idle" | "thinking" | "working" | "waiting" | "blocked" | "done"',
          description: "Lifecycle status implying a face and motion preset.",
        },
        {
          name: "followPointer",
          type: "boolean",
          default: "false",
          description: "Track the pointer with the gaze.",
        },
        {
          name: "handle",
          type: "BotAvatarHandle",
          description: "Imperative handle (`blink()`, `lookAt()`).",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility:
    "Type components are plain text elements with descriptive classes. Separator keeps the headless primitive semantics (`role` and `aria-orientation`); mark purely visual dividers `decorative`. Spinner overlays mark the covered content `aria-hidden` and `inert` while loading.",
  keyboard: [],
  notes: "",
};
