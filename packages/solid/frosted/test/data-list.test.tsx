import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { DataList } from "../src/index";

describe("DataList", () => {
  it("renders a description list with size and orientation classes", async () => {
    render(() => (
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Name</DataList.Label>
          <DataList.Value>Ada</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    ));
    const label = await screen.findByText("Name");
    expect(label.tagName).toBe("DT");
    expect(label.classList.contains("fui-DataListLabel")).toBe(true);
    const value = await screen.findByText("Ada");
    expect(value.tagName).toBe("DD");
    expect(value.classList.contains("fui-DataListValue")).toBe(true);
    const list = label.closest("dl");
    expect(list?.classList.contains("fui-DataListRoot")).toBe(true);
    expect(list?.classList.contains("fui-Text")).toBe(true);
    expect(list?.classList.contains("fui-r-size-2")).toBe(true);
    expect(list?.classList.contains("fui-r-orientation-horizontal")).toBe(true);
  });

  it("applies size, orientation, and trim classes", async () => {
    render(() => (
      <DataList.Root size="1" orientation="vertical" trim="both">
        <DataList.Item>
          <DataList.Label>Key</DataList.Label>
          <DataList.Value>Val</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    ));
    const list = (await screen.findByText("Key")).closest("dl");
    expect(list?.classList.contains("fui-r-size-1")).toBe(true);
    expect(list?.classList.contains("fui-r-orientation-vertical")).toBe(true);
    expect(list?.classList.contains("fui-r-lt-both")).toBe(true);
  });

  it("omits the trim class without a trim prop", async () => {
    render(() => (
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Key</DataList.Label>
          <DataList.Value>Val</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    ));
    const list = (await screen.findByText("Key")).closest("dl");
    expect(list?.className.includes("fui-r-lt-")).toBe(false);
  });

  it("applies item alignment and label color classes", async () => {
    render(() => (
      <DataList.Root>
        <DataList.Item align="center">
          <DataList.Label color="blue" highContrast>
            Key
          </DataList.Label>
          <DataList.Value>Val</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    ));
    const label = await screen.findByText("Key");
    expect(label.getAttribute("data-accent-color")).toBe("blue");
    expect(label.classList.contains("fui-high-contrast")).toBe(true);
    expect(label.closest(".fui-DataListItem")?.classList.contains("fui-r-ai-center")).toBe(true);
  });
});
