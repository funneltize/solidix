import { createEffect, createSignal } from "solid-js";
import { observeElementRect, type Measurable } from "@soldix/rect";

/**
 * Use this custom hook to get access to an element's rect (getBoundingClientRect)
 * and observe it along time.
 */
function useRect(
  measurable: Measurable | null | (() => Measurable | null),
): () => DOMRect | undefined {
  const get =
    typeof measurable === "function" ? (measurable as () => Measurable | null) : () => measurable;
  const [rect, setRect] = createSignal<DOMRect | undefined>(undefined);

  createEffect(
    () => get(),
    (current) => {
      if (!current) return;
      const unobserve = observeElementRect(current, (next) => setRect(() => next));
      return () => {
        setRect(undefined);
        unobserve();
      };
    },
  );

  return rect;
}

export { useRect };
