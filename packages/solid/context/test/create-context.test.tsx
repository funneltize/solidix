import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { createContext, createContextScope } from "../src/index";

describe("createContext", () => {
  test("provides values to consumers", async () => {
    const [Provider, useValue] = createContext<{ flavor: string }>("Candy");

    function Consumer() {
      const { flavor } = useValue("CandyConsumer");
      return <output>{flavor}</output>;
    }

    render(() => (
      <Provider flavor="grape">
        <Consumer />
      </Provider>
    ));
    expect(await screen.findByText("grape")).toBeDefined();
  });

  test("throws outside the provider unless optional or defaulted", () => {
    const [Provider, useValue] = createContext<{ flavor: string }>("Candy");
    const [, useDefaulted] = createContext<{ flavor: string }>("Soda", { flavor: "cola" });

    function Missing() {
      useValue("Missing");
      return null;
    }
    expect(() => render(() => <Missing />)).toThrow("`Missing` must be used within `Candy`");

    function Optional() {
      const value = useValue("Optional", { optional: true });
      return <output>{value === undefined ? "none" : "some"}</output>;
    }
    render(() => (
      <Provider flavor="x">
        <Optional />
      </Provider>
    ));

    function Defaulted() {
      const { flavor } = useDefaulted("Defaulted");
      return <output>{flavor}</output>;
    }
    render(() => <Defaulted />);
  });

  test("context values stay reactive through property reads", async () => {
    const [Provider, useCount] = createContext<{ count: number }>("Counter");

    function Consumer() {
      const context = useCount("CounterConsumer");
      return <output>{context.count}</output>;
    }

    function App(props: { count: number }) {
      return (
        <Provider count={props.count}>
          <Consumer />
        </Provider>
      );
    }

    render(() => <App count={7} />);
    expect(await screen.findByText("7")).toBeDefined();
  });
});

describe("createContextScope", () => {
  test("scopes isolate nested providers", async () => {
    const [createScopedContext, createScope] = createContextScope("Scope");
    const [Provider, useValue] = createScopedContext<{ flavor: string }>("Candy");

    function Consumer(props: { scope: any }) {
      const { flavor } = useValue("CandyConsumer", props.scope);
      return <output>{flavor}</output>;
    }

    function Outer() {
      const useScope = createScope();
      const scope = (useScope(undefined) as any).__scopeScope;
      return (
        <Provider scope={scope} flavor="outer">
          <Consumer scope={scope} />
        </Provider>
      );
    }

    render(() => <Outer />);
    expect(await screen.findByText("outer")).toBeDefined();
  });
});
