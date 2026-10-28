import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ariaBoolean, callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import type { PropsWithoutColor } from "../../helpers/props";
import { useCreditCardContext, type CardFace } from "./credit-card-context";

/** Slot typed for `CreditCardTrigger` button props. */
const TriggerSlot = createSlot<
  HTMLButtonElement,
  Omit<PropsWithoutColor<"button">, "children" | "ref">
>("CreditCardTrigger");
/** Slottable selecting the element-form `render` target for child injection. */
const TriggerSlottable = createSlottable("CreditCardTrigger");

/** State exposed to `CreditCardTrigger`'s function-form `render` prop. */
interface CreditCardTriggerState {
  /** Currently shown face. */
  face: CardFace;
}

/**
 * Props passed to a function-form `render` prop: the caller's button props
 * with the computed `class`, data attributes, and `children` applied.
 */
type CreditCardTriggerRenderProps = PropsWithoutColor<"button"> & {
  /** Currently shown face written as `data-face`. */
  "data-face"?: CardFace | undefined;
};

/**
 * `render` prop accepted by `CreditCardTrigger`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and trigger state.
 */
type CreditCardTriggerRenderProp =
  | JSX.Element
  | ((props: CreditCardTriggerRenderProps, state: CreditCardTriggerState) => JSX.Element);

/** Props for `CreditCard.Trigger`. */
interface CreditCardTriggerProps extends Omit<PropsWithoutColor<"button">, "ref" | "onClick"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: CreditCardTriggerRenderProp | undefined;
  /** Click handler; runs before the built-in face toggle. */
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined;
}

/**
 * Button toggling between the card faces.
 *
 * Upstream: `credit-card-trigger.tsx` (`CreditCardTrigger`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardTrigger: Component<CreditCardTriggerProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "onClick");
  const { face, toggle } = useCreditCardContext();
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const onClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    toggle,
  );

  const classes = () => cx("fui-CreditCardTrigger", props.class);
  const state = (): CreditCardTriggerState => ({ face: face() });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get type() {
        return "button" as const;
      },
      get "aria-expanded"() {
        return ariaBoolean(face() === "back");
      },
      get "data-face"() {
        return face();
      },
      get onClick() {
        return onClick;
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardTriggerRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <TriggerSlot
        {...rest}
        class={classes()}
        type="button"
        aria-expanded={ariaBoolean(face() === "back")}
        data-face={face()}
        onClick={onClick}
        ref={composedRefs}
      >
        <TriggerSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </TriggerSlottable>
      </TriggerSlot>
    );
  }

  return (
    <button
      {...rest}
      class={classes()}
      type="button"
      aria-expanded={ariaBoolean(face() === "back")}
      data-face={face()}
      onClick={onClick}
      ref={composedRefs}
    >
      {resolved()}
    </button>
  );
};

export { CreditCardTrigger };
export type {
  CreditCardTriggerProps,
  CreditCardTriggerRenderProp,
  CreditCardTriggerRenderProps,
  CreditCardTriggerState,
};
