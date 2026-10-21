import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  Benefits,
  ComparisonTable,
  Container,
  Countdown,
  CTAButton,
  CtaCluster,
  ExitIntent,
  Eyebrow,
  Faq,
  Footer,
  Guarantee,
  Header,
  Hero,
  HowItWorks,
  LogoBar,
  OptInForm,
  Pricing,
  Prose,
  Root,
  Section,
  SectionHeading,
  StarRating,
  StatsBar,
  StickyBar,
  TestimonialCarousel,
  Testimonials,
  VideoFrame,
} from "../src/index";

function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[funnel] workspace root not found");
    dir = parent;
  }
}

/** Parts matching a name, optionally at an index. Unindexed queries exclude indexed nodes. */
function parts(root: ParentNode, name: string, index?: string): HTMLElement[] {
  const selector =
    index === undefined
      ? `[data-funnel-part="${name}"]:not([data-funnel-part-index])`
      : `[data-funnel-part="${name}"][data-funnel-part-index="${index}"]`;
  return Array.from(root.querySelectorAll(selector));
}

describe("editing contract", () => {
  test("Root marks itself editable only when the flag is set", () => {
    const { container, unmount } = render(() => (
      <Root editable>
        <p>hi</p>
      </Root>
    ));
    expect(
      container.querySelector("[data-funnel-root]")?.getAttribute("data-funnel-editable"),
    ).toBe("");
    unmount();

    const plain = render(() => (
      <Root>
        <p>hi</p>
      </Root>
    ));
    expect(
      plain.container.querySelector("[data-funnel-root]")?.hasAttribute("data-funnel-editable"),
    ).toBe(false);
  });

  test("non-editable output carries zero edit markers", () => {
    const { container } = render(() => (
      <Root>
        <Hero
          title="Lose the back pain"
          primaryCta={{ label: "Get relief", href: "#buy" }}
          secondaryCta={{ label: "Learn more", href: "#learn" }}
        />
        <Faq
          items={[
            { id: "a", question: "Q?", answer: "A." },
            { id: "b", question: "Q2?", answer: "A2." },
          ]}
        />
        <CTAButton href="#" part="plan-cta" partIndex={0}>
          Explicit override, still off
        </CTAButton>
      </Root>
    ));
    expect(
      container.querySelectorAll(
        "[data-funnel-part], [data-funnel-part-index], [data-funnel-editable]",
      ).length,
    ).toBe(0);
  });

  test("CTAButton marks its label and honors part overrides", () => {
    const { unmount } = render(() => (
      <Root editable>
        <CTAButton href="#">Go</CTAButton>
      </Root>
    ));
    const button = screen.getByRole("link", { name: "Go" });
    expect(button.getAttribute("data-funnel-part")).toBe("label");
    expect(button.hasAttribute("data-funnel-part-index")).toBe(false);
    // Natively focusable controls take no tabindex.
    expect(button.hasAttribute("tabindex")).toBe(false);
    unmount();

    render(() => (
      <Root editable>
        <CTAButton href="#" part="plan-cta" partIndex={2}>
          Go
        </CTAButton>
      </Root>
    ));
    expect(screen.getByRole("link", { name: "Go" }).getAttribute("data-funnel-part")).toBe(
      "plan-cta",
    );
    expect(screen.getByRole("link", { name: "Go" }).getAttribute("data-funnel-part-index")).toBe(
      "2",
    );
  });

  test("CtaCluster marks microcopy and keeps the inner button label", () => {
    render(() => (
      <Root editable>
        <CtaCluster href="#" microcopy="Free shipping">
          Buy now
        </CtaCluster>
      </Root>
    ));
    const microcopy = screen.getByText("Free shipping");
    expect(microcopy.getAttribute("data-funnel-part")).toBe("microcopy");
    expect(microcopy.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("link", { name: "Buy now" }).getAttribute("data-funnel-part")).toBe(
      "label",
    );
  });

  test("Section and Container stay unmarked layout passthrough", () => {
    const { container } = render(() => (
      <Root editable>
        <Section>
          <Container>
            <p>hi</p>
          </Container>
        </Section>
      </Root>
    ));
    expect(container.querySelectorAll("[data-funnel-part]").length).toBe(0);
  });

  test("Eyebrow and Prose mark their roots as text", () => {
    render(() => (
      <Root editable>
        <Eyebrow>Overline</Eyebrow>
        <Prose>
          <p>Rich body</p>
        </Prose>
      </Root>
    ));
    for (const text of ["Overline", "Rich body"]) {
      const node = screen.getByText(text).closest("[data-funnel-part]") as HTMLElement;
      expect(node.getAttribute("data-funnel-part")).toBe("text");
      expect(node.getAttribute("tabindex")).toBe("0");
    }
  });

  test("SectionHeading marks eyebrow, title, and description", () => {
    render(() => (
      <Root editable>
        <SectionHeading eyebrow="Step 1" title="Big idea" description="Why it matters" />
      </Root>
    ));
    expect(screen.getByText("Step 1").getAttribute("data-funnel-part")).toBe("eyebrow");
    expect(screen.getByText("Big idea").getAttribute("data-funnel-part")).toBe("title");
    expect(screen.getByText("Why it matters").getAttribute("data-funnel-part")).toBe("description");
    expect(screen.getByText("Big idea").getAttribute("tabindex")).toBe("0");
  });

  test("Header marks brand and names its CTA", () => {
    const { unmount } = render(() => (
      <Root editable>
        <Header brand="Acme" cta={{ label: "Start", href: "#start" }} />
      </Root>
    ));
    expect(screen.getByText("Acme").getAttribute("data-funnel-part")).toBe("brand");
    expect(screen.getByRole("link", { name: "Start" }).getAttribute("data-funnel-part")).toBe(
      "cta",
    );
    unmount();

    render(() => (
      <Root editable>
        <Header
          brand={{ src: "/logo.svg", name: "Acme" }}
          cta={{ label: "Start", href: "#start" }}
        />
      </Root>
    ));
    expect(screen.getByAltText("Acme").getAttribute("data-funnel-part")).toBe("brand");
  });

  test("Hero marks copy, both CTAs distinctly, and media", () => {
    render(() => (
      <Root editable>
        <Hero
          eyebrow="New"
          title="Lose the back pain"
          subtitle="In 10 minutes a day"
          primaryCta={{ label: "Get relief", href: "#buy" }}
          secondaryCta={{ label: "Learn more", href: "#learn" }}
          media={{ src: "/hero.jpg", alt: "Device" }}
        />
      </Root>
    ));
    expect(screen.getByText("New").getAttribute("data-funnel-part")).toBe("eyebrow");
    expect(screen.getByText("Lose the back pain").getAttribute("data-funnel-part")).toBe("title");
    expect(screen.getByText("In 10 minutes a day").getAttribute("data-funnel-part")).toBe(
      "subtitle",
    );
    expect(screen.getByRole("link", { name: "Get relief" }).getAttribute("data-funnel-part")).toBe(
      "primary-cta",
    );
    expect(screen.getByRole("link", { name: "Learn more" }).getAttribute("data-funnel-part")).toBe(
      "secondary-cta",
    );
    expect(screen.getByAltText("Device").getAttribute("data-funnel-part")).toBe("media");
  });

  test("OptInForm marks labels, inputs, submit, privacy, and success copy", async () => {
    render(() => (
      <Root editable>
        <OptInForm
          fields={[{ name: "email", label: "Email", type: "email" }]}
          submitLabel="Get access"
          privacyNote="No spam."
          onSubmit={() => {}}
        />
      </Root>
    ));
    expect(screen.getByText("Email").getAttribute("data-funnel-part")).toBe("label");
    expect(screen.getByText("Email").getAttribute("data-funnel-part-index")).toBe("0");
    const input = document.querySelector('[data-funnel-part="input"]') as HTMLElement;
    expect(input.getAttribute("data-funnel-part-index")).toBe("0");
    expect(input.hasAttribute("tabindex")).toBe(false);
    expect(
      screen.getByRole("button", { name: "Get access" }).getAttribute("data-funnel-part"),
    ).toBe("submit");
    expect(screen.getByText("No spam.").getAttribute("data-funnel-part")).toBe("privacy");

    fireEvent.input(screen.getByLabelText(/Email/), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Get access" }));
    expect((await screen.findByText("You're in.")).getAttribute("data-funnel-part")).toBe(
      "success-title",
    );
  });

  test("Countdown marks its caption", () => {
    render(() => (
      <Root editable>
        <Countdown endsAt={Date.now() + 60000} caption="Offer ends soon" />
      </Root>
    ));
    expect(screen.getByText("Offer ends soon").getAttribute("data-funnel-part")).toBe("caption");
  });

  test("StickyBar marks message and names its CTA", () => {
    render(() => (
      <Root editable>
        <StickyBar message="Sale ends tonight" cta={{ label: "Shop", href: "#shop" }} />
      </Root>
    ));
    expect(screen.getByText("Sale ends tonight").getAttribute("data-funnel-part")).toBe("message");
    // Hidden until scrolled into view, so resolve by text rather than role.
    const cta = screen.getByText("Shop").closest("a") as HTMLElement;
    expect(cta.getAttribute("data-funnel-part")).toBe("cta");
  });

  test("ExitIntent marks dialog title and description", async () => {
    render(() => (
      <Root editable>
        <ExitIntent title="Wait - 20% off" description="Finish checkout today.">
          <p>Popup body</p>
        </ExitIntent>
      </Root>
    ));
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, relatedTarget: null }));
    expect(await screen.findByText("Popup body")).toBeTruthy();
    expect(screen.getByText("Wait - 20% off").getAttribute("data-funnel-part")).toBe("title");
    expect(screen.getByText("Finish checkout today.").getAttribute("data-funnel-part")).toBe(
      "description",
    );
  });

  test("Footer marks identity, columns, badges, and legal", () => {
    render(() => (
      <Root editable>
        <Footer
          brand="Acme"
          tagline="Built for closers"
          identity={{
            name: "Acme GmbH",
            address: ["Musterstr. 1"],
            email: "hi@acme.example",
          }}
          columns={[{ heading: "Shop", links: [{ label: "All", href: "#all" }] }]}
          badges={["SSL"]}
          legal="2026 Acme"
        />
      </Root>
    ));
    expect(screen.getByText("Acme").getAttribute("data-funnel-part")).toBe("brand");
    expect(screen.getByText("Built for closers").getAttribute("data-funnel-part")).toBe("tagline");
    expect(screen.getByText("Acme GmbH").getAttribute("data-funnel-part")).toBe("identity-name");
    const address = screen.getByText("Musterstr. 1");
    expect(address.getAttribute("data-funnel-part")).toBe("identity-address");
    expect(address.getAttribute("data-funnel-part-index")).toBe("0");
    expect(screen.getByText("hi@acme.example").getAttribute("data-funnel-part")).toBe(
      "identity-email",
    );
    const heading = screen.getByText("Shop");
    expect(heading.getAttribute("data-funnel-part")).toBe("column-heading");
    expect(heading.getAttribute("data-funnel-part-index")).toBe("0");
    const link = screen.getByRole("link", { name: "All" });
    expect(link.getAttribute("data-funnel-part")).toBe("column-link");
    expect(link.getAttribute("data-funnel-part-index")).toBe("0-0");
    expect(screen.getByText("SSL").closest("li")?.getAttribute("data-funnel-part")).toBe("badge");
    expect(screen.getByText("2026 Acme").getAttribute("data-funnel-part")).toBe("legal");
  });

  test("VideoFrame marks thumbnail, play link, and caption", () => {
    render(() => (
      <Root editable>
        <VideoFrame
          thumbnail={{ src: "/t.jpg", alt: "Demo" }}
          href="https://video.example"
          caption="Watch how it works"
        />
      </Root>
    ));
    expect(screen.getByAltText("Demo").getAttribute("data-funnel-part")).toBe("thumbnail");
    expect(screen.getByRole("link", { name: "Play video" }).getAttribute("data-funnel-part")).toBe(
      "play",
    );
    expect(screen.getByText("Watch how it works").getAttribute("data-funnel-part")).toBe("caption");
  });

  test("Benefits and HowItWorks mark indexed titles, descriptions, and media", () => {
    const { container, unmount } = render(() => (
      <Root editable>
        <Benefits
          items={[
            {
              title: "Launch in a day",
              description: "Copy, paste, publish.",
              media: { src: "/m.jpg", alt: "Shot" },
            },
            { title: "No developers needed" },
          ]}
        />
      </Root>
    ));
    expect(parts(container, "title", "0").length).toBe(1);
    expect(parts(container, "title", "1").length).toBe(1);
    expect(parts(container, "description", "0").length).toBe(1);
    expect(parts(container, "description", "1").length).toBe(0);
    expect(parts(container, "media", "0").length).toBe(1);
    unmount();

    render(() => (
      <Root editable>
        <HowItWorks steps={[{ title: "Step one", description: "Do it." }]} />
      </Root>
    ));
    expect(screen.getByText("Step one").getAttribute("data-funnel-part-index")).toBe("0");
    expect(screen.getByText("Do it.").getAttribute("data-funnel-part")).toBe("description");
  });

  test("Benefits cards variant marks titles and descriptions, never media", () => {
    const { container } = render(() => (
      <Root editable>
        <Benefits
          variant="cards"
          items={[
            {
              title: "An offer people can repeat",
              description: "One sentence that survives retelling.",
              media: { src: "/m.jpg", alt: "Shot" },
            },
          ]}
        />
      </Root>
    ));
    expect(parts(container, "title", "0").length).toBe(1);
    expect(parts(container, "description", "0").length).toBe(1);
    expect(parts(container, "media", "0").length).toBe(0);
    expect(container.querySelector("img")).toBe(null);
  });

  test("Pricing marks plans, composite feature indices, and plan CTAs", () => {
    render(() => (
      <Root editable>
        <Pricing
          plans={[
            {
              name: "Starter",
              monthly: "$19/mo",
              annual: "$15/mo",
              badge: "Most popular",
              blurb: "For trying out",
              features: ["One seat", "Email support"],
              cta: { label: "Start", href: "#start" },
            },
          ]}
          annualNote="Billed yearly."
        />
      </Root>
    ));
    expect(screen.getByText("Most popular").getAttribute("data-funnel-part-index")).toBe("0");
    expect(screen.getByText("Starter").getAttribute("data-funnel-part")).toBe("name");
    expect(screen.getByText("$15/mo").getAttribute("data-funnel-part")).toBe("price");
    expect(screen.getByText("For trying out").getAttribute("data-funnel-part")).toBe("blurb");
    const feature = screen.getByText("Email support");
    expect(feature.getAttribute("data-funnel-part")).toBe("feature");
    expect(feature.getAttribute("data-funnel-part-index")).toBe("0-1");
    const cta = screen.getByRole("link", { name: "Start" });
    expect(cta.getAttribute("data-funnel-part")).toBe("plan-cta");
    expect(cta.getAttribute("data-funnel-part-index")).toBe("0");
    expect(screen.getByText("Billed yearly.").getAttribute("data-funnel-part")).toBe("annual-note");
  });

  test("Guarantee marks title and description", () => {
    render(() => (
      <Root editable>
        <Guarantee title="60-day promise" description="Full refund." />
      </Root>
    ));
    expect(screen.getByText("60-day promise").getAttribute("data-funnel-part")).toBe("title");
    expect(screen.getByText("Full refund.").getAttribute("data-funnel-part")).toBe("description");
  });

  test("Faq marks indexed questions and answers", async () => {
    render(() => (
      <Root editable>
        <Faq
          items={[
            { id: "setup", question: "How fast?", answer: "One afternoon." },
            { id: "cancel", question: "Can I cancel?", answer: "Anytime." },
          ]}
        />
      </Root>
    ));
    const trigger = screen.getByText("Can I cancel?").closest("button") as HTMLElement;
    expect(trigger.getAttribute("data-funnel-part")).toBe("question");
    expect(trigger.getAttribute("data-funnel-part-index")).toBe("1");

    fireEvent.click(trigger);
    const answer = await screen.findByText("Anytime.");
    expect(answer.getAttribute("data-funnel-part")).toBe("answer");
    expect(answer.getAttribute("data-funnel-part-index")).toBe("1");
  });

  test("ComparisonTable marks caption, columns, features, and composite cells", () => {
    render(() => (
      <Root editable>
        <ComparisonTable
          caption="Us vs them"
          columns={[{ label: "Us", featured: true }, { label: "Them" }]}
          rows={[{ feature: "Speed", values: [true, "Slow"] }]}
        />
      </Root>
    ));
    expect(screen.getByText("Us vs them").getAttribute("data-funnel-part")).toBe("caption");
    expect(screen.getByText("Them").getAttribute("data-funnel-part-index")).toBe("1");
    expect(screen.getByText("Speed").getAttribute("data-funnel-part")).toBe("feature");
    const cell = screen.getByText("Slow").closest("td") as HTMLElement;
    expect(cell.getAttribute("data-funnel-part")).toBe("cell");
    expect(cell.getAttribute("data-funnel-part-index")).toBe("0-1");
  });

  test("StarRating marks its root as the value", () => {
    render(() => (
      <Root editable>
        <StarRating value={4.5} />
      </Root>
    ));
    const rating = screen.getByRole("img", { name: "4.5 out of 5 stars" });
    expect(rating.getAttribute("data-funnel-part")).toBe("value");
    expect(rating.getAttribute("tabindex")).toBe("0");
  });

  test("LogoBar marks caption and indexed logos", () => {
    render(() => (
      <Root editable>
        <LogoBar
          caption="As featured in"
          logos={[
            { name: "Acme", src: "/acme.svg", href: "https://acme.example" },
            { name: "Globex" },
          ]}
        />
      </Root>
    ));
    expect(screen.getByText("As featured in").getAttribute("data-funnel-part")).toBe("caption");
    const linked = screen.getByAltText("Acme").closest("a") as HTMLElement;
    expect(linked.getAttribute("data-funnel-part")).toBe("logo");
    expect(linked.getAttribute("data-funnel-part-index")).toBe("0");
    const wordmark = screen.getByText("Globex");
    expect(wordmark.getAttribute("data-funnel-part")).toBe("logo");
    expect(wordmark.getAttribute("data-funnel-part-index")).toBe("1");
  });

  test("Testimonials marks indexed quotes, names, and roles", () => {
    render(() => (
      <Root editable>
        <Testimonials
          items={[
            { quote: "Converted twice as well.", name: "Ada Lovelace", role: "CMO", rating: 5 },
            { quote: "Simple and fast.", name: "Grace Hopper" },
          ]}
        />
      </Root>
    ));
    const quote = screen.getByText("Converted twice as well.");
    expect(quote.getAttribute("data-funnel-part")).toBe("quote");
    expect(quote.getAttribute("data-funnel-part-index")).toBe("0");
    expect(screen.getByText("CMO").getAttribute("data-funnel-part")).toBe("role");
    expect(screen.getByText("Grace Hopper").getAttribute("data-funnel-part-index")).toBe("1");
    // Nested rating resolves through its own block.
    expect(
      screen.getByRole("img", { name: "5 out of 5 stars" }).getAttribute("data-funnel-part"),
    ).toBe("value");
  });

  test("Carousel parts track the visible slide index", async () => {
    render(() => (
      <Root editable>
        <TestimonialCarousel
          items={[
            { quote: "First", name: "Ada" },
            { quote: "Second", name: "Grace" },
          ]}
        />
      </Root>
    ));
    expect(screen.getByText("First").getAttribute("data-funnel-part-index")).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Next testimonial" }));
    expect((await screen.findByText("Second")).getAttribute("data-funnel-part-index")).toBe("1");
  });

  test("StatsBar marks indexed labels and values", () => {
    render(() => (
      <Root editable>
        <StatsBar stats={[{ value: "12k", label: "Customers" }]} />
      </Root>
    ));
    const label = screen.getByText("Customers");
    expect(label.getAttribute("data-funnel-part")).toBe("label");
    expect(label.getAttribute("data-funnel-part-index")).toBe("0");
    expect(screen.getByText("12k").getAttribute("data-funnel-part")).toBe("value");
  });

  test("blocks.css scopes edit affordances under the editable root", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "funnel", "src", "blocks.css"),
      "utf8",
    );
    expect(css).toContain("[data-funnel-editable] [data-funnel-part]");
    expect(css).toContain("[data-funnel-editable] button[data-funnel-part]");
    expect(css).toContain("[data-funnel-editable] [data-funnel-part]:hover");
  });
});
