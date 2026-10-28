/**
 * Initials for an avatar fallback: the first letters of the first and last
 * whitespace-separated words, uppercased (single word yields one letter).
 *
 * Upstream: `helpers/get-initials.ts` at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
export function getInitials(name: string): string {
  return (
    name
      .match(/(\s|^)\p{L}\p{Mn}*/gu)
      ?.filter((_el, i, array) => i === 0 || i === array.length - 1)
      .map((el) => el.trimStart().toUpperCase())
      .join("") || ""
  );
}
