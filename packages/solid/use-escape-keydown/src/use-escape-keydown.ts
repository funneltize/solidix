import { createEffect } from "solid-js";
import { useCallbackRef } from "@solidix/use-callback-ref";

/**
 * Listens for when the escape key is down
 *
 * @deprecated Attach listeners directly via effects for more granular control
 * over how callbacks are stabilized, when to detach listeners, etc.
 */
function useEscapeKeydown(
  onEscapeKeyDownProp?: (event: KeyboardEvent) => void,
  ownerDocument: Document | undefined = globalThis?.document,
) {
  const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);

  createEffect(
    () => ownerDocument,
    (document) => {
      if (!document) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        // An Escape during an IME composition belongs to the input method (see DismissableLayer).
        if (event.key === "Escape" && !event.isComposing && event.keyCode !== 229) {
          onEscapeKeyDown(event);
        }
      };
      document.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
    },
  );
}

export { useEscapeKeydown };
