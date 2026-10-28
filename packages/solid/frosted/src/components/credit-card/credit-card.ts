import { CreditCardBack } from "./credit-card-back";
import { CreditCardBrandLogo } from "./credit-card-brand-logos";
import { CreditCardContent } from "./credit-card-content";
import { CreditCardFront } from "./credit-card-front";
import {
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
} from "./credit-card-parts";
import { CreditCardRoot } from "./credit-card-root";
import { CreditCardTrigger } from "./credit-card-trigger";

/**
 * Card component namespace: faces and fields of the interactive 3D credit
 * card compound.
 *
 * Sub-components:
 *   Root, Content, Front, Back, Trigger - flip container and faces
 *   Logo, Brand, BrandLogo, Title, LastFour, MagStripe - face data slots
 *   FrontHeader, FrontFooter, BackContent - face layout slots
 *   Fieldset, Field, FieldGroup, FieldLabel - card form fields
 *   Errors, FieldError - collected error display
 *   TextField, NumberField, ExpiryField, CVVField - card inputs
 *
 * Upstream: `credit-card.ts` at whopio/frosted-ui commit `56787900bfe0`.
 */
const CreditCard = {
  Root: CreditCardRoot,
  Content: CreditCardContent,
  Front: CreditCardFront,
  Back: CreditCardBack,
  Trigger: CreditCardTrigger,
  Logo: CreditCardLogo,
  Brand: CreditCardBrand,
  BrandLogo: CreditCardBrandLogo,
  Title: CreditCardTitle,
  LastFour: CreditCardLastFour,
  MagStripe: CreditCardMagStripe,
  FrontHeader: CreditCardFrontHeader,
  FrontFooter: CreditCardFrontFooter,
  BackContent: CreditCardBackContent,
  Fieldset: CreditCardFieldset,
  Field: CreditCardField,
  FieldGroup: CreditCardFieldGroup,
  FieldLabel: CreditCardFieldLabel,
  Errors: CreditCardErrors,
  FieldError: CreditCardFieldError,
  TextField: CreditCardTextField,
  NumberField: CreditCardNumberField,
  ExpiryField: CreditCardExpiryField,
  CVVField: CreditCardCVVField,
};

export { CreditCard };
