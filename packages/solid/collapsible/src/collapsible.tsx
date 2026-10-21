import { createEffect, createSignal, omit, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useId } from "@solidix/id";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

const COLLAPSIBLE_NAME = "Collapsible";

type ScopedProps<P> = P & { __scopeCollapsible?: Scope | undefined };
/** Creates the collapsible context and composes its scope subtree. */
const [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);

type CollapsibleContextValue = {
  contentId: string;
  disabled: () => boolean | undefined;
  open: () => boolean;
  onOpenToggle(): void;
};

const [CollapsibleProvider, useCollapsibleContext] =
  createCollapsibleContext<CollapsibleContextValue>(COLLAPSIBLE_NAME);

/** Props configuring the collapsible root open state. */
type CollapsibleProps = PrimitivePropsWithRef<"div"> & {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  disabled?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
};

/** Root wrapper that owns the open state and wires trigger to content. */
const Collapsible: Component<ScopedProps<CollapsibleProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeCollapsible",
    "open",
    "defaultOpen",
    "disabled",
    "onOpenChange",
    "ref",
  );

  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: COLLAPSIBLE_NAME,
  });

  const contentId = useId();
  const handleOpenToggle = () => setOpen((prevOpen) => !prevOpen);

  return (
    <CollapsibleProvider
      scope={props.__scopeCollapsible}
      disabled={() => props.disabled}
      contentId={contentId}
      open={open}
      onOpenToggle={handleOpenToggle}
    >
      <Primitive.div
        data-state={getState(open())}
        data-disabled={props.disabled ? "" : undefined}
        {...rest}
        ref={props.ref}
      />
    </CollapsibleProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "CollapsibleTrigger";

/** Props for the button that toggles the collapsible. */
type CollapsibleTriggerProps = PrimitivePropsWithRef<"button">;

/** Button that toggles the collapsible open state. */
const CollapsibleTrigger: Component<ScopedProps<CollapsibleTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeCollapsible", "onClick", "ref");
  const context = useCollapsibleContext(TRIGGER_NAME, props.__scopeCollapsible);

  const handleClick = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onClick, event),
    context.onOpenToggle,
  );

  return (
    <Primitive.button
      type="button"
      aria-controls={context.open() ? context.contentId : undefined}
      aria-expanded={ariaBoolean(context.open() || false)}
      data-state={getState(context.open())}
      data-disabled={context.disabled() ? "" : undefined}
      disabled={context.disabled()}
      {...rest}
      ref={props.ref}
      onClick={handleClick}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "CollapsibleContent";

/** Props for the collapsible content region. */
type CollapsibleContentProps = Omit<CollapsibleContentImplProps, "present"> & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
};

/** Region that mounts its content only while the collapsible is open. */
const CollapsibleContent: Component<ScopedProps<CollapsibleContentProps>> = (props) => {
  const rest = omit(props, "__scopeCollapsible", "forceMount", "ref");
  const context = useCollapsibleContext(CONTENT_NAME, props.__scopeCollapsible);
  return (
    <Presence present={() => props.forceMount || context.open()}>
      {({ present }) => (
        <CollapsibleContentImpl
          {...rest}
          __scopeCollapsible={props.__scopeCollapsible}
          ref={props.ref}
          present={present}
        />
      )}
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type CollapsibleContentImplProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  present: () => boolean;
  style?: JSX.CSSProperties | undefined;
};

const CollapsibleContentImpl: Component<ScopedProps<CollapsibleContentImplProps>> = (props) => {
  const rest = omit(props, "__scopeCollapsible", "present", "children", "style", "ref");
  const context = useCollapsibleContext(CONTENT_NAME, props.__scopeCollapsible);
  const [isPresent, setIsPresent] = createSignal(props.present());
  let node: HTMLDivElement | null = null;
  const composedRefs = useComposedRefs(props.ref, (element: HTMLDivElement | null) => {
    node = element;
  });
  const [height, setHeight] = createSignal(0);
  const [width, setWidth] = createSignal(0);
  // when opening we want it to immediately open to retrieve dimensions
  // when closing we delay `present` to retrieve dimensions before closing
  const isOpen = () => context.open() || isPresent();
  let mountAnimationPrevented = isOpen();
  let originalStyles: { transitionDuration: string; animationName: string } | undefined;

  onSettled(() => {
    const rAF = requestAnimationFrame(() => (mountAnimationPrevented = false));
    return () => cancelAnimationFrame(rAF);
  });

  createEffect(
    () => ({ open: context.open(), present: props.present() }),
    /**
     * depends on `context.open` because it will change to `false`
     * when a close is triggered but `present` will be `false` on
     * animation end (so when close finishes). This allows us to
     * retrieve the dimensions *before* closing.
     */
    ({ present }) => {
      const element = node;
      if (element) {
        originalStyles = originalStyles || {
          transitionDuration: element.style.transitionDuration,
          animationName: element.style.animationName,
        };
        // block any animations/transitions so the element renders at its full dimensions
        element.style.transitionDuration = "0s";
        element.style.animationName = "none";

        // get width and height from full dimensions
        const rect = element.getBoundingClientRect();
        setHeight(rect.height);
        setWidth(rect.width);

        // kick off any animations/transitions that were originally set up if it isn't the initial mount
        if (!mountAnimationPrevented) {
          element.style.transitionDuration = originalStyles.transitionDuration;
          element.style.animationName = originalStyles.animationName;
        }

        setIsPresent(present);
      }
    },
  );

  return (
    <Primitive.div
      data-state={getState(context.open())}
      data-disabled={context.disabled() ? "" : undefined}
      id={context.contentId}
      hidden={!isOpen()}
      {...rest}
      ref={composedRefs}
      style={{
        "--radix-collapsible-content-height": height() ? `${height()}px` : undefined,
        "--radix-collapsible-content-width": width() ? `${width()}px` : undefined,
        ...props.style,
      }}
    >
      {isOpen() && props.children}
    </Primitive.div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

function getState(open?: boolean) {
  return open ? "open" : "closed";
}

export {
  createCollapsibleScope,
  //
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  //
  Collapsible as Root,
  CollapsibleTrigger as Trigger,
  CollapsibleContent as Content,
};
export type { CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps };
