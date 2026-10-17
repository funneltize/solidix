import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { RemoveScroll } from "../src/index";

function lockStyle(): HTMLStyleElement | null {
  return document.head.querySelector('style[data-soldix="remove-scroll-bar"]');
}

describe("RemoveScroll", () => {
  test("renders a wrapper element by default", async () => {
    render(() => (
      <RemoveScroll data-testid="lock" class="custom-class">
        <span>content</span>
      </RemoveScroll>
    ));

    const lock = (await screen.findByTestId("lock")) as HTMLElement;
    expect(lock.tagName).toBe("DIV");
    expect(lock.classList.contains("custom-class")).toBe(true);
    expect(await screen.findByText("content")).toBeTruthy();
  });

  test("renders the child directly when `asChild` is set", async () => {
    let element: HTMLElement | null = null;

    render(() => (
      <RemoveScroll asChild ref={(node) => void (element = node)}>
        <article data-testid="lock">content</article>
      </RemoveScroll>
    ));

    const lock = (await screen.findByTestId("lock")) as HTMLElement;
    expect(lock.tagName).toBe("ARTICLE");
    expect(element).toBe(lock);
  });

  test("marks the body locked and injects compensation styles while mounted", async () => {
    const { unmount } = render(() => (
      <RemoveScroll>
        <span>content</span>
      </RemoveScroll>
    ));
    await screen.findByText("content");

    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");
    const style = lockStyle();
    expect(style).toBeTruthy();
    expect(style!.textContent).toContain("overflow: hidden");
    expect(style!.textContent).toContain("--removed-body-scroll-bar-size");

    unmount();
    expect(document.body.getAttribute("data-scroll-locked")).toBe(null);
    expect(lockStyle()).toBe(null);
  });

  test("stacks nested locks and keeps styles until the last one unmounts", async () => {
    const first = render(() => (
      <RemoveScroll>
        <span>first</span>
      </RemoveScroll>
    ));
    const second = render(() => (
      <RemoveScroll>
        <span>second</span>
      </RemoveScroll>
    ));
    await screen.findByText("first");
    await screen.findByText("second");

    expect(document.body.getAttribute("data-scroll-locked")).toBe("2");
    expect(lockStyle()).toBeTruthy();

    first.unmount();
    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");
    expect(lockStyle()).toBeTruthy();

    second.unmount();
    expect(document.body.getAttribute("data-scroll-locked")).toBe(null);
    expect(lockStyle()).toBe(null);
  });

  test("does nothing while `enabled` is false", async () => {
    const { unmount } = render(() => (
      <RemoveScroll enabled={false}>
        <span>content</span>
      </RemoveScroll>
    ));
    await screen.findByText("content");

    expect(document.body.getAttribute("data-scroll-locked")).toBe(null);
    expect(lockStyle()).toBe(null);
    // A wheel on the body is not stopped when no lock is active.
    expect(fireEvent.wheel(document.body, { deltaY: 10 })).toBe(true);

    unmount();
  });

  test("stops wheel scrolls outside the lock", async () => {
    render(() => (
      <RemoveScroll>
        <span>content</span>
      </RemoveScroll>
    ));
    await screen.findByText("content");

    expect(fireEvent.wheel(document.body, { deltaY: 10 })).toBe(false);
  });

  test("lets wheel scrolls outside the lock through when `noIsolation` is set", async () => {
    render(() => (
      <RemoveScroll noIsolation>
        <span>content</span>
      </RemoveScroll>
    ));
    await screen.findByText("content");

    expect(fireEvent.wheel(document.body, { deltaY: 10 })).toBe(true);
  });

  test("stops wheel scrolls inside the lock that cannot scroll", async () => {
    render(() => (
      <RemoveScroll>
        <span data-testid="inner">content</span>
      </RemoveScroll>
    ));
    const inner = await screen.findByTestId("inner");

    // Nothing is scrollable in jsdom, so the scroll is always stopped.
    expect(fireEvent.wheel(inner, { deltaY: 10 })).toBe(false);
  });

  test("lets pinch-zoom gestures through when `allowPinchZoom` is set", async () => {
    render(() => (
      <RemoveScroll allowPinchZoom>
        <span data-testid="inner">content</span>
      </RemoveScroll>
    ));
    const inner = await screen.findByTestId("inner");

    expect(fireEvent.wheel(inner, { ctrlKey: true, deltaY: 10 })).toBe(true);
  });

  test("stops pinch-zoom gestures without `allowPinchZoom`", async () => {
    render(() => (
      <RemoveScroll>
        <span data-testid="inner">content</span>
      </RemoveScroll>
    ));
    const inner = await screen.findByTestId("inner");

    expect(fireEvent.wheel(inner, { ctrlKey: true, deltaY: 10 })).toBe(false);
  });

  test("treats shards as part of the lock", async () => {
    const shardRef: { current: HTMLElement | null } = { current: null };
    const onWheel = vi.fn();

    render(() => (
      <>
        <span data-testid="shard" ref={(node) => void (shardRef.current = node)} onWheel={onWheel}>
          shard
        </span>
        <RemoveScroll shards={[shardRef]}>
          <span>content</span>
        </RemoveScroll>
      </>
    ));
    await screen.findByText("content");
    const shard = await screen.findByTestId("shard");

    // The shard element resolves through its ref without crashing, and events
    // on it flow through the shard branch instead of the outside branch. (In
    // jsdom nothing is scrollable, so the scroll is still stopped.)
    expect(fireEvent.wheel(shard, { deltaY: 10 })).toBe(false);
    expect(onWheel).toHaveBeenCalled();
  });
});
