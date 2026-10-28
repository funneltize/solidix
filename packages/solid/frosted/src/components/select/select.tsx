// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/select/select.tsx

import { createContext, omit, useContext as useSolidContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Select as SelectPrimitive,
  SelectContent as SelectPrimitiveContent,
  SelectGroup as SelectPrimitiveGroup,
  SelectIcon as SelectPrimitiveIcon,
  SelectItem as SelectPrimitiveItem,
  SelectItemIndicator as SelectPrimitiveItemIndicator,
  SelectItemText as SelectPrimitiveItemText,
  SelectLabel as SelectPrimitiveLabel,
  SelectPortal as SelectPrimitivePortal,
  SelectSeparator as SelectPrimitiveSeparator,
  SelectTrigger as SelectPrimitiveTrigger,
  SelectValue as SelectPrimitiveValue,
  SelectViewport as SelectPrimitiveViewport,
  type SelectContentProps as SelectContentPrimitiveProps,
  type SelectGroupProps as SelectGroupPrimitiveProps,
  type SelectItemProps as SelectItemPrimitiveProps,
  type SelectLabelProps as SelectLabelPrimitiveProps,
  type SelectPortalProps as SelectPrimitivePortalProps,
  type SelectProps as SelectPrimitiveProps,
  type SelectSeparatorProps as SelectSeparatorPrimitiveProps,
  type SelectTriggerProps as SelectTriggerPrimitiveProps,
  type SelectValueProps as SelectValuePrimitiveProps,
} from "@solidix/select";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { Theme } from "../../theme";
import { selectContentPropDefs, selectRootPropDefs, selectTriggerPropDefs } from "./select.props";

/** Own props of `Select.Root` derived from `selectRootPropDefs` (size). */
type SelectRootOwnProps = GetPropDefTypes<typeof selectRootPropDefs>;

/** Own props of `Select.Trigger` derived from `selectTriggerPropDefs` (variant, color). */
type SelectTriggerOwnProps = GetPropDefTypes<typeof selectTriggerPropDefs>;

/** Own props of `Select.Content` derived from `selectContentPropDefs` (highContrast). */
type SelectContentOwnProps = GetPropDefTypes<typeof selectContentPropDefs>;

/** Context value shared from `Select.Root` down to the trigger and content. */
interface SelectContextValue {
  /** Resolved root size token, selecting the `fui-r-size-*` class. */
  size: string;
}

/** Context carrying the root size to the trigger and content. */
const SelectContext = createContext<SelectContextValue>();

/**
 * Reads the select root context, returning `undefined` when rendered outside
 * a `Select.Root` so parts can fall back to the prop-def defaults.
 */
function useSelectContext(): SelectContextValue | undefined {
  try {
    return useSolidContext(SelectContext);
  } catch {
    return undefined;
  }
}

/**
 * Props for `Select.Root`: the size token plus the Solidix select primitive
 * root props (single string value, open state, form attributes).
 *
 * Upstream parity notes: the upstream root is generic over a `Value` type with
 * `items`, `multiple`, `itemToStringLabel`, and `valueLabelFormatter` props
 * supporting multi-select label lookup. This port targets the Radix single
 * string-value API, so those props are intentionally unsupported.
 */
interface RootProps extends SelectRootOwnProps, Omit<SelectPrimitiveProps, "children"> {
  /** Trigger, portal, and content parts. */
  children?: JSX.Element | undefined;
}

/**
 * Root state provider for the select. Renders no DOM itself; `size` flows to
 * the trigger and content through context, defaulting to `"2"`.
 */
const Root: Component<RootProps> = (props) => {
  const rest = omit(props, "size", "children");
  const size = () => props.size ?? selectRootPropDefs.size.default;
  return (
    <SelectPrimitive {...rest}>
      <SelectContext value={{ size: size() as string }}>{props.children}</SelectContext>
    </SelectPrimitive>
  );
};

/**
 * Props for `Select.Trigger`: variant/color styling, a placeholder, plus the
 * Solidix select trigger (button) props.
 *
 * Upstream parity notes: the upstream trigger accepts `renderValue` for
 * custom label rendering; this port relies on the primitive value part which
 * shows the selected item text, so `renderValue` is intentionally unsupported.
 */
interface TriggerProps
  extends SelectTriggerOwnProps, Omit<SelectTriggerPrimitiveProps, "children" | "class" | "style"> {
  /** Additional class names merged after the Frosted trigger classes. */
  class?: string | undefined;
  /** Inline styles for the trigger button. */
  style?: JSX.CSSProperties | undefined;
  /** Text shown when no option is selected. */
  placeholder?: SelectValuePrimitiveProps["placeholder"];
}

/**
 * Button opening the select popup. Carries `fui-SelectTrigger` with the size
 * and variant classes, the selected value (or placeholder) in a
 * `fui-SelectTriggerValue` span, and the chevron icon.
 *
 * The value span wraps the primitive value part because that part ignores
 * `class` by design; the wrapper keeps the upstream `fui-SelectTriggerValue`
 * hook for ellipsis styling.
 */
