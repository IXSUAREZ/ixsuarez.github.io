"use strict";

/**
 * sections/34-endorsement-register.js — 14 CFR § 61.189 Endorsement Record Register.
 *
 * Provides printable/fillable log sheets for Flight Instructors to comply with
 * the 3-year recordkeeping mandate under 14 CFR § 61.189.
 */

const SCOPED_CSS = `<style>
.reg-wrap { margin-top: 10pt; }
.reg-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.reg-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 20pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.reg-sub { font-size: 11.5pt; color: #475569; margin: 0; line-height: 1.35; }
.reg-note { margin-top: 6pt; font-size: 9.5pt; color: #64748b; font-style: italic; }
.reg-cont { margin: 0 0 6pt 0; padding-bottom: 3pt; border-bottom: 1pt solid #cbd5e1; font-size: 10pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; }
.reg-table { width: 100%; border-collapse: collapse; font-size: 11.0pt; margin-top: 8pt; }
.reg-table th, .reg-table td { border: 0.5pt solid #cbd5e1; padding: 4pt 6pt; text-align: left; height: 28pt; }
.reg-table th { background: #0f172a; color: #ffffff; font-weight: 700; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.04em; }
.reg-table tbody tr:nth-child(even) td { background: #f8fafc; }
.reg-col-num { width: 24pt; text-align: center; color: #94a3b8; font-size: 9pt; }
.reg-col-date { width: 62pt; }
.reg-col-name { width: 138pt; }
.reg-col-id { width: 48pt; text-align: center; }
.reg-col-exp { width: 72pt; }
.reg-col-result { width: 62pt; text-align: center; }
.reg-col-init { width: 42pt; text-align: center; }
</style>`;

function renderRegister(data, helpers) {
  const headerCols = `<tr>
          <th class="reg-col-num">#</th>
          <th class="reg-col-date">Date</th>
          <th class="reg-col-name">Student Full Name &amp; FTN</th>
          <th class="reg-col-id">AC Item</th>
          <th class="reg-col-exp">Expiration</th>
          <th class="reg-col-result">Test / Result</th>
          <th class="reg-col-init">Initials</th>
        </tr>`;

  const row = (n) => `<tr>
    <td class="reg-col-num mono">${n}</td>
    <td></td>
    <td></td>
    <td class="mono"></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>`;

  // 66 numbered entries over 3 sheets: 20 on the titled sheet, 23 per
  // continuation sheet (28pt rows fit the letter page at print scale).
  const sheets = [
    { start: 1, count: 20 },
    { start: 21, count: 23 },
    { start: 44, count: 23 },
  ];

  const tableFor = (sheet) => {
    const rows = Array.from({ length: sheet.count }, (_, i) => row(sheet.start + i)).join("\n");
    return `<table class="reg-table">
      <thead>
        ${headerCols}
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
  };

  const first = `<div class="page-break reg-wrap">
    <div class="reg-header">
      <h2 class="reg-title" id="endorsement-register">Appendix — 14 CFR § 61.189 Flight Instructor Endorsement Register</h2>
      <p class="reg-sub">Official instructor signoff ledger. 14 CFR § 61.189 requires flight instructors to maintain a record of each person endorsed for solo flight and practical tests for at least 3 years.</p>
      <p class="reg-note">66 numbered entries across 3 sheets — photocopy a continuation sheet when you run out. Record every solo sign-off and every knowledge/practical test recommendation.</p>
    </div>
    ${tableFor(sheets[0])}
  </div>`;

  const continuations = sheets.slice(1).map((sheet, i) => `<div class="page-break reg-wrap">
    <p class="reg-cont">§ 61.189 Endorsement Register — Sheet ${i + 2} of ${sheets.length} (continued)</p>
    ${tableFor(sheet)}
  </div>`).join("\n");

  return first + "\n" + continuations;
}

module.exports = {
  title: "Appendix — 14 CFR § 61.189 Endorsement Register",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderRegister(data, helpers);
  },
};
