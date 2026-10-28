import { createEffect, createMemo, createSignal, For, omit, Show, type Component } from "solid-js";
import { useId } from "@solidix/id";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { botAvatarFacePath, getBotAvatarEyes, getBotAvatarMouth } from "./bot-avatar.expressions";
import type { BotAvatarHandle } from "./bot-avatar.handle";
import { registerBotAvatarHandle } from "./bot-avatar.handle";
import { getBotAvatarIdentity } from "./bot-avatar.identity";
import { botAvatarPropDefs } from "./bot-avatar.props";
import { botAvatarShapePaths } from "./bot-avatar.shapes";
import { botAvatarStatusExpressions } from "./bot-avatar.status";

/** Own props of `BotAvatar` derived from `botAvatarPropDefs`. */
type BotAvatarOwnProps = GetPropDefTypes<typeof botAvatarPropDefs>;

/** Normalized gaze direction, [-1, 1] per axis. */
interface BotAvatarGaze {
  /** Horizontal look direction (left to right). */
  x: number;
  /** Vertical look direction (up to down). */
  y: number;
}

/** Props for the `BotAvatar` component: native div props plus bot options. */
interface BotAvatarProps extends Omit<PropsWithoutColor<"div">, "ref">, BotAvatarOwnProps {
  /** Ref forwarded to the rendered root `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
  /**
   * Where the bot looks, normalized to [-1, 1] per axis (x: left to right,
   * y: up to down). Overrides `followPointer` while set. Non-finite values are
   * ignored (treated as center) rather than applied.
   */
  gaze?: BotAvatarGaze | undefined;
  /**
   * A handle created with `createBotAvatarHandle()` for imperative control
   * (`blink()`, `lookAt()`), following the Base UI handle pattern.
   */
  handle?: BotAvatarHandle | undefined;
}

/** Max face deflection at full gaze, as a percentage of the avatar size. */
const GAZE_RANGE_X = 10;
const GAZE_RANGE_Y = 7;

const clampGazeAxis = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(-1, value)) : 0;

