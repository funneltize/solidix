import { omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";

/**
 * Props for the `Em` component: native em props.
 * `ref` is narrowed to the compose-refs form (code precedent).
 */
interface EmProps extends Omit<PropsWithoutColor<"em">, "ref"> {
  /** Ref forwarded to the rendered `em` element. */
  ref?: Ref<HTMLElement> | undefined;
}

/** Themed emphasis: an `em` element with the `fui-Em` class, as upstream. */
const Em: Component<EmProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const composedRefs = composeRefs(props.ref);

  return <em {...rest} ref={composedRefs} class={cx("fui-Em", props.class)} />;
};

export { Em };
export type { EmProps };
