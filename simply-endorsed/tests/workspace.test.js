"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");
const files = [
  "shared-utils",
  "cfr-links",
  "endorsements-data",
  "browse-structure",
  "guidance-content",
  "training-requirements-data",
  "privileges-limitations-data",
  "workspace-model",
  "workspace",
];
const code = files
  .map((f) => fs.readFileSync(path.join(__dirname, "../js", f + ".js"), "utf8"))
  .join("\n");
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks++;
}
function app(search = "") {
  const errors = [],
    virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e));
  const dom = new JSDOM('<div id="se-workspace"></div>', {
    url: "http://localhost/simply-endorsed-cfi/" + search,
    runScripts: "outside-only",
    virtualConsole,
  });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  // Any accidental answer persistence is an immediate failure, including inherited scripts.
  w.Storage.prototype.setItem = () => {
    throw new Error("Checklist must not use browser storage");
  };
  w.eval(code);
  return { w, doc: w.document, errors, close: () => w.close() };
}
const x = app(),
  { w, doc } = x,
  M = w.SEWorkspace;
function go(q) {
  w.history.pushState({}, "", q);
  w.dispatchEvent(new w.PopStateEvent("popstate"));
}
function change(selector, value) {
  const el = doc.querySelector(selector);
  assert.ok(el, selector);
  el.value = value;
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
}
check(
  doc.querySelector("h1").textContent === "What are you working on?",
  "Tasks are the default",
);
check(M.paths.length === 71, "All 71 original paths retained");
check(w.ENDORSEMENTS.length === 96, "All 96 endorsements retained");
const ids = new Set(w.ENDORSEMENTS.map((e) => e.id));
for (const p of M.paths) {
  for (const id of [...p.primaryIds, ...(p.supplementalIds || [])])
    check(ids.has(id), p.id + " valid reference " + id);
  const t = M.task(p.id);
  check(
    new Set(t.items.map((i) => i.id)).size === t.items.length,
    p.id + " has stable unique item IDs",
  );
  for (const i of t.items) {
    check(!!i.refs && !!i.why, p.id + " items have sources and applicability");
    if (i.endorsement) check(ids.has(i.endorsement), "Task reference exists");
  }
  go("?view=tasks&task=" + p.id);
  check(
    doc.querySelector("h1").textContent === p.label,
    "Task renders " + p.id,
  );
  go("?category=" + p.category + "&subcategory=" + p.id + "&bundle=full");
  check(
    doc.querySelector("h1").textContent === p.label,
    "Legacy path resolves " + p.id,
  );
}
for (const e of w.ENDORSEMENTS) {
  go("?view=library&expanded=" + e.id);
  check(
    doc.querySelector("#se-detail-title")?.textContent === e.title,
    "Detail reachable " + e.id,
  );
}
for (const [mode, label] of M.guidanceModes) {
  go("?view=guidance&mode=" + mode);
  check(
    doc.querySelector("h1").textContent === label,
    "Guidance renders " + mode,
  );
  check(
    doc.querySelector(".se-guidance-body").textContent.length > 200,
    "Guidance has content " + mode,
  );
}
const first = M.task("first-solo");
for (const id of ["A.3", "A.4", "A.6"])
  check(
    first.items.some((i) => i.endorsement === id && !i.conditional),
    "First solo requires " + id,
  );
check(
  first.items.some((i) => i.endorsement === "A.5" && i.conditional),
  "Night is conditional on first solo",
);
for (const id of ["A.37", "A.1", "A.36", "A.2"])
  check(
    M.task("private-airplane-initial-checkride-bundle").items.some(
      (i) => i.endorsement === id,
    ),
    "Full initial package " + id,
  );
