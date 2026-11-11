# @solidix/backend

Compact SaaS backend UI for Solidix: app shell, density, and data patterns built on `@solidix/frosted`.

## Solid API mapping

| Frosted / Radix idea       | Backend (Solid)                                         |
| -------------------------- | ------------------------------------------------------- |
| `className`                | `class`                                                 |
| Theme `appearance`         | Passed through to Frosted `Theme` via `BackendTheme`    |
| Density prop per component | One `density` on `BackendTheme`, inherited by all parts |

Guide: `docs/backend-ui-design.md`. Gallery demo: `backend` route when wired.

## Install

```bash
pnpm add @solidix/backend @solidix/frosted
```

Copy `src/tokens.css` and `src/backend.css` from this package into your project (JSR ships JS modules only, same vendored-copy model as funnel and Frosted) and import them after Frosted styles.

## Quick start

```tsx
import {
  AppShell,
  BackendTheme,
  DataRow,
  Main,
  PageHeader,
  Sidebar,
  TopBar,
} from "@solidix/backend";

export function App() {
  return (
    <BackendTheme density="compact">
      <AppShell>
        <Sidebar>Nav</Sidebar>
        <Main>
          <TopBar>Acme Console</TopBar>
          <PageHeader title="Customers" description="All accounts" />
          <DataRow
            record={{
              id: "c1",
              primary: "Ada Lovelace",
              secondary: "ada@example.com",
              value: "$1,240",
              status: "Active",
            }}
          />
        </Main>
      </AppShell>
    </BackendTheme>
  );
}
```

## Differences from Radix

No direct Radix equivalent. This package composes `@solidix/frosted` and headless `@solidix/*` primitives into backend shell and data opinions. See `docs/backend-ui-design.md` for rationale and deliberate deviations.
