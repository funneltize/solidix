import { createSignal } from "solid-js";

type Machine<S extends string> = { [k: string]: { [k: string]: S } };

/** Tiny state machine returning the state accessor and a send function. */
export function useStateMachine<S extends string>(
  initialState: S,
  machine: Machine<S>,
): [() => S, (event: string) => void] {
  const [state, setState] = createSignal<string>(initialState);
  const send = (event: string) => {
    setState((prev) => machine[prev]?.[event] ?? prev);
  };
  return [state as unknown as () => S, send];
}
