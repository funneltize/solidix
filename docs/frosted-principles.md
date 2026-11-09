# Frosted design principles

The rules behind `@solidix/frosted`: how the styled layer stays
consistent as it grows, and how consumers should build with it. These
govern the Frosted backend layer only. The funnel system has its own
philosophy in `packages/solid/funnel/PHILOSOPHY.md`, and product policy
(header budgets, save states, publish rules) belongs to the consuming
app, not to this library.

## 1. Tokens first, never literals

Every color, size, corner, space, shadow, and duration comes from the
token layer. A literal in component CSS is a review failure, not a
style choice. If a design needs a value the tokens lack, the token
layer is wrong: extend the scale, then use it. Retuning the system
must be a one-file change.

## 2. Name roles, not steps

Consumers and new component styles reach for semantic roles first:
`--radius-control`, `--radius-card`, `--radius-dialog`,
`--elevation-card`, `--elevation-dialog`, `--duration-fast`,
`--duration-normal`. The numbered steps (`--radius-4`, `--shadow-6`)
exist so roles have something to alias. Picking a step by eye is how
two surfaces that play the same role drift apart.

## 3. Parents own spacing

Components carry no outer margins. Layout primitives (`Stack`, `Row`)
own the space between children through `gap`, keyed to the `--space-*`
scale. A component that needs room inside itself uses padding. Space
between components is never a child's business, so composed layouts
set rhythm in exactly one place.

## 4. Type only through the scale

Text takes a step from the typography scale, including the named
`--font-size-micro` step for dense metadata. Arbitrary sizes are not
permitted in component or consumer styles. Headings separate by size
and weight from the scale, never by a new face.

## 5. Customize through tokens, never by wrapping

A consumer re-points tokens (accent, appearance, radius factor) and
the system follows. Forking a component, wrapping it to restyle its
internals, or copying its CSS to change paint is the failure mode the
token layer exists to prevent. If tokens cannot express a needed
variation, that is a library gap to fix upstream.

## 6. Composition over configuration

Export the building blocks and let consumers compose them. Prefer a
small component with slots or parts over one component with twenty
boolean props. Compound parts share context; leaf parts stay usable
on their own.

## 7. One tempo

Motion takes `--duration-fast` or `--duration-normal` for
interactions, and `--duration-dialog` for panels. Bespoke animation
choreography (a spinner's leaf delays, an avatar morph) stays inside
its component with a comment saying why. `prefers-reduced-motion` is
respected everywhere, and no animation library is introduced for
micro-interactions.

## 8. Accessible by default

Native elements where the platform gives behavior for free, visible
focus, complete accessible names on icon-only controls, and keyboard
models that match the headless primitives underneath. Accessibility is
part of the component, not a consumer add-on.

## 9. Agent-ready by construction

Every export carries JSDoc, and prop definitions are the
machine-readable source for props, defaults, and classes. Guidance
lives in short docs that can be loaded in full, like this one, so a
human or an assistant reads the same rules the code enforces.
