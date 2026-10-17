import { createUniqueId } from "solid-js";

function useId(deterministicId?: string): string {
  const id = createUniqueId();
  return deterministicId || (id ? `radix-${id}` : "");
}

export { useId };
