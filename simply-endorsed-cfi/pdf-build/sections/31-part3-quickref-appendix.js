"use strict";

/**
 * sections/31-part3-quickref-appendix.js — Part III Quick Reference, Career & Appendix.
 */

const SCOPED_CSS = `<style>
.qr-limit{display:inline-block;padding:2pt 6pt;border-left:3pt solid var(--cat-accent,#475569);background:var(--cat-soft,#f0f1f3);color:var(--cat-ink,#313b4a);font-weight:700;font-size:9pt;border-radius:2pt}
.qr-acref{display:inline-block;background:#1C2142;color:#fff;font-weight:700;font-size:8.5pt;padding:1.5pt 6pt;border-radius:8pt;text-decoration:none;font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.qr-note{font-size:8.5pt;color:#5b6472;margin:-6pt 0 12pt 0}
.cc-compare{display:flex;gap:10pt;margin:6pt 0 12pt 0}
.cc-panel{flex:1;border:0.75pt solid #d7dbe2;border-radius:4pt;padding:8pt 10pt;break-inside:avoid}
.cc-panel-h{font-weight:700;color:#1C2142;margin:0 0 4pt 0;font-size:10pt}
.cc-panel p{margin:0 0 4pt 0;font-size:9pt}
.cc-note{font-size:8.5pt;color:#5b6472;margin:4pt 0 0 0}
.fc-card{border:0.75pt solid #d7dbe2;border-left:3pt solid #1C2142;border-radius:4pt;padding:8pt 10pt;margin:0 0 8pt 0;break-inside:avoid}
.fc-meta{display:flex;justify-content:space-between;align-items:center;margin:0 0 4pt 0}
.fc-badge{display:inline-block;background:#1C2142;color:#fff;font-size:7.5pt;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:1.5pt 6pt;border-radius:8pt}
.fc-num{font-size:8pt;color:#8a92a3;font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.fc-q{font-weight:700;font-size:9.5pt;margin:0 0 6pt 0}
.fc-a{border:0.75pt solid #d7dbe2;background:#f7f8fa;border-radius:3pt;padding:6pt 8pt;font-size:9pt}
.fc-a p{margin:0}
.lp-toc{columns:2;font-size:9.5pt}
.apx-src p{margin:0 0 4pt 0}
.apx-muted{color:#5b6472;font-size:8.5pt}
.far-idx-table { width: 100%; border-collapse: collapse; font-size: 8pt; margin: 8pt 0; }
.far-idx-table th, .far-idx-table td { border: 0.5pt solid #cbd5e1; padding: 3pt 6pt; text-align: left; }
.far-idx-table th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
.far-pill { font-family: "JetBrains Mono", monospace; font-size: 7pt; font-weight: 700; background: #0f172a; color: #fff; padding: 1pt 4pt; border-radius: 2pt; text-decoration: none; display: inline-block; margin: 1pt; }
.colophon-box { border: 1pt solid #cbd5e1; background: #f8fafc; border-radius: 4pt; padding: 10pt; margin-top: 14pt; font-size: 8.5pt; color: #334155; line-height: 1.45; }
</style>`;

