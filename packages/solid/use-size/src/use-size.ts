import { createEffect, createSignal } from "solid-js";

type Size = { width: number; height: number };

/** Tracks an element's content size with a ResizeObserver. */
function useSize(element: HTMLElement | null | (() => HTMLElement | null)): () => Size | undefined {
  const get = typeof element === "function" ? (element as () => HTMLElement | null) : () => element;
  const [size, setSize] = createSignal<Size | undefined>(undefined);

  createEffect(
    () => get(),
    (current) => {
      if (!current) {
        // We only want to reset to `undefined` when the element becomes `null`,
        // not if it changes to another element.
        setSize(undefined);
        return;
      }

      const element = current;
      // provide size as early as possible
      setSize({ width: element.offsetWidth, height: element.offsetHeight });

      let rAF = 0;

      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }

        // Since we only observe the one element, we don't need to loop over the
        // array
        if (!entries.length) {
          return;
        }

        const entry = entries[0]!;

        /**
         * Resize Observer will throw an often benign error that says
         * `ResizeObserver loop completed with undelivered notifications`. This
         * means that ResizeObserver was not able to deliver all observations
         * within a single animation frame, so we use `requestAnimationFrame` to
         * ensure we don't deliver unnecessary observations.
         *
         * See https://github.com/WICG/resize-observer/issues/38
         *     https://github.com/radix-ui/primitives/issues/2313
         */
        window.cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(() => {
          let width: number;
          let height: number;

          if ("borderBoxSize" in entry) {
            const borderSizeEntry = entry["borderBoxSize"];
            // iron out differences between browsers
            const borderSize = Array.isArray(borderSizeEntry)
              ? borderSizeEntry[0]
              : borderSizeEntry;
            width = borderSize["inlineSize"];
            height = borderSize["blockSize"];
          } else {
            // for browsers that don't support `borderBoxSize`
            // we calculate it ourselves to get the correct border box.
            width = element.offsetWidth;
            height = element.offsetHeight;
          }

          setSize({ width, height });
        });
      });

      resizeObserver.observe(element, { box: "border-box" });

      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    },
  );

  return size;
}

export { useSize };
