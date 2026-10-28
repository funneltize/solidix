import { describe, expect, it } from "vitest";
import {
  compactTickFormat,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatUtcDate,
  tickFormatForStep,
} from "../src/format";

describe("formatNumber", () => {
  it("groups thousands by default", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("honors a d3 specifier", () => {
    expect(formatNumber(1.234, ".2f")).toBe("1.23");
  });
});

describe("formatCompact", () => {
  it("abbreviates large values", () => {
    expect(formatCompact(1500)).toBe("1.5K");
    expect(formatCompact(2_000_000)).toBe("2M");
  });

  it("handles zero and sub-unit values", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(3.5)).toBe("3.5");
  });
});

describe("formatPercent", () => {
  it("formats fractions as percents", () => {
    expect(formatPercent(0.256, 1)).toBe("25.6%");
    expect(formatPercent(0.25)).toBe("25%");
  });
});

describe("formatCurrency", () => {
  it("formats small values with cents", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
  });

  it("compacts large values", () => {
    expect(formatCurrency(25000)).toBe("$25K");
    expect(formatCurrency(1500, true)).toBe("$1.5K");
  });
});

describe("formatDate and formatUtcDate", () => {
  it("formats with the default specifier", () => {
    const date = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));
    expect(formatUtcDate(date)).toBe("Jan 15, 2026");
    expect(formatDate(date, "%Y")).toBe("2026");
  });
});

describe("formatDuration", () => {
  it("renders hours, minutes and seconds", () => {
    expect(formatDuration(3_700_000)).toBe("1h 1m");
    expect(formatDuration(90_000)).toBe("1m 30s");
    expect(formatDuration(45_000)).toBe("45s");
  });

  it("renders a dash for non-finite input", () => {
    expect(formatDuration(Number.NaN)).toBe("-");
  });
});

describe("tickFormatForStep and compactTickFormat", () => {
  it("adapts precision to the tick step", () => {
    expect(tickFormatForStep(0.5)(3.75)).toBe("3.8");
    expect(tickFormatForStep(10)(120)).toBe("120");
  });

  it("keeps every tick in the same compact unit", () => {
    const format = compactTickFormat(25000);
    expect(format(120)).toContain("k");
    expect(format(25000)).toBe("25k");
  });
});
