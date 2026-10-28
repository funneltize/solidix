import { children, createContext, merge, omit, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ariaBoolean } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { VisuallyHidden } from "@solidix/visually-hidden";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { Spinner } from "../spinner/spinner";
import { Text, type TextProps } from "../text/text";
import { calloutRootPropDefs, type CalloutRootOwnProps } from "./callout.props";

/** Accent color cascaded from `Callout.Root` to the icon, title, and description. */
type CalloutContextValue = CalloutRootOwnProps;

const CalloutContext = createContext<CalloutContextValue>({});

/** Read the callout color context (empty outside a `Callout.Root`). */
function useCalloutContext(): CalloutContextValue {
  return useContext(CalloutContext);
}

/** Props for `Callout.Root`. */
interface CalloutRootProps extends PropsWithoutColor<"div">, CalloutRootOwnProps {}

/**
 * Callout container: a grid with an icon column and a content column,
 * tinted by the accent color.
 *
 * Upstream: `callout.tsx` (`CalloutRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CalloutRoot: Component<CalloutRootProps> = (props) => {
  const color = () => props.color ?? calloutRootPropDefs.color.default;
  return (
    <div
      data-accent-color={color()}
      {...omit(props, "color", "children", "class")}
      class={cx("fui-CalloutRoot", props.class)}
    >
      <CalloutContext
        value={{
          get color() {
            return color();
          },
        }}
      >
        {props.children}
      </CalloutContext>
    </div>
  );
};

/** Props for `Callout.Icon`. */
interface CalloutIconProps extends PropsWithoutColor<"div"> {}

/**
 * Icon cell of the callout, inheriting the root accent color.
 *
 * Upstream: `callout.tsx` (`CalloutIcon`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CalloutIcon: Component<CalloutIconProps> = (props) => {
  const { color } = useCalloutContext();
  // Div-flavored passthrough into span-typed `Text` props: sound at runtime
  // (the `render` branch forwards to the div) and upstream-identical.
  // Blockquote precedent.
  const textProps = omit(props, "children", "class") as unknown as TextProps;
  return (
    <Text
      render={<div />}
      color={color}
      size="2"
      {...textProps}
      class={cx("fui-CalloutIcon", props.class)}
    >
      {props.children}
    </Text>
  );
};

/** Props for `Callout.Title`. */
type CalloutTitleProps = TextProps;

/**
 * Bold title line of the callout, inheriting the root accent color.
 *
 * Upstream: `callout.tsx` (`CalloutTitle`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CalloutTitle: Component<CalloutTitleProps> = (props) => {
  const { color } = useCalloutContext();
  return (
    <Text
      render={<p />}
      size="2"
      color={color}
      weight="semi-bold"
      highContrast
      {...omit(props, "children", "class")}
      class={cx("fui-CalloutTitle", props.class)}
    >
      {props.children}
    </Text>
  );
};

/** Props for `Callout.Description`. */
type CalloutDescriptionProps = TextProps;

/**
 * Body text of the callout, inheriting the root accent color.
 *
 * Upstream: `callout.tsx` (`CalloutDescription`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CalloutDescription: Component<CalloutDescriptionProps> = (props) => {
  const { color } = useCalloutContext();
  return (
    <Text
      render={<p />}
      size="2"
      color={color}
      {...omit(props, "children", "class")}
      class={cx("fui-CalloutDescription", props.class)}
    >
      {props.children}
    </Text>
  );
};

/** Props for `Callout.Actions`. */
interface CalloutActionsProps extends PropsWithoutColor<"div"> {}

/**
 * Row of action buttons under the callout body.
 *
 * Upstream: `callout.tsx` (`CalloutActions`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CalloutActions: Component<CalloutActionsProps> = (props) => (
  <div {...omit(props, "children", "class")} class={cx("fui-CalloutActions", props.class)}>
    {props.children}
  </div>
);

/** Visual style of a `Callout.Action` button. */
type CalloutActionVariant = "primary" | "secondary";

/** Slot typed for `CalloutAction`'s button props. */
const CalloutActionSlot = createSlot<HTMLButtonElement, JSX.ButtonHTMLAttributes<HTMLButtonElement>>(
  "Callout.Action",
);
/** Slottable selecting the element-form `render` target for child injection. */
const CalloutActionSlottable = createSlottable("Callout.Action");

