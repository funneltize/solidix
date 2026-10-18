import { createUniqueId } from "solid-js";

/**
 * Counter-based unique ID for accessibility linkage (`aria-controls`/`id`
 * pairing). Predictable by design - never use for secrets, tokens, or
 * anything requiring unpredictability.
 */
function useId(deterministicId?: string): string {
  const id = createUniqueId();
  return deterministicId || (id ? `radix-${id}` : "");
}

export { useId };
