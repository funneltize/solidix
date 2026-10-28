import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import {
  CreditCardContext,
  useCreditCardContext,
  type CardFace,
  type CreditCardContextValue,
} from "./credit-card-context";

/** Slot typed for `CreditCardContent` div props. */
const ContentSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "CreditCardContent",
);
/** Slottable selecting the element-form `render` target for child injection. */
const ContentSlottable = createSlottable("CreditCardContent");

/** State exposed to `CreditCardContent`'s function-form `render` prop. */
interface CreditCardContentState {
  /** Currently shown face. */
  face: CardFace;
}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class`, data attributes, and `children` applied.
 */
type CreditCardContentRenderProps = PropsWithoutColor<"div"> & {
  /** Currently shown face written as `data-face`. */
  "data-face"?: CardFace | undefined;
};

/**
 * `render` prop accepted by `CreditCardContent`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and content state.
 */
type CreditCardContentRenderProp =
  | JSX.Element
  | ((props: CreditCardContentRenderProps, state: CreditCardContentState) => JSX.Element);

/** Props for `CreditCard.Content`. */
interface CreditCardContentProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardContentRenderProp | undefined;
  /** Accent color applied to the card. Inherited by Front and Back faces. */
  color?: string | undefined;
}

/**
 * Inner content renderer. A separate component so the `children()` memo is
 * created under the color provider: resolving in the outer setup would
 * instantiate faces above the provider and they would miss the color.
 */
const CreditCardContentInner: Component<CreditCardContentProps & { parentFace: () => CardFace }> = (
  props,
) => {
  const rest = omit(props, "children", "class", "ref", "render", "color", "parentFace");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardContent", props.class);
  const state = (): CreditCardContentState => ({ face: props.parentFace() });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get "data-face"() {
        return props.parentFace();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardContentRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <ContentSlot {...rest} class={classes()} data-face={props.parentFace()} ref={composedRefs}>
        <ContentSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </ContentSlottable>
      </ContentSlot>
    );
  }

  return (
    <div {...rest} class={classes()} data-face={props.parentFace()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/**
 * Card container with the 3D flip transform, driven by the `data-face`
 * attribute. Provides the accent `color` to the Front and Back faces.
 *
 * Upstream: `credit-card-content.tsx` (`CreditCardContent`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardContent: Component<CreditCardContentProps> = (props) => {
  const parentCtx = useCreditCardContext();
  // Upstream parity: the color replaces (never merges with) the parent
  // context color, even when omitted.
  const ctxWithColor: CreditCardContextValue = {
    ...parentCtx,
    color: () => props.color,
  };

  return (
    <CreditCardContext value={ctxWithColor}>
      <CreditCardContentInner {...props} parentFace={parentCtx.face} />
    </CreditCardContext>
  );
};

export { CreditCardContent };
export type {
  CreditCardContentProps,
  CreditCardContentRenderProp,
  CreditCardContentRenderProps,
  CreditCardContentState,
};
