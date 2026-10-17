import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Portal } from "../src/index";

describe("Portal", () => {
  test("renders content into document.body by default", async () => {
    render(() => (
      <div data-testid="inline">
        <Portal>
          <p>portaled</p>
        </Portal>
      </div>
    ));

    const paragraph = await screen.findByText("portaled");
    expect(paragraph.closest('[data-testid="inline"]')).toBeNull();
    expect(document.body.contains(paragraph)).toBe(true);
  });

  test("renders into a custom container", async () => {
    const container = document.createElement("section");
    document.body.appendChild(container);

    render(() => (
      <Portal container={container}>
        <p>custom</p>
      </Portal>
    ));

    const paragraph = await screen.findByText("custom");
    expect(container.contains(paragraph)).toBe(true);
    container.remove();
  });
});
