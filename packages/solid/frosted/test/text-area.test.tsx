// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream structure:
// div.fui-TextAreaRoot > (textarea.fui-TextAreaInput + div.fui-TextAreaChrome),
// size/variant/color classes on the root, style on the root, and all
// remaining props spread onto the textarea.
import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { TextArea } from "../src/components/text-area/text-area";

describe("TextArea", () => {
  test("renders root, input, and chrome layers", () => {
    const { container } = render(() => <TextArea data-testid="area" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("fui-TextAreaRoot")).toBe(true);
    const textarea = root.querySelector("textarea");
    expect(textarea?.classList.contains("fui-TextAreaInput")).toBe(true);
    expect(root.querySelector(".fui-TextAreaChrome")).not.toBeNull();
  });

  test("applies default size, variant, and accent color", () => {
    const { container } = render(() => <TextArea />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("fui-r-size-2")).toBe(true);
    expect(root.classList.contains("fui-variant-surface")).toBe(true);
    expect(root.getAttribute("data-accent-color")).toBe("gray");
  });

  test("applies explicit size, variant, and color", () => {
    const { container } = render(() => <TextArea size="4" variant="soft" color="blue" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("fui-r-size-4")).toBe(true);
    expect(root.classList.contains("fui-variant-soft")).toBe(true);
    expect(root.getAttribute("data-accent-color")).toBe("blue");
  });

  test("merges class and style onto the root", () => {
    const { container } = render(() => <TextArea class="custom" style={{ "margin-top": "4px" }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("custom")).toBe(true);
    expect(root.style.marginTop).toBe("4px");
  });

  test("spreads remaining props onto the textarea", () => {
    const { container } = render(() => (
      <TextArea placeholder="Notes" disabled rows={5} data-testid="area" />
    ));
    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.getAttribute("placeholder")).toBe("Notes");
    expect(textarea.disabled).toBe(true);
    expect(textarea.rows).toBe(5);
    expect(textarea.getAttribute("data-testid")).toBe("area");
  });
});
