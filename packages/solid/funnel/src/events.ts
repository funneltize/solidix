/**
 * Analytics-facing event contract for funnel blocks. Blocks dispatch these
 * `CustomEvent`s (bubbles + composed) so any snippet can observe conversions
 * without the package depending on an analytics SDK:
 *
 *   document.addEventListener("funnel:submit", (event) => {
 *     analytics.track("opt_in", event.detail);
 *   });
 */
export type FunnelEventType = "funnel:cta" | "funnel:submit" | "funnel:view";

export type FunnelEventDetail = Record<string, unknown> & {
  block?: string | undefined;
  variant?: string | undefined;
};

/**
 * Dispatches a bubbling funnel analytics event (`funnel:cta`, `funnel:submit`, `funnel:view`) from a block element.
 */
export function dispatchFunnelEvent(
  target: EventTarget,
  type: FunnelEventType,
  detail?: FunnelEventDetail | undefined,
): void {
  target.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}
