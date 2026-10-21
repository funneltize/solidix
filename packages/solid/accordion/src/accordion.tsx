import { Show, omit, type Component } from "solid-js";
import { unstable_createCollection as createCollection } from "@solidix/collection";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import { useId } from "@solidix/id";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  createCollapsibleScope,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
} from "@solidix/collapsible";

const AccordionType = {
  Single: "single",
  Multiple: "multiple",
} as const;

const Orientation = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type AccordionType = (typeof AccordionType)[keyof typeof AccordionType];
type Orientation = (typeof Orientation)[keyof typeof Orientation];
type Direction = (typeof Direction)[keyof typeof Direction];

/* -------------------------------------------------------------------------------------------------
 * Accordion
 * -----------------------------------------------------------------------------------------------*/

const ACCORDION_NAME = "Accordion";
const ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];

const [Collection, { useGetCollection, createCollectionScope }] =
  createCollection<HTMLButtonElement>(ACCORDION_NAME);

type ScopedProps<P> = P & { __scopeAccordion?: Scope | undefined };
/** Creates a scope so composed `Accordion` parts resolve their own contexts. */
const [createAccordionContext, createAccordionScope] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope,
]);
const useCollapsibleScope = createCollapsibleScope();

/** Props for a single-value `Accordion` that allows one open item. */
type AccordionSingleProps = AccordionImplSingleProps & {
  type: typeof AccordionType.Single;
};
/** Props for a multiple-value `Accordion` that allows several open items. */
type AccordionMultipleProps = AccordionImplMultipleProps & {
  type: typeof AccordionType.Multiple;
};

