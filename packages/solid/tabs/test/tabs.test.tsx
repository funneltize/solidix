import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Portal } from "@solidjs/web";
import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsProps } from "../src/index";

const ControlledTabs = () => {
  return (
    <Tabs defaultValue="one">
      <TabsList data-testid="list">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two" disabled>
          Two
        </TabsTrigger>
        <TabsTrigger value="three">Three</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
      <TabsContent value="three">Third panel</TabsContent>
    </Tabs>
  );
};

beforeEach(() => {
  vi.spyOn(console, "warn");
  vi.spyOn(console, "error");
});

describe("given the default Tabs", () => {
  test("should have a default state", async () => {
    render(() => <ControlledTabs />);

    const tab1 = await screen.findByRole("tab", { name: "One" });
    const tab2 = await screen.findByRole("tab", { name: "Two" });
    const tab3 = await screen.findByRole("tab", { name: "Three" });
    const tabpanel = await screen.findByRole("tabpanel");

    expect(screen.queryByRole("alert")).toBe(null);
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("horizontal");
    expect(tab1.getAttribute("aria-selected")).toBe("true");
    expect(tab1.getAttribute("tabindex")).toBe("-1");
    expect(tab2.getAttribute("aria-selected")).toBe("false");
    expect(tab2.hasAttribute("disabled")).toBe(true);
    expect(tab2.getAttribute("tabindex")).toBe("-1");
    expect(tab3.getAttribute("aria-selected")).toBe("false");
    expect(tab3.getAttribute("tabindex")).toBe("-1");
    expect(tabpanel.textContent).toBe("First panel");
    expect(screen.queryByText("Second panel")).toBe(null);
    expect(screen.queryByText("Third panel")).toBe(null);
  });

  test("should mount the new panel when a tab is selected", async () => {
    const user = userEvent.setup();
    render(() => <ControlledTabs />);

    const tab1 = await screen.findByRole("tab", { name: "One" });
    const tab3 = await screen.findByRole("tab", { name: "Three" });

    await user.click(tab3);
    await screen.findByRole("tabpanel", { name: "Three" });

    expect(tab1.getAttribute("aria-selected")).toBe("false");
    expect(tab3.getAttribute("aria-selected")).toBe("true");
    expect(tab3.getAttribute("tabindex")).toBe("0");
    expect(screen.queryByText("First panel")).toBe(null);
    expect(screen.getByText("Third panel")).toBeTruthy();

    await user.click(tab1);
    await screen.findByRole("tabpanel", { name: "One" });

    expect(tab1.getAttribute("aria-selected")).toBe("true");
    expect(tab3.getAttribute("aria-selected")).toBe("false");
    expect(tab3.getAttribute("tabindex")).toBe("-1");
    expect(screen.getByText("First panel")).toBeTruthy();
    expect(screen.queryByText("Third panel")).toBe(null);
  });

  test("should support keyboard navigation", async () => {
    const user = userEvent.setup();
    render(() => <ControlledTabs />);

    const tab1 = await screen.findByRole("tab", { name: "One" });
    tab1.focus();
    expect(document.activeElement).toBe(tab1);

    await user.keyboard("{ArrowRight}");
    const tab3 = await screen.findByRole("tab", { name: "Three" });
    expect(document.activeElement).toBe(tab3);

    const tabpanel = await screen.findByRole("tabpanel");
    expect(tabpanel.textContent).toBe("Third panel");
  });

  test("should not activate on focus when manual activation is set", async () => {
    const user = userEvent.setup();
    render(() => (
      <Tabs defaultValue="one" activationMode="manual">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>
    ));

    const tab1 = await screen.findByRole("tab", { name: "One" });
    tab1.focus();
    expect(document.activeElement).toBe(tab1);

    await user.keyboard("{ArrowRight}");
    const tab2 = await screen.findByRole("tab", { name: "Two" });
    expect(document.activeElement).toBe(tab2);

    const tabpanel = await screen.findByRole("tabpanel");
    expect(tabpanel.textContent).toBe("First panel");

    await user.keyboard("{Enter}");
    const updated = await screen.findByRole("tabpanel");
    expect(updated.textContent).toBe("Second panel");
  });
});

describe("blur of focusable descendants when switching tabs", () => {
  const TabsWithInput = (props: TabsProps & { onInputBlur?: (() => void) | undefined }) => {
    const { onInputBlur, ...tabsProps } = props;
    return (
      <Tabs defaultValue="one" {...tabsProps}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <input data-testid="input" onBlur={onInputBlur} />
        </TabsContent>
        <TabsContent value="two">Two content</TabsContent>
      </Tabs>
    );
  };

  test("fires onBlur on an input inside the active tab when clicking another trigger", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(() => <TabsWithInput onInputBlur={onBlur} />);

    const input = (await screen.findByTestId("input")) as HTMLElement;
    input.focus();
    expect(document.activeElement).toBe(input);

    await user.click(await screen.findByText("Two"));

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Two content")).toBeTruthy();
  });

  test("still activates a tab on mousedown (before the click completes)", async () => {
    const onValueChange = vi.fn();
    render(() => <TabsWithInput activationMode="manual" onValueChange={onValueChange} />);

    fireEvent.mouseDown(await screen.findByText("Two"), { button: 0 });
    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledWith("two"));
  });
});

