import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Avatar, AvatarFallback, AvatarImage } from "../src/index";

const FALLBACK_TEXT = "AB";
const IMAGE_ALT_TEXT = "Fake Avatar";
const DELAY = 300;
const cache = new Set<string>();

describe("given an Avatar with fallback and no image", () => {
  test("should render the fallback", async () => {
    render(() => (
      <Avatar data-testid="avatar-root">
        <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
      </Avatar>
    ));

    expect(await screen.findByText(FALLBACK_TEXT)).toBeTruthy();
  });
});

describe("given an Avatar with fallback and an image", () => {
  let rendered: { unmount(): void };
  let setSrc: (src: string | undefined) => void = () => {};
  const originalGlobalImage = window.Image;
  const Ui = (uiProps: { src?: string | undefined }): JSX.Element => (
    <Avatar data-testid="avatar-root">
      <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
      <AvatarImage src={uiProps.src} alt={IMAGE_ALT_TEXT} />
    </Avatar>
  );

  beforeAll(() => {
    (window.Image as any) = MockImage;
  });

  afterAll(() => {
    window.Image = originalGlobalImage;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    cache.clear();
    const [src, _setSrc] = createSignal<string | undefined>("/test.png");
    setSrc = _setSrc;
    rendered = render(() => <Ui src={src()} />);
  });

  test("should render the fallback initially", () => {
    expect(screen.queryByText(FALLBACK_TEXT)).toBeTruthy();
  });

  test("should not render the image initially", () => {
    expect(screen.queryByRole("img")).toBe(null);
  });

  test("should render the image after it has loaded", async () => {
    expect(await screen.findByRole("img")).toBeTruthy();
  });

  test("should have alt text on the image", async () => {
    expect(await screen.findByAltText(IMAGE_ALT_TEXT)).toBeTruthy();
  });

  test("does not leak event listeners", async () => {
    rendered.unmount();
    const addEventListenerSpy = vi.spyOn(window.Image.prototype, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window.Image.prototype, "removeEventListener");
    rendered = render(() => <Ui src="/test.png" />);
    await screen.findByText(FALLBACK_TEXT);
    rendered.unmount();
    expect(addEventListenerSpy.mock.calls.length).toEqual(removeEventListenerSpy.mock.calls.length);
    vi.restoreAllMocks();
  });

  test("can handle changing src", async () => {
    expect(await screen.findByRole("img")).toBeTruthy();
    setSrc("/test2.png");
    await vi.waitFor(() => expect(screen.queryByRole("img")).toBe(null));
    expect(await screen.findByRole("img")).toBeTruthy();
  });

  test("should render the image immediately after it is cached", async () => {
    expect(await screen.findByRole("img")).toBeTruthy();

    rendered.unmount();
    rendered = render(() => <Ui src="/test.png" />);
    // Resolves on the effect flush, well before a 300ms reload would finish.
    expect(await screen.findByRole("img", undefined, { timeout: 100 })).toBeTruthy();
  });

  test("should not render image with no src", () => {
    setSrc(undefined);
    expect(screen.queryByRole("img")).toBe(null);
    rendered.unmount();
    rendered = render(() => <Ui src={undefined} />);
    expect(screen.queryByRole("img")).toBe(null);
  });

  test("should not render image with empty string as src", () => {
    setSrc("");
    expect(screen.queryByRole("img")).toBe(null);
    rendered.unmount();
    rendered = render(() => <Ui src="" />);
    expect(screen.queryByRole("img")).toBe(null);
  });

  test("should render the fallback again after a loaded image unmounts", async () => {
    const [showImage, setShowImage] = createSignal(true);
    rendered.unmount();
    rendered = render(() => (
      <Avatar data-testid="avatar-root">
        <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
        {showImage() ? <AvatarImage src="/test.png" alt={IMAGE_ALT_TEXT} /> : null}
      </Avatar>
    ));

    expect(await screen.findByRole("img")).toBeTruthy();
    expect(screen.queryByText(FALLBACK_TEXT)).toBe(null);

    setShowImage(false);
    expect(await screen.findByText(FALLBACK_TEXT)).toBeTruthy();
    expect(screen.queryByRole("img")).toBe(null);
  });

  test("should show fallback if image has no data", () => {
    rendered.unmount();
    const spy = vi.spyOn(window.Image.prototype, "naturalWidth", "get");
    spy.mockReturnValue(0);
    rendered = render(() => <Ui src="/test.png" />);
    expect(screen.queryByText(FALLBACK_TEXT)).toBeTruthy();
    spy.mockRestore();
  });

  test("should show the fallback if a loaded image reports no natural size", async () => {
    rendered.unmount();
    const spy = vi.spyOn(window.Image.prototype, "naturalWidth", "get").mockReturnValue(0);
    const onLoadingStatusChange = vi.fn();
    rendered = render(() => (
      <Avatar data-testid="avatar-root">
        <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
        <AvatarImage
          src="/no-size.png"
          alt={IMAGE_ALT_TEXT}
          onLoadingStatusChange={onLoadingStatusChange}
        />
      </Avatar>
    ));

    // The image dispatches `load`, but because its natural size is 0 we treat it as an error.
    await vi.waitFor(() => expect(onLoadingStatusChange).toHaveBeenCalledWith("error"));
    expect(screen.queryByRole("img")).toBe(null);
    expect(screen.queryByText(FALLBACK_TEXT)).toBeTruthy();
    spy.mockRestore();
  });

  describe("onLoadingStatusChange", () => {
    const renderWithCallback = (src?: string) => {
      const onLoadingStatusChange = vi.fn();
      rendered.unmount();
      rendered = render(() => (
        <Avatar data-testid="avatar-root">
          <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
          <AvatarImage
            src={src}
            alt={IMAGE_ALT_TEXT}
            onLoadingStatusChange={onLoadingStatusChange}
          />
        </Avatar>
      ));
      return onLoadingStatusChange;
    };

    test('is called with "loaded" once the image loads', async () => {
      const onLoadingStatusChange = renderWithCallback("/test.png");
      await screen.findByRole("img");
      expect(onLoadingStatusChange).toHaveBeenCalledWith("loaded");
    });

    test('is called with "error" when there is no src', async () => {
      const onLoadingStatusChange = renderWithCallback();
      await vi.waitFor(() => expect(onLoadingStatusChange).toHaveBeenCalledWith("error"));
    });

    test('is not called with "idle" while the image is mounted', async () => {
      const onLoadingStatusChange = renderWithCallback("/test.png");
      await screen.findByRole("img");
      expect(onLoadingStatusChange).not.toHaveBeenCalledWith("idle");
    });
  });
});

