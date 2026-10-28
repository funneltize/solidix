import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import {
  SkeletonAvatar,
  SkeletonRect,
  SkeletonText,
  skeletonAvatarPropDefs,
  skeletonRectPropDefs,
  skeletonTextPropDefs,
} from "../src/index";

describe("Skeleton", () => {
  it("renders an avatar with size-3 circle defaults", async () => {
    const { container } = render(() => <SkeletonAvatar data-testid="avatar" />);
    const el = await screen.findByTestId("avatar");
    expect(el.classList.contains("fui-SkeletonAvatar")).toBe(true);
    expect(el.classList.contains("fui-r-size-3")).toBe(true);
    expect(el.classList.contains("fui-shape-circle")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBe("gray");
    expect(container.firstElementChild).toBe(el);
  });

  it("applies avatar size, shape, and color", async () => {
    render(() => <SkeletonAvatar data-testid="styled" size="5" shape="square" color="blue" />);
    const el = await screen.findByTestId("styled");
    expect(el.classList.contains("fui-r-size-5")).toBe(true);
    expect(el.classList.contains("fui-shape-square")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBe("blue");
  });

  it("sets a random negative animation delay custom property on mount", async () => {
    render(() => <SkeletonAvatar data-testid="delayed" />);
    const el = await screen.findByTestId("delayed");
    await vi.waitFor(() => {
      const value = el.style.getPropertyValue("--fui-skeleton-animation-delay");
      expect(value).toMatch(/^-\d/);
    });
  });

  it("renders text with size-3 default", async () => {
    render(() => <SkeletonText data-testid="text" />);
    const el = await screen.findByTestId("text");
    expect(el.classList.contains("fui-SkeletonText")).toBe(true);
    expect(el.classList.contains("fui-r-size-3")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBe("gray");
  });

  it("renders a rect without a size class", async () => {
    render(() => <SkeletonRect data-testid="rect" />);
    const el = await screen.findByTestId("rect");
    expect(el.classList.contains("fui-SkeletonRect")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBe("gray");
  });

  it("merges the consumer class", async () => {
    render(() => <SkeletonText data-testid="merged" class="custom" />);
    const el = await screen.findByTestId("merged");
    expect(el.classList.contains("fui-SkeletonText")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes skeleton prop defs with the documented defaults", () => {
    expect(skeletonAvatarPropDefs.size.default).toBe("3");
    expect(skeletonAvatarPropDefs.shape.default).toBe("circle");
    expect(skeletonAvatarPropDefs.color.default).toBe("gray");
    expect(skeletonTextPropDefs.size.default).toBe("3");
    expect(skeletonTextPropDefs.color.default).toBe("gray");
    expect(skeletonRectPropDefs.color.default).toBe("gray");
  });
});
