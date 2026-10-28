import { describe, expect, it } from "vitest";
import {
  DEFAULT_LABEL_KEY,
  PALETTE_FALLBACKS,
  PALETTE_SIZE,
  cellValue,
  computeStackOffsets,
  itemsEqual,
  rowLabel,
  seriesColor,
  stackedExtent,
  toNumber,
  type SeriesDescriptor,
} from "../src/types";

describe("toNumber", () => {
  it("accepts finite numbers", () => {
    expect(toNumber(12.5)).toBe(12.5);
    expect(toNumber(0)).toBe(0);
  });

  it("parses numeric strings", () => {
    expect(toNumber("12")).toBe(12);
    expect(toNumber(" 3.5 ")).toBe(3.5);
  });

  it("rejects blanks and non-finite values", () => {
    expect(toNumber("")).toBeUndefined();
    expect(toNumber("abc")).toBeUndefined();
    expect(toNumber(null)).toBeUndefined();
    expect(toNumber(undefined)).toBeUndefined();
    expect(toNumber(Number.NaN)).toBeUndefined();
    expect(toNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
  });
});

describe("cellValue and rowLabel", () => {
  it("reads raw cells and row labels", () => {
    const row = { label: "Q1", revenue: 120 };
    expect(cellValue(row, "revenue")).toBe(120);
    expect(rowLabel(row, DEFAULT_LABEL_KEY, 0)).toBe("Q1");
  });

  it("falls back to the row index when the label key is missing", () => {
    expect(rowLabel({ revenue: 1 }, "label", 2)).toBe("2");
  });

  it("stringifies Date labels", () => {
    const date = new Date(Date.UTC(2026, 0, 1));
    expect(rowLabel({ label: date }, "label", 0)).toBe(date.toISOString());
  });
});

describe("seriesColor", () => {
  it("prefers an explicit color", () => {
    expect(seriesColor({ color: "#123456" }, 0)).toBe("#123456");
  });

  it("uses explicit colorIndex when set", () => {
    expect(seriesColor({ colorIndex: 3 }, 0)).toBe(`var(--sx-color-4, ${PALETTE_FALLBACKS[3]})`);
  });

  it("maps position onto palette slots through CSS variables", () => {
    expect(seriesColor({}, 1)).toBe(`var(--sx-color-2, ${PALETTE_FALLBACKS[1]})`);
    expect(seriesColor({}, PALETTE_SIZE)).toBe(`var(--sx-color-1, ${PALETTE_FALLBACKS[0]})`);
  });
});

const stackSeries: ReadonlyArray<SeriesDescriptor> = [
  { id: "a", valueKey: "a" },
  { id: "b", valueKey: "b" },
];

describe("computeStackOffsets", () => {
  it("stacks positives bottom-up per row", () => {
    const out = computeStackOffsets(
      [
        { a: 10, b: 5 },
        { a: 4, b: 6 },
      ],
      stackSeries,
      "normal",
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ seriesId: "a", baselines: [0, 0] });
    expect(out[1]).toEqual({ seriesId: "b", baselines: [10, 4] });
  });

  it("tracks negatives downward from the baseline", () => {
    const out = computeStackOffsets([{ a: -10, b: 5 }], stackSeries, "normal");
    expect(out[0]).toEqual({ seriesId: "a", baselines: [0] });
    expect(out[1]).toEqual({ seriesId: "b", baselines: [0] });
  });

  it("normalizes rows in percent mode", () => {
    const out = computeStackOffsets([{ a: 10, b: 30 }], stackSeries, "percent");
    expect(out[0]).toEqual({ seriesId: "a", baselines: [0] });
    expect(out[1]).toEqual({ seriesId: "b", baselines: [0.25] });
  });

  it("treats missing cells as zero", () => {
    const out = computeStackOffsets([{ a: 10 }, { b: 7 }], stackSeries, "normal");
    expect(out[0]).toEqual({ seriesId: "a", baselines: [0, 0] });
    expect(out[1]).toEqual({ seriesId: "b", baselines: [10, 0] });
  });
});

describe("stackedExtent", () => {
  it("spans stacked tops and the zero baseline", () => {
    const dataset = [
      { a: 10, b: 5 },
      { a: 4, b: 6 },
    ];
    const offsets = computeStackOffsets(dataset, stackSeries, "normal");
    expect(stackedExtent(dataset, stackSeries, offsets, "normal")).toEqual([0, 15]);
  });

  it("covers raw values without stacking", () => {
    const dataset = [{ a: -3, b: 5 }];
    expect(stackedExtent(dataset, stackSeries, undefined, "none")).toEqual([-3, 5]);
  });

  it("returns a zero domain for empty input", () => {
    expect(stackedExtent([], [], undefined, "none")).toEqual([0, 0]);
  });
});

describe("itemsEqual", () => {
  it("compares item refs with null tolerance", () => {
    expect(itemsEqual(null, null)).toBe(true);
    expect(itemsEqual({ seriesId: "a", rowIndex: 0 }, { seriesId: "a", rowIndex: 0 })).toBe(true);
    expect(itemsEqual({ seriesId: "a", rowIndex: 0 }, { seriesId: "a", rowIndex: 1 })).toBe(false);
    expect(itemsEqual({ seriesId: "a", rowIndex: 0 }, { seriesId: "b", rowIndex: 0 })).toBe(false);
    expect(itemsEqual({ seriesId: "a", rowIndex: 0 }, null)).toBe(false);
    expect(itemsEqual(null, { seriesId: "a", rowIndex: 0 })).toBe(false);
  });
});
