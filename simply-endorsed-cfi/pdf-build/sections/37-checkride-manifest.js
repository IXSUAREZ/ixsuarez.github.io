"use strict";

/**
 * sections/37-checkride-manifest.js — Practical Test Applicant Document Manifests.
 */

const SCOPED_CSS = `<style>
.chk-wrap { margin-top: 10pt; }
.chk-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.chk-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 15pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.chk-sub { font-size: 8pt; color: #475569; margin: 0; }
.chk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; }
.chk-card { padding: 8pt 10pt; background: #ffffff; border: 0.75pt solid #cbd5e1; border-top: 3pt solid #0f172a; border-radius: 4pt; font-size: 7.5pt; break-inside: avoid; }
.chk-card-h { font-family: "Inter Tight", "Inter", sans-serif; font-size: 9.5pt; font-weight: 800; color: #0f172a; margin: 0 0 4pt 0; }
.chk-list { list-style: none; margin: 0; padding: 0; }
.chk-item { margin-bottom: 3pt; padding-left: 8pt; position: relative; line-height: 1.35; }
.chk-item::before { content: "□"; position: absolute; left: 0; color: #64748b; font-weight: 800; }
</style>`;

function renderCheckrideManifest(data, helpers) {
  return `<div class="page-break chk-wrap">
    <div class="chk-header">
      <h2 class="chk-title" id="checkride-manifest">Appendix — Practical Test DPE Applicant Manifests</h2>
      <p class="chk-sub">Checkride day verification checklists for Private, Commercial, Instrument, and CFI initial practical tests.</p>
    </div>
    <div class="chk-grid">
      <div class="chk-card">
        <h3 class="chk-card-h">Private Pilot (ASEL) Checkride Manifest</h3>
        <ul class="chk-list">
          <li class="chk-item">IACRA 8710-1 Application signed by applicant &amp; CFI</li>
          <li class="chk-item">FAA Airman Knowledge Test Report (AKTR) with passing score</li>
          <li class="chk-item">A.2 Written Test Deficiency Review (§ 61.39(a)(6)(iii))</li>
          <li class="chk-item">A.1 Prerequisites for Practical Test (§ 61.39(a)(6)(i))</li>
          <li class="chk-item">A.33 Private Pilot Airplane Practical Test (§ 61.107 / § 61.109)</li>
          <li class="chk-item">Government photo ID, Pilot Certificate &amp; Medical / BasicMed</li>
        </ul>
      </div>
      <div class="chk-card">
        <h3 class="chk-card-h">Instrument Rating (Airplane) Manifest</h3>
        <ul class="chk-list">
          <li class="chk-item">IACRA 8710-1 Application submitted and verified</li>
          <li class="chk-item">IRA Knowledge Test Report + A.2 Deficiency Signoff</li>
          <li class="chk-item">A.1 Practical Test 60-Day Recommendation</li>
          <li class="chk-item">A.38 Instrument Airplane Practical Test (§ 61.65)</li>
          <li class="chk-item">Cross-country 250 NM instrument training logbook entry</li>
          <li class="chk-item">View-limiting device, current charts, and IFR approach plates</li>
        </ul>
      </div>
    </div>
  </div>`;
}

module.exports = {
  title: "Appendix — Practical Test DPE Applicant Manifests",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderCheckrideManifest(data, helpers);
  },
};
