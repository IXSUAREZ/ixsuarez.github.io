"use strict";

/**
 * sections/36-expiration-calculator.js — Endorsement Time Limits & Expiration Math.
 */

const SCOPED_CSS = `<style>
.exp-wrap { margin-top: 10pt; }
.exp-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.exp-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 15pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.exp-sub { font-size: 9.5pt; color: #475569; margin: 0; }
.exp-card { padding: 8pt 10pt; background: #f8fafc; border: 0.75pt solid #cbd5e1; border-radius: 4pt; margin-bottom: 8pt; font-size: 9.5pt; line-height: 1.4; break-inside: avoid; }
.exp-card h4 { margin: 0 0 3pt 0; color: #0f172a; font-size: 11.5pt; font-weight: 800; }
.exp-rule-box { background: #ffffff; border-left: 3pt solid #2563eb; padding: 5pt 9pt; margin: 5pt 0; font-family: "JetBrains Mono", monospace; font-size: 9.0pt; }
</style>`;

function renderExpirationCalc(data, helpers) {
  return `<div class="page-break exp-wrap">
    <div class="exp-header">
      <h2 class="exp-title" id="expiration-calculator">Appendix — FAR Time Limits &amp; Expiration Computation</h2>
      <p class="exp-sub">Mathematical guide for computing calendar months, exact calendar days, and recency validity under 14 CFR Part 61.</p>
    </div>
    <div class="exp-card">
      <h4>Calendar Month vs. Calendar Day Rule (§ 61.39 / § 61.56 / § 61.87)</h4>
      <p>A <strong>Calendar Month</strong> expires at midnight on the last day of the corresponding month, regardless of the start day of the month.</p>
      <div class="exp-rule-box">Example: Flight Review (§ 61.56) conducted on May 4, 2024 &rarr; Valid through May 31, 2026.</div>
      <p>A <strong>Calendar Day</strong> computation (e.g. 90-day solo flight under § 61.87(p)) is an exact count of 90 days following the date of endorsement.</p>
      <div class="exp-rule-box">Example: 90-Day Solo signed on June 10 &rarr; Day 90 is September 8.</div>
    </div>
    <div class="exp-card">
      <h4>Checkride Practical Test 2-Calendar-Month Window (§ 61.39(a)(6))</h4>
      <p>The instructor's practical test recommendation must be signed within the 2 calendar months preceding the month of application.</p>
      <div class="exp-rule-box">Example: Checkride on October 15 &rarr; Signoff valid if signed in August, September, or October.</div>
    </div>
  </div>`;
}

module.exports = {
  title: "Appendix — Expiration Computation & FAR Time Limits",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderExpirationCalc(data, helpers);
  },
};
