import { flush, omit, type Component } from "solid-js";
import { Dynamic, type JSX } from "@solidjs/web";
import { createSlot } from "@solidix/slot";
import type { Ref } from "@solidix/compose-refs";

const NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul",
] as const;

interface ElementMap {
  a: HTMLAnchorElement;
  button: HTMLButtonElement;
  div: HTMLDivElement;
  form: HTMLFormElement;
  h2: HTMLHeadingElement;
  h3: HTMLHeadingElement;
  img: HTMLImageElement;
  input: HTMLInputElement;
  label: HTMLLabelElement;
  li: HTMLLIElement;
  nav: HTMLElement;
  ol: HTMLOListElement;
  p: HTMLParagraphElement;
  select: HTMLSelectElement;
  span: HTMLSpanElement;
  svg: SVGSVGElement;
  ul: HTMLUListElement;
}

type Primitives = { [E in (typeof NODES)[number]]: Component<PrimitivePropsWithRef<E>> };
/** Props for a primitive element of the given tag, with support for an element ref. */
type PrimitivePropsWithRef<E extends (typeof NODES)[number]> = Omit<
  JSX.IntrinsicElements[E],
  "ref"
> & {
  asChild?: boolean | undefined;
  ref?: Ref<ElementMap[E]> | undefined;
};

/* -------------------------------------------------------------------------------------------------
 * Primitive
 * -----------------------------------------------------------------------------------------------*/

/** Map of unstyled element components (`Primitive.div`, `Primitive.button`, ...) with `asChild` slot support. */
/* @__NO_SIDE_EFFECTS__ */ const Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node: Component<any> = (props: any) => {
    const rest = omit(props, "asChild", "children", "ref");

    if (typeof window !== "undefined") {
      (window as any)[Symbol.for("radix-ui")] = true;
    }

    return props.asChild ? (
      <Slot {...rest} ref={props.ref}>
        {props.children}
      </Slot>
    ) : (
      <Dynamic component={node} {...rest} ref={props.ref}>
        {props.children}
      </Dynamic>
    );
  };

  return { ...primitive, [node]: Node };
}, {} as Primitives);

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

/**
 * Flush custom event dispatch.
 *
 * Solid batches reactive updates on microtasks. When dispatching a custom event
 * from inside another event handler (which Radix does for e.g. pointer-down
 * → dismiss flows), updates from the inner handlers would otherwise apply a
 * microtask later, unpredictably interleaved with the outer handler. Flushing
 * around the dispatch keeps them predictable - the Solid equivalent of Radix's
 * `ReactDOM.flushSync` wrapper.
 */
function dispatchDiscreteCustomEvent<E extends CustomEvent>(target: E["target"], event: E) {
  if (target) flush(() => target.dispatchEvent(event));
}

/* -----------------------------------------------------------------------------------------------*/

export {
  Primitive,
  //
  Primitive as Root,
  //
  dispatchDiscreteCustomEvent,
};
export type { PrimitivePropsWithRef };
