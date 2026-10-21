/* Design tokens for direct-response landing pages. This module is the
 * single source of truth: `pnpm gen:tokens` renders it to `tokens.css`, and
 * a test fails if the checked-in CSS drifts from this output. Token values
 * are placeholder brand defaults (warm neutrals, high-contrast CTA) meant to
 * be overridden per brand; the token *names* are the stable API. */

/** Token name to CSS value map backing one theme. */
export type TokenSet = Record<string, string>;

/** Light (default) token values, emitted under `:root`. */
export const lightTokens: TokenSet = {
  /* Color: surfaces and text (slate scale, never pure black) */
  "--solidix-funnel-paper": "#ffffff",
  "--solidix-funnel-ink": "#0f172a",
  "--solidix-funnel-ink-body": "#334155",
  "--solidix-funnel-muted": "#64748b",
  "--solidix-funnel-faint": "#94a3b8",
  "--solidix-funnel-line": "#e2e8f0",
  "--solidix-funnel-line-soft": "#f1f5f9",
  "--solidix-funnel-subtle": "#f8fafc",
  "--solidix-funnel-inverse": "#0f172a",
  "--solidix-funnel-elevated": "#ffffff",
  /* Color: brand (eyebrows, badges; kept distinct from the CTA) */
  "--solidix-funnel-brand": "#c2410c",
  "--solidix-funnel-brand-strong": "#9a3412",
  "--solidix-funnel-brand-tint": "#fff7ed",
  "--solidix-funnel-brand-line": "#fed7aa",
  /* Color: call to action, the 10% isolation color (large/UI text only) */
  "--solidix-funnel-cta": "#ea580c",
  "--solidix-funnel-cta-strong": "#c2410c",
  "--solidix-funnel-cta-ink": "#ffffff",
  /* Color: feedback */
  "--solidix-funnel-success": "#15803d",
  "--solidix-funnel-success-tint": "#f0fdf4",
  "--solidix-funnel-warning-strong": "#92400e",
  "--solidix-funnel-warning-tint": "#fffbeb",
  "--solidix-funnel-danger": "#b91c1c",
  "--solidix-funnel-danger-tint": "#fef2f2",
  /* Color: ratings */
  "--solidix-funnel-star": "#d97706",
  "--solidix-funnel-star-empty": "#e2e8f0",
  /* Color: skimmer highlighter (2 to 4 critical words per viewport) */
  "--solidix-funnel-highlight": "#fef08a",
  /* Color: form fields (always light, never re-scoped by tones) */
  "--solidix-funnel-field-bg": "#ffffff",
  "--solidix-funnel-field-ink": "#0f172a",
  "--solidix-funnel-field-line": "#cbd5e1",
  "--solidix-funnel-field-placeholder": "#64748b",
  /* Type: families (consumer preloads Inter; serif is accent-only) */
  "--solidix-funnel-sans":
    '"Inter", "Plus Jakarta Sans", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  "--solidix-funnel-serif-accent":
    '"Instrument Serif", "Fraunces", Georgia, "Times New Roman", serif',
  "--solidix-funnel-mono": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  /* Type: fluid scale (display 36 to 56px, body 18px for sales copy) */
  "--solidix-funnel-text-display": "clamp(2.25rem, 1.6rem + 3.2vw, 3.5rem)",
  "--solidix-funnel-text-h1": "clamp(2rem, 1.5rem + 2.5vw, 3rem)",
  "--solidix-funnel-text-h2": "clamp(1.6rem, 1.3rem + 1.5vw, 2.25rem)",
  "--solidix-funnel-text-h3": "1.375rem",
  "--solidix-funnel-text-lead": "1.25rem",
  "--solidix-funnel-text-body": "1.125rem",
  "--solidix-funnel-text-small": "0.875rem",
  "--solidix-funnel-text-caption": "0.75rem",
  "--solidix-funnel-leading-display": "1.1",
  "--solidix-funnel-leading-tight": "1.05",
  "--solidix-funnel-leading-snug": "1.2",
  "--solidix-funnel-leading-normal": "1.5",
  "--solidix-funnel-leading-relaxed": "1.65",
  "--solidix-funnel-tracking-display": "-0.03em",
  "--solidix-funnel-tracking-tight": "-0.02em",
  "--solidix-funnel-weight-regular": "400",
  "--solidix-funnel-weight-medium": "500",
  "--solidix-funnel-weight-semibold": "600",
  "--solidix-funnel-weight-bold": "700",
  "--solidix-funnel-weight-extrabold": "800",
  /* Spacing: 4px base scale plus the 6px label step */
  "--solidix-funnel-space-0": "0",
  "--solidix-funnel-space-1": "0.25rem",
  "--solidix-funnel-space-1-5": "0.375rem",
  "--solidix-funnel-space-2": "0.5rem",
  "--solidix-funnel-space-3": "0.75rem",
  "--solidix-funnel-space-4": "1rem",
  "--solidix-funnel-space-5": "1.25rem",
  "--solidix-funnel-space-6": "1.5rem",
  "--solidix-funnel-space-8": "2rem",
  "--solidix-funnel-space-10": "2.5rem",
  "--solidix-funnel-space-12": "3rem",
  "--solidix-funnel-space-16": "4rem",
  "--solidix-funnel-space-20": "5rem",
  "--solidix-funnel-space-24": "6rem",
  /* Layout rhythm: three strict container tiers (proof/hero/reading) */
  "--solidix-funnel-section-pad": "clamp(3.5rem, 7vw, 6.5rem)",
  "--solidix-funnel-container-wide": "75rem",
  "--solidix-funnel-container-standard": "67.5rem",
  "--solidix-funnel-container-reading": "42.5rem",
  "--solidix-funnel-container-pad": "clamp(1rem, 4vw, 2rem)",
  /* Radius: one role per step, never a single radius everywhere */
  "--solidix-funnel-radius-sm": "6px",
  "--solidix-funnel-radius-md": "8px",
  "--solidix-funnel-radius-lg": "16px",
  "--solidix-funnel-radius-xl": "24px",
  "--solidix-funnel-radius-full": "999px",
  /* Shadows: neutral slate only, no colored glows */
  "--solidix-funnel-shadow-sm": "0 1px 2px rgb(15 23 42 / 0.08)",
  "--solidix-funnel-shadow-md": "0 12px 32px -16px rgb(15 23 42 / 0.35)",
  "--solidix-funnel-shadow-lg": "0 24px 64px -24px rgb(15 23 42 / 0.4)",
  /* Breakpoints: reference values (media queries take literals, see README) */
  "--solidix-funnel-breakpoint-sm": "640px",
  "--solidix-funnel-breakpoint-md": "768px",
  "--solidix-funnel-breakpoint-lg": "1024px",
  "--solidix-funnel-breakpoint-xl": "1280px",
  /* Layering */
  "--solidix-funnel-z-sticky": "40",
  "--solidix-funnel-z-overlay": "50",
  "--solidix-funnel-z-toast": "60",
  /* Motion: durations pair with @solidix/motion spring easings */
  "--solidix-funnel-duration-instant": "100ms",
  "--solidix-funnel-duration-fast": "160ms",
  "--solidix-funnel-duration-base": "240ms",
  "--solidix-funnel-duration-slow": "420ms",
  "--solidix-funnel-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
};

