import { createEffect, createSignal, untrack } from "solid-js";
import { IS_DEVELOPMENT } from "@soldix/env-check/is-development";
import { useEffectEvent } from "@soldix/use-effect-event";

type ChangeHandler<T> = (state: T) => void;

interface UseControllableStateParams<T> {
  prop: T | (() => T | undefined) | undefined;
  defaultProp: T;
  onChange: ChangeHandler<T> | undefined;
  caller: string;
}

interface AnyAction {
  type: string;
}

const SYNC_STATE = Symbol("RADIX:SYNC_STATE");

interface SyncStateAction<T> {
  type: typeof SYNC_STATE;
  state: T;
}

export type Dispatch<A> = (action: A) => void;

export function useControllableStateReducer<T, S extends {}, A extends AnyAction>(
  reducer: (prevState: S & { state: T }, action: A) => S & { state: T },
  userArgs: UseControllableStateParams<T>,
  initialState: S,
): [() => S & { state: T }, Dispatch<A>];

export function useControllableStateReducer<T, S extends {}, I, A extends AnyAction>(
  reducer: (prevState: S & { state: T }, action: A) => S & { state: T },
  userArgs: UseControllableStateParams<T>,
  initialArg: I,
  init: (i: I & { state: T }) => S,
): [() => S & { state: T }, Dispatch<A>];

export function useControllableStateReducer<T, S extends {}, A extends AnyAction>(
  reducer: (prevState: S & { state: T }, action: A) => S & { state: T },
  userArgs: UseControllableStateParams<T>,
  initialArg: any,
  init?: (i: any) => Omit<S, "state">,
): [() => S & { state: T }, Dispatch<A>] {
  type InternalState = S & { state: T };
  const { prop: controlledProp, defaultProp, onChange: onChangeProp, caller } = userArgs;
  const getControlled = (
    typeof controlledProp === "function" ? controlledProp : () => controlledProp
  ) as () => T | undefined;
  // Like Radix (`prop !== undefined` per render), controlled-ness follows the
  // resolved value, so getter-form props can start uncontrolled.
  const isControlled = () => getControlled() !== undefined;

  const onChange = useEffectEvent(onChangeProp);

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

  // Mirrors `useReducer(reducer, { ...initialArg, state: defaultProp }, init?)`.
  const initial: InternalState = (
    init
      ? { ...init({ ...(initialArg as object), state: defaultProp }) }
      : { ...(initialArg as object), state: defaultProp }
  ) as InternalState;
  const [internalState, setInternalState] = createSignal<InternalState>(
    initial as Exclude<InternalState, Function>,
  );

  const dispatch = ((action: A | SyncStateAction<T>) => {
    setInternalState((prev) => {
      if (action.type === SYNC_STATE) {
        return { ...prev, state: (action as SyncStateAction<T>).state };
      }
      const next = reducer(prev, action as A);
      if (untrack(isControlled) && !Object.is(next.state, prev.state)) {
        onChange(next.state);
      }
      return next;
    });
  }) as Dispatch<A>;

  // Uncontrolled `onChange`: fire when the internal state value changes.
  let uncontrolledInitialized = false;
  createEffect(
    () => internalState().state,
    (value, prev) => {
      if (!untrack(isControlled) && uncontrolledInitialized && !Object.is(prev, value)) {
        onChange(value);
      }
      uncontrolledInitialized = true;
    },
  );

  // Sync internal state for controlled components so the reducer is called
  // with the correct state values.
  createEffect(
    () => getControlled(),
    (controlledValue) => {
      if (controlledValue === undefined) return;
      if (
        !Object.is(
          controlledValue,
          untrack(() => internalState().state),
        )
      ) {
        dispatch({ type: SYNC_STATE, state: controlledValue } as unknown as A);
      }
    },
  );

  const state = () =>
    isControlled() ? { ...untrack(internalState), state: getControlled() as T } : internalState();

  return [state, dispatch];
}
