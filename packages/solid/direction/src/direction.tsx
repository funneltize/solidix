import { createContext, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];

const DirectionContext = createContext<Direction | undefined>(undefined);

/* -------------------------------------------------------------------------------------------------
 * Direction
 * -----------------------------------------------------------------------------------------------*/

interface DirectionProviderProps {
  children?: JSX.Element;
  dir: Direction;
}
const DirectionProvider: Component<DirectionProviderProps> = (props) => {
  return <DirectionContext value={props.dir}>{props.children}</DirectionContext>;
};

/* -----------------------------------------------------------------------------------------------*/

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
