---
"@solidix/dismissable-layer": patch
"@solidix/slot": patch
"@solidix/popper": patch
---

Fix menubar submenus closing when the pointer crosses into them. Nested portalled layers (eg. submenus) now resolve as inside their ancestor layer for focus and pointerdown outside checks, slotted props update in place without transient removal that drops focus, and slotted props above popper content land on the inner content element instead of the positioning wrapper.
