import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { createEffect, createSignal, flush } from "solid-js";
import { Presence } from "../src/index";

describe("Presence", () => {
  test("mounts when present and unmounts instantly without an exit animation", async () => {
    let setPresent!: (present: boolean) => void;
    render(() => {
      const [present, set] = createSignal(true);
      setPresent = set;
      return (
        <Presence present={present()}>
          <div>content</div>
        </Presence>
      );
    });

    expect(await screen.findByText("content")).toBeDefined();

    setPresent(false);
    flush();
    expect(screen.queryByText("content")).toBeNull();
  });

  test("stays unmounted when initially not present", () => {
    render(() => (
      <Presence present={false}>
        <div>content</div>
      </Presence>
    ));
    expect(screen.queryByText("content")).toBeNull();
  });

  test("mounts render-prop children while initially closed (forceMount parity)", async () => {
    render(() => (
      <Presence present={false}>
        {({ present }) => <div>{present() ? "shown" : "hidden"}</div>}
      </Presence>
    ));

    // Radix always mounts render-prop children, even while closed - the render
    // prop itself decides what `present: false` looks like (e.g. Select keeps
    // its items mounted in a detached fragment for data collection).
    expect(await screen.findByText("hidden")).toBeDefined();
    flush();
    expect(screen.queryByText("hidden")).toBeDefined();
  });

  test("render-prop children stay mounted and receive presence", async () => {
    let setPresent!: (present: boolean) => void;
    render(() => {
      const [present, set] = createSignal(true);
      setPresent = set;
      return (
        <Presence present={present()}>
          {({ present }) => <div>{present() ? "shown" : "hidden"}</div>}
        </Presence>
      );
    });

    expect(await screen.findByText("shown")).toBeDefined();

    setPresent(false);
    expect(await screen.findByText("hidden")).toBeDefined();
  });

  test("suspends unmount through an exit animation", async () => {
    let content!: HTMLElement;
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    // force the "was animating" path: the computed style must report an animation
    Object.defineProperty(window, "getComputedStyle", {
      value: (element: Element) =>
        element === content
          ? ({ animationName: "fade-out", display: "block" } as CSSStyleDeclaration)
          : realGetComputedStyle(element),
      configurable: true,
    });

    try {
      let setPresent!: (present: boolean) => void;
      render(() => {
        const [present, set] = createSignal(true);
        setPresent = set;
        return (
          <Presence present={present()}>
            <div style={{ "animation-name": "fade-out" }}>content</div>
          </Presence>
        );
      });

      content = (await screen.findByText("content")) as HTMLElement;
      flush();

      setPresent(false);
      flush();
      // still mounted while the exit animation runs
      expect(screen.queryByText("content")).toBeDefined();

      if (typeof CSS === "undefined" || typeof CSS.escape !== "function") {
        vi.stubGlobal("CSS", { escape: (value: string) => value });
      }
      const end = new Event("animationend", { bubbles: true });
      (end as any).animationName = "fade-out";
      content.dispatchEvent(end);
      flush();
      expect(screen.queryByText("content")).toBeNull();
    } finally {
      Object.defineProperty(window, "getComputedStyle", {
        value: realGetComputedStyle,
        configurable: true,
      });
    }
  });

  test("never resolves children to detached DOM while closed", async () => {
    // Regression: resolving (not just instantiating) closed children runs
    // their effects on detached nodes - eg. floating-ui `autoUpdate` throws
    // on a parentless floating element and halts the reactive queue.
    const seen: boolean[] = [];
    const Content = () => {
      const [node, setNode] = createSignal<HTMLDivElement | null>(null);
      createEffect(
        () => node(),
        (element) => {
          if (element) seen.push(element.isConnected);
        },
      );
      return <div ref={setNode}>content</div>;
    };

    let setPresent!: (present: boolean) => void;
    render(() => {
      const [present, set] = createSignal(false);
      setPresent = set;
      return (
        <Presence present={present()}>
          <Content />
        </Presence>
      );
    });
    flush();
    expect(screen.queryByText("content")).toBeNull();
    expect(seen).toEqual([]);

    setPresent(true);
    expect(await screen.findByText("content")).toBeDefined();
    flush();
    expect(seen).toEqual([true]);
  });

  test("mounts and unmounts component children with presence", async () => {
    let setPresent!: (present: boolean) => void;
    const Content = () => <div>content</div>;
    render(() => {
      const [present, set] = createSignal(true);
      setPresent = set;
      return (
        <Presence present={present()}>
          <Content />
        </Presence>
      );
    });

    expect(await screen.findByText("content")).toBeDefined();

    setPresent(false);
    await vi.waitFor(() => {
      expect(screen.queryByText("content")).toBeNull();
    });
  });
});
