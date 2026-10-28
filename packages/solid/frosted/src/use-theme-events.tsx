import { createEffect, onSettled } from "solid-js";
import { useThemeContext } from "./theme";
import { themePropDefs } from "./theme-options";
import type { ThemeOptions } from "./theme-options";

/** True when `value` is a valid `themePropDefs` value for `key`. */
function validateThemeColor<K extends Exclude<keyof typeof themePropDefs, "hasBackground">>(
  key: K,
  value: unknown,
): value is (typeof themePropDefs)[K]["values"][number] {
  const validValues = themePropDefs[key].values as readonly unknown[];
  return validValues.includes(value);
}

/** Picks the valid theme options out of an unknown event detail. */
function validateThemeOptions(detail: unknown): Partial<ThemeOptions> {
  if (typeof detail !== "object" || !detail) return {};

  const ret: Partial<ThemeOptions> = {};

  const keysToCheck: readonly (keyof ThemeOptions)[] = [
    "accentColor",
    "appearance",
    "dangerColor",
    "grayColor",
    "infoColor",
    "successColor",
    "warningColor",
  ];

  for (const key of keysToCheck) {
    if (!(key in detail)) continue;

    const value: unknown = (detail as Record<string, unknown>)[key];
    if (!validateThemeColor(key, value)) {
      console.warn(`Invalid value for ${key}: ${String(value)}`);
      continue;
    }
    ret[key] = value as never;
  }

  return ret;
}

/** Syncs the root theme with `frosted-ui:set-theme` events from outside. */
function useThemeEvents(): void {
  const context = useThemeContext();
  const {
    onAccentColorChange,
    onAppearanceChange,
    onDangerColorChange,
    onGrayColorChange,
    onInfoColorChange,
    onSuccessColorChange,
    onWarningColorChange,
  } = context;

  // Emit an event when the component is mounted.
  // Listen for theme changes from the outside.
  onSettled(() => {
    const listener = (e: Event) => {
      if (e instanceof CustomEvent) {
        const d = validateThemeOptions(e.detail);
        if (d.appearance) onAppearanceChange(d.appearance);
        if (d.accentColor) onAccentColorChange(d.accentColor);
        if (d.grayColor) onGrayColorChange(d.grayColor);
        if (d.infoColor) onInfoColorChange(d.infoColor);
        if (d.successColor) onSuccessColorChange(d.successColor);
        if (d.warningColor) onWarningColorChange(d.warningColor);
        if (d.dangerColor) onDangerColorChange(d.dangerColor);
      }
    };
    document.documentElement.addEventListener("frosted-ui:set-theme", listener);

    // Let external code know that the component is mounted.
    document.documentElement.dispatchEvent(new CustomEvent("frosted-ui:mounted"));

    return () => {
      document.documentElement.removeEventListener("frosted-ui:set-theme", listener);
      document.documentElement.dispatchEvent(new CustomEvent("frosted-ui:unmounted"));
    };
  });

  // Emit an event when the theme is changed.
  createEffect(
    () => ({
      appearance: context.appearance,
      accentColor: context.accentColor,
      grayColor: context.grayColor,
      infoColor: context.infoColor,
      successColor: context.successColor,
      warningColor: context.warningColor,
      dangerColor: context.dangerColor,
    }),
    (detail) => {
      document.documentElement.dispatchEvent(
        new CustomEvent("frosted-ui:on-theme-change", { detail }),
      );
    },
  );
}

/** Mounts `useThemeEvents` inside the root theme. */
function WithThemeEvents() {
  useThemeEvents();
  return null;
}

export { useThemeEvents, validateThemeColor, validateThemeOptions, WithThemeEvents };
