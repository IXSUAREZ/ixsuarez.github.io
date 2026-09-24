(() => {
  "use strict";
  const M = window.SEWorkspace,
    root = document.getElementById("se-workspace");
  const E = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const linkText = (s) =>
    window.CfrLinks?.linkifyCfrText(String(s ?? ""), { linkBare: true }) ||
    E(s);
  let active = null,
    query = "",
    flashReady = new Set(),
    returnFocus = null,
    detailReturn = null,
    detailReturnScroll = null,
    detailDisclosures = new Set(),
    contentDisclosures = new Set(),
    detailScrolls = new Map();
  const parse = () => {
    const p = new URLSearchParams(location.search);
    return {
      view:
        p.get("view") === "guidance"
          ? "guidance"
          : p.get("view") === "library" ||
              p.get("view") === "browse" ||
              p.has("category") ||
              p.has("subcategory")
            ? "library"
            : p.get("view") === "tasks" || p.has("task") ? "tasks" : p.has("expanded") ? "library" : "tasks",
      collection: p.get("collection") || "",
      task: p.get("task") || "",
      group: p.get("group") || "",
      category: p.get("category") || "all",
      path: p.get("subcategory") || "",
      detail: window.ENDORSEMENTS.some(e => e.id === (p.get("expanded") || "").split(",")[0]) ? (p.get("expanded") || "").split(",")[0] : "",
      mode: p.get("mode") || "home",
      topic: p.get("topic") || "",
      issuer: p.get("issuer") || "all",
      validity: p.get("validity") || "all",
    };
  };
  let state = parse();
  query = new URLSearchParams(location.search).get("q") || "";
  const url = (changes) => {
    const s = { ...state, ...changes },
      p = new URLSearchParams();
    p.set("view", s.view);
    if (s.view === "tasks") {
      if (s.task) p.set("task", s.task);
      if (s.group) p.set("group", s.group);
    }
    if (s.view === "library") {
      if (s.collection) p.set("collection", s.collection);
      if (s.category !== "all") p.set("category", s.category);
      if (s.path) p.set("subcategory", s.path);
      if (s.issuer !== "all") p.set("issuer", s.issuer);
      if (s.validity !== "all") p.set("validity", s.validity);
    }
    if (s.view === "guidance") {
      p.set("mode", s.mode);
      if (s.topic) p.set("topic", s.topic);
    }
    if (s.detail) p.set("expanded", s.detail);
    return "?" + p;
  };
  const a = (label, changes, cls = "") =>
    `<a class="${cls}" href="${E(url(changes))}" data-route>${E(label)}</a>`;
  const icon = (name) => `<span class="se-icon" aria-hidden="true" style="--icon:url('/simply-endorsed/icons/ui/${name}.svg')"></span>`;
  const categoryStyle = (id) => {
    const [fill, bright] = M.categoryPresentation[id] || ["#426275", "#a9d0e5"];
    return `--category-fill:${fill};--category-bright:${bright}`;
  };
  const categoryBadge = (id) => `<span class="se-category-badge" style="${categoryStyle(id)}">${icon(M.categoryPresentation[id]?.[2] || "book-open")}${E(M.categories[id]?.[0] || "Reference")}</span>`;
  const destinations = [["tasks", "Tasks", "layout-grid"], ["library", "Library", "book-open"], ["guidance", "Guidance", "compass"]];
  function primaryNavigation() {
    return destinations.map(([v,label,symbol]) => `<a data-route href="${E(url({view:v, task:"", group:"", category:"all", path:"", detail:"", topic:"", mode:"home", collection:v==="library"?"categories":"",issuer:"all",validity:"all"}))}" ${state.view===v&&!query?'aria-current="page"':""}>${icon(symbol)}<span>${label}</span></a>`).join("");
  }
  const itemSection = (i) => i.section || (["completion","review"].includes(i.id) ? "Completion review" : i.conditional ? "Conditional items" : "Prerequisites");
  const sectionId = (text) => "se-section-" + text.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const source = (refs) =>
    `<p class="se-source">${linkText(refs)} · <a href="${E(M.source)}" target="_blank" rel="noopener">FAA AC 61-65K ↗</a></p>`;
  const endorsementLinks = (arr) =>
    `<div class="se-links">${arr.map((x) => a(typeof x === "string" ? x : x.id + " · " + x.label, { detail: typeof x === "string" ? x : x.id }, "se-link")).join("")}</div>`;
  function focusDestination() {
    const destination = state.detail ? document.getElementById("se-detail-title") : !query && state.topic ? document.getElementById("topic-" + state.topic)?.querySelector("summary, h2") : null;
    (destination || document.getElementById("se-title"))?.focus({ preventScroll: !!state.detail && window.innerWidth >= 900 });
    if (!state.detail || window.innerWidth < 900) window.scrollTo(0,0);
  }
  function navigate(changes) {
    query = "";
    history.pushState({}, "", url(changes));
    state = parse();
    render();
    focusDestination();
  }
  function modelText(e) {
    const match = e.verbatimText.match(/I (?:certify|have reviewed)/);
    if (!match) return { note: e.verbatimText, text: "" };
    const start = match.index,
      tail = e.verbatimText.slice(start),
      noteAt = tail.indexOf("Note:");
    return {
      note: [
        e.verbatimText.slice(0, start).trim(),
        noteAt >= 0 ? tail.slice(noteAt).trim() : "",
      ]
        .filter(Boolean)
        .join(" "),
      text: (noteAt >= 0 ? tail.slice(0, noteAt) : tail).trim(),
    };
  }
  function detailDisclosure(id, title, body, extra = "") {
    return `<details class="se-detail-disclosure" id="detail-${E(id)}" ${detailDisclosures.has(id) ? "open" : ""}><summary>${E(title)}<span aria-hidden="true">⌄</span></summary><div>${body}</div>${extra}</details>`;
  }
  function rememberDetailDisclosures() {
    root.querySelectorAll(".se-detail-disclosure").forEach((item) => {
      const id = item.id.replace(/^detail-/, "");
      if (item.open) detailDisclosures.add(id);
      else detailDisclosures.delete(id);
    });
  }
  function detail() {
    const e = window.ENDORSEMENTS.find((x) => x.id === state.detail);
    if (!e) return "";
    const currentPath = M.paths.find((p) => p.id === state.path);
    const backTarget = detailReturn && new URL(detailReturn, location.href).searchParams.has("q") ? "search results" : state.view === "tasks" ? M.task(state.task)?.label || "task" : state.view === "guidance" ? "guidance" : currentPath?.label || M.categories[state.category]?.[0] || "results";
    const copy = modelText(e),
      issuer =
        {
          "standard-cfi": "Authorized instructor",
          "examiner-only": "Examiner only",
          "dpe-or-asi-only": "DPE or ASI only",
          "approved-institution": "Approved institution",
          "non-instructor": "Qualified non-instructor",
        }[e.whoIssues] || e.whoIssues;
    const timing = e.id === "A.5" ? M.facts.night : e.id === "A.6" ? M.facts.soloWindow : e.id === "A.1" ? M.facts.testWindow : e.perFlight ? "Review for each flight" : e.expiration === "none" ? "No standalone expiration stated; other currency requirements may apply" : e.expiration.replaceAll("-", " ");
    const guidance = `<div class="se-prose">${e.explanation
      .split("\n")
      .filter(Boolean)
      .map((t) => `<p>${linkText(t.replace(/^•\s*/, ""))}</p>`)
      .join(
        "",
      )}</div>`;
    const wording = `${copy.note ? `<p class="se-notice">${E(copy.note)}</p>` : ""}<p class="se-small">Replace bracketed fields in your actual logbook entry. Checking this workspace never issues an endorsement.</p>${copy.text ? `<div class="se-row"><p class="se-small">FAA model text</p><button data-action="copy" class="se-primary">Copy model text</button></div><blockquote>${E(copy.text)}</blockquote>` : "<p>Obtain the required document from the approved provider. The AC supplies instructions rather than a reusable instructor signoff here.</p>"}`;
    const regulations = `<p class="se-source">${linkText(e.cfr.join(" · "))}</p><p class="se-source"><a href="${E(M.source)}#page=${33 + Number(e.sourcePage.split("-")[1])}" target="_blank" rel="noopener">View FAA source · ${E(e.sourcePage)} ↗</a></p>`;
    return `<aside class="se-detail" data-endorsement="${E(e.id)}" style="${categoryStyle(e.category)}" aria-label="Endorsement details"><div class="se-detail-top"><button data-action="close-detail">← Back to ${E(backTarget)}</button><span>${E(e.id)}</span></div>${categoryBadge(e.category)}<h2 id="se-detail-title" tabindex="-1">${E(e.title)}</h2><p class="se-source">${linkText(e.cfr.join(" · "))}</p><div class="se-facts"><p><strong>Who signs</strong>${E(issuer)}</p><p><strong>Timing</strong>${E(timing)}</p></div><section class="se-wording" aria-label="${copy.text ? "FAA model wording" : "Provider-issued document"}">${wording}</section>${detailDisclosure(e.id + "-guidance", "Instructor guidance", guidance)}${detailDisclosure(e.id + "-sources", "Regulations & sources", regulations)}</aside>`;
  }
  function taskCard(id, label) {
    const t = M.task(id);
    if (!t) return "";
    return `<a class="se-path" style="${categoryStyle(t.category)}" data-route href="${E(url({ view: "tasks", task: id, group: "", detail: "" }))}">${categoryBadge(t.category)}<strong>${E(label || t.label)}</strong>${icon("chevron-right")}</a>`;
  }
  function tasks() {
    const t = M.task(state.task);
    if (t) return taskView(t);
    const group = M.groups.find((g) => g.id === state.group);
    if (group) return `<div class="se-heading">${a("← All tasks", { group: "", task: "" },"se-back-link")}<p class="se-eyebrow">Choose a workflow</p><h1 id="se-title" tabindex="-1">${E(group.title)}</h1><p>${E(group.description)}</p></div><div class="se-path-list">${group.ids.map(id=>taskCard(id)).join("")}</div>${a("Explore every category and specialty path", { view: "library", category: "all", collection:"categories", path: "", detail: "" }, "se-link")}`;
    const colors = ["student-pilot","student-pilot","practical-test-prereqs","private-pilot","specialty-operations","additional-recurrent"];
    const symbols = ["user-round","plane-takeoff","book-open","badge-check","layers","refresh-cw"];
    const titles = ["New Student","Solo","Knowledge Test","Checkride","Add a Rating","Recurrent & Aircraft"];
    return `<div class="se-heading se-home-heading"><p class="se-eyebrow">THE INSTRUCTOR WORKSPACE</p><h1 id="se-title" tabindex="-1">What’s the next milestone?</h1><p>Find the task. Review the requirements. Get the right endorsement.</p></div>${state.task?'<p class="se-notice">That task is unavailable. Choose a task below.</p>':""}<div class="se-task-grid">${M.groups.map((g,i)=>`<a href="${E(url({view:"tasks",group:g.id==="new"?"":g.id,task:g.id==="new"?"new-student":"",detail:""}))}" data-route class="se-task-card" style="${categoryStyle(colors[i])}"><div class="se-tile-top">${icon(symbols[i])}${icon("arrow-up-right")}</div><h2>${titles[i]}</h2><p>${E(g.description)}</p><span class="se-tile-footer">${g.id==="new"?"Open intake checklist":g.ids.length+" workflows"}</span></a>`).join("")}</div><section class="se-quick"><div class="se-section-heading"><h2>Quick access</h2><span>Common instructor tasks</span></div><div class="se-quick-grid">${[["first-solo","First Solo"],["private-airplane-initial-checkride-bundle","Private Pilot Checkride"],["flight-review-and-wings","Flight Review"],["instrument-proficiency-check","IPC"]].map(([id,label])=>taskCard(id,label)).join("")}</div></section><div class="se-bottom-links">${a("Explore the endorsement library →",{view:"library",collection:"categories",category:"all",path:"",detail:""})}<span>96 endorsements · FAA AC 61-65K</span></div>`;
  }
  function alternativeUnresolved(t) {
    return !!(
      t.oneOf?.length &&
      !t.oneOf.some((id) => active?.answers["endorsement-" + id] === "done")
    );
  }
  function taskView(t) {
    const running = active?.taskId === t.id;
    const remaining =
      running &&
      (alternativeUnresolved(t) ||
        t.items.some(
          (i) =>
            !["completion", "review"].includes(i.id) &&
            (!active.answers[i.id] || active.answers[i.id] === "todo"),
        ));
    let section = "";
    const items = t.items
      .map((i) => {
        const heading = itemSection(i);
        const header =
          heading !== section
            ? `<h2 class="se-section-title" id="${sectionId(heading)}" tabindex="-1">${E(heading)}</h2>`
            : "";
        section = heading;
        const status = running ? active.answers[i.id] || "todo" : "todo";
        const locked = (active && !running) || (["completion","review"].includes(i.id) && (!running || remaining));
        return `${header}<article style="${categoryStyle(i.endorsement ? window.ENDORSEMENTS.find(e=>e.id===i.endorsement)?.category : t.category)}" class="se-check-item ${status==="done"?"is-done":status==="na"?"is-na":""}"><div class="se-check-line"><label class="se-check-label"><input type="checkbox" data-check="${E(i.id)}" value="${status}" ${status==="done"?"checked":""} ${locked?"disabled":""} aria-label="${E(i.action)} review status"><span>${E(i.action)}</span></label><span class="se-status">${status==="done"?"Done":status==="na"?"Not applicable":i.conditional?"Check applicability":""}</span></div><div class="se-check-actions">${i.endorsement ? a("Open " + i.endorsement,{detail:i.endorsement},"se-inline-link") : ""}${i.conditional ? `<button class="se-na" data-na="${E(i.id)}" aria-pressed="${status==="na"}" ${active&&!running?"disabled":""}>${status==="na"?"Applies after all":"Not applicable"}</button>` : ""}<details class="se-item-details" id="requirement-${E(i.id)}"><summary aria-label="Details and source for ${E(i.action)}">Details & source</summary><p>${linkText(i.why)}</p>${source(i.refs)}</details></div>${locked&&["completion","review"].includes(i.id)?'<p class="se-small">Review the items above before completing this checklist.</p>':""}</article>`;
      })
      .join("");
    return `<div class="se-heading se-task-heading" style="${categoryStyle(t.category)}">${a("← All tasks",{task:"",group:"",detail:""},"se-back-link")}${categoryBadge(t.category)}<h1 id="se-title" tabindex="-1">${E(t.label)}</h1><p>${E(t.description || "Review each requirement, then open the endorsement you need.")}</p></div><section class="se-check-controls" aria-label="Temporary checklist">${running?`<div class="se-progress-toolbar"><div id="se-progress" role="status">${progress()}</div><button data-action="reset" data-task="${E(t.id)}">Reset</button></div>`:active?`<p class="se-notice">Replace your active ${E(M.task(active.taskId).label)} review to use this checklist.</p><button data-action="start" data-task="${E(t.id)}">Start this checklist</button>`:"<p>Tap a checkbox to begin.</p>"}<p class="se-small">Temporary review · clears on reload. Issue endorsements separately.</p></section><nav class="se-section-nav" aria-label="Task sections">${[...new Set(t.items.map(itemSection))].map(label=>`<a href="#${sectionId(label)}">${E(label)}</a>`).join("")}<a href="#se-related">Guidance</a></nav><div class="se-checklist">${items}</div>${["new-student","pre-solo"].includes(t.id)?preSolo():""}${relatedGuidance(t)}`;
  }
  function options(values, chosen) {
    return values
      .map((v) => `<option ${v === chosen ? "selected" : ""}>${E(v)}</option>`)
      .join("");
  }
  function progress() {
    if (!active) return "";
    const items = M.task(active.taskId).items,
      done = items.filter(
        (i) => active.answers[i.id] && active.answers[i.id] !== "todo",
      ).length,
      unresolved = items.filter(
        (i) =>
          i.conditional &&
          (!active.answers[i.id] || active.answers[i.id] === "todo"),
      ).length;
    return `<strong>${done} of ${items.length} reviewed</strong><progress value="${done}" max="${items.length}" aria-label="Checklist review progress"></progress><span>${alternativeUnresolved(M.task(active.taskId)) ? "Resolve the applicable alternative: " + M.task(active.taskId).oneOf.join(" or ") : unresolved ? unresolved + " condition" + (unresolved === 1 ? "" : "s") + " unresolved" : done === items.length ? "Review complete · actual endorsements must be issued separately" : "Continue reviewing the remaining items"}</span>`;
  }
  function categoryNavigation() {
    const selected = state.view === "tasks" ? M.task(state.task)?.category : M.paths.find(p => p.id === state.path)?.category || state.category;
    return `<nav class="se-category-nav" aria-label="Endorsement categories">${a("All endorsements", {view:"library",collection:"",category:"all",path:"",detail:"",issuer:"all",validity:"all"}, "se-category-all").replace("<a ", `<a ${selected==="all"?'aria-current="page"':""} `)}${Object.entries(M.categories).map(([id,[label,color]]) => `<details class="se-category-group" data-category="${id}" style="${categoryStyle(id)}" ${selected===id?'open':""}><summary class="se-category-choice">${icon(M.categoryPresentation[id]?.[2] || "book-open")}<span>${E(label)}</span></summary><div class="se-subcategories">${a("All " + label.toLowerCase() + " endorsements", {view:"library",collection:"",category:id,path:"",detail:"",issuer:"all",validity:"all"}, "se-category-overview")}${M.paths.filter(p=>p.category===id).map(p=>`<a class="se-subcategory" data-route href="${E(url({view:"library",collection:"",category:id,path:p.id,detail:"",issuer:"all",validity:"all"}))}" ${(state.path===p.id || (state.view==="tasks" && state.task===p.id))?'aria-current="page"':""}>${E(p.label)}</a>`).join("")}</div></details>`).join("")}</nav>`;
  }
  function categoryLibrary() {
    return `<div class="se-heading"><p class="se-eyebrow">FAA AC 61-65K</p><h1 id="se-title" tabindex="-1">Endorsement library</h1><p>Choose a category. Find every path and its supporting references.</p>${a("Browse all 96 endorsements →",{collection:"",category:"all",path:"",detail:""},"se-link")}</div><div class="se-category-grid">${Object.entries(M.categories).map(([id,[label]])=>`<details class="se-category-tile" style="${categoryStyle(id)}"><summary>${icon(M.categoryPresentation[id][2])}<strong>${E(label)}</strong><span>${M.paths.filter(p=>p.category===id).length} paths</span>${icon("chevron-right")}</summary><div>${a("All "+label.toLowerCase()+" endorsements",{collection:"",category:id,path:"",detail:"",issuer:"all",validity:"all"},"se-category-overview")}${M.paths.filter(p=>p.category===id).map(p=>a(p.label,{collection:"",category:id,path:p.id,detail:"",issuer:"all",validity:"all"},"se-subcategory")).join("")}</div></details>`).join("")}</div>`;
  }
  function library() {
    if (state.collection === "categories" && state.category === "all" && !state.path && !state.detail) return categoryLibrary();
    const p = M.paths.find((x) => x.id === state.path);
    const category = p?.category || state.category;
    const card =
      window.TRAINING_REQUIREMENT_CARDS.subcategoryCards[
        category + "/" + state.path
      ] || window.TRAINING_REQUIREMENT_CARDS.categoryCards[category];
    let entries = window.ENDORSEMENTS.filter((e) =>
      p
        ? [...(p.primaryIds || []), ...(p.supplementalIds || [])].includes(e.id)
        : category === "all" || e.category === category,
    );
    entries = entries.filter(
      (e) =>
        (state.issuer === "all" || e.whoIssues === state.issuer) &&
        (state.validity === "all" ||
          (state.validity === "per-flight"
            ? e.perFlight
            : e.expiration === state.validity)),
    );
    const categoryLabel = M.categories[category]?.[0] || "Endorsements";
    const breadcrumb = p ? `<nav class="se-breadcrumb" aria-label="Current category"><span>${E(categoryLabel)}</span><span aria-hidden="true">›</span><strong>${E(p.label)}</strong></nav>` : category !== "all" ? `<nav class="se-breadcrumb" aria-label="Current category"><strong>${E(categoryLabel)}</strong></nav>` : "";
    return `${breadcrumb}<div class="se-library-heading"><h1 id="se-title" tabindex="-1">${E(p?.label || categoryLabel)}</h1><span class="se-count">${entries.length} endorsements</span></div>${p?.description ? `<p class="se-path-description">${E(p.description)}</p>` : ""}${p ? a("Open complete task checklist →", { view: "tasks", task: p.id, detail: "" }, "se-workflow-link") : ""}${!entries.length ? `<div class="se-empty"><h2>${p?.contentRenderer ? "Start with the prerequisites" : "No endorsements match"}</h2><p>${p?.contentRenderer ? "This path contains preparation guidance. Open its checklist to review it." : "Choose a category or search for an endorsement."}</p>${a("Clear filters", { issuer: "all", validity: "all", path: "", category: "all", detail: "" }, "se-link")}</div>` : `<div class="se-endorsement-list">${entries.map((e) => `<a href="${E(url({ detail: e.id }))}" data-route class="se-endorsement-row ${state.detail === e.id ? "is-selected" : ""}" style="${categoryStyle(e.category)}"><span class="se-id">${E(e.id)}</span><div><h2>${E(e.title)}</h2><p>${E(e.cfr.join(" · "))}</p><span class="se-row-category">${E(M.categories[e.category]?.[0])}</span></div><span aria-hidden="true">↗</span></a>`).join("")}</div>${card ? `<details class="se-disclosure"><summary>${E(card.title)}</summary><p>${E(card.summary)}</p>${card.requirements.map((r) => `<h3>${E(r.label)}</h3><p>${linkText(r.text)}</p>${source(r.refs.join("; "))}`).join("")}</details>` : ""}${privileges(category)}`}`;
  }
  function preSolo() {
    return `<h2 class="se-section-title">Intake guidance & resources</h2>${window.PRE_SOLO_CONTENT.accordionSections.map((s) => topic("intake-" + s.id, s.heading, s.type === "resources" ? `<ul>${s.links.map((l) => `<li><a class="se-link" href="${E(l.url)}" target="_blank" rel="noopener">${E(l.label)} ↗</a></li>`).join("")}</ul>${source(s.regs.join("; "))}` : blocks(s.blocks))).join("")}`;
  }
  function privileges(category) {
    const p = window.PRIVILEGES_LIMITATIONS.cards[category];
    if (!p) return "";
    return `<details class="se-disclosure"><summary>${E(p.title)}</summary><p>${E(p.summary)}</p>${(p.mnemonics || []).map((m) => `<h3>${E(m.title || m.name || "Memory aid")}</h3><p>${E(m.intro || m.description || m.summary || "")}</p><ul>${(m.items || []).map((i) => `<li>${typeof i === "string" ? E(i) : linkText([i.letter, i.label, i.text, (i.refs || []).join("; ")].filter(Boolean).join(" · "))}</li>`).join("")}</ul>`).join("")}${["privileges", "limitations"].map((k) => `<h3>${k === "privileges" ? "Privileges" : "Limitations"}</h3><ul>${p[k].map((r) => `<li>${linkText(r.text)}${source((r.refs || []).join("; "))}</li>`).join("")}</ul>`).join("")}</details>`;
  }
  function blocks(content) {
    return (content || [])
      .map((b) =>
        ["ul", "ol"].includes(b.type)
          ? `<${b.type}>${b.value.map((v) => `<li>${linkText(v)}</li>`).join("")}</${b.type}>`
          : ["h3", "h4"].includes(b.type)
            ? `<h3>${E(b.value)}</h3>`
            : `<p>${linkText(b.value)}</p>`,
      )
      .join("");
  }
  const bullets = (items) =>
    `<ul>${(items || []).map((s) => `<li>${linkText(s)}</li>`).join("")}</ul>`;
  function topic(id, title, body) {
    if (state.view === "guidance") {
      if (!state.topic || state.topic !== id) return state.topic ? "" : a(title, {topic:id,detail:""}, "se-guide-question");
      return `<article class="se-guide-article" id="topic-${E(id)}"><h1 id="se-title" tabindex="-1">${E(title)}</h1>${body}</article>`;
    }
    return `<details class="se-disclosure" id="topic-${E(id)}" ${state.topic === id ? "open" : ""}><summary>${E(title)}</summary><div>${body}</div></details>`;
  }
  function guidance(viewState = state) {
    const guideTopic = (id, title, body) => {
      if (!viewState.topic || viewState.topic !== id) return viewState.topic ? "" : a(title,{topic:id,detail:""},"se-guide-question");
      return `<article class="se-guide-article" id="topic-${E(id)}"><h1 id="se-title" tabindex="-1">${E(title)}</h1>${body}</article>`;
    };
    if (viewState.mode === "home") return `<div class="se-heading"><h1 id="se-title" tabindex="-1">Guidance</h1><p>Find the answer for the situation in front of you.</p></div><h2 class="se-section-title">Working with students</h2><div class="se-guide-directory">${M.guidanceModes.slice(0,3).map(x=>`<a data-route href="${E(url({mode:x[0],topic:"",detail:""}))}"><h2>${E(x[1])}</h2><p>${E(x[2])}</p><span aria-hidden="true">→</span></a>`).join("")}</div><h2 class="se-section-title">Instructor development</h2><div class="se-guide-directory">${M.guidanceModes.slice(3).map(x=>`<a data-route href="${E(url({mode:x[0],topic:"",detail:""}))}"><h2>${E(x[1])}</h2><p>${E(x[2])}</p><span aria-hidden="true">→</span></a>`).join("")}</div>`;
    const mode =
      M.guidanceModes.find((x) => x[0] === viewState.mode) || M.guidanceModes[0];
    let body = "";
    if (mode[0] === "journey")
      body = window.JOURNEY_STAGES.map((s) =>
        guideTopic(
          s.id,
          s.label,
          `<p>${linkText(s.description)}</p>${s.timeLimit ? `<p class="se-timing">${E(s.timeLimit)}</p>` : ""}${source(s.regulation)}${endorsementLinks(s.endorsements)}${bullets(s.gotchas)}${(s.notes || []).map((n) => `<p>${E(n.note)} ${a(n.id, { detail: n.id })}</p>`).join("")}${a("Open task checklist →", { view: "tasks", task: { enrollment: "new-student", "pre-solo-ground": "pre-solo", "pre-solo-flight": "night-solo", "local-solo": "another-airport-within-25nm", "xc-training": "initial-solo-xc", "xc-per-flight": "initial-solo-xc", "xc-repeated": "repeated-solo-xc-50nm", "class-b": "class-b-solo", "knowledge-test": "private-knowledge-test", "checkride-prep": "private-airplane-initial-checkride-bundle" }[s.id] || s.id, detail: "" }, "se-link")}`,
        ),
      ).join("");
    if (mode[0] === "scenarios")
      body = window.SCENARIO_CARDS.map((s) =>
        guideTopic(
          s.id,
          s.title,
          `${source(s.regulation)}<p class="se-timing">${E(s.timeLimit || "")}</p><ol>${s.steps.map((x) => `<li>${linkText(x)}</li>`).join("")}</ol>${endorsementLinks(s.endorsements)}<h3>Watch for</h3>${bullets(s.pitfalls)}${a("Open related task checklist →", { view: "tasks", task: { "failed-area": "retest-after-disapproval", discontinuance: "practical-test-recommendation", "add-multiengine": "private-amel-add-on-checkride-bundle", "sixty-day-expired": "retest-after-disapproval", "flight-review": "flight-review-and-wings", ipc: "instrument-proficiency-check", "solo-wrong-category": "solo-without-category-class", "planned-increments": "practical-test-recommendation" }[s.id], group: "", detail: "" }, "se-link")}`,
        ),
      ).join("");
    if (mode[0] === "reference") {
      const d = window.QUICK_REF_DATA;
      body = `${guideTopic("time-limits", "Time limits", `<div class="se-reference-grid">${d.timeLimits
        .map(
          (r) =>
            `<article class="se-reference-entry"><h3>${E(r.limit)}</h3><dl>${[
              ["Applies to", r.appliesTo],
              ["Governing rule", r.governingFAR],
              ["Resets when", r.resetsWhen],
            ]
              .map(([k, v]) => `<dt>${k}</dt><dd>${linkText(v)}</dd>`)
              .join("")}</dl></article>`,
        )
        .join(
          "",
        )}</div>`)}${guideTopic("logbook", "Logbook checklist", bullets(d.logbookChecklist))}${guideTopic("ac-index", "AC / regulation index", d.acFarTable.map((r) => `<article class="se-reference-entry"><h3>${a(r.acRef, { detail: r.acRef })} · ${E(r.use)}</h3><p>${linkText(r.far)}</p><p><strong>Timing: </strong>${E(r.expiration)}</p></article>`).join(""))}${guideTopic("sfar", "Special regulations", d.sfarList.map((s) => `<h3>${E(s.title)}</h3><p>${linkText(s.note)}</p>`).join(""))}`;
    }
    if (mode[0] === "career") {
      const d = window.CFI_CAREER_DATA;
      body = `${guideTopic("instructor-currency", "Certificate and recent experience", `<p>${E(d.prePostDec2024.after)}</p>${source("14 CFR §§ 61.197, 61.199")}`)}${d.renewalPathways.map((x) => guideTopic(x.id, x.title, `<p class="se-timing">${E(x.timeFrame)}</p><p>${E(x.description)}</p><p>${E(x.notes)}</p>${source("14 CFR § 61.197")}`)).join("")}${guideTopic(
        "reinstatement",
        "Reinstating instructional privileges",
        Object.values(d.reinstatement)
          .map((x) =>
            typeof x === "string"
              ? `<p>${E(x)}</p>`
              : `<h3>${E(x.heading)}</h3><p>${E(x.path)}</p><p>${E(x.note)}</p>`,
          )
          .join(""),
      )}${guideTopic("initial-trainer", "Who may train an initial CFI?", `<h3>Ground training</h3>${bullets(d.initialCfiTrainer.groundOptions)}<h3>Flight training</h3>${bullets(d.initialCfiTrainer.flightOptions)}${source("14 CFR § 61.195(h)")}`)}`;
    }
    if (mode[0] === "dpe")
      body = `<p>Open a question to reveal its answer. Mark it reviewed when you are ready. Progress lasts only while this page is open.</p>${window.FLASHCARD_DECK.map((f) => guideTopic(f.id, f.question, `<p class="se-eyebrow">${E(f.category)}</p><p>${linkText(f.answer)}</p>${source("AC 61-65K; applicable cited regulation")}<button data-flash="${E(f.id)}" aria-pressed="${flashReady.has(f.id)}">${flashReady.has(f.id) ? "✓ Reviewed" : "Mark reviewed"}</button>`)).join("")}`;
    if (mode[0] === "lesson")
      body = GUIDANCE_SECTIONS.map((s) =>
        guideTopic(s.id, s.title, blocks(s.content)),
      ).join("");
    if (viewState.topic) {
      const fragment = document.createElement("template");
      fragment.innerHTML = body;
      const article = fragment.content.querySelector(".se-guide-article");
      body = article ? article.outerHTML : '<p>This topic is unavailable. Choose another topic above.</p>';
    }
    return `<div class="se-heading">${a(viewState.topic ? "← " + mode[1] : "← All guidance", {mode:viewState.topic ? mode[0] : "home",topic:"",detail:""}, "se-back-link")}${viewState.topic ? "" : `<h1 id="se-title" tabindex="-1">${E(mode[1])}</h1><p>${E(mode[2])}</p>`}</div><div class="se-guidance-body">${body}</div>`;
  }

  function relatedGuidance(t) {
    return `<section class="se-related" id="se-related"><div class="se-section-heading"><h2>Guidance for this task</h2></div>${M.relatedGuidance(t.id).map(g=>{
      const fragment=document.createElement("template");
      fragment.innerHTML=guidance({view:"guidance",mode:g.mode,topic:g.id});
      const article=fragment.content.querySelector(".se-guide-article");
      article?.querySelector("h1")?.remove();
      return `<details class="se-disclosure" id="related-${E(g.mode)}-${E(g.id)}"><summary>${E(g.label)}</summary><div>${article?.innerHTML || ""}</div></details>`;
    }).join("")}</section>`;
  }
  function searchResults() {
    const results = M.search(query);
    const resultLink = (r) => `<a class="se-search-result" data-search-result data-route href="${E(url(r.type === "Task" ? { view: "tasks", task: r.id, detail: "" } : r.type === "Guidance" ? { view: "guidance", mode: r.mode, topic: r.id, detail: "" } : { view: "library", category: "all", path: "", detail: r.id }))}"><span class="se-result-kind">${E(r.type)}${r.type==="Task" ? " · "+E(M.categories[M.task(r.id)?.category]?.[0] || "") : r.type==="Endorsement" ? " · "+E(M.categories[window.ENDORSEMENTS.find(e=>e.id===r.id)?.category]?.[0] || "") : " · "+E(M.guidanceModes.find(m=>m[0]===r.mode)?.[1] || "")}</span><h2>${E(r.type === "Endorsement" ? r.id + " · " : "")}${E(r.title)}</h2><p>${E(r.description.slice(0, 180))}</p></a>`;
    const groups = [["Endorsement", "Endorsements"], ["Task", "Checklists"], ["Guidance", "Guidance"]]
      .map(([type, label]) => {
        const matches = results.filter((r) => r.type === type);
        return matches.length ? `<section class="se-search-group"><h2>${E(label)} <span>${matches.length}</span></h2>${matches.map(resultLink).join("")}</section>` : "";
      })
      .join("");
    return `<div class="se-heading"><p class="se-eyebrow">Across your workspace</p><h1 id="se-title" tabindex="-1">Search results</h1><p>${results.length} matches for “${E(query)}”</p></div>${results.length ? groups : `<div class="se-empty"><h2>No matches yet</h2><p>Try “first solo”, “IPC”, an endorsement ID or a regulation.</p><button data-action="clear-search">Clear search</button></div>`}`;
  }
  function render(preserveDisclosures = false) {
    rememberDetailDisclosures();
    const oldDetail=root.querySelector(".se-detail");
    if (oldDetail && window.innerWidth>=900) detailScrolls.set(oldDetail.dataset.endorsement,oldDetail.scrollTop);
    const railScroll=root.querySelector(".se-category-rail")?.scrollTop || 0;
    root.querySelectorAll("details[id]:not(.se-detail-disclosure)").forEach(d=>d.open?contentDisclosures.add(d.id):contentDisclosures.delete(d.id));
    const opened = preserveDisclosures ? new Set([...root.querySelectorAll('details[open]')].map(d => d.id || d.querySelector('summary')?.textContent)) : null;
    const task = M.task(state.task);
    const currentPath = M.paths.find(p=>p.id===state.path);
    const categoryContext = task?.label || currentPath?.label || M.categories[state.category]?.[0] || "All categories";
    const searchBack = history.state?.seSearchReturn && !query && !state.detail ? `<button class="se-back-search" data-action="back-search">← Back to search results</button>` : "";
    root.innerHTML = `<a class="se-skip" href="${state.detail&&!query?"#se-detail-title":"#se-main"}">Skip to content</a><header class="se-app-header"><a href="?view=tasks" data-route class="se-brand"><img src="/assets/identities/simply-endorsed-cfi/logo.png" width="40" height="40" alt=""><span>Simply Endorsed<small>CFI WORKSPACE</small></span></a><form id="se-search-form" role="search">${icon("search")}<label class="se-sr" for="se-search">Search tasks, endorsements and guidance</label><input id="se-search" type="search" autocomplete="off" placeholder="Search Simply Endorsed" value="${E(query)}"><button aria-label="Search workspace" type="submit">Search</button>${query?'<button data-action="clear-search" type="button" aria-label="Clear search">'+icon("x")+'</button>':""}</form><button class="se-menu-button" data-action="menu">${icon("menu")}<span>Menu</span></button></header><div class="se-browse-shell"><aside class="se-category-rail"><nav class="se-primary-nav" aria-label="Workspace">${primaryNavigation()}</nav><p class="se-eyebrow">CATEGORIES</p>${categoryNavigation()}<p class="se-rail-note">FAA AC 61-65K<br>Instructor reference</p></aside><div class="se-content"><button class="se-category-launcher" data-action="categories" aria-label="Browse categories. Current selection: ${E(categoryContext)}">${icon("layout-grid")}<span>Browse categories</span><strong>${E(categoryContext)}</strong>${icon("chevron-right")}</button>${active&&(state.view!=="tasks"||state.task!==active.taskId||state.detail||query)?`<div class="se-active-bar"><span><strong>Active checklist</strong> · ${E(M.task(active.taskId).label)}</span>${a("Continue review →",{view:"tasks",task:active.taskId,detail:""})}</div>`:""}${searchBack}<div class="se-layout ${state.detail&&!query?"has-detail":""}"><main class="se-main" id="se-main" tabindex="-1">${query?searchResults():state.view==="tasks"?tasks():state.view==="library"?library():guidance()}</main>${query?"":detail()}</div></div></div><nav class="se-mobile-nav" aria-label="Workspace">${primaryNavigation()}<button data-action="menu">${icon("menu")}<span>Menu</span></button></nav><dialog id="se-category-dialog" aria-labelledby="se-category-title"><div class="se-dialog-heading"><h2 id="se-category-title">Browse categories</h2><button data-action="close-categories" aria-label="Close categories">${icon("x")}</button></div>${categoryNavigation()}</dialog><dialog id="se-menu-dialog" aria-labelledby="se-menu-title"><div class="se-dialog-heading"><h2 id="se-menu-title">Simply Endorsed</h2><button data-action="close-menu" aria-label="Close menu">${icon("x")}</button></div><p class="se-eyebrow">APPEARANCE</p><div class="se-appearance" role="group" aria-label="Appearance">${["dark","day","system"].map(v=>`<button data-appearance="${v}" aria-pressed="${(document.documentElement.dataset.theme||"dark")===v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join("")}</div><nav class="se-menu-links" aria-label="Website"><a href="/">SUAREZ.CFI ${icon("arrow-up-right")}</a><a href="/tools/">All pilot tools ${icon("arrow-up-right")}</a><a href="/part-61-calculator/">CertPath ${icon("arrow-up-right")}</a><a href="/learn/">Learn ${icon("arrow-up-right")}</a><a href="/blog/">Blog ${icon("arrow-up-right")}</a><a href="/#contact">Contact ${icon("arrow-up-right")}</a></nav><p class="se-small">Temporary review workspace. Checklist answers clear on reload.</p></dialog><p id="se-feedback" role="status" class="se-feedback"></p>`;
    document.getElementById("se-menu-dialog")?.addEventListener("close",()=>root.querySelector(window.innerWidth<1200?'.se-mobile-nav [data-action="menu"]':'.se-menu-button')?.focus());
    root.querySelectorAll("details[id]:not(.se-detail-disclosure)").forEach(d=>{if(contentDisclosures.has(d.id))d.open=true;});
    const newDetail=root.querySelector(".se-detail");
    if(newDetail)newDetail.scrollTop=detailScrolls.get(newDetail.dataset.endorsement)||0;
    root.querySelector(".se-category-rail").scrollTop=railScroll;
    const categoryDialog = document.getElementById("se-category-dialog");
    categoryDialog?.addEventListener("close", () => {
      if (!categoryDialog.isConnected) return;
      const target = [root.querySelector('.se-category-launcher'), document.querySelector('.nav-menu-toggle'), root.querySelector('.se-brand')].find(el => el?.getClientRects().length);
      target?.focus();
    });
    if (opened) root.querySelectorAll('details').forEach(d => { d.open = opened.has(d.id || d.querySelector('summary')?.textContent); });
    if (state.topic && !state.detail && !query && !preserveDisclosures)
      document
        .getElementById("se-main")
        ?.scrollIntoView({ block: "start" });
  }
  root.addEventListener("click", async (event) => {
    const route = event.target.closest("a[data-route]");
    if (
      route &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      const nextHistory = {};
      history.replaceState({...history.state,seWorkspaceScroll:window.scrollY||0},"",location.href);
      if (route.hasAttribute("data-search-result")) {
        nextHistory.seSearchReturn = location.href;
        nextHistory.seSearchFocus = route.getAttribute("href");
        nextHistory.seSearchScroll = window.scrollY || 0;
      } else if (new URL(route.href).searchParams.has("expanded") && history.state?.seSearchReturn) {
        Object.assign(nextHistory, history.state);
      }
      if (new URL(route.href).searchParams.has("expanded")) {
        rememberDetailDisclosures();
        if (!state.detail) {
          returnFocus = route.getAttribute("href");
          detailReturn = location.href;
          detailReturnScroll = window.scrollY || 0;
          history.replaceState(
            { ...(history.state || {}), seWorkspaceScroll: detailReturnScroll },
            "",
            location.href,
          );
        }
      } else if (!new URL(route.href).searchParams.has("expanded")) {
        detailReturn = null;
      }
      query = "";
      history.pushState(nextHistory, "", route.href);
      state = parse();
      render();
      focusDestination();
      return;
    }
    const b = event.target.closest("button");
    if (!b) return;
    if (b.dataset.na) { updateReview(b.dataset.na, active?.answers[b.dataset.na] === "na" ? "todo" : "na"); return; }
    if (b.dataset.action === "menu") document.getElementById("se-menu-dialog").showModal();
    if (b.dataset.action === "close-menu") document.getElementById("se-menu-dialog").close();
    if (b.dataset.action === "back-search") {
      const previous = history.state;
      history.pushState({}, "", previous.seSearchReturn);
      state = parse(); query = new URLSearchParams(location.search).get("q") || "";
      render();
      [...root.querySelectorAll("a[data-route]")].find(a=>a.getAttribute("href")===previous.seSearchFocus)?.focus({preventScroll:true});
      window.scrollTo(0,previous.seSearchScroll||0);
    }
    if (b.dataset.action === "categories") document.getElementById("se-category-dialog").showModal();
    if (b.dataset.action === "close-categories") document.getElementById("se-category-dialog").close();
    if (b.dataset.action === "start" || b.dataset.action === "reset") {
      active = {
        taskId: b.dataset.task,
        answers: {},
        context: {
          held: "Select current certificate",
          aircraft: "Select aircraft",
        },
      };
      render();
      const progressPanel = document.getElementById("se-progress");
      if (progressPanel) {
        progressPanel.tabIndex = -1;
        progressPanel.focus({ preventScroll: true });
        progressPanel.scrollIntoView({ block: "nearest" });
      }
    }
    if (b.dataset.action === "close-detail") {
      rememberDetailDisclosures();
      history.replaceState(history.state || {}, "", detailReturn || (history.state?.seSearchReturn && state.view==="library" ? history.state.seSearchReturn : url({ detail: "" })));
      detailReturn = null;
      state = parse();
      query = new URLSearchParams(location.search).get("q") || "";
      render();
      const links = [...root.querySelectorAll("a[data-route]")];
      (
        links.find((x) => x.getAttribute("href") === (returnFocus || history.state?.seSearchFocus)) ||
        document.getElementById("se-title")
      )?.focus();
      if (detailReturnScroll !== null) window.scrollTo(0, detailReturnScroll);
      detailReturnScroll = null;
    }
    if (b.dataset.action === "clear-search") {
      query = "";
      history.replaceState({}, "", url({}));
      render();
      document.getElementById("se-search").focus();
    }
    if (b.dataset.action === "copy") {
      try {
        await navigator.clipboard.writeText(
          modelText(window.ENDORSEMENTS.find((e) => e.id === state.detail))
            .text,
        );
        document.getElementById("se-feedback").textContent =
          "FAA model text copied. Fill the required fields before issuing.";
      } catch {
        document.getElementById("se-feedback").textContent =
          "Copy unavailable. Select the model text below to copy it manually.";
      }
    }
    if (b.dataset.flash) {
      flashReady.has(b.dataset.flash)
        ? flashReady.delete(b.dataset.flash)
        : flashReady.add(b.dataset.flash);
      b.setAttribute("aria-pressed", flashReady.has(b.dataset.flash));
      b.textContent = flashReady.has(b.dataset.flash)
        ? "✓ Reviewed"
        : "Mark reviewed";
    }
  });
  root.addEventListener("submit", (e) => {
    if (e.target.id === "se-search-form") {
      e.preventDefault();
      query = document.getElementById("se-search").value.trim();
      const u = new URL(url({ detail: "" }), location.href);
      if (query) u.searchParams.set("q", query);
      history.pushState({}, "", u);
      state = parse();
      render();
      document.getElementById("se-title")?.focus();
    }
  });
  function updateReview(id, value) {
    const task = M.task(state.task);
    const item = task?.items.find(i => i.id === id);
    if (!item || (active && active.taskId !== task.id) || (value==="na"&&!item.conditional)) return;
    if (!active) active = {taskId:task.id,answers:{},context:{}};
    if (["completion","review"].includes(id) && (alternativeUnresolved(task) || task.items.some(i=>!["completion","review"].includes(i.id) && (!active.answers[i.id] || active.answers[i.id]==="todo")))) return;
    active.answers[id] = value;
    if (value==="todo" || alternativeUnresolved(task)) {delete active.answers.completion;delete active.answers.review;}
    const y = scrollY;
    render(true);
    root.querySelector(`[data-check="${id}"]`)?.focus({preventScroll:true});
    scrollTo(0,y);
  }
  root.addEventListener("change", (e) => {
    const el = e.target;
    if (el.hasAttribute("data-guidance"))
      navigate({ mode: el.value, topic: "", detail: "" });
    if (el.dataset.check) updateReview(el.dataset.check, el.checked ? "done" : "todo");
    if (el.dataset.context && active)
      active.context[el.dataset.context] = el.value;
    if (el.dataset.filter) {
      const key = el.dataset.filter;
      navigate(
        key === "category"
          ? { category: el.value, path: "", detail: "", issuer: "all", validity: "all" }
          : key === "path"
            ? {
                path: el.value,
                category:
                  M.paths.find((x) => x.id === el.value)?.category ||
                  state.category,
                detail: "",
              }
            : { [key]: el.value, detail: "" },
      );
    }
  });
  root.addEventListener("click", (e) => {
    const summary = e.target.closest("summary");
    if (state.view !== "guidance" || !summary?.parentElement.id.startsWith("topic-")) return;
    state.topic = summary.parentElement.open
      ? ""
      : summary.parentElement.id.slice(6);
    history.pushState({}, "", url({ topic: state.topic }));
  });
  addEventListener("popstate", (event) => {
    rememberDetailDisclosures();
    detailReturn = null;
    state = parse();
    query = new URLSearchParams(location.search).get("q") || "";
    render();
    focusDestination();
    if (Number.isFinite(event.state?.seWorkspaceScroll))
      window.scrollTo(0, event.state.seWorkspaceScroll);
  });
  let mobileDetailOffset = 0;
  root.addEventListener("scroll", event => {
    if (window.innerWidth>=900 && event.target.matches?.(".se-detail"))
      detailScrolls.set(event.target.dataset.endorsement,event.target.scrollTop);
  }, true);
  addEventListener("scroll", () => {
    const panel=root.querySelector(".se-detail");
    if (window.innerWidth<900 && panel)
      mobileDetailOffset=Math.max(0,window.scrollY-panel.offsetTop);
  }, {passive:true});
  if (window.matchMedia) {
    window.matchMedia("(max-width: 899px)").addEventListener("change", () => {
      const panel=root.querySelector(".se-detail");
      if (!panel || query) return;
      if (window.innerWidth<900) {
        if(document.activeElement?.closest(".se-main"))
          document.getElementById("se-detail-title")?.focus({preventScroll:true});
        const offset=detailScrolls.get(state.detail)||0;
        window.scrollTo(0,offset ? panel.offsetTop+offset : 0);
      } else {
        panel.scrollTop=mobileDetailOffset;
        window.scrollTo(0,detailReturnScroll||0);
      }
    });
  }
  // Preserve the site's mobile-menu shortcut after replacing the old filter rail.
  document.getElementById("sidebarToggleBtn")?.addEventListener("click", () => {
    if (state.view !== "library" || query) navigate({ view: "library", detail: "" });
    document.getElementById("se-category-dialog")?.showModal();
  });
  document
    .querySelectorAll('header.nav-wrap a[href="/simply-endorsed-cfi/"]')
    .forEach((link) =>
      link.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate({ view: "library", category: "all", path: "", task: "", group: "", detail: "" });
      }),
    );
  document
    .getElementById("footerMeta")
    ?.replaceChildren(
      document.createTextNode(
        "FAA model text: " +
          window.APP_META.acVersion +
          " · Temporary instructor review workspace",
      ),
    );
  document
    .getElementById("footerGuidanceBtn")
    ?.addEventListener("click", () =>
      navigate({ view: "guidance", detail: "" }),
    );
  // Adapt the current shared appearance API without changing other tools.
  if (window.SuarezAppearance) {
    const syncAppearance = () => {
      const preference=window.SuarezAppearance.getPreference();
      document.documentElement.dataset.theme=preference==="light"?"day":preference;
      root.querySelectorAll("[data-appearance]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.appearance===document.documentElement.dataset.theme)));
    };
    root.addEventListener("click",event=>{
      const button=event.target.closest("[data-appearance]");
      if(button)window.SuarezAppearance.setPreference(button.dataset.appearance==="day"?"light":button.dataset.appearance);
    });
    addEventListener("suarez:appearance",syncAppearance);
    syncAppearance();
  }
  document.body.classList.add("se-redesigned");
  render();
})();
