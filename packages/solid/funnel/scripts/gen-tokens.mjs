// Regenerates src/tokens.css from the token source of truth (`src/tokens.ts`
// is dependency-free, so no build is needed first). Run from the package
// directory:
//   node scripts/gen-tokens.mjs
import { writeFileSync } from "node:fs";
import { renderTokensCss } from "../src/tokens.ts";

writeFileSync(new URL("../src/tokens.css", import.meta.url), renderTokensCss());
console.log("wrote src/tokens.css");
