import type { JSX } from "@solidjs/web";
import type { Responsive } from "../breakpoints";

type BooleanPropDef = {
  type: "boolean";
  default?: boolean | undefined;
  required?: boolean | undefined;
};
type StringPropDef = {
  type: "string";
  default?: string | undefined;
  required?: boolean | undefined;
};
type StringOrNumberPropDef = {
  type: "string | number";
  default?: string | number | undefined;
  required?: boolean | undefined;
};
type ReactNodePropDef = {
  type: "ReactNode";
  default?: JSX.Element | undefined;
  required?: boolean | undefined;
};
type EnumPropDef<T> = {
  type: "enum";
  values: readonly T[];
  default?: T | undefined;
  required?: boolean | undefined;
};

type RegularPropDef<T> =
  | BooleanPropDef
  | StringPropDef
  | StringOrNumberPropDef
  | ReactNodePropDef
  | EnumPropDef<T>;
type ResponsivePropDef<T = any> = RegularPropDef<T> & { responsive: true };
/** Describes one component prop: its type, values, default, and responsive-ness. */
type PropDef<T = any> = RegularPropDef<T> | ResponsivePropDef<T>;

// prettier-ignore
type GetPropDefType<Def> =
  Def extends BooleanPropDef ? (Def extends ResponsivePropDef ? Responsive<boolean> : boolean)
  : Def extends StringPropDef ? (Def extends ResponsivePropDef ? Responsive<string> : string)
  : Def extends StringOrNumberPropDef ? (Def extends ResponsivePropDef ? Responsive<string | number> : string | number)
  : Def extends ReactNodePropDef ? (Def extends ResponsivePropDef ? Responsive<JSX.Element> : JSX.Element)
  : Def extends EnumPropDef<infer Type> ? (Def extends ResponsivePropDef<infer Type> ? Responsive<Type> : Type)
  : never;

/** Resolves a prop-def map to the corresponding props object type. */
type GetPropDefTypes<P> = {
  [K in keyof P]?: GetPropDefType<P[K]> | undefined;
};

export type { GetPropDefTypes, PropDef };
