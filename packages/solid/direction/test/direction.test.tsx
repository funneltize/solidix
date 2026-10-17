import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { DirectionProvider, useDirection } from "../src/index";

function Probe(props: { dir?: "ltr" | "rtl" }) {
  return <output>{useDirection(props.dir)}</output>;
}

describe("direction", () => {
  test("defaults to ltr", async () => {
    render(() => <Probe />);
    expect(await screen.findByText("ltr")).toBeDefined();
  });

  test("reads the provider value", async () => {
    render(() => (
      <DirectionProvider dir="rtl">
        <Probe />
      </DirectionProvider>
    ));
    expect(await screen.findByText("rtl")).toBeDefined();
  });

  test("local dir wins over the provider", async () => {
    render(() => (
      <DirectionProvider dir="rtl">
        <Probe dir="ltr" />
      </DirectionProvider>
    ));
    expect(await screen.findByText("ltr")).toBeDefined();
  });
});
