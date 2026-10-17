/**
 * Runs `run` once `node` is connected to a document, and returns a cleanup that
 * cancels the wait (when still pending) and runs `run`'s own cleanup (when run).
 *
 * A ref being set does not imply the node is connected yet: Solid calls `ref`
 * at element creation (before insertion), and slotted children additionally
 * resolve lazily, so document-dependent setup (event listeners on
 * `ownerDocument`, `body` locks, `hideOthers`) must wait for insertion.
 * Before adoption, a template-cloned node's `ownerDocument` may even point at
 * a detached template-contents document whose `body` is `null`.
 *
 * When `node` is already connected the callback runs synchronously (no timing
 * change for the common path). Otherwise a `MutationObserver` waits for the
 * insertion mutation itself, so arbitrarily deferred mounts (multi-flush or
 * animation-frame-deferred) are covered without polling.
 */
export function afterConnected(
  node: Element | null | undefined,
  run: () => (() => void) | void,
): () => void {
  let cleanup: (() => void) | void;
  let cancelled = false;
  let observer: MutationObserver | undefined;

  const cancel = () => {
    cancelled = true;
    observer?.disconnect();
    observer = undefined;
    cleanup?.();
  };

  if (node?.isConnected) {
    cleanup = run();
    return cancel;
  }

  if (typeof MutationObserver === "undefined") {
    // No DOM observer available (SSR); run on a microtask as a best effort.
    queueMicrotask(() => {
      if (!cancelled) {
        cleanup = run();
      }
    });
    return cancel;
  }

  observer = new MutationObserver(() => {
    if (cancelled) {
      return;
    }
    if (node?.isConnected) {
      observer?.disconnect();
      observer = undefined;
      cleanup = run();
    }
  });
  // Insertion mutates the new parent, not the node, so observe the document the
  // node will land in (plus its current root when that is a different tree).
  const doc = globalThis.document as Document | undefined;
  const root = node?.getRootNode?.() as Node | undefined;
  if (doc) {
    observer.observe(doc, { childList: true, subtree: true });
  }
  if (root && root !== doc) {
    observer.observe(root, { childList: true, subtree: true });
  }
  return cancel;
}
