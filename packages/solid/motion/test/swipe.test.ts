import { afterEach, describe, expect, test, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import { createSwipe, type SwipeApi, type SwipeOptions, type SwipeRelease } from "../src/index";

type PointerInit = {
  pointerId?: number;
  clientX?: number;
  clientY?: number;
  button?: number;
};

function dispatchPointer(element: Element, type: string, init: PointerInit = {}): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: init.button ?? 0,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
  });
  (event as unknown as { pointerId: number }).pointerId = init.pointerId ?? 1;
  element.dispatchEvent(event);
}

function down(element: Element, x: number, init: PointerInit = {}): void {
  dispatchPointer(element, "pointerdown", { ...init, clientX: x });
}

function move(element: Element, x: number, y = 0): void {
  dispatchPointer(element, "pointermove", { clientX: x, clientY: y });
}

function up(element: Element, x: number): void {
  dispatchPointer(element, "pointerup", { clientX: x });
}

function drag(element: Element, fromX: number, toX: number, steps = 4): void {
  down(element, fromX);
  for (let i = 1; i <= steps; i += 1) {
    move(element, fromX + ((toX - fromX) * i) / steps);
  }
  up(element, toX);
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Passes the options object through untouched, so tests can mutate it live.
function attach(options: SwipeOptions, width = 200) {
  const element = document.createElement("div");
  document.body.appendChild(element);
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    width,
    height: 48,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: 48,
    toJSON: () => ({}),
  } as DOMRect);
  let api!: SwipeApi;
  const disposeRoot = createRoot((dispose) => {
    api = createSwipe(options);
    return dispose;
  });
  api.ref(element);
  return {
    element,
    api,
    dispose: () => {
      api.ref(null);
      disposeRoot();
      element.remove();
    },
  };
}

