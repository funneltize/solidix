import { children, createContext, omit, Show, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Accordion as AccordionPrimitive,
  AccordionContent as AccordionContentPrimitive,
  AccordionHeader as AccordionHeaderPrimitive,
  AccordionItem as AccordionItemPrimitive,
  AccordionTrigger as AccordionTriggerPrimitive,
  type AccordionContentProps as AccordionContentPrimitiveProps,
  type AccordionItemProps as AccordionItemPrimitiveProps,
  type AccordionTriggerProps as AccordionTriggerPrimitiveProps,
} from "@solidix/accordion";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";

/** Context value shared from the accordion root down to its items. */
interface AccordionContextValue {
  /** Expanded item values, for the open-state bridge. */
  value: () => string[];
}

/** Context carrying the expanded values down to triggers and panels. */
const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

/**
 * Reads the accordion context, returning `undefined` outside a root.
 *
 * @returns The accordion context value, or `undefined` when there is no root.
 */
function useAccordionContext(): AccordionContextValue | undefined {
  return useContext(AccordionContext);
}

/** Context value shared from an accordion item down to its parts. */
interface AccordionItemContextValue {
  /** This item's value. */
  value: string;
}

/** Context carrying the item value down to its trigger and panel. */
const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

/**
 * Reads the accordion item context, returning `undefined` outside an item.
 *
 * @returns The accordion item context value, or `undefined` when there is no item.
 */
function useAccordionItemContext(): AccordionItemContextValue | undefined {
  return useContext(AccordionItemContext);
}

/** Props for `Accordion.Root`. */
interface AccordionRootProps {
  /** Expanded item values (controlled mode, always an array). */
  value?: string[] | undefined;
  /** Initially expanded item values (uncontrolled mode). */
  defaultValue?: string[] | undefined;
  /** Callback fired with the expanded values when they change. */
  onValueChange?: ((value: string[]) => void) | undefined;
  /**
   * @deprecated Use `multiple` instead. Kept for backwards compatibility
   * with the radix-ui API.
   */
  type?: "single" | "multiple" | undefined;
  /** Whether several items can expand at once. @default false */
  multiple?: boolean | undefined;
  /** Whether the accordion is disabled from user interaction. */
  disabled?: boolean | undefined;
  /** Layout orientation for keyboard navigation. @default 'vertical' */
  orientation?: "horizontal" | "vertical" | undefined;
  /** Additional class merged after the upstream class. */
  class?: string | undefined;
  /** Accordion items. */
  children?: JSX.Element | undefined;
}

/**
 * Accordion state root. Bridges the upstream array value semantics onto
 * the headless single/multiple accordion; single mode stays collapsible
 * (Base UI items always toggle). Tracks the expanded values in a
 * controllable signal so triggers and panels can bridge the open state
 * (the headless `forceMount` path leaves hiding to the consumer, matching
 * Base UI `keepMounted` only once the panel passes `hidden` itself).
 *
 * Upstream: `accordion.tsx` (`AccordionRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const AccordionRoot: Component<AccordionRootProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "type",
    "multiple",
    "value",
    "defaultValue",
    "onValueChange",
  );
  // Support radix-ui's `type` prop for backwards compatibility.
  const isMultiple = () => props.multiple ?? props.type === "multiple";

  // Mirror (not owner) of the expanded values: the headless primitive keeps
  // owning state so back-to-back toggles never race a controlled round-trip,
  // and the mirror only feeds the open-state bridge plus `onValueChange`.
  const [arrayValue, setArrayValue] = useControllableState<string[]>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? [],
    onChange: props.onValueChange,
    caller: "Accordion",
  });
  const handleSingleChange = (next: string) => {
    setArrayValue(next === "" ? [] : [next]);
  };
  // Plain closures, not inline conditionals: an inline `props.value ? ...`
  // binding memoizes on first read, and the headless primitive first reads
  // `value` inside an effect (PRIMITIVE_IN_EFFECT_CALLBACK). A call
  // expression stays a lazy getter with no binding memo.
  const singleValue = () => (props.value ? (props.value[0] ?? "") : undefined);
  const singleDefaultValue = () => props.defaultValue?.[0];

  const classes = () => cx("fui-AccordionRoot", props.class);

  return (
    <Show
      when={isMultiple()}
      fallback={
        <AccordionPrimitive
          type="single"
          collapsible
          {...rest}
          value={singleValue()}
          defaultValue={singleDefaultValue()}
          onValueChange={handleSingleChange}
          class={classes()}
        >
          <AccordionContext value={{ value: arrayValue }}>
            {props.children}
          </AccordionContext>
        </AccordionPrimitive>
      }
    >
      <AccordionPrimitive
        type="multiple"
        {...rest}
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={setArrayValue}
        class={classes()}
      >
        <AccordionContext value={{ value: arrayValue }}>{props.children}</AccordionContext>
      </AccordionPrimitive>
    </Show>
  );
};

/** Props for `Accordion.Item`. */
interface AccordionItemProps extends Omit<AccordionItemPrimitiveProps, "children"> {
  /** Trigger and content. */
  children?: JSX.Element | undefined;
}

