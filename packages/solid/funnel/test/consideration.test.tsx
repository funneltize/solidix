import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Benefits, ComparisonTable, Faq, Guarantee, HowItWorks, Pricing } from "../src/index";

describe("Benefits", () => {
  test("renders titles with descriptions", () => {
    render(() => (
      <Benefits
        items={[
          { title: "Launch in a day", description: "Copy, paste, publish." },
          { title: "No developers needed" },
        ]}
      />
    ));
    expect(screen.getByText("Launch in a day")).toBeTruthy();
    expect(screen.getByText("Copy, paste, publish.")).toBeTruthy();
    expect(screen.getByText("No developers needed")).toBeTruthy();
  });

  test("media items become lazy zig-zag rows", () => {
    render(() => (
      <Benefits items={[{ title: "See it live", media: { src: "/ui.png", alt: "Product UI" } }]} />
    ));
    const art = screen.getByAltText("Product UI");
    expect(art.getAttribute("loading")).toBe("lazy");
    expect(art.closest("li")?.hasAttribute("data-media")).toBe(true);
  });

  test("default list renders no data-variant", () => {
    const { container } = render(() => <Benefits items={[{ title: "Launch in a day" }]} />);
    const root = container.querySelector('[data-funnel-block="benefits"]');
    expect(root?.hasAttribute("data-variant")).toBe(false);
  });

  test('cards variant sets data-variant and ignores media', () => {
    const { container } = render(() => (
      <Benefits
        variant="cards"
        items={[
          {
            title: "An offer people can repeat",
            description: "One sentence that survives retelling.",
            icon: (
              <svg viewBox="0 0 24 24" aria-hidden="true" data-testid="pillar-icon">
                <circle cx="12" cy="12" r="9" />
              </svg>
            ),
            media: { src: "/ui.png", alt: "Product UI" },
          },
        ]}
      />
    ));
    const root = container.querySelector('[data-funnel-block="benefits"]');
    expect(root?.getAttribute("data-variant")).toBe("cards");
    expect(screen.getByText("An offer people can repeat")).toBeTruthy();
    expect(screen.getByTestId("pillar-icon")).toBeTruthy();
    expect(screen.queryByAltText("Product UI")).toBe(null);
    expect(container.querySelector("li")?.hasAttribute("data-media")).toBe(false);
  });
});

describe("ComparisonTable", () => {
  const columns = [{ label: "Acme" }, { label: "Old way" }];
  const rows = [
    { feature: "Setup time", values: ["5 minutes", "3 weeks"] },
    { feature: "Free trial", values: [true, false] },
  ];

  test("features our column and voices booleans for screen readers", () => {
    render(() => <ComparisonTable columns={columns} rows={rows} caption="Why switch." />);
    expect(screen.getByText("Why switch.").tagName).toBe("CAPTION");
    const head = screen.getByText("Acme");
    expect(head.tagName).toBe("TH");
    expect(head.getAttribute("scope")).toBe("col");
    expect(head.hasAttribute("data-featured")).toBe(true);
    expect(screen.getByText("Old way").hasAttribute("data-featured")).toBe(false);
    expect(screen.getByText("Setup time").getAttribute("scope")).toBe("row");
    expect(screen.getByText("5 minutes")).toBeTruthy();
    expect(screen.getAllByText("Included").length).toBe(1);
    expect(screen.getAllByText("Not included").length).toBe(1);
  });

  test("honors an explicit featured column", () => {
    render(() => (
      <ComparisonTable
        columns={[{ label: "Legacy" }, { label: "Acme", featured: true }]}
        rows={rows}
      />
    ));
    expect(screen.getByText("Acme").hasAttribute("data-featured")).toBe(true);
    expect(screen.getByText("Legacy").hasAttribute("data-featured")).toBe(false);
  });
});

