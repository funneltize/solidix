import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { SegmentedControlRadioGroup } from "../src/index";

describe("SegmentedControlRadioGroup", () => {
  it("bridges data-checked onto the selected segment", async () => {
    render(() => (
      <SegmentedControlRadioGroup.Root defaultValue="one">
        <SegmentedControlRadioGroup.Item value="one">One</SegmentedControlRadioGroup.Item>
        <SegmentedControlRadioGroup.Item value="two">Two</SegmentedControlRadioGroup.Item>
      </SegmentedControlRadioGroup.Root>
    ));
    // The frosted CSS keys the selected pill on `data-checked` (Base UI
    // parity); the headless primitive only emits `data-state`.
    const first = await screen.findByRole("radio", { name: "One" });
    expect(first.classList.contains("fui-BaseSegmentedControlTrigger")).toBe(true);
    expect(first.hasAttribute("data-checked")).toBe(true);
    fireEvent.click(await screen.findByRole("radio", { name: "Two" }));
    expect(await screen.findByRole("radio", { name: "Two" })).not.toBeNull();
    expect(first.hasAttribute("data-checked")).toBe(false);
    expect(screen.getByRole("radio", { name: "Two" }).hasAttribute("data-checked")).toBe(true);
  });
});
