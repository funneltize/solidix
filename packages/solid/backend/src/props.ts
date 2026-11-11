/* Machine-readable prop definitions, mirroring the Frosted `*.props.ts`
 * convention in lightweight form: agents and docs read props, defaults,
 * and enum values here without opening component source. A drift test
 * pins the defaults that behavior depends on. */

/** One prop definition: type, optional enum values, default, and job. */
export type BackendPropDef = {
  /** Prop type as written in the public API, for example `boolean`. */
  type: string;
  /** Allowed values for enum props. */
  values?: readonly string[] | undefined;
  /** Default applied when the prop is omitted. */
  default?: string | number | boolean | undefined;
  /** One-line description for humans and agents. */
  description: string;
};

/** Prop definitions for `BackendTheme`. */
export const backendThemePropDefs = {
  density: {
    type: '"compact" | "comfortable"',
    values: ["compact", "comfortable"],
    default: "compact",
    description: "Density inherited by every backend part.",
  },
  appearance: {
    type: '"inherit" | "light" | "dark"',
    description: "Passed through to Frosted Theme.",
  },
} satisfies Record<string, BackendPropDef>;

/** Prop definitions for `NavList`. */
export const navListPropDefs = {
  groups: { type: "NavGroup[]", description: "Grouped entries; takes precedence over items." },
  items: { type: "NavItem[]", description: "Ungrouped entries, shorthand for one group." },
  activeId: { type: "string", description: "Controlled active item id." },
  defaultActiveId: { type: "string", description: "Initial active item id for uncontrolled use." },
  collapsed: {
    type: "boolean",
    default: false,
    description: "Icon-rail mode: labels hide, names remain.",
  },
} satisfies Record<string, BackendPropDef>;

/** Prop definitions for `DataTable`. */
export const dataTablePropDefs = {
  columns: { type: "DataColumn[]", description: "Column definitions in display order." },
  rows: { type: "Row[]", description: "Rows to present; the app owns fetching." },
  selectable: {
    type: "boolean",
    default: false,
    description: "Row checkboxes keyed by stable id.",
  },
  sortMode: {
    type: '"client" | "server"',
    values: ["client", "server"],
    default: "client",
    description: "Server mode reports sort without reordering rows.",
  },
  virtual: {
    type: "{ rowHeight?: number; height?: number; overscan?: number }",
    description: "Opt-in windowing for large row sets.",
  },
  caption: { type: "string", description: "Accessible table caption." },
} satisfies Record<string, BackendPropDef>;

/** Prop definitions for `FilterBar`. */
export const filterBarPropDefs = {
  query: { type: "string", description: "Controlled search query." },
  defaultQuery: { type: "string", default: "", description: "Initial query for uncontrolled use." },
  placeholder: {
    type: "string",
    default: "Search",
    description: "Search input placeholder, never its label.",
  },
  resultCount: { type: "string", description: "Result count text after the filters." },
} satisfies Record<string, BackendPropDef>;

/** Prop definitions for `Pagination`. */
export const paginationPropDefs = {
  page: { type: "number", description: "Current page, 1-based. Controlled." },
  totalPages: { type: "number", description: "Total page count, at least 1." },
} satisfies Record<string, BackendPropDef>;

/** Prop definitions for `SettingsLayout`. */
export const settingsLayoutPropDefs = {
  sections: { type: "SettingsSection[]", description: "Sections in display order." },
  activeId: { type: "string", description: "Controlled active section id." },
  defaultActiveId: {
    type: "string",
    description: "Initial section; defaults to the first section.",
  },
} satisfies Record<string, BackendPropDef>;

/** Prop definitions for `SaveBar`. */
export const saveBarPropDefs = {
  visible: { type: "boolean", description: "Render the bar only while dirty." },
  message: { type: "string", default: "Unsaved changes", description: "Status text in the bar." },
  saveLabel: { type: "string", default: "Save changes", description: "Save button label." },
} satisfies Record<string, BackendPropDef>;
