import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { FilterChip } from "../src/index";

describe("FilterChip", () => {
  it("renders an unchecked chip with size and accent color", async () => {
    render(() => <FilterChip>Filter</FilterChip>);
    const chip = await screen.findByText("Filter");
    expect(chip.getAttribute("role")).toBe("checkbox");
    expect(chip.classList.contains("fui-BaseChip")).toBe(true);
    expect(chip.classList.contains("fui-r-size-2")).toBe(true);
    expect(chip.hasAttribute("data-unchecked")).toBe(true);
    expect(chip.hasAttribute("data-checked")).toBe(false);
    expect(chip.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles on click", async () => {
    const onCheckedChange = vi.fn();
    render(() => <FilterChip onCheckedChange={onCheckedChange}>Filter</FilterChip>);
    const chip = await screen.findByText("Filter");
    fireEvent.click(chip);
    // Uncontrolled `onChange` fires from an effect: flush first.
    await flush();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(chip.hasAttribute("data-checked")).toBe(true);
    expect(chip.getAttribute("aria-checked")).toBe("true");
  });

  it("respects controlled checked and size/color props", async () => {
    render(() => (
      <FilterChip checked size="3" color="blue">
        Filter
      </FilterChip>
    ));
    const chip = await screen.findByText("Filter");
    expect(chip.hasAttribute("data-checked")).toBe(true);
    expect(chip.classList.contains("fui-r-size-3")).toBe(true);
    expect(chip.getAttribute("data-accent-color")).toBe("blue");
  });

  it("renders disabled chips", async () => {
    render(() => <FilterChip disabled>Filter</FilterChip>);
    const chip = await screen.findByText("Filter");
    expect(chip.hasAttribute("data-disabled")).toBe(true);
  });
});
