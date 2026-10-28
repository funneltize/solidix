import { omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { colorProp } from "../../helpers/props/color.prop";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { Text, type TextProps } from "../text/text";

/** Visual variant of the empty-state media container. */
type EmptyStateMediaVariant = "ghost" | "soft";

/** Accent color for the empty-state media container. */
type EmptyStateMediaColor = GetPropDefTypes<{ color: typeof colorProp }>["color"];

/** Props for `EmptyState.Root`. */
interface EmptyStateRootProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * The root container for an empty state. Renders a `<div>` element.
 *
 * Groups all parts of the empty state with centered flex layout.
 *
 * Upstream: `empty-state.tsx` (`EmptyStateRoot`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const EmptyStateRoot: Component<EmptyStateRootProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const composedRefs = composeRefs(props.ref);

  return <div {...rest} ref={composedRefs} class={cx("fui-EmptyStateRoot", props.class)} />;
};

/** Props for `EmptyState.Header`. */
interface EmptyStateHeaderProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * The header section of an empty state. Renders a `<div>` element.
 *
 * Contains the media, title, and description.
 *
 * Upstream: `empty-state.tsx` (`EmptyStateHeader`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const EmptyStateHeader: Component<EmptyStateHeaderProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const composedRefs = composeRefs(props.ref);

  return <div {...rest} ref={composedRefs} class={cx("fui-EmptyStateHeader", props.class)} />;
};

/** Props for `EmptyState.Media`. */
interface EmptyStateMediaProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
  /**
   * The visual variant of the media container.
   * - `'ghost'` - Transparent background (use for avatars, emojis)
   * - `'soft'` - Subtle accent background with rounded corners
   *
   * @default 'soft'
   */
  variant?: EmptyStateMediaVariant | undefined;
  /** The accent color for the media container. @default 'gray' */
  color?: EmptyStateMediaColor | undefined;
}

/**
 * A container for icons or images in an empty state. Renders a `<div>` element.
 *
 * Upstream: `empty-state.tsx` (`EmptyStateMedia`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const EmptyStateMedia: Component<EmptyStateMediaProps> = (props) => {
  const rest = omit(props, "class", "ref", "variant", "color");
  const composedRefs = composeRefs(props.ref);

  return (
    <div
      ref={composedRefs}
      data-accent-color={props.color ?? "gray"}
      {...rest}
      class={cx("fui-EmptyStateMedia", `fui-variant-${props.variant ?? "soft"}`, props.class)}
    />
  );
};

/** Props for `EmptyState.Title`: the shared `Text` props. */
type EmptyStateTitleProps = TextProps;

/**
 * The title of an empty state. Renders a `<div>` element styled with `<Text>`.
 *
 * Upstream: `empty-state.tsx` (`EmptyStateTitle`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const EmptyStateTitle: Component<EmptyStateTitleProps> = (props) => {
  const rest = omit(props, "class", "size", "weight");
  return (
    <Text
      render={<div />}
      size={props.size ?? "4"}
      weight={props.weight ?? "semi-bold"}
      {...rest}
      class={cx("fui-EmptyStateTitle", props.class)}
    />
  );
};

/** Props for `EmptyState.Description`: the shared `Text` props. */
type EmptyStateDescriptionProps = TextProps;

/**
 * The description text of an empty state. Renders a `<p>` element styled
 * with `<Text>`.
 *
 * Upstream: `empty-state.tsx` (`EmptyStateDescription`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const EmptyStateDescription: Component<EmptyStateDescriptionProps> = (props) => {
  const rest = omit(props, "class", "size", "color");
  return (
    <Text
      render={<p />}
      size={props.size ?? "2"}
      color={props.color ?? "gray"}
      {...rest}
      class={cx("fui-EmptyStateDescription", props.class)}
    />
  );
};

/** Props for `EmptyState.Actions`. */
interface EmptyStateActionsProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A container for actions in an empty state. Renders a `<div>` element.
 *
 * Typically used for buttons or other interactive elements.
 *
 * Upstream: `empty-state.tsx` (`EmptyStateActions`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const EmptyStateActions: Component<EmptyStateActionsProps> = (props) => {
  const rest = omit(props, "class", "ref");
  const composedRefs = composeRefs(props.ref);

  return <div {...rest} ref={composedRefs} class={cx("fui-EmptyStateActions", props.class)} />;
};

/** Frosted empty-state namespace, matching the upstream `* as EmptyState`. */
const EmptyState = {
  Root: EmptyStateRoot,
  Header: EmptyStateHeader,
  Media: EmptyStateMedia,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
};

export {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateRoot,
  EmptyStateTitle,
};
export type {
  EmptyStateActionsProps,
  EmptyStateDescriptionProps,
  EmptyStateHeaderProps,
  EmptyStateMediaColor,
  EmptyStateMediaProps,
  EmptyStateMediaVariant,
  EmptyStateRootProps,
  EmptyStateTitleProps,
};
