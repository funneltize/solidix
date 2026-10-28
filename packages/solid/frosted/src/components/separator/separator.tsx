import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import {
  Separator as SeparatorPrimitive,
  type SeparatorProps as SeparatorPrimitiveProps,
} from "@solidix/separator";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { separatorPropDefs } from "./separator.props";

/** Slot typed for `Separator`'s div props so element-form `render` spreads typecheck. */
const SeparatorSlot = createSlot<HTMLDivElement>("Separator");
/** Slottable selecting the element-form `render` target for child injection. */
const SeparatorSlottable = createSlottable("Separator");

/** Own props of `Separator` derived from `separatorPropDefs` (size, color). */
type SeparatorOwnProps = GetPropDefTypes<typeof separatorPropDefs>;

/**
 * Props passed to a function-form `render` prop: the caller's separator props
 * with the primitive's computed `role`, `aria-orientation`, and
 * `data-orientation` plus the computed `class`, `data-accent-color`, and
 * `children` applied. Explicit caller props still win, matching the
 * primitive's own spread order.
 */
type SeparatorRenderProps = Omit<SeparatorPrimitiveProps, "color" | "ref"> & {
  /** Accent color token written as `data-accent-color` on the rendered element. */
  "data-accent-color"?: string | undefined;
};

/** State argument for a function-form `render` prop. Separator carries no state. */
type SeparatorRenderState = Record<string, never>;

/**
 * `render` prop accepted by `Separator`, mirroring Base UI `useRender`: an
 * element to render as (merged via `Slot`), or a function receiving the merged
 * props.
 */
type SeparatorRenderProp =
  | JSX.Element
  | ((props: SeparatorRenderProps, state: SeparatorRenderState) => JSX.Element);

/**
 * Props for the `Separator` component: prop-def values plus the primitive
 * separator props (`orientation`, `decorative`) and `render`. `ref` is narrowed
 * to the compose-refs callback form (remove-scroll precedent) so it forwards
 * to both the `Slot` and the primitive branches.
 */
interface SeparatorProps extends SeparatorOwnProps, Omit<SeparatorPrimitiveProps, "color" | "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default primitive output. */
  render?: SeparatorRenderProp | undefined;
}

/**
 * Themed divider line. Renders the headless separator with `fui-Separator`
 * sizing and accent color classes; `render` swaps the element like Base UI.
 */
const Separator: Component<SeparatorProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "size", "color");
  // Plain callback, so it satisfies both the compose-refs `Ref` on
  // `SeparatorSlot` and the JSX `ref` on the primitive (remove-scroll
  // precedent).
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that re-instantiates
  // on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const size = () => props.size ?? separatorPropDefs.size.default;
  const color = () => props.color ?? separatorPropDefs.color.default;

  // Base UI `useRender` semantics: the primitive's computed attributes travel
  // with the merged props so `render` output keeps separator semantics. The
  // caller's own props still win, matching the primitive's spread order.
  const orientation = () => {
    const value = props.orientation ?? "horizontal";
    return value === "horizontal" || value === "vertical" ? value : "horizontal";
  };
  const role = () => (props.decorative ? "none" : "separator");
  // `aria-orientation` defaults to `horizontal`, so only vertical needs it.
  const ariaOrientation = () =>
    props.decorative || orientation() !== "vertical" ? undefined : "vertical";
  // `orientation`/`decorative` are consumed above; the primitive strips them
  // too, so they must not leak onto a rendered element as attributes.
  const renderRest = omit(rest, "orientation", "decorative");

  const classes = () =>
    cx("fui-Separator", props.class, size() ? `fui-r-size-${size()}` : undefined);

  if (typeof renderProp === "function") {
    const merged = merge(
      {
        get role() {
          return role();
        },
        get "aria-orientation"() {
          return ariaOrientation();
        },
        get "data-orientation"() {
          return orientation();
        },
      },
      renderRest,
      {
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
      },
    );
    return renderProp(merged as unknown as SeparatorRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it. The
    // render fn runs once at setup, so only statically present children
    // count; dynamic children of the element are not yet inserted then.
    return (
      <SeparatorSlot
        role={role()}
        aria-orientation={ariaOrientation()}
        data-orientation={orientation()}
        {...renderRest}
        class={classes()}
        data-accent-color={color()}
        ref={composedRefs}
      >
        <SeparatorSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </SeparatorSlottable>
      </SeparatorSlot>
    );
  }

  return (
    <SeparatorPrimitive {...rest} class={classes()} data-accent-color={color()} ref={composedRefs}>
      {resolved()}
    </SeparatorPrimitive>
  );
};

export { Separator };
export type { SeparatorProps, SeparatorRenderProp, SeparatorRenderProps, SeparatorRenderState };
