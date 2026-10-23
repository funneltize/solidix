import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  Countdown,
  ExitIntent,
  Footer,
  Hero,
  OptInForm,
  StickyBar,
  VideoFrame,
} from "../src/index";

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

describe("Hero", () => {
  test("renders copy, CTAs, and reserved media", () => {
    render(() => (
      <Hero
        eyebrow="Cohort 12 opens Monday"
        title="Ship your funnel this weekend"
        subtitle="A design system for pages that sell."
        primaryCta={{ label: "Start free", href: "/start" }}
        secondaryCta={{ label: "Watch demo", href: "/demo" }}
        media={{ src: "/hero.png", alt: "Dashboard screenshot" }}
      />
    ));
    expect(screen.getByText("Cohort 12 opens Monday")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ship your funnel this weekend" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start free" }).getAttribute("href")).toBe("/start");
    expect(screen.getByRole("link", { name: "Watch demo" }).getAttribute("data-variant")).toBe(
      "secondary",
    );
    // Hook for the mobile single-action rule (hidden below sm in blocks.css).
    expect(
      screen.getByRole("link", { name: "Watch demo" }).classList.contains("fx-hero-secondary"),
    ).toBe(true);
    expect(screen.getByAltText("Dashboard screenshot")).toBeTruthy();
  });

  test("passes responsive attributes through to the hero image", () => {
    render(() => (
      <Hero
        title="Ship your funnel this weekend"
        primaryCta={{ label: "Start free", href: "/start" }}
        media={{
          src: "/hero-1200.webp",
          alt: "Dashboard screenshot",
          srcSet: "/hero-480.webp 480w, /hero-1200.webp 1200w",
          sizes: "(max-width: 640px) 100vw, 1200px",
        }}
      />
    ));
    const img = screen.getByAltText("Dashboard screenshot");
    expect(img.getAttribute("srcset")).toBe("/hero-480.webp 480w, /hero-1200.webp 1200w");
    expect(img.getAttribute("sizes")).toBe("(max-width: 640px) 100vw, 1200px");
  });

  test("omits responsive attributes when the media shape carries none", () => {
    render(() => (
      <Hero
        title="Ship your funnel this weekend"
        primaryCta={{ label: "Start free", href: "/start" }}
        media={{ src: "/hero.png", alt: "Dashboard screenshot" }}
      />
    ));
    const img = screen.getByAltText("Dashboard screenshot");
    expect(img.hasAttribute("srcset")).toBe(false);
    expect(img.hasAttribute("sizes")).toBe(false);
  });

  test("dispatches funnel:view when observed", async () => {
    const onView = vi.fn();
    document.addEventListener("funnel:view", onView);
    try {
      render(() => <Hero title="Hi" primaryCta={{ label: "Go", href: "/go" }} />);
      // jsdom has no IntersectionObserver, so the block reports immediately.
      await vi.waitFor(() => expect(onView).toHaveBeenCalledTimes(1));
      const event = onView.mock.calls[0]![0] as CustomEvent;
      expect(event.detail).toMatchObject({ block: "hero" });
    } finally {
      document.removeEventListener("funnel:view", onView);
    }
  });
});

