---
"@solidix/select": patch
---

Match the upstream select 2.4.1 export surface: `Provider` and `BubbleInput` are now exported under their `unstable_` aliases (`unstable_SelectProvider`, `unstable_SelectBubbleInput`, `unstable_Provider`, `unstable_BubbleInput`, plus the `unstable_`-suffixed prop types), and internal position types are no longer re-exported from the package root. No behavior changes.
