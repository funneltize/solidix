import { Show, createEffect, createSignal, flush, omit, untrack, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clamp } from "@solidix/number";
import { unstable_createCollection as createCollection } from "@solidix/collection";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import { useSize } from "@solidix/use-size";

const Orientation = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type Orientation = (typeof Orientation)[keyof typeof Orientation];
type Direction = (typeof Direction)[keyof typeof Direction];

const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

type SlideDirection = "from-left" | "from-right" | "from-bottom" | "from-top";
const BACK_KEYS: Record<SlideDirection, string[]> = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"],
};

declare global {
  interface FocusOptions {
    /**
     * A boolean value that should be set to `true` to force, or `false` to prevent
     * visible indication that the element is focused. If the property is not
     * specified, a browser will provide visible indication if it determines
     * that this would improve accessibility for users.
     *
     * @see
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#focusvisible
     */
    focusVisible?: boolean | undefined;
  }
}

/* -------------------------------------------------------------------------------------------------
 * Slider
 * -----------------------------------------------------------------------------------------------*/

const SLIDER_NAME = "Slider";

const [Collection, { useCollection, useGetCollection, createCollectionScope }] =
  createCollection<HTMLSpanElement>(SLIDER_NAME);

type ScopedProps<P> = P & { __scopeSlider?: Scope | undefined };
const [createSliderContext, createSliderScope] = createContextScope(SLIDER_NAME, [
  createCollectionScope,
]);

type SliderContextValue = {
  name: () => string | undefined;
  disabled: () => boolean | undefined;
  min: () => number;
  max: () => number;
  values: () => number[];
  valueIndexToChangeRef: { current: number };
  thumbs: Set<HTMLSpanElement>;
  orientation: () => Orientation | undefined;
  form: () => string | undefined;
  userRequestedValues: () => number[] | null;
};

const [SliderProvider, useSliderContext] = createSliderContext<SliderContextValue>(SLIDER_NAME);

type SliderProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  style?: JSX.CSSProperties | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  orientation?: Orientation | undefined;
  dir?: Direction | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  minStepsBetweenThumbs?: number | undefined;
  /**
   * When `true`, thumbs keep their relative order and won't cross over one
   * another while dragging. Each thumb is constrained to the values of its
   * neighbors instead of swapping positions when dragged past them.
   *
   * @defaultValue false
   */
  preserveThumbOrder?: boolean | undefined;
  value?: number[] | undefined;
  defaultValue?: number[] | undefined;
  onValueChange?: { bivarianceHack(value: number[]): void }["bivarianceHack"] | undefined;
  onValueCommit?: { bivarianceHack(value: number[]): void }["bivarianceHack"] | undefined;
  inverted?: boolean | undefined;
  form?: string | undefined;
};

