import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { headingPropDefs } from "./heading.props";

/** Slot typed for `Heading`'s h1 props so element-form `render` spreads typecheck. */
const HeadingSlot = createSlot<HTMLHeadingElement>("Heading");
/** Slottable selecting the element-form `render` target for child injection. */
const HeadingSlottable = createSlottable("Heading");

/** Own props of `Heading` derived from `headingPropDefs` (size, weight, align, trim, color, highContrast). */
type HeadingOwnProps = GetPropDefTypes<typeof headingPropDefs>;

/**
 * Props passed to a function-form `render` prop: the caller's element props with
 * the computed `class`, `data-accent-color`, and `children` applied.
 */
type HeadingRenderProps = PropsWithoutColor<"h1"> & {
  /** Accent color token written as `data-accent-color` on the rendered element. */
  "data-accent-color"?: string | undefined;
};

/** State argument for a function-form `render` prop. Heading carries no state. */
type HeadingRenderState = Record<string, never>;

/**
 * `render` prop accepted by `Heading`, mirroring Base UI `useRender`: an element
 * to render as (merged via `Slot`), or a function receiving the merged props.
 */
type HeadingRenderProp =
  | JSX.Element
  | ((props: HeadingRenderProps, state: HeadingRenderState) => JSX.Element);

/**
 * Props for the `Heading` component: prop-def values plus native h1 props and
 * `render`. `ref` is narrowed to the compose-refs callback form (remove-scroll
 * precedent) so it forwards to both the `Slot` and the `h1` branches.
 */
interface HeadingProps extends HeadingOwnProps, Omit<PropsWithoutColor<"h1">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLHeadingElement> | undefined;
  /** Element or render function overriding the default `h1` output. */
  render?: HeadingRenderProp | undefined;
}

/**
 * Themed heading. Renders an `h1` with `fui-Heading` sizing, weight, alignment,
 * leading-trim, and accent color classes; `render` swaps the element like Base UI.
 */
const Heading: Component<HeadingProps> = (props) => {
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
  );
  // Plain callback, so it satisfies both the compose-refs `Ref` on `HeadingSlot`
  // and the JSX `ref` on the `h1` (remove-scroll precedent).
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that re-instantiates
  // on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const size = () => props.size ?? headingPropDefs.size.default;
  const weight = () => props.weight ?? headingPropDefs.weight.default;
  const align = () => props.align ?? headingPropDefs.align.default;
  const trim = () => props.trim ?? headingPropDefs.trim.default;
  const color = () => props.color ?? headingPropDefs.color.default;
  const highContrast = () => props.highContrast ?? headingPropDefs.highContrast.default;

  const classes = () =>
    cx(
      "fui-Heading",
      props.class,
      size() ? `fui-r-size-${size()}` : undefined,
      weight() ? `fui-r-weight-${weight()}` : undefined,
      align() ? `fui-r-ta-${align()}` : undefined,
      trim() ? `fui-r-lt-${trim()}` : undefined,
      highContrast() ? "fui-high-contrast" : undefined,
    );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get "data-accent-color"() {
        return color();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as HeadingRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it. The
    // render fn runs once at setup, so only statically present children
    // count; dynamic children of the element are not yet inserted then.
    return (
      <HeadingSlot {...rest} class={classes()} data-accent-color={color()} ref={composedRefs}>
        <HeadingSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </HeadingSlottable>
      </HeadingSlot>
    );
  }

  return (
    <h1 {...rest} class={classes()} data-accent-color={color()} ref={composedRefs}>
      {resolved()}
    </h1>
  );
};

export { Heading };
export type { HeadingProps, HeadingRenderProp, HeadingRenderProps, HeadingRenderState };
