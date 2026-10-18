import { createEffect, createSignal } from "solid-js";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";

type ChangeHandler<T> = (state: T) => void;

interface UseControllableStateParams<T> {
  prop?: T | (() => T | undefined) | undefined;
  defaultProp: T;
  onChange?: ChangeHandler<T> | undefined;
  caller?: string | undefined;
}

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
  caller,
}: UseControllableStateParams<T>): [() => T, (next: T | ((prev: T) => T)) => void] {
  const getControlled = (typeof prop === "function" ? prop : () => prop) as () => T | undefined;
  // Like Radix (`prop !== undefined` per render), controlled-ness follows the
  // resolved value, so getter-form props can start uncontrolled.
  const isControlled = () => getControlled() !== undefined;
  const [uncontrolled, setUncontrolled] = createSignal<T>(defaultProp as Exclude<T, Function>);

  if (IS_DEVELOPMENT) {
    let initialized = false;
    createEffect(
      () => getControlled() === undefined,
      (isUndefined, wasUndefined) => {
        if (initialized && isUndefined !== wasUndefined) {
          const from = wasUndefined ? "uncontrolled" : "controlled";
          const to = isUndefined ? "uncontrolled" : "controlled";
          console.warn(
            `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
          );
        }
        initialized = true;
      },
    );
  }

  let uncontrolledInitialized = false;
  createEffect(
    () => uncontrolled(),
    (value, prev) => {
      if (!isControlled() && uncontrolledInitialized && !Object.is(prev, value)) {
        onChange(value);
      }
      uncontrolledInitialized = true;
    },
  );

  const setValue = (nextValue: T | ((prev: T) => T)) => {
    if (isControlled()) {
      const current = getControlled() as T;
      const value = isFunction(nextValue) ? nextValue(current) : nextValue;
      if (value !== current) {
        onChange(value);
      }
    } else {
      setUncontrolled(nextValue as Exclude<T, Function>);
    }
  };

  return [() => (isControlled() ? (getControlled() as T) : uncontrolled()), setValue];
}

function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}
