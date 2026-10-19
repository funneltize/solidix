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

function readSrc(name: string): string {
  return readFileSync(workspaceFile("packages", "solid", "funnel", "src", name), "utf8");
}

describe("motion", () => {
  test("every animation name resolves to a defined fx- keyframe", () => {
    const css = readSrc("blocks.css");
    const used = [...css.matchAll(/animation:\s*([a-z][a-z0-9-]*)/g)].map((m) => m[1]!);
    const defined = new Set(
      [...css.matchAll(/@keyframes\s+([a-z][a-z0-9-]*)/g)].map((m) => m[1]!),
    );
    expect(used.length).toBeGreaterThan(0);
    for (const name of used) {
      expect(name.startsWith("fx-")).toBe(true);
      expect(defined.has(name)).toBe(true);
    }
  });

  test("motion timing comes from duration/ease tokens, never literals", () => {
    const css = readSrc("blocks.css");
    const declarations = [...css.matchAll(/(?:animation|transition)\s*:[^;]+;/gs)].map(
      (m) => m[0],
    );
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      expect(declaration).not.toMatch(/\d+m?s/);
      expect(declaration).not.toContain("cubic-bezier(");
    }
  });

  test("state-change hooks animate on data-state", () => {
    const css = readSrc("blocks.css");
    expect(css).toContain('.fx-faq-content[data-state="open"]');
    expect(css).toContain('.fx-faq-content[data-state="closed"]');
    expect(css).toContain("var(--radix-accordion-content-height)");
    expect(css).toMatch(/\.fx-pricing-toggle-option\s*\{[^}]*transition:/s);
    expect(css).toContain('.fx-exit-intent-overlay[data-state="open"]');
    expect(css).toContain('.fx-exit-intent-content[data-state="open"]');
    expect(css).toContain(".fx-testimonial-carousel-view > *");
  });

  test("reduced-motion guard collapses animations and transitions", () => {
    const css = readSrc("tokens.css");
    const guard = css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*$/);
    expect(guard).not.toBeNull();
    expect(guard![0]).toContain("animation-duration: 0.01ms !important;");
    expect(guard![0]).toContain("transition-duration: 0.01ms !important;");
  });
});
