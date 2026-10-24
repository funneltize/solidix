import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { CTAButton, CtaCluster, lightTokens, Root } from "../src/index";

// Anchor on the workspace root so this works no matter which directory
// vitest is invoked from.
function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[funnel] workspace root not found");
    dir = parent;
  }
}

describe("Root", () => {
  test("renders children and sets the dark theme attribute only when dark", () => {
    const { unmount } = render(() => (
      <Root data-testid="root" theme="dark" class="custom">
        hello
      </Root>
    ));
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-funnel-theme")).toBe("dark");
    expect(root.classList.contains("fx-root")).toBe(true);
    expect(root.classList.contains("custom")).toBe(true);
    expect(root.textContent).toBe("hello");
    unmount();

    const second = render(() => <Root data-testid="root">hello</Root>);
    expect(screen.getByTestId("root").hasAttribute("data-funnel-theme")).toBe(false);
    second.unmount();

    render(() => (
      <Root data-testid="root" cta="emerald">
        hello
      </Root>
    ));
    expect(screen.getByTestId("root").getAttribute("data-cta")).toBe("emerald");
  });
});

describe("CTAButton", () => {
  test("renders a button by default and an anchor with href", () => {
    const { unmount } = render(() => <CTAButton>Buy now</CTAButton>);
    const button = screen.getByRole("button", { name: "Buy now" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("data-variant")).toBe("primary");
    expect(button.getAttribute("data-size")).toBe("lg");
    expect(button.getAttribute("data-funnel-block")).toBe("cta-button");
    unmount();

    render(() => (
      <CTAButton href="/checkout" variant="secondary" size="md">
        Buy now
      </CTAButton>
    ));
    const link = screen.getByRole("link", { name: "Buy now" });
    expect(link.getAttribute("href")).toBe("/checkout");
    expect(link.getAttribute("data-variant")).toBe("secondary");
    expect(link.getAttribute("data-size")).toBe("md");
  });

  test("dispatches funnel:cta with label, href, and variant on click", () => {
    const onCta = vi.fn();
    document.addEventListener("funnel:cta", onCta);
    try {
      render(() => (
        <Root variant="b">
          <CTAButton href="/checkout">Buy now</CTAButton>
        </Root>
      ));
      fireEvent.click(screen.getByRole("link", { name: "Buy now" }));
      expect(onCta).toHaveBeenCalledTimes(1);
      const event = onCta.mock.calls[0]![0] as CustomEvent;
      expect(event.detail).toMatchObject({
        block: "cta-button",
        variant: "b",
        label: "Buy now",
        href: "/checkout",
      });
    } finally {
      document.removeEventListener("funnel:cta", onCta);
    }
  });

  test("calls the consumer onClick after dispatching", () => {
    const onClick = vi.fn();
    render(() => <CTAButton onClick={onClick}>Buy now</CTAButton>);
    fireEvent.click(screen.getByRole("button", { name: "Buy now" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("disabled and loading block activation and signal state", () => {
    const onCta = vi.fn();
    document.addEventListener("funnel:cta", onCta);
    try {
      const { unmount } = render(() => <CTAButton disabled>Buy now</CTAButton>);
      const disabled = screen.getByRole("button", { name: "Buy now" });
      expect((disabled as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(disabled);
      expect(onCta).not.toHaveBeenCalled();
      unmount();

      render(() => <CTAButton loading>Buy now</CTAButton>);
      const loading = screen.getByRole("button");
      expect(loading.getAttribute("data-loading")).toBe("");
      expect(loading.getAttribute("aria-busy")).toBe("true");
      expect(loading.querySelector(".fx-cta-button-spinner")).not.toBe(null);
      fireEvent.click(loading);
      expect(onCta).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("funnel:cta", onCta);
    }
  });

  test("merges consumer class and sets full width", () => {
    render(() => (
      <CTAButton class="custom" fullWidth>
        Buy now
      </CTAButton>
    ));
    const button = screen.getByRole("button", { name: "Buy now" });
    expect(button.classList.contains("fx-cta-button")).toBe(true);
    expect(button.classList.contains("custom")).toBe(true);
    expect(button.hasAttribute("data-full-width")).toBe(true);
  });

  test("pill sets the pill shape attribute", () => {
    render(() => (
      <CTAButton href="#join" pill>
        Buy now
      </CTAButton>
    ));
    expect(screen.getByRole("link", { name: "Buy now" }).hasAttribute("data-pill")).toBe(true);
  });

  test("glow is opt-in via the glow attribute", () => {
    const { unmount } = render(() => <CTAButton glow>Buy now</CTAButton>);
    expect(screen.getByRole("button", { name: "Buy now" }).getAttribute("data-glow")).toBe("");
    unmount();

    render(() => <CTAButton>Buy now</CTAButton>);
    expect(screen.getByRole("button", { name: "Buy now" }).hasAttribute("data-glow")).toBe(false);
  });
});

describe("CtaCluster", () => {
  test("stacks the action button over friction-killer microcopy", () => {
    render(() => (
      <CtaCluster href="#join" microcopy="Free for 14 days, no card required.">
        Get my plan
      </CtaCluster>
    ));
    const cluster = screen.getByText("Free for 14 days, no card required.").closest("div");
    expect(cluster?.getAttribute("data-funnel-block")).toBe("cta-cluster");
    const action = screen.getByRole("link", { name: "Get my plan" });
    expect(action.getAttribute("href")).toBe("#join");
    expect(action.classList.contains("fx-cta-button")).toBe(true);
  });

  test("omits the microcopy line when none is given", () => {
    render(() => <CtaCluster href="#join">Get my plan</CtaCluster>);
    expect(screen.getByRole("link", { name: "Get my plan" })).toBeTruthy();
    expect(document.querySelector(".fx-cta-cluster-microcopy")).toBe(null);
  });

  test("forwards glow to the action button", () => {
    render(() => (
      <CtaCluster href="#join" glow>
        Get my plan
      </CtaCluster>
    ));
    expect(screen.getByRole("link", { name: "Get my plan" }).getAttribute("data-glow")).toBe("");
  });
});

describe("primary tactile treatment", () => {
  const css = () =>
    readFileSync(workspaceFile("packages", "solid", "funnel", "src", "blocks.css"), "utf8");

  test("primary builds depth from the CTA token with flat fallbacks", () => {
    const primary = css().match(/\.fx-cta-button\[data-variant="primary"\] \{[^}]*\}/s)![0];
    expect(primary).toContain("linear-gradient");
    expect(primary).toContain("color-mix(in srgb, var(--solidix-funnel-cta)");
    expect(primary).toContain("inset 0 1px 0");
    expect(primary).toContain("inset 0 -2px 0");
    // Fallback first, color-mix derivation second.
    expect(primary.indexOf("box-shadow: var(--solidix-funnel-shadow-md);")).toBeLessThan(
      primary.indexOf("color-mix(in srgb, var(--solidix-funnel-cta) 55%"),
    );
  });

  test("hover lifts and press compresses; dark theme drops the emboss", () => {
    const text = css();
    const hover = text.match(/\.fx-cta-button\[data-variant="primary"\]:hover \{[^}]*\}/s)![0];
    expect(hover).toContain("transform: translateY(-1px);");
    const active = text.match(/\.fx-cta-button\[data-variant="primary"\]:active \{[^}]*\}/s)![0];
    expect(active).toContain("inset 0 2px 4px");
    expect(active).toContain("transform: translateY(1px);");
    expect(text).toContain('[data-funnel-theme="dark"] .fx-cta-button[data-variant="primary"]');
  });
});

describe("primary glow treatment", () => {
  const css = () =>
    readFileSync(workspaceFile("packages", "solid", "funnel", "src", "blocks.css"), "utf8");

  test("glow is a rotating border beam plus halo scoped to the primary variant", () => {
    const text = css();
    // The conic angle is a registered custom property, or it cannot animate.
    expect(text).toContain("@property --fx-cta-glow-angle");
    const host = text.match(
      /\.fx-cta-button\[data-variant="primary"\]\[data-glow\] \{[^}]*\}/s,
    )![0];
    expect(host).toContain("isolation: isolate;");
    // Crisp 2px ring on the border edge: tactile face clipped to padding-box
    // over a conic ring in the transparent border, same rotation timing.
    expect(host).toContain("animation: fx-cta-glow var(--solidix-funnel-duration-glow)");
    expect(host).toContain(") padding-box,");
    expect(host).toContain("conic-gradient");
    expect(host).toContain("white 18%");
    expect(host).toContain("border: 2px solid transparent;");
    // No ::after beam: a behind-face pseudo paints above the host background
    // and a bright one would wash the face.
    expect(text).not.toContain('[data-glow]::after');
    const halo = text.match(
      /\.fx-cta-button\[data-variant="primary"\]\[data-glow\]::before \{[^}]*\}/s,
    )![0];
    expect(halo).toContain("animation: fx-cta-glow var(--solidix-funnel-duration-glow)");
    // Uneven ring: a uniform halo would make the rotation invisible.
    expect(halo).toContain("conic-gradient");
    expect(halo).toContain("color-mix(in srgb, var(--solidix-funnel-cta)");
    // Noticeable at a glance: spread past the edge plus an opaque comet peak.
    expect(halo).toContain("inset: -6px;");
    expect(halo).toContain("var(--solidix-funnel-cta) 20%");
    expect(text).toContain("@keyframes fx-cta-glow");
  });

  test("glow timing comes from a motion token", () => {
    expect(lightTokens["--solidix-funnel-duration-glow"]).toMatch(/^\d+ms$/);
  });
});
