/**
 * Fieldset groups related form fields under a shared legend.
 *
 * Ported from frosted-ui at commit 56787900bfe0:
 * https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/fieldset/fieldset.tsx
 */
import { createContext, omit, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import { Text, type TextProps, type TextRenderProp } from "../text/text";
import type { FieldsetLegendOwnProps } from "./fieldset.props";

/** Props for `Fieldset.Root`, the native `fieldset` attributes plus `class`. */
export interface FieldsetRootProps extends Omit<
  JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "ref"
> {
  /** Ref forwarded to the rendered `fieldset` element. */
  ref?: Ref<HTMLFieldSetElement> | undefined;
}

/** Props for `Fieldset.Legend`, mirroring upstream `FieldsetLegendProps`. */
export interface FieldsetLegendProps
  extends FieldsetLegendOwnProps, Omit<JSX.HTMLAttributes<HTMLLegendElement>, "ref"> {
  /** Ref forwarded to the rendered `legend` element. */
  ref?: Ref<HTMLLegendElement> | undefined;
  /** Element or render function overriding the default `legend` output. */
  render?: TextRenderProp | undefined;
}

/** Context shared from `Fieldset.Root` down to `Fieldset.Legend`. */
interface FieldsetContextValue {
  /** Whether the fieldset is disabled, from the root `disabled` prop. */
  disabled: () => boolean;
}

/** Context carrying the fieldset `disabled` state. */
const FieldsetContext = createContext<FieldsetContextValue>();

/**
 * Fieldset root rendering a native `fieldset` element with `fui-FieldsetRoot`.
 * Shares its `disabled` state with `Fieldset.Legend` descendants.
 */
const FieldsetRoot: Component<FieldsetRootProps> = (props) => {
  const rest = omit(props, "children", "class", "ref");
  const composedRefs = composeRefs(props.ref);
  const value: FieldsetContextValue = {
    disabled: () => Boolean(props.disabled),
  };
  return (
    <FieldsetContext value={value}>
      <fieldset
        {...rest}
        ref={composedRefs}
        class={cx("fui-FieldsetRoot", props.class)}
        data-disabled={props.disabled ? "" : undefined}
      >
        {props.children}
      </fieldset>
    </FieldsetContext>
  );
};

/**
 * Fieldset legend rendering a native `legend` element with `fui-FieldsetLegend`.
 * Inherits `disabled` from the enclosing `Fieldset.Root` unless overridden.
 */
const FieldsetLegend: Component<FieldsetLegendProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "ref",
    "render",
    "size",
    "weight",
    "align",
    "trim",
    "color",
    "highContrast",
    "variant",
    "disabled",
  );
  let context: FieldsetContextValue | null = null;
  try {
    context = useContext(FieldsetContext);
  } catch {
    context = null;
  }
  const composedRefs = composeRefs(props.ref);
  return (
    <Text
      {...(rest as unknown as TextProps)}
      render={props.render ?? ((<legend />) as unknown as TextRenderProp)}
      ref={composedRefs as unknown as Ref<HTMLSpanElement>}
      class={cx("fui-FieldsetLegend", props.class)}
      size={props.size ?? (props.variant === "label" ? "2" : "3")}
      weight={props.weight ?? (props.variant === "label" ? "medium" : "bold")}
      align={props.align}
      trim={props.trim}
      color={props.color}
      highContrast={props.highContrast}
      data-variant={props.variant ?? "legend"}
      data-disabled={(props.disabled ?? context?.disabled() ?? false) ? "" : undefined}
    >
      {props.children}
    </Text>
  );
};

/** Fieldset namespace: `Fieldset.Root` and `Fieldset.Legend`. */
export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
};
