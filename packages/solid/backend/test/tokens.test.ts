import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  backendComponents,
  contrastPairs,
  contrastRatio,
  darkTokens,
  lightTokens,
  renderTokensCss,
} from "../src/index";

function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[backend] workspace root not found");
    dir = parent;
  }
}

describe("tokens.css", () => {
  test("checked-in CSS matches the token source of truth", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "backend", "src", "tokens.css"),
      "utf8",
    );
    expect(css).toBe(renderTokensCss());
  });

  test("every token name uses the backend namespace", () => {
    for (const name of [...Object.keys(lightTokens), ...Object.keys(darkTokens)]) {
      expect(name.startsWith("--solidix-backend-")).toBe(true);
    }
  });

  test("dark set only overrides light tokens", () => {
    for (const name of Object.keys(darkTokens)) {
      expect(name in lightTokens).toBe(true);
    }
  });

  test("documented contrast pairs meet their minima", () => {
    for (const pair of contrastPairs) {
      expect(contrastRatio(pair.foreground, pair.background), pair.name).toBeGreaterThanOrEqual(
        pair.min,
      );
    }
  });

  test("density scopes exist for compact default and comfortable override", () => {
    const css = renderTokensCss();
    expect(css).toContain('[data-density="comfortable"]');
    expect(css).toContain("--solidix-backend-row-height");
  });
});

describe("css budgets", () => {
  test("tokens.css stays lean", () => {
    const size = Buffer.byteLength(
      readFileSync(workspaceFile("packages", "solid", "backend", "src", "tokens.css"), "utf8"),
      "utf8",
    );
    expect(size).toBeLessThan(8 * 1024);
  });

  test("backend.css stays lean", () => {
    const size = Buffer.byteLength(
      readFileSync(workspaceFile("packages", "solid", "backend", "src", "backend.css"), "utf8"),
      "utf8",
    );
    // Raised 12 kB to 16 kB in Wave 3 for workflow styles (stat, save bar).
    expect(size).toBeLessThan(16 * 1024);
  });
});

describe("components index", () => {
  test("components.json matches the exported index", () => {
    const json = JSON.parse(
      readFileSync(workspaceFile("packages", "solid", "backend", "src", "components.json"), "utf8"),
    ) as unknown;
    expect(json).toEqual(backendComponents);
  });

  test("every indexed component has a job and import", () => {
    for (const entry of backendComponents) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.from).toBe("@solidix/backend");
      expect(entry.job.length).toBeGreaterThan(8);
    }
  });
});
