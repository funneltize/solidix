import type { Dataset, SeriesDescriptor } from "../src/types";

/** Standard category dataset shared by chart tests: three quarters. */
export function datasetFixture(): Dataset {
  return [
    { label: "Q1", revenue: 120, profit: 30 },
    { label: "Q2", revenue: 150, profit: 45 },
    { label: "Q3", revenue: 90, profit: 60 },
  ];
}

/** Two-series descriptor fixture: Revenue (revenue) and Profit (profit). */
export function seriesFixture(): SeriesDescriptor[] {
  return [
    { id: "revenue", label: "Revenue", valueKey: "revenue" },
    { id: "profit", label: "Profit", valueKey: "profit" },
  ];
}

/** Dataset with a gap: Q2 profit is missing (gap-break coverage). */
export function gappedDatasetFixture(): Dataset {
  return [
    { label: "Q1", revenue: 120, profit: 30 },
    { label: "Q2", revenue: 150 },
    { label: "Q3", revenue: 90, profit: 60 },
  ];
}
