import { createMemo, createSignal, onCleanup, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import creditCardType from "credit-card-type";
import type { CreditCardTypeCardBrandId } from "credit-card-type/dist/types";
import {
  CreditCardContext,
  type CardFace,
  type CreditCardContextValue,
} from "./credit-card-context";

/**
 * Imperative handle exposed via `ref` on `CreditCard.Root`.
 */
interface CreditCardRootRef {
  /** Set the active face. */
  setFace: (face: CardFace) => void;
  /** Toggle between front and back. */
  flip: () => void;
}

/** Props for `CreditCard.Root`. */
interface CreditCardRootProps {
  /** Card parts (Content, Trigger, fields). */
  children?: JSX.Element | undefined;
  /** Ref receiving the imperative face handle. */
  ref?: Ref<CreditCardRootRef> | undefined;
  /**
   * The active face in controlled mode.
   * Use together with `onFaceChange` to keep state in sync.
   */
  face?: CardFace | undefined;
  /**
   * The initial face in uncontrolled mode.
   * @default 'front'
   */
  defaultFace?: CardFace | undefined;
  /** Callback fired when the active face changes. */
  onFaceChange?: ((face: CardFace) => void) | undefined;
}

/**
 * Renderless context provider for the `CreditCard` compound: owns the
 * face state, the errors portal target, and the detected card brand.
 *
 * Upstream: `credit-card-root.tsx` (`CreditCardRoot`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const CreditCardRoot: Component<CreditCardRootProps> = (props) => {
  const isControlled = props.face !== undefined;
  const [internalFace, setInternalFace] = createSignal<CardFace>(props.defaultFace ?? "front");
  const face = () => (isControlled ? (props.face as CardFace) : internalFace());
  const [errorsContainer, setErrorsContainer] = createSignal<HTMLDivElement | null>(null);
  const [cardType, setCardType] = createSignal<CreditCardTypeCardBrandId | null>(null);

  const cardNiceType = createMemo(() => {
    const type = cardType();
    return type ? (creditCardType.getTypeInfo(type)?.niceType ?? null) : null;
  });

  const setFace = (newFace: CardFace) => {
    if (!isControlled) {
      setInternalFace(newFace);
    }
    props.onFaceChange?.(newFace);
  };

  const toggle = () => {
    setFace(face() === "front" ? "back" : "front");
  };

  const setRef = composeRefs(props.ref);
  setRef({ setFace, flip: toggle });
  onCleanup(() => setRef(null));

  const contextValue: CreditCardContextValue = {
    face,
    setFace,
    toggle,
    color: () => undefined,
    errorsContainer,
    setErrorsContainer,
    cardType,
    setCardType,
    cardNiceType,
  };

  return <CreditCardContext value={contextValue}>{props.children}</CreditCardContext>;
};

export { CreditCardRoot };
export type { CreditCardRootProps, CreditCardRootRef };
