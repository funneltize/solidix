import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

// Anchor on the workspace root so this works no matter which directory
// vitest is invoked from (top-level import.meta.url is an http: URL under
// vitest's transform, so new URL() anchoring cannot be used here).
function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[frosted] workspace root not found");
    dir = parent;
  }
}

// Pins the committed stylesheet bundle against wrong-source CSS regressions:
// five component stylesheets were once ported from the Radix Themes scale
// instead of frosted-ui (circular radios rendered as squares, the slider
// thumb was clipped, buttons lost their type scale). Each assertion names a
// declaration only the upstream frosted-ui source contains. Regenerate the
// bundle with `pnpm gen:css` after touching CSS sources.
const bundle = readFileSync(
  workspaceFile("packages", "solid", "frosted", "src", "styles.css"),
  "utf8",
);

describe("frosted stylesheet bundle", () => {
  it("ports the radio styles from frosted-ui, not the Radix scale", () => {
    expect(bundle).toMatch(/\.fui-RadioGroupButton\s*\{[^}]*border-radius:\s*100%/s);
    expect(bundle).toMatch(/\.fui-RadioGroupIndicator\s*\{[^}]*transform:\s*scale\(0\.4\)/s);
  });

  it("ports the slider styles with a visible overflow track and knob", () => {
    expect(bundle).toContain(".fui-SliderThumb::after");
    expect(bundle).toMatch(/\.fui-SliderTrack\s*\{[^}]*overflow:\s*visible/s);
  });

  it("ports the button type scale and icon-button sizing", () => {
    expect(bundle).toMatch(/\.fui-Button\s*\{[^}]*font-weight:\s*var\(--font-weight-medium\)/s);
    expect(bundle).toMatch(/\.fui-Button:where\(\.fui-r-size-2\)\s*\{[^}]*padding-left:\s*12px/s);
    expect(bundle).toMatch(/\.fui-IconButton\s*\{[^}]*width:\s*var\(--base-button-height\)/s);
  });

  it("ports the fieldset legend spacing", () => {
    expect(bundle).toMatch(/\.fui-FieldsetLegend\s*\{[^}]*margin-bottom:\s*16px/s);
  });

  it("keeps the text-area chrome layer click-through", () => {
    expect(bundle).toMatch(/\.fui-TextAreaChrome\s*\{[^}]*pointer-events:\s*none/s);
  });

  it("carries the native motion and role tokens", () => {
    expect(bundle).toContain("--duration-2: 150ms");
    expect(bundle).toContain("--duration-dialog: var(--duration-4)");
    expect(bundle).toContain("--radius-dialog: var(--radius-6)");
    expect(bundle).toContain("--elevation-dialog: var(--shadow-6)");
    expect(bundle).toContain("--font-size-micro: 11px");
  });

  it("routes component timing and corners through the tokens", () => {
    expect(bundle).toMatch(/\.fui-DialogContent\s*\{[^}]*var\(--elevation-dialog\)/s);
    expect(bundle).toMatch(/opacity var\(--duration-2\)/);
    expect(bundle).toMatch(/border-radius:\s*var\(--radius-5\)/);
  });

  it("stays inside the bundle size budget", () => {
    // Budgets with headroom over the current bundles (about 412KB full,
    // 316KB lite): growth past this needs a deliberate bump, not drift.
    const full = bundle.length;
    const lite = readFileSync(
      workspaceFile("packages", "solid", "frosted", "src", "styles.lite.css"),
      "utf8",
    ).length;
    expect(full).toBeLessThan(470_000);
    expect(lite).toBeLessThan(370_000);
  });

  it("carries the Stack and Row layout primitives", () => {
    expect(bundle).toMatch(/\.fui-Stack\s*\{[^}]*flex-direction:\s*column/s);
    expect(bundle).toMatch(/\.fui-Row\s*\{[^}]*flex-direction:\s*row/s);
    expect(bundle).toMatch(/\.fui-r-gap-4\s*\{[^}]*gap:\s*var\(--space-4\)/s);
  });
});
