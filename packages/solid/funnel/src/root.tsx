import { createContext, createSignal, omit, useContext, type Component } from "solid-js";
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
  /** Element portaled funnel blocks mount into, scoped inside this Root. */
  portalContainer: () => HTMLElement | undefined;
};

const FunnelContext = createContext<FunnelContextValue>({
  variant: undefined,
  editable: false,
  portalContainer: () => undefined,
});

/** Reads the nearest funnel variant label (set by `Root`). Internal. */
export function useFunnelVariant(): string | undefined {
  return useContext(FunnelContext)?.variant;
}

/**
 * Reads the scoped portal container of the nearest `Root`: the element
 * portaled funnel blocks (the exit dialog) mount into, so they inherit
 * the funnel's token scope instead of landing on `document.body`.
 * Undefined outside a Root, where blocks portal to the body as before.
 * Internal.
 */
export function useFunnelPortalContainer(): HTMLElement | undefined {
  return useContext(FunnelContext)?.portalContainer();
}

/** Reads studio editing mode (set by `Root`). Internal. */
export function useFunnelEditable(): boolean {
  return useContext(FunnelContext)?.editable ?? false;
}

/** Props for the Root component. */
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

/**
 * Funnel page root: scopes `data-funnel-theme`/`data-cta` and provides variant and Studio-editing context to descendant blocks.
 */
const Root: Component<RootProps> = (props) => {
  const rest = omit(props, "theme", "cta", "variant", "editable", "class", "ref", "children");
  const [portalContainer, setPortalContainer] = createSignal<HTMLElement | undefined>(undefined);
  return (
    <FunnelContext
      value={{
        variant: props.variant,
        editable: props.editable ?? false,
        portalContainer,
      }}
    >
      <Primitive.div
        data-funnel-root=""
        data-funnel-editable={props.editable ? "" : undefined}
        data-funnel-theme={props.theme === "dark" ? "dark" : undefined}
        data-cta={props.cta && props.cta !== "orange" ? props.cta : undefined}
        class={cx("fx-root", props.class)}
        {...rest}
        ref={props.ref}
      >
        {props.children}
        {/* Scoped portal host: portaled blocks mount here, inside the
            Root's token scope, instead of on document.body. `display:
            contents` in blocks.css keeps it out of layout; its children
            are fixed-position overlays. */}
        <div
          data-funnel-portal=""
          class="fx-portal-host"
          ref={(node: HTMLDivElement | null) => setPortalContainer(node ?? undefined)}
        />
      </Primitive.div>
    </FunnelContext>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { Root };
export type { RootProps };
