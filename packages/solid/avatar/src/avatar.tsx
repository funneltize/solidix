import {
  Show,
  createEffect,
  createSignal,
  omit,
  onSettled,
  untrack,
  type Component,
  type Setter,
} from "solid-js";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";
import { createContextScope, type Scope } from "@solidix/context";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { useCallbackRef } from "@solidix/use-callback-ref";

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

const AVATAR_NAME = "Avatar";

type ScopedProps<P> = P & { __scopeAvatar?: Scope | undefined };
/** Creates the avatar context and composes its scope subtree. */
const [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME);

const ImageLoadingStatus = {
  Idle: "idle",
  Loading: "loading",
  Loaded: "loaded",
  Error: "error",
} as const;

type ImageLoadingStatus = (typeof ImageLoadingStatus)[keyof typeof ImageLoadingStatus];

type AvatarContextValue = {
  imageLoadingStatus: () => ImageLoadingStatus;
  setImageLoadingStatus: Setter<ImageLoadingStatus>;
  imageCount: () => number;
  setImageCount: Setter<number>;
};

const STATIC_IMAGE_COUNT_STATE: [() => number, Setter<number>] = [() => 0, () => 0];

const [AvatarProvider, useAvatarContext] = createAvatarContext<AvatarContextValue>(AVATAR_NAME);

type AvatarProps = PrimitivePropsWithRef<"span">;

