import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Slider,
  SliderBubbleInput,
  SliderRange,
  SliderThumb,
  SliderThumbProvider,
  SliderThumbTrigger,
  SliderTrack,
  type SliderProps,
} from "../src/index";

function getThumbValue() {
  return Number(screen.getByRole("slider").getAttribute("aria-valuenow"));
}

function getThumbValues() {
  return screen.getAllByRole("slider").map((thumb) => Number(thumb.getAttribute("aria-valuenow")));
}

describe("Slider", () => {
  test("steps by a normal step value on arrow key press", async () => {
    const user = userEvent.setup();

    render(() => (
      <Slider defaultValue={[0]} min={0} max={1} step={0.1}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    ));

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(getThumbValue()).toBeCloseTo(0.1, 10);
  });

  // https://github.com/radix-ui/primitives/issues/3041
  describe("when the value is off the step grid", () => {
    test("snaps to the next aligned value on arrow up without skipping a step", async () => {
      const user = userEvent.setup();
      render(() => (
        <Slider defaultValue={[49000]} min={1000} max={100000} step={5000}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      ));

      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(getThumbValue()).toBe(51000);

      await user.keyboard("{ArrowRight}");
      expect(getThumbValue()).toBe(56000);
    });

    test("snaps to the next aligned value on arrow down without skipping a step", async () => {
      const user = userEvent.setup();
      render(() => (
        <Slider defaultValue={[49000]} min={1000} max={100000} step={5000}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      ));

      await user.tab();
      await user.keyboard("{ArrowLeft}");
      expect(getThumbValue()).toBe(46000);
    });
  });

  // https://github.com/radix-ui/primitives/issues/3852
  test("steps correctly when step is serialized in scientific notation", async () => {
    const user = userEvent.setup();
    render(() => (
      <Slider defaultValue={[0]} min={0} max={1} step={1e-7}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    ));

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(getThumbValue()).toBeCloseTo(1e-7, 12);
    await user.keyboard("{ArrowRight}");
    expect(getThumbValue()).toBeCloseTo(2e-7, 12);
  });

  test("preserves precision for fractional scientific-notation steps", async () => {
    const user = userEvent.setup();
    render(() => (
      <Slider defaultValue={[0]} min={0} max={1} step={1.5e-7}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    ));

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(getThumbValue()).toBeCloseTo(1.5e-7, 12);
  });

  // Regression tests for https://github.com/radix-ui/primitives/issues/3963
  // Solid components run setup once, so composed refs are inherently stable;
  // these assert the ref fires exactly once (no detach/reattach on updates).
  describe("ref stability", () => {
    test("keeps a stable composed ref on the root", async () => {
      const seen: Array<HTMLSpanElement | null> = [];
      const [value, setValue] = createSignal([50]);
      render(() => (
        <Slider
          value={value()}
          onValueChange={setValue}
          ref={(node) => void seen.push(node)}
          data-testid="slider"
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      ));

      await screen.findByTestId("slider");
      setValue([60]);
      await vi.waitFor(() =>
        expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("60"),
      );

      expect(seen.length).toBe(1);
      expect(seen[0]).toBe(screen.getByTestId("slider"));
    });

    test("keeps a stable composed ref on the thumb", async () => {
      const seen: Array<HTMLSpanElement | null> = [];
      const [value, setValue] = createSignal([50]);
      render(() => (
        <Slider value={value()} onValueChange={setValue}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb ref={(node) => void seen.push(node)} />
        </Slider>
      ));

      await screen.findByRole("slider");
      setValue([60]);
      await vi.waitFor(() =>
        expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("60"),
      );

      expect(seen.length).toBe(1);
      expect(seen[0]).toBe(screen.getByRole("slider"));
    });
  });

  // Regression tests for https://github.com/radix-ui/primitives/issues/3698
  describe("when dragging a range thumb to overlap another", () => {
    function renderRangeSlider(ui: JSX.Element) {
      render(() => ui);
      // The root slider element's bounding rect maps pointer coordinates to
      // values, so with a width of 100 over the [100, 110] range each unit of
      // value equals 10px (e.g. 107 → 70px).
      const slider = screen.getByTestId("slider") as HTMLElement;
      shimBoundingClientRect(slider, {
        width: 100,
        height: 10,
        right: 100,
        bottom: 10,
      });
      shimPointerCapture(slider);
      return { slider };
    }

    test("calls `onValueCommit` with the narrowed value", () => {
      const handleValueCommit = vi.fn();
      const { slider } = renderRangeSlider(
        <Slider
          defaultValue={[105, 107]}
          min={100}
          max={110}
          step={1}
          onValueCommit={handleValueCommit}
          data-testid="slider"
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
          <SliderThumb />
        </Slider>,
      );

      // Grab the right thumb (value 107 → 70px), then drag it left onto the
      // left thumb (value 105 → 50px) so both thumbs share the same value.
      fireEvent.pointerDown(slider, { pointerId: 1, clientX: 70 });
      fireEvent.pointerMove(slider, { pointerId: 1, clientX: 50 });
      fireEvent.pointerUp(slider, { pointerId: 1, clientX: 50 });

      expect(handleValueCommit).toHaveBeenCalledTimes(1);
      expect(handleValueCommit).toHaveBeenCalledWith([105, 105]);
    });

    test("does not call `onValueCommit` when the value is unchanged", () => {
      const handleValueCommit = vi.fn();
      const { slider } = renderRangeSlider(
        <Slider
          defaultValue={[105, 107]}
          min={100}
          max={110}
          step={1}
          onValueCommit={handleValueCommit}
          data-testid="slider"
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
          <SliderThumb />
        </Slider>,
      );

      // Press and release on the right thumb without moving it.
      fireEvent.pointerDown(slider, { pointerId: 1, clientX: 70 });
      fireEvent.pointerUp(slider, { pointerId: 1, clientX: 70 });

      expect(handleValueCommit).not.toHaveBeenCalled();
    });
  });

  describe("preserveThumbOrder", () => {
    test("allows thumbs to swap by default", async () => {
      const user = userEvent.setup();
      render(() => (
        <Slider defaultValue={[10, 30]} min={0} max={100} step={1}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
          <SliderThumb />
        </Slider>
      ));

      screen.getAllByRole("slider")[0]!.focus();
      for (let i = 0; i < 25; i++) {
        await user.keyboard("{ArrowRight}");
      }

      // The first thumb crosses the second and they swap positions.
      expect(getThumbValues()).toEqual([30, 35]);
    });

    test("prevents a thumb from crossing its neighbour when set", async () => {
      const user = userEvent.setup();
      render(() => (
        <Slider defaultValue={[10, 30]} min={0} max={100} step={1} preserveThumbOrder={true}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
          <SliderThumb />
        </Slider>
      ));

      screen.getAllByRole("slider")[0]!.focus();
      for (let i = 0; i < 25; i++) {
        await user.keyboard("{ArrowRight}");
      }

      // The first thumb stops at the second thumb's value instead of swapping.
      expect(getThumbValues()).toEqual([30, 30]);
    });

    test("respects `minStepsBetweenThumbs` when preserving order", async () => {
      const user = userEvent.setup();
      render(() => (
        <Slider
          defaultValue={[10, 30]}
          min={0}
          max={100}
          step={1}
          minStepsBetweenThumbs={5}
          preserveThumbOrder={true}
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
          <SliderThumb />
        </Slider>
      ));

      screen.getAllByRole("slider")[0]!.focus();
      for (let i = 0; i < 25; i++) {
        await user.keyboard("{ArrowRight}");
      }

      // The first thumb stops 5 steps short of the second thumb.
      expect(getThumbValues()).toEqual([25, 30]);
    });
  });

  describe("within a form that is reset", () => {
    function renderSliderInForm(props: SliderProps) {
      return render(() => (
        <form>
          <Slider {...props}>
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <button type="reset">Reset</button>
        </form>
      ));
    }

    test("should restore its `defaultValue` when the form is reset (uncontrolled)", async () => {
      const user = userEvent.setup();
      renderSliderInForm({ name: "volume", defaultValue: [20], min: 0, max: 100 });

      screen.getByRole("slider").focus();
      await user.keyboard("{ArrowRight}");
      expect(getThumbValue()).toBe(21);

      await user.click(screen.getByText("Reset"));
      expect(getThumbValue()).toBe(20);
    });

    test("should restore its initial `value` when the form is reset (controlled)", async () => {
      function ControlledSlider() {
        const [value, setValue] = createSignal([20]);
        return (
          <form>
            <Slider name="volume" value={value()} onValueChange={setValue} min={0} max={100}>
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <button type="reset">Reset</button>
          </form>
        );
      }

      const user = userEvent.setup();
      render(() => <ControlledSlider />);

      screen.getByRole("slider").focus();
      await user.keyboard("{ArrowRight}");
      expect(getThumbValue()).toBe(21);

      await user.click(screen.getByText("Reset"));
      expect(getThumbValue()).toBe(20);
    });
  });

  describe("with external form association", () => {
    test("should restore its `defaultValue` when reset from an external form", async () => {
      const user = userEvent.setup();
      render(() => (
        <>
          <form id="slider-reset-form">
            <button type="reset">Reset</button>
          </form>
          <Slider name="volume" form="slider-reset-form" defaultValue={[20]} min={0} max={100}>
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </>
      ));

      screen.getByRole("slider").focus();
      await user.keyboard("{ArrowRight}");
      expect(getThumbValue()).toBe(21);

      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(getThumbValue()).toBe(20);
    });

    test("should restore its initial `value` when reset from an external form", async () => {
      function ControlledSlider() {
        const [value, setValue] = createSignal([20]);
        return (
          <>
            <form id="slider-reset-form">
              <button type="reset">Reset</button>
            </form>
            <Slider
              name="volume"
              form="slider-reset-form"
              value={value()}
              onValueChange={setValue}
              min={0}
              max={100}
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </>
        );
      }

      const user = userEvent.setup();
      render(() => <ControlledSlider />);

      screen.getByRole("slider").focus();
      await user.keyboard("{ArrowRight}");
      expect(getThumbValue()).toBe(21);

      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(getThumbValue()).toBe(20);
    });
  });
});

