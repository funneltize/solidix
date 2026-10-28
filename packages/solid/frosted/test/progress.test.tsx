import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Progress } from "../src/index";

describe("Progress", () => {
  it("renders a progressbar with track and width-driven indicator", async () => {
    render(() => <Progress value={50} />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.classList.contains("fui-ProgressRoot")).toBe(true);
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.querySelector(".fui-ProgressTrack")).not.toBeNull();
    const indicator = bar.querySelector(".fui-ProgressIndicator") as HTMLElement;
    expect(indicator.style.width).toBe("50%");
  });

  it("clamps the indicator width to 0-100%", async () => {
    const { unmount } = render(() => <Progress value={250} />);
    expect(
      (
        (await screen.findByRole("progressbar")).querySelector(
          ".fui-ProgressIndicator",
        ) as HTMLElement
      ).style.width,
    ).toBe("100%");
    unmount();
    render(() => <Progress value={-20} />);
    expect(
      (
        (await screen.findByRole("progressbar")).querySelector(
          ".fui-ProgressIndicator",
        ) as HTMLElement
      ).style.width,
    ).toBe("0%");
  });

  it("applies size, high-contrast, and accent color classes", async () => {
    render(() => <Progress value={10} size="2" color="green" highContrast />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.classList.contains("fui-r-size-2")).toBe(true);
    expect(bar.classList.contains("fui-high-contrast")).toBe(true);
    expect(bar.getAttribute("data-accent-color")).toBe("green");
  });

  it("omits aria-valuenow when value is null", async () => {
    render(() => <Progress value={null} />);
    const bar = await screen.findByRole("progressbar");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });
});
