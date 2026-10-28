import { children, omit, onSettled, type Component } from "solid-js";
import { useId } from "@solidix/id";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";

/** Puffiness (blur radius) steps for the shine light filter. */
type ShinePuffyness = "0.5" | "0.75" | "1" | "1.25" | "1.5" | "1.75" | "2";

/**
 * Props for the `Shine` component: native div props plus the puffiness
 * of the specular light filter.
 */
interface ShineProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered wrapper `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Blur radius of the specular light filter. @default '1' */
  puffyness?: ShinePuffyness | undefined;
}

/**
 * Pointer-tracked specular shine over its children: an SVG light filter
 * whose point light follows the pointer (and re-anchors on scroll).
 *
 * Upstream: `shine.tsx` (`Shine`) at whopio/frosted-ui commit `56787900bfe0`.
 */
const Shine: Component<ShineProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "puffyness");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Minted in setup: identity must stay stable across renders.
  const filterId = useId();

  let filterElement: SVGFilterElement | null = null;
  let childrenWrapper: HTMLDivElement | null = null;
  const mouse = { x: 0, y: 0 };

  onSettled(() => {
    const wrapper = childrenWrapper;
    const filter = filterElement;
    const lightElement = filter?.querySelector("fePointLight");
    if (!filter || !wrapper || !lightElement) return;

    const onPointerMove = (event: PointerEvent) => {
      const childrenBox = wrapper.getBoundingClientRect();
      mouse.x = event.pageX - window.scrollX;
      mouse.y = event.pageY - window.scrollY;
      lightElement.setAttribute("y", (mouse.y - childrenBox.top).toString());
      lightElement.setAttribute("x", (mouse.x - childrenBox.left).toString());
    };

    const onScroll = () => {
      const childrenBox = wrapper.getBoundingClientRect();
      lightElement.setAttribute("y", (mouse.y - childrenBox.top).toString());
      lightElement.setAttribute("x", (mouse.x - childrenBox.left).toString());
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("scroll", onScroll);
    };
  });

  return (
    <div {...rest} ref={composedRefs} class={cx("fui-Shine", props.class)}>
      <svg width="0" height="0" class="fui-ShineSvgFilter">
        <filter
          id={filterId}
          ref={(el) => {
            filterElement = el;
          }}
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation={props.puffyness ?? "1"} />
          <feSpecularLighting
            result="light-source"
            // represents the height of the surface for a light filter primitive
            surfaceScale="2"
            // The bigger the value the bigger the reflection
            specularConstant="0.5"
            // controls the focus for the light source. The bigger the value the brighter the light
            specularExponent="300"
            lighting-color="#666666"
          >
            <fePointLight x="60" y="69" z="300" />
          </feSpecularLighting>
          <feComposite result="reflections" in="light-source" in2="SourceAlpha" operator="in" />
          <feComposite in="SourceGraphic" in2="reflections" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
      </svg>
      <div
        style={{ filter: `url(#${filterId})`, isolation: "isolate" }}
        ref={(el) => {
          childrenWrapper = el;
        }}
      >
        {resolved()}
      </div>
    </div>
  );
};

export { Shine };
export type { ShineProps, ShinePuffyness };
