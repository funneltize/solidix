// Solidix-native resizable split layout. Sizes are percentages the
// consumer owns (or not: uncontrolled works too); handles are separators
// with full keyboard support, per the WAI window-splitter pattern.

import { For, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";

/** Props for the `SplitPane` layout. */
export interface SplitPaneProps {
  /** Panel sizes as percentages (controlled); must match the panel count. */
  sizes?: number[] | undefined;
  /** Initial panel sizes as percentages. Defaults to equal shares. */
  defaultSizes?: number[] | undefined;
  /** Fires with the full size list after every drag or key step. */
  onSizesChange?: ((sizes: number[]) => void) | undefined;
  /** Smallest percentage a panel may shrink to. Defaults to 10; set 0 to let panels collapse fully. */
  minSize?: number | undefined;
  /** Stack panels vertically instead of horizontally. */
  vertical?: boolean | undefined;
  /**
   * When set, sizes persist to localStorage under this key and restore
   * on mount. Double-clicking a handle resets to the default sizes.
   */
  storageKey?: string | undefined;
  /** Additional class on the split container. */
  class?: string | undefined;
  /** Panels in order; a handle is inserted between each pair. */
  children?: JSX.Element | undefined;
}

const clampSizes = (sizes: number[], min: number) => {
  const clamped = sizes.map((size) => Math.max(min, size));
  const total = clamped.reduce((sum, size) => sum + size, 0);
  return clamped.map((size) => (size / total) * 100);
};

/**
 * A resizable split layout: panels sized in percentages, divided by
 * separator handles. Drag a handle, or focus it and use the arrow keys
 * (Shift for larger steps); Home and End push it to its limits. Sizes
 * normalize to 100 and never cross `minSize`.
 */
export const SplitPane: Component<SplitPaneProps> = (props) => {
  const panelCount = () => {
    const count = countChildren(props.children);
    return Math.max(count, 1);
  };
  const [sizes, setSizes] = useControllableState({
    prop: () => props.sizes,
    onChange: (next: number[] | undefined) => {
      if (next) props.onSizesChange?.(next);
    },
    defaultProp: props.defaultSizes,
    caller: "SplitPane",
  });
  const storedSizes = (): number[] | undefined => {
    if (!props.storageKey) return undefined;
    try {
      const raw = localStorage.getItem(props.storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : undefined;
      return Array.isArray(parsed) && parsed.every((entry) => typeof entry === "number")
        ? parsed
        : undefined;
    } catch {
      return undefined;
    }
  };
  const currentSizes = (): number[] => {
    const count = panelCount();
    const stored = sizes() ?? storedSizes();
    if (stored && stored.length === count) return stored;
    return Array.from({ length: count }, () => 100 / count);
  };
  const persist = (next: number[]) => {
    if (!props.storageKey) return;
    try {
      localStorage.setItem(props.storageKey, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode, quota): sizes stay in memory.
    }
  };
  const min = () => props.minSize ?? 10;

  const resize = (handleIndex: number, deltaPercent: number) => {
    const current = [...currentSizes()];
    const before = current[handleIndex]!;
    const after = current[handleIndex + 1]!;
    const applied = Math.max(
      -Math.max(0, before - min()),
      Math.min(deltaPercent, Math.max(0, after - min())),
    );
    if (applied === 0) return;
    current[handleIndex] = before + applied;
    current[handleIndex + 1] = after - applied;
    const next = clampSizes(current, 0);
    setSizes(next);
    persist(next);
  };

  let container: HTMLDivElement | undefined;
  const startDrag = (handleIndex: number, event: PointerEvent) => {
    if (!container) return;
    event.preventDefault();
    const rect = container.getBoundingClientRect();
    const extent = props.vertical ? rect.height : rect.width;
    const start = props.vertical ? event.clientY : event.clientX;
    const startSizes = [...currentSizes()];
    const move = (moveEvent: PointerEvent) => {
      const now = props.vertical ? moveEvent.clientY : moveEvent.clientX;
      const delta = ((now - start) / extent) * 100;
      const next = [...startSizes];
      const before = next[handleIndex]!;
      const after = next[handleIndex + 1]!;
      const applied = Math.max(-(before - min()), Math.min(delta, after - min()));
      next[handleIndex] = before + applied;
      next[handleIndex + 1] = after - applied;
      setSizes(next);
      persist(next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const panels = () => splitChildren(props.children);
  return (
    <div
      ref={(node) => {
        container = node;
      }}
      class={cx("fui-SplitPane", props.class)}
      data-vertical={props.vertical ? "" : undefined}
    >
      <For each={panels()}>
        {(panel, index) => (
          <>
            {index() > 0 ? (
              <div
                role="separator"
                tabindex="0"
                aria-orientation={props.vertical ? "horizontal" : "vertical"}
                aria-valuenow={Math.round(currentSizes()[index() - 1]!)}
                aria-valuemin={min()}
                aria-valuemax={100 - min()}
                aria-label={`Resize panel ${index()} and ${index() + 1}`}
                class="fui-SplitPaneHandle"
                onPointerDown={(event) => startDrag(index() - 1, event)}
                onDblClick={() => {
                  const count = panelCount();
                  const next =
                    props.defaultSizes && props.defaultSizes.length === count
                      ? [...props.defaultSizes]
                      : Array.from({ length: count }, () => 100 / count);
                  setSizes(next);
                  persist(next);
                }}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 5 : 1;
                  const decrease = props.vertical ? "ArrowUp" : "ArrowLeft";
                  const increase = props.vertical ? "ArrowDown" : "ArrowRight";
                  if (event.key === decrease) {
                    event.preventDefault();
                    resize(index() - 1, -step);
                  } else if (event.key === increase) {
                    event.preventDefault();
                    resize(index() - 1, step);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    resize(index() - 1, -100);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    resize(index() - 1, 100);
                  }
                }}
              />
            ) : null}
            <div
              class="fui-SplitPanePanel"
              style={{
                [props.vertical ? "height" : "width"]: `${currentSizes()[index()]}%`,
              }}
            >
              {panel}
            </div>
          </>
        )}
      </For>
    </div>
  );
};

function countChildren(children: JSX.Element | undefined): number {
  return splitChildren(children).length;
}

function splitChildren(children: JSX.Element | undefined): JSX.Element[] {
  if (Array.isArray(children)) return children;
  return children === undefined || children === null || children === false ? [] : [children];
}

/** Props for one panel inside a `SplitPane`; a plain styled region. */
export interface SplitPanePanelProps {
  /** Additional class on the panel. */
  class?: string | undefined;
  /** Panel content. */
  children?: JSX.Element | undefined;
}

/**
 * Marks a region as a split panel for readability at call sites; the
 * sizing wrapper is rendered by `SplitPane` itself, so this renders
 * its children transparently.
 */
export const SplitPanePanel: Component<SplitPanePanelProps> = (props) => <>{props.children}</>;

/** Rest props SplitPane does not consume, for type consumers. */
export type SplitPaneRestProps = Omit<SplitPaneProps, "children" | "class">;
