import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { AvatarGroup, AvatarStack } from "../src/index";

describe("AvatarGroup", () => {
  it("renders a collage root with fixed-size avatars", async () => {
    render(() => (
      <AvatarGroup.Root>
        <AvatarGroup.Avatar fallback="Ada Lovelace" />
        <AvatarGroup.Avatar fallback="Grace Hopper" />
      </AvatarGroup.Root>
    ));
    const first = await screen.findByText("AL");
    const root = first.closest(".fui-AvatarGroupRoot");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("fui-r-size-3")).toBe(true);
    expect(first.closest(".fui-AvatarGroupAvatar")?.classList.contains("fui-r-size-3")).toBe(true);
    expect(root?.querySelector(".fui-AvatarGroupRootInner")).not.toBeNull();
    expect(await screen.findByText("GH")).not.toBeNull();
  });

  it("applies size, shape, and color", async () => {
    render(() => (
      <AvatarGroup.Root size="5" shape="square" color="teal">
        <AvatarGroup.Avatar fallback="Ada Lovelace" />
      </AvatarGroup.Root>
    ));
    const root = (await screen.findByText("AL")).closest(".fui-AvatarGroupRoot");
    expect(root?.classList.contains("fui-r-size-5")).toBe(true);
    expect(root?.classList.contains("fui-shape-square")).toBe(true);
    expect(root?.getAttribute("data-accent-color")).toBe("teal");
  });
});

describe("AvatarStack", () => {
  it("renders children reversed so later avatars overlap", async () => {
    render(() => (
      <AvatarStack.Root>
        <AvatarStack.Avatar fallback="Ada Lovelace" />
        <AvatarStack.Avatar fallback="Grace Hopper" />
        <AvatarStack.Avatar fallback="Katherine Johnson" />
      </AvatarStack.Root>
    ));
    await screen.findByText("AL");
    const root = screen.getByText("AL").closest(".fui-AvatarStackRoot");
    const order = Array.from(root?.children ?? []).map((el) => el.textContent);
    expect(order).toEqual(["KJ", "GH", "AL"]);
  });

  it("cascades the root size to avatars", async () => {
    render(() => (
      <AvatarStack.Root size="6">
        <AvatarStack.Avatar fallback="Ada Lovelace" />
      </AvatarStack.Root>
    ));
    const avatar = (await screen.findByText("AL")).closest(".fui-AvatarStackAvatar");
    expect(avatar?.classList.contains("fui-r-size-6")).toBe(true);
    expect(avatar?.closest(".fui-AvatarStackRoot")?.classList.contains("fui-r-size-6")).toBe(true);
  });
});
