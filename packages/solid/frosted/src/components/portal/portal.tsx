import { children, merge, omit, Show, type Component } from "solid-js";
import { Portal as SolidPortal, type JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import type { PropsWithoutColor } from "../../helpers/props";

/** Slot typed for `Portal` div props. */
const PortalSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "Portal",
);
/** Slottable selecting the element-form `render` target for child injection. */
const PortalSlottable = createSlottable("Portal");

/**
 * `render` prop accepted by `Portal`, mirroring Base UI `useRender`: an
 * element to render as (merged via `Slot`), or a function receiving the
 * merged props.
 */
type PortalRenderProp = JSX.Element | ((props: PropsWithoutColor<"div">) => JSX.Element);

/** Props for the `Portal` component. */
interface PortalProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /**
   * An optional container where the portaled content should be appended.
   * Upstream also admits `DocumentFragment`; Solid portals mount into
   * elements only, so fragments are not accepted.
   */
  container?: Element | null | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: PortalRenderProp | undefined;
}

/**
 * Renders a `div` (or the `render` override) into `container`
 * (`document.body` by default). Renders nothing when no container is
 * available (SSR without an explicit container).
 *
 * Upstream: `portal.tsx` (`Portal`) at whopio/frosted-ui commit `56787900bfe0`.
 */
const Portal: Component<PortalProps> = (props) => {
  const rest = omit(props, "children", "ref", "render", "container");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const container = (): Element | undefined => {
    if (props.container) return props.container;
    if (typeof document === "undefined") return undefined;
    return document.body;
  };

  const element = () => {
    if (typeof renderProp === "function") {
      const merged = merge(rest, {
        get children() {
          return resolved();
        },
        get ref() {
          return composedRefs;
        },
      });
      return renderProp(merged as unknown as PropsWithoutColor<"div">);
    }
    if (renderProp) {
      // Base UI `useRender` semantics: the element keeps its own children
      // when it has any, otherwise the component's children render inside it.
      return (
        <PortalSlot {...rest} ref={composedRefs}>
          <PortalSlottable child={renderProp}>
            {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
          </PortalSlottable>
        </PortalSlot>
      );
    }
    return (
      <div {...rest} ref={composedRefs}>
        {resolved()}
      </div>
    );
  };

  return (
    <Show when={container()} keyed>
      {(mount) => <SolidPortal mount={mount}>{element()}</SolidPortal>}
    </Show>
  );
};

export { Portal };
export type { PortalProps, PortalRenderProp };