/** Root wrapper that provides image loading status to image and fallback. */
const Avatar: Component<ScopedProps<AvatarProps>> = (props) => {
  const rest = omit(props, "__scopeAvatar", "ref");
  const [imageLoadingStatus, setImageLoadingStatus] = createSignal<ImageLoadingStatus>(
    ImageLoadingStatus.Idle,
  );
  const [imageCount, setImageCount] = useImageCount();

  return (
    <AvatarProvider
      scope={props.__scopeAvatar}
      imageLoadingStatus={imageLoadingStatus}
      setImageLoadingStatus={setImageLoadingStatus}
      imageCount={imageCount}
      setImageCount={setImageCount}
    >
      <Primitive.span {...rest} ref={props.ref} />
    </AvatarProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AvatarImage
 * -----------------------------------------------------------------------------------------------*/

const IMAGE_NAME = "AvatarImage";

type AvatarImageProps = Omit<PrimitivePropsWithRef<"img">, "src"> & {
  src?: string | undefined;
  onLoadingStatusChange?:
    | { bivarianceHack(status: ImageLoadingStatus): void }["bivarianceHack"]
    | undefined;
};

/** Image that renders only once its source has loaded successfully. */
const AvatarImage: Component<ScopedProps<AvatarImageProps>> = (props) => {
  const rest = omit(props, "__scopeAvatar", "src", "onLoadingStatusChange", "ref");
  const context = useAvatarContext(IMAGE_NAME, props.__scopeAvatar);
  useUpdateImageCount(context.setImageCount);

  const imageLoadingStatus = useImageLoadingStatus(() => props.src, {
    referrerPolicy: () => coerceString(props.referrerpolicy),
    crossOrigin: () => coerceString(props.crossorigin),
    loadingStatus: context.imageLoadingStatus,
    setLoadingStatus: context.setImageLoadingStatus,
  });
  const handleLoadingStatusChange = useCallbackRef((status: ImageLoadingStatus) => {
    props.onLoadingStatusChange?.(status);
  });

  let prevLoadingStatus = untrack(imageLoadingStatus);

  createEffect(
    () => imageLoadingStatus(),
    (status) => {
      if (status !== prevLoadingStatus) {
        prevLoadingStatus = status;
        handleLoadingStatusChange(status);
      }
    },
  );

  return (
    <Show when={imageLoadingStatus() === ImageLoadingStatus.Loaded}>
      <Primitive.img {...rest} ref={props.ref} src={props.src} />
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AvatarFallback
 * -----------------------------------------------------------------------------------------------*/

const FALLBACK_NAME = "AvatarFallback";

type AvatarFallbackProps = PrimitivePropsWithRef<"span"> & {
  delayMs?: number | undefined;
};

/** Fallback shown after a delay when the image has not loaded. */
const AvatarFallback: Component<ScopedProps<AvatarFallbackProps>> = (props) => {
  const rest = omit(props, "__scopeAvatar", "delayMs", "ref");
  const context = useAvatarContext(FALLBACK_NAME, props.__scopeAvatar);
  const [canRender, setCanRender] = createSignal(props.delayMs === undefined);

  createEffect(
    () => props.delayMs,
    (delayMs) => {
      if (delayMs === undefined) return;
      const timerId = window.setTimeout(() => setCanRender(true), delayMs);
      return () => window.clearTimeout(timerId);
    },
  );

  return (
    <Show when={canRender() && context.imageLoadingStatus() !== ImageLoadingStatus.Loaded}>
      <Primitive.span {...rest} ref={props.ref} />
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

function useImageLoadingStatus(
  src: () => string | undefined,
  {
    loadingStatus,
    setLoadingStatus,
    referrerPolicy,
    crossOrigin,
  }: {
    referrerPolicy: () => string | undefined;
    crossOrigin: () => string | undefined;
    loadingStatus: () => ImageLoadingStatus;
    setLoadingStatus: Setter<ImageLoadingStatus>;
  },
) {
  createEffect(
    () => ({ src: src(), crossOrigin: crossOrigin(), referrerPolicy: referrerPolicy() }),
    ({ src, crossOrigin, referrerPolicy }) => {
      if (!src) {
        setLoadingStatus(ImageLoadingStatus.Error);
        return;
      }

      const image = new window.Image();
      const handleLoad = (event: Event) => {
        const target = event.currentTarget as HTMLImageElement;
        setLoadingStatus(getImageLoadingStatus(target));
      };
      const handleError = () => setLoadingStatus(ImageLoadingStatus.Error);
      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleError);
      if (referrerPolicy) {
        image.referrerPolicy = referrerPolicy as ReferrerPolicy;
      }
      image.crossOrigin = crossOrigin ?? null;
      image.src = src;

      setLoadingStatus(getImageLoadingStatus(image));
      return () => {
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleError);
        setLoadingStatus(ImageLoadingStatus.Idle);
      };
    },
  );

  return loadingStatus;
}

function getImageLoadingStatus(image: HTMLImageElement) {
  return image.complete
    ? image.naturalWidth > 0
      ? ImageLoadingStatus.Loaded
      : ImageLoadingStatus.Error
    : ImageLoadingStatus.Loading;
}

function coerceString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Image count is only used in development to warn about multiple images, which
// is unsupported. Gating behind a development flag to avoid performance
// overhead in production is safe because signals can be created conditionally,
// unlike React hooks.
function useImageCount(): [() => number, Setter<number>] {
  if (!IS_DEVELOPMENT) {
    return STATIC_IMAGE_COUNT_STATE;
  }

  const [imageCount, setImageCount] = createSignal(0);
  let hasWarned = false;
  createEffect(
    () => imageCount(),
    (count) => {
      if (count > 1 && !hasWarned) {
        hasWarned = true;
        console.warn(
          "Avatar: Only one `Avatar.Image` component should be rendered per `Avatar.Root`, but multiple were detected. This will lead to unexpected behavior.",
        );
      }
    },
  );

  return [imageCount, setImageCount];
}

function useUpdateImageCount(setImageCount: Setter<number>) {
  if (IS_DEVELOPMENT) {
    onSettled(() => {
      setImageCount((imageCount) => imageCount + 1);
      return () => {
        setImageCount((imageCount) => imageCount - 1);
      };
    });
  }
}

export {
  createAvatarScope,
  //
  Avatar,
  AvatarImage,
  AvatarFallback,
  //
  Avatar as Root,
  AvatarImage as Image,
  AvatarFallback as Fallback,
};
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps };
