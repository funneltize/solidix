import { createSignal } from "solid-js";

export interface CounterProps {
  initial?: number;
}

export function Counter(props: CounterProps) {
  const [count, setCount] = createSignal(props.initial ?? 0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      count: {count()}
    </button>
  );
}
