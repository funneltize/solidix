import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "motion",
  title: "Motion",
  metaDescription:
    "Spring easing compiler, preset motion tokens, and a View Transitions helper - CSS-first animation with no engine.",
  ariaLink: "",
  description:
    "Compiles spring physics to CSS `linear()` easings that run on the compositor, ships preset tokens, wraps same-document View Transitions, and tracks velocity-aware swipe gestures - with reduced-motion and fallback handling throughout. Primitives stay headless; all animation lives in userland CSS keyed off `data-state`.",
  features: [
    "Springs compile to `linear()` - zero main-thread cost per frame.",
    "Four preset tokens with starting-point durations.",
    "`viewTransition` morphs layout natively, instantly otherwise.",
    "`createSwipe` settles flicks and drags with spring physics.",
    "Enter/exit recipes keyed off `data-state`, `data-side`, and `data-align`.",
    "Respects `prefers-reduced-motion` by skipping animation, never by breaking.",
  ],
  anatomyIntro: "Import the compiler or helper from the package and the tokens as CSS.",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: 'import { createSpring, viewTransition } from "@solidix/solidix/motion";\nimport "./springs.css"; // vendored copy, see the Motion README',
  },
  parts: [
    {
      name: "createSpring",
      description:
        "Simulates a damped harmonic oscillator from rest toward `1` until it settles, then samples the motion into a CSS `linear()` timing function. Simulation runs in normalized time, so only the damping ratio shapes the output - equal ratios compile identically at any timescale. Results are cached by parameters.",
      props: [
        {
          name: "stiffness",
          type: "number",
          default: 170,
          description: "Spring stiffness. Higher values move faster. Must be positive and finite.",
        },
        {
          name: "damping",
          type: "number",
          default: 22,
          description:
            "Damping coefficient. Lower values bounce more. Must be positive - undamped springs never settle.",
        },
        {
          name: "mass",
          type: "number",
          default: 1,
          description:
            "Mass of the animated object. Heavier moves slower. Must be positive and finite.",
        },
        {
          name: "stops",
          type: "number",
          default: 33,
          description:
            "Number of `linear()` stops including the endpoints. Integer from 2 to 1000.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "viewTransition",
      description:
        "Runs a synchronous state update inside `document.startViewTransition()` so elements sharing a `view-transition-name` morph natively. Solid's queued writes flush inside the update callback, so the after snapshot always sees the new DOM. Returns the `ViewTransition`, or `null` when the update ran instantly (SSR, unsupported engine, or reduced motion).",
      props: [
        {
          name: "update",
          type: "() => void",
          required: true,
          description: "Synchronous state change to animate between. Must be a function.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "createSwipe",
      description:
        "Tracks a pointer drag with touch and mouse support, decides dismiss versus snap-back from displacement and flick velocity, and settles with a spring transition - no rAF loop. Returns a `ref` to attach, a reactive `state` (`idle`, `dragging`, `settling`, `dismissed`, mirrored to `data-state`), and `dispose()` for explicit teardown. Callbacks and `now` read live from the options object; other options are snapshotted at creation.",
      props: [
        {
          name: "axis",
          type: '"x" | "y"',
          default: '"x"',
          description: "Drag axis. Perpendicular movement is ignored.",
        },
        {
          name: "direction",
          type: '"both" | "positive" | "negative"',
          default: '"both"',
          description: "Allowed drag directions. Clamps the drag.",
        },
        {
          name: "threshold",
          type: "number",
          default: 0.4,
          description:
            "Displacement completing the swipe, as a fraction of element size (floored at 24px).",
        },
        {
          name: "velocityThreshold",
          type: "number",
          default: 0.5,
          description:
            "Flick velocity in px/ms completing the swipe. Wins over position on conflicts.",
        },
        {
          name: "duration",
          type: "number",
          default: 220,
          description: "Settle length in ms. `0` settles instantly, still async.",
        },
        {
          name: "easing",
          type: "string",
          default: '"var(--solidix-spring-snappy, ease)"',
          description: "Settle easing. Works with or without `springs.css`.",
        },
        {
          name: "now",
          type: "() => number",
          default: "performance.now",
          description: "Time source in ms. Testing seam; read live, like the callbacks.",
        },
        {
          name: "onDrag",
          type: "(info: SwipeDragInfo) => void",
          description: "Per move: `{ displacement, velocity }`. Keep light.",
        },
        {
          name: "onRelease",
          type: "(decision: SwipeRelease) => void",
          description:
            "At release, before the animation: `{ dismissed, displacement, velocity, cancelled }`.",
        },
        {
          name: "onSettled",
          type: "(outcome: SwipeOutcome) => void",
          description:
            'Exactly once per completed settle: `"dismissed" | "snapped-back"`. Never fires synchronously.',
        },
      ],
      dataAttributes: [
        {
          attribute: "data-state",
          values: ["idle", "dragging", "settling", "dismissed"],
        },
      ],
      cssVariables: [],
    },
    {
      name: "Spring tokens",
      description:
        "Preset easings and starting-point durations from the vendored `springs.css` (copy it from the package repo; see the package README). Declare a plain easing first so older engines fall back instead of jumping.",
      props: [],
      dataAttributes: [],
      cssVariables: [
        {
          cssVariable: "--solidix-spring-gentle",
          description: "Soft, slow settle with mild overshoot.",
        },
        {
          cssVariable: "--solidix-spring-gentle-duration",
          description: "Starting-point duration: `450ms`.",
        },
        {
          cssVariable: "--solidix-spring-default",
          description: "Balanced motion that barely overshoots.",
        },
        {
          cssVariable: "--solidix-spring-default-duration",
          description: "Starting-point duration: `320ms`.",
        },
        {
          cssVariable: "--solidix-spring-snappy",
          description: "Fast motion with a small kick.",
        },
        {
          cssVariable: "--solidix-spring-snappy-duration",
          description: "Starting-point duration: `220ms`.",
        },
        {
          cssVariable: "--solidix-spring-bouncy",
          description: "Playful, visible wobble.",
        },
        {
          cssVariable: "--solidix-spring-bouncy-duration",
          description: "Starting-point duration: `550ms`.",
        },
      ],
    },
  ],
  examples: [
    {
      title: "Springy popover",
      description:
        "Scale and fade keyed off `data-state`, with `forceMount` so the exit transition plays before hiding.",
      blocks: [
        {
          lang: "css",
          highlights: [],
          code: '.PopoverContent {\n  opacity: 1;\n  transform: none;\n  transition:\n    opacity 0.2s ease-out,\n    transform 0.32s ease-out,\n    transform 0.32s var(--solidix-spring-default),\n    display 0.32s allow-discrete;\n}\n\n.PopoverContent[data-state="open"] {\n  display: block;\n\n  @starting-style {\n    opacity: 0;\n    transform: scale(0.94) translateY(8px);\n  }\n}\n\n.PopoverContent[data-state="closed"] {\n  display: none;\n  opacity: 0;\n  transform: scale(0.94) translateY(8px);\n}',
        },
      ],
    },
    {
      title: "Morphing tab indicator",
      description:
        "Wrap the tab change in `viewTransition` and give the sliding pill a shared transition name.",
      blocks: [
        {
          lang: "tsx",
          highlights: [],
          code: 'import { viewTransition } from "@solidix/solidix/motion";\n\nfunction selectTab(id: string) {\n  viewTransition(() => setActiveTab(id));\n}',
        },
        {
          lang: "css",
          highlights: [],
          code: ".tab-indicator {\n  view-transition-name: active-pill;\n}\n\n::view-transition-group(active-pill) {\n  animation-duration: 300ms;\n  animation-timing-function: ease;\n  animation-timing-function: var(--solidix-spring-snappy);\n}",
        },
      ],
    },
    {
      title: "Swipe-to-dismiss row",
      description:
        "Attach the helper with a ref and remove the row when the settle reports back. Pair with a visible Dismiss control for keyboard users, as the demo does.",
      blocks: [
        {
          lang: "tsx",
          highlights: [],
          code: 'import { createSwipe } from "@solidix/solidix/motion";\n\nconst swipe = createSwipe({\n  threshold: 0.35,\n  onSettled: (outcome) => {\n    if (outcome === "dismissed") removeItem(id);\n  },\n});\n\n<div ref={swipe.ref} class="swipe-card">\n  Drag me\n</div>',
        },
      ],
    },
  ],
  customApis: [],
  accessibility:
    "Motion must always have an off-ramp: `viewTransition` skips animation under `prefers-reduced-motion`, and every CSS recipe should pair with shortened durations inside a reduced-motion media query. Keep vestibular triggers (large parallax, spin, rapid flashing) out of essential UI, and never convey information by motion alone. Swipe dismissal needs a keyboard equivalent - pair it with a visible control performing the same action - and move focus to a sensible target when dismissal removes the focused element.",
  keyboard: [],
  notes: "",
};
