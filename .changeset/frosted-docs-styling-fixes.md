---
"@solidix/frosted": patch
---

Fix unstyled and misrendered docs elements: re-port the radio-group, slider, button, icon-button, and fieldset stylesheets from upstream frosted-ui (they carried Radix Themes rules), bridge Base UI selected/checked/open attributes the frosted CSS targets (`data-selected` on tabs and segments, `data-checked` on radio segments, `hidden` plus `data-panel-open` on accordion panels and triggers), emit the missing `fui-FieldControl` and `fui-CreditCardTextField` classes, and recompose the gallery demo per the upstream stories (TextField inside Field, card-style radio buttons, IconButton gallery/carousel/trigger controls, sized widget stack, full-width separators).