describe("HowItWorks", () => {
  test("renders steps as an ordered list", () => {
    render(() => (
      <HowItWorks
        steps={[
          { title: "Pick a template", description: "Start from a proven layout." },
          { title: "Connect checkout" },
        ]}
      />
    ));
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(screen.getByText("Pick a template")).toBeTruthy();
    expect(screen.getByText("Connect checkout")).toBeTruthy();
  });
});

describe("Pricing", () => {
  const plans = [
    {
      name: "Starter",
      monthly: "$19/mo",
      annual: "$15/mo",
      cta: { label: "Start free", href: "/start" },
      features: ["3 funnels", "Email support"],
    },
    {
      name: "Growth",
      monthly: "$49/mo",
      annual: "$39/mo",
      cta: { label: "Scale up", href: "/scale" },
      features: ["Unlimited funnels"],
      highlighted: true,
      badge: "Most popular",
    },
  ];

  test("defaults to annual billing and toggles prices", async () => {
    render(() => <Pricing plans={plans} annualNote="Billed yearly." />);
    expect(screen.getByText("$15/mo")).toBeTruthy();
    expect(screen.getByText("Billed yearly.")).toBeTruthy();
    expect(screen.getByText("Most popular")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(await screen.findByText("$19/mo")).toBeTruthy();
    expect(screen.queryByText("Billed yearly.")).toBe(null);
  });

  test("supports controlled billing", () => {
    const onBillingChange = vi.fn();
    render(() => <Pricing plans={plans} billing="monthly" onBillingChange={onBillingChange} />);
    expect(screen.getByText("$19/mo")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Annual" }));
    expect(onBillingChange).toHaveBeenCalledWith("annual");
    // Controlled: stays monthly until the parent updates the prop.
    expect(screen.getByText("$19/mo")).toBeTruthy();
  });

  test("single period hides the toggle for one-time offers", () => {
    render(() => (
      <Pricing
        plans={[
          {
            name: "Workshop",
            monthly: "$199 once",
            cta: { label: "Join", href: "/join" },
            features: ["Live sessions"],
          },
        ]}
        periods={["monthly"]}
        defaultBilling="monthly"
      />
    ));
    expect(screen.queryByRole("radio")).toBe(null);
    expect(screen.getByText("$199 once")).toBeTruthy();
  });

  test("highlighted plan uses the primary CTA", () => {
    render(() => <Pricing plans={plans} />);
    const primary = screen.getByRole("link", { name: "Scale up" });
    expect(primary.getAttribute("data-variant")).toBe("primary");
    expect(screen.getByRole("link", { name: "Start free" }).getAttribute("data-variant")).toBe(
      "secondary",
    );
  });
});

describe("Guarantee", () => {
  test("renders shield seal, title, and description", () => {
    render(() => <Guarantee title="Love it or refund" description="No questions." />);
    const seal = document.querySelector(".fx-guarantee-seal");
    expect(seal?.getAttribute("aria-hidden")).toBe("true");
    expect(seal?.querySelector("svg")).not.toBe(null);
    expect(screen.getByText("Love it or refund")).toBeTruthy();
    expect(screen.getByText("No questions.")).toBeTruthy();
  });
});

describe("Faq", () => {
  const items = [
    { id: "setup", question: "How fast is setup?", answer: "One afternoon." },
    { id: "cancel", question: "Can I cancel?", answer: "Anytime." },
  ];

  test("expands and collapses answers", async () => {
    render(() => <Faq items={items} />);
    expect(screen.queryByText("One afternoon.")).toBe(null);

    fireEvent.click(screen.getByText("How fast is setup?"));
    expect(await screen.findByText("One afternoon.")).toBeTruthy();

    fireEvent.click(screen.getByText("How fast is setup?"));
    await vi.waitFor(() => expect(screen.queryByText("One afternoon.")).toBe(null));
  });

  test("opens the item matching the location hash", async () => {
    window.location.hash = "#faq-cancel";
    try {
      render(() => <Faq items={items} />);
      expect(await screen.findByText("Anytime.")).toBeTruthy();
      expect(document.getElementById("faq-cancel")).not.toBe(null);
    } finally {
      window.location.hash = "";
    }
  });
});