function renderQuickRef(data, helpers) {
  const meta = data.APP_META;
  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:quickref|ZZ</span>
  <h2 id="quickref">Part III — Quick Reference Tables</h2>
  <h3>Validity &amp; Expiration Summary</h3>
  <table class="data-table far-idx-table">
    <thead><tr><th>Endorsement Type</th><th>Expiration Period</th><th>Relevant FAR Authority</th></tr></thead>
    <tbody>
      <tr><td>Student Solo Flight</td><td><span class="qr-limit">90 Calendar Days</span></td><td>14 CFR § 61.87(p)</td></tr>
      <tr><td>Solo Cross-Country (per-flight)</td><td><span class="qr-limit">Single Specific Flight</span></td><td>14 CFR § 61.93(c)(3)</td></tr>
      <tr><td>Flight Review (BFR)</td><td><span class="qr-limit">24 Calendar Months</span></td><td>14 CFR § 61.56(c)</td></tr>
      <tr><td>Instrument Proficiency Check</td><td><span class="qr-limit">6 Calendar Months</span></td><td>14 CFR § 61.57(d)</td></tr>
      <tr><td>Practical Test Recommendation</td><td><span class="qr-limit">2 Calendar Months (60 Days)</span></td><td>14 CFR § 61.39(a)(6)</td></tr>
      <tr><td>Written Test Deficiency Review</td><td><span class="qr-limit">No Expiration</span></td><td>14 CFR § 61.39(a)(6)(iii)</td></tr>
    </tbody>
  </table>

  <h3>Special Issuer Authority Matrix (Non-Standard CFI)</h3>
  <p>Endorsements requiring specialized instructor qualifications or authorized examiners:</p>
  <table class="data-table far-idx-table">
    <thead><tr><th>Endorsement</th><th>AC Number</th><th>Required Authorizing Signer</th></tr></thead>
    <tbody>
      <tr><td>Robinson R22/R44 SFAR 73 Solo / PIC</td><td>A.88 – A.91</td><td>SFAR 73 Authorized Flight Instructor (200 hr Robinson)</td></tr>
      <tr><td>Sport Pilot Additional Privileges</td><td>A.17, A.23 – A.25</td><td>Authorized Flight Instructor / Two CFIs (Subpart K)</td></tr>
      <tr><td>Ground Instructor Endorsements</td><td>A.51 – A.52</td><td>Authorized Ground Instructor (BGI/AGI/IGI)</td></tr>
      <tr><td>Gold Seal CFI / MRA Recommendation</td><td>A.47 – A.48</td><td>FAA DPE or Flight Standards District Office (FSDO)</td></tr>
    </tbody>
  </table>
</div>`;
}

function renderCfiCareer(data, helpers) {
  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:cfi-career|ZZ</span>
  <h2 id="cfi-career">Part III — CFI Career, FAR Records &amp; Renewal</h2>
  <div class="cc-compare">
    <div class="cc-panel">
      <div class="cc-panel-h">14 CFR § 61.189 Logbook Records Rule</div>
      <p>A flight instructor must sign the logbook of each person to whom that instructor has given flight training or ground training.</p>
      <p>Must maintain a record in a logbook or separate document for at least <strong>3 years</strong> containing the name of each person endorsed for solo flight and checkrides.</p>
    </div>
    <div class="cc-panel">
      <div class="cc-panel-h">Dec 2024 Rule: Indefinite CFI Certificate</div>
      <p>Under the newest FAA Part 61 revisions, Flight Instructor certificates no longer carry an expiration date. Currency is maintained via 24-calendar-month recent experience actions (FIRC, practical test, or 80% pass rate record).</p>
    </div>
  </div>
</div>`;
}

function renderFlashcards(data, helpers) {
  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:flashcards|ZZ</span>
  <h2 id="flashcards">Part III — DPE Oral Exam Flashcards</h2>
  <div class="fc-card">
    <div class="fc-meta"><span class="fc-badge">Solo Limits</span><span class="fc-num">Card 01</span></div>
    <div class="fc-q">What is required before a student pilot can make repeated solo cross-country flights within 50 NM?</div>
    <div class="fc-a"><p>Flight training on both ways of the route, dual landing at the destination, and endorsements under § 61.93(b)(2) (AC 61-65K A.11).</p></div>
  </div>
  <div class="fc-card">
    <div class="fc-meta"><span class="fc-badge">Checkride Retest</span><span class="fc-num">Card 02</span></div>
    <div class="fc-q">What endorsements are required when an applicant fails a practical test area of operation?</div>
    <div class="fc-a"><p>Additional training on failed areas (§ 61.49, A.77) + an updated 60-day practical test recommendation (§ 61.39, A.1).</p></div>
  </div>
</div>`;
}

function renderLessonPlan(data, helpers) {
  const sections = data.GUIDANCE_SECTIONS;

  const tocItems = sections
    .map(
      (g) => `<li><a class="internal" href="#gs-${helpers.esc(g.id)}">${helpers.esc(g.title)}</a></li>`
    )
    .join("\n      ");

  const body = sections
    .map(
      (g) => `<section class="guidance-section">
  ${helpers.pgmMarker(`gs:${g.id}`)}
  <h3 id="gs-${helpers.esc(g.id)}">${helpers.esc(g.title)}</h3>
  ${helpers.renderBlocks(g.content)}
</section>`
    )
    .join("\n");

  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:lesson-plan|ZZ</span>
  <h2 id="lesson-plan">Lesson Plan &mdash; Teaching Endorsements</h2>
  <p>A ten-part ground lesson for CFI candidates and working instructors on issuing, managing, and verifying AC 61-65K endorsements.</p>
  <ol class="lp-toc">
      ${tocItems}
  </ol>
${body}
</div>`;
}

