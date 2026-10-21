import { canUseDOM } from "./can-use-dom";

/** Chains a consumer handler with an internal one, skipping the internal one when the event was prevented. */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: ((event: E) => void) | [handler: (data: any, event: E) => void, data: any],
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true }: { checkForDefaultPrevented?: boolean | undefined } = {},
) {
  return function handleEvent(event: E) {
    callEventHandler(originalEventHandler, event);

    if (checkForDefaultPrevented === false || !event || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

/**
 * Calls a Solid event handler prop, which may be a plain function or a bound
 * `[handler, data]` tuple (invoked as `handler(data, event)`).
 */
export function callEventHandler<E>(handler: unknown, event: E): void {
  if (typeof handler === "function") {
    (handler as (event: E) => void)(event);
  } else if (Array.isArray(handler)) {
    const [fn, data] = handler as [(data: unknown, event: E) => void, unknown];
    // A malformed tuple (non-function first element) is ignored instead of
    // throwing - a throw here would run inside event dispatch or an effect.
    if (typeof fn === "function") fn(data, event);
  }
}

/**
 * Solid's `aria-*` attribute types only accept `"true"`/`"false"` strings
 * where React accepts booleans, so normalize booleans at the boundary.
 * `undefined` stays `undefined` (attribute omitted), matching React's
 * rendering; `false` renders as `"false"`, also matching React.
 */
export function ariaBoolean(value: boolean | undefined): "true" | "false" | undefined {
  return value === undefined ? undefined : value ? "true" : "false";
}

/** Returns the window owning a node, falling back to the global window. */
export function getOwnerWindow(element: Node | null | undefined) {
  if (!canUseDOM) {
    throw new Error("Cannot access window outside of the DOM");
  }
  return element?.ownerDocument?.defaultView ?? window;
}

/** Returns the document owning a node, falling back to the global document. */
export function getOwnerDocument(element: Node | null | undefined) {
  if (!canUseDOM) {
    throw new Error("Cannot access document outside of the DOM");
  }
  return element?.ownerDocument ?? document;
}

/**
 * Lifted from https://github.com/ariakit/ariakit/blob/main/packages/ariakit-core/src/utils/dom.ts#L37
 * MIT License, Copyright (c) AriaKit.
 */
export function getActiveElement(
  node: Node | null | undefined,
  activeDescendant = false,
): HTMLElement | null {
  const { activeElement } = getOwnerDocument(node);
  if (!activeElement?.nodeName) {
    // `activeElement` might be an empty object if we're interacting with elements
    // inside of an iframe.
    return null;
  }

  if (isFrame(activeElement) && activeElement.contentDocument) {
    return getActiveElement(activeElement.contentDocument.body, activeDescendant);
  }

  if (activeDescendant) {
    const id = activeElement.getAttribute("aria-activedescendant");
    if (id) {
      const element = getOwnerDocument(activeElement).getElementById(id);
      if (element) {
        return element;
      }
    }
  }

  return activeElement as HTMLElement | null;
}

/** Narrows an element to an iframe by tag name. */
export function isFrame(element: Element): element is HTMLIFrameElement {
  return element.tagName === "IFRAME";
}

/** Maps an open flag to the `data-state` attribute value used across primitives. */
export function getOpenState(open: boolean): "open" | "closed" {
  return open ? "open" : "closed";
}
