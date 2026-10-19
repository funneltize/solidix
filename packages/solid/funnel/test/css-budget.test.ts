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

function byteSize(path: string): number {
  return Buffer.byteLength(readFileSync(path, "utf8"), "utf8");
}

// Landing pages live and die on weight: pin the theme layer well under the
// documented budgets (tokens 12 kB, blocks 40 kB) so growth is a decision.
describe("css budgets", () => {
  test("tokens.css stays lean", () => {
    expect(
      byteSize(workspaceFile("packages", "solid", "funnel", "src", "tokens.css")),
    ).toBeLessThan(12 * 1024);
  });

  test("blocks.css stays lean", () => {
    expect(
      byteSize(workspaceFile("packages", "solid", "funnel", "src", "blocks.css")),
    ).toBeLessThan(40 * 1024);
  });
});