describe("OptInForm", () => {
  const fields = [
    { name: "email", label: "Email", type: "email" as const, autoComplete: "email" },
    { name: "name", label: "Name", required: false },
  ];

  test("submits values, shows success, and dispatches without PII", async () => {
    const onSubmit = vi.fn();
    const onFunnelSubmit = vi.fn();
    document.addEventListener("funnel:submit", onFunnelSubmit);
    try {
      render(() => (
        <OptInForm
          fields={fields}
          submitLabel="Get access"
          privacyNote="No spam, unsubscribe anytime."
          successMessage="Check your inbox."
          onSubmit={onSubmit}
        />
      ));
      expect(screen.getByText("(optional)")).toBeTruthy();
      expect(screen.getByText("No spam, unsubscribe anytime.")).toBeTruthy();

      fireEvent.input(screen.getByLabelText(/Email/), { target: { value: "ada@example.com" } });
      fireEvent.input(screen.getByLabelText(/Name/), { target: { value: "Ada" } });
      fireEvent.click(screen.getByRole("button", { name: "Get access" }));

      expect(await screen.findByText("You're in.")).toBeTruthy();
      expect(screen.getByText("Check your inbox.")).toBeTruthy();
      expect(onSubmit).toHaveBeenCalledWith({ email: "ada@example.com", name: "Ada" });
      expect(onFunnelSubmit).toHaveBeenCalledTimes(1);
      const event = onFunnelSubmit.mock.calls[0]![0] as CustomEvent;
      expect(event.detail).toMatchObject({ block: "opt-in-form", fields: ["email", "name"] });
      expect(JSON.stringify(event.detail)).not.toContain("ada@example.com");
    } finally {
      document.removeEventListener("funnel:submit", onFunnelSubmit);
    }
  });

  test("blocks invalid submit", () => {
    const onSubmit = vi.fn();
    render(() => <OptInForm fields={fields} submitLabel="Get access" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Get access" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText("You're in.")).toBe(null);
  });
});

describe("Countdown", () => {
  test("renders remaining parts and expires once", () => {
    vi.useFakeTimers();
    const now = Date.now();
    const onExpire = vi.fn();
    render(() => (
      <Countdown
        endsAt={now + 90061000}
        now={() => now}
        caption="Offer ends in"
        onExpire={onExpire}
      />
    ));
    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("01");
    expect(screen.getByText("Offer ends in")).toBeTruthy();

    // Advance past the deadline with a controllable clock.
    let current = now;
    const { unmount } = render(() => (
      <Countdown endsAt={now + 2000} now={() => current} onExpire={onExpire} />
    ));
    current = now + 5000;
    vi.advanceTimersByTime(1000);
    expect(onExpire).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5000);
    expect(onExpire).toHaveBeenCalledTimes(1);
    unmount();
  });

  test("ticks by the minute while the deadline is days out", () => {
    vi.useFakeTimers();
    const now = Date.now();
    let current = now;
    render(() => <Countdown endsAt={now + 90061000} now={() => current} />);
    const timer = screen.getByRole("timer");
    // 1 day, 1 hour, 1 minute, 1 second: no zero unit yet.
    expect(timer.textContent).not.toContain("00");

    // An hour passes but a lone second ticking by must not refresh the parts.
    current = now + 3600000;
    vi.advanceTimersByTime(1000);
    flush();
    expect(timer.textContent).not.toContain("00");

    // The minute tick picks up the new hour.
    vi.advanceTimersByTime(59000);
    flush();
    expect(timer.textContent).toContain("00");
  });

  test("an explicit interval overrides the adaptive tick", () => {
    vi.useFakeTimers();
    const now = Date.now();
    let current = now;
    render(() => <Countdown endsAt={now + 90061000} now={() => current} interval={1000} />);
    const timer = screen.getByRole("timer");
    current = now + 3600000;
    vi.advanceTimersByTime(1000);
    flush();
    expect(timer.textContent).toContain("00");
  });

  test("pauses while offscreen and refreshes on return", () => {
    vi.useFakeTimers();
    let callback: IntersectionObserverCallback | null = null;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
    try {
      const now = Date.now();
      let current = now;
      render(() => <Countdown endsAt={now + 3600000} now={() => current} />);
      const timer = screen.getByRole("timer");
      expect(timer.getAttribute("aria-label")).toContain("1 hours");

      callback!([{ isIntersecting: false }] as never, null as never);
      current = now + 60000;
      vi.advanceTimersByTime(5000);
      flush();
      expect(timer.getAttribute("aria-label")).toContain("1 hours");

      callback!([{ isIntersecting: true }] as never, null as never);
      flush();
      expect(timer.getAttribute("aria-label")).toContain("59 minutes");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test("leads with a decorative clock chip before the units", () => {
    const now = Date.now();
    render(() => <Countdown endsAt={now + 90061000} now={() => now} />);
    const timer = screen.getByRole("timer");
    const first = timer.firstElementChild;
    expect(first?.classList.contains("fx-countdown-icon")).toBe(true);
    expect(first?.getAttribute("aria-hidden")).toBe("true");
    expect(first?.querySelector("svg")).not.toBe(null);
    expect(timer.getAttribute("aria-label")).toContain("Time remaining:");
  });
});

describe("VideoFrame", () => {
  test("defaults to a lazy low-priority thumbnail with a linked play button", () => {
    render(() => (
      <VideoFrame
        thumbnail={{ src: "/vsl.png", alt: "Sales presentation" }}
        href="https://video.example/watch"
        caption="Watch: the 12-minute breakdown."
      />
    ));
    const thumbnail = screen.getByAltText("Sales presentation");
    expect(thumbnail.getAttribute("loading")).toBe("lazy");
    expect(thumbnail.getAttribute("fetchpriority")).toBe("low");
    const play = screen.getByRole("link", { name: "Play video" });
    expect(play.getAttribute("href")).toBe("https://video.example/watch");
    expect(screen.getByText("Watch: the 12-minute breakdown.").tagName).toBe("FIGCAPTION");
  });

  test("passes responsive sources through to the thumbnail", () => {
    render(() => (
      <VideoFrame
        thumbnail={{
          src: "/vsl-1200.webp",
          alt: "Sales presentation",
          srcSet: "/vsl-480.webp 480w, /vsl-1200.webp 1200w",
          sizes: "(max-width: 640px) 100vw, 680px",
        }}
      />
    ));
    const thumbnail = screen.getByAltText("Sales presentation");
    expect(thumbnail.getAttribute("srcset")).toBe("/vsl-480.webp 480w, /vsl-1200.webp 1200w");
    expect(thumbnail.getAttribute("sizes")).toBe("(max-width: 640px) 100vw, 680px");
  });

  test("stays eager with the eager opt-in for above-fold use", () => {
    render(() => <VideoFrame thumbnail={{ src: "/vsl.png", alt: "Sales presentation" }} eager />);
    const thumbnail = screen.getByAltText("Sales presentation");
    expect(thumbnail.getAttribute("loading")).toBe("eager");
    expect(thumbnail.getAttribute("fetchpriority")).toBe("high");
  });

  test("upgrades priority when the thumbnail nears the viewport", async () => {
    let callback: IntersectionObserverCallback | null = null;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
    try {
      render(() => <VideoFrame thumbnail={{ src: "/vsl.png", alt: "Sales presentation" }} />);
      const thumbnail = screen.getByAltText("Sales presentation");
      expect(thumbnail.getAttribute("loading")).toBe("lazy");
      callback!([{ isIntersecting: true }] as never, null as never);
      await vi.waitFor(() => expect(thumbnail.getAttribute("loading")).toBe("eager"));
      expect(thumbnail.getAttribute("fetchpriority")).toBe("high");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test("omits the play button without a link target", () => {
    render(() => <VideoFrame thumbnail={{ src: "/vsl.png", alt: "Sales presentation" }} />);
    expect(screen.queryByRole("link", { name: "Play video" })).toBe(null);
  });
});

describe("StickyBar", () => {
  test("appears past the scroll threshold", async () => {
    render(() => (
      <StickyBar
        message="Cohort 12 closes Friday."
        cta={{ label: "Claim seat", href: "/checkout" }}
        showAfter={600}
      />
    ));
    const bar = screen.getByText("Cohort 12 closes Friday.").closest("[data-funnel-block]")!;
    expect(bar.hasAttribute("data-visible")).toBe(false);
    expect(bar.getAttribute("aria-hidden")).toBe("true");

    Object.defineProperty(window, "scrollY", { value: 800, configurable: true });
    fireEvent.scroll(window);
    // The fallback coalesces scroll bursts into one frame, never sync.
    expect(bar.hasAttribute("data-visible")).toBe(false);
    await vi.waitFor(() => expect(bar.hasAttribute("data-visible")).toBe(true));
    expect(bar.hasAttribute("aria-hidden")).toBe(false);
    expect(screen.getByRole("link", { name: "Claim seat" }).getAttribute("href")).toBe("/checkout");
  });

  test("follows a controlled visible signal and ignores scroll", async () => {
    const [visible, setVisible] = createSignal(false);
    render(() => (
      <StickyBar
        message="Cohort 12 closes Friday."
        cta={{ label: "Claim seat", href: "/checkout" }}
        visible={visible()}
      />
    ));
    const bar = screen.getByText("Cohort 12 closes Friday.").closest("[data-funnel-block]")!;
    expect(bar.hasAttribute("data-visible")).toBe(false);
    expect(bar.getAttribute("aria-hidden")).toBe("true");

    // Deep scroll must not override the external signal.
    Object.defineProperty(window, "scrollY", { value: 2000, configurable: true });
    fireEvent.scroll(window);
    await Promise.resolve();
    flush();
    expect(bar.hasAttribute("data-visible")).toBe(false);

    setVisible(true);
    flush();
    expect(bar.hasAttribute("data-visible")).toBe(true);
    expect(bar.hasAttribute("aria-hidden")).toBe(false);

    setVisible(false);
    flush();
    expect(bar.hasAttribute("data-visible")).toBe(false);
    expect(bar.getAttribute("aria-hidden")).toBe("true");
  });

  test("reveals once the observed trigger scrolls out of view", async () => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    let callback: IntersectionObserverCallback | null = null;
    const observe = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe = observe;
        disconnect() {}
        unobserve() {}
      },
    );
    try {
      render(() => (
        <>
          <a id="hero-cta" href="/start">
            Start
          </a>
          <StickyBar
            message="Cohort 12 closes Friday."
            cta={{ label: "Claim seat", href: "/checkout" }}
            observe="#hero-cta"
          />
        </>
      ));
      const bar = screen.getByText("Cohort 12 closes Friday.").closest("[data-funnel-block]")!;
      expect(observe).toHaveBeenCalledTimes(1);
      // Trigger still in view: bar stays hidden.
      callback!(
        [{ isIntersecting: true, boundingClientRect: { top: 100 } }] as never,
        null as never,
      );
      expect(bar.hasAttribute("data-visible")).toBe(false);
      // Scrolled past: bar reveals.
      callback!(
        [{ isIntersecting: false, boundingClientRect: { top: -50 } }] as never,
        null as never,
      );
      await vi.waitFor(() => expect(bar.hasAttribute("data-visible")).toBe(true));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("ExitIntent", () => {
  test("opens on exit gesture and caps frequency", async () => {
    render(() => (
      <ExitIntent title="Wait - 20% off" description="Finish checkout today.">
        <p>Popup body</p>
      </ExitIntent>
    ));
    expect(screen.queryByText("Popup body")).toBe(null);

    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, relatedTarget: null }));
    expect(await screen.findByText("Popup body")).toBeTruthy();
    expect(screen.getByText("Wait - 20% off")).toBeTruthy();
    expect(window.localStorage.getItem("solidix-funnel-exit-intent")).not.toBe(null);
  });

  test("stays closed when recently shown or disabled", () => {
    window.localStorage.setItem("solidix-funnel-exit-intent", String(Date.now()));
    const { unmount } = render(() => (
      <ExitIntent title="Capped">
        <p>Capped body</p>
      </ExitIntent>
    ));
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, relatedTarget: null }));
    expect(screen.queryByText("Capped body")).toBe(null);
    unmount();

    window.localStorage.clear();
    render(() => (
      <ExitIntent title="Disabled" disabled>
        <p>Disabled body</p>
      </ExitIntent>
    ));
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, relatedTarget: null }));
    expect(screen.queryByText("Disabled body")).toBe(null);
  });
});

