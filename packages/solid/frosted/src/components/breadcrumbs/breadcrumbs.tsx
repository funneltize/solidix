import {
  createContext,
  createMemo,
  createSignal,
  merge,
  omit,
  Show,
  useContext,
  type Accessor,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { Button, type ButtonProps } from "../button/button";
import {
  DropdownMenu,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
} from "../dropdown-menu/dropdown-menu";
import { Text } from "../text/text";
import { breadcrumbsPropDefs, type BreadcrumbsRootOwnProps } from "./breadcrumbs.props";

/**
 * Chevron separator vendored from upstream `icons.tsx` (`ChevronRightIcon`,
 * 6x10, filled `currentColor`). Hidden from assistive technology: it is
 * purely decorative inside the nav structure.
 */
function BreadcrumbsSeparatorIcon(): JSX.Element {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="currentColor"
      aria-hidden="true"
      class="fui-BreadcrumbsSeparator"
    >
      <path d="M1.25 9.625C1.07422 9.625 0.917969 9.56641 0.800781 9.44922C0.546875 9.21484 0.546875 8.80469 0.800781 8.57031L4.10156 5.25L0.800781 1.94922C0.546875 1.71484 0.546875 1.30469 0.800781 1.07031C1.03516 0.816406 1.44531 0.816406 1.67969 1.07031L5.42969 4.82031C5.68359 5.05469 5.68359 5.46484 5.42969 5.69922L1.67969 9.44922C1.5625 9.56641 1.40625 9.625 1.25 9.625Z" />
    </svg>
  );
}

/**
 * State shared by breadcrumb items: the cascaded accent color plus mount-order
 * registration, which replaces upstream `React.Children.map`/`cloneElement`
 * (Solid has no element descriptors to clone).
 */
interface BreadcrumbsContextValue {
  /** Accent color cascaded from the root. */
  color: Accessor<BreadcrumbsRootOwnProps["color"]>;
  /**
   * Register an item at setup, returning its mount-order index. Indices
   * follow instantiation order, which matches document order.
   */
  registerItem: () => number;
  /** Number of registered items. */
  itemCount: Accessor<number>;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null);

/**
 * Read the breadcrumbs context, or `null` outside a root (or inside a
 * dropdown, which suspends registration so its trigger item is not counted).
 */
function useBreadcrumbsContext(): BreadcrumbsContextValue | null {
  return useContext(BreadcrumbsContext);
}

/** Slot typed for the root `nav` props. */
const BreadcrumbsRootSlot = createSlot<HTMLElement>("Breadcrumbs.Root");
/** Slottable selecting the element-form `render` target for child injection. */
const BreadcrumbsRootSlottable = createSlottable("Breadcrumbs.Root");

/**
 * Props passed to a function-form `render` prop: the caller's nav props with
 * the computed `class`, `data-accent-color`, and `children` applied.
 */
type BreadcrumbsRootRenderProps = PropsWithoutColor<"nav"> & {
  /** Accent color token written as `data-accent-color` on the rendered element. */
  "data-accent-color"?: string | undefined;
};

/** State argument for a function-form `render` prop. */
type BreadcrumbsRootRenderState = Record<string, never>;

/**
 * `render` prop accepted by `Breadcrumbs.Root`, mirroring Base UI `useRender`.
 */
type BreadcrumbsRootRenderProp =
  | JSX.Element
  | ((props: BreadcrumbsRootRenderProps, state: BreadcrumbsRootRenderState) => JSX.Element);

/** Props for `Breadcrumbs.Root`. */
interface BreadcrumbsRootProps
  extends Omit<PropsWithoutColor<"nav">, "ref">,
    BreadcrumbsRootOwnProps {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLElement> | undefined;
  /** Element or render function overriding the default `nav` output. */
  render?: BreadcrumbsRootRenderProp | undefined;
}

/**
 * Breadcrumb trail: a `nav` of items separated by chevrons. The last item
 * without an `onClick` renders as plain text (the current page).
 *
 * Upstream: `breadcrumbs.tsx` (`BreadcrumbsRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const BreadcrumbsRoot: Component<BreadcrumbsRootProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "color");
  const composedRefs = composeRefs(props.ref);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const color = () => props.color ?? breadcrumbsPropDefs.color.default;

  // Mount-order registration for separators and last-item detection. Items
  // register synchronously during setup; `ownedWrite` covers the setup-time
  // write from nested owners.
  let nextIndex = 0;
  const [itemCount, setItemCount] = createSignal(0, { ownedWrite: true });
  const registerItem = () => {
    const index = nextIndex;
    nextIndex += 1;
    setItemCount((count) => Math.max(count, index + 1));
    return index;
  };

  const contextValue: BreadcrumbsContextValue = {
    color,
    registerItem,
    itemCount,
  };

  // The context wraps the children in every branch so items instantiate
  // under the provider. `{props.children}` is read raw (exactly once per
  // rendered branch): resolving through a `children()` memo here would
  // instantiate nested items under this setup's owner instead of the
  // provider, so they would miss registration - context-menu precedent.
  const items = () => (
    <BreadcrumbsContext value={contextValue}>{props.children}</BreadcrumbsContext>
  );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return cx("fui-BreadcrumbsRoot", props.class);
      },
      get "data-accent-color"() {
        return color();
      },
      get children() {
        return items();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as BreadcrumbsRootRenderProps, {});
  }

  if (renderProp) {
    return (
      <BreadcrumbsRootSlot
        {...rest}
        class={cx("fui-BreadcrumbsRoot", props.class)}
        data-accent-color={color()}
        ref={composedRefs}
      >
        <BreadcrumbsRootSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : items())}
        </BreadcrumbsRootSlottable>
      </BreadcrumbsRootSlot>
    );
  }

  return (
    <nav
      {...rest}
      class={cx("fui-BreadcrumbsRoot", props.class)}
      data-accent-color={color()}
      ref={composedRefs}
    >
      {items()}
    </nav>
  );
};

/** Props for `Breadcrumbs.Item`: button props with fixed ghost size-1 styling. */
interface BreadcrumbsItemProps extends Omit<ButtonProps, "variant" | "size"> {}

