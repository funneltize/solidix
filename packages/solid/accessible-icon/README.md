# `@solidix/accessible-icon`

AccessibleIcon primitive. Port of `@radix-ui/react-accessible-icon` (behavior-identical).

Takes `label` plus a single icon child; renders no wrapper element of its own, so there are no `class`/`ref`/`asChild` props.

## Differences from Radix

None: behavior-identical to Radix (`React.Children.only` parity - exactly one child element is required; the child is marked decorative and the label renders visually hidden).
