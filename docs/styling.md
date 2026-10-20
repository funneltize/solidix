# Styling

Primitives ship unstyled. No CSS is bundled, no class names are imposed, and
no CSS-in-JS runtime is required. You bring the stylesheet; each part exposes
stable hooks to hang it on.

## Data attributes

State arrives as data attributes, identical to Radix. Style open versus closed,
checked versus unchecked, or placement without tracking any state yourself:

```css
.DialogContent[data-state="open"] {
  display: block;
}

.DialogContent[data-state="closed"] {
  display: none;
}

.MenuContent[data-side="bottom"] {
  margin-top: 4px;
}
```

Common attributes include `data-state`, `data-disabled`, `data-orientation`,
`data-side`, and `data-align`. Each part lists its attributes in the
`Data attributes` section of its API reference.

## Classes and inline styles

- `class`, not `className`. Solid uses the native attribute name.
- `style` props take objects with kebab-case keys: `style={{ "background-color": "white" }}`.
  Solid applies each key with `setProperty`, so camelCase multi-word keys are
  silently ignored. This applies in direct JSX as well as through `asChild`.
- Some parts merge base styles (measured heights, positioning variables) with
  your `style` prop. Those parts accept style objects only, never strings, so
  the merge has something to combine with.
- Some parts also set CSS variables (for example `--radix-accordion-content-height`).
  They are listed per part under `CSS variables` and are safe to consume in
  your own rules.

## Element attributes

Two Radix prop names change to match the platform:

- `for`, not `htmlFor`, on `Label`. Solid would render `htmlFor` literally as
  `htmlfor`, which associates nothing. (`Form.Label` still accepts `htmlFor`
  for Radix API compatibility and renders it as `for`.)
- Lowercase `tabindex` on composed (`asChild`) elements. Slot applies props
  imperatively and lowercase matches the DOM attribute it sets.

Boolean `aria-*` values are normalized for you: write `aria-disabled={true}`
and the attribute renders as the string `"true"` instead of Solid's default
empty string.

## Theming

There is no theme provider. Scope plain CSS under your own classes, custom
properties, or data attributes:

```css
:root {
  --surface: white;
  --ink: #111827;
}

[data-funnel-theme="dark"] {
  --surface: #111827;
  --ink: #f9fafb;
}

.DialogContent {
  background: var(--surface);
  color: var(--ink);
}
```

Two packages ship stylesheets, and both must be vendored because the published
package contains JS only: copy `tokens.css` plus `blocks.css` for
`@solidix/solidix/funnel`, and `springs.css` for `@solidix/solidix/motion`,
from the repo into your project and import them relatively. Re-copy after
upgrading. See the funnel and motion package READMEs for details.

Enter and exit motion belongs with styling, not JavaScript: see the
[Animation](./animation.md) guide for the `data-state` patterns and the
[Composition](./composition.md) guide for styling custom trigger elements.
