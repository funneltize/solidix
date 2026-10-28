# `@solidix/motion`

CSS-first motion for Solidix: a spring easing compiler, ready-made spring
tokens, a View Transitions helper, and copy-paste animation recipes. No
animation engine, no rAF loops - springs compile to CSS `linear()` easings
that run on the compositor, enter/exit lifecycles use `@starting-style` plus
`transition-behavior: allow-discrete`, and layout morphs use the platform
View Transitions API. The compiler and tokens have zero dependencies;
`viewTransition` and `createSwipe` need Solid (peer) and the DOM.

Pair with the [Animation guide](../../../docs/animation.md) for the Presence exit-tracking contract these recipes rely on. Docs site: Motion page (`#/motion` route) with live recipe demos.

```bash
pnpm add jsr:@solidix/solidix
```

```tsx
import { createSpring, createSwipe, viewTransition } from "@solidix/solidix/motion";
import "./springs.css"; // vendored copy, see below
```

## Differences from Radix

Not applicable: this package has no Radix counterpart (see [radix-baseline.md](../../../docs/radix-baseline.md)); the spring compiler, tokens, View Transitions helper, swipe gesture, and recipes are Solidix-original.

## Springs

`createSpring` simulates a damped harmonic oscillator and samples it into a
`linear()` timing function. Parameters shape the motion; the transition
duration you declare in CSS sets its length:

```ts
createSpring({ stiffness: 170, damping: 22 }); // "linear(0, 0.0386 3.13%, …)"
```

| Option      | Default | Notes                                                  |
| ----------- | ------- | ------------------------------------------------------ |
| `stiffness` | `170`   | Higher moves faster. Must be positive and finite.      |
| `damping`   | `22`    | Lower bounces more. Must be positive (undamped springs |
|             |         | never settle).                                         |
| `mass`      | `1`     | Heavier moves slower. Must be positive and finite.     |
| `stops`     | `33`    | Integer from 2 to 1000. More stops, smoother curve.    |

Results are cached by parameters. Simulation runs in normalized time, so
only the damping ratio shapes the output - springs with equal ratios but
different timescales compile identically. Throws a `RangeError` for invalid
input or for springs too underdamped to settle (damping ratio below 0.05 -
increase damping).

### Preset tokens

`springs.css` defines four presets (plus starting-point durations) as custom
properties. JSR ships JS only, so the stylesheet is not in the package: copy
`packages/solid/motion/src/springs.css` from the repo next to your own CSS
and import it relatively (re-copy after upgrading). Always declare a plain
easing first so older engines - Chrome \< 113, Firefox \< 112, Safari
\< 17.2 - fall back instead of jumping:

```css
@import "./springs.css";

.popover {
  transition-timing-function: ease-out;
  transition-timing-function: var(--solidix-spring-default);
  transition-duration: var(--solidix-spring-default-duration); /* 320ms */
}
```

| Token                      | Feel                              | Duration |
| -------------------------- | --------------------------------- | -------- |
| `--solidix-spring-gentle`  | Soft, slow settle, mild overshoot | `450ms`  |
| `--solidix-spring-default` | Balanced, barely overshoots       | `320ms`  |
| `--solidix-spring-snappy`  | Fast with a small kick            | `220ms`  |
| `--solidix-spring-bouncy`  | Playful, visible wobble           | `550ms`  |

The file is generated - see "Regenerating" below. A test fails if it drifts
from compiler output.

## View transitions

`viewTransition` runs a synchronous state update inside
`document.startViewTransition()`, so elements sharing a
`view-transition-name` morph natively - tab indicators, list reorders,
expanding cards. Solid's queued writes are flushed inside the update
callback, so the "after" snapshot always sees the new DOM:

```tsx
import { viewTransition } from "@solidix/solidix/motion";

function selectTab(id: string) {
  viewTransition(() => setActiveTab(id));
}
```

```css
.tab-indicator {
  view-transition-name: active-pill;
}

::view-transition-group(active-pill) {
  animation-duration: 300ms;
  animation-timing-function: ease;
  animation-timing-function: var(--solidix-spring-snappy);
}
```

It returns the `ViewTransition` (await `finished` to sequence follow-ups),
or `null` when the update ran instantly: no `document` (SSR), no
`startViewTransition` support, or `prefers-reduced-motion: reduce`. Names
must be unique per morph - concurrent same-name transitions collapse into
one - and only one transition runs document-wide at a time; rapid updates
skip the in-flight transition and start over, which is the correct behavior
for toggles and tabs.

## Swipe gestures

`createSwipe` tracks a pointer drag and settles with a spring - the one
piece that needs JavaScript (release velocity has no CSS source). Live
feedback writes `transform` directly, so dragging never re-renders; the
settle runs as a CSS transition, so there is no rAF loop.

```tsx
const swipe = createSwipe({
  threshold: 0.35,
  onSettled: (outcome) => {
    if (outcome === "dismissed") removeItem(id);
  },
});

<div ref={swipe.ref} class="swipe-card">
  Drag me
</div>;
```

