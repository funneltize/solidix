import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { Calendar, addDays, addMonths } from "../src/index";

afterEach(cleanup);

describe("day helpers", () => {
  it("adds days and months across edges", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
  });
});

describe("Calendar", () => {
  it("selects a day on click and pages by month", async () => {
    const onValueChange = vi.fn();
    render(() => <Calendar defaultValue="2026-03-04" onValueChange={onValueChange} />);
    await screen.findByText("March 2026");
    fireEvent.click(screen.getByRole("button", { name: "Mar 10, 2026" }));
    flush();
    expect(onValueChange).toHaveBeenCalledWith("2026-03-10");

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    flush();
    await screen.findByText("April 2026");
  });

  it("builds a range from two clicks", async () => {
    const onRangeChange = vi.fn();
    render(() => <Calendar mode="range" defaultValue="2026-03-04" onRangeChange={onRangeChange} />);
    await screen.findByText("March 2026");
    fireEvent.click(screen.getByRole("button", { name: "Mar 4, 2026" }));
    flush();
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: "2026-03-04" });
    fireEvent.click(screen.getByRole("button", { name: "Mar 12, 2026" }));
    flush();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: "2026-03-04",
      end: "2026-03-12",
    });
  });

  it("respects min and max", async () => {
    render(() => <Calendar defaultValue="2026-03-10" min="2026-03-05" max="2026-03-20" />);
    const before = (await screen.findByRole("button", {
      name: "Mar 3, 2026",
    })) as HTMLButtonElement;
    expect(before.disabled).toBe(true);
  });
});