/**
 * Props passed to a function-form `render` prop: the caller's button props
 * with the computed `class`, `disabled`, `aria-busy`, and `children` applied.
 */
type CalloutActionRenderProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

/** State argument for a function-form `render` prop. */
type CalloutActionRenderState = Record<string, never>;

/**
 * `render` prop accepted by `Callout.Action`, mirroring Base UI `useRender`.
 */
type CalloutActionRenderProp =
  | JSX.Element
  | ((props: CalloutActionRenderProps, state: CalloutActionRenderState) => JSX.Element);

/** Props for `Callout.Action`. */
interface CalloutActionProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "disabled" | "ref"> {
  /** Button style. Defaults to `"primary"`. */
  variant?: CalloutActionVariant | undefined;
  /** Whether the action shows a loading spinner; implies `disabled`. */
  loading?: boolean | undefined;
  /** Whether the button is disabled. Defaults to the value of `loading`. */
  disabled?: boolean | undefined;
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: CalloutActionRenderProp | undefined;
}

/**
 * Action button of the callout, with primary/secondary variants and a
 * loading state that swaps the content for a spinner (base-button pattern).
 * Renders a native `button`: the upstream Base UI `Button` carries no
 * behavior here.
 *
 * Upstream: `callout.tsx` (`CalloutAction`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CalloutAction: Component<CalloutActionProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "ref",
    "render",
    "variant",
    "loading",
    "disabled",
  );
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  const resolvedAgain = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const variant = () => props.variant ?? "primary";
  const loading = () => props.loading ?? false;
  const disabled = () => props.disabled ?? props.loading ?? false;

  const classes = () =>
    cx("fui-reset", "fui-CalloutAction", `fui-variant-${variant()}`, props.class);

  const content = () =>
    loading() ? (
      <>
        {/*
         * Upstream comment: a wrapper sets `visibility: hidden` to hide the
         * button content whilst the `Spinner` shows. The button is a flex
         * container with a `gap`, so `display: contents` keeps the flex
         * layout. However, `display: contents` removes the content from the
         * accessibility tree in some browsers, so it is force-removed with
         * `aria-hidden` and re-added with `VisuallyHidden`.
         */}
        <span style={{ display: "contents", visibility: "hidden" }} aria-hidden="true">
          {resolved()}
        </span>
        <VisuallyHidden>{resolvedAgain()}</VisuallyHidden>
        <span
          style={{
            position: "absolute",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            inset: "0",
          }}
        >
          <Spinner size="2" />
        </span>
      </>
    ) : (
      resolved()
    );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get disabled() {
        return disabled();
      },
      get "data-disabled"() {
        return disabled() || undefined;
      },
      get "aria-busy"() {
        return ariaBoolean(loading() || undefined);
      },
      get children() {
        return content();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CalloutActionRenderProps, {});
  }

  if (renderProp) {
    return (
      <CalloutActionSlot
        {...rest}
        class={classes()}
        disabled={disabled()}
        data-disabled={disabled() || undefined}
        aria-busy={ariaBoolean(loading() || undefined)}
        ref={composedRefs}
      >
        <CalloutActionSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : content())}
        </CalloutActionSlottable>
      </CalloutActionSlot>
    );
  }

  return (
    <button
      {...rest}
      class={classes()}
      disabled={disabled()}
      data-disabled={disabled() || undefined}
      aria-busy={ariaBoolean(loading() || undefined)}
      ref={composedRefs}
    >
      {content()}
    </button>
  );
};

/** Frosted styled callout namespace, matching the upstream `* as Callout`. */
const Callout = {
  Root: CalloutRoot,
  Icon: CalloutIcon,
  Title: CalloutTitle,
  Description: CalloutDescription,
  Actions: CalloutActions,
  Action: CalloutAction,
};

export {
  Callout,
  CalloutAction,
  CalloutActions,
  CalloutDescription,
  CalloutIcon,
  CalloutRoot,
  CalloutTitle,
};
export type {
  CalloutActionProps,
  CalloutActionRenderProp,
  CalloutActionRenderProps,
  CalloutActionRenderState,
  CalloutActionVariant,
  CalloutActionsProps,
  CalloutDescriptionProps,
  CalloutIconProps,
  CalloutRootProps,
  CalloutTitleProps,
};