const Slider: Component<ScopedProps<SliderProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSlider",
    "name",
    "min",
    "max",
    "step",
    "orientation",
    "disabled",
    "minStepsBetweenThumbs",
    "preserveThumbOrder",
    "defaultValue",
    "value",
    "onValueChange",
    "onValueCommit",
    "inverted",
    "form",
    "onPointerDown",
    "ref",
  );
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const orientation = () => props.orientation ?? Orientation.Horizontal;
  const disabled = () => props.disabled ?? false;
  const minStepsBetweenThumbs = () => props.minStepsBetweenThumbs ?? 0;
  const preserveThumbOrder = () => props.preserveThumbOrder ?? false;
  const inverted = () => props.inverted ?? false;
  const thumbs = new Set<HTMLSpanElement>();
  const valueIndexToChangeRef = { current: 0 };
  let isKeyboardInteraction = false;

  // The values requested by the latest user interaction, used by the bubble
  // input to tell user-driven value changes apart from programmatic ones.
  const [userRequestedValues, setUserRequestedValues] = createSignal<number[] | null>(null);
  const isHorizontal = () => orientation() === Orientation.Horizontal;
  const [control, setControl] = createSignal<HTMLSpanElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setControl);

  const [values, setValues] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? [min()],
    onChange: (value) => {
      const thumbsArray = [...thumbs];
      thumbsArray[valueIndexToChangeRef.current]?.focus({
        preventScroll: true,
        focusVisible: isKeyboardInteraction,
      });
      isKeyboardInteraction = false;
      props.onValueChange?.(value);
    },
    caller: SLIDER_NAME,
  });
  let valuesBeforeSlideStart = untrack(values);

  const initialValues = untrack(values);
  createEffect(
    () => ({ control: control(), form: props.form }),
    ({ control, form }) => {
      const associatedForm = form
        ? control?.ownerDocument.getElementById(form)
        : control?.closest("form");
      if (associatedForm instanceof HTMLFormElement) {
        const reset = () => setValues(initialValues);
        associatedForm.addEventListener("reset", reset);
        return () => associatedForm.removeEventListener("reset", reset);
      }
    },
  );

  function handleSlideStart(value: number) {
    const closestIndex = getClosestValueIndex(values(), value);
    updateValues(value, closestIndex);
  }

  function handleSlideMove(value: number) {
    updateValues(value, valueIndexToChangeRef.current);
  }

  function handleSlideEnd() {
    const hasChanged = String(values()) !== String(valuesBeforeSlideStart);
    if (hasChanged) props.onValueCommit?.(values());
  }

  function updateValues(value: number, atIndex: number, { commit } = { commit: false }) {
    const decimalCount = getDecimalCount(step());
    const snapToStep = roundValue(
      Math.round((value - min()) / step()) * step() + min(),
      decimalCount,
    );
    const nextValue = clamp(snapToStep, [min(), max()]);
    const minStepsDistance = minStepsBetweenThumbs() * step();

    function getNextValues(prevValues: number[]) {
      // When thumb order is preserved, constrain the thumb to its neighbors
      // so it stops at their boundaries (respecting `minStepsBetweenThumbs`)
      // rather than crossing over and being reordered.
      const constrainedValue = preserveThumbOrder()
        ? clamp(nextValue, [
            prevValues[atIndex - 1] === undefined
              ? min()
              : prevValues[atIndex - 1]! + minStepsDistance,
            prevValues[atIndex + 1] === undefined
              ? max()
              : prevValues[atIndex + 1]! - minStepsDistance,
          ])
        : nextValue;

      const nextValues = getNextSortedValues(prevValues, constrainedValue, atIndex);
      if (!hasMinStepsBetweenValues(nextValues, minStepsDistance)) {
        return null;
      }
      return {
        nextValues,
        changedIndex: preserveThumbOrder() ? atIndex : nextValues.indexOf(constrainedValue),
        hasChanged: String(nextValues) !== String(prevValues),
      };
    }

    // Only record interactions that change the value so that pointer moves
    // within a single step don't re-render the slider.
    const requested = getNextValues(values());
    if (requested?.hasChanged) {
      setUserRequestedValues(requested.nextValues);
    }

    setValues((prevValues = []) => {
      const next = getNextValues(prevValues);
      if (!next) {
        return prevValues;
      }
      valueIndexToChangeRef.current = next.changedIndex;
      if (next.hasChanged && commit) {
        props.onValueCommit?.(next.nextValues);
      }
      return next.hasChanged ? next.nextValues : prevValues;
    });

    // Solid 2 batches signal writes on microtasks, so without this a gesture
    // dispatched as back-to-back synchronous events (pointer down/move/up)
    // would read stale values at each step. Drain here so every value
    // mutation in the gesture observes the previous one, like Radix under
    // `act()`. All value mutations flow through this function.
    flush();
  }

  const handlePointerDown = composeEventHandlers(
    (event: PointerEvent) => callEventHandler(props.onPointerDown, event),
    () => {
      if (!disabled()) {
        valuesBeforeSlideStart = values();
        isKeyboardInteraction = false;
      }
    },
  );

  return (
    <SliderProvider
      scope={props.__scopeSlider}
      name={() => props.name}
      disabled={disabled}
      min={min}
      max={max}
      valueIndexToChangeRef={valueIndexToChangeRef}
      thumbs={thumbs}
      values={values}
      orientation={orientation}
      form={() => props.form}
      userRequestedValues={userRequestedValues}
    >
      <Collection.Provider scope={props.__scopeSlider}>
        <Collection.Slot scope={props.__scopeSlider}>
          {(() => {
            const SliderOrientation = isHorizontal() ? SliderHorizontal : SliderVertical;
            return (
              <SliderOrientation
                aria-disabled={disabled() ? "true" : undefined}
                data-disabled={disabled() ? "" : undefined}
                {...rest}
                ref={composedRefs}
                onPointerDown={handlePointerDown}
                min={min()}
                max={max()}
                inverted={inverted()}
                onSlideStart={disabled() ? undefined : handleSlideStart}
                onSlideMove={disabled() ? undefined : handleSlideMove}
                onSlideEnd={disabled() ? undefined : handleSlideEnd}
                onHomeKeyDown={() => {
                  if (!disabled()) {
                    isKeyboardInteraction = true;
                    updateValues(min(), 0, { commit: true });
                  }
                }}
                onEndKeyDown={() => {
                  if (!disabled()) {
                    isKeyboardInteraction = true;
                    updateValues(max(), values().length - 1, { commit: true });
                  }
                }}
                onStepKeyDown={({ event, direction: stepDirection }) => {
                  if (!disabled()) {
                    isKeyboardInteraction = true;
                    const isPageKey = PAGE_KEYS.includes(event.key);
                    const isSkipKey =
                      isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key));
                    const multiplier = isSkipKey ? 10 : 1;
                    const atIndex = valueIndexToChangeRef.current;
                    const value = values()[atIndex]!;
                    const nextValue = getNextStepValue(value, {
                      min: min(),
                      step: step(),
                      direction: stepDirection,
                      multiplier,
                    });
                    updateValues(nextValue, atIndex, { commit: true });
                  }
                }}
              />
            );
          })()}
        </Collection.Slot>
      </Collection.Provider>
    </SliderProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderHorizontal
 * -----------------------------------------------------------------------------------------------*/

