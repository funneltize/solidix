# App shell and data patterns

Composition guidance for editor-shaped and data-dense apps built on
Frosted. These are patterns, not components: the library supplies the
parts and the spacing system, the app owns its chrome and policy.
See `docs/frosted-principles.md` for the rules these patterns follow.

## Editor shell

Build the three-region editor from `SplitPane` and `Stack`:

- A top bar owned by the app (title, status, primary action). Keep it
  to the app's own budget; the library does not ration your pills.
- `SplitPane` for outline, canvas, and inspector, so resizing,
  keyboard separators, and min sizes come from one place.
- `Stack` inside each region for section rhythm; regions scroll
  independently (`overflow: auto` on panels), the shell never scrolls.
- Overlays (`Dialog`, `Sheet`, `CommandMenu`, `Toast`) portalled at
  the shell root, inside the app's `Theme`.

```tsx
<SplitPane defaultSizes={[18, 54, 28]} minSize={12}>
  <nav aria-label="Outline">...</nav>
  <main>...</main>
  <aside aria-label="Inspector">...</aside>
</SplitPane>
```

## Command palette

`CommandMenu` takes grouped items and reports a chosen value. The app
owns when it opens (usually Cmd+K), what the groups mean, and what a
selection does. Filtering matches label plus keywords.

## Data tables

`DataTable` wraps the styled `Table` with the state data surfaces
rebuild by hand: column sorting (provide `sortValue`), row selection
by stable key, and pagination. Keep server concerns (fetching,
filtering the full set) in the app; `DataTable` presents the rows it
is given.

## Sortable lists

For outlines and ordered collections, compose the styled `Sortable`
parts and own the order in app state. The handle's keyboard model
(pick up, arrows, drop, Escape to cancel) and announcements come from
the primitive; row content and what an order means stay with the app.

## Feedback

Use `Toaster` once at the shell root and `useToast().notify(...)`
from anywhere inside it. Confirmation for destructive actions is app
policy: use `AlertDialog`, and name the object being destroyed.
