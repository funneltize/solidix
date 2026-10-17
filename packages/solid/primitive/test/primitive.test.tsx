import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import {
  Primitive,
  callEventHandler,
  canUseDOM,
  composeEventHandlers,
  dispatchDiscreteCustomEvent,
  getActiveElement,
  getOwnerDocument,
  getOwnerWindow,
  hideOthers,
  isFrame,
} from "../src/index";

describe("Primitive", () => {
  test("renders the underlying element", async () => {
    render(() => <Primitive.button type="button">press</Primitive.button>);
    const button = await screen.findByRole("button", { name: "press" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
  });

  test("asChild slots props onto the child", async () => {
    render(() => (
      <Primitive.button asChild data-state="open" class="slot">
        <a href="/go" class="child">
          go
        </a>
      </Primitive.button>
    ));

    const link = (await screen.findByRole("link", { name: "go" })) as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.dataset.state).toBe("open");
    expect(link.classList.contains("slot")).toBe(true);
    expect(link.classList.contains("child")).toBe(true);
  });

  test("forwards refs", async () => {
    let element: HTMLElement | null = null;
    render(() => (
      <Primitive.div ref={(node: HTMLDivElement | null) => void (element = node)} data-testid="box">
        hi
      </Primitive.div>
    ));

    await screen.findByTestId("box");
    expect(element).toBeInstanceOf(HTMLDivElement);
  });

  test("marks the radix-ui global", async () => {
    render(() => <Primitive.span>hi</Primitive.span>);
    await screen.findByText("hi");
    expect((window as any)[Symbol.for("radix-ui")]).toBe(true);
  });
});

describe("dispatchDiscreteCustomEvent", () => {
  test("dispatches the event on the target", () => {
    const target = document.createElement("div");
    const listener = vi.fn();
    target.addEventListener("radix:test", listener);

    dispatchDiscreteCustomEvent(target, new CustomEvent("radix:test"));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("tolerates a null target", () => {
    expect(() => dispatchDiscreteCustomEvent(null, new CustomEvent("radix:test"))).not.toThrow();
  });
});

describe("dom utils", () => {
  test("canUseDOM is true in the test environment", () => {
    expect(canUseDOM).toBe(true);
  });

  test("composeEventHandlers runs both handlers unless default-prevented", () => {
    const calls: string[] = [];
    const handler = composeEventHandlers(
      () => void calls.push("original"),
      () => void calls.push("ours"),
    );

    handler(new CustomEvent("test") as any);
    expect(calls).toEqual(["original", "ours"]);

    calls.length = 0;
    const prevented = new CustomEvent("test", { cancelable: true });
    prevented.preventDefault();
    const handler2 = composeEventHandlers(
      () => void calls.push("original"),
      () => void calls.push("ours"),
    );
    handler2(prevented as any);
    expect(calls).toEqual(["original"]);
  });

  test("owner helpers resolve the document and window", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    expect(getOwnerDocument(element)).toBe(document);
    expect(getOwnerWindow(element)).toBe(window);
    element.remove();
  });

  test("getActiveElement and isFrame", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();
    expect(getActiveElement(button)).toBe(button);
    expect(isFrame(button)).toBe(false);
    expect(isFrame(document.createElement("iframe"))).toBe(true);
    button.remove();
  });

  test("callEventHandler invokes valid tuples and ignores malformed ones", () => {
    const calls: Array<[unknown, unknown]> = [];
    const event = new CustomEvent("test");
    callEventHandler(
      [(data: unknown, e: unknown) => void calls.push([data, e]), { data: true }],
      event,
    );
    expect(calls).toEqual([[{ data: true }, event]]);
  });

  test("callEventHandler ignores malformed tuples instead of throwing", () => {
    const event = new CustomEvent("test");
    expect(() => callEventHandler([undefined, { data: true }] as any, event)).not.toThrow();
    expect(() => callEventHandler([null, { data: true }] as any, event)).not.toThrow();
    expect(() => callEventHandler(null, event)).not.toThrow();
    expect(() => callEventHandler(undefined, event)).not.toThrow();
  });
});

describe("hideOthers", () => {
  test("hides everything except the targets, then undoes", () => {
    document.body.innerHTML = '<div id="a">a</div><div id="b">b<span id="c">c</span></div>';
    const target = document.getElementById("b")!;

    const undo = hideOthers(new Set([target]), document.body);

    expect(document.getElementById("a")!.getAttribute("aria-hidden")).toBe("true");
    expect(target.hasAttribute("aria-hidden")).toBe(false);

    undo();
    expect(document.getElementById("a")!.hasAttribute("aria-hidden")).toBe(false);

    document.body.innerHTML = "";
  });
});
