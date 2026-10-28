import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  omit,
  useContext as useSolidContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { DirectionProvider } from "@solidix/direction";
import { createSlot } from "@solidix/slot";
import { cx } from "./helpers/cx";
import { getMatchingGrayColor, themePropDefs } from "./theme-options";
import type { ThemeOptions } from "./theme-options";
import { WithThemeEvents } from "./use-theme-events";

function noop() {}

/** Handler props invoked when a root theme option changes. */
interface ThemeChangeHandlers {
  /** Called with the new appearance after a change. */
  onAppearanceChange?: ((newAppearance: ThemeOptions["appearance"]) => void) | undefined;
  /** Called with the new accent color after a change. */
  onAccentColorChange?: ((newAccentColor: ThemeOptions["accentColor"]) => void) | undefined;
  /** Called with the new gray color after a change. */
  onGrayColorChange?: ((newGrayColor: ThemeOptions["grayColor"]) => void) | undefined;
  /** Called with the new info color after a change. */
  onInfoColorChange?: ((newInfoColor: ThemeOptions["infoColor"]) => void) | undefined;
  /** Called with the new warning color after a change. */
  onWarningColorChange?: ((newWarningColor: ThemeOptions["warningColor"]) => void) | undefined;
  /** Called with the new success color after a change. */
  onSuccessColorChange?: ((newSuccessColor: ThemeOptions["successColor"]) => void) | undefined;
  /** Called with the new danger color after a change. */
  onDangerColorChange?: ((newDangerColor: ThemeOptions["dangerColor"]) => void) | undefined;
}

/** Theme change handlers with `undefined` stripped: the context always provides them. */
type DefinedThemeChangeHandlers = {
  [K in keyof ThemeChangeHandlers]-?: NonNullable<ThemeChangeHandlers[K]>;
};

/** Value shared with nested `Theme` components and theme-aware hooks. */
interface ThemeContextValue extends ThemeOptions, DefinedThemeChangeHandlers {
  /** Concrete gray scale after resolving `auto` against the accent color. */
  resolvedGrayColor: ThemeOptions["grayColor"];
}

const ThemeContext = createContext<ThemeContextValue>();

/** Slot typed for `Theme`'s div props so the `asChild` spread typechecks. */
const ThemeSlot = createSlot<HTMLDivElement>("Theme");

/** Reads the nearest theme context, or `undefined` outside a `Theme`. */
function tryUseThemeContext(): ThemeContextValue | undefined {
  try {
    return useSolidContext(ThemeContext);
  } catch {
    return undefined;
  }
}

/** Returns the nearest theme context, throwing when used outside a `Theme`. */
function useThemeContext(): ThemeContextValue {
  const context = tryUseThemeContext();
  if (!context) throw new Error("`useThemeContext` must be used within a `Theme`");
  return context;
}

/** Base props shared by every theme renderer. */
interface ThemeImplPublicProps
  extends Omit<JSX.IntrinsicElements["div"], "dir" | "ref">, Partial<ThemeOptions> {
  /** Merges theme props onto the child instead of rendering a `div`. */
  asChild?: boolean | undefined;
  /** Marks the theme as the root theme of the page. */
  isRoot?: boolean | undefined;
  /** Forces the themed background on (or off) for this theme. */
  hasBackground?: boolean | undefined;
}

/** Props accepted by the `Theme` component. */
interface ThemeProps extends ThemeImplPublicProps, ThemeChangeHandlers {}

/**
 * Applies a frosted-ui theme to its subtree, syncing the root theme with
 * controlled props and attaching `frosted-ui` classes and data attributes.
 */
const Theme: Component<ThemeProps> = (props) => {
  const parentThemeContext = tryUseThemeContext();

  if (!parentThemeContext) {
    return (
      <DirectionProvider dir="ltr">
        <ThemeRoot {...props} />
      </DirectionProvider>
    );
  }

  return <ThemeImpl {...props} />;
};

/** Props accepted by the internal root `Theme` renderer. */
interface ThemeRootProps extends ThemeImplPublicProps, ThemeChangeHandlers {}

