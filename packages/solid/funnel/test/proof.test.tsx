import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { LogoBar, StarRating, StatsBar, TestimonialCarousel, Testimonials } from "../src/index";

describe("StarRating", () => {
  test("labels the value and clips the fill row proportionally", () => {
    render(() => <StarRating value={4.5} />);
    const rating = screen.getByRole("img", { name: "4.5 out of 5 stars" });
    expect(rating.getAttribute("data-funnel-block")).toBe("star-rating");
    const clip = rating.querySelector(".fx-star-rating-clip") as HTMLElement;
    expect(clip.style.width).toBe("90%");
    expect(rating.querySelectorAll("svg").length).toBe(10);
  });

  test("clamps out-of-range values", () => {
    const { unmount } = render(() => <StarRating value={9} max={5} />);
    expect(screen.getByRole("img", { name: "5 out of 5 stars" })).toBeTruthy();
    unmount();

    render(() => <StarRating value={-2} max={5} />);
    const clip = screen
      .getByRole("img", { name: "0 out of 5 stars" })
      .querySelector(".fx-star-rating-clip") as HTMLElement;
    expect(clip.style.width).toBe("0%");
  });
});

describe("LogoBar", () => {
  test("renders image and wordmark logos with caption", () => {
    render(() => (
      <LogoBar
        caption="As featured in"
        logos={[
          { name: "Acme", src: "/acme.svg", href: "https://acme.example" },
          { name: "Globex" },
        ]}
      />
    ));
    expect(screen.getByText("As featured in")).toBeTruthy();
    const img = screen.getByAltText("Acme") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/acme.svg");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.closest("a")?.getAttribute("href")).toBe("https://acme.example");
    expect(screen.getByText("Globex").getAttribute("aria-label")).toBe("Globex");
  });

  test("logo images decode async and carry dimensions plus responsive sources", () => {
    render(() => (
      <LogoBar
        logos={[
          {
            name: "Acme",
            src: "/acme-2x.png",
            srcSet: "/acme-1x.png 1x, /acme-2x.png 2x",
            sizes: "120px",
            width: 120,
            height: 28,
          },
        ]}
      />
    ));
    const img = screen.getByAltText("Acme");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("decoding")).toBe("async");
    expect(img.getAttribute("srcset")).toBe("/acme-1x.png 1x, /acme-2x.png 2x");
    expect(img.getAttribute("sizes")).toBe("120px");
    expect(img.getAttribute("width")).toBe("120");
    expect(img.getAttribute("height")).toBe("28");
  });
});

describe("Testimonials", () => {
  test("renders quotes with authors and ratings", () => {
    render(() => (
      <Testimonials
        items={[
          { quote: "Converted twice as well.", name: "Ada Lovelace", role: "CMO", rating: 5 },
          { quote: "Simple and fast.", name: "Grace Hopper" },
        ]}
      />
    ));
    expect(screen.getByText("Converted twice as well.")).toBeTruthy();
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("CMO")).toBeTruthy();
    expect(screen.getByRole("img", { name: "5 out of 5 stars" })).toBeTruthy();
    expect(screen.getByText("Simple and fast.")).toBeTruthy();
  });
});

describe("TestimonialCarousel", () => {
  const items = [
    { quote: "First quote.", name: "Ada" },
    { quote: "Second quote.", name: "Grace" },
  ];

  test("cycles through quotes with prev/next controls", async () => {
    render(() => <TestimonialCarousel items={items} />);
    expect(screen.getByText("First quote.")).toBeTruthy();
    expect(screen.getByText("1 / 2")).toBeTruthy();
    const firstCard = screen.getByText("First quote.").closest("figure");

    fireEvent.click(screen.getByRole("button", { name: "Next testimonial" }));
    expect(await screen.findByText("Second quote.")).toBeTruthy();
    expect(screen.getByText("2 / 2")).toBeTruthy();
    // Each slide remounts so the CSS entry animation replays.
    expect(screen.getByText("Second quote.").closest("figure")).not.toBe(firstCard);

    fireEvent.click(screen.getByRole("button", { name: "Next testimonial" }));
    expect(await screen.findByText("First quote.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Previous testimonial" }));
    expect(await screen.findByText("Second quote.")).toBeTruthy();
  });

  test("exposes carousel semantics with a live region", () => {
    render(() => <TestimonialCarousel items={items} label="Reviews" />);
    const carousel = screen.getByRole("generic", { name: "Reviews" });
    expect(carousel.getAttribute("aria-roledescription")).toBe("carousel");
    expect(carousel.querySelector("[aria-live='polite']")).not.toBe(null);
  });
});

describe("StatsBar", () => {
  test("renders value/label pairs as a description list", () => {
    render(() => (
      <StatsBar
        stats={[
          { value: "12,400+", label: "Funnels shipped" },
          { value: "3.1x", label: "Median conversion lift" },
        ]}
      />
    ));
    expect(screen.getByText("12,400+").tagName).toBe("DD");
    expect(screen.getByText("Funnels shipped").tagName).toBe("DT");
    expect(screen.getByText("3.1x")).toBeTruthy();
    expect(screen.getByText("Median conversion lift")).toBeTruthy();
  });
});