/** `Accordion` contains the expanded state shared by all accordion parts. */
const Accordion: Component<ScopedProps<AccordionSingleProps | AccordionMultipleProps>> = (
  props,
) => {
  const rest = omit(props, "type", "ref");
  const singleProps = rest as ScopedProps<AccordionImplSingleProps>;
  const multipleProps = rest as ScopedProps<AccordionImplMultipleProps>;
  return (
    <Collection.Provider scope={props.__scopeAccordion}>
      <Show
        when={props.type === AccordionType.Multiple}
        fallback={<AccordionImplSingle {...singleProps} ref={props.ref} />}
      >
        <AccordionImplMultiple {...multipleProps} ref={props.ref} />
      </Show>
    </Collection.Provider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type AccordionValueContextValue = {
  value: () => string[];
  onItemOpen(value: string): void;
  onItemClose(value: string): void;
};

const [AccordionValueProvider, useAccordionValueContext] =
  createAccordionContext<AccordionValueContextValue>(ACCORDION_NAME);

const [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false },
);

type AccordionImplSingleProps = AccordionImplProps & {
  /**
   * The controlled stateful value of the accordion item whose content is expanded.
   */
  value?: string | undefined;
  /**
   * The value of the item whose content is expanded when the accordion is initially rendered. Use
   * `defaultValue` if you do not need to control the state of an accordion.
   */
  defaultValue?: string | undefined;
  /**
   * The callback that fires when the state of the accordion changes.
   */
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
  /**
   * Whether an accordion item can be collapsed after it has been opened.
   * @default false
   */
  collapsible?: boolean | undefined;
};

const AccordionImplSingle: Component<ScopedProps<AccordionImplSingleProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeAccordion",
    "value",
    "defaultValue",
    "onValueChange",
    "collapsible",
    "ref",
  );

  const [value, setValue] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? "",
    onChange: (next) => props.onValueChange?.(next),
    caller: ACCORDION_NAME,
  });

  return (
    <AccordionValueProvider
      scope={props.__scopeAccordion}
      value={() => {
        const current = value();
        return current ? [current] : [];
      }}
      onItemOpen={setValue}
      onItemClose={() => {
        if (props.collapsible) setValue("");
      }}
    >
      <AccordionCollapsibleProvider
        scope={props.__scopeAccordion}
        collapsible={props.collapsible ?? false}
      >
        <AccordionImpl {...rest} ref={props.ref} />
      </AccordionCollapsibleProvider>
    </AccordionValueProvider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type AccordionImplMultipleProps = AccordionImplProps & {
  /**
   * The controlled stateful value of the accordion items whose contents are expanded.
   */
  value?: string[] | undefined;
  /**
   * The value of the items whose contents are expanded when the accordion is initially rendered. Use
   * `defaultValue` if you do not need to control the state of an accordion.
   */
  defaultValue?: string[] | undefined;
  /**
   * The callback that fires when the state of the accordion changes.
   */
  onValueChange?: { bivarianceHack(value: string[]): void }["bivarianceHack"] | undefined;
};

const AccordionImplMultiple: Component<ScopedProps<AccordionImplMultipleProps>> = (props) => {
  const rest = omit(props, "__scopeAccordion", "value", "defaultValue", "onValueChange", "ref");

  const [value, setValue] = useControllableState({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? [],
    onChange: (next) => props.onValueChange?.(next),
    caller: ACCORDION_NAME,
  });

  const handleItemOpen = (itemValue: string) =>
    setValue((prevValue = []) => [...prevValue, itemValue]);

  const handleItemClose = (itemValue: string) =>
    setValue((prevValue = []) => prevValue.filter((value) => value !== itemValue));

  return (
    <AccordionValueProvider
      scope={props.__scopeAccordion}
      value={value}
      onItemOpen={handleItemOpen}
      onItemClose={handleItemClose}
    >
      <AccordionCollapsibleProvider scope={props.__scopeAccordion} collapsible={true}>
        <AccordionImpl {...rest} ref={props.ref} />
      </AccordionCollapsibleProvider>
    </AccordionValueProvider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type AccordionImplContextValue = {
  disabled: () => boolean | undefined;
  direction: () => AccordionImplProps["dir"];
  orientation: () => AccordionImplProps["orientation"];
};

const [AccordionImplProvider, useAccordionContext] =
  createAccordionContext<AccordionImplContextValue>(ACCORDION_NAME);

type AccordionImplProps = PrimitivePropsWithRef<"div"> & {
  /**
   * Whether or not an accordion is disabled from user interaction.
   *
   * @defaultValue false
   */
  disabled?: boolean | undefined;
  /**
   * The layout in which the Accordion operates.
   * @default vertical
   */
  orientation?: Orientation | undefined;
  /**
   * The language read direction.
   */
  dir?: Direction | undefined;
};

const AccordionImpl: Component<ScopedProps<AccordionImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeAccordion",
    "disabled",
    "dir",
    "orientation",
    "onKeyDown",
    "ref",
  );
  const getCollection = useGetCollection(props.__scopeAccordion);
  const direction = useDirection(props.dir);
  const orientation = () => props.orientation ?? Orientation.Vertical;
  const isDirectionLTR = () => direction === Direction.LTR;

  const handleKeyDown = composeEventHandlers(
    (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
    (event) => {
      if (!ACCORDION_KEYS.includes(event.key)) {
        return;
      }
      const collection = getCollection();
      const target = event.target as HTMLElement;
      const triggerCollection = collection.filter(([, item]) => !item.element.disabled);
      const triggerIndex = triggerCollection.findIndex(([, item]) => item.element === target);
      const triggerCount = triggerCollection.size;

      if (triggerIndex === -1) {
        return;
      }

      // Prevents page scroll while user is navigating
      event.preventDefault();

      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;

      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };

      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };

      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation() === Orientation.Horizontal) {
            if (isDirectionLTR()) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation() === Orientation.Vertical) {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation() === Orientation.Horizontal) {
            if (isDirectionLTR()) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation() === Orientation.Vertical) {
            movePrev();
          }
          break;
      }

      const clampedIndex = nextIndex % triggerCount;
      triggerCollection.at(clampedIndex)?.element.focus();
    },
  );

  return (
    <AccordionImplProvider
      scope={props.__scopeAccordion}
      disabled={() => props.disabled}
      direction={() => props.dir}
      orientation={orientation}
    >
      <Collection.Slot scope={props.__scopeAccordion}>
        <Primitive.div
          data-orientation={orientation()}
          {...rest}
          ref={props.ref}
          onKeyDown={props.disabled ? undefined : handleKeyDown}
        />
      </Collection.Slot>
    </AccordionImplProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AccordionItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "AccordionItem";

type AccordionItemContextValue = {
  open: () => boolean;
  disabled: () => boolean | undefined;
  triggerId: string;
};
const [AccordionItemProvider, useAccordionItemContext] =
  createAccordionContext<AccordionItemContextValue>(ITEM_NAME);

/** Props for an Accordion.Item, keyed by its value within the accordion. */
type AccordionItemProps = Omit<CollapsibleProps, "open" | "defaultOpen" | "onOpenChange"> & {
  /**
   * Whether or not an accordion item is disabled from user interaction.
   *
   * @defaultValue false
   */
  disabled?: boolean | undefined;
  /**
   * A string value for the accordion item. All items within an accordion should use a unique value.
   */
  value: string;
};

/**
 * `AccordionItem` contains all of the parts of a collapsible section inside of an `Accordion`.
 */
const AccordionItem: Component<ScopedProps<AccordionItemProps>> = (props) => {
  const rest = omit(props, "__scopeAccordion", "value", "disabled", "ref");
  const accordionContext = useAccordionContext(ITEM_NAME, props.__scopeAccordion);
  const valueContext = useAccordionValueContext(ITEM_NAME, props.__scopeAccordion);
  const collapsibleScope = useCollapsibleScope(props.__scopeAccordion);
  const triggerId = useId();
  const open = () => (props.value && valueContext.value().includes(props.value)) || false;
  const disabled = () => accordionContext.disabled() || props.disabled;

  return (
    <AccordionItemProvider
      scope={props.__scopeAccordion}
      open={open}
      disabled={disabled}
      triggerId={triggerId}
    >
      <Collapsible
        data-orientation={accordionContext.orientation()}
        data-state={getState(open())}
        {...collapsibleScope}
        {...rest}
        ref={props.ref}
        disabled={disabled()}
        open={open()}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            valueContext.onItemOpen(props.value);
          } else {
            valueContext.onItemClose(props.value);
          }
        }}
      />
    </AccordionItemProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AccordionHeader
 * -----------------------------------------------------------------------------------------------*/

