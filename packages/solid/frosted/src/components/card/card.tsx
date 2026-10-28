import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { cardPropDefs, type CardOwnProps } from "./card.props";

/** Slot typed for `Card`'s div props so element-form `render` spreads typecheck. */
const CardSlot = createSlot<HTMLDivElement>("Card");
/** Slottable selecting the element-form `render` target for child injection. */
const CardSlottable = createSlottable("Card");

/**
 * Props passed to a function-form `render` prop: the caller's div props with
 * the computed `class` and `children` applied.
 */
type CardRenderProps = JSX.HTMLAttributes<HTMLDivElement>;

/** State argument for a function-form `render` prop. Card carries no state. */
type CardRenderState = Record<string, never>;

/**
 * `render` prop accepted by `Card`, mirroring Base UI `useRender`: an element
 * to render as (merged via `Slot`), or a function receiving the merged props.
 */
type CardRenderProp =
  | JSX.Element
  | ((props: CardRenderProps, state: CardRenderState) => JSX.Element);

/**
 * Props for the `Card` component: prop-def values plus native div props and
 * `render`. `ref` is narrowed to the compose-refs callback form so it
 * forwards to both the `Slot` and the `div` branches.
 */
interface CardProps extends CardOwnProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CardRenderProp | undefined;
  /** Card content. */
  children?: JSX.Element | undefined;
}

/**
 * Themed surface container. Renders a `div` with `fui-Card` sizing and
 * variant classes; `render` swaps the element like Base UI (commonly a
 * `button` or `a` for clickable cards, which the CSS targets).
 *
 * Upstream: `card.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const Card: Component<CardProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "size", "variant");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const size = () => props.size ?? cardPropDefs.size.default;
  const variant = () => props.variant ?? cardPropDefs.variant.default;

  const classes = () =>
    cx("fui-reset", "fui-Card", props.class, `fui-r-size-${size()}`, `fui-variant-${variant()}`);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CardRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <CardSlot {...rest} class={classes()} ref={composedRefs}>
        <CardSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </CardSlottable>
      </CardSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

export { Card };
export type { CardProps, CardRenderProp, CardRenderProps, CardRenderState };