type Side = "top" | "right" | "bottom" | "left";

type SliderOrientationContextValue = {
  startEdge: () => Side;
  endEdge: () => Side;
  size: () => "width" | "height";
  direction: () => number;
};

const [SliderOrientationProvider, useSliderOrientationContext] =
  createSliderContext<SliderOrientationContextValue>(SLIDER_NAME, {
    startEdge: () => "left",
    endEdge: () => "right",
    size: () => "width",
    direction: () => 1,
  });

type SliderOrientationPrivateProps = {
  min: number;
  max: number;
  inverted: boolean;
  onSlideStart?: { bivarianceHack(value: number): void }["bivarianceHack"] | undefined;
  onSlideMove?: { bivarianceHack(value: number): void }["bivarianceHack"] | undefined;
  onSlideEnd?: (() => void) | undefined;
  onHomeKeyDown(event: KeyboardEvent): void;
  onEndKeyDown(event: KeyboardEvent): void;
  onStepKeyDown(step: { event: KeyboardEvent; direction: number }): void;
};
type SliderOrientationProps = Omit<SliderImplProps, keyof SliderImplPrivateProps> &
  SliderOrientationPrivateProps;

type SliderHorizontalProps = SliderOrientationProps & {
  dir?: Direction | undefined;
};

const SliderHorizontal: Component<ScopedProps<SliderHorizontalProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSlider",
    "min",
    "max",
    "dir",
    "inverted",
    "onSlideStart",
    "onSlideMove",
    "onSlideEnd",
    "onStepKeyDown",
    "style",
    "ref",
  );
  const sliderRef: RefObject<HTMLSpanElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, sliderRef);
  let rect: DOMRect | undefined;
  const direction = useDirection(props.dir);
  const isDirectionLTR = direction === Direction.LTR;
  const isSlidingFromLeft = () =>
    (isDirectionLTR && !props.inverted) || (!isDirectionLTR && !!props.inverted);

  function getValueFromPointer(pointerPosition: number) {
    const rectValue = rect ?? sliderRef.current!.getBoundingClientRect();
    const input: [number, number] = [0, rectValue.width];
    const output: [number, number] = isSlidingFromLeft()
      ? [props.min, props.max]
      : [props.max, props.min];
    const value = linearScale(input, output);

    rect = rectValue;
    return value(pointerPosition - rectValue.left);
  }

  return (
    <SliderOrientationProvider
      scope={props.__scopeSlider}
      startEdge={() => (isSlidingFromLeft() ? "left" : "right")}
      endEdge={() => (isSlidingFromLeft() ? "right" : "left")}
      direction={() => (isSlidingFromLeft() ? 1 : -1)}
      size={() => "width"}
    >
      <SliderImpl
        __scopeSlider={props.__scopeSlider}
        dir={direction}
        data-orientation="horizontal"
        {...rest}
        ref={composedRefs}
        style={{
          ...props.style,
          "--radix-slider-thumb-transform": "translateX(-50%)",
        }}
        onSlideStart={(event) => {
          const value = getValueFromPointer(event.clientX);
          props.onSlideStart?.(value);
        }}
        onSlideMove={(event) => {
          const value = getValueFromPointer(event.clientX);
          props.onSlideMove?.(value);
        }}
        onSlideEnd={() => {
          rect = undefined;
          props.onSlideEnd?.();
        }}
        onStepKeyDown={(event) => {
          const slideDirection = isSlidingFromLeft() ? "from-left" : "from-right";
          const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
          props.onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 });
        }}
      />
    </SliderOrientationProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderVertical
 * -----------------------------------------------------------------------------------------------*/

