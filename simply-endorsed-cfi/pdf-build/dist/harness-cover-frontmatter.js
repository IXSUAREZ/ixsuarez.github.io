"use strict";

/* Throwaway harness mirroring build.js helper wiring for sections 00 + 01. */

const fs = require("fs");
const path = require("path");

const { getData, cfrLink, endorsementById } = require("../lib/load-data");
const theme = require("../lib/theme");
const render = require("../lib/render");

const data = getData();

const helpers = {
  ...render,
  ...theme,
  cfrLink,
  endorsementById,
  renderEndorsementCard: (e, opts) =>
    render.renderEndorsementCard(e, {
      sourceUrl: data.APP_META.sourceUrl,
      acVersion: data.APP_META.acVersion,
      ...opts,
    }),
};

const cover = require("../sections/00-cover.js");
const frontMatter = require("../sections/01-front-matter.js");

const parts = [cover, frontMatter].map((s) => s.render(data, helpers));
const css = fs.readFileSync(path.join(__dirname, "..", "styles", "pdf.css"), "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>preview</title><style>
${css}
</style></head>
<body>
${parts.join("\n")}
</body>
</html>`;

const out = path.join(__dirname, "preview-cover-frontmatter.html");
fs.writeFileSync(out, html, "utf8");
console.log(`cover: ${parts[0].length} chars, front-matter: ${parts[1].length} chars, total: ${html.length} chars`);
console.log(`wrote ${out}`);
