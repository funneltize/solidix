// Solidix-native styled calendar and date picker, built on
// @solidix/calendar. The picker composes the frosted Popover: a button
// showing the formatted day, and the calendar in the popup.

import { createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Calendar as CalendarPrimitive,
  formatDay,
  type CalendarDay,
  type CalendarProps as CalendarPrimitiveProps,
  type CalendarRange,
} from "@solidix/calendar";
import { cx } from "../../helpers/cx";
import { Popover } from "../popover/popover";

/** Props for the styled calendar. */
export type CalendarProps = CalendarPrimitiveProps;

/** A styled month calendar. Day states ride the primitive data hooks. */
export const Calendar: Component<CalendarProps> = (props) => {
  const rest = omit(props, "class");
  return <CalendarPrimitive {...rest} class={cx("fui-Calendar", props.class)} />;
};

/** Props for the `DatePicker` component. */
export interface DatePickerProps {
  /** Selected day (controlled). */
  value?: CalendarDay | undefined;
  /** Initially selected day. */
  defaultValue?: CalendarDay | undefined;
  /** Fires with the chosen day; the popup closes. */
  onValueChange?: ((day: CalendarDay) => void) | undefined;
  /** Placeholder shown before a day is chosen. */
  placeholder?: string | undefined;
  /** Accessible label for the picker button. */
  label?: string | undefined;
  /** Earliest selectable day. */
  min?: CalendarDay | undefined;
  /** Latest selectable day. */
  max?: CalendarDay | undefined;
  /** Disables the picker. */
  disabled?: boolean | undefined;
  /** Locale for labels. Defaults to en-US. */
  locale?: string | undefined;
}

/**
 * A date field as a popover calendar: the trigger button shows the
 * formatted selection (or the placeholder), and choosing a day closes
 * the popup and reports through `onValueChange`.
 */
export const DatePicker: Component<DatePickerProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [internal, setInternal] = createSignal<CalendarDay | undefined>(props.defaultValue);
  const value = () => props.value ?? internal();
  return (
    <Popover.Root open={open()} onOpenChange={setOpen}>
      <Popover.Trigger>
        <button
          type="button"
          class="fui-DatePickerTrigger"
          disabled={props.disabled}
          aria-label={props.label ?? "Choose a date"}
        >
          <span>
            {value() ? formatDay(value()!, props.locale) : (props.placeholder ?? "Pick a date")}
          </span>
          <span aria-hidden="true">▾</span>
        </button>
      </Popover.Trigger>
      <Popover.Content class="fui-DatePickerContent">
        <Calendar
          value={value()}
          min={props.min}
          max={props.max}
          locale={props.locale}
          onValueChange={(day) => {
            setInternal(day);
            props.onValueChange?.(day);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
};

/** Props for a date range picker built from the same calendar. */
export interface DateRangePickerProps {
  /** Selected range (controlled). */
  range?: CalendarRange | undefined;
  /** Initially selected range. */
  defaultRange?: CalendarRange | undefined;
  /** Fires with the range as it changes; closes once complete. */
  onRangeChange?: ((range: CalendarRange) => void) | undefined;
  /** Placeholder shown before a range is chosen. */
  placeholder?: string | undefined;
  /** Accessible label for the picker button. */
  label?: string | undefined;
  /** Earliest selectable day. */
  min?: CalendarDay | undefined;
  /** Latest selectable day. */
  max?: CalendarDay | undefined;
  /** Locale for labels. Defaults to en-US. */
  locale?: string | undefined;
}

/**
 * A date range field as a popover calendar in range mode. The trigger
 * summarizes the range; the popup closes when both ends are chosen.
 */
export const DateRangePicker: Component<DateRangePickerProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [internal, setInternal] = createSignal<CalendarRange | undefined>(props.defaultRange);
  const range = () => props.range ?? internal();
  const summary = () => {
    const active = range();
    if (!active) return props.placeholder ?? "Pick dates";
    if (!active.end) return `${formatDay(active.start, props.locale)} to ...`;
    return `${formatDay(active.start, props.locale)} to ${formatDay(active.end, props.locale)}`;
  };
  return (
    <Popover.Root open={open()} onOpenChange={setOpen}>
      <Popover.Trigger>
        <button
          type="button"
          class="fui-DatePickerTrigger"
          aria-label={props.label ?? "Choose dates"}
        >
          <span>{summary()}</span>
          <span aria-hidden="true">▾</span>
        </button>
      </Popover.Trigger>
      <Popover.Content class="fui-DatePickerContent">
        <Calendar
          mode="range"
          range={range()}
          min={props.min}
          max={props.max}
          locale={props.locale}
          onRangeChange={(next) => {
            setInternal(next);
            props.onRangeChange?.(next);
            if (next.end) setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
};

/** Re-exported day helpers for consumers building custom fields. */
export type { CalendarDay, CalendarRange };
export type DatePickerChildren = JSX.Element;