type SliderVerticalProps = SliderOrientationProps;

const SliderVertical: Component<ScopedProps<SliderVerticalProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSlider",
    "min",
    "max",
    "inverted",
    "onSlideStart",
    "onSlideMove",
    "onSlideEnd",
    "onStepKeyDown",
    "style",
    "ref",
  );
  const sliderRef: RefObject<HTMLSpanElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, sliderRef);
  let rect: DOMRect | undefined;
  const isSlidingFromBottom = () => !props.inverted;

  function getValueFromPointer(pointerPosition: number) {
    const rectValue = rect ?? sliderRef.current!.getBoundingClientRect();
    const input: [number, number] = [0, rectValue.height];
    const output: [number, number] = isSlidingFromBottom()
      ? [props.max, props.min]
      : [props.min, props.max];
    const value = linearScale(input, output);

    rect = rectValue;
    return value(pointerPosition - rectValue.top);
  }

  return (
    <SliderOrientationProvider
      scope={props.__scopeSlider}
      startEdge={() => (isSlidingFromBottom() ? "bottom" : "top")}
      endEdge={() => (isSlidingFromBottom() ? "top" : "bottom")}
      size={() => "height"}
      direction={() => (isSlidingFromBottom() ? 1 : -1)}
    >
      <SliderImpl
        __scopeSlider={props.__scopeSlider}
        data-orientation="vertical"
        {...rest}
        ref={composedRefs}
        style={{
          ...props.style,
          "--radix-slider-thumb-transform": "translateY(50%)",
        }}
        onSlideStart={(event) => {
          const value = getValueFromPointer(event.clientY);
          props.onSlideStart?.(value);
        }}
        onSlideMove={(event) => {
          const value = getValueFromPointer(event.clientY);
          props.onSlideMove?.(value);
        }}
        onSlideEnd={() => {
          rect = undefined;
          props.onSlideEnd?.();
        }}
        onStepKeyDown={(event) => {
          const slideDirection = isSlidingFromBottom() ? "from-bottom" : "from-top";
          const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
          props.onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 });
        }}
      />
    </SliderOrientationProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderImpl
 * -----------------------------------------------------------------------------------------------*/

type SliderImplPrivateProps = {
  onSlideStart(event: PointerEvent): void;
  onSlideMove(event: PointerEvent): void;
  onSlideEnd(event: PointerEvent): void;
  onHomeKeyDown(event: KeyboardEvent): void;
  onEndKeyDown(event: KeyboardEvent): void;
  onStepKeyDown(event: KeyboardEvent): void;
};
type SliderImplProps = Omit<PrimitivePropsWithRef<"span">, "style"> &
  SliderImplPrivateProps & {
    style?: JSX.CSSProperties | undefined;
  };

