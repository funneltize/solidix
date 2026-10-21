/** Whether a real DOM is available (false during SSR). */
export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);
