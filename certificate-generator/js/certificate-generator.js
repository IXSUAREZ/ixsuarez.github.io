/* ==========================================================================
   Certificate Generator — vanilla JS port of the KFTC Certificate Generator
   React app (src/lib/templates.ts, src/lib/compositor.ts, src/App.tsx,
   src/components/PhotoCropper.tsx). No build step, no framework.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Geometry constants — ported 1:1 from src/lib/templates.ts           */
  /* ------------------------------------------------------------------ */

  /** Native canvas size of every template (px) */
  var CANVAS = { w: 1080, h: 1920 };

  /** Photo placeholder window measured from the templates (px, canvas space) — 4:3 landscape */
  var PHOTO_BOX = { x: 132, y: 483, w: 824, h: 620, r: 24 };

  /** Text baseline positions measured from the templates (px, canvas space) */
  var TEXT_LAYOUT = {
    studentBaseline: 1255,
    studentMaxWidth: 824,
    labelBaseline: 1332,
    nameBaseline: 1404,
    instructorMaxWidth: 824,
  };

  /* Home base used in the generated caption's credit line. This tool is a
     private one for Diego + Kentucky Flight Training Center's social pages,
     not a general CFI tool, so these stay hardcoded rather than becoming
     per-user settings; the Edit toggle covers any one-off. */
  var CAPTION_LOCALE = {
    school: "Kentucky Flight Training Center",
    airport: "Bowman Field (KLOU)",
    city: "Louisville KY",
  };

  /** Same credit line appended to every certificate's caption. */
  var CAPTION_CREDIT = "Trained at {school}, {airport}, {city}.";

  /** Substitutes {school}/{city}/{airport} placeholders so CAPTION_LOCALE
      is the only place the home base lives. */
  function fillLocale(pattern) {
    return pattern
      .replace(/\{school\}/g, CAPTION_LOCALE.school)
      .replace(/\{airport\}/g, CAPTION_LOCALE.airport)
      .replace(/\{city\}/g, CAPTION_LOCALE.city);
  }

  // Theme colors (accent/soft/line/ink) are copied from the Simply Endorsed
  // CATEGORY_THEMES palette (simply-endorsed/js/app.js) so the certificate
  // picker reads as part of the same color system as the endorsement categories.
  var CERT_TEMPLATES = [
    { id: "first-solo", title: "First Solo", subtitle: "Milestone flight", image: "templates/first-solo.jpg", defaultRating: "CFI", theme: { accent: "#f59e0b", soft: "#fef7eb", line: "#fde7c2", ink: "#b37000" }, captionEvent: "on your first solo flight", captionBody: "The first solo is the one you never forget — three trips around the pattern, an empty right seat, and an airplane that suddenly climbs a whole lot better.", hashtags: ["#FirstSolo", "#StudentPilot", "#BowmanField"] }, // student-pilot
    { id: "private", title: "Private Pilot", subtitle: "Certificate", image: "templates/private.jpg", defaultRating: "CFI", theme: { accent: "#0ea5e9", soft: "#ecf8fd", line: "#c3e9fa", ink: "#0476a9" }, captionEvent: "for passing your private pilot checkride", captionBody: "The private certificate is the big one — the license to learn. Cross-countries, night flying, time under the hood, and an oral that covers everything from airspace to aeromedical before you ever preflight.", hashtags: ["#PrivatePilot", "#CheckridePassed", "#BowmanField"] }, // private-pilot
    { id: "sport", title: "Sport Pilot", subtitle: "Certificate", image: "templates/sport.jpg", defaultRating: "CFI", theme: { accent: "#16a34a", soft: "#ecf8f1", line: "#c5e8d2", ink: "#0b7633" }, captionEvent: "for passing your sport pilot checkride", captionBody: "Sport pilot is the quickest way into the left seat — light sport airplanes, real stick-and-rudder flying, and a checkride that proves you can handle the airplane.", hashtags: ["#SportPilot", "#LightSport", "#BowmanField"] }, // sport-pilot
    { id: "instrument", title: "Instrument", subtitle: "Rating", image: "templates/instrument.jpg", defaultRating: "CFII", theme: { accent: "#64748b", soft: "#f3f4f6", line: "#d8dce2", ink: "#455162" }, captionEvent: "for passing your instrument rating checkride", captionBody: "The instrument rating is where flying stops being fair-weather. Approaches, holds, partial panel, and the discipline to trust the instruments when the horizon disappears.", hashtags: ["#InstrumentRating", "#IFR", "#BowmanField"] }, // instrument-rating
    { id: "commercial", title: "Commercial", subtitle: "Certificate", image: "templates/commercial.jpg", defaultRating: "CFI", theme: { accent: "#ca8a04", soft: "#fbf6eb", line: "#f2e2c0", ink: "#906200" }, captionEvent: "for passing your commercial pilot checkride", captionBody: "Commercial is where precision stops being optional — chandelles, lazy eights, and eights-on-pylons, all flown to a standard where the DPE wants them to look easy.", hashtags: ["#CommercialPilot", "#CheckridePassed", "#BowmanField"] }, // commercial-pilot
    { id: "multi-engine", title: "Multi-Engine", subtitle: "Add-on rating", image: "templates/multi-engine.jpg", defaultRating: "MEI", theme: { accent: "#1f2937", soft: "#edeeef", line: "#c7cacd", ink: "#151d27" }, captionEvent: "for passing your multi-engine checkride", captionBody: "Multi-engine is about the day one of them quits. Vmc demos, single-engine work, and knowing which foot goes to the floor before you have time to think about it.", hashtags: ["#MultiEngine", "#TwinEngine", "#BowmanField"] }, // atp
    { id: "cfi", title: "CFI", subtitle: "Instructor rating", image: "templates/cfi.jpg", defaultRating: "CFI", theme: { accent: "#dc2626", soft: "#fceeee", line: "#f6c9c9", ink: "#a11414" }, captionEvent: "for passing your CFI checkride", captionBody: "The CFI is the hardest checkride in general aviation — you fly it from the right seat and teach it out loud at the same time. Passing means you don't just know it, you can explain it.", hashtags: ["#CFI", "#FlightInstructor", "#BowmanField"] }, // flight-instructor
    { id: "cfii", title: "CFII", subtitle: "Instrument instructor", image: "templates/cfii.jpg", defaultRating: "CFII", theme: { accent: "#7c3aed", soft: "#f5effe", line: "#decefb", ink: "#4f0ac4" }, captionEvent: "for passing your CFII checkride", captionBody: "CFII is teaching the instrument rating — running approaches from the right seat while explaining what the needles are doing to the person actually flying them.", hashtags: ["#CFII", "#FlightInstructor", "#BowmanField"] }, // specialty-operations
  ];

  var RATINGS = ["CFI", "CFII", "MEI"];

  /* ------------------------------------------------------------------ */
  /* Compositor — ported 1:1 from src/lib/compositor.ts                  */
  /* ------------------------------------------------------------------ */

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** Minimum zoom so the photo always covers the box */
  function minScaleFor(img) {
    return Math.max(PHOTO_BOX.w / img.naturalWidth, PHOTO_BOX.h / img.naturalHeight);
  }

  function clampCrop(crop, img) {
    var min = minScaleFor(img);
    var scale = Math.min(Math.max(crop.scale, min), min * 6);
    var w = img.naturalWidth * scale;
    var h = img.naturalHeight * scale;
    var x = Math.min(0, Math.max(PHOTO_BOX.w - w, crop.x));
    var y = Math.min(0, Math.max(PHOTO_BOX.h - h, crop.y));
    return { scale: scale, x: x, y: y };
  }

  function initialCrop(img) {
    var scale = minScaleFor(img);
    return clampCrop(
      {
        scale: scale,
        x: (PHOTO_BOX.w - img.naturalWidth * scale) / 2,
        y: (PHOTO_BOX.h - img.naturalHeight * scale) / 2,
      },
      img
    );
  }

  function drawFittedText(ctx, text, centerX, baseline, opts) {
    var size = opts.startSize;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    var supportsLetterSpacing = "letterSpacing" in ctx;
    while (size > opts.minSize) {
      ctx.font = opts.weight + " " + size + "px Oswald, 'Arial Narrow', sans-serif";
      if (supportsLetterSpacing) ctx.letterSpacing = opts.letterSpacing + "px";
      if (ctx.measureText(text).width <= opts.maxWidth) break;
      size -= 4;
    }
    ctx.fillText(text, centerX, baseline);
    if (supportsLetterSpacing) ctx.letterSpacing = "0px";
  }

  function drawCertificate(canvas, template, data) {
    canvas.width = CANVAS.w;
    canvas.height = CANVAS.h;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS.w, CANVAS.h);

    // Photo underneath the template's glass frame? No — template placeholder is opaque,
    // so draw template first, then paint the photo over the placeholder window.
    ctx.drawImage(template, 0, 0, CANVAS.w, CANVAS.h);

    if (data.photo && data.crop) {
      var crop = clampCrop(data.crop, data.photo);
      ctx.save();
      roundedRectPath(ctx, PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.r);
      ctx.clip();
      ctx.drawImage(
        data.photo,
        PHOTO_BOX.x + crop.x,
        PHOTO_BOX.y + crop.y,
        data.photo.naturalWidth * crop.scale,
        data.photo.naturalHeight * crop.scale
      );
      ctx.restore();
    }

    // Text — white with a soft drop shadow, matching the template look
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    var cx = CANVAS.w / 2;
    if (data.studentName.trim()) {
      drawFittedText(ctx, data.studentName.trim().toUpperCase(), cx, TEXT_LAYOUT.studentBaseline, {
        weight: 600,
        startSize: 148,
        minSize: 48,
        maxWidth: TEXT_LAYOUT.studentMaxWidth,
        letterSpacing: 2,
      });
    }
    if (data.instructorName.trim()) {
      // Slightly gray to set the instructor lines apart from the student's pure white name
      ctx.fillStyle = "#e3e3e3";
      drawFittedText(ctx, "INSTRUCTED BY", cx, TEXT_LAYOUT.labelBaseline, {
        weight: 500,
        startSize: 76,
        minSize: 40,
        maxWidth: TEXT_LAYOUT.instructorMaxWidth,
        letterSpacing: 10,
      });
      drawFittedText(
        ctx,
        data.rating + " " + data.instructorName.trim().toUpperCase(),
        cx,
        TEXT_LAYOUT.nameBaseline,
        {
          weight: 500,
          startSize: 72,
          minSize: 36,
          maxWidth: TEXT_LAYOUT.instructorMaxWidth,
          letterSpacing: 4,
        }
      );
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  /* ------------------------------------------------------------------ */
  /* Photo normalization — ported from src/App.tsx normalizePhoto()      */
  /* ------------------------------------------------------------------ */

  /* Loads a File through a temporary object URL, revoking it either way so
     repeated uploads don't leak a blob per photo. */
  function loadImageFromFile(file) {
    var url = URL.createObjectURL(file);
    function release(result) {
      URL.revokeObjectURL(url);
      return result;
    }
    return loadImage(url).then(release, function (err) {
      release();
      throw err;
    });
  }

  function normalizePhoto(file) {
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(file, { imageOrientation: "from-image" })
        .then(function (bmp) {
          var maxDim = 2400;
          var k = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(bmp.width * k);
          canvas.height = Math.round(bmp.height * k);
          canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
          if (typeof bmp.close === "function") bmp.close();
          return loadImage(canvas.toDataURL("image/jpeg", 0.92));
        })
        .catch(function () {
          return loadImageFromFile(file);
        });
    }
    return loadImageFromFile(file);
  }

  /* ------------------------------------------------------------------ */
  /* DOM references                                                      */
  /* ------------------------------------------------------------------ */

  var dom = {};

  function cacheDom() {
    dom.status = document.getElementById("cgStatus");
    dom.stepperItems = Array.prototype.slice.call(document.querySelectorAll(".cg-step"));
    dom.panels = Array.prototype.slice.call(document.querySelectorAll(".cg-panel"));
    dom.backBtn = document.getElementById("cgBackBtn");
    dom.nextBtn = document.getElementById("cgNextBtn");

    dom.templateGrid = document.getElementById("cgTemplateGrid");

    dom.studentFirst = document.getElementById("cgStudentFirst");
    dom.studentLast = document.getElementById("cgStudentLast");
    dom.instructorFirst = document.getElementById("cgInstructorFirst");
    dom.instructorLast = document.getElementById("cgInstructorLast");
    dom.ratingGroup = document.getElementById("cgRatingGroup");
    dom.ratingButtons = Array.prototype.slice.call(document.querySelectorAll(".cg-rating-btn"));
    dom.ratingHelper = document.getElementById("cgRatingHelper");

    dom.photoEmpty = document.getElementById("cgPhotoEmpty");
    dom.photoReady = document.getElementById("cgPhotoReady");
    dom.photoThumb = document.getElementById("cgPhotoThumb");
    dom.uploadBtn = document.getElementById("cgUploadBtn");
    dom.adjustCropBtn = document.getElementById("cgAdjustCropBtn");
    dom.replacePhotoBtn = document.getElementById("cgReplacePhotoBtn");
    dom.fileInput = document.getElementById("cgFileInput");
    dom.pasteBtn = document.getElementById("cgPasteBtn");
    dom.pasteReplaceBtn = document.getElementById("cgPasteReplaceBtn");
    dom.pasteCatcher = document.getElementById("cgPasteCatcher");
    dom.pasteHint = document.getElementById("cgPasteHint");

    dom.summary = document.getElementById("cgSummary");
    dom.startOverBtn = document.getElementById("cgStartOverBtn");

    dom.canvas = document.getElementById("cgCanvas");
    dom.downloadBtn = document.getElementById("cgDownloadBtn");
    dom.shareBtn = document.getElementById("cgShareBtn");
    dom.previewCaption = document.getElementById("cgPreviewCaption");
    dom.saveImgWrap = document.getElementById("cgSaveImgWrap");
    dom.saveImg = document.getElementById("cgSaveImg");

    dom.caption = document.getElementById("cgCaption");
    dom.captionEditBtn = document.getElementById("cgCaptionEditBtn");
    dom.captionCard = document.getElementById("cgCaptionCard");
    dom.captionText = document.getElementById("cgCaptionText");
    dom.captionHint = document.getElementById("cgCaptionHint");
    dom.captionInput = document.getElementById("cgCaptionInput");
    dom.captionEditActions = document.getElementById("cgCaptionEditActions");
    dom.captionResetBtn = document.getElementById("cgCaptionResetBtn");
    dom.captionDoneBtn = document.getElementById("cgCaptionDoneBtn");

    dom.cropper = document.getElementById("cgCropper");
    dom.cropBox = document.getElementById("cgCropBox");
    dom.cropImg = document.getElementById("cgCropImg");
    dom.zoomSlider = document.getElementById("cgZoomSlider");
    dom.zoomOutBtn = document.getElementById("cgZoomOutBtn");
    dom.zoomInBtn = document.getElementById("cgZoomInBtn");
    dom.resetCropBtn = document.getElementById("cgResetCropBtn");
    dom.cropCancelBtn = document.getElementById("cgCropCancelBtn");
    dom.cropConfirmBtn = document.getElementById("cgCropConfirmBtn");
    dom.cropCancelX = document.getElementById("cgCropperCancelX");
  }

  /* ------------------------------------------------------------------ */
  /* Application state                                                    */
  /* ------------------------------------------------------------------ */

  var state = {
    step: 0,
    templateId: null,
    studentFirst: "",
    studentLast: "",
    instructorFirst: "",
    instructorLast: "",
    rating: "CFI",
    photo: null,
    crop: null,
    templateImg: null,
    fontsReady: false,
    captionEdited: false,
    captionText: "",
  };

  var templateCache = new Map();
  var lastDownloadUrl = null;
  /* Tracks whether the caption textarea is currently the visible editor —
     kept outside `state` since it's transient view state, not app data. */
  var captionEditing = false;

  function currentTemplate() {
    for (var i = 0; i < CERT_TEMPLATES.length; i++) {
      if (CERT_TEMPLATES[i].id === state.templateId) return CERT_TEMPLATES[i];
    }
    return null;
  }

  function namesValid() {
    return !!(
      state.studentFirst.trim() &&
      state.studentLast.trim() &&
      state.instructorFirst.trim() &&
      state.instructorLast.trim()
    );
  }

  function studentName() {
    return (state.studentFirst + " " + state.studentLast).trim();
  }

  function instructorName() {
    return (state.instructorFirst + " " + state.instructorLast).trim();
  }

  /* ------------------------------------------------------------------ */
  /* Social caption                                                       */
  /* ------------------------------------------------------------------ */

  /** Builds the ready-to-post caption for the current template/names/rating.
      Returns "" when no template is selected. Names keep the casing the
      user typed — only the certificate canvas itself uppercases them. */
  function buildCaption() {
    var t = currentTemplate();
    if (!t) return "";

    var student = studentName();
    var instructor = instructorName();

    var sentence = "Congratulations";
    if (student) sentence += " " + student;
    sentence += " " + t.captionEvent;
    if (instructor) sentence += ", instructed by " + state.rating + " " + instructor;
    sentence += ". ✈️";

    var body = t.captionBody + " " + fillLocale(CAPTION_CREDIT);

    return [sentence, "", body, "", t.hashtags.join(" ")].join("\n");
  }

  /* ------------------------------------------------------------------ */
  /* Template loading                                                     */
  /* ------------------------------------------------------------------ */

  function selectTemplate(t) {
    state.templateId = t.id;
    state.rating = t.defaultRating;
    state.captionEdited = false;
    startLoadingTemplateImage(t);
  }

  function startLoadingTemplateImage(t) {
    var cached = templateCache.get(t.id);
    if (cached) {
      state.templateImg = cached;
      render();
      return;
    }
    setStatus("Loading " + t.title + " template…");
    loadImage(t.image)
      .then(function (img) {
        templateCache.set(t.id, img);
        if (state.templateId === t.id) {
          state.templateImg = img;
          render();
        }
      })
      .catch(function () {
        if (state.templateId === t.id) {
          setStatus("Could not load that template image. Try again or pick a different certificate.");
        }
      });
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                            */
  /* ------------------------------------------------------------------ */

  function setStatus(text) {
    dom.status.textContent = text;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderTemplateGrid() {
    dom.templateGrid.innerHTML = "";
    CERT_TEMPLATES.forEach(function (t) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "cg-cert-btn";
      card.dataset.templateId = t.id;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");
      card.style.setProperty("--cert-accent", t.theme.accent);
      card.style.setProperty("--cert-soft", t.theme.soft);
      card.style.setProperty("--cert-line", t.theme.line);
      card.style.setProperty("--cert-ink", t.theme.ink);

      var swatch = el("span", "cg-cert-swatch");
      swatch.setAttribute("aria-hidden", "true");

      var meta = el("span", "cg-cert-meta");
      meta.appendChild(el("span", "cg-cert-title", t.title));
      meta.appendChild(el("span", "cg-cert-sub", t.subtitle));

      card.appendChild(swatch);
      card.appendChild(meta);

      card.addEventListener("click", function () {
        selectTemplate(t);
        render();
      });

      dom.templateGrid.appendChild(card);
    });
  }

  function syncTemplateSelection() {
    var cards = dom.templateGrid.querySelectorAll(".cg-cert-btn");
    cards.forEach(function (card) {
      var selected = card.dataset.templateId === state.templateId;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-checked", selected ? "true" : "false");
    });
  }

  function syncRatingButtons() {
    dom.ratingButtons.forEach(function (btn) {
      var active = btn.dataset.rating === state.rating;
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
    dom.ratingHelper.textContent =
      'Appears on the certificate as "' +
      state.rating +
      " " +
      (instructorName() ? instructorName().toUpperCase() : "FIRST LAST") +
      '".';
  }

  function drawPhotoThumbnail(canvas, photo, crop) {
    var W = canvas.width;
    var H = canvas.height;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    if (!photo || !crop) return;
    var k = W / PHOTO_BOX.w;
    ctx.drawImage(
      photo,
      crop.x * k,
      crop.y * k,
      photo.naturalWidth * crop.scale * k,
      photo.naturalHeight * crop.scale * k
    );
  }

  function renderPhotoStep() {
    if (state.photo) {
      dom.photoEmpty.hidden = true;
      dom.photoReady.hidden = false;
      drawPhotoThumbnail(dom.photoThumb, state.photo, state.crop);
    } else {
      dom.photoEmpty.hidden = false;
      dom.photoReady.hidden = true;
    }
  }

  function summaryRow(label, value) {
    var row = el("div", "cg-summary-row");
    row.appendChild(el("span", "cg-summary-label", label));
    row.appendChild(el("span", "cg-summary-value", value));
    return row;
  }

  function renderSummary() {
    dom.summary.innerHTML = "";
    var t = currentTemplate();
    dom.summary.appendChild(summaryRow("Certificate", t ? t.title : "Not selected"));
    dom.summary.appendChild(summaryRow("Student", studentName() || "Not entered"));
    dom.summary.appendChild(
      summaryRow("Instructor", instructorName() ? state.rating + " " + instructorName() : "Not entered")
    );
    dom.summary.appendChild(summaryRow("Photo", state.photo ? "Added" : "Placeholder kept"));
  }

  function renderStepper() {
    dom.stepperItems.forEach(function (li) {
      var i = Number(li.dataset.stepIndex);
      var btn = li.querySelector(".cg-step-btn");
      var active = i === state.step;
      var done = i < state.step;
      li.classList.toggle("is-active", active);
      li.classList.toggle("is-done", done);
      btn.disabled = !done;
      if (active) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
    });
  }

  function renderPanels() {
    dom.panels.forEach(function (panel) {
      panel.hidden = Number(panel.dataset.panel) !== state.step;
    });
  }

  function renderNavRow() {
    dom.backBtn.disabled = state.step === 0;

    if (state.step === 3) {
      dom.nextBtn.hidden = true;
    } else {
      dom.nextBtn.hidden = false;
      dom.nextBtn.disabled = false;
      if (state.step === 0) {
        dom.nextBtn.textContent = "Continue";
        dom.nextBtn.disabled = !state.templateId;
      } else if (state.step === 1) {
        dom.nextBtn.textContent = "Continue";
        dom.nextBtn.disabled = !namesValid();
      } else if (state.step === 2) {
        dom.nextBtn.textContent = state.photo ? "Preview certificate" : "Skip photo";
      }
    }
  }

  function renderStatus() {
    var t = currentTemplate();
    if (state.step === 0) {
      setStatus(t ? t.title + " selected — continue to add names." : "Select a certificate to begin.");
    } else if (state.step === 1) {
      setStatus(namesValid() ? "Names look good — continue to add a photo." : "Enter both student and instructor names to continue.");
    } else if (state.step === 2) {
      setStatus(state.photo ? "Photo added — continue to review." : "Photo is optional. Add one now or skip and download the placeholder.");
    } else {
      setStatus("Review the details, then download your certificate.");
    }
  }

  function renderPreview() {
    var t = currentTemplate();
    dom.downloadBtn.disabled = !state.templateImg;
    dom.shareBtn.disabled = !state.templateImg;
    if (t) {
      dom.previewCaption.textContent =
        t.title + " · " + (studentName() || "Student") + " · " + state.rating + " " + instructorName();
    } else {
      dom.previewCaption.textContent = "Select a certificate to begin";
    }
  }

  /** Shows the caption section only on the review step once a template is
      picked. When the caption hasn't been hand-edited, it's regenerated
      from the current template/names/rating on every render. */
  function renderCaption() {
    var t = currentTemplate();
    if (state.step !== 3 || !t) {
      dom.caption.hidden = true;
      return;
    }
    dom.caption.hidden = false;
    if (!state.captionEdited) {
      state.captionText = buildCaption();
    }
    dom.captionText.textContent = state.captionText;
    if (!captionEditing) {
      dom.captionInput.value = state.captionText;
    }
  }

  function enterCaptionEdit() {
    captionEditing = true;
    dom.captionInput.value = state.captionText;
    dom.captionCard.hidden = true;
    dom.captionInput.hidden = false;
    dom.captionEditActions.hidden = false;
    dom.captionInput.focus();
  }

  function exitCaptionEdit() {
    captionEditing = false;
    dom.captionInput.hidden = true;
    dom.captionEditActions.hidden = true;
    dom.captionCard.hidden = false;
  }

  function handleCaptionDone() {
    state.captionText = dom.captionInput.value;
    state.captionEdited = true;
    dom.captionText.textContent = state.captionText;
    exitCaptionEdit();
  }

  function handleCaptionReset() {
    state.captionEdited = false;
    state.captionText = buildCaption();
    dom.captionText.textContent = state.captionText;
    exitCaptionEdit();
  }

  /** Wraps the site's shared clipboard utility so a load failure of
      shared-utils.js degrades to a direct clipboard call instead of
      throwing. Always targets the small hint span, never the caption
      card itself — the utility swaps the passed element's textContent,
      and swapping the card would wipe the caption text out of the DOM. */
  function copyCaptionToClipboard() {
    var text = state.captionText;
    if (!text) return;

    dom.captionCard.classList.add("is-copied");
    setTimeout(function () {
      dom.captionCard.classList.remove("is-copied");
    }, 1200);

    if (window.SimplyEndorsedUtils && typeof window.SimplyEndorsedUtils.copyTextToClipboard === "function") {
      window.SimplyEndorsedUtils.copyTextToClipboard(text, dom.captionHint, "Copied!");
      return;
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      var priorHint = dom.captionHint.textContent;
      navigator.clipboard.writeText(text).then(function () {
        dom.captionHint.textContent = "Copied!";
        setTimeout(function () {
          dom.captionHint.textContent = priorHint;
        }, 1200);
      });
    }
  }

  function redrawCanvas() {
    /* No template (first load, or after Start over) — wipe the canvas rather
       than leaving the previous student's certificate and photo on screen. */
    if (!state.templateImg) {
      dom.canvas.getContext("2d").clearRect(0, 0, dom.canvas.width, dom.canvas.height);
      return;
    }
    if (!state.fontsReady) return;
    drawCertificate(dom.canvas, state.templateImg, {
      studentName: studentName(),
      instructorName: instructorName(),
      rating: state.rating,
      photo: state.photo,
      crop: state.crop,
    });
  }

  function render() {
    renderPanels();
    renderStepper();
    renderNavRow();
    renderStatus();
    syncTemplateSelection();
    syncRatingButtons();
    renderPhotoStep();
    if (state.step === 3) renderSummary();
    renderPreview();
    renderCaption();
    redrawCanvas();
  }

  /* ------------------------------------------------------------------ */
  /* Step navigation                                                      */
  /* ------------------------------------------------------------------ */

  function goToStep(i) {
    state.step = Math.max(0, Math.min(3, i));
    render();
  }

  function resetAll() {
    state.step = 0;
    state.templateId = null;
    state.studentFirst = "";
    state.studentLast = "";
    state.instructorFirst = "";
    state.instructorLast = "";
    state.rating = "CFI";
    state.photo = null;
    state.crop = null;
    state.templateImg = null;
    state.captionEdited = false;
    state.captionText = "";

    dom.studentFirst.value = "";
    dom.studentLast.value = "";
    dom.instructorFirst.value = "";
    dom.instructorLast.value = "";

    if (lastDownloadUrl) {
      URL.revokeObjectURL(lastDownloadUrl);
      lastDownloadUrl = null;
    }
    dom.saveImgWrap.hidden = true;
    dom.saveImg.removeAttribute("src");

    exitCaptionEdit();
    dom.caption.hidden = true;

    dismissPasteHint();
    dom.pasteCatcher.innerHTML = "";

    render();
  }

  /* ------------------------------------------------------------------ */
  /* Download / share                                                    */
  /* ------------------------------------------------------------------ */

  function buildFileName() {
    var t = currentTemplate();
    var base = t ? t.title.replace(/[^a-z0-9]+/gi, "") : "Certificate";
    return base + "_" + state.studentFirst.trim() + "_" + state.studentLast.trim() + ".jpg";
  }

  function exportBlob() {
    return new Promise(function (resolve) {
      dom.canvas.toBlob(
        function (blob) {
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    });
  }

  function canShareFiles() {
    if (typeof navigator === "undefined" || !("canShare" in navigator)) return false;
    try {
      return navigator.canShare({ files: [new File([""], "x.jpg", { type: "image/jpeg" })] });
    } catch (err) {
      return false;
    }
  }

  function handleDownload() {
    if (!state.templateImg) return;
    exportBlob().then(function (blob) {
      if (!blob) {
        setStatus("Could not generate the image — please try again.");
        return;
      }
      if (lastDownloadUrl) URL.revokeObjectURL(lastDownloadUrl);
      lastDownloadUrl = URL.createObjectURL(blob);
      var filename = buildFileName();

      var a = document.createElement("a");
      a.href = lastDownloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      dom.saveImg.src = lastDownloadUrl;
      dom.saveImg.alt = "Your finished certificate — press and hold to save";
      dom.saveImgWrap.hidden = false;

      setStatus('Downloaded "' + filename + '". If the download did not start, press and hold the image below to save it.');
    });
  }

  function handleShare() {
    if (!state.templateImg) return;
    exportBlob().then(function (blob) {
      if (!blob) return;
      var filename = buildFileName();
      var file = new File([blob], filename, { type: "image/jpeg" });
      navigator.share({ files: [file], title: "Certificate" }).catch(function () {
        /* user cancelled — no-op */
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Photo cropper — ported from src/components/PhotoCropper.tsx         */
  /* ------------------------------------------------------------------ */

  var Cropper = (function () {
    var image = null;
    var crop = null;
    var uiScale = 1;
    var boxPx = 320;
    var onConfirmCb = null;
    var onCancelCb = null;

    var pointers = new Map();
    var pinch = null;
    var drag = null;

    function measure() {
      var vw = Math.min(window.innerWidth * 0.9, 520);
      var vh = window.innerHeight * 0.52;
      boxPx = Math.max(240, Math.min(vw, (vh * 4) / 3));
      uiScale = boxPx / PHOTO_BOX.w;
      dom.cropBox.style.width = boxPx + "px";
      dom.cropBox.style.height = (boxPx * 3) / 4 + "px";
    }

    function updateVisual() {
      if (!image) return;
      dom.cropImg.style.width = image.naturalWidth * crop.scale * uiScale + "px";
      dom.cropImg.style.height = image.naturalHeight * crop.scale * uiScale + "px";
      dom.cropImg.style.transform = "translate(" + crop.x * uiScale + "px, " + crop.y * uiScale + "px)";
    }

    function updateSlider() {
      var min = minScaleFor(image);
      var max = min * 6;
      var pct = max > min ? ((crop.scale - min) / (max - min)) * 1000 : 0;
      dom.zoomSlider.value = String(Math.round(pct));
    }

    function toBoxCoords(clientX, clientY) {
      var rect = dom.cropBox.getBoundingClientRect();
      return { x: (clientX - rect.left) / uiScale, y: (clientY - rect.top) / uiScale };
    }

    function zoomAt(pointBox, factor) {
      var oldScale = crop.scale;
      var scale = oldScale * factor;
      var next = {
        scale: scale,
        x: pointBox.x - ((pointBox.x - crop.x) * scale) / oldScale,
        y: pointBox.y - ((pointBox.y - crop.y) * scale) / oldScale,
      };
      crop = clampCrop(next, image);
      updateVisual();
      updateSlider();
    }

    function center() {
      return { x: PHOTO_BOX.w / 2, y: PHOTO_BOX.h / 2 };
    }

    function onPointerDown(e) {
      dom.cropBox.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        var vals = Array.from(pointers.values());
        var a = vals[0], b = vals[1];
        var mid = toBoxCoords((a.x + b.x) / 2, (a.y + b.y) / 2);
        pinch = {
          startDist: Math.hypot(a.x - b.x, a.y - b.y),
          startMidBox: mid,
          startCrop: { scale: crop.scale, x: crop.x, y: crop.y },
        };
        drag = null;
      } else {
        drag = { lastX: e.clientX, lastY: e.clientY };
      }
    }

    function onPointerMove(e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2 && pinch) {
        var vals = Array.from(pointers.values());
        var a = vals[0], b = vals[1];
        var dist = Math.hypot(a.x - b.x, a.y - b.y);
        var mid = toBoxCoords((a.x + b.x) / 2, (a.y + b.y) / 2);
        var k = dist / pinch.startDist;
        var s0 = pinch.startCrop;
        var scale = s0.scale * k;
        var next = {
          scale: scale,
          x: mid.x - ((pinch.startMidBox.x - s0.x) * scale) / s0.scale,
          y: mid.y - ((pinch.startMidBox.y - s0.y) * scale) / s0.scale,
        };
        crop = clampCrop(next, image);
        updateVisual();
        updateSlider();
      } else if (drag) {
        var dx = (e.clientX - drag.lastX) / uiScale;
        var dy = (e.clientY - drag.lastY) / uiScale;
        drag = { lastX: e.clientX, lastY: e.clientY };
        crop = clampCrop({ scale: crop.scale, x: crop.x + dx, y: crop.y + dy }, image);
        updateVisual();
      }
    }

    function onPointerUp(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 1) {
        var vals = Array.from(pointers.values());
        drag = { lastX: vals[0].x, lastY: vals[0].y };
      } else {
        drag = null;
      }
    }

    function onWheel(e) {
      e.preventDefault();
      var point = toBoxCoords(e.clientX, e.clientY);
      zoomAt(point, Math.exp(-e.deltaY * 0.0016));
    }

    function onResize() {
      if (dom.cropper.classList.contains("is-open")) {
        measure();
        updateVisual();
      }
    }

    function open(img, initial, onConfirm, onCancel) {
      image = img;
      crop = initial ? clampCrop(initial, img) : initialCrop(img);
      onConfirmCb = onConfirm;
      onCancelCb = onCancel;
      dom.cropImg.src = img.src;
      measure();
      updateVisual();
      updateSlider();
      dom.cropper.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      dom.cropper.classList.remove("is-open");
      document.body.style.overflow = "";
      image = null;
      crop = null;
      pointers.clear();
      pinch = null;
      drag = null;
    }

    function confirm() {
      if (!image || !crop) return;
      var finalCrop = clampCrop(crop, image);
      var img = image;
      var cb = onConfirmCb;
      close();
      if (cb) cb(img, finalCrop);
    }

    function cancel() {
      var cb = onCancelCb;
      close();
      if (cb) cb();
    }

    function init() {
      dom.cropBox.addEventListener("pointerdown", onPointerDown);
      dom.cropBox.addEventListener("pointermove", onPointerMove);
      dom.cropBox.addEventListener("pointerup", onPointerUp);
      dom.cropBox.addEventListener("pointercancel", onPointerUp);
      dom.cropBox.addEventListener("wheel", onWheel, { passive: false });

      dom.zoomOutBtn.addEventListener("click", function () { zoomAt(center(), 1 / 1.15); });
      dom.zoomInBtn.addEventListener("click", function () { zoomAt(center(), 1.15); });
      dom.resetCropBtn.addEventListener("click", function () {
        crop = initialCrop(image);
        updateVisual();
        updateSlider();
      });
      dom.zoomSlider.addEventListener("input", function () {
        var min = minScaleFor(image);
        var max = min * 6;
        var target = min + (Number(dom.zoomSlider.value) / 1000) * (max - min);
        zoomAt(center(), target / crop.scale);
      });

      dom.cropConfirmBtn.addEventListener("click", confirm);
      dom.cropCancelBtn.addEventListener("click", cancel);
      dom.cropCancelX.addEventListener("click", cancel);

      window.addEventListener("resize", onResize);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && dom.cropper.classList.contains("is-open")) cancel();
      });
    }

    return { init: init, open: open };
  })();

  /* ------------------------------------------------------------------ */
  /* Photo input — shared entry point for file picker, paste, and drop   */
  /* ------------------------------------------------------------------ */

  /** Every path that can produce a candidate photo file funnels through
      here: the <input type=file> change handler, the clipboard-read
      paste button, the document-level Cmd/Ctrl+V listener, and drag&drop. */
  function handlePhotoFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      setStatus("That doesn't look like an image — please choose a photo file.");
      return;
    }
    setStatus("Preparing photo…");
    normalizePhoto(file)
      .then(function (img) {
        Cropper.open(img, null, function (confirmedImg, crop) {
          state.photo = confirmedImg;
          state.crop = crop;
          render();
        }, function () {
          render();
        });
      })
      .catch(function () {
        setStatus("Could not load that photo — please try a different file.");
      });
  }

  function extFromType(type) {
    if (type === "image/png") return "png";
    if (type === "image/jpeg" || type === "image/jpg") return "jpg";
    if (type === "image/gif") return "gif";
    if (type === "image/webp") return "webp";
    return "png";
  }

  var pasteHintTimer = null;

  function dismissPasteHint() {
    dom.pasteHint.hidden = true;
    if (pasteHintTimer) {
      clearTimeout(pasteHintTimer);
      pasteHintTimer = null;
    }
  }

  function promptManualPaste() {
    if (pasteHintTimer) clearTimeout(pasteHintTimer);
    dom.pasteHint.textContent = "Press ⌘V to paste — on a phone, long-press here and choose Paste.";
    dom.pasteHint.hidden = false;
    dom.pasteCatcher.focus();
    pasteHintTimer = setTimeout(dismissPasteHint, 15000);
  }

  /* Clears the paste-capture element on the next tick — the browser's
     default paste action inserts content into whatever is focused *after*
     event handlers finish running, so clearing synchronously would race it. */
  function clearPasteCatcher() {
    setTimeout(function () {
      dom.pasteCatcher.innerHTML = "";
    }, 0);
  }

  /** navigator.clipboard.read() must be called synchronously inside the
      click handler — wrapping it in a timeout or another promise first
      breaks the user-gesture requirement Safari/iOS enforce, and losing
      that is what stops iOS's native Paste confirmation from appearing. */
  function handlePasteClick() {
    if (!navigator.clipboard || typeof navigator.clipboard.read !== "function") {
      promptManualPaste();
      return;
    }
    navigator.clipboard
      .read()
      .then(function (items) {
        for (var i = 0; i < items.length; i++) {
          var types = items[i].types;
          for (var j = 0; j < types.length; j++) {
            if (/^image\//.test(types[j])) {
              var item = items[i];
              var type = types[j];
              item
                .getType(type)
                .then(function (blob) {
                  handlePhotoFile(new File([blob], "pasted-photo." + extFromType(type), { type: type }));
                })
                .catch(function () {
                  setStatus("Could not read that image from your clipboard — try copying it again.");
                });
              return;
            }
          }
        }
        setStatus("No image on your clipboard — copy an image first, then tap Paste.");
      })
      .catch(function () {
        promptManualPaste();
      });
  }

  function findImageFileInClipboardData(clipboardData) {
    var i;
    if (clipboardData.items) {
      for (i = 0; i < clipboardData.items.length; i++) {
        var item = clipboardData.items[i];
        if (item.kind === "file" && /^image\//.test(item.type)) {
          return item.getAsFile();
        }
      }
    }
    if (clipboardData.files) {
      for (i = 0; i < clipboardData.files.length; i++) {
        if (/^image\//.test(clipboardData.files[i].type)) {
          return clipboardData.files[i];
        }
      }
    }
    return null;
  }

  /** Document-level Cmd/Ctrl+V — needs no permission prompt and works on
      every browser. Only intercepts the event when an image is actually
      found, so pasting text into the name fields keeps working normally. */
  function handleDocumentPaste(e) {
    if (dom.cropper.classList.contains("is-open")) return;
    var clipboardData = e.clipboardData;
    if (!clipboardData) return;

    var file = findImageFileInClipboardData(clipboardData);
    clearPasteCatcher();
    if (!file) return;

    e.preventDefault();
    dismissPasteHint();
    if (state.step !== 2) goToStep(2);
    handlePhotoFile(file);
  }

  function wirePhotoDropZone() {
    dom.photoEmpty.addEventListener("dragover", function (e) {
      e.preventDefault();
      dom.photoEmpty.classList.add("is-dragging");
    });
    dom.photoEmpty.addEventListener("dragleave", function () {
      dom.photoEmpty.classList.remove("is-dragging");
    });
    dom.photoEmpty.addEventListener("dragend", function () {
      dom.photoEmpty.classList.remove("is-dragging");
    });
    dom.photoEmpty.addEventListener("drop", function (e) {
      e.preventDefault();
      dom.photoEmpty.classList.remove("is-dragging");
      var files = e.dataTransfer && e.dataTransfer.files;
      var file = null;
      if (files) {
        for (var i = 0; i < files.length; i++) {
          if (/^image\//.test(files[i].type)) {
            file = files[i];
            break;
          }
        }
      }
      handlePhotoFile(file);
    });

    // Guard the rest of the document so a miss doesn't navigate away.
    document.addEventListener("dragover", function (e) { e.preventDefault(); });
    document.addEventListener("drop", function (e) { e.preventDefault(); });
  }

  /* ------------------------------------------------------------------ */
  /* URL prefill                                                          */
  /* ------------------------------------------------------------------ */

  function splitFullName(full) {
    var trimmed = (full || "").trim().replace(/\s+/g, " ");
    if (!trimmed) return { first: "", last: "" };
    var idx = trimmed.indexOf(" ");
    if (idx === -1) return { first: trimmed, last: "" };
    return { first: trimmed.slice(0, idx), last: trimmed.slice(idx + 1) };
  }

  function findTemplateByParam(raw) {
    if (!raw) return null;
    var normalized = raw.trim().toLowerCase().replace(/[_\s]+/g, "-");
    for (var i = 0; i < CERT_TEMPLATES.length; i++) {
      if (CERT_TEMPLATES[i].id === normalized) return CERT_TEMPLATES[i];
    }
    return null;
  }

  function applyPrefill() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (err) {
      return;
    }

    var get = function (name) {
      var v = params.get(name);
      return v == null ? "" : v.trim();
    };

    var matchedTemplate = findTemplateByParam(get("type"));
    var sf = get("sf"), sl = get("sl"), iff = get("if"), il = get("il");
    var studentParam = get("student");
    var instructorParam = get("instructor");
    var ratingParam = get("rating").toUpperCase();

    if (sf || sl) {
      state.studentFirst = sf;
      state.studentLast = sl;
    } else if (studentParam) {
      var sParts = splitFullName(studentParam);
      state.studentFirst = sParts.first;
      state.studentLast = sParts.last;
    }

    if (iff || il) {
      state.instructorFirst = iff;
      state.instructorLast = il;
    } else if (instructorParam) {
      var iParts = splitFullName(instructorParam);
      state.instructorFirst = iParts.first;
      state.instructorLast = iParts.last;
    }

    if (matchedTemplate) selectTemplate(matchedTemplate);
    if (RATINGS.indexOf(ratingParam) !== -1) state.rating = ratingParam;

    if (matchedTemplate && namesValid()) {
      state.step = 2;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                               */
  /* ------------------------------------------------------------------ */

  function wireEvents() {
    dom.backBtn.addEventListener("click", function () { goToStep(state.step - 1); });
    dom.nextBtn.addEventListener("click", function () {
      if (state.step === 0) {
        if (!state.templateId) return;
        goToStep(1);
      } else if (state.step === 1) {
        if (!namesValid()) return;
        goToStep(2);
      } else if (state.step === 2) {
        goToStep(3);
      }
    });

    dom.stepperItems.forEach(function (li) {
      var btn = li.querySelector(".cg-step-btn");
      btn.addEventListener("click", function () {
        var i = Number(li.dataset.stepIndex);
        if (i < state.step) goToStep(i);
      });
    });

    [dom.studentFirst, dom.studentLast, dom.instructorFirst, dom.instructorLast].forEach(function (input) {
      input.addEventListener("input", function () {
        state.studentFirst = dom.studentFirst.value;
        state.studentLast = dom.studentLast.value;
        state.instructorFirst = dom.instructorFirst.value;
        state.instructorLast = dom.instructorLast.value;
        state.captionEdited = false;
        render();
      });
    });

    dom.ratingButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.rating = btn.dataset.rating;
        state.captionEdited = false;
        render();
      });
    });

    dom.uploadBtn.addEventListener("click", function () { dom.fileInput.click(); });
    dom.replacePhotoBtn.addEventListener("click", function () { dom.fileInput.click(); });
    dom.adjustCropBtn.addEventListener("click", function () {
      if (!state.photo) return;
      Cropper.open(state.photo, state.crop, function (img, crop) {
        state.photo = img;
        state.crop = crop;
        render();
      }, function () {});
    });

    dom.fileInput.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      e.target.value = "";
      handlePhotoFile(file);
    });

    dom.pasteBtn.addEventListener("click", handlePasteClick);
    dom.pasteReplaceBtn.addEventListener("click", handlePasteClick);
    document.addEventListener("paste", handleDocumentPaste);
    dom.pasteCatcher.addEventListener("blur", dismissPasteHint);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !dom.pasteHint.hidden) dismissPasteHint();
    });
    wirePhotoDropZone();

    dom.startOverBtn.addEventListener("click", resetAll);

    dom.captionCard.addEventListener("click", copyCaptionToClipboard);
    dom.captionEditBtn.addEventListener("click", enterCaptionEdit);
    dom.captionResetBtn.addEventListener("click", handleCaptionReset);
    dom.captionDoneBtn.addEventListener("click", handleCaptionDone);

    dom.downloadBtn.addEventListener("click", handleDownload);
    if (canShareFiles()) {
      dom.shareBtn.hidden = false;
      dom.shareBtn.addEventListener("click", handleShare);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  function init() {
    cacheDom();
    renderTemplateGrid();
    Cropper.init();
    wireEvents();

    applyPrefill();

    dom.studentFirst.value = state.studentFirst;
    dom.studentLast.value = state.studentLast;
    dom.instructorFirst.value = state.instructorFirst;
    dom.instructorLast.value = state.instructorLast;

    render();

    // Preload the certificate font at the exact weights/sizes used on the
    // canvas so the first render is never drawn in a fallback face.
    Promise.all([
      // One per size/weight the compositor actually draws with — the shrink
      // loop measures text, so a fallback face here would mis-size the name.
      document.fonts.load("600 148px Oswald"),
      document.fonts.load("500 76px Oswald"),
      document.fonts.load("500 72px Oswald"),
      document.fonts.ready,
    ])
      .then(function () {
        state.fontsReady = true;
        redrawCanvas();
      })
      .catch(function () {
        state.fontsReady = true;
        redrawCanvas();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
