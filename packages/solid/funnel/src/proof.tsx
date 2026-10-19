import { For, Show, createSignal, omit, type Component } from "solid-js";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { cx } from "./utils";

/* -------------------------------------------------------------------------------------------------
 * StarRating
 * -----------------------------------------------------------------------------------------------*/

type StarRatingProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  /** Filled stars, clamped to `0..max`. Supports fractions (e.g. `4.5`). */
  value: number;
  /** Star count. Defaults to `5`. */
  max?: number | undefined;
  /** Accessible label. Defaults to `"{value} out of {max} stars"`. */
  label?: string | undefined;
};

const STAR_PATH =
  "M12 2.6l2.83 6.42 7.07.66-5.32 4.73 1.58 6.93L12 17.77l-6.16 3.57 1.58-6.93L2.1 9.68l7.07-.66L12 2.6z";

function StarRow(props: { count: number; filled: boolean }) {
  return (
    <span class={props.filled ? "fx-star-rating-fill" : "fx-star-rating-track"} aria-hidden="true">
      <For each={Array.from({ length: props.count })}>
        {() => (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        )}
      </For>
    </span>
  );
}

const StarRating: Component<StarRatingProps> = (props) => {
  const rest = omit(props, "value", "max", "label", "class", "ref");
  const max = () => Math.max(1, Math.floor(props.max ?? 5));
  const clamped = () => Math.min(Math.max(props.value, 0), max());
  return (
    <Primitive.div
      data-funnel-block="star-rating"
      role="img"
      aria-label={props.label ?? `${clamped()} out of ${max()} stars`}
      class={cx("fx-star-rating", props.class)}
      {...rest}
      ref={props.ref}
    >
      <StarRow count={max()} filled={false} />
      <span
        class="fx-star-rating-clip"
        style={{ width: `${(clamped() / max()) * 100}%` }}
        aria-hidden="true"
      >
        <StarRow count={max()} filled />
      </span>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * LogoBar
 * -----------------------------------------------------------------------------------------------*/

export type LogoBarLogo = {
  name: string;
  src?: string | undefined;
  href?: string | undefined;
};

type LogoBarProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  /** Heading caption above the row (e.g. "As featured in"). */
  caption?: string | undefined;
  logos: LogoBarLogo[];
};

const LogoBar: Component<LogoBarProps> = (props) => {
  const rest = omit(props, "caption", "logos", "class", "ref");
  return (
    <Primitive.div
      data-funnel-block="logo-bar"
      class={cx("fx-logo-bar", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Show when={props.caption}>
        <p class="fx-logo-bar-caption">{props.caption}</p>
      </Show>
      <Primitive.ul class="fx-logo-bar-row" aria-label={props.caption ?? "Featured logos"}>
        <For each={props.logos}>
          {(logo) => (
            <Primitive.li class="fx-logo-bar-item">
              {logo.href ? (
                <a class="fx-logo-bar-link" href={logo.href}>
                  <LogoMark logo={logo} />
                </a>
              ) : (
                <LogoMark logo={logo} />
              )}
            </Primitive.li>
          )}
        </For>
      </Primitive.ul>
    </Primitive.div>
  );
};

function LogoMark(props: { logo: LogoBarLogo }) {
  return props.logo.src ? (
    <img class="fx-logo-bar-logo" src={props.logo.src} alt={props.logo.name} loading="lazy" />
  ) : (
    <span class="fx-logo-bar-wordmark" aria-label={props.logo.name}>
      {props.logo.name}
    </span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Testimonials
 * -----------------------------------------------------------------------------------------------*/

export type Testimonial = {
  quote: string;
  name: string;
  role?: string | undefined;
  rating?: number | undefined;
};

type TestimonialsProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  items: Testimonial[];
};

function TestimonialCard(props: { item: Testimonial }) {
  return (
    <figure class="fx-testimonial-card">
      <Show when={props.item.rating !== undefined}>
        <StarRating value={props.item.rating!} />
      </Show>
      <blockquote class="fx-testimonial-quote">
        <p>{props.item.quote}</p>
      </blockquote>
      <figcaption class="fx-testimonial-author">
        <span class="fx-testimonial-name">{props.item.name}</span>
        <Show when={props.item.role}>
          <span class="fx-testimonial-role">{props.item.role}</span>
        </Show>
      </figcaption>
    </figure>
  );
}

const Testimonials: Component<TestimonialsProps> = (props) => {
  const rest = omit(props, "items", "class", "ref");
  return (
    <Primitive.div
      data-funnel-block="testimonials"
      class={cx("fx-testimonials", props.class)}
      {...rest}
      ref={props.ref}
    >
      <For each={props.items}>{(item) => <TestimonialCard item={item} />}</For>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TestimonialCarousel
 * -----------------------------------------------------------------------------------------------*/

type TestimonialCarouselProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  items: Testimonial[];
  /** Accessible carousel label. Defaults to `"Customer testimonials"`. */
  label?: string | undefined;
};

const TestimonialCarousel: Component<TestimonialCarouselProps> = (props) => {
  const rest = omit(props, "items", "label", "class", "ref");
  const [index, setIndex] = createSignal(0);
  const count = () => props.items.length;
  const go = (delta: number) => setIndex((current) => (current + delta + count()) % count());
  return (
    <Primitive.div
      data-funnel-block="testimonial-carousel"
      aria-roledescription="carousel"
      aria-label={props.label ?? "Customer testimonials"}
      class={cx("fx-testimonial-carousel", props.class)}
      {...rest}
      ref={props.ref}
    >
      <div class="fx-testimonial-carousel-view" aria-live="polite" aria-atomic="true">
        {/* Single-item For recreates the card per slide so the entry animation replays. */}
        <For each={[index() % count()]}>{(i) => <TestimonialCard item={props.items[i]!} />}</For>
      </div>
      <div class="fx-testimonial-carousel-controls">
        <Primitive.button
          type="button"
          class="fx-testimonial-carousel-button"
          aria-label="Previous testimonial"
          onClick={() => go(-1)}
        >
          <span aria-hidden="true">←</span>
        </Primitive.button>
        <p class="fx-testimonial-carousel-count" aria-hidden="true">
          {index() + 1} / {count()}
        </p>
        <Primitive.button
          type="button"
          class="fx-testimonial-carousel-button"
          aria-label="Next testimonial"
          onClick={() => go(1)}
        >
          <span aria-hidden="true">→</span>
        </Primitive.button>
      </div>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * StatsBar
 * -----------------------------------------------------------------------------------------------*/

export type StatsBarStat = {
  value: string;
  label: string;
};

type StatsBarProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  stats: StatsBarStat[];
};

const StatsBar: Component<StatsBarProps> = (props) => {
  const rest = omit(props, "stats", "class", "ref");
  return (
    <Primitive.div
      data-funnel-block="stats-bar"
      class={cx("fx-stats-bar", props.class)}
      {...rest}
      ref={props.ref}
    >
      <dl class="fx-stats-bar-list">
        <For each={props.stats}>
          {(stat) => (
            <div class="fx-stats-bar-item">
              <dt class="fx-stats-bar-label">{stat.label}</dt>
              <dd class="fx-stats-bar-value">{stat.value}</dd>
            </div>
          )}
        </For>
      </dl>
    </Primitive.div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { LogoBar, StarRating, StatsBar, TestimonialCarousel, Testimonials };
export type {
  LogoBarProps,
  StarRatingProps,
  StatsBarProps,
  TestimonialCarouselProps,
  TestimonialsProps,
};
