import { createSignal, omit, type Component } from "solid-js";
import { Portal as SolidPortal } from "@solidjs/web";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { useLayoutEffect } from "@solidix/use-layout-effect";

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalProps = PrimitivePropsWithRef<"div"> & {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: Element | DocumentFragment | null | undefined;
};

const Portal: Component<PortalProps> = (props) => {
  const rest = omit(props, "container", "children", "ref");
  const [mounted, setMounted] = createSignal(false);
  useLayoutEffect(() => {
    setMounted(true);
  });

  const container = () => props.container || (mounted() && globalThis?.document?.body);

  return (
    <>
      {(() => {
        const target = container();
        return target ? (
          // Solid types `mount` as `Element`; fragments work at runtime.
          <SolidPortal mount={target as Element}>
            <Primitive.div {...rest} ref={props.ref}>
              {props.children}
            </Primitive.div>
          </SolidPortal>
        ) : null;
      })()}
    </>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  Portal,
  //
  Portal as Root,
};
export type { PortalProps };
