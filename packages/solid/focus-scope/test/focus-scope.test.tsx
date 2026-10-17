import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { FocusScope } from "../src/index";

describe("FocusScope", () => {
  test("auto-focuses the first tabbable element on mount", async () => {
    render(() => (
      <>
        <button type="button">outside</button>
        <FocusScope>
          <button type="button">first</button>
          <button type="button">second</button>
        </FocusScope>
      </>
    ));

    expect(await screen.findByText("first")).toBeDefined();
    expect(document.activeElement?.textContent).toBe("first");
  });

  test("restores focus to the previously focused element on unmount", async () => {
    const before = document.createElement("button");
    before.textContent = "before";
    document.body.appendChild(before);
    before.focus();

    const { unmount } = render(() => (
      <FocusScope>
        <button type="button">inside</button>
      </FocusScope>
    ));
    await screen.findByText("inside");
    expect(document.activeElement?.textContent).toBe("inside");

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(before);
    before.remove();
  });

  test("loops tab focus at the edges", async () => {
    const user = userEvent.setup();
    render(() => (
      <FocusScope loop>
        <button type="button">first</button>
        <button type="button">second</button>
      </FocusScope>
    ));

    const second = (await screen.findByText("second")) as HTMLElement;
    second.focus();
    await user.tab();
    expect(document.activeElement?.textContent).toBe("first");

    const first = screen.getByText("first") as HTMLElement;
    first.focus();
    await user.tab({ shift: true });
    expect(document.activeElement?.textContent).toBe("second");
  });

  test("trapped scope reclaims programmatic focus outside", async () => {
    render(() => (
      <>
        <button type="button">outside</button>
        <FocusScope trapped>
          <button type="button">inside</button>
        </FocusScope>
      </>
    ));

    const inside = (await screen.findByText("inside")) as HTMLElement;
    expect(document.activeElement).toBe(inside);

    const outside = screen.getByText("outside") as HTMLElement;
    outside.focus();
    expect(document.activeElement).toBe(inside);
  });

  test("mount autofocus can be prevented", async () => {
    const onMountAutoFocus = vi.fn((event: Event) => event.preventDefault());
    render(() => (
      <FocusScope onMountAutoFocus={onMountAutoFocus}>
        <button type="button">inside</button>
      </FocusScope>
    ));

    await screen.findByText("inside");
    expect(onMountAutoFocus).toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });
});
