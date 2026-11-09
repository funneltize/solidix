// Solidix-native calendar. There is no Radix calendar to port and no
// date library in the tree, so dates are ISO day strings (YYYY-MM-DD):
// serializable, timezone-free, and comparable as plain strings. The
// component follows the WAI grid pattern: one tabbable day, arrow keys
// move by day or week, PageUp and PageDown move by month, Enter or
// Space selects.

import { createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Primitive, ariaBoolean, type PrimitivePropsWithRef } from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/** An ISO day string, YYYY-MM-DD. */
export type CalendarDay = string;

/** A selected range; `end` is undefined while the user is mid-selection. */
export interface CalendarRange {
  /** First day of the range. */
  start: CalendarDay;
  /** Last day of the range, once chosen. */
  end?: CalendarDay | undefined;
}

const DAY_MS = 86_400_000;

const parseDay = (day: CalendarDay): Date => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, date));
};

const toDay = (date: Date): CalendarDay => date.toISOString().slice(0, 10);

/** Adds days to an ISO day, crossing month and year edges safely. */
export const addDays = (day: CalendarDay, amount: number): CalendarDay =>
  toDay(new Date(parseDay(day).getTime() + amount * DAY_MS));

/** Adds months to an ISO day, clamping the day of month. */
export const addMonths = (day: CalendarDay, amount: number): CalendarDay => {
  const date = parseDay(day);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), last));
  return toDay(target);
};

/** The month containing a day, as YYYY-MM. */
export const monthOf = (day: CalendarDay): string => day.slice(0, 7);

/** Today's ISO day in local time. */
export const today = (): CalendarDay => {
  const now = new Date();
  const local = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return toDay(local);
};

/** Formats an ISO day for display, e.g. "Mar 4, 2026" for en-US. */
export const formatDay = (day: CalendarDay, locale = "en-US"): string =>
  new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseDay(day));

interface MonthGrid {
  month: string;
  label: string;
  weeks: { day: CalendarDay; outside: boolean }[][];
}

const buildMonth = (month: string, weekStartsOn: number, locale: string): MonthGrid => {
  const first = parseDay(`${month}-01`);
  const startOffset = (first.getUTCDay() - weekStartsOn + 7) % 7;
  const start = new Date(first.getTime() - startOffset * DAY_MS);
  const weeks: MonthGrid["weeks"] = [];
  for (let week = 0; week < 6; week += 1) {
    const row: { day: CalendarDay; outside: boolean }[] = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(start.getTime() + (week * 7 + weekday) * DAY_MS);
      const day = toDay(date);
      row.push({ day, outside: monthOf(day) !== month });
    }
    weeks.push(row);
  }
  return {
    month,
    label: new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(first),
    weeks,
  };
};

/** Props for the calendar root. */
export interface CalendarProps extends Omit<PrimitivePropsWithRef<"div">, "children"> {
  /** Selection mode. Defaults to single. */
  mode?: "single" | "range" | undefined;
  /** Selected day (single mode, controlled). */
  value?: CalendarDay | undefined;
  /** Initially selected day (single mode). */
  defaultValue?: CalendarDay | undefined;
  /** Fires with the chosen day (single mode). */
  onValueChange?: ((day: CalendarDay) => void) | undefined;
  /** Selected range (range mode, controlled). */
  range?: CalendarRange | undefined;
  /** Initially selected range (range mode). */
  defaultRange?: CalendarRange | undefined;
  /** Fires with the range as it changes (range mode). */
  onRangeChange?: ((range: CalendarRange) => void) | undefined;
  /** Earliest selectable day. */
  min?: CalendarDay | undefined;
  /** Latest selectable day. */
  max?: CalendarDay | undefined;
  /** Extra per-day disabling, beyond min and max. */
  isDisabled?: ((day: CalendarDay) => boolean) | undefined;
  /** First weekday: 0 Sunday through 6 Saturday. Defaults to 0. */
  weekStartsOn?: number | undefined;
  /** Locale for month and weekday labels. Defaults to en-US. */
  locale?: string | undefined;
}

/**
 * A month grid calendar with single or range selection. Header buttons
 * page by month; the day grid is fully keyboard navigable. Out-of-month
 * days render muted but stay focusable, matching native calendars.
 */
