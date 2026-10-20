import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import App from "../src/App";

function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

describe("docs navigation", () => {
  test("swaps the preview demo when the route changes", async () => {
    window.scrollTo = () => {};
    window.location.hash = "#/accordion";
    render(() => <App />);
    expect(await screen.findByText("Is it accessible?")).not.toBe(null);

    goTo("#/dialog");
    expect(await screen.findByText("Edit profile")).not.toBe(null);
    expect(screen.queryByText("Is it accessible?")).toBe(null);

    goTo("#/accordion");
    expect(await screen.findByText("Is it accessible?")).not.toBe(null);
    expect(screen.queryByText("Edit profile")).toBe(null);
  });

  test("renders guide pages and links between guides", async () => {
    window.scrollTo = () => {};
    window.location.hash = "#/guides/composition";
    render(() => <App />);
    expect(await screen.findByRole("heading", { name: "Merge semantics" })).not.toBe(null);

    goTo("#/guides/testing");
    expect(await screen.findByRole("heading", { name: "The flush rule" })).not.toBe(null);
    expect(screen.queryByRole("heading", { name: "Merge semantics" })).toBe(null);

    goTo("#/dialog");
    expect(await screen.findByText("Edit profile")).not.toBe(null);
  });

  test("renders guide tables, code samples, and in-app links", async () => {
    window.scrollTo = () => {};
    window.location.hash = "#/guides/state";
    render(() => <App />);
    expect(await screen.findByRole("columnheader", { name: "Mode" })).not.toBe(null);
    expect(document.querySelector(".codeblock")).not.toBe(null);

    goTo("#/guides/composition");
    const styling = await screen.findAllByRole("link", { name: "Styling" });
    expect(styling.length).toBeGreaterThan(0);
    for (const link of styling) {
      expect(link.getAttribute("href")).toBe("#/guides/styling");
    }
  });
});