/** Renders the root theme, owning the seven option states. */
const ThemeRoot: Component<ThemeRootProps> = (props) => {
  const appearanceProp = () => props.appearance ?? themePropDefs.appearance.default;
  const accentColorProp = () => props.accentColor ?? themePropDefs.accentColor.default;
  const grayColorProp = () => props.grayColor ?? themePropDefs.grayColor.default;
  const infoColorProp = () => props.infoColor ?? themePropDefs.infoColor.default;
  const warningColorProp = () => props.warningColor ?? themePropDefs.warningColor.default;
  const successColorProp = () => props.successColor ?? themePropDefs.successColor.default;
  const dangerColorProp = () => props.dangerColor ?? themePropDefs.dangerColor.default;

  const [appearance, setAppearance] = createSignal(appearanceProp());
  createEffect(appearanceProp, (next) => {
    setAppearance(next);
  });

  const [accentColor, setAccentColor] = createSignal(accentColorProp());
  createEffect(accentColorProp, (next) => {
    setAccentColor(next);
  });

  const [grayColor, setGrayColor] = createSignal(grayColorProp());
  createEffect(grayColorProp, (next) => {
    setGrayColor(next);
  });

  const [infoColor, setInfoColor] = createSignal(infoColorProp());
  createEffect(infoColorProp, (next) => {
    setInfoColor(next);
  });

  const [warningColor, setWarningColor] = createSignal(warningColorProp());
  createEffect(warningColorProp, (next) => {
    setWarningColor(next);
  });

  const [successColor, setSuccessColor] = createSignal(successColorProp());
  createEffect(successColorProp, (next) => {
    setSuccessColor(next);
  });

  const [dangerColor, setDangerColor] = createSignal(dangerColorProp());
  createEffect(dangerColorProp, (next) => {
    setDangerColor(next);
  });

  createEffect(appearanceProp, (next) => {
    updateThemeAppearanceClass(next);
  });

  const hasBackground = () => props.hasBackground ?? themePropDefs.hasBackground.default;

  const resolvedGrayColor = () => {
    const gray = grayColor();
    return gray === "auto" ? getMatchingGrayColor(accentColor()) : gray;
  };

  const rootProps = omit(
    props,
    "appearance",
    "accentColor",
    "grayColor",
    "infoColor",
    "successColor",
    "warningColor",
    "dangerColor",
    "hasBackground",
  );

  const rootAppearance = () => appearance() as Exclude<ThemeOptions["appearance"], "inherit">;

  return (
    <>
      {appearance() !== "inherit" && (
        <>
          <ExplicitRootAppearanceScript appearance={rootAppearance()} />
          <SyncRootElementAppearance appearance={rootAppearance()} />
        </>
      )}
      {hasBackground() && (
        <style>
          {`.frosted-ui {
  background-color: var(--fui-color-background);
}`}
        </style>
      )}
      <ThemeImpl
        {...rootProps}
        isRoot
        hasBackground={hasBackground()}
        appearance={appearance()}
        accentColor={accentColor()}
        grayColor={resolvedGrayColor()}
        infoColor={infoColor()}
        warningColor={warningColor()}
        successColor={successColor()}
        dangerColor={dangerColor()}
        onAppearanceChange={props.onAppearanceChange ?? setAppearance}
        onAccentColorChange={props.onAccentColorChange ?? setAccentColor}
        onGrayColorChange={props.onGrayColorChange ?? setGrayColor}
        onInfoColorChange={props.onInfoColorChange ?? setInfoColor}
        onWarningColorChange={props.onWarningColorChange ?? setWarningColor}
        onSuccessColorChange={props.onSuccessColorChange ?? setSuccessColor}
        onDangerColorChange={props.onDangerColorChange ?? setDangerColor}
      />
    </>
  );
};

/** Props accepted by the internal nested `Theme` renderer. */
interface ThemeImplProps extends ThemeImplPublicProps, ThemeChangeHandlers {}

