import { createContext, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";

/** Text direction constants for left-to-right and right-to-left layouts. */
const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

/** Text direction value: left-to-right or right-to-left. */
type Direction = (typeof Direction)[keyof typeof Direction];

const DirectionContext = createContext<Direction | undefined>(undefined);

/* -------------------------------------------------------------------------------------------------
 * Direction
 * -----------------------------------------------------------------------------------------------*/

interface DirectionProviderProps {
  children?: JSX.Element;
  dir: Direction;
}
/** Provides the text direction to descendant components. */
const DirectionProvider: Component<DirectionProviderProps> = (props) => {
  return <DirectionContext value={props.dir}>{props.children}</DirectionContext>;
};

/* -----------------------------------------------------------------------------------------------*/

/** Reads the text direction, preferring the local override when provided. */
function useDirection(localDir?: Direction) {
  let globalDir: Direction | undefined;
  try {
    globalDir = useContext(DirectionContext);
  } catch {
    globalDir = undefined;
  }
  return localDir || globalDir || Direction.LTR;
}

export {
  useDirection,
  //
  DirectionProvider as Provider,
  //
  DirectionProvider,
  //
  Direction,
};
