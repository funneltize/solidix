import { children, merge, omit, onSettled, Show, type Component } from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import { callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import creditCardType from "credit-card-type";
import type {
  CreditCardType as CreditCardTypeInfo,
  CreditCardTypeCardBrandId,
} from "credit-card-type/dist/types";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import {
  FieldContext,
  useFieldContext,
  useFieldRootState,
  type FieldRootProps,
  type FieldValidityState,
} from "../field/field";
import { Text, type TextProps, type TextRenderProp } from "../text/text";
import { useCreditCardContext } from "./credit-card-context";

// ---------------------------------------------------------------------------
// Card number formatting utilities
// ---------------------------------------------------------------------------

const UNKNOWN_CARD_INFO: CreditCardTypeInfo = {
  niceType: "",
  type: "",
  patterns: [],
  gaps: [4, 8, 12],
  lengths: [16],
  code: { size: 3, name: "CVV" },
};

/** Detect card info from digits; unknown unless exactly one brand matches. */
function getCardInfo(digits: string): CreditCardTypeInfo {
  if (!digits) return UNKNOWN_CARD_INFO;
  const results = creditCardType(digits);
  if (results.length === 1) return results[0];
  return UNKNOWN_CARD_INFO;
}

/** Insert spaces into digit runs at the brand's gap positions. */
function formatWithGaps(digits: string, gaps: number[]): string {
  const parts: string[] = [];
  let prev = 0;
  for (const gap of gaps) {
    if (prev >= digits.length) break;
    parts.push(digits.slice(prev, gap));
    prev = gap;
  }
  if (prev < digits.length) {
    parts.push(digits.slice(prev));
  }
  return parts.join(" ");
}

/** Count digits before a cursor offset (for cursor restoration). */
function digitsBeforeCursor(value: string, cursor: number): number {
  let count = 0;
  for (let i = 0; i < cursor && i < value.length; i++) {
    if (/\d/.test(value[i])) count++;
  }
  return count;
}

/** Map a digit count back to a cursor offset in formatted text. */
function cursorAfterFormat(formatted: string, digitCount: number): number {
  let remaining = digitCount;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) remaining--;
    if (remaining <= 0) return i + 1;
  }
  return formatted.length;
}

/** Format raw input as MM/YY, tolerating mid-typing states. */
function formatExpiry(raw: string): string {
  const hasSlash = raw.includes("/");
  const digits = raw.replace(/\D/g, "").slice(0, 4);

  if (hasSlash && digits.length === 1) {
    return "0" + digits + "/";
  }

  if (hasSlash && digits.length === 2) {
    return digits.slice(0, 2) + "/";
  }

  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

/** Slot typed for `CreditCardLogo` div props. */
const LogoSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "CreditCardLogo",
);
/** Slottable selecting the element-form `render` target for child injection. */
const LogoSlottable = createSlottable("CreditCardLogo");

/** State exposed to `CreditCardLogo`'s function-form `render` prop. */
interface CreditCardLogoState {}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class` and `children` applied.
 */
type CreditCardLogoRenderProps = PropsWithoutColor<"div">;

/**
 * `render` prop accepted by `CreditCardLogo`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardLogoRenderProp =
  | JSX.Element
  | ((props: CreditCardLogoRenderProps, state: CreditCardLogoState) => JSX.Element);

/** Props for `CreditCard.Logo`. */
interface CreditCardLogoProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardLogoRenderProp | undefined;
}

/**
 * Slot for an issuer logo overlay on the card face.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardLogo`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardLogo: Component<CreditCardLogoProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardLogo", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardLogoRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <LogoSlot {...rest} class={classes()} ref={composedRefs}>
        <LogoSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </LogoSlottable>
      </LogoSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/** Slot typed for `CreditCardMagStripe` div props. */
const MagStripeSlot = createSlot<
  HTMLDivElement,
  Omit<PropsWithoutColor<"div">, "children" | "ref">
>("CreditCardMagStripe");
/** Slottable selecting the element-form `render` target for child injection. */
const MagStripeSlottable = createSlottable("CreditCardMagStripe");

