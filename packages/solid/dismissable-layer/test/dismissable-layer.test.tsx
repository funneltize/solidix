import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { DismissableLayer, DismissableLayerBranch } from "../src/index";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("DismissableLayer", () => {
  test("dismisses on Escape", async () => {
    const onDismiss = vi.fn();
    render(() => (
      <DismissableLayer onDismiss={onDismiss}>
        <button type="button">inside</button>
      </DismissableLayer>
    ));
    await screen.findByText("inside");
    await tick();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("dismisses on pointer down outside, not inside", async () => {
    const user = userEvent.setup();
    const onPointerDownOutside = vi.fn();
    const onDismiss = vi.fn();
    render(() => (
      <>
        <button type="button">outside</button>
        <DismissableLayer onPointerDownOutside={onPointerDownOutside} onDismiss={onDismiss}>
          <button type="button">inside</button>
        </DismissableLayer>
      </>
    ));
    await screen.findByText("inside");
    await tick();

    await user.click(screen.getByText("inside"));
    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();

    await user.click(screen.getByText("outside"));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    // (focus also moves outside, so onDismiss fires for both channels)
    expect(onDismiss).toHaveBeenCalled();
  });

  test("does not dismiss for branch interactions", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(() => (
      <>
        <DismissableLayerBranch>
          <button type="button">branch</button>
        </DismissableLayerBranch>
        <DismissableLayer onDismiss={onDismiss}>
          <button type="button">inside</button>
        </DismissableLayer>
      </>
    ));
    await screen.findByText("inside");
    await tick();

    await user.click(screen.getByText("branch"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test("dismisses on focus outside", async () => {
    const onDismiss = vi.fn();
    render(() => (
      <>
        <button type="button">outside</button>
        <DismissableLayer onDismiss={onDismiss}>
          <button type="button">inside</button>
        </DismissableLayer>
      </>
    ));
    const inside = (await screen.findByText("inside")) as HTMLElement;
    const outside = screen.getByText("outside") as HTMLElement;
    await tick();

    inside.focus();
    outside.focus();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("disableOutsidePointerEvents toggles body pointer events", async () => {
    const { unmount } = render(() => (
      <DismissableLayer disableOutsidePointerEvents>
        <button type="button">inside</button>
      </DismissableLayer>
    ));
    await screen.findByText("inside");

    expect(document.body.style.pointerEvents).toBe("none");
    unmount();
    expect(document.body.style.pointerEvents).toBe("");
  });

  test("preventing onEscapeKeyDown skips dismiss", async () => {
    const onDismiss = vi.fn();
    render(() => (
      <DismissableLayer onDismiss={onDismiss} onEscapeKeyDown={(event) => event.preventDefault()}>
        <button type="button">inside</button>
      </DismissableLayer>
    ));
    await screen.findByText("inside");
    await tick();

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