| Option              | Default                                | Notes                                                                           |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| `axis`              | `"x"`                                  | `"x"` or `"y"`. Perpendicular movement is ignored.                              |
| `direction`         | `"both"`                               | `"positive"`, `"negative"`, or `"both"`. Clamps the drag.                       |
| `threshold`         | `0.4`                                  | Displacement completing the swipe, as a fraction of element                     |
|                     |                                        | size (floored at 24px). Must be positive.                                       |
| `velocityThreshold` | `0.5`                                  | Flick velocity in px/ms completing the swipe. Must be                           |
|                     |                                        | positive. Spans under 16ms report zero (tap jitter guard).                      |
| `duration`          | `220`                                  | Settle length in ms. `0` settles instantly, still async.                        |
| `easing`            | `"var(--solidix-spring-snappy, ease)"` | Settle easing. Works with or without `springs.css`.                             |
| `now`               | `performance.now`                      | Time source in ms (testing seam). Read live, like callbacks.                    |
| `onDrag`            | -                                      | Per move: `{ displacement, velocity }`. Keep light.                             |
| `onRelease`         | -                                      | At release: `{ dismissed, displacement, velocity, cancelled }`.                 |
| `onSettled`         | -                                      | Exactly once per completed settle: `"dismissed" \| "snapped-back"`. Never sync. |

Decision rule: a hard flick wins over position (acute intent); otherwise
displacement past threshold dismisses. Dismissed elements travel past the
edge (size + 48px, or 96px with no measurable size); snapped-back elements
restore pristine inline styles.

Behavior contract:

- Single active pointer, primary button only. Pointer capture engages only
  once a drag starts, so taps (under 4px slop) keep native click targeting
  on interactive children; drags swallow the trailing click. Window-level
  listeners track moves and finish the gesture if the release lands
  off-element.
- `touch-action` constrains the perpendicular axis while attached (scroll
  keeps working); text selection pauses mid-drag. Both restore after.
- Author `transform` transitions are suppressed mid-gesture - drag feedback
  and instant settles stay instant - and restored after.
- Re-grabs mid-settle freeze at the visual position and continue - no
  jumps. A tap mid-settle resumes the interrupted animation.
- Reduced motion skips the settle animation (end state applies, `onSettled`
  still fires async). Live drag feedback stays - it is user-driven.
- Detaching mid-settle cancels silently: `onSettled` never fires for the
  abandoned settle.
- Callbacks (`onDrag`, `onRelease`, `onSettled`) and `now` read live from
  the options object - replacing them takes effect immediately. Every other
  option is snapshotted at creation.
- `state()` (`"idle" | "dragging" | "settling" | "dismissed"`, mirrored to
  `data-state`) is the styling hook. The helper owns the element's inline
  `transform` while attached; cleanup runs on `ref(null)` and on owner
  disposal, or explicitly via `dispose()`. Creation is SSR-safe (no DOM
  access until attach).
- Accessibility: swipe needs a keyboard equivalent - pair it with a visible
  control performing the same action, and move focus to a sensible target
  when dismissal removes the focused element (see the gallery demo).

## Exit timing with Presence

`Presence` (and every primitive built on it) unmounts closed content after
its **keyframe** exit animations end - it listens for `animationend`, Radix
parity. It does not track transitions. That decides the pattern:

| Exit mechanism                       | Unmounts after exit? | Needs         |
| ------------------------------------ | -------------------- | ------------- |
| `@keyframes` exit animation          | Yes                  | Nothing extra |
| `transition` + `allow-discrete` exit | No - instant unmount | `forceMount`  |

For transition-based exits, keep the part mounted with `forceMount`: the
closed state renders `display: none`, so it stays hidden from assistive
technology and unfocusable while the exit plays. For unmount-after-exit,
drive the exit with `@keyframes` (see the second dialog recipe below).

Enter animations work under both: `@starting-style` for transitions,
plain keyframes on mount.

## Recipes

Every Solidix primitive exposes its state as `data-state` (plus `data-side` /
`data-align` on floating content), so one pattern animates them all. These
are userland CSS - copy, adapt, own.

### Scale + fade enter/exit (dialog, popover, alert dialog)

```css
.DialogContent {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.2s ease-out,
    transform 0.32s ease-out,
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

On entry, `display` flips at 0% and the transition runs from
`@starting-style`. On exit it runs toward the closed values and `display`
flips at 100%. Unsupported engines show/hide instantly - always correct,
just not animated.

**Mounting matters.** CSS cannot keep a removed node alive: with conditional
rendering the exit never plays. Either keep the part mounted with
`forceMount` (closed state is `display: none`, so it stays hidden from
assistive tech and unfocusable) …

```tsx
<Dialog.Portal forceMount>
  <Dialog.Overlay class="DialogOverlay" />
  <Dialog.Content class="DialogContent">…</Dialog.Content>
