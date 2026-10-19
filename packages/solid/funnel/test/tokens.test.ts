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
});

describe("contrast pairs", () => {
  for (const pair of contrastPairs) {
    test(`${pair.name} meets ${pair.min}:1`, () => {
      expect(contrastRatio(pair.foreground, pair.background)).toBeGreaterThanOrEqual(pair.min);
    });
  }
});