/** State exposed to `CreditCardMagStripe`'s function-form `render` prop. */
interface CreditCardMagStripeState {}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class` and `children` applied.
 */
type CreditCardMagStripeRenderProps = PropsWithoutColor<"div">;

/**
 * `render` prop accepted by `CreditCardMagStripe`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardMagStripeRenderProp =
  | JSX.Element
  | ((props: CreditCardMagStripeRenderProps, state: CreditCardMagStripeState) => JSX.Element);

/** Props for `CreditCard.MagStripe`. */
interface CreditCardMagStripeProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardMagStripeRenderProp | undefined;
}

/**
 * Back-face magnetic stripe.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardMagStripe`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardMagStripe: Component<CreditCardMagStripeProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardMagStripe", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardMagStripeRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <MagStripeSlot {...rest} class={classes()} ref={composedRefs}>
        <MagStripeSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </MagStripeSlottable>
      </MagStripeSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/** Slot typed for `CreditCardFrontHeader` div props. */
const FrontHeaderSlot = createSlot<
  HTMLDivElement,
  Omit<PropsWithoutColor<"div">, "children" | "ref">
>("CreditCardFrontHeader");
/** Slottable selecting the element-form `render` target for child injection. */
const FrontHeaderSlottable = createSlottable("CreditCardFrontHeader");

/** State exposed to `CreditCardFrontHeader`'s function-form `render` prop. */
interface CreditCardFrontHeaderState {}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class` and `children` applied.
 */
type CreditCardFrontHeaderRenderProps = PropsWithoutColor<"div">;

/**
 * `render` prop accepted by `CreditCardFrontHeader`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardFrontHeaderRenderProp =
  | JSX.Element
  | ((props: CreditCardFrontHeaderRenderProps, state: CreditCardFrontHeaderState) => JSX.Element);

/** Props for `CreditCard.FrontHeader`. */
interface CreditCardFrontHeaderProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardFrontHeaderRenderProp | undefined;
}

/**
 * Layout row for the front face top area (brand, logo).
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardFrontHeader`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardFrontHeader: Component<CreditCardFrontHeaderProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardFrontHeader", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardFrontHeaderRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <FrontHeaderSlot {...rest} class={classes()} ref={composedRefs}>
        <FrontHeaderSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </FrontHeaderSlottable>
      </FrontHeaderSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/** Slot typed for `CreditCardFrontFooter` div props. */
const FrontFooterSlot = createSlot<
  HTMLDivElement,
  Omit<PropsWithoutColor<"div">, "children" | "ref">
>("CreditCardFrontFooter");
/** Slottable selecting the element-form `render` target for child injection. */
const FrontFooterSlottable = createSlottable("CreditCardFrontFooter");

/** State exposed to `CreditCardFrontFooter`'s function-form `render` prop. */
interface CreditCardFrontFooterState {}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class` and `children` applied.
 */
type CreditCardFrontFooterRenderProps = PropsWithoutColor<"div">;

/**
 * `render` prop accepted by `CreditCardFrontFooter`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardFrontFooterRenderProp =
  | JSX.Element
  | ((props: CreditCardFrontFooterRenderProps, state: CreditCardFrontFooterState) => JSX.Element);

/** Props for `CreditCard.FrontFooter`. */
interface CreditCardFrontFooterProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardFrontFooterRenderProp | undefined;
}

/**
 * Layout row for the front face bottom area.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardFrontFooter`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardFrontFooter: Component<CreditCardFrontFooterProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardFrontFooter", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardFrontFooterRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <FrontFooterSlot {...rest} class={classes()} ref={composedRefs}>
        <FrontFooterSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </FrontFooterSlottable>
      </FrontFooterSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/** Slot typed for `CreditCardBackContent` div props. */
const BackContentSlot = createSlot<
  HTMLDivElement,
  Omit<PropsWithoutColor<"div">, "children" | "ref">
>("CreditCardBackContent");
/** Slottable selecting the element-form `render` target for child injection. */
const BackContentSlottable = createSlottable("CreditCardBackContent");

