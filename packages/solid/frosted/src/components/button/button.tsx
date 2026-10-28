import type { Component } from "solid-js";
import { BaseButton, type BaseButtonProps } from "../base-button/index.js";
import { cx } from "../../helpers/cx.js";

/**
 * Props for {@link Button}. Identical to {@link BaseButtonProps}; `Button`
 * only adds the `fui-Button` class for size and padding styles.
 */
export interface ButtonProps extends BaseButtonProps {}

/**
 * Themed push button. Thin wrapper over {@link BaseButton} that adds the
 * `fui-Button` class. Upstream: `packages/frosted-ui/src/components/button/button.tsx`
 * at whopio/frosted-ui@56787900bfe0.
 */
const Button: Component<ButtonProps> = (props) => {
  return <BaseButton {...props} class={cx("fui-Button", props.class)} />;
};

export { Button };
