---
"@solidix/funnel": minor
"@solidix/solidix": minor
---

Resolve the funnel dark theme through `light-dark()` token pairs on `:root` instead of a `[data-funnel-theme="dark"]` override block. The attribute (set via `Root theme="dark"`) now only flips `color-scheme` for the subtree; every paired token ships its flat light value first so older browsers degrade to the light theme. Rendering is unchanged in supporting browsers, and plain rebrand overrides under `[data-funnel-theme="dark"]` keep working.
