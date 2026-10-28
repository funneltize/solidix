import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { EmptyState } from "../src/index";

describe("EmptyState", () => {
  it("renders the compound with upstream classes", async () => {
    render(() => (
      <EmptyState.Root>
        <EmptyState.Header>
          <EmptyState.Media>Icon</EmptyState.Media>
          <EmptyState.Title>No messages</EmptyState.Title>
          <EmptyState.Description>You are all caught up.</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Actions>
          <button type="button">Compose</button>
        </EmptyState.Actions>
      </EmptyState.Root>
    ));

    const title = await screen.findByText("No messages");
    expect(title.tagName).toBe("DIV");
    expect(title.classList.contains("fui-EmptyStateTitle")).toBe(true);
    const description = await screen.findByText("You are all caught up.");
    expect(description.tagName).toBe("P");
    expect(description.classList.contains("fui-EmptyStateDescription")).toBe(true);

    const root = title.closest(".fui-EmptyStateRoot");
    expect(root).not.toBeNull();
    expect(root?.querySelector(".fui-EmptyStateHeader")).not.toBeNull();
    expect(root?.querySelector(".fui-EmptyStateActions")).not.toBeNull();
  });

  it("defaults media to the soft gray variant", async () => {
    render(() => (
      <EmptyState.Root>
        <EmptyState.Media>Icon</EmptyState.Media>
      </EmptyState.Root>
    ));
    const media = (await screen.findByText("Icon")).closest(".fui-EmptyStateMedia");
    expect(media?.classList.contains("fui-variant-soft")).toBe(true);
    expect(media?.getAttribute("data-accent-color")).toBe("gray");
  });

  it("applies the ghost variant and accent color to media", async () => {
    render(() => (
      <EmptyState.Root>
        <EmptyState.Media variant="ghost" color="blue">
          Icon
        </EmptyState.Media>
      </EmptyState.Root>
    ));
    const media = (await screen.findByText("Icon")).closest(".fui-EmptyStateMedia");
    expect(media?.classList.contains("fui-variant-ghost")).toBe(true);
    expect(media?.getAttribute("data-accent-color")).toBe("blue");
  });
});
