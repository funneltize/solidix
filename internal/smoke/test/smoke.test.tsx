import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Counter } from "../src/index.js";

describe("smoke", () => {
  test("mounts, clicks, and updates", async () => {
    const user = userEvent.setup();
    render(() => <Counter initial={1} />);

    const button = await screen.findByRole("button", { name: "count: 1" });
    await user.click(button);
    expect(await screen.findByRole("button", { name: "count: 2" })).toBeDefined();
  });
});
