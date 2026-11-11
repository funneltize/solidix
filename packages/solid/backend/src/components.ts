/** Machine-readable backend component index. Checked against
 * `components.json` by a drift test so agents never guess imports. */

/** One entry in the backend component index. */
export type BackendComponentInfo = {
  /** Exported component name. */
  name: string;
  /** Import path from the package root. */
  from: string;
  /** One-line job, written for humans and agents. */
  job: string;
};

/** Canonical backend component index. */
export const backendComponents: BackendComponentInfo[] = [
  {
    name: "BackendTheme",
    from: "@solidix/backend",
    job: "Theme root bridging Frosted Theme with backend density",
  },
  {
    name: "AppShell",
    from: "@solidix/backend",
    job: "Frame-first shell root; regions scroll independently",
  },
  {
    name: "Sidebar",
    from: "@solidix/backend",
    job: "Shell sidebar region with collapsed icon-rail mode",
  },
  { name: "Main", from: "@solidix/backend", job: "Shell main content region" },
  {
    name: "TopBar",
    from: "@solidix/backend",
    job: "Shell top bar budget with leading, center, trailing slots",
  },
  { name: "Inspector", from: "@solidix/backend", job: "Optional shell inspector region" },
  {
    name: "PageHeader",
    from: "@solidix/backend",
    job: "Canonical page header with one primary action slot",
  },
  {
    name: "NavList",
    from: "@solidix/backend",
    job: "Grouped sidebar navigation with badges and active state",
  },
  {
    name: "SettingsLayout",
    from: "@solidix/backend",
    job: "Settings section nav plus panel layout",
  },
  {
    name: "FieldRow",
    from: "@solidix/backend",
    job: "Label, control, hint, and error in one settings row",
  },
  {
    name: "CommandMenu",
    from: "@solidix/backend",
    job: "Cmd+K command palette composed from Frosted",
  },
  { name: "EmptyState", from: "@solidix/backend", job: "Centered empty pattern for data surfaces" },
  { name: "Stat", from: "@solidix/backend", job: "Single dashboard metric with delta" },
  { name: "StatGrid", from: "@solidix/backend", job: "Responsive grid of Stat widgets" },
  { name: "Confirm", from: "@solidix/backend", job: "Destructive confirmation naming the object" },
  {
    name: "SaveBar",
    from: "@solidix/backend",
    job: "Sticky dirty-state bar with save and discard",
  },
  { name: "DataList", from: "@solidix/backend", job: "Edge-to-edge stack of data rows" },
  {
    name: "DataTable",
    from: "@solidix/backend",
    job: "Dense table with sorting and stable-key selection",
  },
  {
    name: "DataSkeleton",
    from: "@solidix/backend",
    job: "Pulsing placeholder rows while data loads",
  },
  {
    name: "FilterBar",
    from: "@solidix/backend",
    job: "Search, filter slots, and result count bar",
  },
  {
    name: "Pagination",
    from: "@solidix/backend",
    job: "Controlled page navigation with disabled ends",
  },
  { name: "BulkBar", from: "@solidix/backend", job: "Bulk actions shown while rows are selected" },
  {
    name: "DataRow",
    from: "@solidix/backend",
    job: "Dense edge-to-edge data row with tabular value",
  },
];
