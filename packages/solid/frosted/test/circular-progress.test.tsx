import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { CircularProgress } from "../src/index";

describe("CircularProgress", () => {
  it("renders a progressbar svg with track and indicator circles", async () => {
    render(() => <CircularProgress value={50} />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.tagName).toBe("svg");
    expect(bar.classList.contains("fui-CircularProgressRoot")).toBe(true);
    expect(bar.classList.contains("fui-CircularProgressSvg")).toBe(true);
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
    expect(bar.querySelector(".fui-CircularProgressTrack")).not.toBeNull();
    const indicator = bar.querySelector(".fui-CircularProgressIndicator");
    expect(indicator?.tagName).toBe("circle");
    expect(indicator?.getAttribute("stroke-linecap")).toBe("round");
  });

  it("hides the indicator at zero progress", async () => {
    render(() => <CircularProgress value={0} />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.querySelector(".fui-CircularProgressTrack")).not.toBeNull();
    expect(bar.querySelector(".fui-CircularProgressIndicator")).toBeNull();
  });

  it("renders a full ring at max", async () => {
    render(() => <CircularProgress value={100} />);
    const bar = await screen.findByRole("progressbar");
    const indicator = bar.querySelector(".fui-CircularProgressIndicator");
    expect(indicator).not.toBeNull();
    expect(indicator?.getAttribute("stroke-dashoffset")).toBe("0");
    expect(indicator?.getAttribute("stroke-linecap")).toBe("butt");
  });

  it("sizes the svg from the size config", async () => {
    render(() => <CircularProgress value={25} size="6" />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.getAttribute("width")).toBe("48");
    expect(bar.getAttribute("height")).toBe("48");
    expect(bar.getAttribute("viewBox")).toBe("0 0 48 48");
    expect(bar.classList.contains("fui-r-size-6")).toBe(true);
  });

  it("applies high-contrast and accent color", async () => {
    render(() => <CircularProgress value={25} color="plum" highContrast />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.classList.contains("fui-high-contrast")).toBe(true);
    expect(bar.getAttribute("data-accent-color")).toBe("plum");
  });
});
