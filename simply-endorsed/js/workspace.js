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
    returnFocus = null;
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
            : "tasks",
      task: p.get("task") || "",
      group: p.get("group") || "",
      category: p.get("category") || "all",
      path: p.get("subcategory") || "",
      detail: (p.get("expanded") || "").split(",")[0],
      mode: p.get("mode") || "journey",
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
  const source = (refs) =>
    `<p class="se-source">${linkText(refs)} · <a href="${E(M.source)}" target="_blank" rel="noopener">FAA AC 61-65K ↗</a></p>`;
  const endorsementLinks = (arr) =>
    `<div class="se-links">${arr.map((x) => a(typeof x === "string" ? x : x.id + " · " + x.label, { detail: typeof x === "string" ? x : x.id }, "se-link")).join("")}</div>`;
  function navigate(changes) {
    query = "";
    history.pushState({}, "", url(changes));
    state = parse();
    render();
    document
      .getElementById(state.detail ? "se-detail-title" : "se-title")
      ?.focus();
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
  function detail() {
    const e = window.ENDORSEMENTS.find((x) => x.id === state.detail);
    if (!e) return "";
    const copy = modelText(e),
      issuer =
        {
          "standard-cfi": "Authorized instructor",
          "examiner-only": "Examiner only",
          "dpe-or-asi-only": "DPE or ASI only",
          "approved-institution": "Approved institution",
          "non-instructor": "Qualified non-instructor",
        }[e.whoIssues] || e.whoIssues;
    return `<aside class="se-detail" aria-label="Endorsement details"><div class="se-detail-top"><button data-action="close-detail">← Back to ${state.view === "tasks" ? "task" : state.view === "guidance" ? "guidance" : "library"}</button><span>${E(e.id)}</span></div><p class="se-eyebrow">${E(M.categories[e.category]?.[0] || "Endorsement")}</p><h2 id="se-detail-title" tabindex="-1">${E(e.title)}</h2><p class="se-source">${linkText(e.cfr.join(" · "))}</p><div class="se-facts"><p><strong>Who signs</strong>${E(issuer)}</p><p><strong>Timing</strong>${E(e.id === "A.5" ? M.facts.night : e.id === "A.6" ? M.facts.soloWindow : e.id === "A.1" ? M.facts.testWindow : e.perFlight ? "Review for each flight" : e.expiration === "none" ? "No standalone expiration stated; other currency requirements may apply" : e.expiration.replaceAll("-", " "))}</p></div><h3>Instructor guidance</h3><div class="se-prose">${e.explanation
      .split("\n")
      .filter(Boolean)
      .map((t) => `<p>${linkText(t.replace(/^•\s*/, ""))}</p>`)
      .join(
        "",
      )}</div>${copy.note ? `<p class="se-notice">${E(copy.note)}</p>` : ""}<div class="se-row"><h3>${copy.text ? "FAA model wording" : "Provider-issued document"}</h3>${copy.text ? '<button data-action="copy" class="se-primary">Copy model text</button>' : ""}</div><p class="se-small">Replace bracketed fields in your actual logbook entry. Checking this workspace never issues an endorsement.</p>${copy.text ? `<blockquote>${E(copy.text)}</blockquote>` : "<p>Obtain the required document from the approved provider. The AC supplies instructions rather than a reusable instructor signoff here.</p>"}<p class="se-source"><a href="${E(M.source)}#page=${33 + Number(e.sourcePage.split("-")[1])}" target="_blank" rel="noopener">View FAA source · ${E(e.sourcePage)} ↗</a></p></aside>`;
  }
  function taskCard(id) {
    const t = M.task(id);
    return `<a class="se-path" data-route href="${E(url({ view: "tasks", task: id, group: "", detail: "" }))}"><span class="se-path-category" style="color:${M.categories[t.category]?.[1]}">${E(M.categories[t.category]?.[0])}</span><strong>${E(t.label)}</strong></a>`;
  }
  function tasks() {
    const t = M.task(state.task);
    if (t) return taskView(t);
    const group = M.groups.find((g) => g.id === state.group);
    if (group)
      return `<div class="se-heading">${a("← All tasks", { group: "", task: "" })}<p class="se-eyebrow">Choose a workflow</p><h1 id="se-title" tabindex="-1">${E(group.title)}</h1><p>${E(group.description)}</p></div><div class="se-path-list">${group.ids.map(taskCard).join("")}</div>${a("Explore every category and specialty path", { view: "library", category: "all", path: "", detail: "" }, "se-link")}`;
    return `<div class="se-heading"><p class="se-eyebrow">Your instructor workspace</p><h1 id="se-title" tabindex="-1">What are you working on?</h1><p>Choose a task. Review the requirements. Open the wording you need.</p></div><div class="se-task-grid">${M.groups.map((g, i) => `<a href="${E(url({ view: "tasks", group: g.id, task: "", detail: "" }))}" data-route class="se-task-card"><span class="se-number">0${i + 1}</span><h2>${E(g.title)} <span aria-hidden="true">↗</span></h2><p>${E(g.description)}</p></a>`).join("")}</div><div class="se-bottom-links">${a("Browse all 96 endorsements", { view: "library", category: "all", path: "", detail: "" })}${a("Open instructor guidance", { view: "guidance", mode: "journey", topic: "", detail: "" })}</div>`;
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
        const heading =
          i.section ||
          (i.id === "completion" || i.id === "review"
            ? "Completion review"
            : i.conditional
              ? "Conditional items"
              : "Prerequisites");
        const header =
          heading !== section
            ? `<h2 class="se-section-title">${E(heading)}</h2>`
            : "";
        section = heading;
        const status = running ? active.answers[i.id] || "todo" : "todo";
        return `${header}<article class="se-check-item ${status === "done" ? "is-done" : ""}"><div><span class="se-status">${status === "done" ? "✓ Reviewed" : status === "na" ? "— Not applicable" : i.conditional ? "◇ Applicability unresolved" : "○ To do"}</span><h3>${E(i.action)}</h3><p>${linkText(i.why)}</p>${source(i.refs)}${i.endorsement ? endorsementLinks([i.endorsement]) : ""}</div><label class="se-status-control">Review status<select data-check="${E(i.id)}" ${running && (!["completion", "review"].includes(i.id) || !remaining) ? "" : "disabled"} aria-label="${E(i.action)} review status"><option value="todo" ${status === "todo" ? "selected" : ""}>To do</option><option value="done" ${status === "done" ? "selected" : ""}>Done</option>${i.conditional ? `<option value="na" ${status === "na" ? "selected" : ""}>Not applicable</option>` : ""}</select>${running && remaining && ["completion", "review"].includes(i.id) ? '<span class="se-small">Review all earlier items first.</span>' : ""}</label></article>`;
      })
      .join("");
    return `<div class="se-heading">${a("← All tasks", { task: "", group: "", detail: "" })}<p class="se-eyebrow">${E(M.categories[t.category]?.[0] || "Student pilot")}</p><h1 id="se-title" tabindex="-1">${E(t.label)}</h1><p>${E(t.description || "Review the complete workflow and resolve each applicable requirement.")}</p></div>${t.items.some((i) => i.endorsement) ? `<div class="se-package"><p>Endorsements in this review · conditional items are labeled below</p>${endorsementLinks([...new Set(t.items.filter((i) => i.endorsement).map((i) => i.endorsement))])}</div>` : ""}<section class="se-check-controls" aria-label="Temporary checklist"><div class="se-row"><h2>${running ? "Your temporary checklist" : "Start a review"}</h2><button class="se-primary" data-action="${running ? "reset" : "start"}" data-task="${E(t.id)}">${running ? "Start new checklist" : "Use this checklist"}</button></div><p class="se-small">One checklist, kept only while this page stays open. Reloading or starting a new checklist clears it. No student records are saved.</p>${running ? `<div class="se-context"><label>Currently holds<select data-context="held">${options(["Select current certificate", "Student pilot", "Sport pilot", "Recreational pilot", "Private pilot", "Commercial pilot", "ATP", "Flight instructor", "Other / verify"], active.context.held)}</select></label><label>Aircraft category / class<select data-context="aircraft">${options(["Select aircraft", "Airplane single-engine land", "Airplane multiengine land", "Airplane single-engine sea", "Airplane multiengine sea", "Rotorcraft helicopter", "Rotorcraft gyroplane", "Glider", "Powered-lift", "Other / verify"], active.context.aircraft)}</select></label></div><p class="se-small">Goal: ${E(t.label)}. Context is for your review; all items remain visible. Resolve exemptions and aircraft-specific conditions below.</p><div id="se-progress" role="status">${progress()}</div>` : active ? `<p class="se-notice">Starting this checklist replaces your active ${E(M.task(active.taskId).label)} review. ${a("Return to active checklist", { view: "tasks", task: active.taskId, detail: "" })}</p>` : ""}</section><div class="se-checklist">${items}</div>${["new-student", "pre-solo"].includes(t.id) ? preSolo() : ""}${a("Related guidance", { view: "guidance", mode: "journey", topic: t.id, detail: "" }, "se-link")}`;
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
  function library() {
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
    return `<div class="se-heading"><p class="se-eyebrow">FAA AC 61-65K · 96 endorsements</p><h1 id="se-title" tabindex="-1">${E(p?.label || M.categories[category]?.[0] || "Endorsement library")}</h1><p>${E(p?.description || "Browse every category, or search for a task to see its complete workflow.")}</p></div><div class="se-library-controls"><label>Category<select data-filter="category"><option value="all">All categories</option>${Object.entries(
      M.categories,
    )
      .map(
        ([id, [label]]) =>
          `<option value="${id}" ${category === id ? "selected" : ""}>${E(label)}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Training or operation<select data-filter="path"><option value="">All paths in category</option>${M.paths
      .filter((x) => category === "all" || x.category === category)
      .map(
        (x) =>
          `<option value="${E(x.id)}" ${p?.id === x.id ? "selected" : ""}>${E(x.label)}</option>`,
      )
      .join(
        "",
      )}</select></label><details class="se-filter"><summary>Filter endorsements</summary><label>Signer<select data-filter="issuer">${[
      ["all", "All signers"],
      ["standard-cfi", "Authorized instructor"],
      ["examiner-only", "Examiner only"],
      ["dpe-or-asi-only", "DPE or ASI"],
      ["approved-institution", "Approved institution"],
      ["non-instructor", "Qualified non-instructor"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${state.issuer === v ? "selected" : ""}>${l}</option>`,
      )
      .join("")}</select></label><label>Timing<select data-filter="validity">${[
      ["all", "All time limits"],
      ["90-calendar-days", "90 calendar days"],
      ["2-calendar-months", "2 calendar months"],
      ["per-flight", "Per flight"],
      ["none", "No standalone expiration"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${state.validity === v ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select></label></details></div>${p ? a("Open complete task checklist →", { view: "tasks", task: p.id, detail: "" }, "se-workflow-link") : ""}${!entries.length ? `<div class="se-empty"><h2>${p?.contentRenderer ? "Start with the prerequisites" : "No endorsements match"}</h2><p>${p?.contentRenderer ? "This path contains preparation guidance. Open its checklist to review it." : "Change your filters or search all tasks and endorsements."}</p>${a("Clear filters", { issuer: "all", validity: "all", path: "", category: "all", detail: "" }, "se-link")}</div>` : `<p class="se-small">${entries.length} endorsements · ${p ? "All primary and related items shown. Review applicability in the task checklist." : "Individual search results are not a complete task package."}</p><div class="se-endorsement-list">${entries.map((e) => `<a href="${E(url({ detail: e.id }))}" data-route class="se-endorsement-row ${state.detail === e.id ? "is-selected" : ""}" style="--category:${M.categories[e.category]?.[1]}"><span class="se-id">${E(e.id)}</span><div><h2>${E(e.title)}</h2><p>${E(e.cfr.join(" · "))}</p></div><span aria-hidden="true">↗</span></a>`).join("")}</div>${card ? `<details class="se-disclosure"><summary>${E(card.title)}</summary><p>${E(card.summary)}</p>${card.requirements.map((r) => `<h3>${E(r.label)}</h3><p>${linkText(r.text)}</p>${source(r.refs.join("; "))}`).join("")}</details>` : ""}${privileges(category)}`}`;
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
    return `<details class="se-disclosure" id="topic-${E(id)}" ${state.topic === id ? "open" : ""}><summary>${E(title)}</summary><div>${body}</div></details>`;
  }
  function guidance() {
    const mode =
      M.guidanceModes.find((x) => x[0] === state.mode) || M.guidanceModes[0];
    let body = "";
    if (mode[0] === "journey")
      body = window.JOURNEY_STAGES.map((s) =>
        topic(
          s.id,
          s.label,
          `<p>${linkText(s.description)}</p>${s.timeLimit ? `<p class="se-timing">${E(s.timeLimit)}</p>` : ""}${source(s.regulation)}${endorsementLinks(s.endorsements)}${bullets(s.gotchas)}${(s.notes || []).map((n) => `<p>${E(n.note)} ${a(n.id, { detail: n.id })}</p>`).join("")}${a("Open task checklist →", { view: "tasks", task: { enrollment: "new-student", "pre-solo-ground": "pre-solo", "pre-solo-flight": "night-solo", "local-solo": "another-airport-within-25nm", "xc-training": "initial-solo-xc", "xc-per-flight": "initial-solo-xc", "xc-repeated": "repeated-solo-xc-50nm", "class-b": "class-b-solo", "knowledge-test": "private-knowledge-test", "checkride-prep": "private-airplane-initial-checkride-bundle" }[s.id] || s.id, detail: "" }, "se-link")}`,
        ),
      ).join("");
    if (mode[0] === "scenarios")
      body = window.SCENARIO_CARDS.map((s) =>
        topic(
          s.id,
          s.title,
          `${source(s.regulation)}<p class="se-timing">${E(s.timeLimit || "")}</p><ol>${s.steps.map((x) => `<li>${linkText(x)}</li>`).join("")}</ol>${endorsementLinks(s.endorsements)}<h3>Watch for</h3>${bullets(s.pitfalls)}${a("Open related task checklist →", { view: "tasks", task: { "failed-area": "retest-after-disapproval", discontinuance: "practical-test-recommendation", "add-multiengine": "private-amel-add-on-checkride-bundle", "sixty-day-expired": "retest-after-disapproval", "flight-review": "flight-review-and-wings", ipc: "instrument-proficiency-check", "solo-wrong-category": "solo-without-category-class", "planned-increments": "practical-test-recommendation" }[s.id], group: "", detail: "" }, "se-link")}`,
        ),
      ).join("");
    if (mode[0] === "reference") {
      const d = window.QUICK_REF_DATA;
      body = `<h2>Time limits</h2><div class="se-reference-grid">${d.timeLimits
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
        )}</div>${topic("logbook", "Logbook checklist", bullets(d.logbookChecklist))}${topic("ac-index", "AC / regulation index", d.acFarTable.map((r) => `<article class="se-reference-entry"><h3>${a(r.acRef, { detail: r.acRef })} · ${E(r.use)}</h3><p>${linkText(r.far)}</p><p><strong>Timing: </strong>${E(r.expiration)}</p></article>`).join(""))}${topic("sfar", "Special regulations", d.sfarList.map((s) => `<h3>${E(s.title)}</h3><p>${linkText(s.note)}</p>`).join(""))}`;
    }
    if (mode[0] === "career") {
      const d = window.CFI_CAREER_DATA;
      body = `<p>${E(d.prePostDec2024.after)}</p>${source("14 CFR §§ 61.197, 61.199")}${d.renewalPathways.map((x) => topic(x.id, x.title, `<p class="se-timing">${E(x.timeFrame)}</p><p>${E(x.description)}</p><p>${E(x.notes)}</p>`)).join("")}${topic(
        "reinstatement",
        "Reinstating instructional privileges",
        Object.values(d.reinstatement)
          .map((x) =>
            typeof x === "string"
              ? `<p>${E(x)}</p>`
              : `<h3>${E(x.heading)}</h3><p>${E(x.path)}</p><p>${E(x.note)}</p>`,
          )
          .join(""),
      )}${topic("initial-trainer", "Who may train an initial CFI?", `<h3>Ground training</h3>${bullets(d.initialCfiTrainer.groundOptions)}<h3>Flight training</h3>${bullets(d.initialCfiTrainer.flightOptions)}${source("14 CFR § 61.195(h)")}`)}`;
    }
    if (mode[0] === "dpe")
      body = `<p>Open a question to reveal its answer. Mark it reviewed when you are ready. Progress lasts only while this page is open.</p>${window.FLASHCARD_DECK.map((f) => topic(f.id, f.question, `<p class="se-eyebrow">${E(f.category)}</p><p>${linkText(f.answer)}</p>${source("AC 61-65K; applicable cited regulation")}<button data-flash="${E(f.id)}" aria-pressed="${flashReady.has(f.id)}">${flashReady.has(f.id) ? "✓ Reviewed" : "Mark reviewed"}</button>`)).join("")}`;
    if (mode[0] === "lesson")
      body = GUIDANCE_SECTIONS.map((s) =>
        topic(s.id, s.title, blocks(s.content)),
      ).join("");
    return `<div class="se-heading"><p class="se-eyebrow">Instructor guidance</p><h1 id="se-title" tabindex="-1">${E(mode[1])}</h1><p>${E(mode[2])}</p></div><label class="se-guidance-select">Guidance section<select data-guidance><optgroup label="In practice">${M.guidanceModes
      .slice(0, 3)
      .map(
        (x) =>
          `<option value="${x[0]}" ${state.mode === x[0] ? "selected" : ""}>${E(x[1])}</option>`,
      )
      .join(
        "",
      )}</optgroup><optgroup label="Instructor development">${M.guidanceModes
      .slice(3)
      .map(
        (x) =>
          `<option value="${x[0]}" ${state.mode === x[0] ? "selected" : ""}>${E(x[1])}</option>`,
      )
      .join(
        "",
      )}</optgroup></select></label><nav class="se-guidance-nav" aria-label="Guidance topics"><span>In practice</span>${M.guidanceModes
      .slice(0, 3)
      .map((x) =>
        a(
          x[1],
          { mode: x[0], topic: "", detail: "" },
          state.mode === x[0] ? "is-current" : "",
        ),
      )
      .join("")}<span>Instructor development</span>${M.guidanceModes
      .slice(3)
      .map((x) =>
        a(
          x[1],
          { mode: x[0], topic: "", detail: "" },
          state.mode === x[0] ? "is-current" : "",
        ),
      )
      .join("")}</nav><div class="se-guidance-body">${body}</div>`;
  }
  function searchResults() {
    const results = M.search(query);
    return `<div class="se-heading"><p class="se-eyebrow">Across your workspace</p><h1 id="se-title" tabindex="-1">Search results</h1><p>${results.length} matches for “${E(query)}”</p></div>${results.length ? results.map((r) => `<a class="se-search-result" data-route href="${E(url(r.type === "Task" ? { view: "tasks", task: r.id, detail: "" } : r.type === "Guidance" ? { view: "guidance", mode: r.mode, topic: r.id, detail: "" } : { view: "library", category: "all", path: "", detail: r.id }))}"><span class="se-eyebrow">${E(r.type)}${r.type === "Task" ? " · Full workflow" : ""}</span><h2>${E(r.type === "Endorsement" ? r.id + " · " : "")}${E(r.title)}</h2><p>${E(r.description.slice(0, 180))}</p></a>`).join("") : `<div class="se-empty"><h2>No matches yet</h2><p>Try “first solo”, “IPC”, an endorsement ID or a regulation.</p><button data-action="clear-search">Clear search</button></div>`}`;
  }
  function render() {
    root.innerHTML = `<header class="se-app-header"><a href="?view=tasks" data-route class="se-brand">Simply Endorsed<span>CFI workspace</span></a><nav aria-label="Workspace">${[
      ["tasks", "Tasks"],
      ["library", "Library"],
      ["guidance", "Guidance"],
    ]
      .map(
        ([v, l]) =>
          `<a data-route href="${E(url({ view: v, task: "", group: "", path: "", detail: "", topic: "" }))}" ${state.view === v && !query ? 'aria-current="page"' : ""}>${l}</a>`,
      )
      .join(
        "",
      )}</nav><form id="se-search-form" role="search"><label class="se-sr" for="se-search">Search tasks, endorsements and guidance</label><input id="se-search" type="search" autocomplete="off" placeholder="Search tasks, IDs, regulations" value="${E(query)}"><button aria-label="Search workspace" type="submit">Search</button></form></header>${active ? `<div class="se-active-bar"><span><strong>Active checklist</strong> · ${E(M.task(active.taskId).label)}</span>${a("Continue review →", { view: "tasks", task: active.taskId, detail: "" })}</div>` : ""}<div class="se-layout ${state.detail && !query ? "has-detail" : ""}"><main class="se-main" id="se-main">${query ? searchResults() : state.view === "tasks" ? tasks() : state.view === "library" ? library() : guidance()}</main>${query ? "" : detail()}</div><p id="se-feedback" role="status" class="se-feedback"></p>`;
    if (state.topic && !state.detail && !query)
      document
        .getElementById("topic-" + state.topic)
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
      returnFocus = route.getAttribute("href");
      query = "";
      history.pushState({}, "", route.href);
      state = parse();
      render();
      document
        .getElementById(state.detail ? "se-detail-title" : "se-title")
        ?.focus();
      return;
    }
    const b = event.target.closest("button");
    if (!b) return;
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
      document
        .getElementById("se-progress")
        ?.scrollIntoView({ block: "nearest" });
    }
    if (b.dataset.action === "close-detail") {
      navigate({ detail: "" });
      const links = [...root.querySelectorAll("a[data-route]")];
      (
        links.find((x) => x.getAttribute("href") === returnFocus) ||
        document.getElementById("se-title")
      )?.focus();
    }
    if (b.dataset.action === "clear-search") {
      query = "";
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
  root.addEventListener("change", (e) => {
    const el = e.target;
    if (el.hasAttribute("data-guidance"))
      navigate({ mode: el.value, topic: "", detail: "" });
    if (el.dataset.check && active) {
      const i = M.task(active.taskId).items.find(
        (x) => x.id === el.dataset.check,
      );
      if (!i || (el.value === "na" && !i.conditional)) return;
      if (
        ["completion", "review"].includes(i.id) &&
        (alternativeUnresolved(M.task(active.taskId)) ||
          M.task(active.taskId).items.some(
            (x) =>
              !["completion", "review"].includes(x.id) &&
              (!active.answers[x.id] || active.answers[x.id] === "todo"),
          ))
      )
        return;
      active.answers[i.id] = el.value;
      if (el.value === "todo" || alternativeUnresolved(M.task(active.taskId))) {
        delete active.answers.completion;
        delete active.answers.review;
      }
      const y = scrollY;
      render();
      root
        .querySelector(`[data-check="${i.id}"]`)
        ?.focus({ preventScroll: true });
      scrollTo(0, y);
    }
    if (el.dataset.context && active)
      active.context[el.dataset.context] = el.value;
    if (el.dataset.filter) {
      const key = el.dataset.filter;
      navigate(
        key === "category"
          ? { category: el.value, path: "", detail: "" }
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
    if (!summary?.parentElement.id.startsWith("topic-")) return;
    state.topic = summary.parentElement.open
      ? ""
      : summary.parentElement.id.slice(6);
    history.pushState({}, "", url({ topic: state.topic }));
  });
  addEventListener("popstate", () => {
    state = parse();
    query = new URLSearchParams(location.search).get("q") || "";
    render();
    document
      .getElementById(state.detail ? "se-detail-title" : "se-title")
      ?.focus();
  });
  document
    .querySelectorAll('header.nav-wrap a[href="/simply-endorsed-cfi/"]')
    .forEach((link) =>
      link.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate({ view: "tasks", task: "", group: "", detail: "" });
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
  render();
})();
