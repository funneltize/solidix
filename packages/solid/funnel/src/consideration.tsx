import { For, Show, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@solidix/accordion";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from "@solidix/radio-group";
import { CTAButton } from "./cta-button";
import { useFunnelEditable } from "./root";
import { cx } from "./utils";

/* -------------------------------------------------------------------------------------------------
 * Benefits
 * -----------------------------------------------------------------------------------------------*/

/** One benefit row rendered by the Benefits component. */
type BenefitItem = {
  title: string;
  description?: string | undefined;
  icon?: JSX.Element | undefined;
  /** Product visual: turns the item into a 50/50 zig-zag row. */
  media?: { src: string; alt: string } | undefined;
};

/** Props for the Benefits component. */
type BenefitsProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  items: BenefitItem[];
};

/** Benefit list with check icons, alternating zig-zag rows when items carry media. */
const Benefits: Component<BenefitsProps> = (props) => {
  const rest = omit(props, "items", "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="benefits"
      class={cx("fx-benefits", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Primitive.ul class="fx-benefits-list">
        <For each={props.items}>
          {(item, index) => (
            <Primitive.li class="fx-benefits-item" data-media={item.media ? "" : undefined}>
              <span class="fx-benefits-marker" aria-hidden="true">
                {item.icon ?? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 12.5l5 5L20 6.5"
                      fill="none"
                      stroke="currentcolor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span class="fx-benefits-copy">
                <span
                  class="fx-benefits-title"
                  data-funnel-part={editable ? "title" : undefined}
                  data-funnel-part-index={editable ? String(index()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {item.title}
                </span>
                <Show when={item.description}>
                  <span
                    class="fx-benefits-description"
                    data-funnel-part={editable ? "description" : undefined}
                    data-funnel-part-index={editable ? String(index()) : undefined}
                    tabindex={editable ? 0 : undefined}
                  >
                    {item.description}
                  </span>
                </Show>
              </span>
              <Show when={item.media}>
                <span class="fx-benefits-media">
                  <img
                    src={item.media!.src}
                    alt={item.media!.alt}
                    loading="lazy"
                    data-funnel-part={editable ? "media" : undefined}
                    data-funnel-part-index={editable ? String(index()) : undefined}
                    tabindex={editable ? 0 : undefined}
                  />
                </span>
              </Show>
            </Primitive.li>
          )}
        </For>
      </Primitive.ul>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * HowItWorks
 * -----------------------------------------------------------------------------------------------*/

/** One numbered step rendered by HowItWorks. */
type HowItWorksStep = {
  title: string;
  description?: string | undefined;
};

/** Props for the HowItWorks component. */
type HowItWorksProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  steps: HowItWorksStep[];
};

/** Numbered step sequence explaining how the offer works. */
const HowItWorks: Component<HowItWorksProps> = (props) => {
  const rest = omit(props, "steps", "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="how-it-works"
      class={cx("fx-how-it-works", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Primitive.ol class="fx-how-it-works-list">
        <For each={props.steps}>
          {(step, index) => (
            <Primitive.li class="fx-how-it-works-step">
              <span class="fx-how-it-works-copy">
                <span
                  class="fx-how-it-works-title"
                  data-funnel-part={editable ? "title" : undefined}
                  data-funnel-part-index={editable ? String(index()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {step.title}
                </span>
                <Show when={step.description}>
                  <span
                    class="fx-how-it-works-description"
                    data-funnel-part={editable ? "description" : undefined}
                    data-funnel-part-index={editable ? String(index()) : undefined}
                    tabindex={editable ? 0 : undefined}
                  >
                    {step.description}
                  </span>
                </Show>
              </span>
            </Primitive.li>
          )}
        </For>
      </Primitive.ol>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Pricing
 * -----------------------------------------------------------------------------------------------*/

/** Billing period toggle option. */
type BillingPeriod = "monthly" | "annual";

/** One pricing tier rendered by the Pricing component. */
type PricingPlan = {
  name: string;
  /** Price line per billing period, e.g. "$19/mo". */
  monthly: string;
  annual?: string | undefined;
  blurb?: string | undefined;
  cta: { label: string; href: string };
  features: string[];
  highlighted?: boolean | undefined;
  badge?: string | undefined;
};

/** Props for the Pricing component. */
type PricingProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  plans: PricingPlan[];
  /** Billing periods offered. Defaults to both. */
  periods?: BillingPeriod[] | undefined;
  defaultBilling?: BillingPeriod | undefined;
  billing?: BillingPeriod | undefined;
  onBillingChange?: ((billing: BillingPeriod) => void) | undefined;
  annualNote?: string | undefined;
};

/** Offer stack with a monthly/annual billing toggle and a featured plan. */
const Pricing: Component<PricingProps> = (props) => {
  const rest = omit(
    props,
    "plans",
    "periods",
    "defaultBilling",
    "billing",
    "onBillingChange",
    "annualNote",
    "class",
    "ref",
  );
  const editable = useFunnelEditable();
  const periods = () => props.periods ?? (["monthly", "annual"] as BillingPeriod[]);
  const [internal, setInternal] = createSignal<BillingPeriod>(props.defaultBilling ?? "annual");
  const billing = () => props.billing ?? internal();
  const setBilling = (next: BillingPeriod) => {
    if (props.billing === undefined) setInternal(next);
    props.onBillingChange?.(next);
  };
  const priceFor = (plan: PricingPlan) =>
    billing() === "annual" ? (plan.annual ?? plan.monthly) : plan.monthly;
  return (
    <Primitive.div
      data-funnel-block="pricing"
      class={cx("fx-pricing", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Show when={periods().length > 1}>
        <RadioGroup
          class="fx-pricing-toggle"
          aria-label="Billing period"
          value={billing()}
          onValueChange={(value) => setBilling(value as BillingPeriod)}
          orientation="horizontal"
        >
          <For each={periods()}>
            {(period) => (
              <RadioGroupItem class="fx-pricing-toggle-option" value={period}>
                <RadioGroupIndicator class="fx-pricing-toggle-dot" />
                <span class="fx-pricing-toggle-label">
                  {period === "annual" ? "Annual" : "Monthly"}
                </span>
              </RadioGroupItem>
            )}
          </For>
        </RadioGroup>
      </Show>
      <div class="fx-pricing-plans">
        <For each={props.plans}>
          {(plan, planIndex) => (
            <article class="fx-pricing-plan" data-highlighted={plan.highlighted ? "" : undefined}>
              <Show when={plan.badge}>
                <p
                  class="fx-pricing-badge"
                  data-funnel-part={editable ? "badge" : undefined}
                  data-funnel-part-index={editable ? String(planIndex()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {plan.badge}
                </p>
              </Show>
              <h3
                class="fx-pricing-name"
                data-funnel-part={editable ? "name" : undefined}
                data-funnel-part-index={editable ? String(planIndex()) : undefined}
                tabindex={editable ? 0 : undefined}
              >
                {plan.name}
              </h3>
              <p
                class="fx-pricing-price"
                data-funnel-part={editable ? "price" : undefined}
                data-funnel-part-index={editable ? String(planIndex()) : undefined}
                tabindex={editable ? 0 : undefined}
              >
                {priceFor(plan)}
              </p>
              <Show when={plan.blurb}>
                <p
                  class="fx-pricing-blurb"
                  data-funnel-part={editable ? "blurb" : undefined}
                  data-funnel-part-index={editable ? String(planIndex()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {plan.blurb}
                </p>
              </Show>
              <ul class="fx-pricing-features">
                <For each={plan.features}>
                  {(feature, featureIndex) => (
                    <li
                      class="fx-pricing-feature"
                      data-funnel-part={editable ? "feature" : undefined}
                      data-funnel-part-index={
                        editable ? `${planIndex()}-${featureIndex()}` : undefined
                      }
                      tabindex={editable ? 0 : undefined}
                    >
                      {feature}
                    </li>
                  )}
                </For>
              </ul>
              <CTAButton
                href={plan.cta.href}
                variant={plan.highlighted ? "primary" : "secondary"}
                size="md"
                fullWidth
                part="plan-cta"
                partIndex={planIndex()}
              >
                {plan.cta.label}
              </CTAButton>
            </article>
          )}
        </For>
      </div>
      <Show when={billing() === "annual" && props.annualNote}>
        <p
          class="fx-pricing-note"
          data-funnel-part={editable ? "annual-note" : undefined}
          tabindex={editable ? 0 : undefined}
        >
          {props.annualNote}
        </p>
      </Show>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Guarantee
 * -----------------------------------------------------------------------------------------------*/

/** Props for the Guarantee component. */
type GuaranteeProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  title: string;
  description?: string | undefined;
};

/** Risk-reversal seal block: guarantee title and description. */
const Guarantee: Component<GuaranteeProps> = (props) => {
  const rest = omit(props, "title", "description", "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="guarantee"
      class={cx("fx-guarantee", props.class)}
      {...rest}
      ref={props.ref}
    >
      <span class="fx-guarantee-seal" aria-hidden="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z"
            fill="none"
            stroke="currentcolor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M9 11.6l2.1 2.1 3.9-4"
            fill="none"
            stroke="currentcolor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <div class="fx-guarantee-copy">
        <h3
          class="fx-guarantee-title"
          data-funnel-part={editable ? "title" : undefined}
          tabindex={editable ? 0 : undefined}
        >
          {props.title}
        </h3>
        <Show when={props.description}>
          <p
            class="fx-guarantee-description"
            data-funnel-part={editable ? "description" : undefined}
            tabindex={editable ? 0 : undefined}
          >
            {props.description}
          </p>
        </Show>
      </div>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * FAQ
 * -----------------------------------------------------------------------------------------------*/

/** One question/answer entry rendered by the Faq component. */
type FaqItem = {
  /** Stable slug used for deep links (`#faq-<id>`). */
  id: string;
  question: string;
  answer: string;
};

/** Props for the Faq component. */
type FaqProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  items: FaqItem[];
  /** Item id open initially. Defaults to the `#faq-<id>` hash when present. */
  defaultOpen?: string | undefined;
};

function hashOpenId(items: FaqItem[]): string | undefined {
  if (typeof window === "undefined") return undefined;
  const match = window.location.hash.match(/^#faq-(.+)$/);
  const id = match?.[1];
  return id && items.some((item) => item.id === id) ? id : undefined;
}

/** Accessible FAQ accordion with deep-linking via `#faq-<id>` hashes. */
const Faq: Component<FaqProps> = (props) => {
  const rest = omit(props, "items", "defaultOpen", "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="faq"
      class={cx("fx-faq", props.class)}
      {...rest}
      ref={props.ref}
    >
      <Accordion
        type="single"
        collapsible
        class="fx-faq-list"
        defaultValue={props.defaultOpen ?? hashOpenId(props.items)}
      >
        <For each={props.items}>
          {(item, index) => (
            <AccordionItem class="fx-faq-item" value={item.id} id={`faq-${item.id}`}>
              <AccordionHeader class="fx-faq-header">
                <AccordionTrigger
                  class="fx-faq-trigger"
                  data-funnel-part={editable ? "question" : undefined}
                  data-funnel-part-index={editable ? String(index()) : undefined}
                >
                  <span class="fx-faq-question">{item.question}</span>
                  <span class="fx-faq-icon" aria-hidden="true" />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="fx-faq-content">
                <p
                  class="fx-faq-answer"
                  data-funnel-part={editable ? "answer" : undefined}
                  data-funnel-part-index={editable ? String(index()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}
        </For>
      </Accordion>
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ComparisonTable
 * -----------------------------------------------------------------------------------------------*/

/** One compared option column in the comparison table. */
type ComparisonColumn = {
  label: string;
  /** Featured (ours) column: elevated surface, bold, accent borders. Defaults to first column. */
  featured?: boolean | undefined;
};

/** One feature row with per-column cell values. */
type ComparisonRow = {
  feature: string;
  /** One entry per column: boolean renders a check/cross, string renders text. */
  values: Array<boolean | string>;
};

/** Props for the ComparisonTable component. */
type ComparisonTableProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  caption?: string | undefined;
};

function featuredIndex(columns: ComparisonColumn[]): number {
  const flagged = columns.findIndex((column) => column.featured);
  return flagged === -1 ? 0 : flagged;
}

const ComparisonCell: Component<{
  value: boolean | string;
  featured: boolean;
  partIndex: string;
}> = (props) => {
  const value = () => props.value;
  const editable = useFunnelEditable();
  return (
    <td
      class="fx-comparison-value"
      data-featured={props.featured ? "" : undefined}
      data-funnel-part={editable ? "cell" : undefined}
      data-funnel-part-index={editable ? props.partIndex : undefined}
      tabindex={editable ? 0 : undefined}
    >
      <Show when={typeof value() === "boolean"} fallback={<span>{value() as string}</span>}>
        <Show
          when={value() as boolean}
          fallback={
            <>
              <span class="fx-comparison-cross" aria-hidden="true">
                ✕
              </span>
              <span class="fx-sr-only">Not included</span>
            </>
          }
        >
          <span class="fx-comparison-check" aria-hidden="true">
            ✓
          </span>
          <span class="fx-sr-only">Included</span>
        </Show>
      </Show>
    </td>
  );
};

/**
 * "Us vs. the old way" matrix placed before the offer stack. Pair with a
 * `wide` container; scrolls horizontally on small screens.
 */
const ComparisonTable: Component<ComparisonTableProps> = (props) => {
  const rest = omit(props, "columns", "rows", "caption", "class", "ref");
  const editable = useFunnelEditable();
  return (
    <Primitive.div
      data-funnel-block="comparison-table"
      class={cx("fx-comparison-scroll", props.class)}
      {...rest}
      ref={props.ref}
    >
      <table class="fx-comparison">
        <Show when={props.caption}>
          <caption
            class="fx-comparison-caption"
            data-funnel-part={editable ? "caption" : undefined}
            tabindex={editable ? 0 : undefined}
          >
            {props.caption}
          </caption>
        </Show>
        <thead>
          <tr>
            <th class="fx-comparison-corner" scope="col">
              <span class="fx-sr-only">Feature</span>
            </th>
            <For each={props.columns}>
              {(column, index) => (
                <th
                  class="fx-comparison-head"
                  scope="col"
                  data-featured={index() === featuredIndex(props.columns) ? "" : undefined}
                  data-funnel-part={editable ? "column" : undefined}
                  data-funnel-part-index={editable ? String(index()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {column.label}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row, rowIndex) => (
              <tr>
                <th
                  class="fx-comparison-feature"
                  scope="row"
                  data-funnel-part={editable ? "feature" : undefined}
                  data-funnel-part-index={editable ? String(rowIndex()) : undefined}
                  tabindex={editable ? 0 : undefined}
                >
                  {row.feature}
                </th>
                <For each={row.values}>
                  {(value, columnIndex) => (
                    <ComparisonCell
                      value={value}
                      featured={columnIndex() === featuredIndex(props.columns)}
                      partIndex={`${rowIndex()}-${columnIndex()}`}
                    />
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </Primitive.div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export { Benefits, ComparisonTable, Faq, Guarantee, HowItWorks, Pricing };
export type {
  BenefitItem,
  BenefitsProps,
  BillingPeriod,
  ComparisonColumn,
  ComparisonRow,
  ComparisonTableProps,
  FaqItem,
  FaqProps,
  GuaranteeProps,
  HowItWorksProps,
  HowItWorksStep,
  PricingPlan,
  PricingProps,
};