const HEADER_NAME = "AccordionHeader";

/** Props for the `AccordionHeader` heading that wraps the trigger. */
type AccordionHeaderProps = PrimitivePropsWithRef<"h3">;

/**
 * `AccordionHeader` contains the content for the parts of an `AccordionItem` that will be visible
 * whether or not its content is collapsed.
 */
const AccordionHeader: Component<ScopedProps<AccordionHeaderProps>> = (props) => {
  const rest = omit(props, "__scopeAccordion", "ref");
  const accordionContext = useAccordionContext(ACCORDION_NAME, props.__scopeAccordion);
  const itemContext = useAccordionItemContext(HEADER_NAME, props.__scopeAccordion);
  return (
    <Primitive.h3
      data-orientation={accordionContext.orientation()}
      data-state={getState(itemContext.open())}
      data-disabled={itemContext.disabled() ? "" : undefined}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * AccordionTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "AccordionTrigger";

/** Props for the button that toggles an accordion item open or closed. */
type AccordionTriggerProps = CollapsibleTriggerProps;

/**
 * `AccordionTrigger` is the trigger that toggles the collapsed state of an `AccordionItem`. It
 * should always be nested inside of an `AccordionHeader`.
 */
const AccordionTrigger: Component<ScopedProps<AccordionTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeAccordion", "ref");
  const accordionContext = useAccordionContext(ACCORDION_NAME, props.__scopeAccordion);
  const itemContext = useAccordionItemContext(TRIGGER_NAME, props.__scopeAccordion);
  const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, props.__scopeAccordion);
  const collapsibleScope = useCollapsibleScope(props.__scopeAccordion);
  return (
    <Collection.ItemSlot scope={props.__scopeAccordion}>
      <CollapsibleTrigger
        aria-disabled={itemContext.open() && !collapsibleContext.collapsible ? "true" : undefined}
        data-orientation={accordionContext.orientation()}
        id={itemContext.triggerId}
        {...collapsibleScope}
        {...rest}
        ref={props.ref}
      />
    </Collection.ItemSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AccordionContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "AccordionContent";

/** Props for the collapsible content region of an accordion item. */
type AccordionContentProps = CollapsibleContentProps;

/**
 * `AccordionContent` contains the collapsible content for an `AccordionItem`.
 */
const AccordionContent: Component<ScopedProps<AccordionContentProps>> = (props) => {
  const rest = omit(props, "__scopeAccordion", "style", "ref");
  const accordionContext = useAccordionContext(ACCORDION_NAME, props.__scopeAccordion);
  const itemContext = useAccordionItemContext(CONTENT_NAME, props.__scopeAccordion);
  const collapsibleScope = useCollapsibleScope(props.__scopeAccordion);
  return (
    <CollapsibleContent
      role="region"
      aria-labelledby={itemContext.triggerId}
      data-orientation={accordionContext.orientation()}
      {...collapsibleScope}
      {...rest}
      ref={props.ref}
      style={{
        "--radix-accordion-content-height": "var(--radix-collapsible-content-height)",
        "--radix-accordion-content-width": "var(--radix-collapsible-content-width)",
        ...props.style,
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

function getState(open?: boolean) {
  return open ? "open" : "closed";
}

export {
  createAccordionScope,
  //
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  //
  Accordion as Root,
  AccordionItem as Item,
  AccordionHeader as Header,
  AccordionTrigger as Trigger,
  AccordionContent as Content,
};
export type {
  AccordionSingleProps,
  AccordionMultipleProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionContentProps,
};
