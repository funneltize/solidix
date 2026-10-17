import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RovingFocusGroup, RovingFocusGroupItem } from "../src/index";

function Group(props: { orientation?: "horizontal" | "vertical"; loop?: boolean }) {
  return (
    <RovingFocusGroup orientation={props.orientation} loop={props.loop}>
      <RovingFocusGroupItem asChild>
        <button type="button">one</button>
      </RovingFocusGroupItem>
      <RovingFocusGroupItem asChild>
        <button type="button">two</button>
      </RovingFocusGroupItem>
      <RovingFocusGroupItem asChild>
        <button type="button">three</button>
      </RovingFocusGroupItem>
    </RovingFocusGroup>
  );
}

describe("RovingFocusGroup", () => {
  test("first item is the tab stop, arrows move focus", async () => {
    const user = userEvent.setup();
    render(() => <Group orientation="horizontal" />);

    const one = (await screen.findByText("one")) as HTMLElement;
    const two = screen.getByText("two") as HTMLElement;
    const three = screen.getByText("three") as HTMLElement;

    one.focus();
    expect(document.activeElement).toBe(one);

    await user.keyboard("{ArrowRight}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(two);

    await user.keyboard("{ArrowRight}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(three);
  });

  test("tab enters the group at the current tab stop", async () => {
    const user = userEvent.setup();
    render(() => (
      <>
        <button type="button">before</button>
        <Group orientation="horizontal" />
      </>
    ));

    const before = (await screen.findByText("before")) as HTMLElement;
    before.focus();
    await user.tab();
    expect(document.activeElement?.textContent).toBe("one");
  });

  test("vertical orientation ignores left/right arrows", async () => {
    const user = userEvent.setup();
    render(() => <Group orientation="vertical" />);

    const one = (await screen.findByText("one")) as HTMLElement;
    one.focus();
    await user.keyboard("{ArrowRight}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(one);

    await user.keyboard("{ArrowDown}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement?.textContent).toBe("two");
  });

  test("keeps component children mounted so multi-step interactions land", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const Item: Component<{ children?: JSX.Element }> = (props) => (
      <button type="button" onClick={onClick}>
        {props.children}
      </button>
    );
    render(() => (
      <RovingFocusGroup>
        <RovingFocusGroupItem asChild>
          <Item>one</Item>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <Item>two</Item>
        </RovingFocusGroupItem>
      </RovingFocusGroup>
    ));

    const one = (await screen.findByText("one")) as HTMLElement;
    await user.click(one);

    expect(onClick).toHaveBeenCalled();
    expect(one.isConnected).toBe(true);
  });
});
