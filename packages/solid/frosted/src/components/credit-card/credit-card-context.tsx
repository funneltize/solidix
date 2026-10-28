import { createContext, useContext } from "solid-js";
import type { CreditCardTypeCardBrandId } from "credit-card-type/dist/types";

/** Which face of the card is shown. */
type CardFace = "front" | "back";

/** Value shared by the `CreditCard` compound parts. */
interface CreditCardContextValue {
  /** Currently shown face. */
  face: () => CardFace;
  /** Show a face. */
  setFace: (face: CardFace) => void;
  /** Toggle between front and back. */
  toggle: () => void;
  /** Accent color set by Content, inherited by the faces. */
  color: () => string | undefined;
  /** Portal target for field errors, when an Errors part mounts. */
  errorsContainer: () => HTMLDivElement | null;
  /** Register/unregister the errors portal target. */
  setErrorsContainer: (el: HTMLDivElement | null) => void;
  /** Detected card brand ID (e.g. "visa", "american-express"). */
  cardType: () => CreditCardTypeCardBrandId | null;
  /** Set the detected card brand. */
  setCardType: (type: CreditCardTypeCardBrandId | null) => void;
  /** Human-readable brand name (e.g. "American Express") derived from the detected cardType. */
  cardNiceType: () => string | null;
}

/** Context shared by the `CreditCard` compound parts. */
const CreditCardContext = createContext<CreditCardContextValue>();

/**
 * Reads the `CreditCard` context. Throws when used outside a
 * `CreditCard.Root`.
 */
function useCreditCardContext(): CreditCardContextValue {
  try {
    return useContext(CreditCardContext);
  } catch {
    throw new Error("CreditCard compound components must be used within a CreditCard.Root");
  }
}

/**
 * Public credit-card state. Reactive values are accessors (Solid
 * adaptation of the upstream plain values); actions are plain functions.
 */
interface UseCreditCardResult {
  /** Currently shown face. */
  face: () => CardFace;
  /** Show a face. */
  setFace: (face: CardFace) => void;
  /** Toggle between front and back. */
  toggle: () => void;
  /** Detected card brand ID (e.g. "visa", "american-express"). */
  cardType: () => CreditCardTypeCardBrandId | null;
  /** Human-readable brand name (e.g. "Visa", "American Express"). */
  cardNiceType: () => string | null;
}

/**
 * Public hook returning the card face state and the detected brand.
 * Throws when used outside a `CreditCard.Root`.
 */
function useCreditCard(): UseCreditCardResult {
  const context = useCreditCardContext();
  return {
    face: context.face,
    setFace: context.setFace,
    toggle: context.toggle,
    cardType: context.cardType,
    cardNiceType: context.cardNiceType,
  };
}

export { CreditCardContext, useCreditCard, useCreditCardContext };
export type { CardFace, CreditCardContextValue, UseCreditCardResult };
