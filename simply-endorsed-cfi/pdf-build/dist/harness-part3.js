"use strict";
// Throwaway harness for sections/31-part3-quickref-appendix.js — mirrors
// build.js helper wiring. Not part of the book build.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { getData, cfrLink, endorsementById } = require(path.join(ROOT, "lib", "load-data"));
const theme = require(path.join(ROOT, "lib", "theme"));
const render = require(path.join(ROOT, "lib", "render"));

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

const section = require(path.join(ROOT, "sections", "31-part3-quickref-appendix.js"));
const html = section.render(data, helpers);

const css = fs.readFileSync(path.join(ROOT, "styles", "pdf.css"), "utf8");
const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>preview part3</title><style>${css}</style></head><body>${html}</body></html>`;
fs.writeFileSync(path.join(__dirname, "preview-part3.html"), doc, "utf8");

console.log("render OK — fragment length:", html.length);
console.log("ids produced:", [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]).join(", "));
console.log("internal hrefs (unique):", [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => "#" + m[1]))].join(", "));
console.log("external href count:", [...html.matchAll(/class="external"/g)].length + [...html.matchAll(/external"/g)].length);
