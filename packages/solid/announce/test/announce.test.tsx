import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Announce } from "../src/index";

function queryRegion(identifier: string): Element | null {
  return document.querySelector(`[data-radix-announce-region-${identifier}]`);
}

async function findRegion(identifier: string): Promise<Element> {
  let region: Element | null = null;
  await vi.waitFor(() => {
    region = queryRegion(identifier);
    expect(region).not.toBe(null);
  });
  return region as unknown as Element;
}

describe("Announce", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Announce
        ref={(node) => void (element = node)}
        data-testid="announce"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        Message
      </Announce>
    ));

    const announce = (await screen.findByTestId("announce")) as HTMLElement;
    expect(announce.classList.contains("custom-class")).toBe(true);
    expect(announce.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(announce);

    await user.click(announce);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Announce
        asChild
        ref={(node) => void (element = node)}
        data-testid="announce"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>Message</article>
      </Announce>
    ));

    const announce = (await screen.findByTestId("announce")) as HTMLElement;
    expect(announce.tagName).toBe("ARTICLE");
    expect(announce.classList.contains("custom-class")).toBe(true);
    expect(announce.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(announce);

    await user.click(announce);
    expect(onClick).toHaveBeenCalled();
  });

  test("creates a polite live region mirroring its children", async () => {
    render(() => <Announce regionIdentifier="mirror">Status message</Announce>);

    const region = await findRegion("mirror");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("role")).toBe("status");
    expect(region.getAttribute("aria-atomic")).toBe("false");

    await vi.waitFor(() => {
      expect(region.textContent).toContain("Status message");
    });
  });

  test("reuses one region per configuration", async () => {
    render(() => (
      <>
        <Announce regionIdentifier="shared">First</Announce>
        <Announce regionIdentifier="shared">Second</Announce>
      </>
    ));

    await findRegion("shared");
    expect(document.querySelectorAll("[data-radix-announce-region-shared]").length).toBe(1);
  });

  test("honors type, role, aria-relevant, and aria-atomic overrides", async () => {
    render(() => (
      <Announce regionIdentifier="overrides" type="assertive" aria-relevant="additions" aria-atomic>
        Alert
      </Announce>
    ));

    const region = await findRegion("overrides");
    expect(region.getAttribute("aria-live")).toBe("assertive");
    expect(region.getAttribute("role")).toBe("alert");
    expect(region.getAttribute("aria-relevant")).toBe("additions");
    expect(region.getAttribute("aria-atomic")).toBe("true");
  });

  test("mirrors dynamic updates", async () => {
    const [message, setMessage] = createSignal("one");

    render(() => <Announce regionIdentifier="dynamic">{message()}</Announce>);

    const region = await findRegion("dynamic");
    await vi.waitFor(() => {
      expect(region.textContent).toContain("one");
    });

    setMessage("two");
    await vi.waitFor(() => {
      expect(region.textContent).toContain("two");
    });
  });

  test("silences the region while the page is hidden", async () => {
    render(() => <Announce regionIdentifier="visibility">Hidden tab</Announce>);

    const region = await findRegion("visibility");
    Object.defineProperty(document, "hidden", { value: true, configurable: true });

    try {
      document.dispatchEvent(new Event("visibilitychange"));
      expect(region.getAttribute("role")).toBe("none");
      expect(region.getAttribute("aria-live")).toBe("off");
    } finally {
      delete (document as { hidden?: boolean }).hidden;
    }
  });
});
