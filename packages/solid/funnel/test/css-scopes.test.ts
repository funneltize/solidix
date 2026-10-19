import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";

// Anchor on the workspace root so this works no matter which directory
// vitest is invoked from.
function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[funnel] workspace root not found");
    dir = parent;
  }
}

function blocksCss(): string {
  return readFileSync(workspaceFile("packages", "solid", "funnel", "src", "blocks.css"), "utf8");
}

function ruleBody(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css
    .slice(open + 1, close)
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

// jsdom does not resolve custom properties, so these tests pin the
// stylesheet source directly. Custom properties resolve against the override
// in their own block: a tone scope must never define a token in terms of
// another token it also overrides, or the page token silently wins.
describe("tone scopes", () => {
  test("inverse tone sets literal dark surfaces, not self-referencing vars", () => {
    const body = ruleBody(blocksCss(), '.fx-section[data-tone="inverse"]');
    expect(body).toContain("--solidix-funnel-paper: #0f172a;");
    expect(body).toContain("--solidix-funnel-ink: #f8fafc;");
    expect(body).not.toContain("var(--solidix-funnel-ink)");
    expect(body).not.toContain("var(--solidix-funnel-paper)");
  });

  test("dark scopes keep error text and eyebrows legible", () => {
    const body = ruleBody(blocksCss(), '.fx-section[data-tone="inverse"]');
    expect(body).toContain("--solidix-funnel-danger: #f87171;");
    expect(body).toContain("--solidix-funnel-brand-strong: #fdba74;");
  });

  test("highlighted pricing re-scopes its surface instead of inheriting it", () => {
    const body = ruleBody(blocksCss(), ".fx-pricing-plan[data-highlighted]");
    expect(body).toContain("--solidix-funnel-paper: #0f172a;");
    expect(body).toContain("background: var(--solidix-funnel-paper);");
  });

  test("comparison scroller contains clipped labels within the page", () => {
    const body = ruleBody(blocksCss(), ".fx-comparison-scroll");
    expect(body).toContain("overflow-x: auto;");
    // Without a positioned scroller, clipped cell labels escape into page
    // scrollWidth on narrow viewports (verified in headless Chrome).
    expect(body).toContain("position: relative;");
  });

  test("container tiers map to the three width tokens", () => {
    const css = blocksCss();
    expect(ruleBody(css, ".fx-container")).toContain(
      "max-width: var(--solidix-funnel-container-standard);",
    );
    expect(ruleBody(css, '.fx-container[data-size="wide"]')).toContain(
      "max-width: var(--solidix-funnel-container-wide);",
    );
    expect(ruleBody(css, '.fx-container[data-size="reading"]')).toContain(
      "max-width: var(--solidix-funnel-container-reading);",
    );
  });
});

describe("responsive chrome", () => {
  test("exactly one persistent element per viewport", () => {
    const css = blocksCss();
    // Desktop: sticky header, no bottom bar.
    expect(css).toContain("@media (min-width: 768px)");
    expect(css).toMatch(/\.fx-sticky-bar\s*\{[^}]*display:\s*none;/s);
    // Mobile: sticky bar, header scrolls away.
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toMatch(/\.fx-header\[data-sticky\]\s*\{[^}]*position:\s*static;/s);
    // Mobile hero shows the single primary action below sm.
    expect(css).toContain("@media (max-width: 639px)");
    expect(ruleBody(css, ".fx-hero-secondary")).toContain("display: none;");
  });
});

describe("form fields", () => {
  test("inputs use dedicated field tokens that tones never re-scope", () => {
    const css = blocksCss();
    const input = ruleBody(css, ".fx-opt-in-input");
    expect(input).toContain("background: var(--solidix-funnel-field-bg);");
    expect(input).toContain("border: 1px solid var(--solidix-funnel-field-line);");
    expect(input).toContain("color: var(--solidix-funnel-field-ink);");
    expect(ruleBody(css, ".fx-opt-in-input::placeholder")).toContain(
      "color: var(--solidix-funnel-field-placeholder);",
    );
    for (const selector of [
      '.fx-section[data-tone="subtle"]',
      '.fx-section[data-tone="inverse"]',
      ".fx-pricing-plan[data-highlighted]",
    ]) {
      expect(ruleBody(css, selector)).not.toContain("--solidix-funnel-field-");
    }
  });
});
