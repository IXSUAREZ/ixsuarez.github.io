"use strict";

module.exports = {
  title: "Cover",
  render(data, helpers) {
    return `<div class="cover cov-wrap">
  <div class="cov-placeholder">Simply Endorsed CFI</div>
  <span class="pgm" aria-hidden="true">ZZPGM|cover:end|ZZ</span>
</div>
<style>
.cover.cov-wrap {
  width: 8.5in;
  height: 11in;
  display: flex;
  align-items: center;
  justify-content: center;
  break-after: page;
}
.cov-placeholder {
  font-family: "Inter Tight", "Inter", sans-serif;
  font-size: 24pt;
  font-weight: 800;
  color: #0f172a;
}
</style>`;
  },
};
