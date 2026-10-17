import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { For, createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  type AccordionSingleProps,
} from "../src/index";

const ITEMS = ["One", "Two", "Three"];

function ItemList(): JSX.Element {
  return (
    <For each={ITEMS}>
      {(val) => (
        <AccordionItem value={val} data-testid={`item-${val.toLowerCase()}`}>
          <AccordionHeader data-testid={`header-${val.toLowerCase()}`}>
            <AccordionTrigger>Trigger {val}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content {val}</AccordionContent>
        </AccordionItem>
      )}
    </For>
  );
}

describe("given a single Accordion", () => {
  let handleValueChange: Mock;

  describe("with default orientation", () => {
    beforeEachSetupSingle({});

    describe("when navigating by keyboard", () => {
      beforeEach(() => {
        screen.getByText("Trigger One").focus();
      });

      describe("on `ArrowDown`", () => {
        test("should move focus to the next trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
        });

        test("should move focus to the first item if at the end", () => {
          screen.getByText("Trigger Three").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `ArrowUp`", () => {
        test("should move focus to the previous trigger", () => {
          screen.getByText("Trigger Three").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
        });

        test("should move focus to the last item if at the beginning", () => {
          screen.getByText("Trigger One").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
        });
      });

      describe("on `Home`", () => {
        test("should move focus to the first trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "Home" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `End`", () => {
        test("should move focus to the last trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "End" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
        });
      });
    });

    describe("when clicking a trigger", () => {
      let trigger: HTMLElement;

      beforeEach(() => {
        trigger = screen.getByText("Trigger One");
        fireEvent.click(trigger);
      });

      test("should show the content", async () => {
        expect(await screen.findByText("Content One")).toBeTruthy();
      });

      test("should call onValueChange", async () => {
        await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledWith("One"));
      });

      describe("then clicking the trigger again", () => {
        beforeEach(() => {
          fireEvent.click(trigger);
        });

        test("should not close the content", async () => {
          expect(await screen.findByText("Content One")).toBeTruthy();
        });

        test("should not call onValueChange", async () => {
          await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledTimes(1));
        });
      });

      describe("then clicking another trigger", () => {
        beforeEach(() => {
          fireEvent.click(screen.getByText("Trigger Two"));
        });

        test("should show the new content", async () => {
          expect(await screen.findByText("Content Two")).toBeTruthy();
        });

        test("should call onValueChange", async () => {
          await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledWith("Two"));
        });

        test("should hide the previous content", async () => {
          await vi.waitFor(() => expect(screen.queryByText("Content One")).toBe(null));
        });
      });
    });

    function beforeEachSetupSingle(props: Partial<AccordionSingleProps>) {
      beforeEach(() => {
        handleValueChange = vi.fn();
        render(() => (
          <Accordion
            data-testid="container"
            type="single"
            onValueChange={handleValueChange}
            {...props}
          >
            <ItemList />
          </Accordion>
        ));
      });
    }
  });

  describe("with orientation=horizontal", () => {
    describe('and default dir="ltr"', () => {
      beforeEach(() => {
        handleValueChange = vi.fn();
        render(() => (
          <Accordion data-testid="container" type="single" orientation="horizontal">
            <ItemList />
          </Accordion>
        ));
        screen.getByText("Trigger One").focus();
      });

      describe("on `ArrowUp`", () => {
        test("should do nothing", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `ArrowDown`", () => {
        test("should do nothing", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `ArrowRight`", () => {
        test("should move focus to the next trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
        });

        test("should move focus to the first item if at the end", () => {
          screen.getByText("Trigger Three").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `ArrowLeft`", () => {
        test("should move focus to the previous trigger", () => {
          screen.getByText("Trigger Three").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
        });

        test("should move focus to the last item if at the beginning", () => {
          screen.getByText("Trigger One").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
        });
      });

      describe("on `Home`", () => {
        test("should move focus to the first trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "Home" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `End`", () => {
        test("should move focus to the last trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "End" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
        });
      });
    });

    describe('and dir="rtl"', () => {
      beforeEach(() => {
        handleValueChange = vi.fn();
        render(() => (
          <Accordion data-testid="container" type="single" dir="rtl" orientation="horizontal">
            <ItemList />
          </Accordion>
        ));
        screen.getByText("Trigger One").focus();
      });

      describe("on `ArrowUp`", () => {
        test("should do nothing", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `ArrowDown`", () => {
        test("should do nothing", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `ArrowRight`", () => {
        test("should move focus to the previous trigger", () => {
          screen.getByText("Trigger Two").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });

        test("should move focus to the last item if at the beginning", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
        });
      });

      describe("on `ArrowLeft`", () => {
        test("should move focus to the next trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
        });

        test("should move focus to the first item if at the end", () => {
          screen.getByText("Trigger Three").focus();
          fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `Home`", () => {
        test("should move focus to the first trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "Home" });
          expect(document.activeElement).toBe(screen.getByText("Trigger One"));
        });
      });

      describe("on `End`", () => {
        test("should move focus to the last trigger", () => {
          fireEvent.keyDown(document.activeElement!, { key: "End" });
          expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
        });
      });
    });
  });
});

describe("given a multiple Accordion", () => {
  let handleValueChange: Mock;

  beforeEach(() => {
    handleValueChange = vi.fn();
    render(() => (
      <Accordion data-testid="container" type="multiple" onValueChange={handleValueChange}>
        <ItemList />
      </Accordion>
    ));
  });

  describe("when navigating by keyboard", () => {
    beforeEach(() => {
      screen.getByText("Trigger One").focus();
    });

    describe("on `ArrowDown`", () => {
      test("should move focus to the next trigger", () => {
        fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
        expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
      });
    });

    describe("on `ArrowUp`", () => {
      test("should move focus to the previous trigger", () => {
        fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
        expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
      });
    });

    describe("on `Home`", () => {
      test("should move focus to the first trigger", () => {
        fireEvent.keyDown(document.activeElement!, { key: "Home" });
        expect(document.activeElement).toBe(screen.getByText("Trigger One"));
      });
    });

    describe("on `End`", () => {
      test("should move focus to the last trigger", () => {
        fireEvent.keyDown(document.activeElement!, { key: "End" });
        expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
      });
    });
  });

  describe("when clicking a trigger", () => {
    let trigger: HTMLElement;

    beforeEach(() => {
      trigger = screen.getByText("Trigger One");
      fireEvent.click(trigger);
    });

    test("should show the content", async () => {
      expect(await screen.findByText("Content One")).toBeTruthy();
    });

    test("should call onValueChange", async () => {
      await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledWith(["One"]));
    });

    describe("then clicking the trigger again", () => {
      beforeEach(() => {
        fireEvent.click(trigger);
      });

      test("should hide the content", async () => {
        await vi.waitFor(() => expect(screen.queryByText("Content One")).toBe(null));
      });

      test("should call onValueChange", async () => {
        await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledWith([]));
      });
    });

    describe("then clicking another trigger", () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText("Trigger Two"));
      });

      test("should show the new content", async () => {
        expect(await screen.findByText("Content Two")).toBeTruthy();
      });

      test("should call onValueChange", async () => {
        await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledWith(["One", "Two"]));
      });

      test("should not hide the previous content", async () => {
        expect(await screen.findByText("Content One")).toBeTruthy();
      });
    });
  });
});