describe("Slider.Root", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider
        defaultValue={[50]}
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
      </Slider>
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
      <Slider
        defaultValue={[50]}
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
        </article>
      </Slider>
    ));

    const root = (await screen.findByTestId("root")) as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Slider.Track", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderTrack
          ref={(node) => void (element = node)}
          data-testid="track"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <SliderRange />
        </SliderTrack>
      </Slider>
    ));

    const track = (await screen.findByTestId("track")) as HTMLElement;
    expect(track.classList.contains("custom-class")).toBe(true);
    expect(track.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(track);

    fireEvent.click(track);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderTrack
          asChild
          ref={(node) => void (element = node)}
          data-testid="track"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <SliderRange />
          </article>
        </SliderTrack>
      </Slider>
    ));

    const track = (await screen.findByTestId("track")) as HTMLElement;
    expect(track.tagName).toBe("ARTICLE");
    expect(track.getAttribute("data-orientation")).toBe("horizontal");
    expect(track.classList.contains("custom-class")).toBe(true);
    expect(track.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(track);

    fireEvent.click(track);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Slider.Range", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderTrack>
          <SliderRange
            ref={(node) => void (element = node)}
            data-testid="range"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </SliderTrack>
      </Slider>
    ));

    const range = (await screen.findByTestId("range")) as HTMLElement;
    expect(range.classList.contains("custom-class")).toBe(true);
    // The range positions itself with `left`/`right`, so this also proves `style` is merged.
    expect(range.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(range.style.right).toBe("50%");
    expect(element).toBe(range);

    fireEvent.click(range);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderTrack>
          <SliderRange
            asChild
            ref={(node) => void (element = node)}
            data-testid="range"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </SliderRange>
        </SliderTrack>
      </Slider>
    ));

    const range = (await screen.findByTestId("range")) as HTMLElement;
    expect(range.tagName).toBe("ARTICLE");
    expect(range.getAttribute("data-orientation")).toBe("horizontal");
    expect(range.classList.contains("custom-class")).toBe(true);
    expect(range.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(range);

    fireEvent.click(range);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Slider.Thumb", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb
          ref={(node) => void (element = node)}
          data-testid="thumb"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Slider>
    ));

    const thumb = (await screen.findByTestId("thumb")) as HTMLElement;
    expect(thumb.classList.contains("custom-class")).toBe(true);
    expect(thumb.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(thumb);

    fireEvent.click(thumb);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb
          asChild
          ref={(node) => void (element = node)}
          data-testid="thumb"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </SliderThumb>
      </Slider>
    ));

    const thumb = (await screen.findByTestId("thumb")) as HTMLElement;
    expect(thumb.tagName).toBe("ARTICLE");
    expect(thumb.getAttribute("role")).toBe("slider");
    expect(thumb.getAttribute("aria-valuenow")).toBe("50");
    expect(thumb.classList.contains("custom-class")).toBe(true);
    expect(thumb.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(thumb);

    fireEvent.click(thumb);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Slider.ThumbTrigger", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderThumbProvider>
          <SliderThumbTrigger
            ref={(node) => void (element = node)}
            data-testid="thumb-trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </SliderThumbProvider>
      </Slider>
    ));

    const trigger = (await screen.findByTestId("thumb-trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]}>
        <SliderThumbProvider>
          <SliderThumbTrigger
            asChild
            ref={(node) => void (element = node)}
            data-testid="thumb-trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </SliderThumbTrigger>
        </SliderThumbProvider>
      </Slider>
    ));

    const trigger = (await screen.findByTestId("thumb-trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("ARTICLE");
    expect(trigger.getAttribute("role")).toBe("slider");
    expect(trigger.getAttribute("aria-valuenow")).toBe("50");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Slider.BubbleInput", () => {
  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLInputElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]} name="volume">
        <SliderThumbProvider>
          <SliderThumbTrigger />
          <SliderBubbleInput
            ref={(node) => void (element = node)}
            data-testid="bubble-input"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </SliderThumbProvider>
      </Slider>
    ));

    const input = (await screen.findByTestId("bubble-input")) as HTMLElement;
    expect(input.classList.contains("custom-class")).toBe(true);
    expect(input.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(input);

    // The input exists only to carry the value into form data and is never
    // clicked by a user, but the handler still has to survive being spread onto it.
    fireEvent.click(input);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Slider defaultValue={[50]} name="volume">
        <SliderThumbProvider>
          <SliderThumbTrigger />
          <SliderBubbleInput
            asChild
            ref={(node) => void (element = node)}
            data-testid="bubble-input"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <input />
          </SliderBubbleInput>
        </SliderThumbProvider>
      </Slider>
    ));

    const input = (await screen.findByTestId("bubble-input")) as HTMLElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("name")).toBe("volume");
    expect(input.classList.contains("custom-class")).toBe(true);
    expect(input.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(input);

    fireEvent.click(input);
    expect(onClick).toHaveBeenCalled();
  });

  test("does not bubble a programmatic value change to ancestor `onInput` handlers", async () => {
    const onAncestorInput = vi.fn();
    const onFormChange = vi.fn();

    function App(props: { value: number[] }) {
      return (
        <form onChange={onFormChange}>
          <div onInput={onAncestorInput}>
            <Slider value={props.value} onValueChange={() => {}} name="volume">
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    const [value, setValue] = createSignal([50]);
    render(() => <App value={value()} />);
    await screen.findByRole("slider");
    onAncestorInput.mockClear();
    onFormChange.mockClear();

    setValue([0]);
    await vi.waitFor(() => expect(onFormChange).toHaveBeenCalledTimes(1));

    expect(onAncestorInput).not.toHaveBeenCalled();
  });

  test("bubbles a user-driven value change to ancestor `onInput` handlers", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();
    const onFormChange = vi.fn();

    render(() => (
      <form onChange={onFormChange}>
        <div onInput={onAncestorInput}>
          <Slider defaultValue={[50]} name="volume">
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </div>
      </form>
    ));

    screen.getByRole("slider").focus();
    onAncestorInput.mockClear();
    onFormChange.mockClear();

    await user.keyboard("{ArrowRight}");

    await vi.waitFor(() => expect(onAncestorInput).toHaveBeenCalledTimes(1));
    expect(onFormChange).toHaveBeenCalledTimes(1);
  });

  test("bubbles a user-driven change to ancestor `onInput` handlers in a controlled slider", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();

    function App() {
      const [value, setValue] = createSignal([50]);
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider value={value()} onValueChange={setValue} name="volume">
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    render(() => <App />);
    screen.getByRole("slider").focus();
    onAncestorInput.mockClear();

    await user.keyboard("{ArrowRight}");

    await vi.waitFor(() =>
      expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("51"),
    );
    expect(onAncestorInput).toHaveBeenCalledTimes(1);
  });

  test("bubbles a user-driven change to ancestor `onInput` handlers when the controlled value is applied later", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();

    function App() {
      const [value, setValue] = createSignal([50]);
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider
              value={value()}
              onValueChange={(nextValue) => {
                setTimeout(() => setValue(nextValue));
              }}
              name="volume"
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    render(() => <App />);
    screen.getByRole("slider").focus();
    onAncestorInput.mockClear();

    await user.keyboard("{ArrowRight}");
    await new Promise((resolve) => setTimeout(resolve));

    await vi.waitFor(() =>
      expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("51"),
    );
    expect(onAncestorInput).toHaveBeenCalledTimes(1);
  });

  test("bubbles the value a controlled parent applies in place of the user-requested one to ancestor `onInput` handlers", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();
    const onFormChange = vi.fn();

    const START_VALUE = 50;
    const NEXT_VALUE_OFFSET = 9;
    const STEP = 1;

    function App() {
      const [value, setValue] = createSignal([START_VALUE]);
      return (
        <form onChange={onFormChange}>
          <div onInput={onAncestorInput}>
            <Slider
              value={value()}
              onValueChange={([nextValue = 0]) => {
                const step = nextValue + NEXT_VALUE_OFFSET;
                return setValue([Math.min(step, 100)]);
              }}
              name="volume"
              step={STEP}
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    render(() => <App />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");

    await vi.waitFor(() =>
      expect(onAncestorInput).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: `${START_VALUE + NEXT_VALUE_OFFSET + STEP}`,
          }),
        }),
      ),
    );
    expect(onFormChange).toHaveBeenCalledTimes(1);
  });

  test("only bubbles the user-driven thumb change to ancestor `onInput` handlers in a range slider", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();

    function App() {
      const [value, setValue] = createSignal([20, 80]);
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider
              value={value()}
              onValueChange={([start = 0]) => {
                // Programmatically keep the end thumb 60 units ahead.
                setTimeout(() => setValue([start, start + 60]));
              }}
              name="range"
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    render(() => <App />);
    const [startThumb, endThumb] = screen.getAllByRole("slider");
    startThumb!.focus();
    onAncestorInput.mockClear();

    await user.keyboard("{ArrowRight}");
    await new Promise((resolve) => setTimeout(resolve));

    await vi.waitFor(() => {
      expect(startThumb!.getAttribute("aria-valuenow")).toBe("21");
      expect(endThumb!.getAttribute("aria-valuenow")).toBe("81");
    });
    expect(onAncestorInput).toHaveBeenCalledTimes(1);
    expect(((onAncestorInput.mock.calls[0]![0] as Event).target as HTMLInputElement).value).toBe(
      "21",
    );
  });

  test("only bubbles the user-driven thumb change to ancestor `onInput` handlers when a controlled parent moves another thumb in the same render", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();

    const START_VALUE = 20;
    const END_VALUE = 80;
    const STEP = 1;

    function App() {
      const [value, setValue] = createSignal([START_VALUE, END_VALUE]);
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider
              value={value()}
              onValueChange={([start = 0]) =>
                setValue([
                  start,
                  // update end thumb to ensure the programmatic change is not
                  // captured as the user-driven change
                  start + 60,
                ])
              }
              name="range"
              step={STEP}
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    render(() => <App />);
    const [startThumb] = screen.getAllByRole("slider");
    startThumb!.focus();
    await user.keyboard("{ArrowRight}");

    await vi.waitFor(() =>
      expect(onAncestorInput).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: `${START_VALUE + STEP}`,
          }),
        }),
      ),
    );
  });

  test("bubbles every thumb value a user drag changes to ancestor `onInput` handlers when a controlled parent adjusts the values", async () => {
    const onAncestorInput = vi.fn();

    const START_VALUE = 20;
    const END_VALUE = 30;
    const STEP = 1;

    function App() {
      const [value, setValue] = createSignal([START_VALUE, END_VALUE]);
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider
              data-testid="slider"
              value={value()}
              step={STEP}
              onValueChange={(nextValues) => {
                const next = nextValues.map((nextValue) => Math.min(nextValue + 1, 100));
                return setValue(next);
              }}
              name="range"
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    render(() => <App />);

    // With a width of 100 over the [0, 100] range, each pixel equals one unit
    // of value.
    const slider = screen.getByTestId("slider") as HTMLElement;
    shimBoundingClientRect(slider, {
      width: 100,
      height: 10,
      right: 100,
      bottom: 10,
    });

    shimPointerCapture(slider);

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 20 });

    // Dragging the start thumb past the end thumb re-sorts the values, so the
    // drag changes both thumb values: [20, 30] -> [30, 40].
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 40 });

    await vi.waitFor(() => expect(onAncestorInput).toHaveBeenCalledTimes(2));
    expect(
      onAncestorInput.mock.calls
        .map(([event]) => (event as Event).target as HTMLInputElement)
        .map((target) => target.value),
    ).toEqual([
      //
      `${START_VALUE + 10 + STEP}`,
      `${END_VALUE + 10 + STEP}`,
    ]);
  });

  test("does not treat a programmatic change as user-driven after a rejected user interaction", async () => {
    const user = userEvent.setup();
    const onAncestorInput = vi.fn();

    function App(props: { value: number[] }) {
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider value={props.value} onValueChange={() => {}} name="volume">
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </form>
      );
    }

    const [value, setValue] = createSignal([50]);
    render(() => <App value={value()} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");

    onAncestorInput.mockClear();

    setValue([0]);
    await vi.waitFor(() =>
      expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("0"),
    );

    expect(onAncestorInput).not.toHaveBeenCalled();
  });

  test("does not change the value for pointer moves within a single step", async () => {
    const handleValueChange = vi.fn();
    render(() => (
      <Slider
        data-testid="slider"
        defaultValue={[50]}
        step={10}
        name="volume"
        onValueChange={handleValueChange}
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    ));

    // With a width of 100 over the [0, 100] range, each pixel equals one unit
    // of value, so moves between 46px and 54px all snap to the same step (50).
    const slider = screen.getByTestId("slider") as HTMLElement;
    shimBoundingClientRect(slider, {
      width: 100,
      height: 10,
      right: 100,
      bottom: 10,
    });
    shimPointerCapture(slider);

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 50 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 51 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 52 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 53 });
    expect(getThumbValue()).toBe(50);

    // A move into the next step still applies exactly once, proving the
    // no-op moves above produced no value changes.
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 60 });
    await vi.waitFor(() => expect(handleValueChange).toHaveBeenCalledTimes(1));
    expect(handleValueChange).toHaveBeenCalledWith([60]);
  });
});

/**
 * jsdom implements the `PointerEvent` interface but not the pointer capture
 * methods that the slide handlers rely on, so we stub them here.
 *
 * See https://github.com/jsdom/jsdom/pull/2666
 */
function shimPointerCapture(element: HTMLElement) {
  element.setPointerCapture = () => {};
  element.releasePointerCapture = () => {};
  element.hasPointerCapture = () => true;
}

function shimBoundingClientRect(element: HTMLElement, rect: Partial<DOMRect>) {
  element.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    ...rect,
    toJSON: () => {},
  });
}