/** State exposed to `CreditCardBackContent`'s function-form `render` prop. */
interface CreditCardBackContentState {}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class` and `children` applied.
 */
type CreditCardBackContentRenderProps = PropsWithoutColor<"div">;

/**
 * `render` prop accepted by `CreditCardBackContent`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardBackContentRenderProp =
  | JSX.Element
  | ((props: CreditCardBackContentRenderProps, state: CreditCardBackContentState) => JSX.Element);

/** Props for `CreditCard.BackContent`. */
interface CreditCardBackContentProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardBackContentRenderProp | undefined;
}

/**
 * Padded content area of the back face.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardBackContent`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardBackContent: Component<CreditCardBackContentProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardBackContent", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardBackContentRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <BackContentSlot {...rest} class={classes()} ref={composedRefs}>
        <BackContentSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </BackContentSlottable>
      </BackContentSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/** Slot typed for `CreditCardFieldGroup` div props. */
const FieldGroupSlot = createSlot<
  HTMLDivElement,
  Omit<PropsWithoutColor<"div">, "children" | "ref">
>("CreditCardFieldGroup");
/** Slottable selecting the element-form `render` target for child injection. */
const FieldGroupSlottable = createSlottable("CreditCardFieldGroup");

/** State exposed to `CreditCardFieldGroup`'s function-form `render` prop. */
interface CreditCardFieldGroupState {}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class` and `children` applied.
 */
type CreditCardFieldGroupRenderProps = PropsWithoutColor<"div">;

/**
 * `render` prop accepted by `CreditCardFieldGroup`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardFieldGroupRenderProp =
  | JSX.Element
  | ((props: CreditCardFieldGroupRenderProps, state: CreditCardFieldGroupState) => JSX.Element);

/** Props for `CreditCard.FieldGroup`. */
interface CreditCardFieldGroupProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardFieldGroupRenderProp | undefined;
}

/**
 * Grid wrapper grouping card fields (e.g. expiry + CVV).
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardFieldGroup`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardFieldGroup: Component<CreditCardFieldGroupProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardFieldGroup", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardFieldGroupRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <FieldGroupSlot {...rest} class={classes()} ref={composedRefs}>
        <FieldGroupSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </FieldGroupSlottable>
      </FieldGroupSlot>
    );
  }

  return (
    <div {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </div>
  );
};

/** Slot typed for `CreditCardBrand` span props. */
const BrandSlot = createSlot<HTMLSpanElement, Omit<PropsWithoutColor<"span">, "children" | "ref">>(
  "CreditCardBrand",
);
/** Slottable selecting the element-form `render` target for child injection. */
const BrandSlottable = createSlottable("CreditCardBrand");

/** State exposed to `CreditCardBrand`'s function-form `render` prop. */
interface CreditCardBrandState {}

/**
 * Props passed to a function-form `render` prop: the caller's span props
 * with the computed `class` and `children` applied.
 */
type CreditCardBrandRenderProps = PropsWithoutColor<"span">;

/**
 * `render` prop accepted by `CreditCardBrand`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardBrandRenderProp =
  | JSX.Element
  | ((props: CreditCardBrandRenderProps, state: CreditCardBrandState) => JSX.Element);

/** Props for `CreditCard.Brand`. */
interface CreditCardBrandProps extends Omit<PropsWithoutColor<"span">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLSpanElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardBrandRenderProp | undefined;
}

/**
 * Brand text slot on the card face.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardBrand`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardBrand: Component<CreditCardBrandProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardBrand", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardBrandRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <BrandSlot {...rest} class={classes()} ref={composedRefs}>
        <BrandSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </BrandSlottable>
      </BrandSlot>
    );
  }

  return (
    <span {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </span>
  );
};

/** Slot typed for `CreditCardTitle` span props. */
const TitleSlot = createSlot<HTMLSpanElement, Omit<PropsWithoutColor<"span">, "children" | "ref">>(
  "CreditCardTitle",
);
/** Slottable selecting the element-form `render` target for child injection. */
const TitleSlottable = createSlottable("CreditCardTitle");

/** State exposed to `CreditCardTitle`'s function-form `render` prop. */
interface CreditCardTitleState {}

/**
 * Props passed to a function-form `render` prop: the caller's span props
 * with the computed `class` and `children` applied.
 */
type CreditCardTitleRenderProps = PropsWithoutColor<"span">;

