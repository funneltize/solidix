---
"@solidix/frosted": patch
---

Fix TextArea chrome intercepting pointer input when stacking is disturbed: the decorative `.fui-TextAreaChrome` layer now ships `pointer-events: none` so the textarea stays usable even if an external stylesheet restacks it above the input.