// Regression test for https://github.com/radix-ui/primitives/issues/3478
describe("given a controlled single collapsible Accordion", () => {
  let handleValueChange: Mock;

  beforeEach(() => {
    handleValueChange = vi.fn();
    render(() => <ControlledSingleAccordion collapsible onValueChange={handleValueChange} />);
  });

  describe("when clicking an open item trigger", () => {
    let trigger: HTMLElement;

    beforeEach(() => {
      trigger = screen.getByText("Trigger One");
      fireEvent.click(trigger);
    });

    test("should open the item and call onValueChange once", async () => {
      expect(await screen.findByText("Content One")).toBeTruthy();
      expect(handleValueChange).toHaveBeenCalledTimes(1);
      expect(handleValueChange).toHaveBeenLastCalledWith("One");
    });

    describe("then clicking the same trigger again", () => {
      beforeEach(() => {
        fireEvent.click(trigger);
      });

      test("should close the item in a single click", async () => {
        await vi.waitFor(() => expect(screen.queryByText("Content One")).toBe(null));
      });

      test("should call onValueChange exactly once more (with an empty value)", async () => {
        await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledTimes(2));
        expect(handleValueChange).toHaveBeenLastCalledWith("");
      });
    });
  });

  function ControlledSingleAccordion(props: {
    onValueChange?: ((value: string) => void) | undefined;
    collapsible?: boolean | undefined;
  }) {
    const [value, setValue] = createSignal("");
    return (
      <Accordion
        data-testid="container"
        type="single"
        collapsible={props.collapsible}
        value={value()}
        onValueChange={(next: string) => {
          setValue(next);
          props.onValueChange?.(next);
        }}
      >
        <ItemList />
      </Accordion>
    );
  }
});

