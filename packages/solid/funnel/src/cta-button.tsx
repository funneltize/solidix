import { Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { callEventHandler, Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { dispatchFunnelEvent } from "./events";
import { useFunnelEditable, useFunnelVariant } from "./root";
import { cx } from "./utils";

/* -------------------------------------------------------------------------------------------------
 * CTAButton
 * -----------------------------------------------------------------------------------------------*/

type CTAButtonVariant = "primary" | "secondary" | "ghost";
type CTAButtonSize = "md" | "lg";

type CTAButtonCommon = {
  /**
   * Visual weight. `primary` is the single page-level action; use
   * `secondary`/`ghost` for supporting links. Defaults to `primary`.
   */
  variant?: CTAButtonVariant | undefined;
  /** Size. Direct-response CTAs run large; defaults to `lg`. */
  size?: CTAButtonSize | undefined;
  /** Replaces the label with a spinner and blocks activation. */
  loading?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Stretches to full width (always full width on small screens). */
  fullWidth?: boolean | undefined;
  /** Pill shape for consumer/DTC offers. Defaults to `false`. */
  pill?: boolean | undefined;
  /**
   * Editing contract: overrides the `data-funnel-part` value rendered for
   * the label when the Root is `editable` (defaults to `"label"`).
   * Composing blocks pass their prop name (e.g. `"primary-cta"`) so
   * sibling buttons resolve to distinct fields.
   */
  part?: string | undefined;
  /**
   * Editing contract: `data-funnel-part-index` rendered alongside `part`
   * when the Root is `editable`. Composing blocks pass the item position
   * for repeated buttons (e.g. pricing plan CTAs).
   */
  partIndex?: number | string | undefined;
};

type CTAButtonButtonProps = Omit<PrimitivePropsWithRef<"button">, "disabled"> &
  CTAButtonCommon & {
    href?: undefined;
  };

type CTAButtonAnchorProps = PrimitivePropsWithRef<"a"> &
  CTAButtonCommon & {
    /**
     * Renders an anchor instead of a button. When set alongside `disabled`
     * or `loading`, the anchor gets `aria-disabled` and ignores activation.
     */
    href: string;
  };

type CTAButtonProps = CTAButtonButtonProps | CTAButtonAnchorProps;

function ctaAttrs(
  props: {
    variant?: CTAButtonVariant | undefined;
    size?: CTAButtonSize | undefined;
    loading?: boolean | undefined;
    fullWidth?: boolean | undefined;
    pill?: boolean | undefined;
    part?: string | undefined;
    partIndex?: number | string | undefined;
    class?: unknown;
  },
  editable: boolean,
) {
  return {
    "data-funnel-block": "cta-button",
    "data-variant": props.variant ?? "primary",
    "data-size": props.size ?? "lg",
    "data-loading": props.loading ? "" : undefined,
    "data-full-width": props.fullWidth ? "" : undefined,
    "data-pill": props.pill ? "" : undefined,
    "data-funnel-part": editable ? (props.part ?? "label") : undefined,
    "data-funnel-part-index":
      editable && props.partIndex !== undefined ? String(props.partIndex) : undefined,
    class: cx("fx-cta-button", props.class),
  };
}

function ctaLabel(loading: boolean | undefined, children: JSX.Element) {
  return (
    <>
      {loading ? <span class="fx-cta-button-spinner" aria-hidden="true" /> : null}
      <span class="fx-cta-button-label">{children}</span>
    </>
  );
}

function emitCta(
  target: HTMLElement,
  variant: string | undefined,
  href: string | undefined,
  onClick: unknown,
  event: MouseEvent,
  blocked: boolean,
) {
  if (blocked) {
    event.preventDefault();
    return;
  }
  dispatchFunnelEvent(target, "funnel:cta", {
    block: "cta-button",
    variant,
    label: target.textContent?.trim(),
    href,
  });
  callEventHandler(onClick, event);
}

const ButtonCTAButton: Component<CTAButtonButtonProps> = (props) => {
  const rest = omit(
    props,
    "variant",
    "size",
    "loading",
    "disabled",
    "fullWidth",
    "pill",
    "part",
    "partIndex",
    "class",
    "onClick",
  );
  const variant = useFunnelVariant();
  const editable = useFunnelEditable();
  const blocked = () => Boolean(props.disabled || props.loading);
  return (
    <Primitive.button
      {...ctaAttrs(props, editable)}
      type="button"
      disabled={props.disabled}
      aria-disabled={props.loading ? "true" : undefined}
      aria-busy={props.loading ? "true" : undefined}
      {...rest}
      onClick={(event) =>
        emitCta(
          event.currentTarget as HTMLElement,
          variant,
          undefined,
          props.onClick,
          event,
          blocked(),
        )
      }
    >
      {ctaLabel(props.loading, props.children)}
    </Primitive.button>
  );
};

const AnchorCTAButton: Component<CTAButtonAnchorProps> = (props) => {
  const rest = omit(
    props,
    "href",
    "variant",
    "size",
    "loading",
    "disabled",
    "fullWidth",
    "pill",
    "part",
    "partIndex",
    "class",
    "onClick",
  );
  const variant = useFunnelVariant();
  const editable = useFunnelEditable();
  const blocked = () => Boolean(props.disabled || props.loading);
  return (
    <Primitive.a
      {...ctaAttrs(props, editable)}
      href={props.href}
      aria-disabled={blocked() ? "true" : undefined}
      aria-busy={props.loading ? "true" : undefined}
      {...rest}
      onClick={(event) =>
        emitCta(
          event.currentTarget as HTMLElement,
          variant,
          props.href,
          props.onClick,
          event,
          blocked(),
        )
      }
    >
      {ctaLabel(props.loading, props.children)}
    </Primitive.a>
  );
};

/** High-contrast conversion button: an anchor when `href` is set, a button otherwise. */
const CTAButton: Component<CTAButtonProps> = (props) => {
  return props.href !== undefined ? <AnchorCTAButton {...props} /> : <ButtonCTAButton {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * CtaCluster
 * -----------------------------------------------------------------------------------------------*/

type CtaClusterProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  children?: JSX.Element | undefined;
  href: string;
  /**
   * Friction-killer line under the button, resolving the top unspoken
   * objection at click hesitation (e.g. "Free for 14 days, no card required").
   */
  microcopy?: string | undefined;
  size?: CTAButtonSize | undefined;
  pill?: boolean | undefined;
  fullWidth?: boolean | undefined;
  onClick?: CTAButtonAnchorProps["onClick"] | undefined;
};

/**
 * High-yield CTA cluster: action button plus friction-killer microcopy in
 * one centered stack.
 */
const CtaCluster: Component<CtaClusterProps> = (props) => {
  const rest = omit(
    props,
    "href",
    "microcopy",
    "size",
    "pill",
    "fullWidth",
    "onClick",
    "class",
    "ref",
  );
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="cta-cluster"
      class={cx("fx-cta-cluster", props.class)}
      {...rest}
      ref={props.ref}
    >
      <CTAButton
        href={props.href}
        size={props.size}
        pill={props.pill}
        fullWidth={props.fullWidth}
        onClick={props.onClick}
      >
        {props.children}
      </CTAButton>
      <Show when={props.microcopy}>
        <p
          class="fx-cta-cluster-microcopy"
          data-funnel-part={editable ? "microcopy" : undefined}
          tabindex={editable ? 0 : undefined}
        >
          {props.microcopy}
        </p>
      </Show>
    </Primitive.div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { CTAButton, CtaCluster };
export type {
  CTAButtonAnchorProps,
  CTAButtonButtonProps,
  CTAButtonProps,
  CTAButtonSize,
  CTAButtonVariant,
  CtaClusterProps,
};
