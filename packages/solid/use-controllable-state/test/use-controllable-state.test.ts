import { describe, expect, test, vi } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { useControllableState, useControllableStateReducer } from "../src/index";

describe("useControllableState", () => {
  test("uncontrolled: starts from defaultProp, updates locally, fires onChange", () => {
    const onChange = vi.fn();
    let value!: () => boolean;
    let setValue!: (next: boolean | ((prev: boolean) => boolean)) => void;
    const dispose = createRoot((d) => {
      [value, setValue] = useControllableState({ defaultProp: false, onChange });
      return d;
    });
    flush();

    expect(value()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();

    setValue(true);
    flush();
    expect(value()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);

    setValue((prev) => !prev);
    flush();
    expect(value()).toBe(false);
    expect(onChange).toHaveBeenCalledWith(false);

    dispose();
  });

  test("controlled: reads the prop, only notifies via onChange", () => {
    const onChange = vi.fn();
    let value!: () => string;
    let setValue!: (next: string | ((prev: string) => string)) => void;
    let setProp!: (value: string) => void;
    const dispose = createRoot((d) => {
      const [prop, set] = createSignal("a");
      setProp = set;
      [value, setValue] = useControllableState({ prop, defaultProp: "z", onChange });
      return d;
    });
    flush();

    expect(value()).toBe("a");

    // parent updates the prop: value follows, onChange does not fire
    setProp("b");
    flush();
    expect(value()).toBe("b");
    expect(onChange).not.toHaveBeenCalled();

    // child requests a change: prop unchanged, onChange fires
    setValue("c");
    flush();
    expect(value()).toBe("b");
    expect(onChange).toHaveBeenCalledWith("c");

    // updater form resolves against the current prop
    setValue((prev) => `${prev}!`);
    expect(onChange).toHaveBeenCalledWith("b!");

    // setting the same value does not notify
    onChange.mockClear();
    setValue("b");
    expect(onChange).not.toHaveBeenCalled();

    dispose();
  });
});

describe("useControllableState getter form", () => {
  test("getter resolving undefined stays uncontrolled", () => {
    const onChange = vi.fn();
    let value!: () => string;
    let setValue!: (next: string | ((prev: string) => string)) => void;
    const dispose = createRoot((d) => {
      [value, setValue] = useControllableState({
        prop: () => undefined as unknown as string,
        defaultProp: "default",
        onChange,
      });
      return d;
    });
    flush();

    expect(value()).toBe("default");
    setValue("next");
    flush();
    expect(value()).toBe("next");
    expect(onChange).toHaveBeenCalledWith("next");

    dispose();
  });
});

describe("useControllableStateReducer", () => {
  type State = { count: number };
  type Action = { type: "increment" } | { type: "add"; by: number };
  const reducer = (prev: State & { state: number }, action: Action) => {
    if (action.type === "increment") return { ...prev, state: prev.state + 1 };
    return { ...prev, state: prev.state + action.by };
  };

  test("uncontrolled: reduces locally and fires onChange", () => {
    const onChange = vi.fn();
    let state!: () => State & { state: number };
    let dispatch!: (action: Action) => void;
    const dispose = createRoot((d) => {
      [state, dispatch] = useControllableStateReducer<number, State, Action>(
        reducer,
        {
          prop: undefined,
          defaultProp: 0,
          onChange,
          caller: "Test",
        },
        { count: 0 },
      );
      return d;
    });
    flush();

    expect(state().state).toBe(0);

    dispatch({ type: "increment" });
    flush();
    expect(state().state).toBe(1);
    expect(onChange).toHaveBeenCalledWith(1);

    dispose();
  });

  test("controlled: overlays the prop and notifies on dispatch", () => {
    const onChange = vi.fn();
    let state!: () => State & { state: number };
    let dispatch!: (action: Action) => void;
    let setProp!: (value: number) => void;
    const dispose = createRoot((d) => {
      const [prop, set] = createSignal(10);
      setProp = set;
      [state, dispatch] = useControllableStateReducer<number, State, Action>(
        reducer,
        {
          prop,
          defaultProp: 0,
          onChange,
          caller: "Test",
        },
        { count: 0 },
      );
      return d;
    });
    flush();

    expect(state().state).toBe(10);

    dispatch({ type: "add", by: 5 });
    flush();
    // controlled: internal reducer ran against synced state, prop still wins
    expect(state().state).toBe(10);
    expect(onChange).toHaveBeenCalledWith(15);

    setProp(15);
    flush();
    expect(state().state).toBe(15);

    dispose();
  });
});
