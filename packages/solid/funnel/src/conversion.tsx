import { For, Show, createSignal, omit, onCleanup, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { AspectRatio } from "@solidix/aspect-ratio";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@solidix/dialog";
import { Form, FormControl, FormField, FormLabel, FormMessage, FormSubmit } from "@solidix/form";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { CTAButton } from "./cta-button";
import { dispatchFunnelEvent } from "./events";
import { useFunnelVariant } from "./root";
import type { FunnelElementProps } from "./types";
import { cx } from "./utils";

/* -------------------------------------------------------------------------------------------------
 * Hero
 * -----------------------------------------------------------------------------------------------*/

type HeroMedia = {
  src: string;
  alt: string;
  /** Width/height ratio reserving layout space. Defaults to `16 / 9`. */
  ratio?: number | undefined;
};

type HeroCta = {
  label: string;
  href: string;
};

type HeroProps = Omit<PrimitivePropsWithRef<"div">, "children" | "title"> & {
  eyebrow?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta | undefined;
  media?: HeroMedia | undefined;
  /** Layout. Defaults to `split` (copy beside media). */
  align?: "split" | "centered" | undefined;
};

function useInView(ref: () => HTMLElement | null, onView: () => void): void {
  if (typeof window === "undefined") return;
  if (typeof IntersectionObserver === "undefined") {
    // No observer (tests, old browsers): report once the node mounts.
    const start = () => {
      if (ref()) onView();
      else requestAnimationFrame(start);
    };
    start();
    return;
  }
  const seen = { current: false };
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !seen.current) {
        seen.current = true;
        onView();
        observer.disconnect();
      }
    },
    { threshold: 0.25 },
  );
  const start = () => {
    const node = ref();
    if (node) observer.observe(node);
    else requestAnimationFrame(start);
  };
  start();
  onCleanup(() => observer.disconnect());
}

