import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import type { PropsWithoutColor } from "../../helpers/props";

/**
 * Hiding styles for visually-hidden content (Bootstrap visually-hidden
 * mixin). Numeric React values are strings here: Solid applies style
 * objects via `setProperty`, which needs explicit units.
 */
const VISUALLY_HIDDEN_STYLES: JSX.CSSProperties = {
  position: "absolute",
  border: "0",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  "white-space": "nowrap",
  "word-wrap": "normal",
};

/** Slot typed for `VisuallyHidden` span props. */
const VisuallyHiddenSlot = createSlot<
  HTMLSpanElement,
  Omit<PropsWithoutColor<"span">, "children" | "ref">
>("VisuallyHidden");
/** Slottable selecting the element-form `render` target for child injection. */
const VisuallyHiddenSlottable = createSlottable("VisuallyHidden");

/**
 * `render` prop accepted by `VisuallyHidden`, mirroring Base UI `useRender`:
 * an element to render as (merged via `Slot`), or a function receiving
 * the merged props.
 */
type VisuallyHiddenRenderProp = JSX.Element | ((props: PropsWithoutColor<"span">) => JSX.Element);

/** Props for the `VisuallyHidden` component. */
interface VisuallyHiddenProps extends Omit<PropsWithoutColor<"span">, "ref" | "style"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLSpanElement> | undefined;
  /**
   * Additional styles merged over the hiding styles.
   * Narrowed to object form (parts merging base styles cannot spread strings).
   */
  style?: JSX.CSSProperties | undefined;
  /** Element or render function overriding the default `span` output. */
  render?: VisuallyHiddenRenderProp | undefined;
}

/**
 * Hides content visually while keeping it available to assistive
 * technology. Caller styles merge over the hiding styles.
 *
 * Upstream: `visually-hidden.tsx` (`VisuallyHidden`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const VisuallyHidden: Component<VisuallyHiddenProps> = (props) => {
  const rest = omit(props, "children", "ref", "render", "style");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const style = () => ({ ...VISUALLY_HIDDEN_STYLES, ...props.style });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get style() {
        return style();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as PropsWithoutColor<"span">);
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <VisuallyHiddenSlot {...rest} style={style()} ref={composedRefs}>
        <VisuallyHiddenSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </VisuallyHiddenSlottable>
      </VisuallyHiddenSlot>
    );
  }

  return (
    <span {...rest} style={style()} ref={composedRefs}>
      {resolved()}
    </span>
  );
};

export { VISUALLY_HIDDEN_STYLES, VisuallyHidden };
export type { VisuallyHiddenProps, VisuallyHiddenRenderProp };