function renderAppendix(data, helpers) {
  const byCfr = new Map();
  for (const e of data.ENDORSEMENTS) {
    for (const citation of e.cfr || []) {
      const clean = citation.trim();
      if (!byCfr.has(clean)) byCfr.set(clean, []);
      byCfr.get(clean).push(e.id);
    }
  }

  const sortedCfr = [...byCfr.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

  const farRows = sortedCfr.map(([citation, ids]) => {
    const url = helpers.cfrLink(citation);
    const pills = ids.map(id => `<a class="far-pill internal" href="#${helpers.anchorForEndorsement(id)}">${helpers.esc(id)}</a>`).join(" ");
    const linkHtml = url
      ? `<a class="external" href="${helpers.esc(url)}" target="_blank" rel="noopener noreferrer"><strong>${helpers.esc(citation)}</strong> ↗</a>`
      : `<strong>${helpers.esc(citation)}</strong>`;
    return `<tr>
      <td>${linkHtml}</td>
      <td>${pills}</td>
    </tr>`;
  }).join("\n");

  const meta = data.APP_META;

  return `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|gs:appendix|ZZ</span>
  <h2 id="appendix">Appendix</h2>

  <h3>Inverted 14 CFR &rarr; AC 61-65K Cross-Reference Index</h3>
  <p>Lookup table mapping Federal Aviation Regulations directly to corresponding model endorsement numbers.</p>
  <table class="data-table far-idx-table">
    <thead><tr><th>14 CFR Regulation Section</th><th>Applicable Endorsements</th></tr></thead>
    <tbody>
${farRows}
    </tbody>
  </table>

  <h3>Colophon &amp; Currency Verification</h3>
  <div class="colophon-box">
    <p><strong>SIMPLY ENDORSED CFI &mdash; EDITION 4</strong></p>
    <p><strong>FAA Advisory Circular:</strong> ${helpers.esc(meta.acVersion)} (Issued ${helpers.esc(meta.dateIssued)})</p>
    <p><strong>Source Authority:</strong> <a class="external" href="${helpers.esc(meta.sourceUrl)}" target="_blank" rel="noopener noreferrer">${helpers.esc(meta.acVersion)} PDF (FAA Flight Standards)</a></p>
    <p><strong>Regulation Text Baseline:</strong> Electronic Code of Federal Regulations (14 CFR Parts 61 &amp; 91, 49 CFR Part 1552).</p>
    <p><strong>Build Provenance:</strong> Automated pipeline verification with zero dead links, embedded typography, and validated ForeFlight cockpit navigation chrome.</p>
  </div>
</div>`;
}

module.exports = {
  title: "Part III — Quick Reference, Career, Flashcards, Lesson Plan & Appendix",
  render(data, helpers) {
    return (
      SCOPED_CSS +
      "\n" +
      [
        renderQuickRef(data, helpers),
        renderCfiCareer(data, helpers),
        renderFlashcards(data, helpers),
        renderLessonPlan(data, helpers),
        renderAppendix(data, helpers),
      ].join("\n")
    );
  },
};
