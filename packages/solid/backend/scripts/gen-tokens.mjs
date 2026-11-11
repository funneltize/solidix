// Regenerates src/tokens.css from the token source of truth.
import { writeFileSync } from "node:fs";
import { renderTokensCss } from "../src/tokens.ts";

writeFileSync(new URL("../src/tokens.css", import.meta.url), renderTokensCss());
console.log("wrote src/tokens.css");