/**
 * `render` prop accepted by `CreditCardTitle`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardTitleRenderProp =
  | JSX.Element
  | ((props: CreditCardTitleRenderProps, state: CreditCardTitleState) => JSX.Element);

/** Props for `CreditCard.Title`. */
interface CreditCardTitleProps extends Omit<PropsWithoutColor<"span">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLSpanElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardTitleRenderProp | undefined;
}

/**
 * Title text slot on the card face.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardTitle`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardTitle: Component<CreditCardTitleProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardTitle", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardTitleRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <TitleSlot {...rest} class={classes()} ref={composedRefs}>
        <TitleSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </TitleSlottable>
      </TitleSlot>
    );
  }

  return (
    <span {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </span>
  );
};

/** Slot typed for `CreditCardLastFour` span props. */
const LastFourSlot = createSlot<
  HTMLSpanElement,
  Omit<PropsWithoutColor<"span">, "children" | "ref">
>("CreditCardLastFour");
/** Slottable selecting the element-form `render` target for child injection. */
const LastFourSlottable = createSlottable("CreditCardLastFour");

/** State exposed to `CreditCardLastFour`'s function-form `render` prop. */
interface CreditCardLastFourState {}

/**
 * Props passed to a function-form `render` prop: the caller's span props
 * with the computed `class` and `children` applied.
 */
type CreditCardLastFourRenderProps = PropsWithoutColor<"span">;

/**
 * `render` prop accepted by `CreditCardLastFour`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and part state.
 */
type CreditCardLastFourRenderProp =
  | JSX.Element
  | ((props: CreditCardLastFourRenderProps, state: CreditCardLastFourState) => JSX.Element);

/** Props for `CreditCard.LastFour`. */
interface CreditCardLastFourProps extends Omit<PropsWithoutColor<"span">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLSpanElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: CreditCardLastFourRenderProp | undefined;
}

/**
 * Last-four-digits slot on the card face.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardLastFour`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardLastFour: Component<CreditCardLastFourProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const classes = () => cx("fui-CreditCardLastFour", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as CreditCardLastFourRenderProps, {});
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <LastFourSlot {...rest} class={classes()} ref={composedRefs}>
        <LastFourSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </LastFourSlottable>
      </LastFourSlot>
    );
  }

  return (
    <span {...rest} class={classes()} ref={composedRefs}>
      {resolved()}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Fieldset / Field / FieldGroup
// ---------------------------------------------------------------------------

/** Props for `CreditCard.Fieldset`. */
interface CreditCardFieldsetProps extends Omit<PropsWithoutColor<"fieldset">, "ref"> {
  /** Ref forwarded to the rendered `fieldset` element. */
  ref?: Ref<HTMLFieldSetElement> | undefined;
}

/**
 * Native fieldset grouping card fields (native `disabled` propagation).
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardFieldset`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardFieldset: Component<CreditCardFieldsetProps> = (props) => {
  const rest = omit(props, "ref");
  const composedRefs = composeRefs(props.ref);
  return (
    <fieldset {...rest} ref={composedRefs} class={cx("fui-CreditCardFieldset", props.class)} />
  );
};

/** Props for `CreditCard.Field`: field root props with a card class. */
interface CreditCardFieldProps extends Omit<FieldRootProps, "children" | "ref"> {
  /** Ref forwarded to the rendered `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Label, input, and error parts. */
  children?: JSX.Element | undefined;
}

/**
 * Card field root: real field context (ids, invalid gating) under the
 * card class, via the shared field state hook.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardField`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const CreditCardField: Component<CreditCardFieldProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "defaultValue",
    "disabled",
    "error",
    "invalid",
    "name",
    "noControlId",
    "onValueChange",
    "ref",
    "value",
  );
  const composedRefs = composeRefs(props.ref);
  const context = useFieldRootState(props);

  return (
    <FieldContext value={context}>
      <div
        {...rest}
        ref={composedRefs}
        data-disabled={context.disabled() ? "" : undefined}
        data-invalid={context.invalid() ? "" : undefined}
        class={cx("fui-CreditCardField", props.class)}
      >
        {props.children}
        {props.error ? <CreditCardFieldError>{props.error}</CreditCardFieldError> : null}
      </div>
    </FieldContext>
  );
};

// ---------------------------------------------------------------------------
// FieldLabel
// ---------------------------------------------------------------------------

/** Props for `CreditCard.FieldLabel`: themed `Text` props as a `label`. */
interface CreditCardFieldLabelProps extends Omit<TextProps, "render"> {
  /** Element or render function overriding the default `label` output. */
  render?: TextRenderProp | undefined;
}

