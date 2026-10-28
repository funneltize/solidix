import type { JSX } from "@solidjs/web";

/** A single class entry accepted by `cx`: any value Solid's `class` prop takes. */
type CxInput = JSX.ClassValue;

/**
 * Joins class names, dropping falsy entries and expanding conditional maps.
 * Solid-native replacement for the `classnames` package used upstream.
 */
function cx(...inputs: CxInput[]): string {
  const classes: string[] = [];
  const push = (input: CxInput): void => {
    if (!input) return;
    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      for (const entry of input) push(entry);
    } else if (typeof input === "object") {
      for (const key of Object.keys(input)) {
        if (input[key]) classes.push(key);
      }
    }
    // A bare `true` carries no class name, matching `classnames` behavior.
  };
  for (const input of inputs) push(input);
  return classes.join(" ");
}

export { cx };
export type { CxInput };
