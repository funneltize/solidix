import { createContext, omit, useContext, type Component } from "solid-js";
import {
  Tabs as HeadlessRoot,
  TabsContent as HeadlessContent,
  TabsList as HeadlessList,
  TabsTrigger as HeadlessTrigger,
  type TabsContentProps as HeadlessContentProps,
  type TabsListProps as HeadlessListProps,
  type TabsProps as HeadlessRootProps,
  type TabsTriggerProps as HeadlessTriggerProps,
} from "@solidix/tabs";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import type { BaseTabsListOwnProps } from "../base-tabs-list/base-tabs-list.props";
import { tabsListPropDefs } from "./tabs.props";

/** Context value shared from the tabs root down to its triggers. */
interface TabsContextValue {
  /** Currently selected value, for the selected-state bridge. */
  value: () => string;
}

/** Context carrying the selected value down to tab triggers. */
const TabsContext = createContext<TabsContextValue | undefined>(undefined);

/**
 * Reads the tabs context, returning `undefined` outside a root.
 *
 * @returns The tabs context value, or `undefined` when there is no root.
 */
function useTabsContext(): TabsContextValue | undefined {
  return useContext(TabsContext);
}

/** Props for `Tabs.Root`: headless root props without orientation. */
interface TabsRootProps extends Omit<HeadlessRootProps, "asChild" | "orientation"> {}

/**
 * Tabs state root: manages the active value for the list and panels.
 * Horizontal only (upstream drops `orientation`). Tracks the selected value
 * in a controllable signal so triggers can bridge the `data-selected`
 * attribute the frosted CSS targets (the headless primitive only emits
 * `data-state`).
 *
 * Upstream: `tabs.tsx` (`TabsRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TabsRoot: Component<TabsRootProps> = (props) => {
  const rest = omit(props, "class", "value", "defaultValue", "onValueChange");
  const [value, setValue] = useControllableState<string>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? "",
    onChange: props.onValueChange as ((value: string) => void) | undefined,
    caller: "Tabs",
  });
  return (
    <HeadlessRoot
      {...rest}
      value={value()}
      onValueChange={setValue}
      class={cx("fui-TabsRoot", props.class)}
    >
      <TabsContext value={{ value }}>{props.children}</TabsContext>
    </HeadlessRoot>
  );
};

/** Props for `Tabs.List`. */
interface TabsListProps extends Omit<HeadlessListProps, "asChild">, BaseTabsListOwnProps {}

/**
 * Tab strip: roving-tabindex tablist with size, color, and contrast styling.
 *
 * Upstream: `tabs.tsx` (`TabsList`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TabsList: Component<TabsListProps> = (props) => {
  const size = () => props.size ?? tabsListPropDefs.size.default;
  const color = () => props.color ?? tabsListPropDefs.color.default;
  const highContrast = () => props.highContrast ?? tabsListPropDefs.highContrast.default;
  return (
    <HeadlessList
      {...omit(props, "size", "color", "highContrast", "class")}
      data-accent-color={color()}
      class={cx(
        "fui-BaseTabsList",
        "fui-TabsList",
        props.class,
        `fui-r-size-${size()}`,
        highContrast() ? "fui-high-contrast" : undefined,
      )}
    />
  );
};

/** Props for `Tabs.Trigger`. */
interface TabsTriggerProps extends Omit<HeadlessTriggerProps, "asChild"> {}

/**
 * One tab: wraps the label in an inner span for the active indicator.
 * Sets `data-selected` explicitly because the frosted CSS targets that
 * attribute rather than `data-state`.
 *
 * Upstream: `tabs.tsx` (`TabsTrigger`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TabsTrigger: Component<TabsTriggerProps> = (props) => {
  const context = useTabsContext();
  const selected = () => context?.value() === props.value;
  return (
    <HeadlessTrigger
      {...omit(props, "class", "children")}
      data-selected={selected() ? "" : undefined}
      class={cx("fui-reset", "fui-BaseTabsTrigger", "fui-TabsTrigger", props.class)}
    >
      <span class="fui-BaseTabsTriggerInner fui-TabsTriggerInner">{props.children}</span>
    </HeadlessTrigger>
  );
};

/** Props for `Tabs.Content`. */
interface TabsContentProps extends Omit<HeadlessContentProps, "asChild"> {}

/**
 * Panel for one tab value.
 *
 * Upstream: `tabs.tsx` (`TabsContent`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TabsContent: Component<TabsContentProps> = (props) => (
  <HeadlessContent {...omit(props, "class")} class={cx("fui-TabsContent", props.class)} />
);

/** Frosted tabs namespace, matching the upstream `* as Tabs`. */
const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};

export { Tabs, TabsContent, TabsList, TabsRoot, TabsTrigger };
export type { TabsContentProps, TabsListProps, TabsRootProps, TabsTriggerProps };
