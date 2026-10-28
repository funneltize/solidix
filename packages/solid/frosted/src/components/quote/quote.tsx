import { omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";

/**
 * Props for the `Quote` component: native q props.
 * `ref` is narrowed to the compose-refs form (code precedent).
 */
interface QuoteProps extends Omit<PropsWithoutColor<"q">, "ref"> {
  /** Ref forwarded to the rendered `q` element. */
  ref?: Ref<HTMLQuoteElement> | undefined;
}

/** Themed inline quotation: a `q` element with the `fui-Quote` class, as upstream. */
const Quote: Component<QuoteProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const composedRefs = composeRefs(props.ref);

  return <q {...rest} ref={composedRefs} class={cx("fui-Quote", props.class)} />;
};

export { Quote };
export type { QuoteProps };
