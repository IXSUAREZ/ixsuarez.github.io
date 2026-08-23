"use strict";
const fs = require("fs");
const h = fs.readFileSync(__dirname + "/preview-part1-cat-d.html", "utf8");

console.log("— category banners —");
for (const m of h.matchAll(/<section class="category-banner"[\s\S]{0,220}/g))
  console.log(m[0].slice(0, 240), "\n···");

console.log("— supplemental row —");
console.log(h.match(/<div class="p1cd-supp">[\s\S]{0,400}/)[0].slice(0, 420));

console.log("\n— xref line —");
console.log(h.match(/<p class="p1cd-xref">[\s\S]{0,300}/)[0]);

for (const id of ["A-60", "A-59", "A-79"]) {
  const m = h.match(
    new RegExp(
      `<article class="endorsement-card" id="${id}"[\\s\\S]*?<div class="ec-related">([\\s\\S]*?)</div>`
    )
  );
  console.log(`\n— ${id} related —\n`, m ? m[1] : "NOT FOUND");
}

const sf = h.match(/<div class="ec-cfr">\s*<span class="chip cfr-chip">SFAR 73[^<]*<\/span>/);
console.log("\n— SFAR chip —\n", sf[0]);