check(
  M.task("private-airplane-add-on-bundle").items.some(
    (i) => i.endorsement === "A.76" && i.conditional,
  ),
  "Unrated solo considered on add-on",
);
check(
  M.task("retest-after-disapproval").items.some(
    (i) => i.endorsement === "A.1" && i.conditional,
  ),
  "Practical vs knowledge retest distinguished",
);
check(
  M.task("flight-review-and-wings")
    .items.filter((i) => i.endorsement)
    .every((i) => i.conditional),
  "Flight review and WINGS are alternatives",
);
check(
  M.search("first solo")[0].id === "first-solo",
  "Exact matching task appears first",
);
check(
  M.search("first solo").some(
    (r) => r.type === "Endorsement" && r.id === "A.4",
  ),
  "First solo search includes A.4 through its complete task",
);
check(
  M.search("first solo").some((r) => r.id === "first-solo"),
  "Complete first solo workflow found",
);
check(
  w.FLASHCARD_DECK.find((f) => f.id === "fc-01").answer.includes("A.6"),
  "First solo flashcard includes A.6",
);
check(
  w.QUICK_REF_DATA.acFarTable
    .find((r) => r.acRef === "A.5")
    .expiration.includes("night training"),
  "Night timing corrected",
);
check(
  !w.CFI_CAREER_DATA.initialCfiTrainer.flightOptions
    .join(" ")
    .includes("61.95(h)"),
  "CFI citation corrected",
);
go("?view=tasks&task=first-solo");
doc.querySelector('[data-action="start"]').click();
check(doc.querySelector(".se-active-bar"), "Active checklist visible");
change('[data-check="solo-documents"]', "done");
change('[data-check="endorsement-A.5"]', "na");
check(
  !doc.querySelector('[data-check="solo-documents"] option[value="na"]'),
  "Required item cannot be NA",
);
check(
  doc.querySelector("#se-progress").textContent.includes("2 of"),
  "Progress counts reviewed and conditional NA",
);
check(
  doc.querySelector('[data-check="completion"]').disabled,
  "Cannot complete review with unresolved requirements",
);
const before = doc.querySelector("#se-progress").textContent;
go("?view=guidance&mode=reference");
check(doc.querySelector(".se-active-bar"), "Checklist accessible in guidance");
go("?view=library&expanded=A.4");
check(doc.querySelector(".se-active-bar"), "Checklist accessible in detail");
go("?view=tasks&task=first-solo");
check(
  doc.querySelector("#se-progress").textContent === before,
  "Progress survives route navigation",
);
check(
  doc.querySelector('[data-check="endorsement-A.5"]').value === "na",
  "Conditional answer survives navigation",
);
check(
  !w.location.search.includes("done") && !w.location.search.includes("na"),
  "Answers do not enter URL",
);
doc.querySelector('[data-action="reset"]').click();
check(
  doc.querySelector("#se-progress").textContent.startsWith("0 of"),
  "Explicit reset clears answers",
);
const reload = app("?view=tasks&task=first-solo");
check(
  !reload.doc.querySelector(".se-active-bar"),
  "Reload has no active checklist",
);
reload.close();
go("?view=tasks&task=flight-review-and-wings");
doc.querySelector('[data-action="start"]').click();
for (const i of M.task("flight-review-and-wings").items.filter(
  (i) => i.id !== "completion",
))
  change('[data-check="' + i.id + '"]', i.conditional ? "na" : "done");
check(
  doc.querySelector('[data-check="completion"]').disabled,
  "Both flight review alternatives cannot be NA",
);
change('[data-check="endorsement-A.69"]', "done");
check(
  !doc.querySelector('[data-check="completion"]').disabled,
  "Applicable reviewed alternative permits completion",
);
change('[data-check="completion"]', "done");
check(
  doc.querySelector("#se-progress").textContent.includes("Review complete"),
  "Completion is review, not an issued endorsement",
);
change('[data-check="endorsement-A.69"]', "na");
check(
  doc.querySelector('[data-check="completion"]').value === "todo",
  "Removing applicable alternative invalidates completion",
);
go("?view=library&expanded=A.18");
check(
  !doc.querySelector("blockquote").textContent.includes("Note:"),
  "Copy wording excludes trailing explanatory notes",
);
go("?view=library&expanded=A.40");
check(
  !doc.querySelector('[data-action="copy"]'),
  "Provider document instructions are not offered as an instructor signoff",
);
go("?view=library&category=private-pilot&issuer=examiner-only");
check(doc.querySelector(".se-empty"), "Filtered empty state");
check(
  !doc.querySelector(".se-disclosure"),
  "No unrelated requirement summaries in empty state",
);
go("?view=guidance&mode=dpe");
const summary = doc.querySelector(".se-disclosure summary");
check(
  summary.parentElement.tagName === "DETAILS",
  "Flashcards use native accessible disclosure",
);
check(!x.errors.length, x.errors.map((e) => e.stack).join("\n"));
x.close();
console.log(
  "PASS: " +
    checks +
    " workspace assertions (71 paths, 96 details, six guidance modes, checklist lifecycle, condition handling and content regressions).",
);