describe("given an Avatar with fallback and delayed render", () => {
  beforeEach(() => {
    render(() => (
      <Avatar data-testid="avatar-root">
        <AvatarFallback delayMs={DELAY}>{FALLBACK_TEXT}</AvatarFallback>
      </Avatar>
    ));
  });

  test("should not render a fallback immediately", () => {
    expect(screen.queryByText(FALLBACK_TEXT)).toBe(null);
  });

  test("should render a fallback after the delay", async () => {
    expect(screen.queryByText(FALLBACK_TEXT)).toBe(null);
    expect(await screen.findByText(FALLBACK_TEXT)).toBeTruthy();
  });
});

describe("given an Avatar with an image that only works when referrerPolicy=no-referrer", () => {
  const originalGlobalImage = window.Image;
  const ui = (src?: string, referrerPolicy?: "no-referrer" | "origin"): JSX.Element => (
    <Avatar data-testid="avatar-root">
      <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
      <AvatarImage src={src} alt={IMAGE_ALT_TEXT} referrerpolicy={referrerPolicy} />
    </Avatar>
  );

  beforeAll(() => {
    (window.Image as any) = class MockNoReferrerImage extends MockImage {
      referrerPolicy: string | undefined;

      override onSrcChange() {
        setTimeout(() => {
          if (this.referrerPolicy === "no-referrer") {
            // Mirror real browsers: mark the image complete before `load` fires.
            cache.add(this.src);
            this.dispatchEvent(new Event("load"));
          } else {
            this.dispatchEvent(new Event("error"));
          }
        }, DELAY);
      }
    };
  });

  afterAll(() => {
    window.Image = originalGlobalImage;
    vi.restoreAllMocks();
  });

  describe("referrerPolicy=no-referrer", () => {
    beforeEach(() => {
      cache.clear();
      render(() => ui("/test.png", "no-referrer"));
    });

    test("should render the fallback initially", () => {
      expect(screen.queryByText(FALLBACK_TEXT)).toBeTruthy();
    });

    test("should not render the image initially", () => {
      expect(screen.queryByRole("img")).toBe(null);
    });

    test("should render the image after it has loaded", async () => {
      expect(await screen.findByRole("img")).toBeTruthy();
    });

    test("should have alt text on the image", async () => {
      expect(await screen.findByAltText(IMAGE_ALT_TEXT)).toBeTruthy();
    });
  });

  describe("referrerPolicy=origin", () => {
    beforeEach(() => {
      cache.clear();
      render(() => ui("/test.png", "origin"));
    });

    test("should render the fallback initially", () => {
      expect(screen.queryByText(FALLBACK_TEXT)).toBeTruthy();
    });

    test("should never render the image", async () => {
      try {
        await screen.findByRole("img", undefined, { timeout: DELAY + 100 });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe("TestingLibraryElementError");
        expect((error as Error).message).toContain('Unable to find role="img"');
      }
    });
  });
});