const Hero: Component<HeroProps> = (props) => {
  const rest = omit(
    props,
    "eyebrow",
    "title",
    "subtitle",
    "primaryCta",
    "secondaryCta",
    "media",
    "align",
    "class",
    "ref",
  );
  const variant = useFunnelVariant();
  let node: HTMLElement | null = null;
  useInView(
    () => node,
    () => {
      if (node) dispatchFunnelEvent(node, "funnel:view", { block: "hero", variant });
    },
  );
  const composedRef = (element: HTMLDivElement | null) => {
    node = element;
    const ref = props.ref;
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  };
  return (
    <Primitive.div
      data-funnel-block="hero"
      data-align={props.align ?? "split"}
      class={cx("fx-hero", props.class)}
      {...rest}
      ref={composedRef}
    >
      <div class="fx-hero-copy">
        <Show when={props.eyebrow}>
          <p class="fx-hero-eyebrow">{props.eyebrow}</p>
        </Show>
        <h1 class="fx-hero-title">{props.title}</h1>
        <Show when={props.subtitle}>
          <p class="fx-hero-subtitle">{props.subtitle}</p>
        </Show>
        <div class="fx-hero-ctas">
          <CTAButton href={props.primaryCta.href}>{props.primaryCta.label}</CTAButton>
          <Show when={props.secondaryCta}>
            <CTAButton
              href={props.secondaryCta!.href}
              variant="secondary"
              class="fx-hero-secondary"
            >
              {props.secondaryCta!.label}
            </CTAButton>
          </Show>
        </div>
      </div>
      <Show when={props.media}>
        <div class="fx-hero-media">
          <AspectRatio ratio={props.media!.ratio ?? 16 / 9} class="fx-hero-frame">
            <img
              class="fx-hero-image"
              src={props.media!.src}
              alt={props.media!.alt}
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </AspectRatio>
        </div>
      </Show>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * OptInForm
 * -----------------------------------------------------------------------------------------------*/

type OptInField = {
  name: string;
  label: string;
  type?: "email" | "text" | "tel" | undefined;
  required?: boolean | undefined;
  autoComplete?: string | undefined;
  placeholder?: string | undefined;
};

type OptInFormProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  fields: OptInField[];
  submitLabel: string;
  privacyNote?: string | undefined;
  successTitle?: string | undefined;
  successMessage?: string | undefined;
  /**
   * Called with submitted values on valid submit. Event detail never carries
   * field values (no PII in analytics), only field names.
   */
  onSubmit?: ((values: Record<string, string>) => void) | undefined;
  id?: string | undefined;
};

const OptInForm: Component<OptInFormProps> = (props) => {
  const rest = omit(
    props,
    "fields",
    "submitLabel",
    "privacyNote",
    "successTitle",
    "successMessage",
    "onSubmit",
    "class",
    "ref",
  );
  const variant = useFunnelVariant();
  const [submitted, setSubmitted] = createSignal(false);

  const handleSubmit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return;
    const values: Record<string, string> = {};
    for (const field of props.fields) {
      const control = form.elements.namedItem(field.name) as HTMLInputElement | null;
      values[field.name] = control?.value ?? "";
    }
    setSubmitted(true);
    dispatchFunnelEvent(form, "funnel:submit", {
      block: "opt-in-form",
      variant,
      fields: props.fields.map((field) => field.name),
    });
    props.onSubmit?.(values);
  };

  return (
    <Primitive.div
      data-funnel-block="opt-in-form"
      class={cx("fx-opt-in-form", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Show
        when={!submitted()}
        fallback={
          <div class="fx-opt-in-success" role="status">
            <p class="fx-opt-in-success-title">{props.successTitle ?? "You're in."}</p>
            <Show when={props.successMessage}>
              <p class="fx-opt-in-success-message">{props.successMessage}</p>
            </Show>
          </div>
        }
      >
        <Form class="fx-opt-in-fields" onSubmit={handleSubmit}>
          <For each={props.fields}>
            {(field) => (
              <FormField class="fx-opt-in-field" name={field.name}>
                <FormLabel class="fx-opt-in-label">
                  {field.label}
                  <Show when={field.required === false}>
                    {" "}
                    <span class="fx-opt-in-optional">(optional)</span>
                  </Show>
                </FormLabel>
                <FormControl
                  class="fx-opt-in-input"
                  type={field.type ?? "text"}
                  required={field.required !== false}
                  autocomplete={field.autoComplete}
                  placeholder={field.placeholder}
                />
                <FormMessage class="fx-opt-in-error" match="valueMissing">
                  {field.label} is required.
                </FormMessage>
                <FormMessage class="fx-opt-in-error" match="typeMismatch">
                  Enter a valid {field.label.toLowerCase()}.
                </FormMessage>
              </FormField>
            )}
          </For>
          <FormSubmit class="fx-cta-button fx-opt-in-submit" data-variant="primary" data-size="lg">
            {props.submitLabel}
          </FormSubmit>
          <Show when={props.privacyNote}>
            <p class="fx-opt-in-privacy">{props.privacyNote}</p>
          </Show>
        </Form>
      </Show>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Countdown
 * -----------------------------------------------------------------------------------------------*/

type CountdownProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  /** Deadline as epoch milliseconds. */
  endsAt: number;
  /** Time source (injectable for tests/SSR). Defaults to `Date.now`. */
  now?: (() => number) | undefined;
  /** Tick interval in ms. Defaults to `1000`. */
  interval?: number | undefined;
  /** Fired once when the deadline passes. */
  onExpire?: (() => void) | undefined;
  caption?: string | undefined;
};

type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

function splitRemaining(ms: number): CountdownParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

const Countdown: Component<CountdownProps> = (props) => {
  const rest = omit(props, "endsAt", "now", "interval", "onExpire", "caption", "class", "ref");
  const clock = () => props.now ?? Date.now;
  const [parts, setParts] = createSignal<CountdownParts>(splitRemaining(props.endsAt - clock()()));
  const [expired, setExpired] = createSignal(props.endsAt - clock()() <= 0);
  const fired = { current: props.endsAt - clock()() <= 0 };

  const tick = () => {
    const remaining = props.endsAt - clock()();
    setParts(splitRemaining(remaining));
    if (remaining <= 0) {
      setExpired(true);
      if (!fired.current) {
        fired.current = true;
        props.onExpire?.();
      }
    }
  };

  if (typeof window !== "undefined") {
    const timer = window.setInterval(tick, props.interval ?? 1000);
    onCleanup(() => window.clearInterval(timer));
  }

  const units: Array<{ key: keyof CountdownParts; label: string }> = [
    { key: "days", label: "Days" },
    { key: "hours", label: "Hours" },
    { key: "minutes", label: "Minutes" },
    { key: "seconds", label: "Seconds" },
  ];

  return (
    <Primitive.div
      data-funnel-block="countdown"
      data-expired={expired() ? "" : undefined}
      class={cx("fx-countdown", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Show when={props.caption}>
        <p class="fx-countdown-caption">{props.caption}</p>
      </Show>
      <div
        class="fx-countdown-units"
        role="timer"
        aria-label={`Time remaining: ${parts().days} days, ${parts().hours} hours, ${parts().minutes} minutes, ${parts().seconds} seconds`}
      >
        <span class="fx-countdown-unit fx-countdown-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentcolor" stroke-width="2" />
            <path
              d="M12 7v5l3.5 2"
              fill="none"
              stroke="currentcolor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <For each={units}>
          {(unit) => (
            <span class="fx-countdown-unit">
              <span class="fx-countdown-value" aria-hidden="true">
                {pad(parts()[unit.key])}
              </span>
              <span class="fx-countdown-label" aria-hidden="true">
                {unit.label}
              </span>
            </span>
          )}
        </For>
      </div>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * StickyBar
 * -----------------------------------------------------------------------------------------------*/

type StickyBarProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  message: string;
  cta: HeroCta;
  /** Scroll depth in px before the bar appears. Defaults to `600`. */
  showAfter?: number | undefined;
  /**
   * Selector for the hero CTA (or any above-the-fold trigger): the bar
   * reveals once it scrolls out of view. Falls back to `showAfter` when the
   * target is missing or IntersectionObserver is unavailable.
   */
  observe?: string | undefined;
};

const StickyBar: Component<StickyBarProps> = (props) => {
  const rest = omit(props, "message", "cta", "showAfter", "observe", "class", "ref");
  const threshold = () => props.showAfter ?? 600;
  const [visible, setVisible] = createSignal(
    typeof window !== "undefined" && window.scrollY > threshold(),
  );

  if (typeof window !== "undefined") {
    // Resolved at mount: same-tree triggers (the hero CTA) are not in the
    // document yet during setup.
    onSettled(() => {
      const target = props.observe ? window.document.querySelector(props.observe) : null;
      if (target && typeof IntersectionObserver !== "undefined") {
        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry) setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
          },
          { threshold: 0 },
        );
        observer.observe(target);
        return () => observer.disconnect();
      }
      const onScroll = () => setVisible(window.scrollY > threshold());
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    });
  }

  return (
    <Primitive.div
      data-funnel-block="sticky-bar"
      data-visible={visible() ? "" : undefined}
      aria-hidden={visible() ? undefined : "true"}
      class={cx("fx-sticky-bar", props.class)}
      {...rest}
      ref={props.ref}
    >
      <p class="fx-sticky-bar-message">{props.message}</p>
      <CTAButton href={props.cta.href} size="md" tabindex={visible() ? undefined : -1}>
        {props.cta.label}
      </CTAButton>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ExitIntent
 * -----------------------------------------------------------------------------------------------*/

type ExitIntentProps = {
  title: string;
  description?: string | undefined;
  children?: JSX.Element | undefined;
  /** Disable the exit listener entirely. Defaults to `false`. */
  disabled?: boolean | undefined;
  /**
   * localStorage key recording a shown popup for frequency capping.
   * Defaults to `"solidix-funnel-exit-intent"`; set to `null` to disable.
   */
  storageKey?: string | null | undefined;
  /** Days before the popup may show again. Defaults to `30`. */
  frequencyCapDays?: number | undefined;
};

const ExitIntent: Component<ExitIntentProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const storageKey = () => props.storageKey ?? "solidix-funnel-exit-intent";

  const wasShown = () => {
    const key = storageKey();
    if (key === null || typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const shownAt = Number.parseInt(raw, 10);
      return Date.now() - shownAt < (props.frequencyCapDays ?? 30) * 86400000;
    } catch {
      return false;
    }
  };

  const markShown = () => {
    const key = storageKey();
    if (key === null || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, String(Date.now()));
    } catch {
      // Private mode: popup still works, just uncapped.
    }
  };

  if (typeof window !== "undefined" && !props.disabled) {
    const coarse = window.matchMedia?.("(pointer: coarse)").matches === true;
    if (!coarse && !wasShown()) {
      const onMouseOut = (event: MouseEvent) => {
        if (event.clientY <= 0 && event.relatedTarget === null) {
          markShown();
          setOpen(true);
          window.document.removeEventListener("mouseout", onMouseOut);
        }
      };
      window.document.addEventListener("mouseout", onMouseOut);
      onCleanup(() => window.document.removeEventListener("mouseout", onMouseOut));
    }
  }

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay class="fx-exit-intent-overlay" />
        <DialogContent class="fx-exit-intent-content" data-funnel-block="exit-intent">
          <DialogTitle class="fx-exit-intent-title">{props.title}</DialogTitle>
          <Show when={props.description}>
            <DialogDescription class="fx-exit-intent-description">
              {props.description}
            </DialogDescription>
          </Show>
          <div class="fx-exit-intent-body">{props.children}</div>
          <DialogClose class="fx-exit-intent-close" aria-label="Close">
            <span aria-hidden="true">×</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Footer
 * -----------------------------------------------------------------------------------------------*/

type FooterLinkKind = "funnel" | "legal" | "support";

type FooterLink = {
  label: string;
  href: string;
  /**
   * Zero-leak containment. `funnel` stays in-page (use `#anchor` hrefs),
   * `legal` opens safely in a new tab, `support` pairs with mailto:/tel: or
   * an `onClick` chat trigger. Defaults to `"funnel"`.
   */
  kind?: FooterLinkKind | undefined;
  /** Support-chat style handler (e.g. open a chat widget). */
  onClick?: ((event: MouseEvent) => void) | undefined;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

type FooterIdentity = {
  name: string;
  address?: string[] | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  phoneHref?: string | undefined;
  registration?: string | undefined;
  hours?: string | undefined;
};

/** Built-in trust glyphs. Payment-brand marks stay consumer-provided. */
type FooterBadgeIcon = "lock" | "shield" | "check" | "card";

type FooterBadge =
  | string
  | {
      label: string;
      icon?: FooterBadgeIcon | JSX.Element | undefined;
    };

type FooterVariant = "utility" | "trust" | "sitemap";

type FooterProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  /** Brand line. Optional when `identity` carries the name. */
  brand?: string | undefined;
  tagline?: string | undefined;
  /**
   * Archetype: `utility` flattens links into one row (paid traffic, lead
   * gen), `trust` pairs link columns with the identity block (high-ticket,
   * fintech, health), `sitemap` mirrors a corporate footer with anchors
   * (DTC, enterprise). Defaults to `"sitemap"`.
   */
  variant?: FooterVariant | undefined;
  columns?: FooterColumn[] | undefined;
  /** Verified-business block for the trust archetype. */
  identity?: FooterIdentity | undefined;
  /** Trust pills (payment badges, seals, support hours). Never social icons. */
  badges?: FooterBadge[] | undefined;
  legal?: string | undefined;
  /** Policy links, always opened safely in a new tab. */
  legalLinks?: FooterLink[] | undefined;
};

/* Fresh element per call: sharing one node across pills would move it. */
function footerBadgeIcon(name: FooterBadgeIcon): JSX.Element {
  switch (name) {
    case "lock":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentcolor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "shield":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentcolor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" />
          <path d="M9 11.6l2.1 2.1 3.9-4" />
        </svg>
      );
    case "check":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentcolor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.2l2.4 2.4 4.6-5" />
        </svg>
      );
    case "card":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentcolor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
  }
}

function isBadgeName(value: unknown): value is FooterBadgeIcon {
  return value === "lock" || value === "shield" || value === "check" || value === "card";
}

const FooterAnchor: Component<{ link: FooterLink; forceLegal?: boolean }> = (props) => {
  const kind = () => (props.forceLegal ? "legal" : (props.link.kind ?? "funnel"));
  const handleClick = (event: MouseEvent) => props.link.onClick?.(event);
  return (
    <a
      class="fx-footer-link"
      href={props.link.href}
      target={kind() === "legal" ? "_blank" : undefined}
      rel={kind() === "legal" ? "noopener noreferrer" : undefined}
      onClick={handleClick}
    >
      {props.link.label}
    </a>
  );
};

const Footer: Component<FooterProps> = (props) => {
  const rest = omit(
    props,
    "brand",
    "tagline",
    "variant",
    "columns",
    "identity",
    "badges",
    "legal",
    "legalLinks",
    "class",
    "ref",
  );
  const variant = () => props.variant ?? "sitemap";
  const flatLinks = () => (props.columns ?? []).flatMap((column) => column.links);
  return (
    <Primitive.div
      data-funnel-block="footer"
      data-variant={variant()}
      class={cx("fx-footer", props.class)}
      {...rest}
      ref={props.ref}
    >
      <div class="fx-footer-main">
        <Show when={props.identity}>
          <div class="fx-footer-identity">
            <p class="fx-footer-identity-name">{props.identity!.name}</p>
            <For each={props.identity!.address ?? []}>
              {(line) => <p class="fx-footer-identity-line">{line}</p>}
            </For>
            <Show when={props.identity!.email}>
              <a class="fx-footer-link" href={`mailto:${props.identity!.email}`}>
                {props.identity!.email}
              </a>
            </Show>
            <Show when={props.identity!.phone}>
              <Show
                when={props.identity!.phoneHref}
                fallback={<p class="fx-footer-identity-line">{props.identity!.phone}</p>}
              >
                <a class="fx-footer-link" href={props.identity!.phoneHref}>
                  {props.identity!.phone}
                </a>
              </Show>
            </Show>
            <Show when={props.identity!.registration}>
              <p class="fx-footer-identity-line">{props.identity!.registration}</p>
            </Show>
            <Show when={props.identity!.hours}>
              <p class="fx-footer-identity-line">{props.identity!.hours}</p>
            </Show>
          </div>
        </Show>
        <Show when={props.brand}>
          <div class="fx-footer-brand">
            <p class="fx-footer-name">{props.brand}</p>
            <Show when={props.tagline}>
              <p class="fx-footer-tagline">{props.tagline}</p>
            </Show>
          </div>
        </Show>
        <Show when={variant() !== "utility" && props.columns?.length}>
          <nav class="fx-footer-nav" aria-label="Footer">
            <For each={props.columns!}>
              {(column) => (
                <div class="fx-footer-column">
                  <p class="fx-footer-heading">{column.heading}</p>
                  <ul class="fx-footer-links">
                    <For each={column.links}>
                      {(link) => (
                        <li>
                          <FooterAnchor link={link} />
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              )}
            </For>
          </nav>
        </Show>
        <Show when={variant() === "utility" && flatLinks().length}>
          <ul class="fx-footer-links-row">
            <For each={flatLinks()}>
              {(link) => (
                <li>
                  <FooterAnchor link={link} />
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
      <Show when={props.badges?.length}>
        <ul class="fx-footer-badges">
          <For each={props.badges!}>
            {(badge) => {
              const label = typeof badge === "string" ? badge : badge.label;
              const icon = typeof badge === "string" ? undefined : badge.icon;
              return (
                <li class="fx-footer-badge">
                  <Show when={icon}>{isBadgeName(icon) ? footerBadgeIcon(icon) : icon}</Show>
                  {label}
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
      <Show when={props.legalLinks?.length}>
        <nav class="fx-footer-legal-nav" aria-label="Legal">
          <For each={props.legalLinks!}>
            {(link) => <FooterAnchor link={link} forceLegal />}
          </For>
        </nav>
      </Show>
      <Show when={props.legal}>
        <p class="fx-footer-legal">{props.legal}</p>
      </Show>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * VideoFrame
 * -----------------------------------------------------------------------------------------------*/

type VideoFrameProps = FunnelElementProps<"figure", HTMLElement> & {
  thumbnail: { src: string; alt: string };
  /** Width/height ratio reserving layout space. Defaults to `16 / 9`. */
  ratio?: number | undefined;
  /** Link target (video URL): renders a play affordance overlay. */
  href?: string | undefined;
  caption?: string | undefined;
};

/**
 * VSL framing: eager 16:9 thumbnail with an optional linked play button.
 * Pair with a `reading` container.
 */
const VideoFrame: Component<VideoFrameProps> = (props) => {
  const rest = omit(props, "thumbnail", "ratio", "href", "caption", "class", "ref");
  return (
    <figure
      data-funnel-block="video-frame"
      class={cx("fx-video-frame", props.class)}
      {...rest}
      ref={props.ref}
    >
      <AspectRatio ratio={props.ratio ?? 16 / 9} class="fx-video-box">
        <img
          class="fx-video-thumbnail"
          src={props.thumbnail.src}
          alt={props.thumbnail.alt}
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <Show when={props.href}>
          <a class="fx-video-play" href={props.href} aria-label="Play video">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" />
              <path d="M27 22l14 10-14 10z" />
            </svg>
          </a>
        </Show>
      </AspectRatio>
      <Show when={props.caption}>
        <figcaption class="fx-video-caption">{props.caption}</figcaption>
      </Show>
    </figure>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { Countdown, ExitIntent, Footer, Hero, OptInForm, StickyBar, VideoFrame };
export type {
  CountdownProps,
  ExitIntentProps,
  FooterBadge,
  FooterBadgeIcon,
  FooterColumn,
  FooterIdentity,
  FooterLink,
  FooterLinkKind,
  FooterProps,
  FooterVariant,
  HeroCta,
  HeroMedia,
  HeroProps,
  OptInField,
  OptInFormProps,
  StickyBarProps,
  VideoFrameProps,
};
