import { omit, onSettled, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import {
  skeletonAvatarPropDefs,
  skeletonRectPropDefs,
  skeletonTextPropDefs,
} from "./skeleton.props";

/** Must match the animation duration in skeleton.css (fui-skeleton-pulse). */
const SKELETON_PULSE_DURATION_S = 2;

/**
 * Offsets the pulse animation of a skeleton node by the current phase so all
 * skeletons on the page pulse in sync. Runs once after mount; `onSettled` is
 * the Solid 2 mount hook (`onMount` does not exist).
 */
function useSkeletonAnimationSync(getNode: () => HTMLDivElement | undefined): void {
  onSettled(() => {
    const el = getNode();
    if (!el) return;
    const phaseSec = (performance.now() / 1000) % SKELETON_PULSE_DURATION_S;
    el.style.setProperty("--fui-skeleton-animation-delay", `-${phaseSec}s`);
  });
}

/** Own props of `SkeletonAvatar` derived from `skeletonAvatarPropDefs`. */
type SkeletonAvatarOwnProps = GetPropDefTypes<typeof skeletonAvatarPropDefs>;

/**
 * Props for the `SkeletonAvatar` component: div props plus skeleton prop-def
 * values. `ref` is narrowed to the compose-refs callback form so it forwards
 * through the local sync ref.
 */
interface SkeletonAvatarProps
  extends Omit<PropsWithoutColor<"div">, "ref">, SkeletonAvatarOwnProps {
  /** Ref forwarded to the rendered element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/** Skeleton placeholder shaped like an avatar (circle or square). */
const SkeletonAvatar: Component<SkeletonAvatarProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "size", "shape", "color", "highContrast");
  let node: HTMLDivElement | undefined;
  const composedRefs = composeRefs(props.ref, (el) => {
    node = el ?? undefined;
  });
  useSkeletonAnimationSync(() => node);

  const size = () => props.size ?? skeletonAvatarPropDefs.size.default;
  const shape = () => props.shape ?? skeletonAvatarPropDefs.shape.default;
  const color = () => props.color ?? skeletonAvatarPropDefs.color.default;
  const highContrast = () => props.highContrast ?? skeletonAvatarPropDefs.highContrast.default;

  return (
    <div
      {...rest}
      ref={composedRefs}
      data-accent-color={color()}
      class={cx(
        "fui-SkeletonAvatar",
        props.class,
        `fui-r-size-${size()}`,
        `fui-shape-${shape()}`,
        highContrast() ? "fui-high-contrast" : undefined,
      )}
    />
  );
};

/** Own props of `SkeletonText` derived from `skeletonTextPropDefs`. */
type SkeletonTextOwnProps = GetPropDefTypes<typeof skeletonTextPropDefs>;

/**
 * Props for the `SkeletonText` component: div props plus skeleton prop-def
 * values. `ref` is narrowed to the compose-refs callback form so it forwards
 * through the local sync ref.
 */
interface SkeletonTextProps extends Omit<PropsWithoutColor<"div">, "ref">, SkeletonTextOwnProps {
  /** Ref forwarded to the rendered element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/** Skeleton placeholder shaped like lines of text. */
const SkeletonText: Component<SkeletonTextProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "size", "color", "highContrast");
  let node: HTMLDivElement | undefined;
  const composedRefs = composeRefs(props.ref, (el) => {
    node = el ?? undefined;
  });
  useSkeletonAnimationSync(() => node);

  const size = () => props.size ?? skeletonTextPropDefs.size.default;
  const color = () => props.color ?? skeletonTextPropDefs.color.default;
  const highContrast = () => props.highContrast ?? skeletonTextPropDefs.highContrast.default;

  return (
    <div
      {...rest}
      ref={composedRefs}
      data-accent-color={color()}
      class={cx(
        "fui-SkeletonText",
        props.class,
        `fui-r-size-${size()}`,
        highContrast() ? "fui-high-contrast" : undefined,
      )}
    />
  );
};

/** Own props of `SkeletonRect` derived from `skeletonRectPropDefs`. */
type SkeletonRectOwnProps = GetPropDefTypes<typeof skeletonRectPropDefs>;

/**
 * Props for the `SkeletonRect` component: div props plus skeleton prop-def
 * values. `ref` is narrowed to the compose-refs callback form so it forwards
 * through the local sync ref.
 */
interface SkeletonRectProps extends Omit<PropsWithoutColor<"div">, "ref">, SkeletonRectOwnProps {
  /** Ref forwarded to the rendered element. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/** Skeleton placeholder shaped like a rectangle. */
const SkeletonRect: Component<SkeletonRectProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "color", "highContrast");
  let node: HTMLDivElement | undefined;
  const composedRefs = composeRefs(props.ref, (el) => {
    node = el ?? undefined;
  });
  useSkeletonAnimationSync(() => node);

  const color = () => props.color ?? skeletonRectPropDefs.color.default;
  const highContrast = () => props.highContrast ?? skeletonRectPropDefs.highContrast.default;

  return (
    <div
      {...rest}
      ref={composedRefs}
      data-accent-color={color()}
      class={cx("fui-SkeletonRect", props.class, highContrast() ? "fui-high-contrast" : undefined)}
    />
  );
};

export { SkeletonAvatar, SkeletonRect, SkeletonText };
export type { SkeletonAvatarProps, SkeletonRectProps, SkeletonTextProps };
