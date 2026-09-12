var FORMSPREE_ENDPOINT = "";

/* ==========================================================================
   SuarezCFI — Contact form mount upgrader (no dependencies)
   Upgrades every .contact-form-mount on DOMContentLoaded:
   - keeps the existing mailto/tel fallback in the DOM (hidden once upgraded,
     visible again if a Formspree submission fails)
   - renders the same 3-field form (name, email-or-phone, message) on every mount
   Two submit modes:
   - Formspree mode (real endpoint configured): POSTs via fetch; success panel
     on ok, error note + restored fallback on failure
   - Mailto mode (endpoint not configured): opens the visitor's mail app with
     a prefilled message to Diego and says that the handoff was attempted;
     it never claims that an email was sent
   Mount contract:
     <link rel="stylesheet" href="/assets/contact-form.css" />
     <div class="contact-form-mount" data-form-context="PAGE_SLUG"> ...fallback... </div>
     <script src="/assets/contact-form.js" defer></script>
   ========================================================================== */
(function () {
  "use strict";

  var PHONE_DISPLAY = "502-510-0508";
  var PHONE_HREF = "tel:+15025100508";
  var MAILTO_ADDRESS = "SuarezCFI@gmail.com";
  var DISCOVERY_CONTEXT = "discovery-flight-louisville-ky";

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

  function buildMessageField(context) {
    var wrap = el("div", "cf-field cf-field--full");
    var id = fieldId(context, "message");

    var labelEl = el("label", "cf-label");
    labelEl.setAttribute("for", id);
    labelEl.appendChild(document.createTextNode(context === DISCOVERY_CONTEXT
      ? "What would you like to do on your discovery flight? "
      : "What are you working toward? "));
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

  // Replace the form with the success panel and fire the CTA success hook.
  function showSuccess(mount, form, context) {
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
  }

  function showMailtoHandoff(mount, context) {
    var status = el("p", "cf-handoff");
    status.setAttribute("role", "status");
    status.appendChild(document.createTextNode(
      "Your email app should open with the message addressed to Diego. If it does not, email "
    ));
    var emailLink = el("a", "", MAILTO_ADDRESS);
    emailLink.href = "mailto:" + MAILTO_ADDRESS;
    status.appendChild(emailLink);
    status.appendChild(document.createTextNode(" or call "));
    var phoneLink = el("a", "", PHONE_DISPLAY);
    phoneLink.href = PHONE_HREF;
    status.appendChild(phoneLink);
    status.appendChild(document.createTextNode(". "));
    var contextText = context === DISCOVERY_CONTEXT ? "We can arrange a discovery flight from there." : "We can pick up from there.";
    status.appendChild(document.createTextNode(contextText));
    mount.insertBefore(status, mount.querySelector(".cf-form"));
  }

  function showError(errorNote, fallback) {
    errorNote.hidden = false;
    showFallback(fallback);
  }

  function endpointFor(mount) {
    var configured = mount.getAttribute("data-form-endpoint") ||
      window.SUAREZ_CFI_FORM_ENDPOINT || window.FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT;
    if (typeof configured !== "string") return "";
    configured = configured.trim();
    if (!configured || configured.indexOf("FORMSPREE_ID") !== -1) return "";
    try {
      var url = new URL(configured, window.location && window.location.href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      return url.href;
    } catch (err) {
      return "";
    }
  }

  function upgradeMount(mount) {
    if (mount.getAttribute("data-cf-upgraded")) return; // never double-upgrade
    mount.setAttribute("data-cf-upgraded", "1");

    var context = mount.getAttribute("data-form-context") || "page";
    var endpoint = endpointFor(mount);
    var formspreeMode = Boolean(endpoint);

    // Formspree submissions need fetch; without it keep the mailto/tel fallback.
    if (formspreeMode && typeof window.fetch !== "function") return;

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
    form.appendChild(buildTextField(context, "contact", "Email or phone", "text", true, false));
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
    var sendError = "Something went wrong sending that. Please email or call instead — the direct links are back below.";
    var validationError = "Please add your name and an email or phone number.";
    errorNote.appendChild(document.createTextNode(sendError));
    form.appendChild(errorNote);

    var actions = el("div", "cf-actions");
    var submit = el("button", "btn btn--primary cf-submit", formspreeMode && context === DISCOVERY_CONTEXT ? "Send discovery inquiry" : (formspreeMode ? "Send message" : "Open email draft"));
    submit.type = "submit";
    submit.setAttribute("data-cta-id", "contact-form-submit-" + context);
    actions.appendChild(submit);
    actions.appendChild(el("p", "cf-note", formspreeMode
      ? "Goes straight to Diego's inbox — he replies within a day."
      : "Opens an email draft for you to review and send."));
    form.appendChild(actions);

    var submitting = false;
    var mailtoHandled = false;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitting || mailtoHandled) return;

      var name = form.elements["name"];
      var contact = form.elements["contact"];
      var message = form.elements["message"];
      if (!name.value.trim() || !contact.value.trim()) {
        form.classList.add("cf-form--invalid");
        errorNote.textContent = validationError;
        showError(errorNote, fallback);
        return;
      }
      form.classList.remove("cf-form--invalid");

      if (!formspreeMode) {
        // Mailto mode: hand the message to the visitor's own mail app.
        // A filled honeypot means a bot — skip the handoff.
        var gotcha = form.elements["_gotcha"];
        if (!gotcha || !gotcha.value) {
          mailtoHandled = true;
          submit.disabled = true;
          try {
            window.location.href = "mailto:" + MAILTO_ADDRESS +
              "?subject=" + encodeURIComponent((context === DISCOVERY_CONTEXT ? "Discovery flight inquiry — " : "Website message — ") + name.value + " (" + context + ")") +
              "&body=" + encodeURIComponent("Name: " + name.value + "\nEmail/phone: " + contact.value + "\nPage: " + context + "\n\n" + message.value);
            showMailtoHandoff(mount, context);
            showFallback(fallback);
          } catch (err) {
            mailtoHandled = false;
            submit.disabled = false;
            showError(errorNote, fallback);
          }
        }
        return;
      }

      errorNote.hidden = true;
      errorNote.textContent = sendError;
      submitting = true;
      submit.disabled = true;
      var originalText = submit.textContent;
      submit.textContent = "Sending…";

      var done = function () {
        submitting = false;
        submit.disabled = false;
        submit.textContent = originalText;
      };

      var fail = function () {
        done();
        showError(errorNote, fallback);
      };

      var request;
      try {
        request = window.fetch(endpoint, {
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
        if (response.status < 200 || response.status >= 300) {
          fail();
          return;
        }
        showSuccess(mount, form, context);
      }).catch(fail);
    });

    mount.appendChild(form);
  }

  function init() {
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