function setup(options: SwipeOptions = {}, width = 200) {
  return attach({ duration: 5, ...options }, width);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("createSwipe", () => {
  test("tracks drags live with translate3d and phases", () => {
    const onDrag = vi.fn();
    const { element, api, dispose } = setup({ onDrag });
    expect(api.state()).toBe("idle");
    expect(element.dataset.state).toBe("idle");
    down(element, 100);
    move(element, 102);
    // Within slop: still a tap.
    expect(api.state()).toBe("idle");
    move(element, 140);
    flush();
    expect(api.state()).toBe("dragging");
    expect(element.dataset.state).toBe("dragging");
    expect(element.style.transform).toBe("translate3d(36px, 0px, 0px)");
    expect(onDrag).toHaveBeenCalled();
    expect(onDrag.mock.lastCall?.[0].displacement).toBe(36);
    up(element, 140);
    flush();
    expect(api.state()).toBe("settling");
    dispose();
  });

  test("snaps back below thresholds and cleans up inline styles", async () => {
    let now = 1000;
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, dispose } = setup({
      now: () => now,
      onRelease,
      onSettled,
    });
    down(element, 100);
    now += 400;
    move(element, 130);
    now += 400;
    move(element, 140);
    up(element, 140);
    // 36px < 80px threshold (0.4 × 200), ~0.05px/ms « 0.5 flick.
    expect(onRelease).toHaveBeenCalledTimes(1);
    const decision = onRelease.mock.lastCall?.[0] as SwipeRelease;
    expect(decision.dismissed).toBe(false);
    expect(decision.cancelled).toBe(false);
    expect(element.style.transform).toContain("0px, 0px, 0px");
    expect(element.style.transition).toContain("transform");
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("snapped-back"));
    expect(element.style.transform).toBe("");
    expect(element.style.transition).toBe("");
    dispose();
  });

  test("dismisses past the displacement threshold", async () => {
    let now = 1000;
    const onSettled = vi.fn();
    const { element, dispose } = setup({ now: () => now, onSettled });
    down(element, 100);
    for (const x of [130, 160, 190]) {
      now += 400;
      move(element, x);
    }
    up(element, 190);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    // 200px measured + 48px overshoot past the edge.
    expect(element.style.transform).toBe("translate3d(248px, 0px, 0px)");
    dispose();
  });

  test("dismisses on flick velocity despite small displacement", async () => {
    let now = 1000;
    const onSettled = vi.fn();
    const { element, dispose } = setup({ now: () => now, onSettled });
    down(element, 100);
    now += 10;
    move(element, 130);
    now += 20;
    move(element, 140);
    up(element, 140);
    // 36px « 80px, but 1.8px/ms » 0.5 flick.
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    dispose();
  });

  test("velocity wins on conflicting flick-back", async () => {
    let now = 1000;
    const onRelease = vi.fn();
    const { element, dispose } = setup({ now: () => now, onRelease });
    down(element, 200);
    // Slow drag out past the threshold…
    for (const x of [240, 270, 310]) {
      now += 400;
      move(element, x);
    }
    // …then a hard flick back that ends past it on the way in.
    now += 200;
    move(element, 310);
    now += 20;
    move(element, 290);
    up(element, 290);
    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(onRelease.mock.lastCall?.[0].dismissed).toBe(true);
    expect(element.style.transform.startsWith("translate3d(-")).toBe(true);
    dispose();
  });

  test("pointercancel snaps back with zeroed velocity", async () => {
    let now = 1000;
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, dispose } = setup({ now: () => now, onRelease, onSettled });
    down(element, 100);
    now += 5;
    move(element, 160);
    dispatchPointer(element, "pointercancel", { clientX: 160 });
    const decision = onRelease.mock.lastCall?.[0] as SwipeRelease;
    expect(decision.cancelled).toBe(true);
    expect(decision.velocity).toBe(0);
    expect(decision.dismissed).toBe(false);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("snapped-back"));
    dispose();
  });

  test("clamps to the allowed direction", async () => {
    const onSettled = vi.fn();
    const { element, dispose } = setup({ direction: "positive", onSettled });
    drag(element, 100, 40);
    expect(element.style.transform).toContain("0px, 0px, 0px");
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("snapped-back"));
    dispose();
  });

  test("tracks the y axis with pan-x touch-action", () => {
    const { element, api, dispose } = setup({ axis: "y" });
    expect(element.style.touchAction).toBe("pan-x");
    down(element, 0);
    dispatchPointer(element, "pointermove", { clientX: 60, clientY: 50 });
    // Perpendicular movement is ignored; only the axis projects.
    flush();
    expect(api.state()).toBe("dragging");
    expect(element.style.transform).toBe("translate3d(0px, 46px, 0px)");
    up(element, 0);
    dispose();
  });

  test("uses pan-y touch-action on the x axis and restores on detach", () => {
    const { element, api, dispose } = setup();
    expect(element.style.touchAction).toBe("pan-y");
    dispose();
    expect(element.style.touchAction).toBe("");
    down(element, 100);
    move(element, 150);
    flush();
    expect(api.state()).toBe("idle");
  });

  test("reduced motion skips the settle animation but still settles", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onSettled });
    drag(element, 100, 190);
    // The end state applies with transitions suppressed, never animated…
    expect(element.style.transition).toBe("none");
    expect(element.style.transform).toBe("translate3d(248px, 0px, 0px)");
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    // …and suppression restores the pristine value after.
    expect(element.style.transition).toBe("");
    dispose();
  });

  test("interruption cancels the settle and resumes from the frozen spot", async () => {
    const onSettled = vi.fn();
    const { element, api, dispose } = setup({ onSettled, duration: 50 });
    drag(element, 100, 190);
    flush();
    expect(api.state()).toBe("settling");
    down(element, 190);
    move(element, 150);
    flush();
    expect(api.state()).toBe("dragging");
    // The interrupted settle's transition is gone; drag feedback is raw.
    expect(element.style.transition).toBe("none");
    // Drag back under the threshold from the frozen 248px.
    move(element, 10);
    up(element, 10);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1));
    expect(onSettled).toHaveBeenCalledWith("snapped-back");
    dispose();
  });

  test("tap during a settle resumes the interrupted animation", async () => {
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onRelease, onSettled, duration: 50 });
    drag(element, 100, 190);
    expect(onRelease).toHaveBeenCalledTimes(1);
    down(element, 190);
    up(element, 190);
    // No second release decision - the original settle resumes instead.
    expect(onRelease).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    dispose();
  });

  test("completes on transitionend exactly once", async () => {
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onSettled, duration: 30 });
    drag(element, 100, 120);
    const end = new Event("transitionend", { bubbles: true });
    (end as unknown as { propertyName: string }).propertyName = "transform";
    element.dispatchEvent(end);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("snapped-back"));
    await sleep(200);
    expect(onSettled).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("captures only once dragging, so taps keep native click targeting", () => {
    const { element, dispose } = setup();
    element.setPointerCapture = vi.fn();
    const button = document.createElement("button");
    element.appendChild(button);
    const onClick = vi.fn();
    button.addEventListener("click", onClick);
    // A tap never captures: the click reaches the button untouched.
    dispatchPointer(button, "pointerdown", { clientX: 100 });
    dispatchPointer(button, "pointerup", { clientX: 100 });
    expect(element.setPointerCapture).not.toHaveBeenCalled();
    button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
    // Crossing the slop captures for off-element tracking.
    dispatchPointer(button, "pointerdown", { clientX: 100 });
    dispatchPointer(button, "pointermove", { clientX: 150 });
    expect(element.setPointerCapture).toHaveBeenCalledWith(1);
    dispose();
  });

  test("swallows the click after a drag but not after a tap", () => {
    const { element, dispose } = setup();
    drag(element, 100, 160);
    const swallowed = new MouseEvent("click", { bubbles: true, cancelable: true });
    element.dispatchEvent(swallowed);
    expect(swallowed.defaultPrevented).toBe(true);
    down(element, 100);
    up(element, 101);
    const tapped = new MouseEvent("click", { bubbles: true, cancelable: true });
    element.dispatchEvent(tapped);
    expect(tapped.defaultPrevented).toBe(false);
    dispose();
  });

  test("ignores extra pointers and non-primary buttons", () => {
    const { element, api, dispose } = setup();
    down(element, 100);
    down(element, 500, { pointerId: 2 });
    move(element, 140);
    expect(element.style.transform).toBe("translate3d(36px, 0px, 0px)");
    up(element, 140);
    down(element, 100, { button: 2 });
    move(element, 160);
    expect(api.state()).toBe("idle");
    dispose();
  });

  test("reports live displacement through onDrag", () => {
    const seen: number[] = [];
    const { element, dispose } = setup({
      onDrag: (info) => seen.push(info.displacement),
    });
    down(element, 100);
    move(element, 120);
    move(element, 140);
    up(element, 140);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[seen.length - 1]).toBe(36);
    dispose();
  });

  test("floors tiny-element thresholds at 24px", async () => {
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onSettled }, 0);
    drag(element, 100, 115);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("snapped-back"));
    drag(element, 100, 140);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    // Zero measured size falls back to fixed travel.
    expect(element.style.transform).toBe("translate3d(96px, 0px, 0px)");
    dispose();
  });

  test("rejects invalid options", () => {
    expect(() => createSwipe(null as unknown as SwipeOptions)).toThrow(TypeError);
    expect(() => createSwipe({ axis: "z" as "x" })).toThrow(RangeError);
    expect(() => createSwipe({ direction: "up" as "both" })).toThrow(RangeError);
    expect(() => createSwipe({ threshold: 0 })).toThrow(RangeError);
    expect(() => createSwipe({ velocityThreshold: -1 })).toThrow(RangeError);
    expect(() => createSwipe({ duration: -1 })).toThrow(RangeError);
    expect(() => createSwipe({ easing: "" })).toThrow(TypeError);
    expect(() => createSwipe({ onDrag: 1 as unknown as () => void })).toThrow(TypeError);
  });

  test("dismisses in the negative direction", async () => {
    let now = 1000;
    const onSettled = vi.fn();
    const { element, api, dispose } = setup({ now: () => now, onSettled });
    down(element, 200);
    for (const x of [160, 120, 90]) {
      now += 400;
      move(element, x);
    }
    up(element, 90);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    flush();
    expect(api.state()).toBe("dismissed");
    expect(element.style.transform).toBe("translate3d(-248px, 0px, 0px)");
    dispose();
  });

  test("duration zero settles instantly but still async", async () => {
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onSettled, duration: 0 });
    drag(element, 100, 190);
    // The end state applies synchronously; the callback never fires sync.
    expect(element.style.transform).toBe("translate3d(248px, 0px, 0px)");
    expect(onSettled).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    dispose();
  });

  test("taps fire no gesture callbacks and leave the element untouched", async () => {
    const onDrag = vi.fn();
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, api, dispose } = setup({ onDrag, onRelease, onSettled });
    down(element, 100);
    move(element, 102);
    up(element, 102);
    await sleep(0);
    expect(onDrag).not.toHaveBeenCalled();
    expect(onRelease).not.toHaveBeenCalled();
    expect(onSettled).not.toHaveBeenCalled();
    flush();
    expect(api.state()).toBe("idle");
    expect(element.style.transform).toBe("");
    dispose();
  });

  test("tap on a kept-mounted dismissed element preserves its state", async () => {
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, api, dispose } = setup({ onRelease, onSettled });
    drag(element, 100, 190);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    flush();
    expect(api.state()).toBe("dismissed");
    down(element, 190);
    up(element, 190);
    flush();
    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(api.state()).toBe("dismissed");
    expect(element.dataset.state).toBe("dismissed");
    expect(element.style.transform).toBe("translate3d(248px, 0px, 0px)");
    dispose();
  });

  test("detach mid-drag cancels silently and restores everything", async () => {
    const onSettled = vi.fn();
    const { element, api, dispose } = setup({ onSettled });
    down(element, 100);
    move(element, 150);
    flush();
    expect(api.state()).toBe("dragging");
    api.ref(null);
    flush();
    expect(api.state()).toBe("idle");
    expect(element.style.transform).toBe("");
    expect(element.style.transition).toBe("");
    expect(element.style.touchAction).toBe("");
    expect(element.dataset.state).toBeUndefined();
    await sleep(200);
    expect(onSettled).not.toHaveBeenCalled();
    // Dead listeners: further pointer traffic is ignored.
    up(element, 150);
    move(element, 160);
    flush();
    expect(api.state()).toBe("idle");
    dispose();
  });

  test("suppresses author transitions mid-drag and restores them after", async () => {
    const onSettled = vi.fn();
    const { element, api, dispose } = setup({ onSettled });
    element.style.transition = "transform 500ms linear";
    down(element, 100);
    move(element, 140);
    flush();
    expect(api.state()).toBe("dragging");
    expect(element.style.transition).toBe("none");
    up(element, 140);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1));
    expect(element.style.transition).toBe("transform 500ms linear");
    dispose();
  });

  test("reduced motion settles instantly through author transitions", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onSettled });
    element.style.transition = "transform 500ms linear";
    drag(element, 100, 190);
    expect(element.style.transform).toBe("translate3d(248px, 0px, 0px)");
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    expect(element.style.transition).toBe("transform 500ms linear");
    dispose();
  });

  test("completes the gesture when release lands off-element", async () => {
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onRelease, onSettled });
    down(element, 100);
    move(element, 190);
    // Capture failed (or the pointer left the element): release outside.
    dispatchPointer(document.body, "pointerup", { clientX: 190 });
    expect(onRelease).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("dismissed"));
    dispose();
  });

  test("cancel landing off-element snaps back as cancelled", async () => {
    const onRelease = vi.fn();
    const onSettled = vi.fn();
    const { element, dispose } = setup({ onRelease, onSettled });
    down(element, 100);
    move(element, 130);
    dispatchPointer(document.body, "pointercancel", { clientX: 130 });
    const decision = onRelease.mock.lastCall?.[0] as SwipeRelease;
    expect(decision.cancelled).toBe(true);
    expect(decision.dismissed).toBe(false);
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith("snapped-back"));
    dispose();
  });

  test("reads callbacks live from the options object", () => {
    const options: SwipeOptions = { duration: 5 };
    const { element, dispose } = attach(options);
    const onDrag = vi.fn();
    options.onDrag = onDrag;
    down(element, 100);
    move(element, 140);
    up(element, 140);
    expect(onDrag).toHaveBeenCalled();
    dispose();
  });

  test("reads the time source live from the options object", () => {
    const options: SwipeOptions = { duration: 5, now: () => 1000 };
    const { element, dispose } = attach(options);
    const seen: number[] = [];
    options.onDrag = (info) => seen.push(info.velocity);
    down(element, 100);
    move(element, 120);
    // A frozen clock reports zero velocity; the replacement clock spans 100ms.
    options.now = () => 1100;
    move(element, 140);
    up(element, 140);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]).toBe(0);
    expect(seen[seen.length - 1]).not.toBe(0);
    dispose();
  });

  test("dispose detaches listeners and preserves untouched styles", () => {
    const { element, api, dispose: teardown } = setup();
    element.style.transition = "opacity 200ms";
    api.dispose();
    expect(api.state()).toBe("idle");
    expect(element.style.transform).toBe("");
    expect(element.style.touchAction).toBe("");
    expect(element.style.transition).toBe("opacity 200ms");
    expect(element.dataset.state).toBeUndefined();
    down(element, 100);
    move(element, 160);
    expect(element.style.transform).toBe("");
    teardown();
  });
});
