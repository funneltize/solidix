import { For, Show, createSignal } from "solid-js";
import { createSwipe, springPresets, viewTransition, type SpringPresetName } from "@solidix/motion";

const PRESETS = Object.keys(springPresets) as SpringPresetName[];
const DURATIONS: Record<SpringPresetName, string> = {
  gentle: "450ms",
  default: "320ms",
  snappy: "220ms",
  bouncy: "550ms",
};

const TABS = [
  {
    id: "springs",
    label: "Springs",
    text: "Stiffness, damping, and mass compile to a single linear() easing.",
  },
  {
    id: "transitions",
    label: "Transitions",
    text: "Enter and exit lifecycles run on @starting-style and allow-discrete.",
  },
  {
    id: "morphing",
    label: "Morphing",
    text: "Shared view-transition names morph layout natively.",
  },
];

const LABELS: Record<SpringPresetName, string> = {
  gentle: "Gentle",
  default: "Default",
  snappy: "Snappy",
  bouncy: "Bouncy",
};

const MotionDemo = () => {
  const [preset, setPreset] = createSignal<SpringPresetName>("default");
  const [pinged, setPinged] = createSignal(false);
  const [tab, setTab] = createSignal(TABS[0]!.id);
  const [dismissed, setDismissed] = createSignal(false);
  let swipeCard: HTMLElement | undefined;
  let resetButton: HTMLButtonElement | undefined;
  // Keyboard equivalent of the swipe: same outcome, plus focus management
  // when dismissal removes the focused element.
  const dismissCard = () => {
    const hadFocus = swipeCard?.contains(document.activeElement) ?? false;
    setDismissed(true);
    // Runs after Solid's queued flush swaps the card for the fallback.
    if (hadFocus) queueMicrotask(() => resetButton?.focus());
  };
  const swipe = createSwipe({
    threshold: 0.35,
    onSettled: (outcome) => {
      if (outcome === "dismissed") dismissCard();
    },
  });

  const selectTab = (id: string) => {
    viewTransition(() => setTab(id));
  };

  return (
    <div class="MotionDemo">
      <div class="MotionGroup">
        <div class="MotionLabel" id="motion-preset-label">
          Spring preset
        </div>
        <div class="MotionPresetRow" role="group" aria-labelledby="motion-preset-label">
          <For each={PRESETS}>
            {(name) => (
              <button
                type="button"
                class="MotionPresetButton"
                data-active={preset() === name ? "true" : "false"}
                aria-pressed={preset() === name ? "true" : "false"}
                onClick={() => setPreset(name)}
              >
                {LABELS[name]}
              </button>
            )}
          </For>
          <button type="button" class="MotionPingButton" onClick={() => setPinged((p) => !p)}>
            Ping
          </button>
        </div>
        <div class="MotionTrack">
          <div
            class="MotionDot"
            style={{
              transform: pinged() ? "translateX(216px)" : "translateX(0px)",
              "transition-duration": `var(--solidix-spring-${preset()}-duration, 300ms)`,
              "transition-timing-function": `var(--solidix-spring-${preset()}, ease)`,
            }}
          />
        </div>
        <div class="MotionStatus">
          {LABELS[preset()]} · {DURATIONS[preset()]}
        </div>
      </div>

      <div class="MotionGroup">
        <div class="MotionLabel" id="motion-tabs-label">
          Morphing indicator
        </div>
        <div class="MotionTabs" role="tablist" aria-labelledby="motion-tabs-label">
          <div
            class="MotionPill"
            aria-hidden="true"
            style={{ transform: `translateX(${TABS.findIndex((t) => t.id === tab()) * 104}px)` }}
          />
          <For each={TABS}>
            {(item) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab() === item.id ? "true" : "false"}
                class="MotionTab"
                onClick={() => selectTab(item.id)}
              >
                {item.label}
              </button>
            )}
          </For>
        </div>
        <For each={TABS}>
          {(item) => (
            <div role="tabpanel" class="MotionPanel" hidden={tab() !== item.id}>
              {item.text}
            </div>
          )}
        </For>
      </div>

      <div class="MotionGroup">
        <div class="MotionLabel">Swipe to dismiss</div>
        <Show
          when={!dismissed()}
          fallback={
            <div class="MotionDismissed">
              Card dismissed.{" "}
              <button
                type="button"
                class="MotionResetButton"
                ref={(el) => {
                  resetButton = el;
                }}
                onClick={() => setDismissed(false)}
              >
                Reset
              </button>
            </div>
          }
        >
          <div
            class="MotionSwipeCard"
            ref={(el: HTMLElement | null) => {
              swipe.ref(el);
              swipeCard = el ?? undefined;
            }}
          >
            <span>Drag me left or right</span>
            <button type="button" class="MotionDismissButton" onClick={dismissCard}>
              Dismiss
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default MotionDemo;
