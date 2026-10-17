import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { useIsHydrated } from "../src/index";

function Probe() {
  const isHydrated = useIsHydrated();
  return <output>{isHydrated() ? "hydrated" : "pending"}</output>;
}

describe("useIsHydrated", () => {
  test("reports hydrated once settled", async () => {
    render(() => <Probe />);
    expect(await screen.findByText("hydrated")).toBeDefined();
  });
});