/**
 * One collapsible accordion section.
 *
 * Upstream: `accordion.tsx` (`AccordionItem`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const AccordionItem: Component<AccordionItemProps> = (props) => {
  const rest = omit(props, "children", "class");
  return (
    <AccordionItemPrimitive {...rest} class={cx("fui-AccordionItem", props.class)}>
      <AccordionItemContext value={{ value: props.value }}>
        {props.children}
      </AccordionItemContext>
    </AccordionItemPrimitive>
  );
};

/** Props for `Accordion.Trigger`. */
interface AccordionTriggerProps extends Omit<AccordionTriggerPrimitiveProps, "children"> {
  /** Trigger label. */
  children?: JSX.Element | undefined;
}

/**
 * Accordion header with a chevron trigger button. Sets `data-panel-open`
 * explicitly because the frosted CSS keys the chevron rotation on that
 * attribute rather than `data-state`.
 *
 * Upstream: `accordion.tsx` (`AccordionTrigger`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const AccordionTrigger: Component<AccordionTriggerProps> = (props) => {
  const rest = omit(props, "children", "class");
  const rootContext = useAccordionContext();
  const itemContext = useAccordionItemContext();
  const open = () => rootContext?.value().includes(itemContext?.value ?? "") ?? false;
  return (
    <AccordionHeaderPrimitive class="fui-AccordionHeader">
      <AccordionTriggerPrimitive
        {...rest}
        data-panel-open={open() ? "" : undefined}
        class={cx("fui-AccordionTrigger", "fui-reset", props.class)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="fui-AccordionTriggerIcon"
        >
          <path
            d="M6 12L9.64645 8.35355C9.84171 8.15829 10.1583 8.15829 10.3536 8.35355L14 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        {props.children}
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  );
};

/** Props for `Accordion.Content`. */
interface AccordionContentProps extends Omit<
  AccordionContentPrimitiveProps,
  "children" | "forceMount"
> {
  /** Panel content. */
  children?: JSX.Element | undefined;
  /** Keep the panel mounted while collapsed. @default true */
  keepMounted?: boolean | undefined;
}

/**
 * Collapsible accordion panel with an inner content wrapper (the caller
 * class lands on the inner wrapper, matching upstream). Passes `hidden`
 * while closed: the headless `forceMount` path leaves hiding to the
 * consumer, and upstream Base UI `keepMounted` panels render hidden until
 * their item opens.
 *
 * Upstream: `accordion.tsx` (`AccordionContent`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const AccordionContent: Component<AccordionContentProps> = (props) => {
  const rest = omit(props, "children", "class", "keepMounted");
  const resolved = children(() => props.children);
  const rootContext = useAccordionContext();
  const itemContext = useAccordionItemContext();
  const open = () => rootContext?.value().includes(itemContext?.value ?? "") ?? false;
  return (
    <AccordionContentPrimitive
      {...rest}
      class="fui-AccordionContent"
      forceMount={(props.keepMounted ?? true) ? true : undefined}
      hidden={!open() ? true : undefined}
    >
      <div class={cx("fui-AccordionContentInner", props.class)}>{resolved()}</div>
    </AccordionContentPrimitive>
  );
};

/** Frosted accordion namespace, matching the upstream `* as Accordion`. */
const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};

export { Accordion, AccordionContent, AccordionItem, AccordionRoot, AccordionTrigger };
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionRootProps,
  AccordionTriggerProps,
};
