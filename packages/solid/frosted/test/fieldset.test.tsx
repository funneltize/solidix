// Solidix-authored behavior tests for the frosted Fieldset port. No
// upstream test suite exists at the pinned commit, so these assert the
// composition contract observed in upstream `fieldset.tsx` (native
// fieldset/legend elements, legend variant/size defaults, disabled
// inheritance). Rendered bare - `Theme` needs `window.matchMedia`,
// which jsdom does not provide.
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { Fieldset } from "../src/index.js";

describe("Fieldset", () => {
  it("renders a native fieldset with a legend carrying fui classes", async () => {
    render(() => (
      <Fieldset.Root data-testid="fs">
        <Fieldset.Legend>Delivery address</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const root = (await screen.findByTestId("fs")) as HTMLElement;
    expect(root.tagName).toBe("FIELDSET");
    expect(root.className).toContain("fui-FieldsetRoot");
    const legend = (await screen.findByText("Delivery address")) as HTMLElement;
    expect(legend.tagName).toBe("LEGEND");
    expect(legend.className).toContain("fui-FieldsetLegend");
  });

  it("defaults the legend to the legend variant at size 3", async () => {
    render(() => (
      <Fieldset.Root>
        <Fieldset.Legend>Details</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const legend = (await screen.findByText("Details")) as HTMLElement;
    // Upstream defaults: `variant ?? "legend"`, `size ?? "3"`, `weight ?? "bold"`.
    expect(legend.getAttribute("data-variant")).toBe("legend");
    expect(legend.className).toContain("fui-r-size-3");
    expect(legend.className).toContain("fui-r-weight-bold");
  });

  it("renders the label variant at size 2 with medium weight", async () => {
    render(() => (
      <Fieldset.Root>
        <Fieldset.Legend variant="label">Section</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const legend = (await screen.findByText("Section")) as HTMLElement;
    // Upstream label defaults: `size ?? "2"`, `weight ?? "medium"`.
    expect(legend.getAttribute("data-variant")).toBe("label");
    expect(legend.className).toContain("fui-r-size-2");
    expect(legend.className).toContain("fui-r-weight-medium");
  });

  it("disables the native fieldset and inherits disabled into the legend", async () => {
    render(() => (
      <Fieldset.Root disabled data-testid="fs">
        <Fieldset.Legend>Locked</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const root = (await screen.findByTestId("fs")) as HTMLFieldSetElement;
    expect(root.disabled).toBe(true);
    // Upstream passes `disabled: disabled ?? fieldset.disabled()` into Text,
    // and Text marks disabled typography with `data-disabled`.
    const legend = (await screen.findByText("Locked")) as HTMLElement;
    expect(legend.hasAttribute("data-disabled")).toBe(true);
  });

  it("lets an explicit legend disabled prop override the fieldset", async () => {
    render(() => (
      <Fieldset.Root disabled>
        <Fieldset.Legend disabled={false}>Unlocked label</Fieldset.Legend>
      </Fieldset.Root>
    ));
    const legend = (await screen.findByText("Unlocked label")) as HTMLElement;
    expect(legend.hasAttribute("data-disabled")).toBe(false);
  });
});
