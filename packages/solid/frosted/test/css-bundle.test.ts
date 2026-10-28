import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Pins the committed stylesheet bundle against wrong-source CSS regressions:
// five component stylesheets were once ported from the Radix Themes scale
// instead of frosted-ui (circular radios rendered as squares, the slider
// thumb was clipped, buttons lost their type scale). Each assertion names a
// declaration only the upstream frosted-ui source contains. Regenerate the
// bundle with `pnpm gen:css` after touching CSS sources.
const bundle = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

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
    expect(bundle).toMatch(
      /\.fui-Button:where\(\.fui-r-size-2\)\s*\{[^}]*padding-left:\s*12px/s,
    );
    expect(bundle).toMatch(
      /\.fui-IconButton\s*\{[^}]*width:\s*var\(--base-button-height\)/s,
    );
  });

  it("ports the fieldset legend spacing", () => {
    expect(bundle).toMatch(/\.fui-FieldsetLegend\s*\{[^}]*margin-bottom:\s*16px/s);
  });
});
