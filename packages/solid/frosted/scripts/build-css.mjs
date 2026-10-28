/**
 * Builds the committed stylesheet bundles for @solidix/frosted.
 *
 * Mirrors the upstream frosted-ui postcss chain (postcss.config.js and
 * postcss.config.lite.js at the pinned commit): import inlining, nesting,
 * comment stripping, custom-media expansion, duplicated-selector combining,
 * empty-rule discarding, and autoprefixing. The lite bundle additionally
 * strips P3 color-gamut blocks via an inlined port of postcss-remove-p3.js.
 *
 * Run with `pnpm gen:css` from this package after any change to CSS sources.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import postcssCombineDuplicatedSelectors from "postcss-combine-duplicated-selectors";
import postcssCustomMedia from "postcss-custom-media";
import postcssDiscardEmpty from "postcss-discard-empty";
import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const inputFile = path.join(root, "src", "styles", "index.css");

const header = `/**
 * @solidix/frosted styles - built from src/styles/*.css, do not edit directly.
 * CSS sources ported from frosted-ui (MIT) at commit 56787900bfe0.
 * Run \`pnpm gen:css\` to regenerate.
 */
`;

/** Port of upstream postcss-frosted-ui.js: strips every comment from the CSS. */
function stripComments() {
  return {
    postcssPlugin: "solidix-frosted-strip-comments",
    Comment(comment) {
      comment.remove();
    },
  };
}
stripComments.postcss = true;

/** Port of upstream postcss-remove-p3.js: drops P3 color-gamut blocks. */
function removeP3() {
  return {
    postcssPlugin: "solidix-frosted-remove-p3",
    OnceExit(cssRoot) {
      const toRemove = [];
      cssRoot.walkAtRules((atRule) => {
        if (atRule.name === "supports") {
          const params = String(atRule.params || "");
          if (params.includes("display-p3")) {
            toRemove.push(atRule);
          } else {
            atRule.walkAtRules("media", (mediaRule) => {
              const mediaParams = String(mediaRule.params || "");
              if (
                mediaParams.includes("color-gamut: p3") ||
                mediaParams.includes("color-gamut:p3")
              ) {
                toRemove.push(atRule);
              }
            });
          }
        } else if (atRule.name === "media") {
          const params = String(atRule.params || "");
          if (params.includes("color-gamut: p3") || params.includes("color-gamut:p3")) {
            const parent = atRule.parent;
            if (parent && parent.type === "atrule" && parent.name === "supports") {
              toRemove.push(parent);
            } else {
              toRemove.push(atRule);
            }
          }
        }
      });
      toRemove.forEach((rule) => {
        rule.remove();
      });
    },
  };
}
removeP3.postcss = true;

function plugins(lite) {
  const list = [
    postcssImport(),
    postcssNesting(),
    stripComments(),
    postcssCustomMedia(),
    postcssCombineDuplicatedSelectors(),
  ];
  if (lite) {
    list.push(removeP3());
  }
  list.push(postcssDiscardEmpty(), autoprefixer());
  return list;
}

async function build(lite) {
  const outputFile = path.join(root, "src", lite ? "styles.lite.css" : "styles.css");
  const css = fs.readFileSync(inputFile, "utf8");
  const result = await postcss(plugins(lite)).process(css, { from: inputFile, to: outputFile });
  fs.writeFileSync(outputFile, `${header}${result.css}`);
  console.log(`wrote ${path.relative(root, outputFile)} (${result.css.length} bytes)`);
}

await build(false);
await build(true);

// PostCSS output indentation does not match the repo formatter, so format the
// committed bundles in the same step that regenerates them.
execFileSync(
  "npx",
  [
    "--no-install",
    "oxfmt",
    "--write",
    path.join(root, "src", "styles.css"),
    path.join(root, "src", "styles.lite.css"),
  ],
  { stdio: "inherit" },
);
