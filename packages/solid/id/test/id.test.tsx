import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { useId } from "../src/index";

function Probe(props: { deterministicId?: string }) {
  const id = useId(props.deterministicId);
  return <output data-testid="out">{id}</output>;
}

describe("useId", () => {
  test("generates a radix-prefixed id", async () => {
    render(() => <Probe />);
    const output = await screen.findByTestId("out");
    expect(output.textContent).toMatch(/^radix-/);
  });

  test("generates unique ids per instance", async () => {
    render(() => (
      <>
        <Probe />
        <Probe />
      </>
    ));
    const outputs = await screen.findAllByTestId("out");
    const [first, second] = outputs.map((output) => output.textContent);
    expect(first).not.toBe(second);
  });

  test("prefers the deterministic id", async () => {
    render(() => <Probe deterministicId="trigger" />);
    expect((await screen.findByTestId("out")).textContent).toBe("trigger");
  });
});
