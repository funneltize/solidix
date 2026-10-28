import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import {
  BotAvatar,
  botAvatarShapePaths,
  createBotAvatarHandle,
  getBotAvatarIdentity,
} from "../src/index";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function root(): HTMLElement {
  return document.querySelector(".fui-BotAvatarRoot") as HTMLElement;
}

describe("BotAvatar", () => {
  it("renders the silhouette with the linked clip path", () => {
    render(() => <BotAvatar />);
    const el = root();
    expect(el.classList.contains("fui-r-size-3")).toBe(true);

    const clipPath = el.querySelector("clipPath") as unknown as SVGElement;
    expect(clipPath.getAttribute("clipPathUnits")).toBe("objectBoundingBox");
    const id = clipPath.getAttribute("id");
    expect(id).not.toBeNull();
    const shape = el.querySelector(".fui-BotAvatarShape") as HTMLElement;
    expect(shape.style.getPropertyValue("--bot-avatar-clip")).toBe(`url(#${id})`);
    expect(clipPath.querySelector("path")?.getAttribute("d")).toBe(botAvatarShapePaths.circle);
    // No expression or status: no face.
    expect(el.querySelector(".fui-BotAvatarFace")).toBeNull();
  });

  it("renders the face for an expression", () => {
    render(() => <BotAvatar expression="happy" />);
    const el = root();
    const face = el.querySelector(".fui-BotAvatarFace") as HTMLElement;
    expect(face).not.toBeNull();
    expect(el.querySelector(".fui-BotAvatarBody")?.classList.contains("fui-with-face")).toBe(true);
    const eyes = [...face.querySelectorAll(".fui-BotAvatarEye")] as SVGElement[];
    expect(eyes).toHaveLength(2);
    for (const eye of eyes) {
      expect(eye.getAttribute("d")).toContain("M ");
      expect(eye.style.getPropertyValue("d")).toContain("path(");
    }
    const mouth = face.querySelector(".fui-BotAvatarMouth") as SVGElement;
    expect(mouth.getAttribute("d")).toContain("M ");
  });

  it("maps a status to a motion class and an implied face", () => {
    render(() => <BotAvatar status="done" />);
    const el = root();
    expect(el.classList.contains("fui-status-done")).toBe(true);
    expect(el.querySelectorAll(".fui-BotAvatarEye")).toHaveLength(2);
  });

  it("derives a stable shape and color from identity", () => {
    const first = getBotAvatarIdentity("grok-1");
    const second = getBotAvatarIdentity("grok-1");
    expect(second).toEqual(first);

    render(() => <BotAvatar identity="grok-1" />);
    const el = root();
    expect(el.getAttribute("data-accent-color")).toBe(first.color);
    expect(el.querySelector("clipPath path")?.getAttribute("d")).toBe(
      botAvatarShapePaths[first.shape],
    );
  });

  it("explicit shape and color win over identity", () => {
    render(() => <BotAvatar identity="grok-1" shape="heart" color="red" />);
    const el = root();
    expect(el.getAttribute("data-accent-color")).toBe("red");
    expect(el.querySelector("clipPath path")?.getAttribute("d")).toBe(
      botAvatarShapePaths.heart,
    );
  });

  it("applies size, high contrast, and the notification dot", () => {
    render(() => <BotAvatar size="5" highContrast notification expression="neutral" />);
    const el = root();
    expect(el.classList.contains("fui-r-size-5")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
    expect(el.querySelector(".fui-BotAvatarNotification")).not.toBeNull();
  });

  it("declarative gaze deflects the face", () => {
    render(() => <BotAvatar expression="neutral" gaze={{ x: 1, y: -1 }} />);
    const el = root();
    expect(el.classList.contains("fui-gazing")).toBe(true);
    const face = el.querySelector(".fui-BotAvatarFace") as HTMLElement;
    expect(face.style.getPropertyValue("--bot-avatar-gaze-x")).toBe("10%");
    expect(face.style.getPropertyValue("--bot-avatar-gaze-y")).toBe("-7%");
  });

  it("ignores non-finite gaze values", () => {
    render(() => <BotAvatar expression="neutral" gaze={{ x: Number.NaN, y: 0.5 }} />);
    const face = root().querySelector(".fui-BotAvatarFace") as HTMLElement;
    expect(face.style.getPropertyValue("--bot-avatar-gaze-x")).toBe("0%");
    expect(face.style.getPropertyValue("--bot-avatar-gaze-y")).toBe("3.5%");
  });

  it("followPointer tracks the pointer direction", async () => {
    render(() => <BotAvatar expression="neutral" followPointer />);
    const el = root();
    Object.defineProperty(el, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({ left: 0, top: 0, width: 40, height: 40 }) as unknown as DOMRect,
    });

    // 160px right of center at the minimum 160px range: full right gaze.
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 180, clientY: 20 }));
    await vi.waitFor(() => {
      expect(el.classList.contains("fui-gazing")).toBe(true);
    });
    const face = el.querySelector(".fui-BotAvatarFace") as HTMLElement;
    expect(face.style.getPropertyValue("--bot-avatar-gaze-x")).toBe("10%");

    // Leaving the document releases the gaze.
    document.documentElement.dispatchEvent(new Event("pointerleave"));
    await vi.waitFor(() => {
      expect(el.classList.contains("fui-gazing")).toBe(false);
    });
  });

  it("handle blink pulses the blinking class", async () => {
    const handle = createBotAvatarHandle();
    render(() => <BotAvatar expression="neutral" handle={handle} />);
    const el = root();
    expect(el.classList.contains("fui-blinking")).toBe(false);

    handle.blink();
    await vi.waitFor(() => {
      expect(el.classList.contains("fui-blinking")).toBe(true);
    });
    await vi.waitFor(
      () => {
        expect(el.classList.contains("fui-blinking")).toBe(false);
      },
      { timeout: 2000 },
    );
  });

  it("handle lookAt commands and releases the gaze", async () => {
    const handle = createBotAvatarHandle();
    render(() => <BotAvatar expression="neutral" handle={handle} />);
    const el = root();

    handle.lookAt({ x: -0.5, y: 0.5 });
    await vi.waitFor(() => {
      expect(el.classList.contains("fui-gazing")).toBe(true);
    });
    const face = el.querySelector(".fui-BotAvatarFace") as HTMLElement;
    expect(face.style.getPropertyValue("--bot-avatar-gaze-x")).toBe("-5%");

    handle.lookAt(null);
    await vi.waitFor(() => {
      expect(el.classList.contains("fui-gazing")).toBe(false);
    });
  });

  it("ignores handle calls with no avatar attached", () => {
    const handle = createBotAvatarHandle();
    expect(() => {
      handle.blink();
      handle.lookAt({ x: 1, y: 1 });
    }).not.toThrow();
  });

  it("desynchronizes idle animations per instance", () => {
    render(() => (
      <>
        <BotAvatar expression="neutral" />
        <BotAvatar expression="neutral" />
      </>
    ));
    const bodies = [...document.querySelectorAll(".fui-BotAvatarBody")] as HTMLElement[];
    expect(bodies).toHaveLength(2);
    const delays = bodies.map((body) => body.style.getPropertyValue("--bot-avatar-life-delay"));
    for (const delay of delays) {
      expect(delay.endsWith("ms")).toBe(true);
      expect(Number.parseInt(delay, 10)).toBeLessThanOrEqual(0);
    }
  });
});
