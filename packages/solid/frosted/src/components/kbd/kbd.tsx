import { omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { kbdPropDefs } from "./kbd.props";

/** Own props of `Kbd` derived from `kbdPropDefs` (size). */
type KbdOwnProps = GetPropDefTypes<typeof kbdPropDefs>;

/**
 * Props for the `Kbd` component: `size` plus native kbd props.
 * `ref` is narrowed to the compose-refs form (code precedent).
 */
interface KbdProps extends Omit<PropsWithoutColor<"kbd">, "ref">, KbdOwnProps {
  /** Ref forwarded to the rendered `kbd` element. */
  ref?: Ref<HTMLElement> | undefined;
}

/**
 * Themed keyboard key: a `kbd` element with `fui-Kbd` and `fui-r-size-*`
 * classes. `size` has no default, as upstream.
 */
const Kbd: Component<KbdProps> = (props) => {
  const rest = omit(props, "class", "ref", "size");
  const composedRefs = composeRefs(props.ref);
  const size = () => props.size ?? kbdPropDefs.size.default;

  return (
    <kbd {...rest} ref={composedRefs} class={cx("fui-Kbd", props.class, `fui-r-size-${size()}`)} />
  );
};

export { Kbd };
export type { KbdProps };
