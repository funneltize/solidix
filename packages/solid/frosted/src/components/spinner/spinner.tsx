import { children, For, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { spinnerPropDefs } from "./spinner.props";

/** Own props of `Spinner` derived from `spinnerPropDefs`. */
type SpinnerOwnProps = GetPropDefTypes<typeof spinnerPropDefs>;

/**
 * Props for the `Spinner` component: span props plus spinner prop-def values.
 * `ref` is narrowed to the compose-refs callback form.
 */
interface SpinnerProps extends Omit<PropsWithoutColor<"span">, "ref">, SpinnerOwnProps {
  /** Ref forwarded to the rendered spinner element. */
  ref?: Ref<HTMLSpanElement> | undefined;
}

/** Number of rotating leaves in the spinner glyph, matching upstream. */
const SPINNER_LEAF_COUNT = 8;

/**
 * Loading spinner. Upstream behavior: when `loading` is false the children
 * render bare with no wrapper; when `loading` is true without children a
 * bare spinner renders; with children the spinner overlays the dimmed,
 * `aria-hidden`, `inert` children.
 */
const Spinner: Component<SpinnerProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "size", "loading");
  const memo = children(() => props.children);
  const content = (): JSX.Element | undefined => {
    const value = memo();
    if (value === undefined || value === null) return undefined;
    const resolved = Array.isArray(value) ? (value.length > 0 ? value : undefined) : value;
    return resolved as unknown as JSX.Element | undefined;
  };
  // Hoisted to setup: nested JSX re-evaluates on children reads, and a fresh
  // array identity per read would recreate the leaves each time.
  const leaves = Array.from({ length: SPINNER_LEAF_COUNT });
  const composedRefs = composeRefs(props.ref);

  const size = () => props.size ?? spinnerPropDefs.size.default;
  const loading = () => props.loading ?? spinnerPropDefs.loading.default;

  // Render fn called inside the JSX below, never a hoisted subtree: the
  // spinner glyph itself. Upstream spreads the remaining props onto this span
  // in both branches, so `style` flows through untouched in the bare branch
  // while the overlay positioning replaces it in the overlay branch.
  const spinner = (overlay: boolean) => (
    <span
      {...rest}
      ref={composedRefs}
      style={
        overlay
          ? {
              position: "absolute",
              inset: "0",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            }
          : undefined
      }
      class={cx("fui-Spinner", `fui-r-size-${size()}`, props.class)}
    >
      <For each={leaves}>{() => <span class="fui-SpinnerLeaf" />}</For>
    </span>
  );

  return (
    <>
      {(() => {
        const kids = content();
        // Upstream `if (!loading) return children`: bare passthrough.
        if (!loading()) return kids;
        if (kids === undefined) return spinner(false);
        return (
          <span style={{ display: "inline-flex", position: "relative" }}>
            <span inert aria-hidden="true" style={{ opacity: 0.5 }}>
              {kids}
            </span>
            {spinner(true)}
          </span>
        );
      })()}
    </>
  );
};

export { Spinner };
export type { SpinnerProps };
