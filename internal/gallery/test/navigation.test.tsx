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
});
