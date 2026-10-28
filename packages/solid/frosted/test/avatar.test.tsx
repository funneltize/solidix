import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Avatar } from "../src/index";

/** Image mock that reports loaded as soon as `src` is set (headless precedent). */
class MockImage extends EventTarget {
  _src = "";

  get src(): string {
    return this._src;
  }

  set src(src: string) {
    if (!src) {
      return;
    }
    this._src = src;
    queueMicrotask(() => this.dispatchEvent(new Event("load")));
  }

  get complete(): boolean {
    return this._src !== "";
  }

  get naturalWidth(): number {
    return this.complete ? 300 : 0;
  }
}

const originalGlobalImage = window.Image;

afterEach(() => {
  window.Image = originalGlobalImage;
});

describe("Avatar", () => {
  it("renders the image once loaded, with fallback initials meanwhile", async () => {
    window.Image = MockImage as unknown as typeof Image;
    render(() => <Avatar src="https://example.com/ada.jpg" alt="Ada" fallback="Ada Lovelace" />);
    const image = (await screen.findByRole("img")) as HTMLImageElement;
    expect(image.classList.contains("fui-AvatarImage")).toBe(true);
    expect(image.getAttribute("src")).toBe("https://example.com/ada.jpg");
    const root = image.closest(".fui-AvatarRoot");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("fui-r-size-3")).toBe(true);
    expect(root?.classList.contains("fui-shape-circle")).toBe(true);
  });

  it("marks one- and two-letter fallbacks", async () => {
    const { unmount } = render(() => <Avatar fallback="A" />);
    expect((await screen.findByText("A")).classList.contains("fui-one-letter")).toBe(true);
    unmount();
    render(() => <Avatar fallback="Ada Lovelace" />);
    expect((await screen.findByText("AL")).classList.contains("fui-two-letters")).toBe(true);
  });

  it("passes element fallbacks through untouched", async () => {
    render(() => <Avatar fallback={<span data-testid="custom">X</span>} />);
    expect(await screen.findByTestId("custom")).not.toBeNull();
  });

  it("applies size, shape, color, and high-contrast", async () => {
    render(() => (
      <Avatar fallback="Ada Lovelace" size="6" shape="square" color="plum" highContrast />
    ));
    const root = (await screen.findByText("AL")).closest(".fui-AvatarRoot");
    expect(root?.classList.contains("fui-r-size-6")).toBe(true);
    expect(root?.classList.contains("fui-shape-square")).toBe(true);
    expect(root?.classList.contains("fui-high-contrast")).toBe(true);
    expect(root?.getAttribute("data-accent-color")).toBe("plum");
  });
});
