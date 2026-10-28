import type { PropDef } from "../../helpers/props/prop-def";
import { ISO3166Alpha2Codes } from "./country-codes";

const sizes = ["1", "2", "3", "4"] as const;

/**
 * Prop definitions for `CountryFlag`.
 *
 * Upstream: `country-flag.props.ts` (`countryFlagPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const countryFlagPropDefs = {
  countryCode: { type: "enum", values: ISO3166Alpha2Codes, required: true },
  size: { type: "enum", values: sizes, default: "2" },
} satisfies {
  countryCode: PropDef<(typeof ISO3166Alpha2Codes)[number]>;
  size: PropDef<(typeof sizes)[number]>;
};

export { countryFlagPropDefs };
