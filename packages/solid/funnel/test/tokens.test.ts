import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  contrastPairs,
  contrastRatio,
  darkTokens,
  lightTokens,
  renderTokensCss,
} from "../src/index";

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

describe("tokens.css", () => {
  test("checked-in CSS matches the token source of truth", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "funnel", "src", "tokens.css"),
      "utf8",
    );
    expect(css).toBe(renderTokensCss());
  });

  test("every token name uses the funnel namespace", () => {
    for (const name of [...Object.keys(lightTokens), ...Object.keys(darkTokens)]) {
      expect(name.startsWith("--solidix-funnel-")).toBe(true);
    }
  });

  test("dark set only overrides light tokens", () => {
    for (const name of Object.keys(darkTokens)) {
      expect(name in lightTokens).toBe(true);
    }
  });

  test("every dark token merges into a light-dark() pair with a flat fallback", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "funnel", "src", "tokens.css"),
      "utf8",
    );
    // Collapse wrapping: long pairs split across lines in the stylesheet.
    const flat = css.replace(/\s+/g, " ");
    for (const [name, dark] of Object.entries(darkTokens)) {
      const light = lightTokens[name]!;
      expect(flat).toContain(`${name}: ${light};`);
      expect(flat).toContain(`${name}: light-dark(${light}, ${dark});`);
    }
    // Fallback first: browsers without light-dark() keep the light theme.
    expect(flat.indexOf("--solidix-funnel-paper: #ffffff;")).toBeLessThan(
      flat.indexOf("--solidix-funnel-paper: light-dark("),
    );
  });

  test("data-funnel-theme only flips color-scheme, never overrides tokens", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "funnel", "src", "tokens.css"),
      "utf8",
    );
    expect(css).toMatch(/\[data-funnel-theme="dark"\]\s*\{\s*color-scheme:\s*dark;\s*\}/);
    expect(css).not.toMatch(/\[data-funnel-theme="dark"\]\s*\{[^}]*--solidix-/s);
  });

  test("focus ring is scoped to funnel markup, never a bare global", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "funnel", "src", "tokens.css"),
      "utf8",
    );
    // In-Root descendants, plus block roots for Root-less and portalled use.
    expect(css).toContain("[data-funnel-root] :focus-visible");
    expect(css).toContain("[data-funnel-block]:focus-visible");
    expect(css).toContain("[data-funnel-block] :focus-visible");
    // No rule may start with a bare pseudo-class: it would restyle the
    // consumer's own page (e.g. red outlines on their inputs).
    expect(css).not.toMatch(/^\s*:focus-visible\s*[{,]/m);
  });
});

describe("contrast pairs", () => {
  for (const pair of contrastPairs) {
    test(`${pair.name} meets ${pair.min}:1`, () => {
      expect(contrastRatio(pair.foreground, pair.background)).toBeGreaterThanOrEqual(pair.min);
    });
  }
});
