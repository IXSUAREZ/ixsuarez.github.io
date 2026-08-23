"use strict";
// Throwaway isolated harness for sections/20-part2-workflows.js.
// Mirrors build.js helper wiring exactly.
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

const section = require("../sections/20-part2-workflows.js");
const html = section.render(data, helpers);
const css = fs.readFileSync(path.join(__dirname, "..", "styles", "pdf.css"), "utf8");
const doc = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>preview part2</title>
<style>${css}</style></head><body>
${html}
</body></html>`;
fs.writeFileSync(path.join(__dirname, "preview-part2.html"), doc, "utf8");
console.log("section title:", section.title);
console.log("rendered length:", html.length);
// anchor audit
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const hrefs = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))].sort();
console.log("ids produced (" + ids.length + "):", ids.join(", "));
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
console.log("duplicate ids:", dupes.length ? dupes : "none");
console.log("internal href targets (" + hrefs.length + "):", hrefs.join(", "));
// heading order audit
const heads = [...html.matchAll(/<h([1-4])[^>]*>/g)].map((m) => "h" + m[1]);
console.log("heading sequence:", heads.join(" "));
