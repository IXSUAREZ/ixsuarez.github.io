#!/usr/bin/env node
/*
 * KFTC certificate artwork builder.
 * Background worlds are generated as text-free source art; this renderer
 * retains exact labels, the Inter Tight family, the glass card and KFTC mark.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const canvas = require(path.resolve(__dirname, "../../../cert-api/node_modules/@napi-rs/canvas"));
const { createCanvas, loadImage, GlobalFonts } = canvas;

const W = 1080;
const H = 1920;
const PHOTO = { x: 132, y: 483, w: 824, h: 620, r: 24 };
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "templates");
const BACKDROPS = path.join(TEMPLATES, "_source", "backdrops");

GlobalFonts.registerFromPath(path.resolve(ROOT, "../simply-endorsed-cfi/pdf-build/fonts/InterTight-700.ttf"), "Inter Tight");
GlobalFonts.registerFromPath(path.resolve(ROOT, "../simply-endorsed-cfi/pdf-build/fonts/Inter-500.ttf"), "Inter");

const certificates = [
  { file: "first-solo.jpg", backdrop: "v2/first-solo.png", title: "FIRST SOLO", subtitle: "MILESTONE FLIGHT", accent: "#f4a327", glow: "#ffe1a6" },
  { file: "private.jpg", backdrop: "private.png", title: "PRIVATE PILOT", subtitle: "CERTIFICATE", accent: "#14aaf5", glow: "#c4f1ff" },
  { file: "sport.jpg", backdrop: "sport.png", title: "SPORT PILOT", subtitle: "CERTIFICATE", accent: "#35cf81", glow: "#d2ffe0" },
  { file: "instrument.jpg", backdrop: "instrument.png", title: "INSTRUMENT", subtitle: "RATING", accent: "#78b8cf", glow: "#dbfbff" },
  { file: "commercial.jpg", backdrop: "v2/commercial.png", title: "COMMERCIAL", subtitle: "CERTIFICATE", accent: "#e5af42", glow: "#fff1bd" },
  { file: "multi-engine-rating.png", backdrop: "v2/multi-rating.png", title: "MULTI-ENGINE", subtitle: "RATING ADDED", accent: "#3a9de8", glow: "#d3f1ff" },
  { file: "multi-engine-commercial.png", backdrop: "v2/multi-commercial.png", title: "MULTI-ENGINE", subtitle: "COMMERCIAL", accent: "#efbd4b", glow: "#fff0ba" },
  { file: "multi-engine-instructor.png", backdrop: "v2/mei.png", title: "MEI INSTRUCTOR", subtitle: "MULTI-ENGINE", accent: "#2473ed", glow: "#d7e6ff" },
  { file: "cfi.jpg", backdrop: "v2/cfi.png", title: "CFI", subtitle: "INSTRUCTOR RATING", accent: "#f14848", glow: "#ffd2c5" },
  { file: "cfii.jpg", backdrop: "v2/cfii.png", title: "CFII", subtitle: "INSTRUMENT INSTRUCTOR", accent: "#9b57f7", glow: "#eedcff" },
];

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

function drawCover(ctx, image) {
  const scale = Math.max(W / image.width, H / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (W - w) / 2, (H - h) / 2, w, h);
}

function trackedWidth(ctx, text, tracking) {
  let width = 0;
  for (let i = 0; i < text.length; i += 1) width += ctx.measureText(text[i]).width;
  return width + Math.max(0, text.length - 1) * tracking;
}

function fitTracked(ctx, text, maxWidth, size, minSize, tracking) {
  let resolved = size;
  while (resolved > minSize) {
    ctx.font = '700 ' + resolved + 'px "Inter Tight", "Arial Narrow", sans-serif';
    if (trackedWidth(ctx, text, tracking) <= maxWidth) return resolved;
    resolved -= 2;
  }
  return minSize;
}

function drawTracked(ctx, text, centerX, baseline, opts) {
  const resolved = fitTracked(ctx, text, opts.maxWidth, opts.size, opts.minSize, opts.tracking);
  ctx.font = '700 ' + resolved + 'px "Inter Tight", "Arial Narrow", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let cursor = centerX - trackedWidth(ctx, text, opts.tracking) / 2;
  if (opts.shadow) {
    ctx.shadowColor = opts.shadow.color;
    ctx.shadowBlur = opts.shadow.blur;
    ctx.shadowOffsetY = opts.shadow.offsetY || 0;
  }
  if (opts.stroke && opts.strokeWidth) {
    ctx.strokeStyle = opts.stroke;
    ctx.lineWidth = opts.strokeWidth;
  }
  ctx.fillStyle = opts.gradient;
  for (let i = 0; i < text.length; i += 1) {
    if (opts.stroke && opts.strokeWidth) ctx.strokeText(text[i], cursor, baseline);
    ctx.fillText(text[i], cursor, baseline);
    cursor += ctx.measureText(text[i]).width + opts.tracking;
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawGlassPlaque(ctx, spec) {
  const x = 78;
  const y = 178;
  const w = 924;
  const h = 1438;
  const r = 48;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.46)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 16;
  roundedRect(ctx, x, y, w, h, r);
  const body = ctx.createLinearGradient(x, y, x + w, y + h);
  body.addColorStop(0, "rgba(255,255,255,0.19)");
  body.addColorStop(0.13, "rgba(214,241,255,0.10)");
  body.addColorStop(0.47, "rgba(4,13,28,0.17)");
  body.addColorStop(0.76, rgba(spec.accent, 0.14));
  body.addColorStop(1, "rgba(1,7,18,0.34)");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.restore();

  roundedRect(ctx, x, y, w, h, r);
  ctx.lineWidth = 11;
  ctx.strokeStyle = "rgba(219,247,255,0.20)";
  ctx.stroke();
  roundedRect(ctx, x + 5, y + 5, w - 10, h - 10, r - 5);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.70)";
  ctx.stroke();
  roundedRect(ctx, x + 12, y + 12, w - 24, h - 24, r - 12);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(spec.accent, 0.78);
  ctx.stroke();

  ctx.save();
  roundedRect(ctx, x + 13, y + 13, w - 26, h - 26, r - 13);
  ctx.clip();
  const sheen = ctx.createLinearGradient(0, y, 0, y + 500);
  sheen.addColorStop(0, "rgba(255,255,255,0.30)");
  sheen.addColorStop(0.20, "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.65, "rgba(255,255,255,0.01)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, w, 570);
  const aurora = ctx.createLinearGradient(x, y + 970, x + w, y + 1250);
  aurora.addColorStop(0, "rgba(14,228,255,0)");
  aurora.addColorStop(0.40, rgba(spec.accent, 0.17));
  aurora.addColorStop(0.62, "rgba(245,180,255,0.10)");
  aurora.addColorStop(1, "rgba(14,228,255,0)");
  ctx.fillStyle = aurora;
  ctx.fillRect(x, y + 910, w, 450);
  ctx.restore();
}

function drawTitles(ctx, spec) {
  const metallic = ctx.createLinearGradient(0, 222, 0, 356);
  metallic.addColorStop(0, "#ffffff");
  metallic.addColorStop(0.22, spec.glow);
  metallic.addColorStop(0.52, "#dbeaff");
  metallic.addColorStop(0.78, "#ffffff");
  metallic.addColorStop(1, "#a9bedc");
  drawTracked(ctx, spec.title, W / 2, 346, {
    size: 116, minSize: 62, maxWidth: 810, tracking: 2.2,
    gradient: metallic, stroke: "rgba(4,11,27,0.82)", strokeWidth: 4,
    shadow: { color: rgba(spec.accent, 0.66), blur: 16, offsetY: 5 },
  });
  const subtitle = ctx.createLinearGradient(0, 362, 0, 420);
  subtitle.addColorStop(0, "#ffffff");
  subtitle.addColorStop(1, "#b7d3eb");
  drawTracked(ctx, spec.subtitle, W / 2, 416, {
    size: 34, minSize: 20, maxWidth: 768, tracking: 7.4,
    gradient: subtitle, stroke: "rgba(2,7,18,0.76)", strokeWidth: 2,
    shadow: { color: "rgba(0,0,0,0.52)", blur: 8, offsetY: 3 },
  });
}

function drawPhotoAperture(ctx, spec) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.54)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, PHOTO.x - 8, PHOTO.y - 8, PHOTO.w + 16, PHOTO.h + 16, PHOTO.r + 9);
  ctx.fillStyle = "rgba(3,11,26,0.85)";
  ctx.fill();
  ctx.restore();
  roundedRect(ctx, PHOTO.x - 6, PHOTO.y - 6, PHOTO.w + 12, PHOTO.h + 12, PHOTO.r + 7);
  ctx.lineWidth = 9;
  ctx.strokeStyle = "rgba(239,250,255,0.56)";
  ctx.stroke();
  roundedRect(ctx, PHOTO.x - 2, PHOTO.y - 2, PHOTO.w + 4, PHOTO.h + 4, PHOTO.r + 3);
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(spec.accent, 0.90);
  ctx.stroke();
  roundedRect(ctx, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, PHOTO.r);
  const placeholder = ctx.createLinearGradient(PHOTO.x, PHOTO.y, PHOTO.x + PHOTO.w, PHOTO.y + PHOTO.h);
  placeholder.addColorStop(0, "rgba(7,20,41,0.91)");
  placeholder.addColorStop(1, "rgba(16,46,78,0.70)");
  ctx.fillStyle = placeholder;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.50)";
  ctx.stroke();
}

function drawLowerGlass(ctx, spec) {
  roundedRect(ctx, 112, 1143, 856, 322, 32);
  const lower = ctx.createLinearGradient(0, 1143, 0, 1465);
  lower.addColorStop(0, "rgba(1,9,23,0.04)");
  lower.addColorStop(0.30, rgba(spec.accent, 0.10));
  lower.addColorStop(1, "rgba(0,4,13,0.30)");
  ctx.fillStyle = lower;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.stroke();
}

function drawSeal(ctx, logo) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.48)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  ctx.drawImage(logo, 264, 1492, 552, 365);
  ctx.restore();
}

function renderCertificate(backdrop, logo, spec) {
  const out = createCanvas(W, H);
  const ctx = out.getContext("2d");
  drawCover(ctx, backdrop);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.20, W / 2, H / 2, H * 0.83);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.75, "rgba(0,0,0,0.12)");
  vignette.addColorStop(1, "rgba(0,0,0,0.48)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  drawGlassPlaque(ctx, spec);
  drawTitles(ctx, spec);
  drawPhotoAperture(ctx, spec);
  drawLowerGlass(ctx, spec);
  drawSeal(ctx, logo);
  return out;
}

async function main() {
  const logo = await loadImage(path.join(TEMPLATES, "_source", "kftc-logo-transparent.png"));
  for (const spec of certificates) {
    const source = path.join(BACKDROPS, spec.backdrop);
    if (!fs.existsSync(source)) throw new Error("Missing backdrop: " + source);
    const backdrop = await loadImage(source);
    const out = renderCertificate(backdrop, logo, spec);
    const target = path.join(TEMPLATES, spec.file);
    const bytes = await out.encode(spec.file.endsWith(".png") ? "png" : "jpeg", spec.file.endsWith(".png") ? undefined : 94);
    fs.writeFileSync(target, bytes);
    process.stdout.write(spec.file + "\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