/**
 * One breadcrumb: a ghost size-1 button, or plain text when it is the last
 * item without an `onClick` (the current page). Receives the root color
 * unless overridden.
 *
 * Upstream: `breadcrumbs.tsx` (`BreadcrumbsItem`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const BreadcrumbsItem: Component<BreadcrumbsItemProps> = (props) => {
  const context = useBreadcrumbsContext();
  const color = () => props.color ?? context?.color();
  const rest = omit(props, "children", "class", "color");

  // Suspended (dropdown trigger) or root-less items stay plain buttons.
  // Single element, no fragment: the dropdown trigger slots onto this.
  if (context === null) {
    return (
      <Button
        size="1"
        variant="ghost"
        color={props.color}
        {...rest}
        class={cx("fui-BreadcrumbsItem", props.class)}
      >
        {props.children}
      </Button>
    );
  }

  // Setup-time registration: instantiation order matches document order.
  const index = context.registerItem();
  const isLast = createMemo(() => context.itemCount() - 1 === index);
  // Only the last registered item without an `onClick` renders as text.
  const renderAsText = () => props.onClick === undefined && isLast();

  return (
    <>
      <Show when={index > 0}>
        <BreadcrumbsSeparatorIcon />
      </Show>
      <Show
        when={renderAsText()}
        fallback={
          <Button
            size="1"
            variant="ghost"
            color={color()}
            {...rest}
            class={cx("fui-BreadcrumbsItem", props.class)}
          >
            {props.children}
          </Button>
        }
      >
        <Text
          render={<div />}
          color={color()}
          size="1"
          class={cx("fui-reset", "fui-BreadcrumbsLastItem", props.class)}
        >
          {props.children}
        </Text>
      </Show>
    </>
  );
};

/** Props for `Breadcrumbs.Dropdown`: menu content props with fixed styling. */
interface BreadcrumbsDropdownProps extends Omit<DropdownMenuContentProps, "variant" | "size"> {}

/**
 * Collapsed breadcrumb: a "..." item opening a dropdown menu with the hidden
 * crumbs. Suspends breadcrumb registration inside so the trigger item is
 * not counted as a crumb.
 *
 * Upstream: `breadcrumbs.tsx` (`BreadcrumbsDropdown`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const BreadcrumbsDropdown: Component<BreadcrumbsDropdownProps> = (props) => {
  const context = useBreadcrumbsContext();
  const index = context?.registerItem() ?? 0;
  const color = () => props.color ?? context?.color();
  const rest = omit(props, "children", "color");

  return (
    <>
      <Show when={index > 0}>
        <BreadcrumbsSeparatorIcon />
      </Show>
      <BreadcrumbsContext value={null}>
        <DropdownMenu.Root>
          {/*
           * `asChild` passes through the frosted trigger to the headless
           * layer, which slots trigger behavior onto the item button
           * (upstream render-prop replacement). Without it the item would
           * nest inside the trigger button.
           */}
          <DropdownMenu.Trigger asChild>
            <BreadcrumbsItem color={color()}>...</BreadcrumbsItem>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content {...rest} size="2" color={color()}>
            {props.children}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </BreadcrumbsContext>
    </>
  );
};

/** Props for `Breadcrumbs.DropdownItem`: menu item props without `color`. */
interface BreadcrumbsDropdownItemProps extends Omit<DropdownMenuItemProps, "color"> {}

/**
 * One entry of a collapsed breadcrumb dropdown.
 *
 * Upstream: `breadcrumbs.tsx` (`BreadcrumbsDropdownItem`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const BreadcrumbsDropdownItem: Component<BreadcrumbsDropdownItemProps> = (props) => (
  <DropdownMenu.Item {...props} />
);

/** Frosted breadcrumbs namespace, matching the upstream `* as Breadcrumbs`. */
const Breadcrumbs = {
  Root: BreadcrumbsRoot,
  Item: BreadcrumbsItem,
  Dropdown: BreadcrumbsDropdown,
  DropdownItem: BreadcrumbsDropdownItem,
};

export {
  Breadcrumbs,
  BreadcrumbsDropdown,
  BreadcrumbsDropdownItem,
  BreadcrumbsItem,
  BreadcrumbsRoot,
};
export type {
  BreadcrumbsDropdownItemProps,
  BreadcrumbsDropdownProps,
  BreadcrumbsItemProps,
  BreadcrumbsRootProps,
  BreadcrumbsRootRenderProp,
  BreadcrumbsRootRenderProps,
  BreadcrumbsRootRenderState,
};
