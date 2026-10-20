# Animation

Animation is userland CSS keyed off the data attributes every primitive
exposes. There is no animation runtime to install and no wrapper component to
add: `data-state` flips, your stylesheet responds. The full recipe collection
lives in the motion package README; this guide covers the mounting rules that
decide which CSS technique to use.

## Presence and exit motion

Open content unmounts when it closes. `Presence` (built into every dismissable
part) keeps closed content mounted through its exit, but only for keyframe
animations: it unmounts after `animationend`, Radix parity. It does not track
transitions.

| Exit mechanism                       | Unmounts after exit? | Needs        |
| ------------------------------------ | -------------------- | ------------ |
| `@keyframes` exit animation          | Yes                  | Nothing extra |
| `transition` plus `allow-discrete` exit | No, instant unmount | `forceMount` |

For transition-based exits, keep the part mounted with `forceMount`: the
closed state renders `display: none`, so it stays hidden from assistive
technology and unfocusable while the exit plays.

```tsx
<Dialog.Portal forceMount>
  <Dialog.Overlay class="DialogOverlay" />
  <Dialog.Content class="DialogContent">…</Dialog.Content>
</Dialog.Portal>
```

```css
.DialogContent {
  transition:
    opacity 0.2s ease-out,
    transform 0.32s var(--solidix-spring-default),
    display 0.32s allow-discrete;
}

.DialogContent[data-state="open"] {
  display: block;

  @starting-style {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
}

.DialogContent[data-state="closed"] {
  display: none;
  opacity: 0;
  transform: scale(0.94) translateY(8px);
}
```

For unmount-after-exit, drive the exit with `@keyframes` instead and skip
`forceMount`. Enter motion works under both techniques (`@starting-style` for
transitions, plain keyframes on mount).

## Portal placement

`Presence` cannot track content through a portal boundary: a Solid portal
resolves to a text marker, so a `Presence` around a portal sees nothing to
follow. Primitives already place `Presence` inside their portals; if you build
custom portalled content, do the same (`Portal` outside, `Presence` inside).

## The motion package

`@solidix/solidix/motion` extends the CSS-first model without adding an
engine:

- `createSpring` compiles spring physics (stiffness, damping, mass) to CSS
  `linear()` easings that run on the compositor. Results are cached by
  parameters.
- `springs.css` ships four preset tokens (`gentle`, `default`, `snappy`,
  `bouncy`) with starting-point durations. Vendor the file into your project;
  always declare a plain easing first so older engines fall back instead of
  jumping.
- `viewTransition` runs a state update inside `document.startViewTransition()`
  so elements sharing a `view-transition-name` morph natively. It returns
  `null` and applies the update instantly outside the browser, on unsupported
  engines, or under reduced motion.
- `createSwipe` tracks pointer drags with live `transform` feedback and
  settles with a spring transition. Release velocity has no CSS source, so
  this is the one helper that needs JavaScript, and even here there is no rAF
  loop.

## Reduced motion

Every recipe needs an off-ramp. Pair motion with a guard that collapses
durations, keep vestibular triggers (large parallax, spin, rapid flashing)
out of essential UI, and never convey information by motion alone:

```css
@media (prefers-reduced-motion: reduce) {
  .DialogContent,
  .DialogContent::before,
  .DialogContent::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

`viewTransition` and swipe settles already skip their animation under reduced
motion while still applying the end state. Swipe dismissal additionally needs
a keyboard equivalent: pair it with a visible control performing the same
action, and move focus to a sensible target when dismissal removes the
focused element.
