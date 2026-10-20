---
"@solidix/funnel": minor
---

Add the studio editing contract: `Root` accepts `editable`, and when set, blocks render `data-funnel-part` markers (plus `data-funnel-part-index` for repeats and `tabindex` on static text) so visual editors can resolve clicks to content fields. `CTAButton` takes `part`/`partIndex` overrides for composed siblings. Off by default with byte-identical public output.
