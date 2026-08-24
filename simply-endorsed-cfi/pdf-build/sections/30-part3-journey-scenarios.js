"use strict";

/**
 * sections/30-part3-journey-scenarios.js — Part III divider, Student Journey,
 * and DPE Scenarios.
 *
 * Renders:
 *   - Part III divider page (h1, id="part-3") with a short explainer and an
 *     "In this part" mini-TOC chip grid linking all seven Part III anchors
 *     (journey, scenarios, quickref, cfi-career, flashcards, lesson-plan,
 *     appendix)
 *   - Student Journey (h2, id="journey"): the 12 JOURNEY_STAGES grouped by
 *     phase (first-appearance order), h3 per phase, one styled block per stage
 *   - DPE Scenarios (h2, id="scenarios"): the 8 SCENARIO_CARDS as h3 blocks
 *
 * Anchors produced:  part-3, journey, scenarios
 * Anchors consumed:  #A-<n> endorsement cards (Part I sections), via
 *                    helpers.anchorForEndorsement()
 *
 * All colors here are either neutral grays, the shared navy #1C2142 accent,
 * or the generic semantic palettes already used by pdf.css badges (validity
 * emerald, warning amber, danger red). No category theme hex is hardcoded.
 */

const NAVY = "#1C2142";

const MONO_STACK =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

/* ── Scoped styles (.p3-* divider, .jny-* journey, .scn-* scenarios) ────── */

const SCOPED_CSS = `
<style>
.p3-lede { font-size: 10.5pt; color: #374151; max-width: 6.6in; }
.p3-contents { margin-top: 12pt; padding: 9pt 13pt; background: #f3f4f8; border: 0.75pt solid #d9dce6; border-left: 4pt solid ${NAVY}; border-radius: 4pt; font-size: 9.5pt; break-inside: avoid; }
.p3-contents-title { display: block; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${NAVY}; margin-bottom: 4pt; }
/* Divider mini-TOC: white chips on the gray contents box; same chip anatomy
   as the Part I/II divider grids (left accent border, label left, meta right). */
.p3-toc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5pt; margin-top: 6pt; }
.p3-toc-chip { display: flex; align-items: center; gap: 6pt; padding: 5pt 9pt; background: #ffffff; border: 0.75pt solid #d9dce6; border-left: 3.5pt solid ${NAVY}; border-radius: 4pt; text-decoration: none; break-inside: avoid; }
.p3-toc-label { font-weight: 600; font-size: 9.5pt; color: ${NAVY}; }
.p3-toc-meta { margin-left: auto; font-size: 8pt; font-weight: 700; color: #6b7280; white-space: nowrap; }

.jny-h2, .scn-h2 { font-size: 14pt; color: ${NAVY}; border-bottom: 1.5pt solid ${NAVY}; padding-bottom: 4pt; margin: 0 0 6pt 0; }
.jny-intro, .scn-intro { color: #4b5563; font-size: 9.5pt; margin: 0 0 10pt 0; }

.jny-phase { margin: 14pt 0 7pt 0; padding-bottom: 3pt; border-bottom: 1pt solid #c9cede; color: ${NAVY}; break-after: avoid; }
.jny-phase-count { font-size: 8.5pt; font-weight: 600; color: #6b7280; margin-left: 6pt; }

.jny-stage { break-inside: avoid; margin: 0 0 10pt 0; padding: 9pt 12pt; background: #fbfbfc; border: 0.75pt solid #e3e6ec; border-left: 3.5pt solid ${NAVY}; border-radius: 4pt; }
.jny-stage-title { color: ${NAVY}; display: flex; align-items: baseline; gap: 7pt; }
.jny-stage-num { display: inline-block; min-width: 15pt; text-align: center; padding: 1pt 4pt; border-radius: 8pt; background: ${NAVY}; color: #ffffff; font-size: 8pt; font-weight: 700; font-family: ${MONO_STACK}; }
.jny-desc { margin: 5pt 0 7pt 0; font-size: 9.5pt; }
.jny-label { display: block; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 2pt; }
.jny-reg { margin: 0 0 7pt 0; }
.jny-reg .jny-label { display: inline; margin-right: 5pt; }
.jny-timelimit { margin: 0 0 7pt 0; padding: 4pt 9pt; background: #ecfdf5; border: 0.75pt solid #a7f3d0; border-left: 3pt solid #059669; border-radius: 3pt; color: #065f46; font-size: 9pt; }
.jny-timelimit .jny-label { display: inline; margin-right: 5pt; color: #047857; }
.jny-end { margin: 0 0 2pt 0; }
.jny-end-chip { display: inline-block; margin: 0 4pt 3pt 0; padding: 1.5pt 7pt; border-radius: 8pt; border: 0.75pt solid #c9cede; background: #ffffff; font-size: 8.5pt; color: ${NAVY}; }
.jny-end-id { font-weight: 700; font-family: ${MONO_STACK}; }
.jny-gotchas { margin: 7pt 0 0 0; padding: 5pt 10pt; background: #fffbeb; border: 0.75pt solid #fde68a; border-left: 3pt solid #d97706; border-radius: 3pt; }
.jny-gotchas .jny-label { color: #92400e; }
.jny-gotchas ul { margin: 0; font-size: 9pt; color: #45370a; }
.jny-notes { margin: 7pt 0 0 0; padding: 5pt 10pt; background: #f3f4f6; border: 0.75pt solid #e5e7eb; border-radius: 3pt; font-size: 8.5pt; color: #6b7280; }
.jny-notes .jny-label { color: #9ca3af; }
.jny-notes ul { margin: 0; }
.jny-note-chip { font-family: ${MONO_STACK}; font-weight: 700; font-size: 8pt; }

.scn-card { break-inside: avoid; margin: 0 0 12pt 0; padding: 10pt 12pt; background: #fbfbfc; border: 0.75pt solid #e3e6ec; border-left: 3.5pt solid ${NAVY}; border-radius: 4pt; }
.scn-title { color: ${NAVY}; margin-bottom: 5pt; }
.scn-title .badge { margin-left: 7pt; vertical-align: 1pt; }
.scn-reg { margin: 0 0 7pt 0; }
.scn-reg .jny-label { display: inline; margin-right: 5pt; }
.scn-steps { font-size: 9.5pt; margin: 0 0 7pt 0; }
.scn-end { margin: 0 0 2pt 0; }
.scn-pitfalls { margin: 7pt 0 0 0; padding: 5pt 10pt; background: #fef2f2; border: 0.75pt solid #fecaca; border-left: 3pt solid #b91c1c; border-radius: 3pt; }
.scn-pitfalls .jny-label { color: #991b1b; }
.scn-pitfalls ul { margin: 0; font-size: 9pt; color: #451a1a; }
</style>`;

