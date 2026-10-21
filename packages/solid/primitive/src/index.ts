export { Primitive, Root, dispatchDiscreteCustomEvent } from "./primitive";
export type { PrimitivePropsWithRef } from "./primitive";
export {
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  getOwnerWindow,
  getOwnerDocument,
  getActiveElement,
  getOpenState,
  isFrame,
} from "./dom";
export { canUseDOM } from "./can-use-dom";
export { hideOthers, inertOthers, supportsInert, suppressOthers } from "./aria-hidden";
export type { Undo } from "./aria-hidden";
export type { Timeout, Interval, Immediate } from "./types";
