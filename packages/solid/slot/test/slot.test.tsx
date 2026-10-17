import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import { Slot, Slottable } from "../src/index";

describe("Slot", () => {
  test("applies slot props onto a single element child", async () => {
    render(() => (
      <Slot id="slot-id" data-state="open" class="slot" aria-describedby="a">
        <button type="button" class="child" aria-describedby="b">
          press
        </button>
      </Slot>
    ));

    const button = (await screen.findByRole("button", { name: "press" })) as HTMLButtonElement;
    expect(button.id).toBe("slot-id");
    expect(button.dataset.state).toBe("open");
    // class tokens merge, child and slot both present
    expect(button.classList.contains("slot")).toBe(true);
    expect(button.classList.contains("child")).toBe(true);
    // aria-describedby concatenates child + slot
    expect(button.getAttribute("aria-describedby")).toBe("b a");
  });

  test("child props win over slot props, handlers compose with child first", async () => {
    const user = userEvent.setup();
    const order: string[] = [];

    render(() => (
      <Slot title="slot" onClick={() => void order.push("slot")}>
        <button type="button" title="child" onClick={() => void order.push("child")}>
          press
        </button>
      </Slot>
    ));

    const button = await screen.findByRole("button", { name: "press" });
    expect(button.getAttribute("title")).toBe("child");

    await user.click(button);
    expect(order).toEqual(["child", "slot"]);
  });

  test("style objects merge with the child winning", async () => {
    render(() => (
      <Slot style={{ color: "red", background: "blue", "white-space": "nowrap" }}>
        <button type="button" style={{ color: "green" }}>
          press
        </button>
      </Slot>
    ));

    const button = (await screen.findByRole("button", { name: "press" })) as HTMLButtonElement;
    expect(button.style.color).toBe("green");
    expect(button.style.background).toBe("blue");
    expect(button.style.getPropertyValue("white-space")).toBe("nowrap");
  });

  test("forwards refs to the slotted element", async () => {
    let element: HTMLElement | null = null;

    render(() => (
      <Slot ref={(node: HTMLElement | null) => void (element = node)}>
        <button type="button">press</button>
      </Slot>
    ));

    await screen.findByRole("button", { name: "press" });
    expect(element).toBeInstanceOf(HTMLButtonElement);
  });

  test("re-applies props when they change", async () => {
    let setState!: (value: string) => void;
    render(() => {
      const [state, set] = createSignal("closed");
      setState = set;
      return (
        <Slot data-state={state()}>
          <button type="button">press</button>
        </Slot>
      );
    });

    const button = await screen.findByRole("button", { name: "press" });
    expect(button.dataset.state).toBe("closed");

    setState("open");
    expect(await screen.findByRole("button", { name: "press" })).toHaveProperty(
      "dataset.state",
      "open",
    );
  });

  test("follows reactive children changes", async () => {
    let setShow!: (show: boolean) => void;
    render(() => {
      const [show, set] = createSignal(true);
      setShow = set;
      return (
        <Slot data-state="open">
          {show() ? <button type="button">one</button> : <a href="#">two</a>}
        </Slot>
      );
    });

    const one = await screen.findByRole("button", { name: "one" });
    expect(one.dataset.state).toBe("open");

    setShow(false);
    const two = await screen.findByRole("link", { name: "two" });
    expect(two.dataset.state).toBe("open");
  });

  test("delegated slot handlers see a transparent event", async () => {
    const user = userEvent.setup();
    let currentTarget: EventTarget | null = null;
    let prevented = false;
    render(() => (
      <Slot
        onClick={(event: MouseEvent) => {
          currentTarget = event.currentTarget;
          event.preventDefault();
          prevented = event.defaultPrevented;
        }}
      >
        <button type="button">press</button>
      </Slot>
    ));

    const button = await screen.findByRole("button", { name: "press" });
    await user.click(button);
    expect(currentTarget).toBe(button);
    expect(prevented).toBe(true);
  });

  test("renders nothing for empty children", () => {
    const { container } = render(() => <Slot>{null}</Slot>);
    expect(container.textContent).toBe("");
  });

  test("throws for multiple element children", () => {
    expect(() =>
      render(() => (
        <Slot>
          <button type="button">one</button>
          <button type="button">two</button>
        </Slot>
      )),
    ).toThrow("failed to slot onto its children");
  });

  test("Slottable marks a nested target and gathers siblings", async () => {
    render(() => (
      <Slot data-state="open">
        <Slottable>
          <a href="/go">link</a>
        </Slottable>
        <b>bold</b>
      </Slot>
    ));

    const link = (await screen.findByRole("link")) as HTMLAnchorElement;
    expect(link.dataset.state).toBe("open");
    expect(link.textContent).toBe("linkbold");
    // the sibling moved inside the slotted target
    expect(link.querySelector("b")?.textContent).toBe("bold");
  });

  test("Slottable render prop maps the target children", async () => {
    render(() => (
      <Slot data-state="open">
        <Slottable child={<button type="button">inner</button>}>{() => <i>wrapped</i>}</Slottable>
      </Slot>
    ));

    const button = (await screen.findByRole("button")) as HTMLButtonElement;
    expect(button.dataset.state).toBe("open");
    expect(button.querySelector("i")?.textContent).toBe("wrapped");
  });
});
