import { createContext, omit, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Theme, type ThemeProps } from "@solidix/frosted";
import { cx } from "@solidix/primitive";

/** Backend density modes. Compact is the SaaS default. */
export type BackendDensity = "compact" | "comfortable";

/** Value shared with backend parts inside a `BackendTheme`. */
export type BackendContextValue = {
  /** Active density for the subtree. */
  density: BackendDensity;
};

const BackendContext = createContext<BackendContextValue>({ density: "compact" });

/** Reads the nearest backend context. Returns compact defaults outside a theme. */
export function useBackend(): BackendContextValue {
  try {
    return useContext(BackendContext);
  } catch {
    return { density: "compact" };
  }
}

/** Props accepted by `BackendTheme`. Extends Frosted `Theme` with density. */
export type BackendThemeProps = Omit<ThemeProps, "children"> & {
  /** Density for the subtree. Defaults to `compact`. */
  density?: BackendDensity | undefined;
  /** Backend subtree content. */
  children?: JSX.Element | undefined;
  /** Extra class on the backend root element. */
  class?: string | undefined;
};

/**
 * Backend theme root: bridges Frosted `Theme` (appearance, accent, dark
 * mode) with backend density. Render once at the app root, inside no
 * other theme, then build the shell with `AppShell`.
 */
export const BackendTheme: Component<BackendThemeProps> = (props) => {
  const density = () => props.density ?? "compact";
  const themeProps = omit(props, "density", "children", "class");
  return (
    <Theme {...themeProps}>
      <BackendContext value={{ get density() { return density(); } }}>
        <div
          data-backend-root=""
          data-backend-theme={props.appearance === "dark" ? "dark" : undefined}
          data-density={density()}
          class={cx("sbx-root", props.class)}
        >
          {props.children}
        </div>
      </BackendContext>
    </Theme>
  );
};
