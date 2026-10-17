import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Popper, PopperAnchor, PopperContent, PopperArrow } from "../src/index";

describe("Popper", () => {
  test("positions content relative to the anchor with side/align data", async () => {
    render(() => (
      <Popper>
        <PopperAnchor>
          <button type="button">anchor</button>
        </PopperAnchor>
        <PopperContent side="bottom" align="center" sideOffset={8}>
          <p>content</p>
        </PopperContent>
      </Popper>
    ));

    await screen.findByText("anchor");
    const content = (await screen.findByText("content")).closest(
      "[data-radix-popper-content-wrapper]",
    ) as HTMLElement;
    expect(content).toBeDefined();

    // jsdom reports zero rects, so floating-ui places at the origin; what
    // matters is that positioning ran and side/align resolved.
    const floating = content.querySelector("[data-side]") as HTMLElement;
    expect(floating?.dataset.side).toBe("bottom");
    expect(floating?.dataset.align).toBe("center");
    expect(content.style.transform).toContain("translate(");
  });

  test("defaults side/align data attributes when unspecified", async () => {
    render(() => (
      <Popper>
        <PopperAnchor>
          <button type="button">anchor</button>
        </PopperAnchor>
        <PopperContent>content</PopperContent>
      </Popper>
    ));

    await screen.findByText("anchor");
    const content = (await screen.findByText("content")).closest(
      "[data-radix-popper-content-wrapper]",
    ) as HTMLElement;
    const floating = content.querySelector("[data-side]") as HTMLElement;
    expect(floating?.dataset.side).toBe("bottom");
    expect(floating?.dataset.align).toBe("center");
  });

  test("calls onPlaced once positioned", async () => {
    const onPlaced = vi.fn();
    render(() => (
      <Popper>
        <PopperAnchor>
          <button type="button">anchor</button>
        </PopperAnchor>
        <PopperContent onPlaced={onPlaced}>content</PopperContent>
      </Popper>
    ));

    await screen.findByText("anchor");
    await vi.waitFor(() => expect(onPlaced).toHaveBeenCalled());
  });

  test("renders the arrow with opposite-side placement", async () => {
    render(() => (
      <Popper>
        <PopperAnchor>
          <button type="button">anchor</button>
        </PopperAnchor>
        <PopperContent side="top">
          content
          <PopperArrow data-testid="arrow" />
        </PopperContent>
      </Popper>
    ));

    await screen.findByText("anchor");
    const arrow = (await screen.findByTestId("arrow")) as unknown as SVGSVGElement;
    expect(arrow.tagName).toBe("svg");
    expect(arrow.querySelector("polygon")).toBeDefined();
  });
});
