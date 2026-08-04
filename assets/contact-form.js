var FORMSPREE_ENDPOINT = "https://formspree.io/f/FORMSPREE_ID"; // TODO(Diego): create a free Formspree form, paste the real ID here

/* ==========================================================================
   SuarezCFI — Contact form mount upgrader (no dependencies)
   Upgrades every .contact-form-mount on DOMContentLoaded:
   - keeps the existing mailto/tel fallback in the DOM (hidden once upgraded,
     visible again if submission fails)
   - renders the intake form and POSTs it to Formspree via fetch
   Mount contract:
     <link rel="stylesheet" href="/assets/contact-form.css" />
     <div class="contact-form-mount" data-form-context="PAGE_SLUG"> ...fallback... </div>
     <script src="/assets/contact-form.js" defer></script>
   ========================================================================== */
(function () {
  "use strict";

  var PHONE_DISPLAY = "502-510-0508";
  var PHONE_HREF = "tel:+15025100508";

  var SELECT_FIELDS = [
    {
      name: "goal",
      label: "Goal",
      options: [
        "Discovery flight",
        "Private pilot",
        "Ground school",
        "Written test prep",
        "Checkride oral prep",
        "Flight review or endorsements",
        "Something else"
      ]
    },
    {
      name: "training_status",
      label: "Current training status",
      options: [
        "Haven't started",
        "Researching",
        "Training with a school",
        "Training with another CFI",
        "Licensed pilot"
      ]
    },
    {
      name: "medical_status",
      label: "Medical status",
      options: [
        "Haven't started",
        "MedXPress submitted",
        "Have medical",
        "BasicMed",
        "Not sure"
      ]
    },
    {
      name: "written_status",
      label: "Written test status",
      options: [
        "Haven't started",
        "Studying",
        "Passed"
      ]
    }
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function fieldId(context, name) {
    return "cf-" + context + "-" + name.replace(/[^a-z0-9]+/gi, "-");
  }

  function buildTextField(context, name, label, type, required, fullWidth) {
    var wrap = el("div", "cf-field" + (fullWidth ? " cf-field--full" : ""));
    var id = fieldId(context, name);

    var labelEl = el("label", "cf-label");
    labelEl.setAttribute("for", id);
    labelEl.appendChild(document.createTextNode(label + " "));
    if (required) {
      var req = el("span", "cf-required", "*");
      req.setAttribute("aria-hidden", "true");
      labelEl.appendChild(req);
    } else {
      labelEl.appendChild(el("span", "cf-optional", "(optional)"));
    }

    var input = el("input", "cf-input");
    input.type = type;
    input.id = id;
    input.name = name;
    if (required) input.required = true;
    if (type === "email") input.autocomplete = "email";
    if (type === "tel") input.autocomplete = "tel";
    if (name === "name") input.autocomplete = "name";

    wrap.appendChild(labelEl);
    wrap.appendChild(input);
    return wrap;
  }

  function buildSelectField(context, def) {
    var wrap = el("div", "cf-field");
    var id = fieldId(context, def.name);

    var labelEl = el("label", "cf-label", def.label);
    labelEl.setAttribute("for", id);

    var select = el("select", "cf-select");
    select.id = id;
    select.name = def.name;

    var placeholder = el("option", "", "Select one");
    placeholder.value = "";
    placeholder.selected = true;
    select.appendChild(placeholder);

    def.options.forEach(function (opt) {
      var option = el("option", "", opt);
      option.value = opt;
      select.appendChild(option);
    });

    wrap.appendChild(labelEl);
    wrap.appendChild(select);
    return wrap;
  }

  function buildMessageField(context) {
    var wrap = el("div", "cf-field cf-field--full");
    var id = fieldId(context, "message");

    var labelEl = el("label", "cf-label");
    labelEl.setAttribute("for", id);
    labelEl.appendChild(document.createTextNode("Message "));
    labelEl.appendChild(el("span", "cf-optional", "(optional)"));

    var textarea = el("textarea", "cf-textarea");
    textarea.id = id;
    textarea.name = "message";
    textarea.rows = 4;

    wrap.appendChild(labelEl);
    wrap.appendChild(textarea);
    return wrap;
  }

  function buildHoneypot(context) {
    var wrap = el("div", "cf-honeypot");
    wrap.setAttribute("aria-hidden", "true");

    var id = fieldId(context, "gotcha");
    var labelEl = el("label", "", "Leave this field empty");
    labelEl.setAttribute("for", id);

    var input = el("input");
    input.type = "text";
    input.id = id;
    input.name = "_gotcha";
    input.tabIndex = -1;
    input.autocomplete = "off";

    wrap.appendChild(labelEl);
    wrap.appendChild(input);
    return wrap;
  }

  function showFallback(fallback) {
    if (fallback) fallback.hidden = false;
  }

  function upgradeMount(mount) {
    if (mount.getAttribute("data-cf-upgraded")) return; // never double-upgrade
    mount.setAttribute("data-cf-upgraded", "1");

    var context = mount.getAttribute("data-form-context") || "page";

    // Defensive: without a real Formspree ID, keep the mailto/tel fallback as-is.
    if (FORMSPREE_ENDPOINT.indexOf("FORMSPREE_ID") !== -1) return;

    // Keep the existing fallback content in the DOM, hidden once upgraded.
    var fallback = el("div", "cf-fallback");
    fallback.hidden = true;
    while (mount.firstChild) {
      fallback.appendChild(mount.firstChild);
    }
    mount.appendChild(fallback);

    var form = el("form", "cf-form");
    form.setAttribute("novalidate", "novalidate");

    form.appendChild(buildTextField(context, "name", "Name", "text", true, false));
    form.appendChild(buildTextField(context, "email", "Email", "email", true, false));
    form.appendChild(buildTextField(context, "phone", "Phone", "tel", false, false));
    form.appendChild(buildTextField(context, "home_airport", "Home airport", "text", false, false));

    SELECT_FIELDS.forEach(function (def) {
      form.appendChild(buildSelectField(context, def));
    });

    form.appendChild(buildTextField(context, "availability", "Availability", "text", false, false));
    form.appendChild(buildMessageField(context));
    form.appendChild(buildHoneypot(context));

    var pageField = el("input");
    pageField.type = "hidden";
    pageField.name = "page";
    pageField.value = context;
    form.appendChild(pageField);

    var errorNote = el("p", "cf-error");
    errorNote.setAttribute("role", "alert");
    errorNote.hidden = true;
    errorNote.appendChild(document.createTextNode(
      "Something went wrong sending that. Please email or call instead — the direct links are back below."
    ));
    form.appendChild(errorNote);

    var actions = el("div", "cf-actions");
    var submit = el("button", "btn btn--primary cf-submit", "Send message");
    submit.type = "submit";
    submit.setAttribute("data-cta-id", "contact-form-submit-" + context);
    actions.appendChild(submit);
    actions.appendChild(el("p", "cf-note", "Goes straight to Diego's inbox. No account needed."));
    form.appendChild(actions);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submit.disabled) return;

      errorNote.hidden = true;
      submit.disabled = true;
      var originalText = submit.textContent;
      submit.textContent = "Sending…";

      var done = function () {
        submit.disabled = false;
        submit.textContent = originalText;
      };

      var fail = function () {
        done();
        errorNote.hidden = false;
        showFallback(fallback);
      };

      var request;
      try {
        request = fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });
      } catch (err) {
        fail();
        return;
      }

      request.then(function (response) {
        if (!response || !response.ok) {
          fail();
          return;
        }
        form.remove();
        var success = el("div", "cf-success");
        success.setAttribute("role", "status");
        var strong = el("strong", "", "Thanks");
        success.appendChild(strong);
        success.appendChild(document.createTextNode(
          " — Diego will get back to you within a day. Need it sooner? Call "
        ));
        var phoneLink = el("a", "", PHONE_DISPLAY);
        phoneLink.href = PHONE_HREF;
        success.appendChild(phoneLink);
        success.appendChild(document.createTextNode("."));
        mount.appendChild(success);
        if (typeof window.trackCtaClick === "function") {
          window.trackCtaClick("contact-form-success-" + context, null);
        }
      }).catch(fail);
    });

    mount.appendChild(form);
  }

  function init() {
    if (typeof window.fetch !== "function") return; // no fetch: fallback stays visible
    var mounts = document.querySelectorAll(".contact-form-mount");
    for (var i = 0; i < mounts.length; i++) {
      try {
        upgradeMount(mounts[i]);
      } catch (err) {
        // Never let one mount break the others or the page.
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
