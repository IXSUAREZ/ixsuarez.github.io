(function () {
  "use strict";

  var PAGE_SIZE = 20;
  var mounts = document.querySelectorAll("#library-search");

  function node(tag, className, text) {
    var value = document.createElement(tag);
    if (className) value.className = className;
    if (text != null) value.textContent = text;
    return value;
  }

  function internalPath(value) {
    if (typeof value !== "string") return null;
    var path = value.trim();
    if (!path || path.charAt(0) !== "/" || path.indexOf("//") === 0 || /^[/?#]/.test(path.slice(1)) || /[<>"'\\]/.test(path)) return null;
    return path;
  }

  function init(mount) {
    var indexPath = mount.getAttribute("data-index") || "/assets/library-index.json";
    var state = { rows: [], loaded: false, loading: false, failed: false, exploring: false, query: "", category: "", stage: "", shown: PAGE_SIZE, timer: null };

    var panel = node("section", "library-search-panel");
    panel.setAttribute("aria-labelledby", "library-search-title");
    var heading = node("h2", "library-search-title", "Find a lesson");
    heading.id = "library-search-title";
    panel.appendChild(heading);
    panel.appendChild(node("p", "library-search-intro", "Search aviation lessons by topic or training stage."));

    var controls = node("div", "library-search-controls");
    var label = node("label", "library-search-label", "Search lessons");
    var input = node("input", "library-search-input");
    input.type = "search"; input.placeholder = "Try weather, checkride, or radio"; input.autocomplete = "off";
    input.setAttribute("aria-controls", "library-search-results");
    label.appendChild(input); controls.appendChild(label);

    function select(labelText, id, options, emptyLabel) {
      var wrap = node("label", "library-search-label", labelText);
      var selectEl = node("select", "library-search-select"); selectEl.id = id; selectEl.setAttribute("aria-controls", "library-search-results");
      options.forEach(function (option) { var item = node("option", "", option.value ? option.label : emptyLabel); item.value = option.value; selectEl.appendChild(item); });
      wrap.appendChild(selectEl); controls.appendChild(wrap); return selectEl;
    }
    var category = select("Topic", "library-search-topic", [{ value: "" }], "All topics");
    var stage = select("Training stage", "library-search-stage", [{ value: "" }, { value: "Exploring", label: "Exploring" }, { value: "Student pilot", label: "Student pilot" }, { value: "Instrument", label: "Instrument" }, { value: "Commercial", label: "Commercial" }, { value: "CFI", label: "CFI" }], "All stages");
    panel.appendChild(controls);

    var status = node("p", "library-search-status", ""); status.id = "library-search-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); panel.appendChild(status);
    var results = node("div", "library-search-results"); results.id = "library-search-results"; panel.appendChild(results);
    var more = node("button", "library-search-more", "Show more"); more.type = "button"; more.hidden = true; panel.appendChild(more);
    mount.appendChild(panel);

    function visibleRows() {
      var needle = state.query.trim().toLowerCase();
      return state.rows.filter(function (row) {
        var stages = getStages(row);
        var haystack = [row.title, row.description, row.category, row.categoryLabel].concat(stages).join(" ").toLowerCase();
        return (!needle || haystack.indexOf(needle) !== -1) && (!state.category || row.category === state.category || row.categoryLabel === state.category) && (!state.stage || stages.indexOf(state.stage) !== -1);
      });
    }

    function render() {
      results.textContent = "";
      if (state.failed) { status.textContent = "The lesson search is temporarily unavailable. Browse the lesson topics below."; return; }
      if (!state.loaded) { status.textContent = "Search or choose a filter to explore the library."; more.hidden = true; return; }
      if (!state.exploring) { status.textContent = "Search or choose a filter to explore the library."; more.hidden = true; return; }
      var rows = visibleRows();
      status.textContent = rows.length + " lesson" + (rows.length === 1 ? "" : "s") + " found";
      rows.slice(0, state.shown).forEach(function (row) {
        var path = internalPath(row.path); if (!path) return;
        var article = node("article", "library-search-result");
        var link = node("a", "library-search-result-title", row.title || "Untitled lesson"); link.href = path; article.appendChild(link);
        if (row.description) article.appendChild(node("p", "library-search-result-description", row.description));
        var resultStages = getStages(row);
        article.appendChild(node("p", "library-search-result-meta", [row.categoryLabel || row.category, resultStages.join(", ")].filter(Boolean).join(" · ")));
        results.appendChild(article);
      });
      if (!rows.length) results.appendChild(node("p", "library-search-empty", "No lessons match those filters. Try a broader topic or stage."));
      more.hidden = rows.length <= state.shown;
    }

    function getStages(row) {
      var values = Array.isArray(row.stages) ? row.stages : (row.stage ? String(row.stage).split(",") : []);
      var seen = {};
      return values.map(function (value) { return typeof value === "string" ? value.trim() : ""; }).filter(function (value) {
        if (!value || seen[value]) return false; seen[value] = true; return true;
      });
    }

    function load() {
      if (state.loaded || state.loading || state.failed) return;
      state.loading = true; status.textContent = "Loading lessons…";
      fetch(indexPath, { headers: { Accept: "application/json" } }).then(function (response) {
        if (!response.ok) throw Error("index unavailable"); return response.json();
      }).then(function (rows) {
        if (!Array.isArray(rows)) throw Error("invalid index");
        state.rows = rows.filter(function (row) { return row && typeof row === "object" && typeof row.title === "string" && internalPath(row.path); });
        state.loaded = true; state.loading = false;
        var categories = {}; state.rows.forEach(function (row) { var value = row.category || row.categoryLabel; if (value) categories[value] = row.categoryLabel || value; });
        Object.keys(categories).sort().forEach(function (value) { var option = node("option", "", categories[value]); option.value = value; category.appendChild(option); });
        render();
      }).catch(function () { state.loading = false; state.failed = true; render(); });
    }

    function changed() { state.exploring = true; state.query = input.value; state.category = category.value; state.stage = stage.value; state.shown = PAGE_SIZE; window.clearTimeout(state.timer); state.timer = window.setTimeout(function () { load(); render(); }, 150); }
    input.addEventListener("input", changed); input.addEventListener("focus", load); category.addEventListener("change", changed); stage.addEventListener("change", changed); category.addEventListener("focus", load); stage.addEventListener("focus", load); more.addEventListener("click", function () { state.shown += PAGE_SIZE; render(); });
    render();
  }

  for (var i = 0; i < mounts.length; i++) init(mounts[i]);
})();