/** Dark overrides, emitted under `[data-funnel-theme="dark"]`. */
export const darkTokens: TokenSet = {
  "--solidix-funnel-paper": "#0f172a",
  "--solidix-funnel-ink": "#f8fafc",
  "--solidix-funnel-ink-body": "#cbd5e1",
  "--solidix-funnel-muted": "#94a3b8",
  "--solidix-funnel-faint": "#64748b",
  "--solidix-funnel-line": "#334155",
  "--solidix-funnel-line-soft": "#1e293b",
  "--solidix-funnel-subtle": "#1e293b",
  "--solidix-funnel-inverse": "#f8fafc",
  "--solidix-funnel-elevated": "#1e293b",
  "--solidix-funnel-brand": "#fb923c",
  "--solidix-funnel-brand-strong": "#fdba74",
  "--solidix-funnel-brand-tint": "#431407",
  "--solidix-funnel-brand-line": "#7c2d12",
  "--solidix-funnel-cta": "#fb923c",
  "--solidix-funnel-cta-strong": "#ea580c",
  "--solidix-funnel-cta-ink": "#0f172a",
  "--solidix-funnel-success": "#4ade80",
  "--solidix-funnel-success-tint": "#052e16",
  "--solidix-funnel-warning-strong": "#fbbf24",
  "--solidix-funnel-warning-tint": "#451a03",
  "--solidix-funnel-danger": "#f87171",
  "--solidix-funnel-danger-tint": "#450a0a",
  "--solidix-funnel-star": "#fbbf24",
  "--solidix-funnel-star-empty": "#334155",
  "--solidix-funnel-highlight": "#713f12",
  "--solidix-funnel-shadow-sm": "0 1px 2px rgb(0 0 0 / 0.4)",
  "--solidix-funnel-shadow-md": "0 12px 32px -16px rgb(0 0 0 / 0.6)",
  "--solidix-funnel-shadow-lg": "0 24px 64px -24px rgb(0 0 0 / 0.65)",
};

