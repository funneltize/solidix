import { omit, type Component } from "solid-js";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * Toggle
 * -----------------------------------------------------------------------------------------------*/

const NAME = "Toggle";

type ToggleProps = PrimitivePropsWithRef<"button"> & {
  /**
   * The controlled state of the toggle.
   */
  pressed?: boolean | undefined;
  /**
   * The state of the toggle when initially rendered. Use `defaultPressed`
   * if you do not need to control the state of the toggle.
   * @defaultValue false
   */
  defaultPressed?: boolean | undefined;
  /**
   * The callback that fires when the state of the toggle changes.
   */
  onPressedChange?: { bivarianceHack(pressed: boolean): void }["bivarianceHack"] | undefined;
};

/** Renders a two-state button that toggles between pressed and unpressed. */
const Toggle: Component<ToggleProps> = (props) => {
  const rest = omit(props, "pressed", "defaultPressed", "onPressedChange", "ref");

  const [pressed, setPressed] = useControllableState({
    prop: () => props.pressed,
    onChange: props.onPressedChange,
    defaultProp: props.defaultPressed ?? false,
    caller: NAME,
  });

  const handleClick = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onClick, event),
    () => {
      if (!props.disabled) {
        setPressed(!pressed());
      }
    },
  );

  return (
    <Primitive.button
      type="button"
      aria-pressed={ariaBoolean(pressed())}
      data-state={pressed() ? "on" : "off"}
      data-disabled={props.disabled ? "" : undefined}
      {...rest}
      ref={props.ref}
      onClick={handleClick}
    />
  );
};

/* ---------------------------------------------------------------------------------------------- */

export {
  Toggle,
  //
  Toggle as Root,
};
export type { ToggleProps };
