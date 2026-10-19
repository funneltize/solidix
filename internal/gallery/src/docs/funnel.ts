import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "funnel",
  title: "Funnel",
  metaDescription:
    "Design language for direct-response landing pages: design tokens plus themed funnel blocks built on Solidix primitives.",
  ariaLink: "https://www.w3.org/WAI/ARIA/apg/",
  description:
    "The funnel system is an opinionated design language for landing pages and funnels: a zero-JavaScript token stylesheet plus themed blocks (hero, proof, pricing, opt-in, urgency) composed from Solidix primitives. Import one stylesheet and every block below is styled; rebrand by overriding tokens, never component code.",
  features: [
    "Zero-JS token layer with a dark variant (`data-funnel-theme).",
    "Themed blocks for the full funnel arc: hero, proof, consideration, conversion.",
    "Behavior comes from Solidix primitives, so keyboard interaction and ARIA stay consistent.",
    "Analytics-friendly: blocks dispatch `funnel:cta`, `funnel:submit`, and `funnel:view` events with no SDK bundled.",
    "A/B-ready: set a variant on `Root` and it flows into every event.",
    "Performance budgeted: token CSS under 12 kB, block CSS under 40 kB, eager hero media with reserved space.",
  ],
  anatomyIntro: "Theme the page, then compose blocks inside layout atoms.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Funnel } from "solidix";\nimport "@solidix/funnel/blocks.css";\n\nexport default () => (\n\t<Funnel.Root variant="b">\n\t\t<Funnel.Section>\n\t\t\t<Funnel.Container>\n\t\t\t\t<Funnel.Hero\n\t\t\t\t\ttitle="Ship a landing page that pays for itself"\n\t\t\t\t\tprimaryCta={{ label: "Claim your seat", href: "#pricing" }}\n\t\t\t\t/>\n\t\t\t</Funnel.Container>\n\t\t</Funnel.Section>\n\t\t<Funnel.Section tone="subtle">\n\t\t\t<Funnel.Container>\n\t\t\t\t<Funnel.Pricing plans={plans} />\n\t\t\t</Funnel.Container>\n\t\t</Funnel.Section>\n\t</Funnel.Root>\n);',
  },
  parts: [
    {
      name: "Root",
      description: "Theme scope and variant provider for a funnel page or section.",
      props: [
        {
          name: "theme",
          type: '"light" | "dark"',
          description: "Dark sets data-funnel-theme for the dark token set.",
        },
        {
          name: "cta",
          type: '"orange" | "emerald" | "cobalt"',
          default: "orange",
          description:
            "Isolation-color hue; emerald suits fintech/health, cobalt enterprise/medical.",
        },
        {
          name: "variant",
          type: "string",
          description: "A/B variant label merged into funnel event detail.",
        },
      ],
      dataAttributes: [
        { attribute: "data-funnel-theme", values: ["dark"] },
        { attribute: "data-cta", values: ["emerald", "cobalt"] },
      ],
      cssVariables: [],
    },
    {
      name: "Section",
      description: "Full-bleed page section with vertical rhythm and tone scopes.",
      props: [
        {
          name: "tone",
          type: '"primary" | "subtle" | "inverse"',
          default: "primary",
          description: "Background treatment; alternate down the page for chapter breaks.",
        },
        {
          name: "compact",
          type: "boolean",
          default: "false",
          description: "Tight padding for strips (trust bar, footer).",
        },
      ],
      dataAttributes: [
        { attribute: "data-funnel-block", values: ["section"] },
        { attribute: "data-tone", values: ["primary", "subtle", "inverse"] },
        { attribute: "data-compact", values: [""] },
      ],
      cssVariables: [],
    },
    {
      name: "Container",
      description: "Centered content measure with fluid gutters.",
      props: [
        {
          name: "size",
          type: '"wide" | "standard" | "reading"',
          default: "standard",
          description: "Measure tier: proof grids, hero rows, or copy/FAQ.",
        },
      ],
      dataAttributes: [
        { attribute: "data-funnel-block", values: ["container"] },
        { attribute: "data-size", values: ["wide", "standard", "reading"] },
      ],
      cssVariables: [],
    },
    {
      name: "Eyebrow",
      description: "Short kicker line. Sparing by design.",
      props: [],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["eyebrow"] }],
      cssVariables: [],
    },
    {
      name: "CTAButton",
      description: "The page-level action. Renders a button, or an anchor when href is set.",
      props: [
        {
          name: "variant",
          type: '"primary" | "secondary" | "ghost"',
          default: "primary",
          description: "Visual weight.",
        },
        { name: "size", type: '"md" | "lg"', default: "lg", description: "Size." },
        { name: "href", type: "string", description: "Renders an anchor instead of a button." },
        { name: "loading", type: "boolean", description: "Shows a spinner and blocks activation." },
        { name: "fullWidth", type: "boolean", description: "Stretches to full width." },
        { name: "pill", type: "boolean", description: "Pill shape for consumer/DTC offers." },
      ],
      dataAttributes: [
        { attribute: "data-funnel-block", values: ["cta-button"] },
        { attribute: "data-variant", values: ["primary", "secondary", "ghost"] },
        { attribute: "data-size", values: ["md", "lg"] },
        { attribute: "data-pill", values: [""] },
      ],
      cssVariables: [],
    },
    {
      name: "Hero",
      description: "Opening section with copy, CTAs, and optional reserved-ratio media.",
      props: [
        { name: "title", required: true, type: "string", description: "Headline." },
        {
          name: "primaryCta",
          required: true,
          type: "{ label: string; href: string }",
          description: "Main action.",
        },
        { name: "subtitle", type: "string", description: "Supporting copy." },
        { name: "eyebrow", type: "string", description: "Kicker line." },
        {
          name: "secondaryCta",
          type: "{ label: string; href: string }",
          description: "Supporting link.",
        },
        {
          name: "media",
          type: "{ src: string; alt: string; ratio?: number }",
          description: "Media with layout space reserved via AspectRatio.",
        },
        { name: "align", type: '"split" | "centered"', default: "split", description: "Layout." },
      ],
      dataAttributes: [
        { attribute: "data-funnel-block", values: ["hero"] },
        { attribute: "data-align", values: ["split", "centered"] },
      ],
      cssVariables: [],
    },
    {
      name: "OptInForm",
      description: "Short email capture form with NN/g-conformant labeling and inline success.",
      props: [
        {
          name: "fields",
          required: true,
          type: "OptInField[]",
          description: "Fields; labels render above inputs and optional fields are marked.",
        },
        {
          name: "submitLabel",
          required: true,
          type: "string",
          description: "Submit button label.",
        },
        {
          name: "privacyNote",
          type: "string",
          description: "Reassurance microcopy under the button.",
        },
        { name: "successTitle", type: "string", description: "Inline success heading." },
        { name: "successMessage", type: "string", description: "Inline success body." },
        {
          name: "onSubmit",
          type: "(values) => void",
          description:
            "Called with submitted values. Event detail carries field names only, never values.",
        },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["opt-in-form"] }],
      cssVariables: [],
    },
    {
      name: "Pricing",
      description: "Billing toggle plus plan cards. Defaults to annual billing.",
      props: [
        {
          name: "plans",
          required: true,
          type: "PricingPlan[]",
          description: "Plans with per-period prices, features, and CTAs.",
        },
        {
          name: "periods",
          type: '"monthly" | "annual"[]',
          description:
            "Billing periods offered; a single period hides the toggle (one-time offers).",
        },
        {
          name: "defaultBilling",
          type: '"monthly" | "annual"',
          default: "annual",
          description: "Uncontrolled initial period.",
        },
        { name: "billing", type: '"monthly" | "annual"', description: "Controlled period." },
        {
          name: "onBillingChange",
          type: "(billing) => void",
          description: "Period change handler.",
        },
        {
          name: "annualNote",
          type: "string",
          description: "Note shown while annual billing is selected.",
        },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["pricing"] }],
      cssVariables: [],
    },
    {
      name: "Faq",
      description: "Divider accordion with deep-linkable items (`#faq-<id>`).",
      props: [
        {
          name: "items",
          required: true,
          type: "FaqItem[]",
          description: "Questions with stable link ids.",
        },
        {
          name: "defaultOpen",
          type: "string",
          description: "Item id open initially; defaults to the location hash.",
        },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["faq"] }],
      cssVariables: [],
    },
    {
      name: "Countdown",
      description: "Honest deadline timer with tabular digits and a timer role.",
      props: [
        {
          name: "endsAt",
          required: true,
          type: "number",
          description: "Deadline as epoch milliseconds.",
        },
        { name: "caption", type: "string", description: "Label above the units." },
        {
          name: "onExpire",
          type: "() => void",
          description: "Fired once when the deadline passes.",
        },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["countdown"] }],
      cssVariables: [],
    },
    {
      name: "StickyBar",
      description: "Mobile-only bottom bar that appears past the hero CTA.",
      props: [
        { name: "message", required: true, type: "string", description: "Bar copy." },
        {
          name: "cta",
          required: true,
          type: "{ label: string; href: string }",
          description: "Bar action.",
        },
        {
          name: "observe",
          type: "string",
          description: "Selector for the reveal trigger; falls back to showAfter.",
        },
        {
          name: "showAfter",
          type: "number",
          default: "600",
          description: "Scroll depth in px before the bar appears.",
        },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["sticky-bar"] }],
      cssVariables: [],
    },
    {
      name: "Footer",
      description: "Zero-leak footer in utility, trust, or sitemap archetypes.",
      props: [
        {
          name: "variant",
          type: '"utility" | "trust" | "sitemap"',
          default: "sitemap",
          description: "Archetype: flat link row, identity split, or anchor columns.",
        },
        { name: "brand", type: "string", description: "Brand line; optional with identity." },
        { name: "tagline", type: "string", description: "One-line descriptor under the brand." },
        {
          name: "columns",
          type: "FooterColumn[]",
          description: "Link columns (flattened into one row by utility).",
        },
        {
          name: "identity",
          type: "FooterIdentity",
          description: "Verified-business block: address, email, phone, registration, hours.",
        },
        {
          name: "badges",
          type: "(string | { label: string; icon?: FooterBadgeIcon | JSX.Element })[]",
          description: "Trust pills with lock/shield/check/card glyphs or custom icons.",
        },
        { name: "legal", type: "string", description: "Disclaimer line under a divider." },
        {
          name: "legalLinks",
          type: "FooterLink[]",
          description: "Policy links, always opened safely in a new tab.",
        },
      ],
      dataAttributes: [
        { attribute: "data-funnel-block", values: ["footer"] },
        { attribute: "data-variant", values: ["utility", "trust", "sitemap"] },
      ],
      cssVariables: [],
    },
    {
      name: "ComparisonTable",
      description: "Us-versus-alternatives matrix with a featured column.",
      props: [
        {
          name: "columns",
          required: true,
          type: "ComparisonColumn[]",
          description: "Column labels; the first is featured unless flagged.",
        },
        {
          name: "rows",
          required: true,
          type: "ComparisonRow[]",
          description: "Features with one boolean or string value per column.",
        },
        { name: "caption", type: "string", description: "Table caption." },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["comparison-table"] }],
      cssVariables: [],
    },
    {
      name: "ExitIntent",
      description: "Dialog-backed popup on exit gesture, frequency-capped and disabled on touch.",
      props: [
        { name: "title", required: true, type: "string", description: "Popup heading." },
        { name: "description", type: "string", description: "Popup copy." },
        { name: "disabled", type: "boolean", description: "Disable the exit listener." },
        {
          name: "storageKey",
          type: "string | null",
          description: "localStorage key for frequency capping; null disables.",
        },
        {
          name: "frequencyCapDays",
          type: "number",
          default: "30",
          description: "Days before the popup may show again.",
        },
      ],
      dataAttributes: [{ attribute: "data-funnel-block", values: ["exit-intent"] }],
      cssVariables: [],
    },
    {
      name: "More blocks",
      description:
        "Header, SectionHeading, Prose, CtaCluster, VideoFrame, LogoBar, Testimonials, TestimonialCarousel, StatsBar, StarRating, Benefits, HowItWorks, and Guarantee follow the same data-driven shape: pass content, get themed markup with data-funnel-block attributes.",
      props: [],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [
    {
      title: "Rebrand with tokens",
      description: "Override any token to reskin every block at once.",
      blocks: [
        {
          lang: "css",
          highlights: [],
          code: '@import "@solidix/funnel/blocks.css";\n\n:root {\n\t--solidix-funnel-brand: #1d4ed8;\n\t--solidix-funnel-brand-strong: #1e40af;\n\t--solidix-funnel-cta: #1d4ed8;\n\t--solidix-funnel-cta-strong: #1e40af;\n}',
        },
      ],
    },
    {
      title: "Observe funnel events",
      description: "Forward block events to any analytics snippet.",
      blocks: [
        {
          lang: "js",
          highlights: [],
          code: 'for (const type of ["funnel:cta", "funnel:submit", "funnel:view"]) {\n\tdocument.addEventListener(type, (event) => {\n\t\tanalytics.track(event.type, event.detail);\n\t});\n}',
        },
      ],
    },
  ],
  customApis: [
    {
      title: "Funnel analytics events",
      description:
        "Blocks dispatch bubbling composed CustomEvents. `detail` always includes the block name and the Root variant; submit events carry field names only, never values.",
      blocks: [
        {
          lang: "ts",
          highlights: [],
          code: 'type FunnelEventType = "funnel:cta" | "funnel:submit" | "funnel:view";\n\ntype FunnelEventDetail = {\n\tblock?: string;\n\tvariant?: string;\n\t[label: string]: unknown;\n};',
        },
      ],
    },
  ],
  accessibility:
    "Blocks inherit primitive behavior: the FAQ accordion and pricing toggle keep full keyboard support, form fields use native validation with visible labels and multi-cue errors, the countdown uses a timer role, and carousels announce through a polite live region without autoplay. Token CSS ships focus-visible rings and collapses motion under prefers-reduced-motion.",
  keyboard: [
    {
      keys: ["ArrowUp", "ArrowDown"],
      description: "Move between FAQ questions and pricing options.",
    },
    { keys: ["Enter", "Space"], description: "Toggle the focused FAQ item or pricing option." },
    { keys: ["Tab"], description: "Reach carousel controls, form fields, and CTAs in order." },
    { keys: ["Escape"], description: "Close the exit-intent popup." },
  ],
  notes:
    "Funnel blocks are opinionated by design and do not offer asChild; restyle through tokens and the documented .fx-* classes. Reference budgets: tokens.css under 12 kB, blocks.css under 40 kB. Countdown and urgency patterns ship honest defaults; fake scarcity is out of scope.",
};