/**
 * Card field label: `Text` as `size-2` rendered as a `label` bound to the
 * control via `for`. Like `Field.Label`, a consumer `render` keeps the
 * Text styling and card class.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardFieldLabel`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardFieldLabel: Component<CreditCardFieldLabelProps> = (props) => {
  const context = useFieldContext("CreditCard.FieldLabel");
  const rest = omit(props, "render", "class");
  const textProps = rest as unknown as TextProps;
  // `for` is not a span attribute, so it rides a cast object (Field.Label precedent).
  const labelFor = { for: context.controlId } as unknown as TextProps;
  return (
    <Text
      {...textProps}
      {...labelFor}
      id={context.labelId}
      size={props.size ?? "2"}
      weight={props.weight ?? "regular"}
      color={props.color ?? "gray"}
      render={props.render ?? <label />}
      class={cx("fui-CreditCardFieldLabel", props.class)}
    />
  );
};

// ---------------------------------------------------------------------------
// Errors / FieldError
// ---------------------------------------------------------------------------

/** Props for `CreditCard.Errors`. */
interface CreditCardErrorsProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Live region collecting card field errors. Registers itself as the
 * errors portal target; field errors portal here when it mounts.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardErrors`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardErrors: Component<CreditCardErrorsProps> = (props) => {
  const rest = omit(props, "ref");
  const { setErrorsContainer } = useCreditCardContext();
  const composedRefs = composeRefs(
    (node: HTMLDivElement | null) => setErrorsContainer(node),
    props.ref,
  );
  return (
    <div
      aria-live="polite"
      {...rest}
      ref={composedRefs}
      class={cx("fui-CreditCardErrors", props.class)}
    />
  );
};

/** Validity flag gating a card field error. */
type CreditCardFieldErrorMatch = keyof Omit<FieldValidityState, "value" | "valid">;

/** Props for `CreditCard.FieldError`: themed `Text` props as an error. */
interface CreditCardFieldErrorProps extends Omit<TextProps, "render"> {
  /** Element or render function overriding the default output. */
  render?: TextRenderProp | undefined;
  /** Which validity flag gates the error. Defaults to any failing validity. */
  match?: CreditCardFieldErrorMatch | undefined;
}

/**
 * Card field error: `Text` as `size-1` in danger color, mounted only
 * while the field is invalid, portaled into `Errors` when one mounts.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardFieldError`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardFieldError: Component<CreditCardFieldErrorProps> = (props) => {
  const field = useFieldContext("CreditCard.FieldError");
  const { errorsContainer } = useCreditCardContext();
  const rest = omit(props, "children", "class", "match", "render");
  const resolved = children(() => props.children);
  const renderProp = props.render;
  const textProps = rest as unknown as TextProps;

  const show = () => {
    if (!field.invalid()) return false;
    const flag = props.match;
    if (!flag) return true;
    return field.validity()[flag];
  };

  // Render function (not a hoisted element): the error renders either
  // inline or portaled, and only the active branch may instantiate it.
  const errorText = () => (
    <Text
      {...textProps}
      id={field.errorId}
      size="1"
      color="danger"
      render={renderProp ?? <p />}
      class={cx("fui-CreditCardFieldError", props.class)}
    >
      {resolved()}
    </Text>
  );

  return (
    <Show when={show()}>
      {(() => {
        const mount = errorsContainer();
        return mount ? <Portal mount={mount}>{errorText()}</Portal> : errorText();
      })()}
    </Show>
  );
};

// ---------------------------------------------------------------------------
// Text inputs
// ---------------------------------------------------------------------------

