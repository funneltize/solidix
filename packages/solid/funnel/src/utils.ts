/**
 * Joins class parts (strings, arrays, conditional objects), dropping
 * nullish/empty entries. Accepts everything Solid's `class` prop accepts.
 */
export function cx(...parts: unknown[]): string {
  const out: string[] = [];
  const push = (part: unknown): void => {
    if (part === null || part === undefined || part === false || part === "") return;
    if (typeof part === "string" || typeof part === "number") {
      out.push(String(part));
      return;
    }
    if (Array.isArray(part)) {
      for (const entry of part) push(entry);
      return;
    }
    if (typeof part === "object") {
      for (const [token, enabled] of Object.entries(part)) {
        if (enabled) out.push(token);
      }
    }
  };
  for (const part of parts) push(part);
  return out.join(" ");
}
