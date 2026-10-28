import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ariaBoolean } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { VisuallyHidden } from "@solidix/visually-hidden";
import { cx } from "../../helpers/cx";
import { mapButtonSizeToSpinnerSize } from "../../helpers/map-prop-values";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { Spinner } from "../spinner/spinner";
import { baseButtonPropDefs } from "./base-button.props";

/** Slot typed for `BaseButton`'s button props so element-form `render` spreads typecheck. */
const BaseButtonSlot = createSlot<
  HTMLButtonElement,
  Omit<PropsWithoutColor<"button">, "children" | "ref">
>("BaseButton");
/** Slottable selecting the element-form `render` target for child injection. */
const BaseButtonSlottable = createSlottable("BaseButton");

/** Own props of `BaseButton` derived from `baseButtonPropDefs` (size, variant, color, highContrast). */
type BaseButtonOwnProps = GetPropDefTypes<typeof baseButtonPropDefs>;

/**
 * Props passed to a function-form `render` prop: the caller's button props with
 * the computed `class`, `data-accent-color`, `data-disabled`, and `children` applied.
 */
type BaseButtonRenderProps = PropsWithoutColor<"button"> & {
  /** Accent color token written as `data-accent-color` on the rendered element. */
  "data-accent-color"?: string | undefined;
};

/** State argument for a function-form `render` prop: Base UI button state. */
type BaseButtonRenderState = {
  /** Whether the button is disabled. */
  disabled: boolean;
};

/**
 * `render` prop accepted by `BaseButton`, mirroring Base UI `useRender`: an
 * element to render as (merged via `Slot`), or a function receiving the
 * merged props and button state.
 */
type BaseButtonRenderProp =
  | JSX.Element
  | ((props: BaseButtonRenderProps, state: BaseButtonRenderState) => JSX.Element);

/**
 * Props for the `BaseButton` component: prop-def values plus native button
 * props and `render`. `ref` is narrowed to the compose-refs callback form so
 * it forwards to both the `Slot` and the `button` branches.
 */
interface BaseButtonProps
  extends BaseButtonOwnProps, Omit<PropsWithoutColor<"button">, "ref" | "disabled"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /**
   * Whether the button is disabled. Defaults to the value of `loading`.
   *
   * Narrowed from Solid's wide `disabled` DOM type to the boolean upstream accepts.
   */
  disabled?: boolean | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: BaseButtonRenderProp | undefined;
  /** Whether the button shows a loading spinner; implies `disabled`. */
  loading?: boolean | undefined;
}

/**
 * Base for Frosted buttons, ported from upstream `base-button.tsx`. Renders a
 * native `button` (or a slotted child via `render`) with Frosted
 * size/variant/color classes. When `loading`, the content is hidden, announced
 * via `VisuallyHidden`, and a `Spinner` overlays the button; the button is
 * disabled unless `disabled` is set explicitly.
 */
const BaseButton: Component<BaseButtonProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "ref",
    "render",
    "loading",
    "disabled",
    "size",
    "variant",
    "color",
    "highContrast",
  );
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Second instance for the loading branch: upstream renders `{children}`
  // twice (hidden copy + `VisuallyHidden` copy), and each Solid memo caches
  // one node instance, so one memo cannot feed both locations.
  const resolvedAgain = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const size = () => props.size ?? baseButtonPropDefs.size.default;
  const variant = () => props.variant ?? baseButtonPropDefs.variant.default;
  const color = () => props.color ?? baseButtonPropDefs.color.default;
  const highContrast = () => props.highContrast ?? baseButtonPropDefs.highContrast.default;
  const loading = () => props.loading ?? false;
  // Upstream: `disabled = props.loading` - loading implies disabled unless
  // `disabled` is set explicitly (including explicit `false`).
  const disabled = () => props.disabled ?? props.loading ?? false;

  const classes = () =>
    cx(
      "fui-BaseButton",
      props.class,
      `fui-r-size-${size()}`,
      `fui-variant-${variant()}`,
      highContrast() ? "fui-high-contrast" : undefined,
    );

  // Upstream: `color || (variant === 'surface' ? 'gray' : color)`.
  const accentColor = () => color() ?? (variant() === "surface" ? "gray" : color());

  const content = () =>
    loading() ? (
      <>
        {/*
         * Upstream comment: a wrapper sets `visibility: hidden` to hide the
         * button content whilst the `Spinner` shows. The button is a flex
         * container with a `gap`, so `display: contents` keeps the flex
         * layout. However, `display: contents` removes the content from the
         * accessibility tree in some browsers, so it is force-removed with
         * `aria-hidden` and re-added with `VisuallyHidden`.
         */}
        <span style={{ display: "contents", visibility: "hidden" }} aria-hidden="true">
          {resolved()}
        </span>
        <VisuallyHidden>{resolvedAgain()}</VisuallyHidden>

        <span
          style={{
            position: "absolute",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            inset: "0",
          }}
        >
          <Spinner size={mapButtonSizeToSpinnerSize(size())} />
        </span>
      </>
    ) : (
      resolved()
    );

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get "data-accent-color"() {
        return accentColor();
      },
      get "data-disabled"() {
        return disabled() || undefined;
      },
      get disabled() {
        return disabled();
      },
      get "aria-busy"() {
        return ariaBoolean(loading() || undefined);
      },
      get children() {
        return content();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as BaseButtonRenderProps, { disabled: disabled() });
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <BaseButtonSlot
        {...rest}
        class={classes()}
        data-accent-color={accentColor()}
        data-disabled={disabled() || undefined}
        disabled={disabled()}
        aria-busy={ariaBoolean(loading() || undefined)}
        ref={composedRefs}
      >
        <BaseButtonSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : content())}
        </BaseButtonSlottable>
      </BaseButtonSlot>
    );
  }

  return (
    <button
      {...rest}
      class={classes()}
      data-accent-color={accentColor()}
      // The `data-disabled` attribute enables correct styles when doing
      // `<Button render={<a />} disabled>` (upstream comment).
      data-disabled={disabled() || undefined}
      disabled={disabled()}
      aria-busy={ariaBoolean(loading() || undefined)}
      ref={composedRefs}
    >
      {content()}
    </button>
  );
};

export { BaseButton };
export type { BaseButtonProps, BaseButtonRenderProp, BaseButtonRenderProps, BaseButtonRenderState };
