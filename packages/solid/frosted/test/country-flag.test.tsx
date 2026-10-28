import { describe, expect, it } from "vitest";
import { render } from "@solidjs/testing-library";
import { CountryFlag, ISO3166Alpha2Codes } from "../src/index";

describe("CountryFlag", () => {
  it("renders the CDN flag image for the lowercase code", () => {
    render(() => <CountryFlag countryCode="DE" />);
    const img = document.querySelector(".fui-CountryFlag") as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe(
      "https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3/de.svg",
    );
    expect(img.getAttribute("alt")).toBe("");
    expect(img.classList.contains("fui-CountryFlag")).toBe(true);
    expect(img.classList.contains("fui-r-size-2")).toBe(true);
  });

  it("applies size and alt", () => {
    render(() => <CountryFlag countryCode="JP" size="4" alt="Japan" />);
    const img = document.querySelector(".fui-CountryFlag") as HTMLImageElement;
    expect(img.getAttribute("alt")).toBe("Japan");
    expect(img.classList.contains("fui-r-size-4")).toBe(true);
    expect(img.getAttribute("src")).toContain("/jp.svg");
  });

  it("exports the ISO code list", () => {
    expect(ISO3166Alpha2Codes).toContain("US");
    expect(ISO3166Alpha2Codes.length).toBeGreaterThan(200);
  });
});
