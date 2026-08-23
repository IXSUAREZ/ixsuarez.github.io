"use strict";

/**
 * dist/harness-part1-cat-c.js — throwaway isolated harness for
 * sections/12-part1-cat-c.js. Mirrors the helper wiring in build.js
 * (render + theme + cfrLink + endorsementById + pre-bound card renderer)
 * and renders ONLY this section to dist/preview-part1-cat-c.html.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { getData, cfrLink, endorsementById } = require(path.join(ROOT, "lib", "load-data"));
const theme = require(path.join(ROOT, "lib", "theme"));
const render = require(path.join(ROOT, "lib", "render"));
const section = require(path.join(ROOT, "sections", "12-part1-cat-c.js"));

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

const body = section.render(data, helpers);

// ── Anchor audit ──────────────────────────────────────────────────────────
const ids = [...body.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const dupIds = ids.filter((v, i) => ids.indexOf(v) !== i);
const hrefs = [...new Set([...body.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
const ownAnchors = new Set(ids);
const externalRefs = hrefs.filter((h) => !ownAnchors.has(h));

const fullCards = (body.match(/class="endorsement-card"/g) || []).length;
const refLines = (body.match(/class="p1c-ref"/g) || []).length;
const banners = (body.match(/class="category-banner"/g) || []).length;
const bundleHeaders = (body.match(/class="bundle-header"/g) || []).length;

const css = fs.readFileSync(path.join(ROOT, "styles", "pdf.css"), "utf8");
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>preview part1-cat-c</title>
<style>${css}</style></head><body>
${body}
</body></html>`;
const out = path.join(__dirname, "preview-part1-cat-c.html");
fs.writeFileSync(out, html, "utf8");

console.log("render length:", body.length);
console.log("category banners:", banners, "| bundle headers:", bundleHeaders);
console.log("full cards:", fullCards, "| ref lines:", refLines);
console.log("ids produced (" + ids.length + "):", ids.join(" "));
console.log("duplicate ids:", dupIds.length ? dupIds.join(",") : "none");
console.log("anchors referenced but not produced here:", externalRefs.length ? externalRefs.join(", ") : "none");
console.log("wrote", path.relative(ROOT, out), "(" + (Buffer.byteLength(html) / 1024).toFixed(1) + " KB)");