describe("Footer", () => {
  test("renders brand, columns, and legal line", () => {
    render(() => (
      <Footer
        brand="Acme"
        tagline="Funnels that convert."
        columns={[{ heading: "Product", links: [{ label: "Pricing", href: "/pricing" }] }]}
        legal="Results vary. This is a demo footer."
      />
    ));
    expect(screen.getByText("Acme")).toBeTruthy();
    expect(screen.getByText("Funnels that convert.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pricing" }).getAttribute("href")).toBe("/pricing");
    expect(screen.getByText("Results vary. This is a demo footer.")).toBeTruthy();
  });

  test("funnel links stay in-page while legal links open safely", () => {
    render(() => (
      <Footer
        brand="Acme"
        columns={[
          {
            heading: "Product",
            links: [
              { label: "Pricing", href: "#pricing" },
              { label: "Privacy", href: "https://acme.example/privacy", kind: "legal" },
            ],
          },
        ]}
        legalLinks={[{ label: "Terms", href: "https://acme.example/terms" }]}
      />
    ));
    const funnel = screen.getByRole("link", { name: "Pricing" });
    expect(funnel.hasAttribute("target")).toBe(false);
    const legal = screen.getByRole("link", { name: "Privacy" });
    expect(legal.getAttribute("target")).toBe("_blank");
    expect(legal.getAttribute("rel")).toBe("noopener noreferrer");
    const forced = screen.getByRole("link", { name: "Terms" });
    expect(forced.getAttribute("target")).toBe("_blank");
    expect(forced.getAttribute("rel")).toBe("noopener noreferrer");
  });

  test("support links pair contact hrefs with chat handlers", () => {
    const onChat = vi.fn();
    render(() => (
      <Footer
        brand="Acme"
        columns={[
          {
            heading: "Support",
            links: [
              { label: "Email us", href: "mailto:help@acme.example", kind: "support" },
              { label: "Live chat", href: "#chat", kind: "support", onClick: onChat },
            ],
          },
        ]}
      />
    ));
    expect(screen.getByRole("link", { name: "Email us" }).getAttribute("href")).toBe(
      "mailto:help@acme.example",
    );
    fireEvent.click(screen.getByRole("link", { name: "Live chat" }));
    expect(onChat).toHaveBeenCalledTimes(1);
  });

  test("utility variant flattens columns into one row", () => {
    render(() => (
      <Footer
        variant="utility"
        brand="Acme"
        columns={[
          { heading: "Product", links: [{ label: "Pricing", href: "#pricing" }] },
          { heading: "Company", links: [{ label: "Contact", href: "#contact" }] },
        ]}
        badges={["SSL Secure"]}
      />
    ));
    expect(screen.queryByText("Product")).toBe(null);
    expect(screen.queryByText("Company")).toBe(null);
    const row = document.querySelector(".fx-footer-links-row");
    expect(row?.textContent).toContain("Pricing");
    expect(row?.textContent).toContain("Contact");
    expect(screen.getByText("SSL Secure").tagName).toBe("LI");
  });

  test("trust variant renders the verified-business identity", () => {
    render(() => (
      <Footer
        variant="trust"
        identity={{
          name: "Acme Inc.",
          address: ["1 Funnel Way", "Austin, TX 78701"],
          email: "help@acme.example",
          phone: "+1 (555) 010-2030",
          phoneHref: "tel:+15550102030",
          registration: "EIN 12-3456789",
          hours: "Support Mon-Fri, 9am-5pm ET",
        }}
        columns={[{ heading: "Product", links: [{ label: "Pricing", href: "#pricing" }] }]}
      />
    ));
    expect(screen.getByText("Acme Inc.")).toBeTruthy();
    expect(screen.getByText("Austin, TX 78701")).toBeTruthy();
    expect(screen.getByRole("link", { name: "help@acme.example" }).getAttribute("href")).toBe(
      "mailto:help@acme.example",
    );
    expect(screen.getByRole("link", { name: "+1 (555) 010-2030" }).getAttribute("href")).toBe(
      "tel:+15550102030",
    );
    expect(screen.getByText("Support Mon-Fri, 9am-5pm ET")).toBeTruthy();
  });

  test("badges support built-in glyphs and custom icons", () => {
    render(() => (
      <Footer
        brand="Acme"
        badges={[
          "Plain text",
          { label: "SSL Secure", icon: "lock" },
          { label: "Visa", icon: <i data-testid="brand-mark" /> },
        ]}
      />
    ));
    const plain = screen.getByText("Plain text");
    expect(plain.tagName).toBe("LI");
    expect(plain.querySelector("svg")).toBe(null);
    const glyph = screen.getByText("SSL Secure");
    expect(glyph.querySelector("svg")).not.toBe(null);
    expect(screen.getByTestId("brand-mark")).toBeTruthy();
  });
});
