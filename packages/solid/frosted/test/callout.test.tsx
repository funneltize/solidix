import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Callout } from "../src/index";

describe("Callout", () => {
  it("renders root, icon, title, and description with upstream classes", async () => {
    render(() => (
      <Callout.Root>
        <Callout.Icon>
          <svg aria-hidden="true" />
        </Callout.Icon>
        <Callout.Title>Heads up</Callout.Title>
        <Callout.Description>Something needs attention.</Callout.Description>
      </Callout.Root>
    ));
    const title = await screen.findByText("Heads up");
    expect(title.tagName).toBe("P");
    expect(title.classList.contains("fui-CalloutTitle")).toBe(true);
    expect(title.classList.contains("fui-Text")).toBe(true);
    const description = await screen.findByText("Something needs attention.");
    expect(description.tagName).toBe("P");
    expect(description.classList.contains("fui-CalloutDescription")).toBe(true);
    const root = title.closest(".fui-CalloutRoot");
    expect(root).not.toBeNull();
    expect(root?.querySelector(".fui-CalloutIcon")).not.toBeNull();
  });

  it("cascades the root color to the icon, title, and description", async () => {
    render(() => (
      <Callout.Root color="red">
        <Callout.Icon>!</Callout.Icon>
        <Callout.Title>Alert</Callout.Title>
        <Callout.Description>Details</Callout.Description>
      </Callout.Root>
    ));
    const title = await screen.findByText("Alert");
    expect(title.closest(".fui-CalloutRoot")?.getAttribute("data-accent-color")).toBe("red");
    expect(title.getAttribute("data-accent-color")).toBe("red");
    expect((await screen.findByText("Details")).getAttribute("data-accent-color")).toBe("red");
    expect((await screen.findByText("!")).getAttribute("data-accent-color")).toBe("red");
  });

  it("renders actions with primary and secondary variants", async () => {
    render(() => (
      <Callout.Root>
        <Callout.Title>Update</Callout.Title>
        <Callout.Actions>
          <Callout.Action>Apply</Callout.Action>
          <Callout.Action variant="secondary">Later</Callout.Action>
        </Callout.Actions>
      </Callout.Root>
    ));
    const apply = await screen.findByRole("button", { name: "Apply" });
    expect(apply.classList.contains("fui-CalloutAction")).toBe(true);
    expect(apply.classList.contains("fui-variant-primary")).toBe(true);
    const later = await screen.findByRole("button", { name: "Later" });
    expect(later.classList.contains("fui-variant-secondary")).toBe(true);
    expect(apply.closest(".fui-CalloutActions")).not.toBeNull();
  });

  it("marks a loading action busy, disabled, and spinner-backed", async () => {
    render(() => (
      <Callout.Root>
        <Callout.Actions>
          <Callout.Action loading>Saving</Callout.Action>
        </Callout.Actions>
      </Callout.Root>
    ));
    const action = await screen.findByRole("button", { name: "Saving" });
    expect(action.getAttribute("aria-busy")).toBe("true");
    expect(action.hasAttribute("disabled")).toBe(true);
    expect(action.hasAttribute("data-disabled")).toBe(true);
    expect(action.querySelector(".fui-Spinner")).not.toBeNull();
  });
});
