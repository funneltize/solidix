import type { Component } from "solid-js";
import { BaseButton, type BaseButtonProps } from "../base-button/index.js";
import { cx } from "../../helpers/cx.js";

/**
 * Props for {@link IconButton}. Identical to {@link BaseButtonProps}; `IconButton`
 * only adds the `fui-IconButton` class for square sizing.
 */
export interface IconButtonProps extends BaseButtonProps {}

/**
 * Square themed button for icon-only content. Thin wrapper over {@link BaseButton}
 * that adds the `fui-IconButton` class. Upstream:
 * `packages/frosted-ui/src/components/icon-button/icon-button.tsx`
 * at whopio/frosted-ui@56787900bfe0.
 */
const IconButton: Component<IconButtonProps> = (props) => {
  return <BaseButton {...props} class={cx("fui-IconButton", props.class)} />;
};

export { IconButton };
