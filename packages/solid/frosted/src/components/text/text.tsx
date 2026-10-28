import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { textPropDefs } from "./text.props";

/** Slot typed for `Text`'s span props so element-form `render` spreads typecheck. */
const TextSlot = createSlot<HTMLSpanElement>("Text");
/** Slottable selecting the element-form `render` target for child injection. */
const TextSlottable = createSlottable("Text");

/** Own props of `Text` derived from `textPropDefs` (size, weight, align, trim, color, highContrast). */
type TextOwnProps = GetPropDefTypes<typeof textPropDefs>;

/**
 * Props passed to a function-form `render` prop: the caller's element props with
 * the computed `class`, `data-accent-color`, and `children` applied.
 */
type TextRenderProps = PropsWithoutColor<"span"> & {
  /** Accent color token written as `data-accent-color` on the rendered element. */
  "data-accent-color"?: string | undefined;
};

/** State argument for a function-form `render` prop. Text carries no state. */
type TextRenderState = Record<string, never>;

/**
 * `render` prop accepted by `Text`, mirroring Base UI `useRender`: an element to
 * render as (merged via `Slot`), or a function receiving the merged props.
 */
type TextRenderProp =
  | JSX.Element
  | ((props: TextRenderProps, state: TextRenderState) => JSX.Element);

/**
 * Props for the `Text` component: prop-def values plus native span props and
 * `render`. `ref` is narrowed to the compose-refs callback form (remove-scroll
 * precedent) so it forwards to both the `Slot` and the `span` branches.
 */
interface TextProps extends TextOwnProps, Omit<PropsWithoutColor<"span">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLSpanElement> | undefined;
  /** Element or render function overriding the default `span` output. */
  render?: TextRenderProp | undefined;
}

/**
 * Themed text span. Renders a `span` with `fui-Text` sizing, weight, alignment,
 * leading-trim, and accent color classes; `render` swaps the element like Base UI.
 */
const Text: Component<TextProps> = (props) => {
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
  // Plain callback, so it satisfies both the compose-refs `Ref` on `TextSlot`
  // and the JSX `ref` on the `span` (remove-scroll precedent).
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that re-instantiates
  // on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const size = () => props.size ?? textPropDefs.size.default;
  const weight = () => props.weight ?? textPropDefs.weight.default;
  const align = () => props.align ?? textPropDefs.align.default;
  const trim = () => props.trim ?? textPropDefs.trim.default;
  const color = () => props.color ?? textPropDefs.color.default;
  const highContrast = () => props.highContrast ?? textPropDefs.highContrast.default;

  const classes = () =>
    cx(
      "fui-Text",
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
    return renderProp(merged as unknown as TextRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it. The
    // render fn runs once at setup, so only statically present children
    // count; dynamic children of the element are not yet inserted then.
    return (
      <TextSlot {...rest} class={classes()} data-accent-color={color()} ref={composedRefs}>
        <TextSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </TextSlottable>
      </TextSlot>
    );
  }

  return (
    <span {...rest} class={classes()} data-accent-color={color()} ref={composedRefs}>
      {resolved()}
    </span>
  );
};

export { Text };
export type { TextProps, TextRenderProp, TextRenderProps, TextRenderState };
