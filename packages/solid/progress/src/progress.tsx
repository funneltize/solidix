import { createEffect, omit, type Component } from "solid-js";
import { createContextScope, type Scope } from "@soldix/context";
import { Primitive, type PrimitivePropsWithRef } from "@soldix/primitive";

/* -------------------------------------------------------------------------------------------------
 * Progress
 * -----------------------------------------------------------------------------------------------*/

const PROGRESS_NAME = "Progress";
const DEFAULT_MAX = 100;

type ScopedProps<P> = P & { __scopeProgress?: Scope | undefined };
const [createProgressContext, createProgressScope] = createContextScope(PROGRESS_NAME);

type ProgressContextValue = {
  value: () => number | null;
  max: () => number;
};

const [ProgressProvider, useProgressContext] =
  createProgressContext<ProgressContextValue>(PROGRESS_NAME);

type ProgressProps = PrimitivePropsWithRef<"div"> & {
  value?: number | null | undefined;
  max?: number | undefined;
  getValueLabel?: ((value: number, max: number) => string) | undefined;
};

const Progress: Component<ScopedProps<ProgressProps>> = (props) => {
  const rest = omit(props, "__scopeProgress", "value", "max", "getValueLabel", "ref");

  const max = () => (isValidMaxNumber(props.max) ? props.max : DEFAULT_MAX);
  const value = () => {
    const valueProp = props.value ?? null;
    return isValidValueNumber(valueProp, max()) ? valueProp : null;
  };
  const valueNow = () => {
    const current = value();
    return isNumber(current) ? current : undefined;
  };
  const valueLabel = () => {
    const current = value();
    return isNumber(current)
      ? (props.getValueLabel ?? defaultGetValueLabel)(current, max())
      : undefined;
  };

  createEffect(
    () => props.max,
    (maxProp) => {
      if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
        console.error(getInvalidMaxError(`${maxProp}`, PROGRESS_NAME));
      }
    },
  );
  createEffect(
    () => ({ value: props.value ?? null, max: max() }),
    ({ value: valueProp, max: maxProp }) => {
      if (valueProp !== null && !isValidValueNumber(valueProp, maxProp)) {
        console.error(getInvalidValueError(`${valueProp}`, PROGRESS_NAME));
      }
    },
  );

  return (
    <ProgressProvider scope={props.__scopeProgress} value={value} max={max}>
      <Primitive.div
        aria-valuemax={max()}
        aria-valuemin={0}
        aria-valuenow={valueNow()}
        aria-valuetext={valueLabel()}
        role="progressbar"
        data-state={getProgressState(value(), max())}
        data-value={value() ?? undefined}
        data-max={max()}
        {...rest}
        ref={props.ref}
      />
    </ProgressProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ProgressIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = "ProgressIndicator";

type ProgressIndicatorProps = PrimitivePropsWithRef<"div">;

const ProgressIndicator: Component<ScopedProps<ProgressIndicatorProps>> = (props) => {
  const rest = omit(props, "__scopeProgress", "ref");
  const context = useProgressContext(INDICATOR_NAME, props.__scopeProgress);
  return (
    <Primitive.div
      data-state={getProgressState(context.value(), context.max())}
      data-value={context.value() ?? undefined}
      data-max={context.max()}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function getProgressState(value: number | null, maxValue: number) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isValidMaxNumber(max: unknown): max is number {
  // Familiar https://github.com/airbnb/javascript#type-coercion--numbers
  return isNumber(max) && !Number.isNaN(max) && max > 0;
}

function isValidValueNumber(value: unknown, max: number): value is number {
  return isNumber(value) && !Number.isNaN(value) && value <= max && value >= 0;
}

// Split this out for readability
function getInvalidMaxError(propValue: string, componentName: string) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`, only positive numbers are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}

function getInvalidValueError(propValue: string, componentName: string) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`, the \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}

export {
  createProgressScope,
  //
  Progress,
  ProgressIndicator,
  //
  Progress as Root,
  ProgressIndicator as Indicator,
};
export type { ProgressProps, ProgressIndicatorProps };
