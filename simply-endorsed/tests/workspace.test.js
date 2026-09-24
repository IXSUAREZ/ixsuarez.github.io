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
function app(search = "", sharedAppearance = false) {
  const errors = [],
    virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e));
  const dom = new JSDOM('<div id="se-workspace"></div>', {
    url: "http://localhost/simply-endorsed-cfi/" + search,
    runScripts: "outside-only",
    virtualConsole,
  });
  const w = dom.window;
  w.__lastScrollTo = null;
  w.scrollTo = (x, y) => { w.__lastScrollTo = [x, y]; };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  // Any accidental answer persistence is an immediate failure, including inherited scripts.
  w.Storage.prototype.setItem = () => {
    throw new Error("Checklist must not use browser storage");
  };
  w.__mediaChange = null;
  w.matchMedia = () => ({addEventListener: (_event, callback) => {w.__mediaChange=callback;}});
  if (sharedAppearance) {
    let preference="dark";
    w.SuarezAppearance={getPreference:()=>preference,setPreference:value=>{preference=value;w.dispatchEvent(new w.Event("suarez:appearance"));}};
  }
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
  if (el.type === 'checkbox') {
    if (value === 'na') doc.querySelector(`[data-na="${el.dataset.check}"]`).click();
    else { el.checked = value === 'done'; el.dispatchEvent(new w.Event('change', {bubbles:true})); }
    return;
  }
  el.value = value;
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
}
check(
  doc.querySelector("h1").textContent === "What’s the next milestone?",
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
    doc.querySelector(".se-guidance-body").textContent.length > 50,
    "Guidance has content " + mode,
  );
  const topics = [...doc.querySelectorAll('.se-guide-question')].map(a=>({href:a.getAttribute('href'),title:a.textContent}));
  for (const topic of topics) {
    go(topic.href);
    check(doc.querySelectorAll('.se-guide-article').length === 1, 'One focused article for ' + topic.title);
    check(doc.querySelector('.se-guide-article h1').textContent === topic.title, 'Question title retained: ' + topic.title);
    check(doc.querySelector('.se-guide-article').textContent.length > topic.title.length + 20, 'Answer content retained: ' + topic.title);
    check(doc.querySelector('.se-back-link'), 'Reading view has return navigation');
  }
}
const first = M.task("first-solo");
go('?view=tasks');
doc.querySelector('.se-task-card[href*="task=new-student"]').click();
check(doc.querySelector('h1').textContent === 'New student' && doc.querySelector('[data-check]'), 'New student opens the intake checklist directly');
for (const topic of M.guidanceTopics()) {
  go('?view=guidance&mode=' + topic.mode + '&topic=' + topic.id);
  check(doc.querySelector('.se-guide-article'), 'Every searchable Guidance topic opens a reading view: ' + topic.id);
}
for (const category of Object.keys(M.categories)) {
  go('?view=library');
  doc.querySelector('.se-category-rail a[href*="category=' + category + '"]').click();
  check(doc.querySelector('h1').textContent === M.categories[category][0], 'Direct category heading: ' + category);
  check(!doc.querySelector('.se-filter'), 'No filter panel competes with category content');
  check(!doc.querySelector('[data-filter="path"]'), 'Category lookup does not duplicate the tree with a path dropdown');
  check(doc.querySelector('.se-breadcrumb').textContent.includes(M.categories[category][0]), 'Category breadcrumb keeps lookup context: ' + category);
}
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
change('[data-check="solo-documents"]', "done");
doc.querySelector('.se-item-details').open = true;
change('[data-check="solo-documents"]', "todo");
check(doc.querySelectorAll('.se-item-details[open]').length === 1, 'Reviewing an item preserves only its own open explanation');
change('[data-check="solo-documents"]', "done");
check(doc.querySelector("#se-progress"), "First checkbox starts the checklist immediately");
check(!doc.querySelector('.se-active-bar'), 'Current checklist does not duplicate its own navigation');
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
go("?view=library&expanded=A.4");
check(doc.querySelectorAll('.se-detail-disclosure').length === 2, 'Supporting guidance and sources remain independent disclosures');
check(doc.querySelector('.se-wording blockquote') && !doc.querySelector('.se-wording details'), 'Model wording is immediately visible');
const guidanceDisclosure = doc.querySelector('#detail-A\\.4-guidance');
guidanceDisclosure.open = true;
guidanceDisclosure.dispatchEvent(new w.Event('toggle'));
doc.querySelector('.se-endorsement-row[href*="expanded=A.5"]').click();
doc.querySelector('.se-endorsement-row[href*="expanded=A.4"]').click();
check(doc.querySelector('#detail-A\\.4-guidance').open, 'Detail disclosure state survives switching endorsements during a visit');
doc.querySelector('#detail-A\\.4-guidance').open = false;
doc.querySelector('#detail-A\\.4-guidance').dispatchEvent(new w.Event('toggle'));
doc.querySelector('.se-endorsement-row[href*="expanded=A.5"]').click();
doc.querySelector('.se-endorsement-row[href*="expanded=A.4"]').click();
check(!doc.querySelector('#detail-A\\.4-guidance').open, 'Closing a visited disclosure remains closed after switching away and back');
doc.getElementById('detail-A.4-guidance').open = true;
doc.querySelector('.se-category-rail a[href*="category=private-pilot"]').click();
doc.querySelector('.se-category-rail a[href*="category=student-pilot"]').click();
doc.querySelector('.se-endorsement-row[href*="expanded=A.4"]').click();
check(doc.getElementById('detail-A.4-guidance').open, 'Disclosure preferences survive browsing another category');
check(doc.querySelector('.se-facts').textContent.includes('Who signs') && doc.querySelector('.se-facts').textContent.includes('Timing'), 'Signer and timing remain visible before disclosures open');
go('?view=library&category=student-pilot&subcategory=first-solo&expanded=A.6');
check(doc.querySelector('[data-action="close-detail"]').textContent.includes('First Solo'), 'Deep-linked detail returns to its selected path');
check(doc.querySelector('.se-detail > .se-source').textContent.includes('61.87(n)'), 'CFR stays immediately visible above quick facts');
w.history.replaceState({seWorkspaceScroll:73}, '', '?view=library');
w.dispatchEvent(new w.PopStateEvent('popstate', {state:{seWorkspaceScroll:73}}));
check(w.__lastScrollTo?.[1] === 73, 'Browser history restoration returns to the captured lookup scroll position');
go("?view=library&category=private-pilot&issuer=examiner-only");
check(doc.querySelector(".se-empty"), "Filtered empty state");
check(
  !doc.querySelector(".se-disclosure"),
  "No unrelated requirement summaries in empty state",
);
go("?view=guidance&mode=dpe");
doc.querySelector('.se-guide-question').click();
check(doc.querySelector('.se-guide-article [data-flash]'), 'Flashcard answer has a directly accessible review control');
go("?view=library&expanded=missing-endorsement");
check(!doc.querySelector('.has-detail'), 'Invalid endorsement link does not hide the mobile list');
check(doc.querySelectorAll('.se-endorsement-row').length === 96, 'Invalid detail recovers the full library');
check(doc.querySelectorAll('.se-category-rail .se-category-choice').length === 13, 'All colored categories available in the rail');
check(doc.querySelectorAll('#se-category-dialog .se-category-choice').length === 13, 'Mobile chooser includes every category');
check(doc.querySelectorAll('#se-category-dialog .se-subcategory').length === 71, 'Full-screen chooser includes all 71 subcategories');
for (const category of Object.keys(M.categories)) {
  const group = doc.querySelector('#se-category-dialog [data-category="' + category + '"]');
  check(group.tagName === 'DETAILS' && group.querySelector('summary'), 'Category has a native expandable control: ' + category);
  check(group.querySelectorAll('.se-subcategory').length === M.paths.filter(p=>p.category===category).length, 'Every subcategory appears in its parent: ' + category);
}
doc.querySelector('#se-category-dialog a[href*="subcategory=first-solo"]').click();
check(doc.querySelector('h1').textContent === 'First Solo', 'Choosing a nested subcategory opens that exact path');
check(doc.querySelector('.se-breadcrumb').textContent.includes('Student pilot') && doc.querySelector('.se-breadcrumb').textContent.includes('First Solo'), 'Selected subcategory has a contextual breadcrumb');
go('?view=library&category=private-pilot&issuer=examiner-only');
doc.querySelector('.se-category-rail a[href*="category=private-pilot"]').click();
check(doc.querySelectorAll('.se-endorsement-row').length === 2, 'One category click immediately opens its endorsements');
doc.querySelector('.se-category-rail a[href*="subcategory=private-airplane-initial-checkride-bundle"]').click();
check(doc.querySelectorAll('.se-endorsement-row').length === 4, 'Selecting a nested category path clears stale filters and shows the full bundle');
doc.querySelector('.se-endorsement-row').click();
doc.querySelector('[data-action="close-detail"]').click();
check(!w.location.search.includes('expanded'), 'Closing an endorsement clears its URL state');
check(doc.activeElement.classList.contains('se-endorsement-row'), 'Closing detail restores the list opener');
go('?view=library&q=first+solo');
check(doc.querySelectorAll('.se-search-group').length >= 2, 'Search groups different result types for lookup');
check(doc.querySelector('.se-search-group').textContent.includes('Endorsements'), 'Search labels endorsement results');
check([...doc.querySelectorAll('.se-search-group > h2')].some(h=>h.textContent.includes('Checklists')), 'Search labels checklist workflows separately');
doc.querySelector('.se-search-result[href*="expanded="]').click();
doc.querySelector('[data-action="close-detail"]').click();
check(w.location.search.includes('q=first+solo'), 'Returning from a search result preserves the search');
check(doc.querySelector('.se-search-result'), 'Returning restores result list');
doc.querySelector('[data-action="clear-search"]').click();
check(!w.location.search.includes('q='), 'Clearing search removes the reload query');
check(doc.querySelector('.se-category-rail'), 'Clearing search restores category navigation');
go('?view=tasks');
check(doc.querySelectorAll('.se-task-card').length === 6, 'Six task starting points');
check(doc.querySelectorAll('.se-quick .se-path').length === 4, 'Four common task shortcuts');
doc.querySelector('.se-primary-nav a[href*="collection=categories"]').click();
check(doc.querySelectorAll('.se-category-tile').length === 13, 'Library destination opens all colored categories');
check(doc.querySelectorAll('.se-category-tile .se-subcategory').length === 71, 'Category landing contains all paths');
for (const [taskId, associations] of Object.entries(M.taskGuidance)) {
  check(!!M.task(taskId), 'Guidance association uses a real task: '+taskId);
  for (const [mode,id] of associations) check(M.guidanceTopics().some(g=>g.mode===mode && g.id===id), 'Guidance topic exists: '+mode+'/'+id);
}
for (const id of ['first-solo','night-solo','private-airplane-initial-checkride-bundle','instrument-proficiency-check']) {
  go('?view=tasks&task='+id);
  check(doc.querySelectorAll('.se-related details').length >= 3, 'Contextual guidance renders for '+id);
  for (const link of doc.querySelectorAll('.se-section-nav a')) check(!!doc.querySelector(link.getAttribute('href')), 'Section link resolves: '+link.hash);
}
for (const type of ['tasks','guidance']) {
  go('?view=library&q=solo');
  const result=doc.querySelector('.se-search-result[href*="view='+type+'"]');
  check(!!result, 'Search has '+type+' results');
  const href=result.getAttribute('href');
  result.click();
  check(!doc.querySelector('.se-search-group'), 'Search result opens its content');
  doc.querySelector('[data-action="back-search"]').click();
  check(w.location.search.includes('q=solo'), 'Search query returns from '+type);
  check(doc.activeElement.getAttribute('href')===href, 'Search result focus returns from '+type);
}
go('?view=tasks&task=first-solo');
const disclosure=doc.querySelector('.se-related details');
disclosure.open=true;
const disclosureId=disclosure.id;
doc.querySelector('a[href*="expanded=A.3"]').click();
check(!!doc.querySelector('.se-wording blockquote') && !doc.querySelector('.se-wording').closest('details'), 'Model wording immediately visible');
doc.querySelector('[data-action="close-detail"]').click();
check(doc.getElementById(disclosureId).open, 'Context guidance expansion survives detail roundtrip');
check(!x.errors.length, x.errors.map((e) => e.stack).join("\n"));
x.close();
const appearanceApp=app("",true);
check(appearanceApp.doc.documentElement.dataset.theme==="dark","Current shared API initializes dark");
appearanceApp.doc.querySelector('[data-appearance="day"]').click();
check(appearanceApp.w.SuarezAppearance.getPreference()==="light","Day maps to shared light preference");
check(appearanceApp.doc.documentElement.dataset.theme==="day","Shared light renders Day tokens");
appearanceApp.doc.querySelector('[data-appearance="system"]').click();
check(appearanceApp.doc.querySelector('[data-appearance="system"]').getAttribute('aria-pressed')==="true","System selection synchronizes controls");
appearanceApp.close();
const responsiveApp=app("?view=tasks&task=first-solo&expanded=A.3");
responsiveApp.doc.querySelector("#se-main").focus();
responsiveApp.w.innerWidth=390;
responsiveApp.w.__mediaChange();
check(responsiveApp.doc.activeElement.id==="se-detail-title", "Narrow layout moves focus out of hidden main content");
check(responsiveApp.w.location.search.includes("expanded=A.3"), "Resize retains selected detail");
responsiveApp.close();
async function verifyClipboard() {
  const copyApp = app("?view=tasks&task=first-solo&expanded=A.3");
  let copied;
  Object.defineProperty(copyApp.w.navigator, "clipboard", {value:{writeText:async text=>{copied=text;}},configurable:true});
  copyApp.doc.querySelector('[data-action="copy"]').click();
  await new Promise(resolve=>setImmediate(resolve));
  check(copied === "I certify that [First name, MI, Last name] has satisfactorily completed the pre-solo knowledge test of 14 CFR § 61.87(b) for the [make and model (M/M)] aircraft.", "Clipboard receives exact A.3 wording");
  check(copyApp.doc.querySelector("#se-feedback").textContent.includes("copied"), "Copy success announced");
  copyApp.w.navigator.clipboard.writeText=async()=>{throw new Error("denied");};
  copyApp.doc.querySelector('[data-action="copy"]').click();
  await new Promise(resolve=>setImmediate(resolve));
  check(copyApp.doc.querySelector("#se-feedback").textContent.includes("manually"), "Clipboard denial gives manual recovery");
  check(copyApp.doc.querySelector(".se-wording blockquote").textContent===copied, "Manual recovery retains exact selectable wording");
  copyApp.close();
}
verifyClipboard().then(()=>console.log(
  "PASS: " +
    checks +
    " workspace assertions (71 paths, 96 details, six guidance modes, checklist lifecycle, condition handling and content regressions).",
)).catch(error=>{console.error(error);process.exitCode=1;});
