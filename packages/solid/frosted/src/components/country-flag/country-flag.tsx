import { omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { countryFlagPropDefs } from "./country-flag.props";

/** Version of the `flag-icons` CDN package the image URLs point at. */
const VERSION = "7.5.0";

/** Own props of `CountryFlag` derived from `countryFlagPropDefs`. */
type CountryFlagOwnProps = GetPropDefTypes<typeof countryFlagPropDefs>;

/**
 * Props for the `CountryFlag` component: native img props (minus `src`)
 * plus the required country code and size.
 */
interface CountryFlagProps
  extends Omit<PropsWithoutColor<"img">, "ref" | "src">, CountryFlagOwnProps {
  /** Ref forwarded to the rendered `img` element. */
  ref?: Ref<HTMLImageElement> | undefined;
  /** ISO 3166-1 alpha-2 country code (case-insensitive). */
  countryCode: NonNullable<CountryFlagOwnProps["countryCode"]>;
}

/**
 * Flag image for an ISO country code, served from the `flag-icons` CDN.
 *
 * Upstream: `country-flag.tsx` (`CountryFlag`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const CountryFlag: Component<CountryFlagProps> = (props) => {
  const rest = omit(props, "alt", "class", "countryCode", "ref", "size");
  const composedRefs = composeRefs(props.ref);

  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/flag-icons@${VERSION}/flags/4x3/${props.countryCode.toLowerCase()}.svg`}
      alt={props.alt ?? ""}
      class={cx("fui-CountryFlag", props.class, `fui-r-size-${props.size ?? countryFlagPropDefs.size.default}`)}
      {...rest}
      ref={composedRefs}
    />
  );
};

export { CountryFlag };
export type { CountryFlagOwnProps, CountryFlagProps };
