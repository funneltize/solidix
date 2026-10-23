import { createSignal, flush } from "solid-js";
import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Container, Eyebrow, Header, Prose, Section, SectionHeading } from "../src/index";

describe("layout atoms", () => {
  test("Section renders tone and merges class", () => {
    render(() => (
      <Section data-testid="section" tone="subtle" compact class="custom">
        content
      </Section>
    ));
    const section = screen.getByTestId("section");
    expect(section.tagName).toBe("SECTION");
    expect(section.getAttribute("data-tone")).toBe("subtle");
    expect(section.hasAttribute("data-compact")).toBe(true);
    expect(section.getAttribute("data-funnel-block")).toBe("section");
    expect(section.classList.contains("fx-section")).toBe(true);
    expect(section.classList.contains("custom")).toBe(true);
  });

  test("Container defaults to standard and supports wide and reading", () => {
    const { unmount } = render(() => <Container data-testid="box">content</Container>);
    expect(screen.getByTestId("box").getAttribute("data-size")).toBe("standard");
    unmount();

    render(() => (
      <Container data-testid="box" size="reading">
        content
      </Container>
    ));
    expect(screen.getByTestId("box").getAttribute("data-size")).toBe("reading");
  });

  test("Eyebrow renders a kicker paragraph", () => {
    render(() => <Eyebrow>New cohort opens Monday</Eyebrow>);
    const eyebrow = screen.getByText("New cohort opens Monday");
    expect(eyebrow.tagName).toBe("P");
    expect(eyebrow.getAttribute("data-funnel-block")).toBe("eyebrow");
  });

  test("SectionHeading stacks eyebrow, title, and lede", () => {
    render(() => (
      <SectionHeading eyebrow="The problem" title="Funnels leak" description="Why they leak." />
    ));
    expect(screen.getByText("The problem").tagName).toBe("P");
    const title = screen.getByText("Funnels leak");
    expect(title.tagName).toBe("H2");
    expect(title.classList.contains("fx-section-title")).toBe(true);
    expect(screen.getByText("Why they leak.").tagName).toBe("P");
  });

  test("Prose renders body copy container", () => {
    render(() => (
      <Prose data-testid="prose">
        <p>
          Read the <strong>bold</strong> words and the <mark>highlight</mark>.
        </p>
      </Prose>
    ));
    const prose = screen.getByTestId("prose");
    expect(prose.getAttribute("data-funnel-block")).toBe("prose");
    expect(prose.classList.contains("fx-prose")).toBe(true);
  });

  test("Header renders wordmark and a single CTA with no nav", () => {
    render(() => <Header brand="Acme" cta={{ label: "Start free", href: "#join" }} />);
    expect(screen.getByText("Acme").tagName).toBe("SPAN");
    const cta = screen.getByRole("link", { name: "Start free" });
    expect(cta.getAttribute("href")).toBe("#join");
    expect(screen.queryByRole("navigation")).toBe(null);
  });

  test("Header supports logo image and sticky positioning", () => {
    render(() => (
      <Header
        data-testid="header"
        brand={{ src: "/logo.svg", name: "Acme" }}
        cta={{ label: "Start free", href: "#join" }}
        sticky
      />
    ));
    const header = screen.getByTestId("header");
    expect(header.tagName).toBe("HEADER");
    expect(header.hasAttribute("data-sticky")).toBe(true);
    expect(screen.getByAltText("Acme").getAttribute("src")).toBe("/logo.svg");
  });

  test("Header logo loads eager with async decoding", () => {
    render(() => (
      <Header brand={{ src: "/logo.svg", name: "Acme" }} cta={{ label: "Start", href: "#join" }} />
    ));
    const logo = screen.getByAltText("Acme");
    expect(logo.getAttribute("loading")).toBe("eager");
    expect(logo.getAttribute("decoding")).toBe("async");
  });

  test("Header hides from AT and tab order when visible is false", () => {
    render(() => (
      <Header
        data-testid="header"
        brand="Acme"
        cta={{ label: "Start", href: "#join" }}
        visible={false}
      />
    ));
    const header = screen.getByTestId("header");
    expect(header.hasAttribute("data-hidden")).toBe(true);
    expect(header.getAttribute("aria-hidden")).toBe("true");
    // Role queries skip aria-hidden subtrees, so reach the CTA through the DOM.
    expect(header.querySelector("a")?.getAttribute("tabindex")).toBe("-1");
  });

  test("Header follows a shared reveal signal", () => {
    const [visible, setVisible] = createSignal(false);
    render(() => (
      <Header
        data-testid="header"
        brand="Acme"
        cta={{ label: "Start", href: "#join" }}
        visible={visible()}
      />
    ));
    const header = screen.getByTestId("header");
    expect(header.hasAttribute("data-hidden")).toBe(true);

    setVisible(true);
    flush();
    expect(header.hasAttribute("data-hidden")).toBe(false);
    expect(header.hasAttribute("aria-hidden")).toBe(false);
    expect(screen.getByRole("link", { name: "Start" }).hasAttribute("tabindex")).toBe(false);
  });
});