describe("keys from focusable descendants", () => {
  const TabsWithPortaledInput = (props: TabsProps) => (
    <Tabs defaultValue="one" activationMode="manual" {...props}>
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">
          Two
          <Portal mount={document.body}>
            <input data-testid="input" value="" />
          </Portal>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">One content</TabsContent>
      <TabsContent value="two">Two content</TabsContent>
    </Tabs>
  );

  test("does not activate a tab from Space/Enter typed into a portaled focusable descendant", async () => {
    const onValueChange = vi.fn();
    render(() => <TabsWithPortaledInput onValueChange={onValueChange} />);
    const input = (await screen.findByTestId("input")) as HTMLElement;
    input.focus();
    fireEvent.keyDown(input, { key: " " });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("still activates the tab via Space/Enter when the trigger itself is focused", async () => {
    const onValueChange = vi.fn();
    render(() => <TabsWithPortaledInput onValueChange={onValueChange} />);
    const trigger = (await screen.findByText("Two")) as HTMLElement;
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledWith("two"));
  });
});

describe("keys from an editable descendant trigger", () => {
  const TabsWithEditableTriggers = (props: TabsProps) => (
    <Tabs defaultValue="one" activationMode="manual" {...props}>
      <TabsList>
        <TabsTrigger value="one" asChild>
          <div>
            <input data-testid="input-one" value="Foo" />
          </div>
        </TabsTrigger>
        <TabsTrigger value="two" asChild>
          <div>
            <input data-testid="input-two" value="Bar" />
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">One content</TabsContent>
      <TabsContent value="two">Two content</TabsContent>
    </Tabs>
  );

  test("does not activate a tab from Space typed into a nested editable input", async () => {
    const onValueChange = vi.fn();
    render(() => <TabsWithEditableTriggers onValueChange={onValueChange} />);
    const inputTwo = (await screen.findByTestId("input-two")) as HTMLElement;
    inputTwo.focus();
    fireEvent.keyDown(inputTwo, { key: " " });
    fireEvent.keyDown(inputTwo, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Tabs.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs
        defaultValue="one"
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <TabsList />
      </Tabs>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    await user.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs
        defaultValue="one"
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <TabsList />
        </article>
      </Tabs>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    await user.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Tabs.List", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs defaultValue="one">
        <TabsList
          ref={(node) => void (element = node)}
          data-testid="list"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <TabsTrigger value="one">Trigger</TabsTrigger>
        </TabsList>
      </Tabs>
    ));

    const list = (await screen.findByTestId("list")) as HTMLElement;
    expect(list.classList.contains("custom-class")).toBe(true);
    expect(list.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(list);

    await user.click(list);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs defaultValue="one">
        <TabsList
          asChild
          ref={(node) => void (element = node)}
          data-testid="list"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <TabsTrigger value="one">Trigger</TabsTrigger>
          </article>
        </TabsList>
      </Tabs>
    ));

    const list = (await screen.findByTestId("list")) as HTMLElement;
    expect(list.tagName).toBe("ARTICLE");
    expect(list.getAttribute("role")).toBe("tablist");
    expect(list.getAttribute("aria-orientation")).toBe("horizontal");
    expect(list.classList.contains("custom-class")).toBe(true);
    expect(list.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(list);

    await user.click(list);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Tabs.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger
            value="one"
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Trigger
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    await user.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger
            value="one"
            asChild
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <button type="button">Trigger</button>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("role")).toBe("tab");
    expect(trigger.getAttribute("aria-selected")).toBe("true");
    expect(trigger.getAttribute("data-state")).toBe("active");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    await user.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Tabs.Content", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs defaultValue="one">
        <TabsContent
          value="one"
          ref={(node) => void (element = node)}
          data-testid="content"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Content
        </TabsContent>
      </Tabs>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    await user.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <Tabs defaultValue="one">
        <TabsContent
          value="one"
          asChild
          ref={(node) => void (element = node)}
          data-testid="content"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Content</article>
        </TabsContent>
      </Tabs>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("tabpanel");
    expect(content.getAttribute("data-state")).toBe("active");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    await user.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("handlers with a narrower parameter type than the prop", () => {
  type TabValue = "one" | "two";

  test("accepts an `onValueChange` handler typed with the tab values", async () => {
    const handleValueChange = vi.fn((value: TabValue) => value);

    render(() => (
      <Tabs defaultValue="one" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
      </Tabs>
    ));
    fireEvent.mouseDown(await screen.findByText("Two"), { button: 0 });

    await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledWith("two"));
  });
});