const SliderImpl: Component<ScopedProps<SliderImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeSlider",
    "onSlideStart",
    "onSlideMove",
    "onSlideEnd",
    "onHomeKeyDown",
    "onEndKeyDown",
    "onStepKeyDown",
    "onKeyDown",
    "onPointerDown",
    "onPointerMove",
    "onPointerUp",
    "ref",
  );
  const context = useSliderContext(SLIDER_NAME, props.__scopeSlider);

  const handleKeyDown = composeEventHandlers(
    (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
    (event) => {
      if (event.key === "Home") {
        props.onHomeKeyDown(event);
        // Prevent scrolling to page start
        event.preventDefault();
      } else if (event.key === "End") {
        props.onEndKeyDown(event);
        // Prevent scrolling to page end
        event.preventDefault();
      } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
        props.onStepKeyDown(event);
        // Prevent scrolling for directional key presses
        event.preventDefault();
      }
    },
  );

  const handlePointerDown = composeEventHandlers(
    (event: PointerEvent) => callEventHandler(props.onPointerDown, event),
    (event) => {
      const target = event.target as HTMLElement;
      target.setPointerCapture(event.pointerId);
      // Prevent browser focus behaviour because we focus a thumb manually when values change.
      event.preventDefault();
      // Touch devices have a delay before focusing so won't focus if touch immediately moves
      // away from target (sliding). We want thumb to focus regardless.
      if (context.thumbs.has(target)) {
        // Pointer interaction, so avoid showing the focus ring (`:focus-visible`).
        target.focus({ preventScroll: true, focusVisible: false });
      } else {
        props.onSlideStart(event);
      }
    },
  );

  const handlePointerMove = composeEventHandlers(
    (event: PointerEvent) => callEventHandler(props.onPointerMove, event),
    (event) => {
      const target = event.target as HTMLElement;
      if (target.hasPointerCapture(event.pointerId)) props.onSlideMove(event);
    },
  );

  const handlePointerUp = composeEventHandlers(
    (event: PointerEvent) => callEventHandler(props.onPointerUp, event),
    (event) => {
      const target = event.target as HTMLElement;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
        props.onSlideEnd(event);
      }
    },
  );

  return (
    <Primitive.span
      {...rest}
      ref={props.ref}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderTrack
 * -----------------------------------------------------------------------------------------------*/

const TRACK_NAME = "SliderTrack";

type SliderTrackProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

const SliderTrack: Component<ScopedProps<SliderTrackProps>> = (props) => {
  const rest = omit(props, "__scopeSlider", "ref");
  const context = useSliderContext(TRACK_NAME, props.__scopeSlider);
  return (
    <Primitive.span
      data-disabled={context.disabled() ? "" : undefined}
      data-orientation={context.orientation()}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderRange
 * -----------------------------------------------------------------------------------------------*/

const RANGE_NAME = "SliderRange";

type SliderRangeProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

const SliderRange: Component<ScopedProps<SliderRangeProps>> = (props) => {
  const rest = omit(props, "__scopeSlider", "style", "ref");
  const context = useSliderContext(RANGE_NAME, props.__scopeSlider);
  const orientation = useSliderOrientationContext(RANGE_NAME, props.__scopeSlider);
  const percentages = () =>
    context.values().map((value) => convertValueToPercentage(value, context.min(), context.max()));
  const offsetStart = () => (context.values().length > 1 ? Math.min(...percentages()) : 0);
  const offsetEnd = () => 100 - Math.max(...percentages());

  return (
    <Primitive.span
      data-orientation={context.orientation()}
      data-disabled={context.disabled() ? "" : undefined}
      {...rest}
      ref={props.ref}
      style={
        {
          ...props.style,
          [orientation.startEdge()]: `${offsetStart()}%`,
          [orientation.endEdge()]: `${offsetEnd()}%`,
        } as JSX.CSSProperties
      }
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = "SliderThumb";

type SliderThumbContextValue = {
  value: () => number | undefined;
  name: () => string | undefined;
  form: () => string | undefined;
  isFormControl: () => boolean;
  index: () => number;
  thumb: () => HTMLSpanElement | null;
  onThumbChange(thumb: HTMLSpanElement | null): void;
  percent: () => number;
  size: () => { width: number; height: number } | undefined;
};

const [SliderThumbContextProvider, useSliderThumbContext] =
  createSliderContext<SliderThumbContextValue>(THUMB_NAME);

/* -------------------------------------------------------------------------------------------------
 * SliderThumbProvider
 * -----------------------------------------------------------------------------------------------*/

const THUMB_PROVIDER_NAME = "SliderThumbProvider";

type SliderThumbProviderProps = {
  name?: string | undefined;
  children?: JSX.Element | undefined;
};

type SliderThumbProviderInternalProps = SliderThumbProviderProps & {
  internal_do_not_use_render?: ((context: SliderThumbContextValue) => JSX.Element) | undefined;
};

const SliderThumbProviderInternal: Component<ScopedProps<SliderThumbProviderInternalProps>> = (
  props,
) => {
  const context = useSliderContext(THUMB_PROVIDER_NAME, props.__scopeSlider);
  const collection = useCollection(props.__scopeSlider);
  const getCollection = useGetCollection(props.__scopeSlider);
  const [thumb, setThumb] = createSignal<HTMLSpanElement | null>(null);
  const index = () => {
    // Subscribe to membership changes; the data itself comes from the
    // registry, which ref callbacks keep synchronously populated.
    collection();
    const current = thumb();
    return current
      ? [...getCollection().values()].findIndex((item) => item.element === current)
      : -1;
  };
  const size = useSize(thumb);
  // We set this to true by default so that events bubble to forms without JS (SSR)
  const isFormControl = () => {
    const current = thumb();
    return current ? !!context.form() || !!current.closest("form") : true;
  };
  // We cast because index could be `-1` which would return undefined
  const value = () => context.values()[index()] as number | undefined;
  const name = () =>
    props.name ??
    (context.name() ? context.name() + (context.values().length > 1 ? "[]" : "") : undefined);
  const percent = () => {
    const current = value();
    return current === undefined
      ? 0
      : convertValueToPercentage(current, context.min(), context.max());
  };

  createEffect(
    () => thumb(),
    (current) => {
      if (current) {
        context.thumbs.add(current);
        return () => {
          context.thumbs.delete(current);
        };
      }
    },
  );

  const thumbContext: SliderThumbContextValue = {
    value,
    name,
    form: context.form,
    isFormControl,
    index,
    thumb,
    onThumbChange: setThumb,
    percent,
    size,
  };

  return (
    <SliderThumbContextProvider scope={props.__scopeSlider} {...thumbContext}>
      {isFunction(props.internal_do_not_use_render)
        ? props.internal_do_not_use_render(thumbContext)
        : props.children}
    </SliderThumbContextProvider>
  );
};

const SliderThumbProvider: Component<ScopedProps<SliderThumbProviderProps>> =
  SliderThumbProviderInternal;

/* -------------------------------------------------------------------------------------------------
 * SliderThumbTrigger
 * -----------------------------------------------------------------------------------------------*/

const THUMB_TRIGGER_NAME = "SliderThumbTrigger";

type SliderThumbTriggerProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

const SliderThumbTrigger: Component<ScopedProps<SliderThumbTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeSlider", "onFocus", "style", "ref");
  const context = useSliderContext(THUMB_TRIGGER_NAME, props.__scopeSlider);
  const orientation = useSliderOrientationContext(THUMB_TRIGGER_NAME, props.__scopeSlider);
  const thumbContext = useSliderThumbContext(THUMB_TRIGGER_NAME, props.__scopeSlider);
  const composedRefs = useComposedRefs(props.ref, thumbContext.onThumbChange);
  const label = () => getLabel(thumbContext.index(), context.values().length);
  const thumbInBoundsOffset = () => {
    const orientationSize = thumbContext.size()?.[orientation.size()];
    return orientationSize
      ? getThumbInBoundsOffset(orientationSize, thumbContext.percent(), orientation.direction())
      : 0;
  };

  const handleFocus = composeEventHandlers(
    (event: FocusEvent) => callEventHandler(props.onFocus, event),
    () => {
      context.valueIndexToChangeRef.current = thumbContext.index();
    },
  );

  return (
    <span
      style={
        {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [orientation.startEdge()]: `calc(${thumbContext.percent()}% + ${thumbInBoundsOffset()}px)`,
        } as JSX.CSSProperties
      }
    >
      <Collection.ItemSlot scope={props.__scopeSlider}>
        <Primitive.span
          role="slider"
          aria-label={props["aria-label"] || label()}
          aria-valuemin={context.min()}
          aria-valuenow={thumbContext.value()}
          aria-valuemax={context.max()}
          aria-orientation={context.orientation()}
          data-orientation={context.orientation()}
          data-disabled={context.disabled() ? "" : undefined}
          tabindex={context.disabled() ? undefined : 0}
          {...rest}
          ref={composedRefs}
          /**
           * There will be no value on initial render while we work out the index so we hide thumbs
           * without a value, otherwise SSR will render them in the wrong position before they
           * snap into the correct position during hydration which would be visually jarring for
           * slower connections.
           */
          style={thumbContext.value() === undefined ? { display: "none" } : props.style}
          onFocus={handleFocus}
        />
      </Collection.ItemSlot>
    </span>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type SliderThumbProps = SliderThumbTriggerProps & {
  name?: string | undefined;
};

const SliderThumb: Component<ScopedProps<SliderThumbProps>> = (props) => {
  const rest = omit(props, "__scopeSlider", "name", "ref");
  return (
    <SliderThumbProviderInternal
      __scopeSlider={props.__scopeSlider}
      name={props.name}
      internal_do_not_use_render={(thumbContext) => (
        <>
          <SliderThumbTrigger {...rest} ref={props.ref} __scopeSlider={props.__scopeSlider} />
          {/* `key={index}` in Radix: remount the input when the thumb index
              changes so `defaultValue` stays in sync. */}
          <Show when={thumbContext.isFormControl() && `thumb-${thumbContext.index()}`} keyed>
            <SliderBubbleInput __scopeSlider={props.__scopeSlider} />
          </Show>
        </>
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * SliderBubbleInput
 * -----------------------------------------------------------------------------------------------*/

const BUBBLE_INPUT_NAME = "SliderBubbleInput";

type SliderBubbleInputProps = Omit<PrimitivePropsWithRef<"input">, "value" | "style"> & {
  style?: JSX.CSSProperties | undefined;
};

const SliderBubbleInput: Component<ScopedProps<SliderBubbleInputProps>> = (props) => {
  const rest = omit(props, "__scopeSlider", "onInput", "ref");
  const thumbContext = useSliderThumbContext(BUBBLE_INPUT_NAME, props.__scopeSlider);
  const sliderContext = useSliderContext(BUBBLE_INPUT_NAME, props.__scopeSlider);
  const inputRef: RefObject<HTMLInputElement | null> = { current: null };
  const composedRefs = useComposedRefs(inputRef, props.ref);

  // NOTE: setup must not read `value()` / `userRequestedValues()` - not even
  // under `untrack`. Solid 2 dev wraps components in transparent HMR memos
  // that track bare setup reads as deps, so a signal that resolves after
  // setup (the value is `undefined` until the thumb registers, then snaps
  // to the real value) dirties the memo and re-runs setup once per change,
  // leaking orphan instances whose ref callbacks fire on detached elements.
  // `defaultValue` reads through its own JSX binding memo instead, and the
  // previous-value bookkeeping initializes on the effect's first run (which
  // dispatches nothing - Radix never bubbles on mount).
  let shouldStopInputPropagation = false;
  let firstRun = true;
  let prevValue: number | undefined;
  let handledUserRequestedValues: number[] | null | undefined;
  let prevUserRequestedValues: number[] | null | undefined;

  // Bubble value change to parents (e.g form change event)
  createEffect(
    () => ({
      index: thumbContext.index(),
      value: thumbContext.value(),
      userRequestedValues: sliderContext.userRequestedValues(),
    }),
    ({ index, value, userRequestedValues }) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      if (firstRun) {
        firstRun = false;
        prevValue = value;
        prevUserRequestedValues = userRequestedValues;
        handledUserRequestedValues = userRequestedValues;
        return;
      }

      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputProto, "value") as PropertyDescriptor;
      const setValue = descriptor.set;

      const prev = prevValue;
      const valueChanged = prev !== value;
      prevValue = value;
      const isUserRequestFromThisRender = userRequestedValues !== prevUserRequestedValues;
      prevUserRequestedValues = userRequestedValues;

      if (valueChanged && setValue) {
        const hasUnhandledUserRequest = userRequestedValues !== handledUserRequestedValues;
        handledUserRequestedValues = userRequestedValues;
        // A thumb whose value the request changed is user-driven when its
        // value changes in the same render as the request, even if the
        // controlled parent changed it. A single request can change several
        // thumbs when a drag crosses thumbs and the values are re-sorted.
        // Otherwise the value must match the request, so a parent moving other
        // thumbs or applying the request later stays programmatic unless it
        // applies the requested value.
        const requestedValue = userRequestedValues?.[index];
        const isUserInteraction =
          hasUnhandledUserRequest &&
          ((isUserRequestFromThisRender && requestedValue !== prev) || requestedValue === value);

        shouldStopInputPropagation = !isUserInteraction;
        const inputEvent = new Event("input", { bubbles: true });
        setValue.call(input, value);
        input.dispatchEvent(inputEvent);
        // Solid does not synthesize `onChange` from `input` events the way
        // React does, so notify forms with a bubbling `change` event as well.
        // It always propagates: Radix notifies forms of programmatic changes
        // too (only ancestor `onInput` handlers are gated on user intent).
        input.dispatchEvent(new Event("change", { bubbles: true }));
        shouldStopInputPropagation = false;
      }
    },
  );

  /**
   * We purposefully do not use `type="hidden"` here otherwise forms that
   * wrap it will not be able to access its value via the FormData API.
   *
   * We purposefully do not add the `value` attribute here to allow the value
   * to be set programmatically and bubble to any parent form `onChange` event.
   * Adding the `value` will cause React to consider the programmatic
   * dispatch a duplicate and it will get swallowed.
   */
  return (
    <Primitive.input
      style={{ display: "none" }}
      name={thumbContext.name()}
      form={thumbContext.form()}
      {...rest}
      ref={composedRefs}
      defaultValue={thumbContext.value()}
      onInput={composeEventHandlers(
        (event: Event) => callEventHandler(props.onInput, event),
        (event) => {
          if (shouldStopInputPropagation) {
            event.stopPropagation();
          }
        },
      )}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

function getNextSortedValues(prevValues: number[] = [], nextValue: number, atIndex: number) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}

function convertValueToPercentage(value: number, min: number, max: number) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, [0, 100]);
}

/**
 * Returns a label for each thumb when there are two or more thumbs
 */
function getLabel(index: number, totalValues: number) {
  if (totalValues > 2) {
    return `Value ${index + 1} of ${totalValues}`;
  } else if (totalValues === 2) {
    return ["Minimum", "Maximum"][index];
  } else {
    return undefined;
  }
}

/**
 * Given a `values` array and a `nextValue`, determine which value in
 * the array is closest to `nextValue` and return its index.
 *
 * @example
 * // returns 1
 * getClosestValueIndex([10, 30], 25);
 */
function getClosestValueIndex(values: number[], nextValue: number) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}

/**
 * Offsets the thumb centre point while sliding to ensure it remains
 * within the bounds of the slider when reaching the edges
 */
function getThumbInBoundsOffset(width: number, left: number, direction: number) {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * direction) * direction;
}

/**
 * Gets an array of steps between each value.
 *
 * @example
 * // returns [1, 9]
 * getStepsBetweenValues([10, 11, 20]);
 */
function getStepsBetweenValues(values: number[]) {
  return values.slice(0, -1).map((value, index) => values[index + 1]! - value);
}

/**
 * Verifies the minimum steps between all values is greater than or equal
 * to the expected minimum steps.
 *
 * @example
 * // returns false
 * hasMinStepsBetweenValues([1,2,3], 2);
 *
 * @example
 * // returns true
 * hasMinStepsBetweenValues([1,2,3], 1);
 */
function hasMinStepsBetweenValues(values: number[], minStepsBetweenValues: number) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues);
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}

function getDecimalCount(value: number) {
  if (!Number.isFinite(value)) return 0;

  const str = value.toString();

  // Numbers with a magnitude below 1e-6 (or very large numbers) are serialized
  // in scientific notation (e.g. `1e-7`), so we can't just count the digits
  // after the decimal point.
  // https://github.com/radix-ui/primitives/issues/3852
  if (str.includes("e")) {
    const [coefficient, exponent] = str.split("e");
    const decimalPart = coefficient!.split(".")[1] || "";
    const exponentNum = Number(exponent);
    return Math.max(0, decimalPart.length - exponentNum);
  }

  const decimalPart = str.split(".")[1];
  return decimalPart ? decimalPart.length : 0;
}

function roundValue(value: number, decimalCount: number) {
  const rounder = Math.pow(10, decimalCount);
  return Math.round(value * rounder) / rounder;
}

function getNextStepValue(
  value: number,
  {
    min,
    step,
    direction,
    multiplier,
  }: {
    min: number;
    step: number;
    direction: number;
    multiplier: number;
  },
) {
  const decimalCount = getDecimalCount(step);
  const stepsFromMin = (value - min) / step;
  const nearestSteps = Math.round(stepsFromMin);
  const isAligned =
    roundValue(nearestSteps * step + min, decimalCount) === roundValue(value, decimalCount);

  let nextSteps: number;
  if (isAligned) {
    nextSteps = nearestSteps + multiplier * direction;
  } else if (direction > 0) {
    nextSteps = Math.ceil(stepsFromMin);
  } else {
    nextSteps = Math.floor(stepsFromMin);
  }

  return roundValue(nextSteps * step + min, decimalCount);
}

function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}

export {
  createSliderScope,
  //
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
  SliderThumbProvider,
  SliderThumbTrigger,
  SliderBubbleInput,
  //
  Slider as Root,
  SliderTrack as Track,
  SliderRange as Range,
  SliderThumb as Thumb,
  SliderThumbProvider as ThumbProvider,
  SliderThumbTrigger as ThumbTrigger,
  SliderBubbleInput as BubbleInput,
};
export type {
  SliderProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
  SliderThumbProviderProps,
  SliderThumbTriggerProps,
  SliderBubbleInputProps,
};
