import { omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";

/**
 * Props for the `Strong` component: native strong props.
 * `ref` is narrowed to the compose-refs form (code precedent).
 */
interface StrongProps extends Omit<PropsWithoutColor<"strong">, "ref"> {
  /** Ref forwarded to the rendered `strong` element. */
  ref?: Ref<HTMLElement> | undefined;
}

/**
 * Themed strong emphasis: a `strong` element with the `fui-Strong` class.
 *
 * Upstream: `strong.tsx` (`Strong`) at whopio/frosted-ui commit `56787900bfe0`.
 */
const Strong: Component<StrongProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const composedRefs = composeRefs(props.ref);

  return <strong {...rest} ref={composedRefs} class={cx("fui-Strong", props.class)} />;
};

export { Strong };
export type { StrongProps };