describe("Accordion.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion
        type="single"
        defaultValue="one"
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <AccordionItem value="one" />
      </Accordion>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion
        type="single"
        defaultValue="one"
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <AccordionItem value="one" />
        </article>
      </Accordion>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Accordion.Item", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem
          value="one"
          ref={(node) => void (element = node)}
          data-testid="item"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Accordion>
    ));

    const item = (await screen.findByTestId("item")) as HTMLElement;
    expect(item.classList.contains("custom-class")).toBe(true);
    expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem
          value="one"
          asChild
          ref={(node) => void (element = node)}
          data-testid="item"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </AccordionItem>
      </Accordion>
    ));

    const item = (await screen.findByTestId("item")) as HTMLElement;
    expect(item.tagName).toBe("ARTICLE");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Accordion.Header", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLHeadingElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionHeader
            ref={(node) => void (element = node)}
            data-testid="header"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </AccordionItem>
      </Accordion>
    ));

    const header = (await screen.findByTestId("header")) as HTMLElement;
    expect(header.classList.contains("custom-class")).toBe(true);
    expect(header.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(header);

    fireEvent.click(header);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionHeader
            asChild
            ref={(node) => void (element = node)}
            data-testid="header"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </AccordionHeader>
        </AccordionItem>
      </Accordion>
    ));

    const header = (await screen.findByTestId("header")) as HTMLElement;
    expect(header.tagName).toBe("ARTICLE");
    expect(header.classList.contains("custom-class")).toBe(true);
    expect(header.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(header);

    fireEvent.click(header);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Accordion.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger
              ref={(node) => void (element = node)}
              data-testid="trigger"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Trigger
            </AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
      </Accordion>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    // Composed with the trigger's own click handler rather than replaced by it.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger
              asChild
              ref={(node) => void (element = node)}
              data-testid="trigger"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <button type="button">Trigger</button>
            </AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
      </Accordion>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Accordion.Content", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Content</article>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("given an Accordion whose items change", () => {
  function List(props: { items: string[] }) {
    return (
      <Accordion type="single">
        <For each={props.items}>
          {(item) => (
            <AccordionItem value={item}>
              <AccordionHeader>
                <AccordionTrigger>Trigger {item}</AccordionTrigger>
              </AccordionHeader>
            </AccordionItem>
          )}
        </For>
      </Accordion>
    );
  }

  test("should navigate to an item mounted between existing items", async () => {
    const [items, setItems] = createSignal(["One", "Three"]);
    render(() => <List items={items()} />);
    await screen.findByText("Trigger One");
    setItems(["One", "Two", "Three"]);
    await screen.findByText("Trigger Two");

    screen.getByText("Trigger One").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
  });

  test("should skip an item after it unmounts", async () => {
    const [items, setItems] = createSignal(["One", "Two", "Three"]);
    render(() => <List items={items()} />);
    await screen.findByText("Trigger Two");
    setItems(["One", "Three"]);
    await vi.waitFor(() => expect(screen.queryByText("Trigger Two")).toBe(null));

    screen.getByText("Trigger One").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger One"));
  });

  test("should follow the new order when keyed items are reordered", async () => {
    const [items, setItems] = createSignal(["One", "Two", "Three"]);
    render(() => <List items={items()} />);
    await screen.findByText("Trigger Two");
    setItems(["Three", "One", "Two"]);
    await vi.waitFor(() => {
      const triggers = screen.getAllByRole("button").map((button) => button.textContent);
      expect(triggers).toEqual(["Trigger Three", "Trigger One", "Trigger Two"]);
    });

    screen.getByText("Trigger Three").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger One"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
  });

  test("should follow the new order when the wrappers around items are reordered", async () => {
    function WrappedList(props: { items: string[] }) {
      return (
        <Accordion type="single">
          <For each={props.items}>
            {(item) => (
              <section>
                <AccordionItem value={item}>
                  <AccordionHeader>
                    <AccordionTrigger>Trigger {item}</AccordionTrigger>
                  </AccordionHeader>
                </AccordionItem>
              </section>
            )}
          </For>
        </Accordion>
      );
    }
    const [items, setItems] = createSignal(["One", "Two", "Three"]);
    render(() => <WrappedList items={items()} />);
    await screen.findByText("Trigger Two");
    setItems(["Two", "One", "Three"]);
    await vi.waitFor(() => {
      const triggers = screen.getAllByRole("button").map((button) => button.textContent);
      expect(triggers).toEqual(["Trigger Two", "Trigger One", "Trigger Three"]);
    });

    screen.getByText("Trigger Two").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger One"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
  });

  test("should not register duplicate items", () => {
    render(() => (
      <Accordion type="single">
        <For each={ITEMS}>
          {(item) => (
            <AccordionItem value={item}>
              <AccordionHeader>
                <AccordionTrigger>Trigger {item}</AccordionTrigger>
              </AccordionHeader>
            </AccordionItem>
          )}
        </For>
      </Accordion>
    ));

    screen.getByText("Trigger One").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Two"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger One"));
  });

  test("should skip an item after it becomes disabled", async () => {
    function DisabledList(props: { disabledItem?: string | undefined }) {
      return (
        <Accordion type="single">
          <For each={ITEMS}>
            {(item) => (
              <AccordionItem value={item} disabled={item === props.disabledItem}>
                <AccordionHeader>
                  <AccordionTrigger>Trigger {item}</AccordionTrigger>
                </AccordionHeader>
              </AccordionItem>
            )}
          </For>
        </Accordion>
      );
    }
    const [disabledItem, setDisabledItem] = createSignal<string | undefined>(undefined);
    render(() => <DisabledList disabledItem={disabledItem()} />);
    await screen.findByText("Trigger Two");
    setDisabledItem("Two");
    await vi.waitFor(() =>
      expect(screen.getByText("Trigger Two").hasAttribute("disabled")).toBe(true),
    );

    screen.getByText("Trigger One").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Three"));
  });

  test("should keep navigation within a nested Accordion separate from its parent", () => {
    render(() => (
      <Accordion type="single" defaultValue="One">
        <AccordionItem value="One">
          <AccordionHeader>
            <AccordionTrigger>Trigger One</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <Accordion type="single">
              <AccordionItem value="Inner One">
                <AccordionHeader>
                  <AccordionTrigger>Trigger Inner One</AccordionTrigger>
                </AccordionHeader>
              </AccordionItem>
              <AccordionItem value="Inner Two">
                <AccordionHeader>
                  <AccordionTrigger>Trigger Inner Two</AccordionTrigger>
                </AccordionHeader>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Two">
          <AccordionHeader>
            <AccordionTrigger>Trigger Two</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
      </Accordion>
    ));

    screen.getByText("Trigger One").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Two"));

    screen.getByText("Trigger Inner One").focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Inner Two"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("Trigger Inner One"));
  });
});
