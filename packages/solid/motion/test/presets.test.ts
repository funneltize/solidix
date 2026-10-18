import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { createSpring, springPresets, type SpringPresetName } from "../src/index";

// Anchor on the workspace root so this works no matter which directory
// vitest is invoked from.
function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[motion] workspace root not found");
    dir = parent;
  }
}

// Guards against drift between the compiler and the checked-in tokens:
// regenerate with `pnpm --filter @solidix/motion run build` then
// `pnpm --filter @solidix/motion run gen:springs`.
describe("springs.css", () => {
  test("preset tokens match compiler output", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "motion", "src", "springs.css"),
      "utf8",
    );
    for (const name of Object.keys(springPresets) as SpringPresetName[]) {
      const match = css.match(new RegExp(`--solidix-spring-${name}:\\s*(linear\\([^;]+\\));`));
      expect(match?.[1]).toBe(createSpring(springPresets[name]));
    }
  });
});