/**
 * Procedural bot avatar: a clipped silhouette with a morphing SVG face,
 * pointer-following gaze, status expressions, and an imperative handle.
 *
 * Upstream: `bot-avatar.tsx` (`BotAvatar`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const BotAvatar: Component<BotAvatarProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "size",
    "color",
    "highContrast",
    "shape",
    "identity",
    "notification",
    "expression",
    "status",
    "followPointer",
    "gaze",
    "handle",
    "ref",
  );

  const size = () => props.size ?? botAvatarPropDefs.size.default;
  const highContrast = () => props.highContrast ?? botAvatarPropDefs.highContrast.default;
  const notification = () => props.notification ?? botAvatarPropDefs.notification.default;
  const expression = () => props.expression ?? botAvatarPropDefs.expression.default;
  const status = () => props.status ?? botAvatarPropDefs.status.default;
  const followPointer = () => props.followPointer ?? botAvatarPropDefs.followPointer.default;

  // Explicit `shape`/`color` props always win over identity-derived values.
  const derivedIdentity = createMemo(() =>
    props.identity !== undefined ? getBotAvatarIdentity(props.identity) : undefined,
  );
  const shape = () => props.shape ?? derivedIdentity()?.shape ?? botAvatarPropDefs.shape.default;
  const color = () => props.color ?? derivedIdentity()?.color ?? botAvatarPropDefs.color.default;

  // Minted in setup: identity must stay stable across renders.
  const clipPathId = useId();

  // A status implies a face: it maps to a default expression, which an
  // explicit `expression` prop overrides (the status motion applies either way).
  const resolvedExpression = () => {
    const explicit = expression();
    if (explicit !== undefined) return explicit;
    const current = status();
    return current !== undefined ? botAvatarStatusExpressions[current] : undefined;
  };
  const hasFace = () => resolvedExpression() !== undefined;

  // Forced blink, driven by the imperative handle's blink(). 0 = not
  // blinking; each call increments so the end-effect below re-arms even for
  // back-to-back blinks.
  const [blinkId, setBlinkId] = createSignal(0);
  const isBlinking = () => blinkId() !== 0;
  createEffect(
    () => blinkId(),
    (id) => {
      if (id === 0) return;
      // Clears just after the 340ms forced-blink animation ends.
      const endTimer = setTimeout(() => setBlinkId(0), 360);
      return () => clearTimeout(endTimer);
    },
  );

  // Pointer tracking: the pointer's direction from the avatar center becomes
  // a gaze, reaching full deflection at ~3 avatar widths. Disabled under
  // reduced motion (continuous tracking is motion, unlike a static gaze).
  let rootElement: HTMLDivElement | null = null;
  const composedRefs = composeRefs((node: HTMLDivElement | null) => {
    rootElement = node;
  }, props.ref);
  const [pointerGaze, setPointerGaze] = createSignal<BotAvatarGaze | null>(null);
  createEffect(
    () => ({ tracking: followPointer(), face: hasFace() }),
    ({ tracking, face }) => {
      if (!tracking || !face || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPointerGaze(null);
        return;
      }
      const onPointerMove = (event: PointerEvent) => {
        const rect = rootElement?.getBoundingClientRect();
        // A hidden element measures 0x0; ignore it instead of producing NaN.
        if (!rect || rect.width === 0 || rect.height === 0) return;
        const range = Math.max(rect.width * 3, 160);
        setPointerGaze({
          x: clampGazeAxis((event.clientX - (rect.left + rect.width / 2)) / range),
          y: clampGazeAxis((event.clientY - (rect.top + rect.height / 2)) / range),
        });
      };
      const onPointerLeave = () => setPointerGaze(null);
      window.addEventListener("pointermove", onPointerMove);
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      };
    },
  );

  // Imperative handle (Base UI pattern): attaches while mounted, detaches on
  // unmount, and calls made with no avatar attached are ignored.
  // `ownedWrite` allows the detach cleanup to clear the gaze (effect
  // cleanups run in an owned scope).
  const [handleGaze, setHandleGaze] = createSignal<BotAvatarGaze | null>(null, {
    ownedWrite: true,
  });
  createEffect(
    () => props.handle,
    (handle) => {
      if (handle === undefined) return;
      const detach = registerBotAvatarHandle(handle, {
        blink: () => setBlinkId((id) => id + 1),
        lookAt: (target) =>
          setHandleGaze(
            target === null ? null : { x: clampGazeAxis(target.x), y: clampGazeAxis(target.y) },
          ),
      });
      return () => {
        detach();
        setHandleGaze(null);
      };
    },
  );

  // Gaze priority: the declarative prop wins, then the handle's lookAt, then
  // pointer tracking. While any is active the automatic wander stills - a
  // commanded gaze and a drifting gaze fighting each other reads as the bot
  // hunting the cursor.
  const activeGaze = (): BotAvatarGaze | null => {
    const declared = props.gaze;
    if (declared !== undefined)
      return { x: clampGazeAxis(declared.x), y: clampGazeAxis(declared.y) };
    return handleGaze() ?? pointerGaze();
  };

  // Face geometry comes from the expression catalogue adjusted by the
  // precomputed per-shape face fit. See the upstream module docs for the
  // full rationale.
  const eyeDs = (): string[] | undefined => {
    const resolved = resolvedExpression();
    if (resolved === undefined) return undefined;
    return getBotAvatarEyes(resolved, shape()).map(botAvatarFacePath);
  };
  const mouthD = (): string | undefined => {
    const resolved = resolvedExpression();
    if (resolved === undefined) return undefined;
    return botAvatarFacePath(getBotAvatarMouth(resolved, shape()));
  };

  // Desynchronize the idle animations (blink, drift, breath) across
  // instances with a stable per-instance negative delay, so a roster of
  // avatars doesn't blink in lockstep.
  const lifeDelayMs = (() => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < clipPathId.length; i++) {
      hash ^= clipPathId.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return -(hash % 5200);
  })();

  const classes = () =>
    cx(
      "fui-BotAvatarRoot",
      props.class,
      `fui-r-size-${size()}`,
      {
        "fui-high-contrast": highContrast(),
        "fui-blinking": isBlinking(),
        "fui-gazing": activeGaze() !== null,
      },
      status() !== undefined && `fui-status-${status()}`,
    );

  const faceStyle = (): Record<string, string> | undefined => {
    const gaze = activeGaze();
    if (gaze === null) return undefined;
    return {
      "--bot-avatar-gaze-x": `${gaze.x * GAZE_RANGE_X}%`,
      "--bot-avatar-gaze-y": `${gaze.y * GAZE_RANGE_Y}%`,
    };
  };

  return (
    <div data-accent-color={color()} {...rest} ref={composedRefs} class={classes()}>
      <svg
        class="fui-BotAvatarClipSvg"
        aria-hidden="true"
        {...({ focusable: "false" } as object)}
        width={0}
        height={0}
      >
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path d={botAvatarShapePaths[shape()]} />
          </clipPath>
        </defs>
      </svg>
      {/*
       * Body carries the whole-avatar animations (breath, done pulse); the
       * clipped shape and the face are siblings inside it, so the eyes move
       * and scale with the body but are never clipped by the silhouette.
       */}
      <div
        class={cx("fui-BotAvatarBody", { "fui-with-face": eyeDs() !== undefined })}
        style={{ "--bot-avatar-life-delay": `${lifeDelayMs}ms` }}
      >
        <div
          class="fui-BotAvatarShape"
          style={{
            // The silhouette: the inline SVG clipPath (set as a var since
            // the id is per-instance).
            "--bot-avatar-clip": `url(#${clipPathId})`,
          }}
        />
        <Show when={eyeDs()} keyed>
          {(eyes) => (
            // Face carries the transitioned base pose per status; FaceMotion
            // carries the looping animations (all zero-anchored), so status
            // changes glide instead of jumping between animation frames.
            <div class="fui-BotAvatarFace" style={faceStyle()}>
              <div class="fui-BotAvatarFaceMotion">
                {/*
                 * The `d` attributes are the static fallback; the inline CSS
                 * `d` properties are what transition between expressions.
                 */}
                <svg
                  class="fui-BotAvatarFaceSvg"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                  {...({ focusable: "false" } as object)}
                >
                  <For each={eyes}>
                    {(eyeD) => (
                      <path class="fui-BotAvatarEye" d={eyeD} style={{ d: `path("${eyeD}")` }} />
                    )}
                  </For>
                  <Show when={mouthD()} keyed>
                    {(mouth) => (
                      <path
                        class="fui-BotAvatarMouth"
                        d={mouth}
                        style={{ d: `path("${mouth}")` }}
                      />
                    )}
                  </Show>
                </svg>
              </div>
            </div>
          )}
        </Show>
      </div>
      {notification() && <div class="fui-BotAvatarNotification" />}
    </div>
  );
};

export { BotAvatar };
export type { BotAvatarGaze, BotAvatarOwnProps, BotAvatarProps };
