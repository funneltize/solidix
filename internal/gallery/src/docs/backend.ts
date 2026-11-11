import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "backend",
  title: "Backend",
  metaDescription:
    "Compact SaaS backend UI: app shell, density, and data patterns built on @solidix/frosted.",
  ariaLink: "",
  description:
    "Backend supplies the SaaS opinions Frosted leaves to the app: frame-first shell, compact density, dense data tables, settings rhythm, and workflow bars. It composes Frosted controls and never repaints them. The preview below is a working console: Overview dashboard, Customers data page, and Settings, with Cmd+K navigation.",
  features: [
    "Frame-first AppShell with Sidebar, TopBar, Main, and Inspector regions that scroll independently.",
    "Compact by default; one density token on BackendTheme flips a subtree to comfortable.",
    "DataTable with sticky header, column sorting, and stable-key selection; FilterBar swaps to BulkBar in place.",
    "CommandMenu on Cmd+K or Ctrl+K, Confirm naming the destroyed object, and a dirty-state SaveBar.",
    "Agent-ready: AGENT.md cheat sheet plus a drift-checked components.json index.",
  ],
  anatomyIntro: "Theme once, build the frame, then fill one content region per page.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { Backend } from "solidix";\n\nexport default () => (\n  <Backend.BackendTheme density="compact">\n    <Backend.AppShell>\n      <Backend.Sidebar><Backend.NavList items={nav} /></Backend.Sidebar>\n      <Backend.Main>\n        <Backend.TopBar>Acme Console</Backend.TopBar>\n        <Backend.PageHeader title="Customers" />\n        <Backend.DataTable columns={columns} rows={rows} selectable />\n      </Backend.Main>\n    </Backend.AppShell>\n  </Backend.BackendTheme>\n);',
  },
  parts: [
    {
      name: "BackendTheme",
      description: "Theme root bridging Frosted Theme (appearance, accent) with backend density.",
      props: [
        {
          name: "density",
          type: '"compact" | "comfortable"',
          default: "compact",
          description: "Density inherited by every backend part in the subtree.",
        },
        {
          name: "appearance",
          type: '"inherit" | "light" | "dark"',
          description: "Passed through to Frosted Theme.",
        },
      ],
      dataAttributes: [
        { attribute: "data-backend-root", values: [""] },
        { attribute: "data-density", values: ["compact", "comfortable"] },
      ],
      cssVariables: [],
    },
    {
      name: "AppShell",
      description: "Frame-first shell root. Compose with Sidebar, Main, TopBar, and Inspector.",
      props: [
        {
          name: "collapsed (Sidebar)",
          type: "boolean",
          description: "Collapsed icon-rail sidebar width.",
        },
      ],
      dataAttributes: [
        {
          attribute: "data-backend-part",
          values: ["shell", "sidebar", "main", "topbar", "inspector"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "NavList",
      description: "Grouped sidebar navigation with badges and a single active item.",
      props: [
        {
          name: "groups",
          type: "NavGroup[]",
          description: "Grouped entries; takes precedence over items.",
        },
        {
          name: "activeId / defaultActiveId",
          type: "string",
          description: "Controlled or initial active item, by stable id.",
        },
        {
          name: "onActiveChange",
          type: "(id: string) => void",
          description: "Reports selection; routing stays in the app.",
        },
      ],
      dataAttributes: [{ attribute: "data-backend-part", values: ["nav-list"] }],
      cssVariables: [],
    },
    {
      name: "DataTable",
      description: "Dense table presenting rows it is given, with sorting and selection.",
      props: [
        {
          name: "columns",
          type: "DataColumn[]",
          required: true,
          description: "Header, alignment, sortValue, and optional render per column.",
        },
        {
          name: "rows",
          type: "Row[]",
          required: true,
          description: "Presented rows; fetching and full-set filtering stay in the app.",
        },
        {
          name: "selectable",
          type: "boolean",
          description: "Row checkboxes keyed by stable row id.",
        },
        {
          name: "onSortChange / onSelectionChange",
          type: "handlers",
          description: "Next sort or selected id list after each interaction.",
        },
      ],
      dataAttributes: [{ attribute: "data-backend-part", values: ["data-table"] }],
      cssVariables: [],
    },
    {
      name: "Workflow",
      description: "CommandMenu, EmptyState, Stat and StatGrid, Confirm, and SaveBar.",
      props: [
        {
          name: "groups (CommandMenu)",
          type: "CommandMenuGroup[]",
          required: true,
          description: "Palette rows filtered by label and keywords; opens on Cmd+K.",
        },
        {
          name: "title / confirmLabel (Confirm)",
          type: "string",
          required: true,
          description: "Must name the object being destroyed.",
        },
        {
          name: "visible (SaveBar)",
          type: "boolean",
          required: true,
          description: "Render the bar only while the form is dirty.",
        },
      ],
      dataAttributes: [
        {
          attribute: "data-backend-part",
          values: ["command-menu", "empty-state", "stat", "confirm", "save-bar"],
        },
      ],
      cssVariables: [],
    },
  ],
  examples: [
    {
      title: "Data page recipe",
      description:
        "Search, sort, select, and page without leaving the frame. See the Customers view in the preview.",
      blocks: [
        {
          lang: "jsx",
          highlights: [],
          code: '<FilterBar query={query()} onQueryChange={setQuery} resultCount="6 results" />\n<DataTable selectable columns={columns} rows={pageRows()} selectedIds={selected()} onSelectionChange={setSelected} />\n<Pagination page={page()} totalPages={2} onPageChange={setPage} />',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Behavior comes from Frosted and headless primitives: native tabbable nav and sort controls, labelled selection checkboxes with a polite selected-count live region, dialog focus management for the palette and confirmation, and scoped focus-visible rings with a reduced-motion collapse in the token layer.",
  keyboard: [
    { keys: ["Cmd+K", "Ctrl+K"], description: "Open or close the command palette." },
    {
      keys: ["Tab"],
      description: "Reach nav items, sort buttons, checkboxes, and page controls in order.",
    },
    { keys: ["Enter", "Space"], description: "Activate the focused nav item, sort, or button." },
    { keys: ["Escape"], description: "Close the command palette or confirmation dialog." },
  ],
  notes:
    "Backend is opinionated by design: no asChild on blocks, restyle through --solidix-backend-* tokens. Copy tokens.css and backend.css from the package (JSR ships JS only). Full rationale: docs/backend-ui-design.md; agent cheat sheet: packages/solid/backend/AGENT.md.",
};