</Dialog.Portal>
```

… or unmount after exit with keyframe animations instead of transitions -
`Presence` waits for `animationend` (Radix parity; it does not track
transitions):

```css
.DialogContent[data-state="open"] {
  animation: content-show 0.32s var(--solidix-spring-default);
}

.DialogContent[data-state="closed"] {
  animation: content-hide 0.2s ease-in;
}

@keyframes content-show {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
}

@keyframes content-hide {
  to {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
}
```

### Directional slide (menus, hover card, select)

Floating parts expose `data-side`, so one block slides each placement away
from its anchor:

```css
.MenuContent {
  transition:
    opacity 0.18s ease-out,
    transform 0.3s ease-out,
    transform 0.3s var(--solidix-spring-snappy),
    display 0.3s allow-discrete;
}

.MenuContent[data-state="open"] {
  display: block;

  @starting-style {
    opacity: 0;
  }
}

.MenuContent[data-state="closed"] {
  display: none;
  opacity: 0;
}

.MenuContent[data-state="open"][data-side="bottom"] {
  @starting-style {
    transform: translateY(-6px);
  }
}

.MenuContent[data-state="open"][data-side="top"] {
  @starting-style {
    transform: translateY(6px);
  }
}

.MenuContent[data-state="open"][data-side="left"] {
  @starting-style {
    transform: translateX(6px);
  }
}

.MenuContent[data-state="open"][data-side="right"] {
  @starting-style {
    transform: translateX(-6px);
  }
}
```

### Height expand (accordion, collapsible)

Animate `grid-template-rows` between `0fr` and `1fr` - no content measuring,
no `height: auto` hack:

```css
.CollapsiblePanel {
  display: grid;
  grid-template-rows: 0fr;
  transition:
    grid-template-rows 0.3s ease-out,
    grid-template-rows 0.3s var(--solidix-spring-default);
}

.CollapsiblePanel[data-state="open"] {
  grid-template-rows: 1fr;
}

.CollapsiblePanel > div {
  overflow: hidden;
}
```

### Staggered entrances (charts)

Chart marks expose `tabindex="0"` and `role="img"`, so keyframe entrances
need no library support: fades for every mark, `scaleY` growth for bars,
`scale` pops for dots, cascaded with `nth-of-type` delays. Keyframes run
once per mount, so highlight dimming stays instant:

```css
@keyframes charts-enter-fade {
  from {
    opacity: 0;
  }
}

@keyframes charts-enter-grow {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
}

.my-chart svg [tabindex="0"] {
  animation: charts-enter-fade 320ms ease backwards;
  animation-timing-function: var(--solidix-spring-default, ease);
}

.my-chart svg rect[role="img"] {
  transform-box: fill-box;
  transform-origin: bottom;
  animation-name: charts-enter-grow;
  animation-timing-function: var(--solidix-spring-snappy, ease);
}

.my-chart svg rect[role="img"]:nth-of-type(2) {
  animation-delay: 40ms;
}

.my-chart svg rect[role="img"]:nth-of-type(3) {
  animation-delay: 80ms;
}

/* …extend the ladder to your mark count… */
```

`transform-box: fill-box` is load-bearing for SVG origins. Leave the
tooltip out: it remounts on every highlight move, so an entrance would
replay constantly. The gallery charts demo applies the full recipe. See
the [Charts guide](../../../docs/charts.md#motion).

### Reduced motion

Motion must always have an off-ramp. Pair every recipe with:

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

## Browser support

| Feature                              | Baseline since | Fallback             |
| ------------------------------------ | -------------- | -------------------- |
| `linear()` easings                   | Dec 2023       | Plain `ease`         |
| `@starting-style` + `allow-discrete` | Aug 2024       | Instant show/hide    |
| Same-document View Transitions       | Oct 2025       | Instant state change |

Policy: Baseline 2024+ animates; older engines render correct end states
without animation. Feature-detect in JS with `CSS.supports()` /
`"startViewTransition" in document` where behavior (not just styling)
depends on it.

## Regenerating

`springs.css` is generated from the compiler. After changing presets or the
compiler, rebuild and regenerate, then run the drift test:

```bash
pnpm --filter @solidix/motion run build
pnpm --filter @solidix/motion run gen:springs
pnpm vitest run packages/solid/motion
```

## Design notes

- Primitives stay headless: this package ships tokens, a compiler, and
  documentation - never component styles. Nothing here is imported by the
  primitives themselves.
- Physics lives in easing shape, not JS: stiffness/damping/mass pick the
  curve; CSS duration scales it. Timing-accurate springs (fixed real-time
  settle) would need `duration` plumbed from simulation - deliberately out
  of scope.
- Gestures need JavaScript only for velocity: `createSwipe` tracks pointers
  and decides dismiss versus snap-back, but the settle itself is a CSS
  transition - no rAF loop, no per-frame main-thread work.
