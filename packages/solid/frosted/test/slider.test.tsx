// Solidix-authored behavior tests for the frosted Slider port. No upstream
// test suite exists at the pinned commit, so these assert the render contract
// observed in upstream `slider.tsx` (root class, control, track, range, one
// thumb per value entry, data attributes) plus the value contract from
// `@solidix/slider`. Rendered bare like the other frosted tests - `Theme`
// needs `window.matchMedia`, which jsdom does not provide.
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { Slider } from "../src/index.js";

describe("Slider", () => {
  it("renders a root with track, range, and one thumb for a single value", async () => {
    render(() => <Slider aria-label="volume" defaultValue={[30]} />);
    const thumbs = await screen.findAllByRole("slider");
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("30");
    expect(thumbs[0]?.classList.contains("fui-SliderThumb")).toBe(true);
    const root = document.querySelector(".fui-SliderRoot");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("fui-r-size-2")).toBe(true);
    // Upstream `color` has no default (`sliderPropDefs.color.default` is
    // undefined), so `data-accent-color` is absent until set; `Theme`
    // provides the ambient accent instead.
    expect(root?.hasAttribute("data-accent-color")).toBe(false);
    expect(root?.querySelector(".fui-SliderControl")).not.toBeNull();
    expect(root?.querySelector(".fui-SliderTrack")).not.toBeNull();
    expect(root?.querySelector(".fui-SliderRange")).not.toBeNull();
  });

  it("renders one thumb per value entry", async () => {
    render(() => <Slider aria-label="range" defaultValue={[20, 80]} />);
    const thumbs = await screen.findAllByRole("slider");
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]?.getAttribute("aria-valuenow")).toBe("20");
    expect(thumbs[1]?.getAttribute("aria-valuenow")).toBe("80");
  });

  it("applies size, color, and highContrast styling props", async () => {
    render(() => <Slider aria-label="styled" size="1" color="ruby" highContrast />);
    const root = (await screen.findByRole("slider")).closest(".fui-SliderRoot");
    expect(root?.classList.contains("fui-r-size-1")).toBe(true);
    expect(root?.classList.contains("fui-high-contrast")).toBe(true);
    expect(root?.getAttribute("data-accent-color")).toBe("ruby");
    expect(root?.querySelector(".fui-SliderRange")?.classList.contains("fui-high-contrast")).toBe(
      true,
    );
  });
});
