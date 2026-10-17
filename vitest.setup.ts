import { afterEach } from "vitest";
import { cleanup } from "@solidjs/testing-library";

afterEach(() => {
  cleanup();
});

// jsdom does not implement ResizeObserver; provide a no-op so components that
// observe sizes mount cleanly. Tests that assert observations stub it
// themselves with `vi.stubGlobal`.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// jsdom does not implement `scrollIntoView`; several primitives (e.g. Select)
// call it during focus management when open, so provide a no-op.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
