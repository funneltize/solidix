import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Portal } from "../src/index";

describe("Portal", () => {
  it("renders the wrapper into document.body by default", async () => {
    const { container } = render(() => (
      <div>
        <Portal data-testid="portaled">Content</Portal>
      </div>
    ));
    const el = await screen.findByText("Content");
    expect(el.tagName).toBe("DIV");
    // Portaled out of the render container into the body.
    expect(container.contains(el)).toBe(false);
    expect(document.body.contains(el)).toBe(true);
    expect(el.getAttribute("data-testid")).toBe("portaled");
  });

  it("renders into an explicit container", async () => {
    const mount = document.createElement("section");
    document.body.appendChild(mount);
    try {
      render(() => <Portal container={mount}>Content</Portal>);
      const el = await screen.findByText("Content");
      expect(mount.contains(el)).toBe(true);
    } finally {
      mount.remove();
    }
  });

  it("supports an element-form render override", async () => {
    render(() => <Portal render={<aside data-testid="custom-portal" />}>Content</Portal>);
    const el = await screen.findByTestId("custom-portal");
    expect(el.tagName).toBe("ASIDE");
    expect(el.textContent).toBe("Content");
  });

  it("supports a function-form render override", async () => {
    render(() => (
      <Portal
        render={(props) => (
          <main data-testid="fn-portal" class={props.class}>
            {props.children}
          </main>
        )}
      >
        Content
      </Portal>
    ));
    const el = await screen.findByTestId("fn-portal");
    expect(el.tagName).toBe("MAIN");
    expect(el.textContent).toBe("Content");
  });
});