describe("given an Avatar with multiple images (development)", () => {
  test("warns that multiple images are not supported", async () => {
    const warnSpy = vi.spyOn(console, "warn");
    warnSpy.mockImplementation(() => {});

    try {
      render(() => (
        <Avatar data-testid="avatar-root">
          <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
          <AvatarImage src="/a.png" alt="a" />
          <AvatarImage src="/b.png" alt="b" />
        </Avatar>
      ));

      await vi.waitFor(() =>
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("multiple were detected")),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  test("does not warn for a single image", async () => {
    const warnSpy = vi.spyOn(console, "warn");
    warnSpy.mockImplementation(() => {});

    try {
      render(() => (
        <Avatar data-testid="avatar-root">
          <AvatarFallback>{FALLBACK_TEXT}</AvatarFallback>
          <AvatarImage src="/a.png" alt="a" />
        </Avatar>
      ));

      await screen.findByText(FALLBACK_TEXT);
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });
});

class MockImage extends EventTarget {
  _src = "";

  get src() {
    return this._src;
  }

  set src(src: string) {
    if (!src) {
      return;
    }
    this._src = src;
    this.onSrcChange();
  }

  get complete() {
    return !this.src || cache.has(this.src);
  }

  get naturalWidth() {
    return this.complete ? 300 : 0;
  }

  onSrcChange() {
    setTimeout(() => {
      // Mirror real browsers: the image is `complete` (and `naturalWidth` is
      // populated) before the `load` event fires.
      cache.add(this.src);
      this.dispatchEvent(new Event("load"));
    }, DELAY);
  }
}

describe("Avatar.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Avatar
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Avatar
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <AvatarFallback>AB</AvatarFallback>
        </article>
      </Avatar>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    expect(await screen.findByText("AB")).toBeTruthy();

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Avatar.Image", () => {
  // jsdom never loads images, so Avatar.Image would stay unmounted without a stand-in.
  class CachedImage extends EventTarget {
    src = "";
    crossOrigin: string | null = null;
    referrerPolicy = "";
    complete = true;
    naturalWidth = 300;
  }
  const originalImage = window.Image;
  beforeAll(() => {
    (window.Image as any) = CachedImage;
  });
  afterAll(() => {
    window.Image = originalImage;
  });

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLImageElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Avatar>
        <AvatarImage
          src="/avatar.png"
          alt="Avatar"
          ref={(node) => void (element = node)}
          data-testid="image"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Avatar>
    ));

    const image = (await screen.findByTestId("image")) as HTMLElement;
    expect(image.classList.contains("custom-class")).toBe(true);
    expect(image.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(image);

    fireEvent.click(image);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Avatar>
        <AvatarImage
          src="/avatar.png"
          asChild
          ref={(node) => void (element = node)}
          data-testid="image"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <img alt="Avatar" />
        </AvatarImage>
      </Avatar>
    ));

    const image = (await screen.findByTestId("image")) as HTMLElement;
    expect(image.tagName).toBe("IMG");
    expect(image.getAttribute("src")).toBe("/avatar.png");
    expect(image.classList.contains("custom-class")).toBe(true);
    expect(image.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(image);

    fireEvent.click(image);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Avatar.Fallback", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Avatar>
        <AvatarFallback
          ref={(node) => void (element = node)}
          data-testid="fallback"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          AB
        </AvatarFallback>
      </Avatar>
    ));

    const fallback = (await screen.findByTestId("fallback")) as HTMLElement;
    expect(fallback.classList.contains("custom-class")).toBe(true);
    expect(fallback.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(fallback);

    fireEvent.click(fallback);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Avatar>
        <AvatarFallback
          asChild
          ref={(node) => void (element = node)}
          data-testid="fallback"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>AB</article>
        </AvatarFallback>
      </Avatar>
    ));

    const fallback = (await screen.findByTestId("fallback")) as HTMLElement;
    expect(fallback.tagName).toBe("ARTICLE");
    expect(fallback.classList.contains("custom-class")).toBe(true);
    expect(fallback.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(fallback);

    fireEvent.click(fallback);
    expect(onClick).toHaveBeenCalled();
  });
});
