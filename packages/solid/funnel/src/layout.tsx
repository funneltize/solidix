import { Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { CTAButton } from "./cta-button";
import { useFunnelEditable } from "./root";
import { cx } from "./utils";
import type { FunnelElementProps } from "./types";

/* -------------------------------------------------------------------------------------------------
 * Section
 * -----------------------------------------------------------------------------------------------*/

/** Section surface treatment. */
type SectionTone = "primary" | "subtle" | "inverse";

/** Props for the Section component. */
type SectionProps = FunnelElementProps<"section", HTMLElement> & {
  /**
   * Background treatment. Alternate `primary`/`subtle` down the page for
   * chapter breaks; reserve `inverse` for the mechanism reveal.
   * Defaults to `primary`.
   */
  tone?: SectionTone | undefined;
  /** Tight padding for strips (trust bar, footer). Defaults to `false`. */
  compact?: boolean | undefined;
};

/** Full-bleed section band with a tone and vertical rhythm for stacking page chapters. */
const Section: Component<SectionProps> = (props) => {
  const rest = omit(props, "tone", "compact", "class", "ref");
  return (
    <section
      data-funnel-block="section"
      data-tone={props.tone ?? "primary"}
      data-compact={props.compact ? "" : undefined}
      class={cx("fx-section", props.class)}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Container
 * -----------------------------------------------------------------------------------------------*/

/** Container max width. */
type ContainerSize = "wide" | "standard" | "reading";

/** Props for the Container component. */
type ContainerProps = PrimitivePropsWithRef<"div"> & {
  /**
   * Measure tier: `wide` (proof grids, pricing, tables), `standard` (hero,
   * zig-zag), `reading` (copy, VSL, FAQ). Defaults to `standard`.
   */
  size?: ContainerSize | undefined;
};

/** Centered measure wrapper; `size` picks the wide/standard/reading tier. */
const Container: Component<ContainerProps> = (props) => {
  const rest = omit(props, "size", "class", "ref");
  return (
    <Primitive.div
      data-funnel-block="container"
      data-size={props.size ?? "standard"}
      class={cx("fx-container", props.class)}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Eyebrow
 * -----------------------------------------------------------------------------------------------*/

/** Props for the Eyebrow component. */
type EyebrowProps = PrimitivePropsWithRef<"p">;

/** Small-caps kicker label rendered above a section heading. */
const Eyebrow: Component<EyebrowProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.p
      data-funnel-block="eyebrow"
      data-funnel-part={editable ? "text" : undefined}
      tabindex={editable ? 0 : undefined}
      class={cx("fx-eyebrow", props.class)}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SectionHeading
 * -----------------------------------------------------------------------------------------------*/

/** Props for the SectionHeading component. */
type SectionHeadingProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  /** Alignment. Defaults to `center`. */
  align?: "center" | "left" | undefined;
};

/** Centered eyebrow/title/description heading block for a section. */
const SectionHeading: Component<SectionHeadingProps> = (props) => {
  const rest = omit(props, "eyebrow", "title", "description", "align", "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="section-heading"
      data-align={props.align ?? "center"}
      class={cx("fx-section-heading", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Show when={props.eyebrow}>
        <p
          class="fx-eyebrow"
          data-funnel-part={editable ? "eyebrow" : undefined}
          tabindex={editable ? 0 : undefined}
        >
          {props.eyebrow}
        </p>
      </Show>
      <h2
        class="fx-section-title"
        data-funnel-part={editable ? "title" : undefined}
        tabindex={editable ? 0 : undefined}
      >
        {props.title}
      </h2>
      <Show when={props.description}>
        <p
          class="fx-section-lede"
          data-funnel-part={editable ? "description" : undefined}
          tabindex={editable ? 0 : undefined}
        >
          {props.description}
        </p>
      </Show>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Prose
 * -----------------------------------------------------------------------------------------------*/

/** Props for the Prose component. */
type ProseProps = PrimitivePropsWithRef<"div"> & {
  children?: JSX.Element | undefined;
};

/**
 * Long-form sales copy: 18px relaxed body, inked skimmer bolds, and
 * highlighter `mark` support. Pair with a `reading` container.
 */
const Prose: Component<ProseProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="prose"
      data-funnel-part={editable ? "text" : undefined}
      tabindex={editable ? 0 : undefined}
      class={cx("fx-prose", props.class)}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

type HeaderBrand = string | { src: string; name: string };

/** Props for the Header component. */
type HeaderProps = FunnelElementProps<"header", HTMLElement> & {
  /** Wordmark text or logo image. Rendered as text, never a link: zero escape. */
  brand: HeaderBrand;
  cta: { label: string; href: string };
  /**
   * Pins to the viewport top with a blur backdrop on desktop. On mobile the
   * header scrolls away and the sticky bar takes over. Defaults to `false`.
   */
  sticky?: boolean | undefined;
  /**
   * Controlled visibility for scroll reveals: one external signal can drive
   * the header and the sticky bar together. `false` hides the bar from sight,
   * assistive tech, and tab order; omitted or `true` shows it.
   */
  visible?: boolean | undefined;
};

/** Slim brand bar with wordmark, nav links, and CTA; scrolls away on mobile in favor of the sticky bar. */
const Header: Component<HeaderProps> = (props) => {
  const rest = omit(props, "brand", "cta", "sticky", "visible", "class", "ref");
  const brand = () => props.brand;
  const editable = useFunnelEditable();
  const hidden = () => props.visible === false;
  return (
    <header
      data-funnel-block="header"
      data-sticky={props.sticky ? "" : undefined}
      data-hidden={hidden() ? "" : undefined}
      aria-hidden={hidden() ? "true" : undefined}
      class={cx("fx-header", props.class)}
      {...rest}
      ref={props.ref}
    >
      <div class="fx-header-inner">
        <Show
          when={typeof brand() !== "string"}
          fallback={
            <span
              class="fx-header-wordmark"
              data-funnel-part={editable ? "brand" : undefined}
              tabindex={editable ? 0 : undefined}
            >
              {brand() as string}
            </span>
          }
        >
          <img
            class="fx-header-logo"
            src={(brand() as { src: string }).src}
            alt={(brand() as { name: string }).name}
            loading="eager"
            decoding="async"
            data-funnel-part={editable ? "brand" : undefined}
            tabindex={editable ? 0 : undefined}
          />
        </Show>
        <CTAButton href={props.cta.href} size="md" tabindex={hidden() ? -1 : undefined} part="cta">
          {props.cta.label}
        </CTAButton>
      </div>
    </header>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { Container, Eyebrow, Header, Prose, Section, SectionHeading };
export type {
  ContainerProps,
  ContainerSize,
  EyebrowProps,
  HeaderProps,
  ProseProps,
  SectionHeadingProps,
  SectionProps,
  SectionTone,
};