/** Renders a nested theme, inheriting unset options from its parent. */
const ThemeImpl: Component<ThemeImplProps> = (props) => {
  const parentThemeContext = tryUseThemeContext();

  const appearance = createMemo(
    () => props.appearance ?? parentThemeContext?.appearance ?? themePropDefs.appearance.default,
  );
  const accentColor = createMemo(
    () => props.accentColor ?? parentThemeContext?.accentColor ?? themePropDefs.accentColor.default,
  );
  const grayColor = createMemo(
    () => props.grayColor ?? parentThemeContext?.grayColor ?? themePropDefs.grayColor.default,
  );
  const infoColor = createMemo(
    () => props.infoColor ?? parentThemeContext?.infoColor ?? themePropDefs.infoColor.default,
  );
  const warningColor = createMemo(
    () =>
      props.warningColor ?? parentThemeContext?.warningColor ?? themePropDefs.warningColor.default,
  );
  const successColor = createMemo(
    () =>
      props.successColor ?? parentThemeContext?.successColor ?? themePropDefs.successColor.default,
  );
  const dangerColor = createMemo(
    () => props.dangerColor ?? parentThemeContext?.dangerColor ?? themePropDefs.dangerColor.default,
  );

  const resolvedGrayColor = createMemo(() => {
    const gray = grayColor();
    return gray === "auto" ? getMatchingGrayColor(accentColor()) : gray;
  });

  const isExplicitAppearance = createMemo(
    () => props.appearance !== undefined && props.appearance !== "inherit",
  );
  const isExplicitGrayColor = createMemo(() => props.grayColor !== undefined);
  const shouldHaveBackground = createMemo(
    () =>
      !props.isRoot &&
      (props.hasBackground === true ||
        (props.hasBackground !== false && (isExplicitAppearance() || isExplicitGrayColor()))),
  );

  const contextValue: ThemeContextValue = {
    get appearance() {
      return appearance();
    },
    get accentColor() {
      return accentColor();
    },
    get grayColor() {
      return grayColor();
    },
    get infoColor() {
      return infoColor();
    },
    get warningColor() {
      return warningColor();
    },
    get successColor() {
      return successColor();
    },
    get dangerColor() {
      return dangerColor();
    },
    get resolvedGrayColor() {
      return resolvedGrayColor();
    },
    get onAppearanceChange() {
      return props.onAppearanceChange ?? noop;
    },
    get onAccentColorChange() {
      return props.onAccentColorChange ?? noop;
    },
    get onGrayColorChange() {
      return props.onGrayColorChange ?? noop;
    },
    get onInfoColorChange() {
      return props.onInfoColorChange ?? noop;
    },
    get onWarningColorChange() {
      return props.onWarningColorChange ?? noop;
    },
    get onSuccessColorChange() {
      return props.onSuccessColorChange ?? noop;
    },
    get onDangerColorChange() {
      return props.onDangerColorChange ?? noop;
    },
  };

  const rest = omit(
    props,
    "asChild",
    "children",
    "isRoot",
    "hasBackground",
    "appearance",
    "accentColor",
    "grayColor",
    "dangerColor",
    "warningColor",
    "successColor",
    "infoColor",
    "onAppearanceChange",
    "onAccentColorChange",
    "onGrayColorChange",
    "onInfoColorChange",
    "onWarningColorChange",
    "onSuccessColorChange",
    "onDangerColorChange",
  );

  const mergedClass = () =>
    cx(
      "frosted-ui",
      {
        light: appearance() === "light" && !props.isRoot,
        dark: appearance() === "dark" && !props.isRoot,
      },
      (rest as { class?: string | undefined }).class,
    );

  return (
    <ThemeContext value={contextValue}>
      {props.isRoot && <WithThemeEvents />}
      {props.asChild ? (
        <ThemeSlot
          {...rest}
          class={mergedClass()}
          data-is-root-theme={props.isRoot ? "true" : "false"}
          data-accent-color={accentColor()}
          data-danger-color={dangerColor()}
          data-warning-color={warningColor()}
          data-success-color={successColor()}
          data-info-color={infoColor()}
          data-gray-color={resolvedGrayColor()}
          data-has-background={shouldHaveBackground() || undefined}
          data-appearance={appearance() === "inherit" ? "inherit" : undefined}
        >
          {props.children}
        </ThemeSlot>
      ) : (
        <div
          {...rest}
          class={mergedClass()}
          data-is-root-theme={props.isRoot ? "true" : "false"}
          data-accent-color={accentColor()}
          data-danger-color={dangerColor()}
          data-warning-color={warningColor()}
          data-success-color={successColor()}
          data-info-color={infoColor()}
          data-gray-color={resolvedGrayColor()}
          data-has-background={shouldHaveBackground() || undefined}
          data-appearance={appearance() === "inherit" ? "inherit" : undefined}
        >
          {props.children}
        </div>
      )}
    </ThemeContext>
  );
};

/** Props accepted by `ReversedTheme`. */
interface ReversedThemeProps extends Omit<ThemeProps, "appearance"> {
  /**
   * Accepted for interface compatibility; the reversed appearance is always
   * computed from the nearest explicit theme or the document.
   */
  appearance?: "inherit" | undefined;
}

