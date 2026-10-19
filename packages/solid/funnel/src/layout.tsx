import { Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { CTAButton } from "./cta-button";
import { cx } from "./utils";
import type { FunnelElementProps } from "./types";

/* -------------------------------------------------------------------------------------------------
 * Section
 * -----------------------------------------------------------------------------------------------*/

type SectionTone = "primary" | "subtle" | "inverse";

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

type ContainerSize = "wide" | "standard" | "reading";

type ContainerProps = PrimitivePropsWithRef<"div"> & {
  /**
   * Measure tier: `wide` (proof grids, pricing, tables), `standard` (hero,
   * zig-zag), `reading` (copy, VSL, FAQ). Defaults to `standard`.
   */
  size?: ContainerSize | undefined;
};

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

type EyebrowProps = PrimitivePropsWithRef<"p">;

const Eyebrow: Component<EyebrowProps> = (props) => {
  const rest = omit(props, "class", "ref");
  return (
    <Primitive.p
      data-funnel-block="eyebrow"
      class={cx("fx-eyebrow", props.class)}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SectionHeading
 * -----------------------------------------------------------------------------------------------*/

type SectionHeadingProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  /** Alignment. Defaults to `center`. */
  align?: "center" | "left" | undefined;
};

const SectionHeading: Component<SectionHeadingProps> = (props) => {
  const rest = omit(props, "eyebrow", "title", "description", "align", "class", "ref");
  return (
    <Primitive.div
      data-funnel-block="section-heading"
      data-align={props.align ?? "center"}
      class={cx("fx-section-heading", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Show when={props.eyebrow}>
        <p class="fx-eyebrow">{props.eyebrow}</p>
      </Show>
      <h2 class="fx-section-title">{props.title}</h2>
      <Show when={props.description}>
        <p class="fx-section-lede">{props.description}</p>
      </Show>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Prose
 * -----------------------------------------------------------------------------------------------*/

type ProseProps = PrimitivePropsWithRef<"div"> & {
  children?: JSX.Element | undefined;
};

/**
 * Long-form sales copy: 18px relaxed body, inked skimmer bolds, and
 * highlighter `mark` support. Pair with a `reading` container.
 */
const Prose: Component<ProseProps> = (props) => {
  const rest = omit(props, "class", "ref");
  return (
    <Primitive.div
      data-funnel-block="prose"
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

type HeaderProps = FunnelElementProps<"header", HTMLElement> & {
  /** Wordmark text or logo image. Rendered as text, never a link: zero escape. */
  brand: HeaderBrand;
  cta: { label: string; href: string };
  /**
   * Pins to the viewport top with a blur backdrop on desktop. On mobile the
   * header scrolls away and the sticky bar takes over. Defaults to `false`.
   */
  sticky?: boolean | undefined;
};

const Header: Component<HeaderProps> = (props) => {
  const rest = omit(props, "brand", "cta", "sticky", "class", "ref");
  const brand = () => props.brand;
  return (
    <header
      data-funnel-block="header"
      data-sticky={props.sticky ? "" : undefined}
      class={cx("fx-header", props.class)}
      {...rest}
      ref={props.ref}
    >
      <div class="fx-header-inner">
        <Show
          when={typeof brand() !== "string"}
          fallback={<span class="fx-header-wordmark">{brand() as string}</span>}
        >
          <img
            class="fx-header-logo"
            src={(brand() as { src: string }).src}
            alt={(brand() as { name: string }).name}
          />
        </Show>
        <CTAButton href={props.cta.href} size="md">
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
