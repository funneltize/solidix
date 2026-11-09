import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { Toaster, useToast } from "../src/index";

function NotifyButton(props: { title: string; description?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast.notify({ title: props.title, description: props.description })}
    >
      Notify
    </button>
  );
}

afterEach(cleanup);

describe("Toaster", () => {
  it("shows a notified toast and removes it on close", async () => {
    render(() => (
      <Toaster duration={Infinity}>
        <NotifyButton title="Saved" description="Your funnel is saved." />
      </Toaster>
    ));

    expect(screen.queryByText("Saved")).toBeNull();
    fireEvent.click(screen.getByText("Notify"));
    await screen.findByText("Saved");
    expect(screen.getByText("Your funnel is saved.")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Close"));
    await screen.findByText("Notify");
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("stacks multiple toasts", async () => {
    render(() => (
      <Toaster duration={Infinity}>
        <NotifyButton title="One" />
        <NotifyButton title="Two" />
      </Toaster>
    ));
    const buttons = screen.getAllByText("Notify");
    fireEvent.click(buttons[0]!);
    await screen.findByText("One");
    fireEvent.click(buttons[1]!);
    await screen.findByText("Two");
    expect(screen.getByText("One")).toBeTruthy();
  });
});
