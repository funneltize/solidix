import { Funnel } from "solidix";

const OFFER_ENDS_AT = Date.now() + 37 * 3600000 + 14 * 60000;

/* Eight-stage direct-response blueprint: hook, authority, agitation,
 * mechanism, value, validation, conversion, reassurance. */
const FunnelDemo = () => (
  <Funnel.Root variant="reference">
    <Funnel.Header
      brand="Weekend Funnel"
      cta={{ label: "Claim your seat", href: "#join" }}
      sticky
    />

    {/* 1. Hook: zero-escape header above, split hero with outcome plus timeframe. */}
    <Funnel.Section>
      <Funnel.Container>
        <Funnel.Hero
          id="hook"
          eyebrow="Cohort 12 opens Monday"
          title="Ship a landing page that pays for itself"
          subtitle="A two-day live workshop for founders: offer, copy, and a page you publish before Sunday dinner. No developers, no drag-and-drop maze."
          primaryCta={{ label: "Claim your seat", href: "#join" }}
          secondaryCta={{ label: "See the curriculum", href: "#how-it-works" }}
          media={{
            src: "https://picsum.photos/seed/funnel-hero/1200/900",
            alt: "Workshop curriculum spread",
          }}
        />
      </Funnel.Container>
    </Funnel.Section>

    {/* 2. Authority: trust bar inside three seconds. */}
    <Funnel.Section tone="subtle" compact>
      <Funnel.Container>
        <Funnel.LogoBar
          caption="Teams from these companies took the workshop"
          logos={[{ name: "Acme" }, { name: "Globex" }, { name: "Initech" }, { name: "Umbrella" }]}
        />
      </Funnel.Container>
    </Funnel.Section>

    {/* 3. Agitation: name the pain in reading measure. */}
    <Funnel.Section>
      <Funnel.Container size="reading">
        <Funnel.SectionHeading
          align="left"
          eyebrow="The problem"
          title="Your page is leaking buyers you already paid for"
        />
        <Funnel.Prose>
          <p>
            Every ad click lands on a page that <strong>reads like a brochure</strong>, asks for a
            demo, and hopes. Most visitors bounce in under fifteen seconds, and the ad platform
            happily charges you for each one.
          </p>
          <p>
            Agencies quote <mark>$15,000 and six weeks</mark> for a redesign that guesses at the
            message. Templates give you sections without the sales argument that fills them. So the
            page stays vague, and the vague page keeps losing to competitors with half your product.
          </p>
        </Funnel.Prose>
      </Funnel.Container>
    </Funnel.Section>

    {/* 4. Mechanism: the proprietary reveal on the inverse chapter. */}
    <Funnel.Section tone="inverse">
      <Funnel.Container>
        <Funnel.SectionHeading
          eyebrow="The mechanism"
          title="One weekend, one page, one repeatable system"
          description="Past attempts failed because copy, design, and proof were built by three people who never met. Here they ship together."
        />
        <Funnel.HowItWorks
          id="how-it-works"
          steps={[
            {
              title: "Saturday: offer and story",
              description: "Morning teardown of your funnel, afternoon on positioning and proof.",
            },
            {
              title: "Sunday: build and publish",
              description: "Guided build session. Your page goes live before the closing call.",
            },
            {
              title: "After: thirty days of reviews",
              description: "Weekly teardown calls while your first visitors arrive.",
            },
          ]}
        />
      </Funnel.Container>
    </Funnel.Section>

    {/* 5. Value: zig-zag rows pairing visuals with outcome headlines. */}
    <Funnel.Section>
      <Funnel.Container>
        <Funnel.SectionHeading
          eyebrow="What you leave with"
          title="Everything a page needs to sell"
        />
        <Funnel.Benefits
          items={[
            {
              title: "An offer people can repeat",
              description:
                "One sentence that survives the retelling test, positioned against the status quo you replace.",
              media: {
                src: "https://picsum.photos/seed/funnel-offer/1200/800",
                alt: "Offer worksheet",
              },
            },
            {
              title: "Copy without the blank page",
              description:
                "Worksheets that turn sales calls and reviews into headlines, bullets, and guarantees.",
              media: {
                src: "https://picsum.photos/seed/funnel-copy/1200/800",
                alt: "Copy worksheets",
              },
            },
            {
              title: "A page you can change",
              description:
                "No ticket queue. Edit copy and ship in minutes, not sprints, with proof that compounds.",
              media: {
                src: "https://picsum.photos/seed/funnel-page/1200/800",
                alt: "Published page",
              },
            },
          ]}
        />
      </Funnel.Container>
    </Funnel.Section>

    {/* 6. Validation: proof wall plus metric bar. */}
    <Funnel.Section tone="subtle">
      <Funnel.Container size="wide">
        <Funnel.SectionHeading eyebrow="Alumni results" title="Pages that paid for the weekend" />
        <Funnel.Testimonials
          items={[
            {
              quote: "We rewrote the hero on Saturday and doubled trial starts by Friday.",
              name: "Ada Lovelace",
              role: "Founder, Acme",
              rating: 5,
            },
            {
              quote: "The teardown alone was worth it. Every section earned its place.",
              name: "Grace Hopper",
              role: "CMO, Globex",
              rating: 5,
            },
            {
              quote: "First launch page I have owned end to end. No dev tickets.",
              name: "Alan Turing",
              role: "Indie hacker",
              rating: 4.5,
            },
          ]}
        />
        <Funnel.StatsBar
          stats={[
            { value: "12,400+", label: "Pages shipped by alumni" },
            { value: "3.1x", label: "Median conversion lift" },
            { value: "48 hrs", label: "Idea to published page" },
            { value: "4.9 / 5", label: "Average workshop rating" },
          ]}
        />
      </Funnel.Container>
    </Funnel.Section>

    {/* 7. Conversion: comparison, offer stack, honest deadline, capture. */}
    <Funnel.Section>
      <Funnel.Container size="wide">
        <Funnel.SectionHeading
          id="pricing"
          eyebrow="The offer"
          title="Join Cohort 12 before early pricing ends"
        />
        <Funnel.ComparisonTable
          caption="Weekend Funnel against the usual alternatives."
          columns={[{ label: "Weekend Funnel" }, { label: "Agency" }, { label: "Template" }]}
          rows={[
            { feature: "Live teardown of your page", values: [true, false, false] },
            { feature: "Time to published page", values: ["2 days", "6 weeks", "Whenever"] },
            { feature: "Copy system included", values: [true, false, false] },
            { feature: "Total cost", values: ["$399 once", "$15,000+", "$89 / mo"] },
          ]}
        />
        {/* One-time offer: a single period hides the billing toggle and the
            price lines carry the one-time cost. The period name never surfaces. */}
        <Funnel.Pricing
          periods={["monthly"]}
          defaultBilling="monthly"
          plans={[
            {
              name: "Workshop",
              monthly: "$199 once",
              blurb: "The two-day live workshop.",
              cta: { label: "Join the cohort", href: "#join" },
              features: [
                "Live weekend sessions",
                "Worksheets and templates",
                "30 days of teardown calls",
              ],
            },
            {
              name: "Workshop Plus",
              monthly: "$399 once",
              blurb: "Workshop plus a private review.",
              cta: { label: "Join with review", href: "#join" },
              features: [
                "Everything in Workshop",
                "60-minute private teardown",
                "Copy review before launch",
              ],
              highlighted: true,
              badge: "Most popular",
            },
          ]}
        />
      </Funnel.Container>
      <Funnel.Container size="reading">
        <Funnel.Countdown endsAt={OFFER_ENDS_AT} caption="Early pricing ends in" />
        <Funnel.OptInForm
          id="join"
          fields={[
            {
              name: "email",
              label: "Email",
              type: "email",
              autoComplete: "email",
              placeholder: "you@company.com",
            },
            { name: "name", label: "Name", required: false, autoComplete: "name" },
          ]}
          submitLabel="Reserve my seat"
          privacyNote="One email with your seat details. No spam, unsubscribe anytime."
          successTitle="Seat reserved."
          successMessage="Check your inbox for the onboarding worksheet."
        />
      </Funnel.Container>
    </Funnel.Section>

    {/* 8. Reassurance: risk reversal plus objection handling, then the last CTA. */}
    <Funnel.Section tone="subtle">
      <Funnel.Container size="reading">
        <Funnel.Guarantee
          title="Publish or pay nothing"
          description="Attend the full weekend, ship your page, and if it does not beat your current baseline within 30 days, email us for a full refund."
        />
        <Funnel.Faq
          items={[
            {
              id: "time",
              question: "How much time does it take?",
              answer:
                "Two half-days live, plus about three hours of worksheets. Everything happens on one weekend.",
            },
            {
              id: "technical",
              question: "Do I need to code?",
              answer: "No. If you can edit a document, you can run the whole system.",
            },
            {
              id: "traffic",
              question: "Does it cover getting traffic?",
              answer:
                "Positioning and offer first, then one paid and one organic channel to test with.",
            },
            {
              id: "refund",
              question: "How does the guarantee work?",
              answer:
                "Ship your page within 30 days. If it does not beat your baseline, one email refunds you.",
            },
          ]}
        />
        <Funnel.CtaCluster
          href="#join"
          microcopy="Free worksheet on signup. No credit card required."
        >
          Claim your seat
        </Funnel.CtaCluster>
      </Funnel.Container>
    </Funnel.Section>

    <Funnel.Section compact>
      <Funnel.Container>
        <Funnel.Footer
          variant="utility"
          brand="Weekend Funnel"
          tagline="A fictional workshop for the Solidix funnel demo."
          columns={[
            {
              heading: "Workshop",
              links: [
                { label: "Curriculum", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
              ],
            },
            {
              heading: "Company",
              links: [
                { label: "Contact", href: "mailto:hello@example.com", kind: "support" },
                { label: "Guarantee", href: "#join" },
              ],
            },
          ]}
          badges={[
            { label: "SSL Secure Checkout", icon: "lock" },
            { label: "30-Day Money-Back Guarantee", icon: "shield" },
            { label: "Secure Card Payment", icon: "card" },
          ]}
          legalLinks={[
            { label: "Privacy Policy", href: "#privacy" },
            { label: "Terms of Service", href: "#terms" },
            { label: "Refund Policy", href: "#refund" },
          ]}
          legal="Demo content. Results vary; no income claims are made or implied."
        />
      </Funnel.Container>
    </Funnel.Section>

    <Funnel.StickyBar
      message="Cohort 12 closes when the timer hits zero."
      cta={{ label: "Claim seat", href: "#join" }}
      observe="#hook .fx-hero-ctas"
    />
    <Funnel.ExitIntent
      title="Wait, take 20% off"
      description="Finish checkout in the next 24 hours and the alumni community is included free."
    >
      <Funnel.CTAButton href="#join" fullWidth>
        Claim the discount
      </Funnel.CTAButton>
    </Funnel.ExitIntent>
  </Funnel.Root>
);

export default FunnelDemo;
