import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { useCreditCardContext } from "./credit-card-context";

/** Slot typed for `CreditCardFront` div props. */
const FrontSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "CreditCardFront",
);
/** Slottable selecting the element-form `render` target for child injection. */
const FrontSlottable = createSlottable("CreditCardFront");

/** State exposed to `CreditCardFront`'s function-form `render` prop. */
interface CreditCardFrontState {
  /** Whether the front face is shown. */
  active: boolean;
}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class`, data attributes, and `children` applied.
 */
type CreditCardFrontRenderProps = PropsWithoutColor<"div"> & {
  /** Present when the front face is shown. */
  "data-active"?: string | undefined;
};

/**
 * `render` prop accepted by `CreditCardFront`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and face state.
 */
type CreditCardFrontRenderProp =
  | JSX.Element
  | ((props: CreditCardFrontRenderProps, state: CreditCardFrontState) => JSX.Element);

/** Props for `CreditCard.Front`. */
interface CreditCardFrontProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardFrontRenderProp | undefined;
  /** Accent color override for the front face. When omitted, inherits from Content. */
  color?: string | undefined;
}

/**
 * Front face wrapper. Hidden faces are removed from the accessibility
 * tree with `inert`.
 *
 * Upstream: `credit-card-front.tsx` (`CreditCardFront`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const CreditCardFront: Component<CreditCardFrontProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "color");
  const { face, color: contextColor } = useCreditCardContext();
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const active = () => face() === "front";
  const resolvedColor = () => props.color ?? contextColor();
  const classes = () => cx("fui-CreditCardFront", props.class);
  const state = (): CreditCardFrontState => ({ active: active() });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get inert() {
        return !active() ? true : undefined;
      },
      get "data-active"() {
        return active() ? "" : undefined;
      },
      get "data-accent-color"() {
        return resolvedColor();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardFrontRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <FrontSlot
        {...rest}
        class={classes()}
        inert={!active() ? true : undefined}
        data-active={active() ? "" : undefined}
        data-accent-color={resolvedColor()}
        ref={composedRefs}
      >
        <FrontSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </FrontSlottable>
      </FrontSlot>
    );
  }

  return (
    <div
      {...rest}
      class={classes()}
      inert={!active() ? true : undefined}
      data-active={active() ? "" : undefined}
      data-accent-color={resolvedColor()}
      ref={composedRefs}
    >
      {resolved()}
    </div>
  );
};

export { CreditCardFront };
export type {
  CreditCardFrontProps,
  CreditCardFrontRenderProp,
  CreditCardFrontRenderProps,
  CreditCardFrontState,
};