/* ── Small render helpers ──────────────────────────────────────────────── */

/** "pre-solo" → "Pre-Solo", "cross-country" → "Cross-Country". */
function phaseLabel(slug) {
  return String(slug || "")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

/**
 * Render a regulation string as a row of linked CFR chips.
 * Compound strings ("14 CFR §§ 61.83, 61.85, …, 49 CFR § 1552.15(c)") are
 * split into individual citations so each chip links to its own eCFR section
 * (a single cfrLink call on the whole string would mis-resolve the title).
 * Falls back to a plain mono line when nothing parseable is found.
 */
function regulationChips(regulation, helpers) {
  const text = String(regulation ?? "").trim();
  if (!text) return "";

  const chips = [];
  let title = "14";
  let sawCfr = false;
  for (const rawPart of text.split(/,\s*/)) {
    const part = rawPart.trim();
    const titleMatch = part.match(/(\d+)\s*CFR/i);
    if (titleMatch) {
      title = titleMatch[1];
      sawCfr = true;
    }
    const section = part
      .replace(/^\d+\s*CFR\s*/i, "")
      .replace(/^§+\s*/, "")
      .trim();
    if (!section || !/^\d/.test(section)) continue;
    chips.push(`${title} CFR § ${section}`);
  }

  if (!sawCfr || chips.length === 0) {
    return `<span class="mono">${helpers.esc(text)}</span>`;
  }
  return chips.map((c) => helpers.cfrChip(c)).join("\n      ");
}

/** Linked endorsement chips → #A-<n>. */
function endorsementChips(list, helpers) {
  return (list || [])
    .map((e) => {
      const anchor = helpers.anchorForEndorsement(e.id);
      return (
        `<a class="internal jny-end-chip" href="#${helpers.esc(anchor)}">` +
        `<span class="jny-end-id">${helpers.esc(e.id)}</span> ${helpers.esc(e.label)}</a>`
      );
    })
    .join("\n      ");
}

/** Regulation row with an inline muted label (shared by stages + scenarios). */
function regulationRow(regulation, helpers, rowClass) {
  const inner = regulationChips(regulation, helpers);
  if (!inner) return "";
  return `<div class="${rowClass}">
      <span class="jny-label">Regulation</span>
      ${inner}
    </div>`;
}

/** Emerald "Time limit" callout row (only when timeLimit is non-null). */
function timeLimitRow(timeLimit, helpers) {
  if (!timeLimit) return "";
  return `<div class="jny-timelimit">
      <span class="jny-label">Time limit</span>${helpers.esc(timeLimit)}
    </div>`;
}

/** Endorsement chip row with a muted label (only when list is non-empty). */
function endorsementRow(list, helpers, rowClass) {
  if (!list || list.length === 0) return "";
  return `<div class="${rowClass}">
      <span class="jny-label">Endorsements</span>
      ${endorsementChips(list, helpers)}
    </div>`;
}

/* ── Journey ───────────────────────────────────────────────────────────── */

function stageBlock(stage, num, helpers) {
  const notes = (stage.notes || [])
    .map((n) => {
      if (!n || typeof n !== "object") return `<li>${helpers.esc(n)}</li>`;
      const idChip = n.id
        ? ` <a class="internal jny-note-chip" href="#${helpers.esc(
            helpers.anchorForEndorsement(n.id)
          )}">${helpers.esc(n.id)}</a>`
        : "";
      const label = n.label ? `<strong>${helpers.esc(n.label)}</strong>${idChip} — ` : "";
      return `<li>${label}${helpers.esc(n.note)}</li>`;
    })
    .join("\n        ");

  const gotchasHtml =
    (stage.gotchas || []).length === 0
      ? ""
      : `<div class="jny-gotchas">
      <span class="jny-label">Gotchas</span>
      <ul>
        ${(stage.gotchas || []).map((g) => `<li>${helpers.esc(g)}</li>`).join("\n        ")}
      </ul>
    </div>`;

  const notesHtml =
    (stage.notes || []).length === 0
      ? ""
      : `<div class="jny-notes">
      <span class="jny-label">Notes</span>
      <ul>
        ${notes}
      </ul>
    </div>`;

  return `<section class="jny-stage">
    <h4 class="jny-stage-title"><span class="jny-stage-num">${num}</span>${helpers.esc(stage.label)}</h4>
    <p class="jny-desc">${helpers.esc(stage.description)}</p>
    ${regulationRow(stage.regulation, helpers, "jny-reg")}
    ${timeLimitRow(stage.timeLimit, helpers)}
    ${endorsementRow(stage.endorsements, helpers, "jny-end")}
    ${gotchasHtml}
    ${notesHtml}
  </section>`;
}

function renderJourney(data, helpers) {
  // Group stages by phase, preserving first-appearance order.
  const groups = [];
  const byPhase = new Map();
  for (const stage of data.JOURNEY_STAGES || []) {
    let group = byPhase.get(stage.phase);
    if (!group) {
      group = { phase: stage.phase, stages: [] };
      byPhase.set(stage.phase, group);
      groups.push(group);
    }
    group.stages.push(stage);
  }

  let num = 0;
  const groupsHtml = groups
    .map((group) => {
      const stagesHtml = group.stages
        .map((stage) => stageBlock(stage, ++num, helpers))
        .join("\n");
      const count =
        group.stages.length === 1 ? "1 stage" : `${group.stages.length} stages`;
      return `<h3 class="jny-phase">${helpers.esc(phaseLabel(group.phase))}<span class="jny-phase-count">${count}</span></h3>
${stagesHtml}`;
    })
    .join("\n");

  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:journey|ZZ</span>
  <h2 class="jny-h2" id="journey">Student Journey</h2>
  <p class="jny-intro">The ${(data.JOURNEY_STAGES || []).length} stages of a student&#39;s training, grouped by phase — from enrollment through the checkride — with the regulation, endorsements, time limits, and gotchas that apply at each step. Endorsement chips jump to the full card in Part I.</p>
  ${groupsHtml}
</div>`;
}

/* ── Scenarios ─────────────────────────────────────────────────────────── */

function scenarioBlock(card, helpers) {
  const stepsHtml = (card.steps || [])
    .map((s) => `<li>${helpers.esc(s)}</li>`)
    .join("\n        ");

  const pitfallsHtml =
    (card.pitfalls || []).length === 0
      ? ""
      : `<div class="scn-pitfalls">
      <span class="jny-label">Pitfalls</span>
      <ul>
        ${(card.pitfalls || []).map((p) => `<li>${helpers.esc(p)}</li>`).join("\n        ")}
      </ul>
    </div>`;

  return `<section class="scn-card">
    <h3 class="scn-title">${helpers.esc(card.title)}${helpers.badge(card.tag, "signer")}</h3>
    ${regulationRow(card.regulation, helpers, "scn-reg")}
    <ol class="scn-steps">
        ${stepsHtml}
    </ol>
    ${endorsementRow(card.endorsements, helpers, "scn-end")}
    ${timeLimitRow(card.timeLimit, helpers)}
    ${pitfallsHtml}
  </section>`;
}

function renderScenarios(data, helpers) {
  const cardsHtml = (data.SCENARIO_CARDS || [])
    .map((card) => scenarioBlock(card, helpers))
    .join("\n");

  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:scenarios|ZZ</span>
  <h2 class="scn-h2" id="scenarios">DPE Scenarios</h2>
  <p class="scn-intro">${(data.SCENARIO_CARDS || []).length} real-world situations examiners and instructors actually face, walked through step by step — with the endorsements each one triggers and the deadlines and pitfalls to watch. Endorsement chips jump to the full card in Part I.</p>
  ${cardsHtml}
</div>`;
}

/* ── Module ────────────────────────────────────────────────────────────── */

module.exports = {
  title: "Part III — Guidance: Student Journey & DPE Scenarios",
  render(data, helpers) {
    /* Divider mini-TOC: all seven top-level Part III anchors. Counts are
       derived from the data files where a natural count exists. */
    const tocEntries = [
      ["journey", "Student Journey", `${(data.JOURNEY_STAGES || []).length} stages`],
      ["scenarios", "DPE Scenarios", `${(data.SCENARIO_CARDS || []).length} scenarios`],
      ["quickref", "Quick Reference", "tables &amp; checklists"],
      ["cfi-career", "CFI Career", "renewal &amp; reinstatement"],
      ["flashcards", "DPE Prep Flashcards", `${(data.FLASHCARD_DECK || []).length} cards`],
      ["lesson-plan", "Lesson Plan", `${(data.GUIDANCE_SECTIONS || []).length} parts`],
      ["appendix", "Appendix", "eCFR index"],
    ];
    const tocChips = tocEntries
      .map(
        ([anchor, label, meta]) =>
          `<a class="internal p3-toc-chip" href="#${helpers.esc(anchor)}">` +
          `<span class="p3-toc-label">${label}</span>` +
          `<span class="p3-toc-meta">${meta}</span></a>`
      )
      .join("\n    ");

    const divider = `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|part:part-3|ZZ</span>
  <h1 class="section-title" id="part-3">Part III — Guidance</h1>
  <p class="p3-lede">Part I cataloged what each endorsement says. This part turns that catalog into operational guidance: the student journey from enrollment to checkride shows <em>when</em> each endorsement is used, and the DPE scenarios walk through the situations where the paperwork most often goes wrong. Quick-reference tables, CFI career guidance, DPE prep flashcards, a lesson plan for teaching endorsements, and the appendix round out the part.</p>
  <div class="p3-contents">
    <span class="p3-contents-title">In this part</span>
    <div class="p3-toc-grid">
    ${tocChips}
    </div>
  </div>
</div>`;

    return (
      SCOPED_CSS +
      "\n" +
      divider +
      "\n" +
      renderJourney(data, helpers) +
      "\n" +
      renderScenarios(data, helpers)
    );
  },
};