export const Calendar: Component<CalendarProps> = (props) => {
  const locale = () => props.locale ?? "en-US";
  const weekStartsOn = () => props.weekStartsOn ?? 0;
  const [value, setValue] = useControllableState({
    prop: () => props.value,
    onChange: (next: CalendarDay | undefined) => {
      if (next) props.onValueChange?.(next);
    },
    defaultProp: props.defaultValue,
    caller: "Calendar",
  });
  const [range, setRange] = useControllableState({
    prop: () => props.range,
    onChange: (next: CalendarRange | undefined) => {
      if (next) props.onRangeChange?.(next);
    },
    defaultProp: props.defaultRange,
    caller: "Calendar",
  });
  const initialDay = () => props.defaultValue ?? props.defaultRange?.start ?? today();
  const [visibleMonth, setVisibleMonth] = createSignal(monthOf(initialDay()));
  const [focusedDay, setFocusedDay] = createSignal<CalendarDay>(initialDay());
  let gridRef: HTMLTableElement | undefined;

  const isDisabled = (day: CalendarDay) =>
    (props.min !== undefined && day < props.min) ||
    (props.max !== undefined && day > props.max) ||
    (props.isDisabled?.(day) ?? false);
  const isSelected = (day: CalendarDay) =>
    props.mode === "range" ? range()?.start === day || range()?.end === day : value() === day;
  const isInRange = (day: CalendarDay) => {
    const active = range();
    return Boolean(props.mode === "range" && active?.end && day > active.start && day < active.end);
  };
  const select = (day: CalendarDay) => {
    if (isDisabled(day)) return;
    if (props.mode === "range") {
      const active = range();
      if (!active || active.end || day < active.start) setRange({ start: day });
      else setRange({ start: active.start, end: day });
    } else {
      setValue(day);
    }
  };
  const focusDay = (day: CalendarDay) => {
    setFocusedDay(day);
    setVisibleMonth(monthOf(day));
    requestAnimationFrame(() => {
      gridRef?.querySelector<HTMLElement>(`[data-day="${day}"]`)?.focus();
    });
  };
  const onGridKeyDown = (event: KeyboardEvent) => {
    const current = focusedDay();
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusDay(addDays(current, 1));
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusDay(addDays(current, -1));
        break;
      case "ArrowDown":
        event.preventDefault();
        focusDay(addDays(current, 7));
        break;
      case "ArrowUp":
        event.preventDefault();
        focusDay(addDays(current, -7));
        break;
      case "PageDown":
        event.preventDefault();
        focusDay(addMonths(current, event.shiftKey ? 12 : 1));
        break;
      case "PageUp":
        event.preventDefault();
        focusDay(addMonths(current, event.shiftKey ? -12 : -1));
        break;
      case "Home":
        event.preventDefault();
        focusDay(addDays(current, -((parseDay(current).getUTCDay() - weekStartsOn() + 7) % 7)));
        break;
      case "End":
        event.preventDefault();
        focusDay(addDays(current, 6 - ((parseDay(current).getUTCDay() - weekStartsOn() + 7) % 7)));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(current);
        break;
    }
  };

  const month = () => buildMonth(visibleMonth(), weekStartsOn(), locale());
  const weekdayLabels = () => {
    const base = new Date(Date.UTC(2024, 0, 7)); // A Sunday.
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale(), { weekday: "short", timeZone: "UTC" }).format(
        new Date(base.getTime() + ((weekStartsOn() + index) % 7) * DAY_MS),
      ),
    );
  };
  const rest = omit(
    props,
    "mode",
    "value",
    "defaultValue",
    "onValueChange",
    "range",
    "defaultRange",
    "onRangeChange",
    "min",
    "max",
    "isDisabled",
    "weekStartsOn",
    "locale",
  );
  return (
    <Primitive.div {...rest} data-calendar="">
      <div data-calendar-header="">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setVisibleMonth(monthOf(addMonths(`${visibleMonth()}-01`, -1)))}
        >
          {"‹"}
        </button>
        <div aria-live="polite" data-calendar-heading="">
          {month().label}
        </div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setVisibleMonth(monthOf(addMonths(`${visibleMonth()}-01`, 1)))}
        >
          {"›"}
        </button>
      </div>
      <table
        ref={(node: HTMLTableElement | null) => {
          gridRef = node ?? undefined;
        }}
        role="grid"
        aria-label={month().label}
        onKeyDown={onGridKeyDown}
      >
        <thead>
          <tr>
            {weekdayLabels().map((label) => (
              <th scope="col" aria-label={label}>
                {label.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month().weeks.map((week) => (
            <tr>
              {week.map(({ day, outside }) => (
                <td role="gridcell" aria-selected={ariaBoolean(isSelected(day))}>
                  <button
                    type="button"
                    data-day={day}
                    data-selected={isSelected(day) ? "" : undefined}
                    data-in-range={isInRange(day) ? "" : undefined}
                    data-today={day === today() ? "" : undefined}
                    data-outside={outside ? "" : undefined}
                    disabled={isDisabled(day)}
                    tabindex={focusedDay() === day ? 0 : -1}
                    aria-label={formatDay(day, locale())}
                    onClick={() => {
                      setFocusedDay(day);
                      select(day);
                    }}
                    onFocus={() => setFocusedDay(day)}
                  >
                    {parseDay(day).getUTCDate()}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Primitive.div>
  );
};

/** Children type accepted by calendar slots, for consumer wrappers. */
export type CalendarChildren = JSX.Element;
