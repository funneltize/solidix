// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/helpers/compose-event-handlers.ts

/**
 * Composes two event handlers into one, skipping the second handler when the
 * first calls `event.preventDefault()`.
 */
function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: ((event: E) => void) | undefined,
  ourEventHandler?: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

export { composeEventHandlers };