/**
 * Renders a theme with the opposite appearance of its surroundings,
 * tracking document class and style changes when nothing is explicit.
 */
const ReversedTheme: Component<ReversedThemeProps> = (props) => {
  const parentThemeContext = tryUseThemeContext();

  const hasExplicitAppearance = createMemo(() => {
    const parentAppearance = parentThemeContext?.appearance;
    return parentAppearance === "light" || parentAppearance === "dark";
  });

  const [domAppearance, setDomAppearance] = createSignal<"light" | "dark">(
    typeof document === "undefined" ? "light" : resolveAppearanceFromDOM(),
  );
  createEffect(hasExplicitAppearance, (explicit) => {
    if (explicit) return;
    const rootElement = document.documentElement;
    setDomAppearance(resolveAppearanceFromDOM());
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class" || mutation.attributeName === "style") {
          setDomAppearance(resolveAppearanceFromDOM());
        }
      }
    });
    observer.observe(rootElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => observer.disconnect();
  });

  const reversedAppearance = createMemo(() => {
    const nearestExplicitAppearance = hasExplicitAppearance()
      ? parentThemeContext?.appearance
      : undefined;
    const baseAppearance =
      nearestExplicitAppearance === "light" || nearestExplicitAppearance === "dark"
        ? nearestExplicitAppearance
        : domAppearance();
    return baseAppearance === "light" ? "dark" : "light";
  });

  return <Theme {...props} appearance={reversedAppearance()} />;
};

/** Props for the root appearance script helpers. */
interface RootAppearanceProps {
  /** Concrete appearance written to the document element. */
  appearance: Exclude<ThemeOptions["appearance"], "inherit">;
}

/** Emits the blocking script that sets the root appearance before paint. */
const ExplicitRootAppearanceScript: Component<RootAppearanceProps> = (props) => {
  const script = `!(function(){try{var d=document.documentElement;var c=d.classList;var m=localStorage.getItem('fui-appearance');var a='${props.appearance}';var u=m==='dark'||(!m&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(u&&a==='inherit'){d.style.colorScheme='dark';if(c.contains('light'))c.remove('light');if(c.contains('light-theme'))c.remove('light-theme');if(!c.contains('dark'))c.add('dark');}else if(!u&&a==='inherit'){d.style.colorScheme='light';if(c.contains('dark'))c.remove('dark');if(c.contains('dark-theme'))c.remove('dark-theme');if(!c.contains('light'))c.add('light');}}catch(e){}})();`;
  return <script>{script}</script>;
};

/** Keeps the document element classes in sync with the root appearance. */
const SyncRootElementAppearance: Component<RootAppearanceProps> = (props) => {
  createEffect(
    () => props.appearance,
    (appearance) => {
      try {
        document.documentElement.style.colorScheme = appearance;
        const classList = document.documentElement.classList;
        const otherAppearance = appearance === "light" ? "dark" : "light";
        if (classList.contains(otherAppearance)) classList.remove(otherAppearance);
        if (!classList.contains(appearance)) classList.add(appearance);
      } catch {
        // ignore errors
      }
    },
  );
  return null;
};

/**
 * Writes `appearance` onto the document element classes, resolving
 * `inherit` from the current DOM, and returns the concrete appearance.
 */
function updateThemeAppearanceClass(appearance: ThemeOptions["appearance"]): "light" | "dark" {
  if (appearance === "inherit") {
    return resolveAppearanceFromDOM();
  }
  const rootElement = document.documentElement;
  rootElement.classList.remove("light", "dark", "light-theme", "dark-theme");
  rootElement.style.colorScheme = appearance;
  rootElement.classList.add(appearance);
  return appearance;
}

/** Resolves the concrete appearance from document classes and styles. */
function resolveAppearanceFromDOM(): "light" | "dark" {
  const rootElement = document.documentElement;
  const rootStyle = getComputedStyle(rootElement);
  if (
    rootElement.classList.contains("light") ||
    rootElement.classList.contains("light-theme") ||
    rootStyle.colorScheme === "light" ||
    (!rootElement.classList.contains("dark") &&
      !rootElement.classList.contains("dark-theme") &&
      rootStyle.colorScheme !== "dark" &&
      window.matchMedia("(prefers-color-scheme: light)").matches)
  ) {
    return "light";
  }
  return "dark";
}

export { ReversedTheme, Theme, updateThemeAppearanceClass, useThemeContext };
export type { ReversedThemeProps, ThemeProps };
