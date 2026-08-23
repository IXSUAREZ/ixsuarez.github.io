"use strict";
// Throwaway harness for sections/10-part1-cat-a.js — mirrors build.js wiring.
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

const section = require("../sections/10-part1-cat-a.js");
const html = section.render(data, helpers);
const css = fs.readFileSync(path.join(__dirname, "..", "styles", "pdf.css"), "utf8");
const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>preview</title><style>${css}</style></head><body>${html}</body></html>`;
fs.writeFileSync(path.join(__dirname, "preview-part1-cat-a.html"), doc, "utf8");
console.log("section title:", section.title);
console.log("html length:", html.length);
// quick anchor audit
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
console.log("ids produced:", JSON.stringify([...new Set(ids)]));
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
console.log("duplicate ids:", JSON.stringify([...new Set(dupes)]));
console.log("internal hrefs:", JSON.stringify([...new Set(hrefs)]));
const cards = (html.match(/class="endorsement-card"/g) || []).length;
console.log("endorsement cards:", cards);