/** Props for `CreditCard.TextField`: native input props. */
interface CreditCardTextFieldProps extends Omit<PropsWithoutColor<"input">, "ref"> {
  /** Ref forwarded to the rendered `input` element. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Raw card text input (no Base UI Field wiring, matching upstream).
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardTextField`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardTextField: Component<CreditCardTextFieldProps> = (props) => {
  const rest = omit(props, "children", "ref");
  const composedRefs = composeRefs(props.ref);
  return (
    <input
      spellcheck="false"
      {...rest}
      ref={composedRefs}
      class={cx("fui-CreditCardTextField", props.class)}
    />
  );
};

/** Props for `CreditCard.NumberField`: native input props. */
interface CreditCardNumberFieldProps extends Omit<PropsWithoutColor<"input">, "ref"> {
  /** Ref forwarded to the rendered `input` element. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Card number input with brand detection, gap formatting, and cursor
 * restoration. The consumer `onChange` fires per keystroke (React
 * `onChange` parity) with the formatted value already applied.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardNumberField`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardNumberField: Component<CreditCardNumberFieldProps> = (props) => {
  const rest = omit(props, "children", "defaultValue", "onChange", "ref", "value", "onInput");
  const { setCardType } = useCreditCardContext();
  const composedRefs = composeRefs(props.ref);

  const formattedDefault = () => {
    const raw = props.defaultValue;
    if (raw === undefined) return undefined;
    const digits = String(raw).replace(/\D/g, "");
    return formatWithGaps(digits, getCardInfo(digits).gaps);
  };
  const formattedValue = () => {
    const raw = props.value;
    if (raw === undefined) return undefined;
    const digits = String(raw).replace(/\D/g, "");
    return formatWithGaps(digits, getCardInfo(digits).gaps);
  };

  // Initialize the detected brand from a prefilled value on mount.
  onSettled(() => {
    const prefilled = props.defaultValue !== undefined ? String(props.defaultValue) : props.value;
    if (prefilled === undefined) return;
    const digits = String(prefilled).replace(/\D/g, "");
    const [info] = creditCardType(digits);
    if (info) {
      setCardType(info.type as CreditCardTypeCardBrandId);
    }
  });

  const handleInput = (event: InputEvent & { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    const digits = input.value.replace(/\D/g, "");
    const info = getCardInfo(digits);
    const formatted = formatWithGaps(digits, info.gaps);
    const cursor = cursorAfterFormat(
      formatted,
      digitsBeforeCursor(input.value, input.selectionStart ?? 0),
    );

    setCardType(info === UNKNOWN_CARD_INFO ? null : (info.type as CreditCardTypeCardBrandId));
    input.value = formatted;
    requestAnimationFrame(() => {
      input.setSelectionRange(cursor, cursor);
    });

    callEventHandler(props.onChange, event);
    callEventHandler(props.onInput, event);
  };

  return (
    <input
      spellcheck="false"
      inputmode="numeric"
      pattern="[0-9 ]*"
      maxlength={23}
      placeholder="0000 0000 0000 0000"
      autocomplete="cc-number"
      {...rest}
      ref={composedRefs}
      defaultValue={formattedDefault() ?? ""}
      {...(formattedValue() === undefined ? {} : { value: formattedValue() })}
      onInput={handleInput}
      class={cx("fui-CreditCardTextField", "fui-CreditCardNumberField", props.class)}
    />
  );
};

/** Props for `CreditCard.ExpiryField`: native input props. */
interface CreditCardExpiryFieldProps extends Omit<PropsWithoutColor<"input">, "ref"> {
  /** Ref forwarded to the rendered `input` element. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Expiry input formatting raw typing as MM/YY with cursor restoration.
 * The consumer `onChange` fires per keystroke with the formatted value
 * already applied.
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardExpiryField`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardExpiryField: Component<CreditCardExpiryFieldProps> = (props) => {
  const rest = omit(props, "children", "defaultValue", "onChange", "ref", "value", "onInput");
  const composedRefs = composeRefs(props.ref);

  const formattedDefault = () =>
    props.defaultValue === undefined ? undefined : formatExpiry(String(props.defaultValue));
  const formattedValue = () =>
    props.value === undefined ? undefined : formatExpiry(String(props.value));

  const handleInput = (event: InputEvent & { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    const start = input.selectionStart ?? 0;
    const previous = input.value;
    const delta = previous.length - formatExpiry(previous).length;
    const formatted = formatExpiry(input.value);

    input.value = formatted;
    const cursor = Math.max(0, Math.min(start - delta, formatted.length));
    requestAnimationFrame(() => {
      input.setSelectionRange(cursor, cursor);
    });

    callEventHandler(props.onChange, event);
    callEventHandler(props.onInput, event);
  };

  return (
    <input
      spellcheck="false"
      inputmode="numeric"
      autocomplete="cc-exp"
      placeholder="MM/YY"
      maxlength={5}
      {...rest}
      ref={composedRefs}
      defaultValue={formattedDefault() ?? ""}
      {...(formattedValue() === undefined ? {} : { value: formattedValue() })}
      onInput={handleInput}
      class={cx("fui-CreditCardTextField", "fui-CreditCardExpiryField", props.class)}
    />
  );
};

/** Props for `CreditCard.CVVField`: native input props. */
interface CreditCardCVVFieldProps extends Omit<PropsWithoutColor<"input">, "ref"> {
  /** Ref forwarded to the rendered `input` element. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * CVV input: password-masked with a length cap from the detected brand
 * (4 for Amex, 3 otherwise).
 *
 * Upstream: `credit-card-parts.tsx` (`CreditCardCVVField`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCardCVVField: Component<CreditCardCVVFieldProps> = (props) => {
  const rest = omit(props, "children", "ref");
  const composedRefs = composeRefs(props.ref);
  const { cardType } = useCreditCardContext();

  const cvcSize = () => {
    const type = cardType();
    return creditCardType.getTypeInfo(type ?? "")?.code.size ?? 3;
  };

  return (
    <input
      type="password"
      spellcheck="false"
      inputmode="numeric"
      autocomplete="cc-csc"
      placeholder={"0".repeat(cvcSize())}
      maxlength={cvcSize()}
      {...rest}
      ref={composedRefs}
      class={cx("fui-CreditCardTextField", "fui-CreditCardCVVField", props.class)}
    />
  );
};

export {
  CreditCardBackContent,
  CreditCardBrand,
  CreditCardCVVField,
  CreditCardErrors,
  CreditCardExpiryField,
  CreditCardField,
  CreditCardFieldError,
  CreditCardFieldGroup,
  CreditCardFieldLabel,
  CreditCardFieldset,
  CreditCardFrontFooter,
  CreditCardFrontHeader,
  CreditCardLastFour,
  CreditCardLogo,
  CreditCardMagStripe,
  CreditCardNumberField,
  CreditCardTextField,
  CreditCardTitle,
};
export type {
  CreditCardBackContentProps,
  CreditCardBackContentRenderProp,
  CreditCardBackContentRenderProps,
  CreditCardBackContentState,
  CreditCardBrandProps,
  CreditCardBrandRenderProp,
  CreditCardBrandRenderProps,
  CreditCardBrandState,
  CreditCardCVVFieldProps,
  CreditCardErrorsProps,
  CreditCardExpiryFieldProps,
  CreditCardFieldErrorMatch,
  CreditCardFieldErrorProps,
  CreditCardFieldGroupProps,
  CreditCardFieldGroupRenderProp,
  CreditCardFieldGroupRenderProps,
  CreditCardFieldGroupState,
  CreditCardFieldLabelProps,
  CreditCardFieldProps,
  CreditCardFieldsetProps,
  CreditCardFrontFooterProps,
  CreditCardFrontFooterRenderProp,
  CreditCardFrontFooterRenderProps,
  CreditCardFrontFooterState,
  CreditCardFrontHeaderProps,
  CreditCardFrontHeaderRenderProp,
  CreditCardFrontHeaderRenderProps,
  CreditCardFrontHeaderState,
  CreditCardLastFourProps,
  CreditCardLastFourRenderProp,
  CreditCardLastFourRenderProps,
  CreditCardLastFourState,
  CreditCardLogoProps,
  CreditCardLogoRenderProp,
  CreditCardLogoRenderProps,
  CreditCardLogoState,
  CreditCardMagStripeProps,
  CreditCardMagStripeRenderProp,
  CreditCardMagStripeRenderProps,
  CreditCardMagStripeState,
  CreditCardNumberFieldProps,
  CreditCardTextFieldProps,
  CreditCardTitleProps,
  CreditCardTitleRenderProp,
  CreditCardTitleRenderProps,
  CreditCardTitleState,
};
