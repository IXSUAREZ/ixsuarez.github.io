"use strict";

/**
 * sections/35-student-journey-tracker.js — 12-Stage Student Journey Progression Tracker.
 */

const SCOPED_CSS = `<style>
.jt-wrap { margin-top: 10pt; }
.jt-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.jt-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 15pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.jt-sub { font-size: 9.5pt; color: #475569; margin: 0; }
.jt-meta-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8pt; margin-bottom: 8pt; padding: 6pt; background: #f8fafc; border: 0.75pt solid #cbd5e1; border-radius: 4pt; font-size: 8pt; }
.jt-meta-field { display: flex; flex-direction: column; gap: 2pt; }
.jt-meta-lbl { font-size: 8.0pt; font-weight: 700; text-transform: uppercase; color: #64748b; }
.jt-meta-line { border-bottom: 0.75pt solid #94a3b8; height: 12pt; }
.jt-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
.jt-table th, .jt-table td { border: 0.5pt solid #cbd5e1; padding: 3.5pt 5pt; text-align: left; }
.jt-table th { background: #0f172a; color: #fff; font-weight: 700; font-size: 8.0pt; text-transform: uppercase; }
.jt-stage-num { font-family: "JetBrains Mono", monospace; font-size: 9.0pt; font-weight: 800; color: #2563eb; width: 22pt; text-align: center; }
.jt-pills { font-family: "JetBrains Mono", monospace; font-size: 7.5pt; }
</style>`;

function renderJourneyTracker(data, helpers) {
  const stages = [
    { num: "01", name: "TSA Verification & Student Certificate", refs: "§ 61.83 / § 1552", chips: "A.14" },
    { num: "02", name: "Pre-Solo Aeronautical Knowledge Test", refs: "§ 61.87(b)", chips: "A.3" },
    { num: "03", name: "Pre-Solo Flight Training Proficiency", refs: "§ 61.87(c)", chips: "A.4" },
    { num: "04", name: "First Local Solo Authorization (90 Days)", refs: "§ 61.87(n)", chips: "A.6" },
    { num: "05", name: "Night Solo Training & Authorization", refs: "§ 61.87(o)", chips: "A.8" },
    { num: "06", name: "Solo Cross-Country Flight Training", refs: "§ 61.93(c)(1)", chips: "A.9" },
    { num: "07", name: "Solo Cross-Country Route Planning Review", refs: "§ 61.93(c)(3)", chips: "A.10" },
    { num: "08", name: "Repeated Solo Cross-Country (50 NM)", refs: "§ 61.93(b)(2)", chips: "A.11" },
    { num: "09", name: "Class B Airspace Solo Operation", refs: "§ 61.95(a)", chips: "A.12" },
    { num: "10", name: "Airman Knowledge Test Recommendation", refs: "§ 61.35(a)", chips: "A.32" },
    { num: "11", name: "AKTR Written Deficiency Review", refs: "§ 61.39(a)(6)(iii)", chips: "A.2" },
    { num: "12", name: "Practical Test Readiness (60-Day Signoff)", refs: "§ 61.39(a)(6)(i)", chips: "A.1, A.33" },
  ];

  const rows = stages.map(s => `<tr>
    <td class="jt-stage-num">${s.num}</td>
    <td><strong>${s.name}</strong></td>
    <td>${s.refs}</td>
    <td class="jt-pills">${s.chips}</td>
    <td style="width:55pt"></td>
    <td style="width:55pt"></td>
    <td style="width:35pt"></td>
  </tr>`).join("\n");

  return `<div class="page-break jt-wrap">
    <div class="jt-header">
      <h2 class="jt-title" id="journey-tracker">Appendix — Student Pilot Stage Progression Tracker</h2>
      <p class="jt-sub">12-Stage progression ledger for student pilot tracking from zero time through practical test checkride recommendation.</p>
    </div>
    <div class="jt-meta-grid">
      <div class="jt-meta-field"><span class="jt-meta-lbl">Student Name</span><div class="jt-meta-line"></div></div>
      <div class="jt-meta-field"><span class="jt-meta-lbl">FTN / Certificate #</span><div class="jt-meta-line"></div></div>
      <div class="jt-meta-field"><span class="jt-meta-lbl">Training Start Date</span><div class="jt-meta-line"></div></div>
    </div>
    <table class="jt-table">
      <thead>
        <tr>
          <th>Stg</th>
          <th>Curriculum Milestone</th>
          <th>FAR Authority</th>
          <th>Endorsements</th>
          <th>Completed</th>
          <th>Expires</th>
          <th>CFI Init</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

module.exports = {
  title: "Appendix — Student Pilot Stage Progression Tracker",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderJourneyTracker(data, helpers);
  },
};
