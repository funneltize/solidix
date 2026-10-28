import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Kbd, kbdPropDefs } from "../src/index";

describe("Kbd", () => {
  it("renders a kbd element with the fui-Kbd class", async () => {
    render(() => <Kbd>Ctrl</Kbd>);
    const el = await screen.findByText("Ctrl");
    expect(el.tagName).toBe("KBD");
    expect(el.classList.contains("fui-Kbd")).toBe(true);
  });

  it("applies the size class when size is set", async () => {
    render(() => <Kbd size="2">Shift</Kbd>);
    const el = await screen.findByText("Shift");
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
  });

  it("merges the consumer class with fui-Kbd", async () => {
    render(() => <Kbd class="custom">Alt</Kbd>);
    const el = await screen.findByText("Alt");
    expect(el.classList.contains("fui-Kbd")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes kbdPropDefs with the documented defaults", () => {
    expect(kbdPropDefs.size.default).toBeUndefined();
  });
});
