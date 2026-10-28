// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream behavior:
// compound parts under `Lightbox.Root`, portalled `fui-LightboxBackdrop` +
// `div.fui-LightboxContent` siblings, item registration driving the counter,
// and keyboard navigation (Escape closes, arrows move between items).
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Lightbox } from "../src/index";

// `Lightbox.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function openLightbox() {
  render(() => (
    <Lightbox.Root>
      <Lightbox.Trigger index={0}>
        <button type="button">Open</button>
      </Lightbox.Trigger>
      <Lightbox.Content aria-label="Gallery">
        <Lightbox.ItemGroup>
          <Lightbox.Item index={0}>
            <img alt="Photo one" src="/photos/one.jpg" />
          </Lightbox.Item>
          <Lightbox.Item index={1}>
            <img alt="Photo two" src="/photos/two.jpg" />
          </Lightbox.Item>
        </Lightbox.ItemGroup>
        <Lightbox.Counter />
        <Lightbox.Previous>
          <button type="button">Previous</button>
        </Lightbox.Previous>
        <Lightbox.Next>
          <button type="button">Next</button>
        </Lightbox.Next>
        <Lightbox.Close>
          <button type="button">Close</button>
        </Lightbox.Close>
      </Lightbox.Content>
    </Lightbox.Root>
  ));
}

describe("Lightbox", () => {
  it("renders closed, then opens with overlay content", async () => {
    openLightbox();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).not.toBeNull();
  });

  it("applies upstream classes and a 1 of 2 counter", async () => {
    openLightbox();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.classList.contains("fui-LightboxContent")).toBe(true);
    const backdrop = dialog.parentElement?.querySelector(".fui-LightboxBackdrop");
    expect(backdrop?.getAttribute("aria-hidden")).toBe("true");
    expect(
      (await screen.findByText("1 / 2")).classList.contains("fui-LightboxCounter"),
    ).toBe(true);
  });

  it("advances the active item with Previous and Next", async () => {
    openLightbox();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    expect(await screen.findByText("2 / 2")).not.toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Previous" }));
    expect(await screen.findByText("1 / 2")).not.toBeNull();
  });

  it("closes when Close is activated", async () => {
    openLightbox();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes on Escape", async () => {
    openLightbox();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("navigates with arrow keys", async () => {
    openLightbox();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(await screen.findByText("2 / 2")).not.toBeNull();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(await screen.findByText("1 / 2")).not.toBeNull();
  });
});