/** Base rules shipped at the end of `tokens.css`. */
export const funnelBaseCss = [
  ":root {",
  "  color-scheme: light;",
  "}",
  "",
  '[data-funnel-theme="dark"] {',
  "  color-scheme: dark;",
  "}",
  "",
  "/* CTA hue variants: re-point the isolation color per vertical (fintech /",
  " * health take emerald, enterprise / medical take cobalt). Tactile depth",
  " * derives from these via color-mix, so no other rule changes. */",
  '[data-cta="emerald"] {',
  "  --solidix-funnel-cta: #059669;",
  "  --solidix-funnel-cta-strong: #047857;",
  "  --solidix-funnel-cta-ink: #ffffff;",
  "}",
  "",
  '[data-cta="cobalt"] {',
  "  --solidix-funnel-cta: #2563eb;",
  "  --solidix-funnel-cta-strong: #1d4ed8;",
  "  --solidix-funnel-cta-ink: #ffffff;",
  "}",
  "",
  "::selection {",
  "  background: var(--solidix-funnel-brand-line);",
  "  color: var(--solidix-funnel-ink);",
  "}",
  "",
  ":focus-visible {",
  "  outline: 2px solid var(--solidix-funnel-brand);",
  "  outline-offset: 2px;",
  "  border-radius: var(--solidix-funnel-radius-sm);",
  "}",
  "",
  "@media (prefers-reduced-motion: reduce) {",
  "  html {",
  "    scroll-behavior: auto;",
  "  }",
  "",
  "  *,",
  "  *::before,",
  "  *::after {",
  "    animation-duration: 0.01ms !important;",
  "    transition-duration: 0.01ms !important;",
  "  }",
  "}",
  "",
].join("\n");

const HEADER = [
  "/* Funnel design tokens. Generated by `pnpm gen:tokens` - do not hand-edit.",
  " * Zero-JS theming: copy this file (and `blocks.css` for the block",
  " * components) from the solidix repo into your project, side by side,",
  " * and import it with a relative path. Re-copy after upgrading.",
  ' * Dark variant: set `data-funnel-theme="dark"` on a wrapping element. */',
  "",
].join("\n");

function renderDeclaration(name: string, value: string): string {
  const single = `  ${name}: ${value};`;
  return single.length <= 100 ? single : `  ${name}:\n    ${value};`;
}

function renderBlock(selector: string, tokens: TokenSet): string {
  const lines = [`${selector} {`];
  for (const [name, value] of Object.entries(tokens)) {
    lines.push(renderDeclaration(name, value));
  }
  lines.push("}", "");
  return lines.join("\n");
}

/** Renders the full `tokens.css` output from the token source of truth. */
export function renderTokensCss(): string {
  return (
    HEADER +
    renderBlock(":root", lightTokens) +
    renderBlock('[data-funnel-theme="dark"]', darkTokens) +
    funnelBaseCss
  );
}

/* ----------------------------------------------------------------------------------------------- */

function channelToLinear(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function parseHex(hex: string): [number, number, number] {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/**
 * Relative-luminance contrast ratio between two `#rgb`/`#rrggbb` colors,
 * e.g. `contrastRatio("#1c1917", "#ffffff")`. Used to pin the documented
 * text/background pairs in tests.
 */
export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = parseHex(hex).map(channelToLinear);
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

/** One foreground/background pair checked for contrast. */
export type ContrastPair = {
  name: string;
  foreground: string;
  background: string;
  /** Minimum ratio the pair must meet. */
  min: number;
};

/**
 * Documented text/background pairs. Body text pairs hold 4.5:1; large-text
 * and UI-component pairs hold 3:1. `faint` is decorative-only (never text).
 */
export const contrastPairs: ContrastPair[] = [
  { name: "ink/paper (light)", foreground: "#0f172a", background: "#ffffff", min: 4.5 },
  { name: "ink-body/paper (light)", foreground: "#334155", background: "#ffffff", min: 4.5 },
  { name: "muted/paper (light)", foreground: "#64748b", background: "#ffffff", min: 4.5 },
  { name: "brand/paper (light)", foreground: "#c2410c", background: "#ffffff", min: 4.5 },
  { name: "brand-strong/paper (light)", foreground: "#9a3412", background: "#ffffff", min: 4.5 },
  { name: "success/paper (light)", foreground: "#15803d", background: "#ffffff", min: 4.5 },
  { name: "danger/paper (light)", foreground: "#b91c1c", background: "#ffffff", min: 4.5 },
  { name: "field-ink/field-bg", foreground: "#0f172a", background: "#ffffff", min: 4.5 },
  { name: "field-placeholder/field-bg", foreground: "#64748b", background: "#ffffff", min: 4.5 },
  { name: "ink/highlight (light)", foreground: "#0f172a", background: "#fef08a", min: 4.5 },
  { name: "cta-ink/cta cobalt", foreground: "#ffffff", background: "#2563eb", min: 4.5 },
  { name: "ink/paper (dark)", foreground: "#f8fafc", background: "#0f172a", min: 4.5 },
  { name: "ink-body/paper (dark)", foreground: "#cbd5e1", background: "#0f172a", min: 4.5 },
  { name: "muted/paper (dark)", foreground: "#94a3b8", background: "#0f172a", min: 4.5 },
  { name: "brand-strong/paper (dark)", foreground: "#fdba74", background: "#0f172a", min: 4.5 },
  { name: "cta-ink/cta (dark)", foreground: "#0f172a", background: "#fb923c", min: 4.5 },
  { name: "ink/highlight (dark)", foreground: "#f8fafc", background: "#713f12", min: 4.5 },
  {
    name: "cta-ink/cta (light, large/UI only)",
    foreground: "#ffffff",
    background: "#ea580c",
    min: 3,
  },
  {
    name: "cta-ink/cta emerald (large/UI only)",
    foreground: "#ffffff",
    background: "#059669",
    min: 3,
  },
];
