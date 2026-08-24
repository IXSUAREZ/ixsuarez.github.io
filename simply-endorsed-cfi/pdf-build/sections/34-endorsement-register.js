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
.reg-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 15pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.reg-sub { font-size: 9.5pt; color: #475569; margin: 0; line-height: 1.35; }
.reg-table { width: 100%; border-collapse: collapse; font-size: 9.0pt; margin-top: 8pt; }
.reg-table th, .reg-table td { border: 0.5pt solid #cbd5e1; padding: 4pt 6pt; text-align: left; height: 22pt; }
.reg-table th { background: #0f172a; color: #ffffff; font-weight: 700; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.04em; }
.reg-col-date { width: 65pt; }
.reg-col-name { width: 140pt; }
.reg-col-id { width: 50pt; text-align: center; }
.reg-col-exp { width: 75pt; }
.reg-col-result { width: 65pt; text-align: center; }
.reg-col-init { width: 45pt; text-align: center; }
</style>`;

function renderRegister(data, helpers) {
  const rows = Array.from({ length: 18 }, (_, i) => `<tr>
    <td class="reg-col-date"></td>
    <td class="reg-col-name"></td>
    <td class="reg-col-id mono"></td>
    <td class="reg-col-exp"></td>
    <td class="reg-col-result"></td>
    <td class="reg-col-init"></td>
  </tr>`).join("\n");

  return `<div class="page-break reg-wrap">
    <div class="reg-header">
      <h2 class="reg-title" id="endorsement-register">Appendix — 14 CFR § 61.189 Flight Instructor Endorsement Register</h2>
      <p class="reg-sub">Official instructor signoff ledger. 14 CFR § 61.189 requires flight instructors to maintain a record of each person endorsed for solo flight and practical tests for at least 3 years.</p>
    </div>
    <table class="reg-table">
      <thead>
        <tr>
          <th class="reg-col-date">Date</th>
          <th class="reg-col-name">Student Full Name &amp; FTN</th>
          <th class="reg-col-id">AC Item</th>
          <th class="reg-col-exp">Expiration</th>
          <th class="reg-col-result">Test / Result</th>
          <th class="reg-col-init">Initials</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

module.exports = {
  title: "Appendix — 14 CFR § 61.189 Endorsement Register",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderRegister(data, helpers);
  },
};
