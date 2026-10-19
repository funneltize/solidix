import { createContext, omit, useContext, type Component } from "solid-js";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { cx } from "./utils";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

type FunnelContextValue = {
  /** Active A/B variant label, merged into funnel event detail by blocks. */
  variant: string | undefined;
};

const FunnelContext = createContext<FunnelContextValue>({ variant: undefined });

/** Reads the nearest funnel variant label (set by `Root`). Internal. */
export function useFunnelVariant(): string | undefined {
  return useContext(FunnelContext)?.variant;
}

type RootProps = PrimitivePropsWithRef<"div"> & {
  /**
   * Theme scope. `dark` sets `data-funnel-theme="dark"` (see `tokens.css`);
   * `light` is the default and sets no attribute.
   */
  theme?: "light" | "dark" | undefined;
  /**
   * Isolation-color hue for the page CTA. `orange` is the default and sets
   * no attribute; `emerald` suits fintech/health, `cobalt` enterprise/medical.
   */
  cta?: "orange" | "emerald" | "cobalt" | undefined;
  /** A/B variant label merged into `detail.variant` of funnel events. */
  variant?: string | undefined;
};

const Root: Component<RootProps> = (props) => {
  const rest = omit(props, "theme", "cta", "variant", "class", "ref");
  return (
    <FunnelContext value={{ variant: props.variant }}>
      <Primitive.div
        data-funnel-root=""
        data-funnel-theme={props.theme === "dark" ? "dark" : undefined}
        data-cta={props.cta && props.cta !== "orange" ? props.cta : undefined}
        class={cx("fx-root", props.class)}
        {...rest}
        ref={props.ref}
      />
    </FunnelContext>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { Root };
export type { RootProps };
