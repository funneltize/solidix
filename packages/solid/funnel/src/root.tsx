import { createContext, omit, useContext, type Component } from "solid-js";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { cx } from "./utils";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

type FunnelContextValue = {
  /** Active A/B variant label, merged into funnel event detail by blocks. */
  variant: string | undefined;
  /** Studio editing mode: blocks render `data-funnel-part` markers. */
  editable: boolean;
};

const FunnelContext = createContext<FunnelContextValue>({ variant: undefined, editable: false });

/** Reads the nearest funnel variant label (set by `Root`). Internal. */
export function useFunnelVariant(): string | undefined {
  return useContext(FunnelContext)?.variant;
}

/** Reads studio editing mode (set by `Root`). Internal. */
export function useFunnelEditable(): boolean {
  return useContext(FunnelContext)?.editable ?? false;
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
  /**
   * Studio editing mode. Blocks render `data-funnel-part` markers (plus
   * `tabindex` affordances on static text) for editor click resolution.
   * Off by default, in which case output is byte-identical to unmarked
   * markup. See the editing contract in PHILOSOPHY.md.
   */
  editable?: boolean | undefined;
};

const Root: Component<RootProps> = (props) => {
  const rest = omit(props, "theme", "cta", "variant", "editable", "class", "ref");
  return (
    <FunnelContext value={{ variant: props.variant, editable: props.editable ?? false }}>
      <Primitive.div
        data-funnel-root=""
        data-funnel-editable={props.editable ? "" : undefined}
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
