import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { Calendar, DatePicker, DateRangePicker } from "../src/index";

afterEach(cleanup);

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

describe("Calendar (frosted)", () => {
  it("marks the selected day", async () => {
    render(() => <Calendar defaultValue="2026-03-04" />);
    const day = await screen.findByRole("button", { name: "Mar 4, 2026" });
    expect(day.hasAttribute("data-selected")).toBe(true);
    expect(day.closest(".fui-Calendar")).toBeTruthy();
  });
});

describe("DatePicker", () => {
  it("opens, picks a day, and closes", async () => {
    const onValueChange = vi.fn();
    render(() => <DatePicker onValueChange={onValueChange} placeholder="Pick a date" />);
    fireEvent.click(screen.getByRole("button", { name: "Choose a date" }));
    flush();
    const day = document.querySelector<HTMLButtonElement>("[data-day]");
    fireEvent.click(day!);
    flush();
    expect(onValueChange).toHaveBeenCalled();
  });
});

describe("DateRangePicker", () => {
  it("summarizes a chosen range", async () => {
    const onRangeChange = vi.fn();
    render(() => <DateRangePicker onRangeChange={onRangeChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose dates" }));
    flush();
    const days = [...document.querySelectorAll<HTMLButtonElement>("[data-day]")];
    fireEvent.click(days[10]!);
    flush();
    fireEvent.click(days[15]!);
    flush();
    expect(onRangeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ end: expect.any(String) }),
    );
  });
});