const Trigger: Component<TriggerProps> = (props) => {
  const rest = omit(props, "class", "style", "color", "variant", "placeholder");
  const context = useSelectContext();
  const size = () => context?.size ?? selectRootPropDefs.size.default;
  const variant = () => props.variant ?? selectTriggerPropDefs.variant.default;
  const color = () => props.color ?? selectTriggerPropDefs.color.default;
  return (
    <SelectPrimitiveTrigger
      {...rest}
      data-accent-color={color() ?? (variant() === "surface" ? "gray" : undefined)}
      class={cx(
        "fui-reset",
        "fui-SelectTrigger",
        props.class,
        size() && `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
      )}
      style={props.style}
    >
      <span class="fui-SelectTriggerValue">
        <SelectPrimitiveValue placeholder={props.placeholder} />
      </span>
      <SelectPrimitiveIcon>
        <svg
          class="fui-SelectIcon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3.25 5.25 9.5 5.5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width={1.5}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </SelectPrimitiveIcon>
    </SelectPrimitiveTrigger>
  );
};

/**
 * Props for `Select.Content`: the popup listing the options, with popper
 * placement props, a portal container, and the high-contrast flag.
 */
interface ContentProps
  extends
    SelectContentOwnProps,
    Omit<SelectContentPrimitiveProps, "children" | "class" | "style" | "position"> {
  /** Options, groups, labels, and separators. */
  children?: JSX.Element | undefined;
  /** Additional class names merged after the Frosted content classes. */
  class?: string | undefined;
  /** Inline styles for the content element. */
  style?: JSX.CSSProperties | undefined;
  /** Portal container for the popup; defaults to `document.body`. */
  container?: SelectPrimitivePortalProps["container"];
  /**
   * Deprecated upstream in favor of `alignItemWithTrigger`: `"popper"`
   * disables item alignment, anything else keeps it.
   */
  position?: "item-aligned" | "popper" | undefined;
  /**
   * Whether the content aligns the selected item with the trigger (Radix
   * `item-aligned` positioning). Defaults to `true`; pass `false` for plain
   * popper positioning.
   */
  alignItemWithTrigger?: boolean | undefined;
}

/**
 * Popup listing the select options. Always portalled (upstream parity); the
 * popup is wrapped in `Theme` so Frosted tokens and data attributes apply
 * inside the portal. `alignItemWithTrigger` (default `true`) maps to
 * Radix `position="item-aligned"`, `false` maps to `position="popper"`.
 * Placement defaults match upstream: `side="bottom"`, `sideOffset={4}`,
 * `align="start"`, `collisionPadding={10}`.
 */
const Content: Component<ContentProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "style",
    "children",
    "highContrast",
    "container",
    "position",
    "alignItemWithTrigger",
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "collisionPadding",
  );
  const context = useSelectContext();
  const size = () => context?.size ?? selectRootPropDefs.size.default;
  const alignItemWithTrigger = () => props.alignItemWithTrigger ?? props.position !== "popper";
  return (
    <SelectPrimitivePortal container={props.container}>
      <Theme>
        <SelectPrimitiveContent
          {...rest}
          position={alignItemWithTrigger() ? "item-aligned" : "popper"}
          side={props.side ?? "bottom"}
          sideOffset={props.sideOffset ?? 4}
          align={props.align ?? "start"}
          alignOffset={props.alignOffset}
          collisionPadding={props.collisionPadding ?? 10}
          class={cx(
            !alignItemWithTrigger() && "fui-PopperContent",
            "fui-SelectContent",
            props.class,
            size() && `fui-r-size-${size()}`,
            props.highContrast && "fui-high-contrast",
          )}
          style={props.style}
        >
          <SelectPrimitiveViewport class="fui-SelectViewport">
            {props.children}
          </SelectPrimitiveViewport>
        </SelectPrimitiveContent>
      </Theme>
    </SelectPrimitivePortal>
  );
};

/**
 * Props for `Select.Group`: groups related options under a shared label.
 */
interface GroupProps extends Omit<SelectGroupPrimitiveProps, "children" | "class" | "style"> {
  /** Grouped items and an optional `Select.GroupLabel`. */
  children?: JSX.Element | undefined;
  /** Additional class names merged after `fui-SelectGroup`. */
  class?: string | undefined;
  /** Inline styles for the group element. */
  style?: JSX.CSSProperties | undefined;
}

/** Groups related select options, carrying the `fui-SelectGroup` class. */
const Group: Component<GroupProps> = (props) => {
  const rest = omit(props, "class", "style", "children");
  return (
    <SelectPrimitiveGroup {...rest} class={cx("fui-SelectGroup", props.class)} style={props.style}>
      {props.children}
    </SelectPrimitiveGroup>
  );
};

/**
 * Props for `Select.GroupLabel`: the non-interactive group heading.
 */
interface GroupLabelProps extends Omit<SelectLabelPrimitiveProps, "children" | "class" | "style"> {
  /** Label text. */
  children?: JSX.Element | undefined;
  /** Additional class names merged after `fui-SelectLabel`. */
  class?: string | undefined;
  /** Inline styles for the label element. */
  style?: JSX.CSSProperties | undefined;
}

/** Non-interactive group heading, carrying the `fui-SelectLabel` class. */
const GroupLabel: Component<GroupLabelProps> = (props) => {
  const rest = omit(props, "class", "style", "children");
  return (
    <SelectPrimitiveLabel {...rest} class={cx("fui-SelectLabel", props.class)} style={props.style}>
      {props.children}
    </SelectPrimitiveLabel>
  );
};

/**
 * Props for `Select.Item`: one selectable option, identified by `value`.
 */
interface ItemProps extends Omit<SelectItemPrimitiveProps, "children" | "class" | "style"> {
  /** Option label; rendered as the item text. */
  children?: JSX.Element | undefined;
  /** Additional class names merged after `fui-SelectItem`. */
  class?: string | undefined;
  /** Inline styles for the item element. */
  style?: JSX.CSSProperties | undefined;
}

/**
 * One selectable option. Renders the check indicator (shown when selected)
 * plus the item text, matching the upstream `fui-SelectItem` structure.
 */
const Item: Component<ItemProps> = (props) => {
  const rest = omit(props, "class", "style", "children");
  return (
    <SelectPrimitiveItem {...rest} class={cx("fui-SelectItem", props.class)} style={props.style}>
      <SelectPrimitiveItemIndicator class="fui-SelectItemIndicator">
        <ThickCheckIcon class="fui-SelectItemIndicatorIcon" />
      </SelectPrimitiveItemIndicator>
      <SelectPrimitiveItemText>{props.children}</SelectPrimitiveItemText>
    </SelectPrimitiveItem>
  );
};

/**
 * Props for `Select.Separator`: a visual divider between options or groups.
 */
interface SeparatorProps extends Omit<
  SelectSeparatorPrimitiveProps,
  "children" | "class" | "style"
> {
  /** Separators render no children; accepted for primitive compatibility. */
  children?: JSX.Element | undefined;
  /** Additional class names merged after `fui-SelectSeparator`. */
  class?: string | undefined;
  /** Inline styles for the separator element. */
  style?: JSX.CSSProperties | undefined;
}

/** Visual divider between options or groups, always hidden from assistive tech. */
const Separator: Component<SeparatorProps> = (props) => {
  const rest = omit(props, "class", "style", "children");
  return (
    <SelectPrimitiveSeparator
      {...rest}
      class={cx("fui-SelectSeparator", props.class)}
      style={props.style}
    >
      {props.children}
    </SelectPrimitiveSeparator>
  );
};

/**
 * Props for the selected-item check icon, matching the upstream
 * `ThickCheckIcon` artwork (fixed 9x9 glyph, `currentColor` fill).
 */
interface ThickCheckIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  /** Additional class names merged after the icon class. */
  class?: string | undefined;
}

/**
 * Check glyph shown in the selected item's indicator. Artwork ported
 * verbatim from upstream `src/icons.tsx` at 56787900bfe0.
 */
const ThickCheckIcon: Component<ThickCheckIconProps> = (props) => {
  const rest = omit(props, "class");
  return (
    <svg
      {...rest}
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      class={cx("fui-ThickCheckIcon", props.class)}
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.53547 0.232303C8.57735 0.184431 8.62816 0.145223 8.68496 0.116965C8.74175 0.0887071 8.80356 0.0719815 8.86683 0.0677641C8.9301 0.0635466 8.99361 0.0718818 9.05324 0.0922688C9.11287 0.112656 9.16735 0.144685 9.21352 0.186472C9.25969 0.228259 9.29653 0.278822 9.3219 0.335193C9.34727 0.391564 9.36076 0.452561 9.36155 0.51462C9.36234 0.576678 9.35041 0.638026 9.32647 0.695024C9.30253 0.752022 9.2671 0.803504 9.22223 0.846413L4.32146 7.09319C4.25069 7.17352 4.15435 7.225 4.05363 7.23892C3.95291 7.25284 3.85057 7.22851 3.76415 7.17014L0.396844 4.92166C0.342397 4.88431 0.296369 4.8363 0.261645 4.78063C0.226921 4.72496 0.204224 4.66285 0.194996 4.59806C0.185768 4.53327 0.190204 4.46731 0.208017 4.40437C0.22583 4.34144 0.256717 4.28296 0.298817 4.23242C0.340917 4.18188 0.39316 4.14039 0.452398 4.11046C0.511636 4.08054 0.576551 4.06284 0.643179 4.05843C0.709807 4.05402 0.776617 4.06295 0.839694 4.08473C0.902771 4.1065 0.960797 4.14075 1.01039 4.18539L3.87087 6.16806L8.53547 0.232303Z"
      />
    </svg>
  );
};

/**
 * Namespaced `Select` export grouping every select part
 * (`Root`, `Trigger`, `Content`, `Group`, `GroupLabel`, `Item`, `Separator`).
 */
const Select = { Content, Group, GroupLabel, Item, Root, Separator, Trigger };

export { Content, Group, GroupLabel, Item, Root, Select, Separator, ThickCheckIcon, Trigger };
export type {
  ContentProps,
  GroupLabelProps,
  GroupProps,
  ItemProps,
  RootProps,
  SeparatorProps,
  TriggerProps,
};
