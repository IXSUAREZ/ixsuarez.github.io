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

  var CERT_TEMPLATES = [
    { id: "first-solo", title: "First Solo", subtitle: "Milestone Flight", image: "templates/first-solo.jpg", defaultRating: "CFI" },
    { id: "private", title: "Private Pilot", subtitle: "Certificate Earned", image: "templates/private.jpg", defaultRating: "CFI" },
    { id: "sport", title: "Sport Pilot", subtitle: "Certificate Earned", image: "templates/sport.jpg", defaultRating: "CFI" },
    { id: "instrument", title: "Instrument", subtitle: "IMC Qualified", image: "templates/instrument.jpg", defaultRating: "CFII" },
    { id: "commercial", title: "Commercial", subtitle: "Pilot Certificate", image: "templates/commercial.jpg", defaultRating: "CFI" },
    { id: "multi-engine", title: "Multi-Engine", subtitle: "Twin Proficiency", image: "templates/multi-engine.jpg", defaultRating: "MEI" },
    { id: "cfi", title: "Instructor — CFI", subtitle: "CFI Rating", image: "templates/cfi.jpg", defaultRating: "CFI" },
    { id: "cfii", title: "Instructor — CFII", subtitle: "CFII Rating", image: "templates/cfii.jpg", defaultRating: "CFII" },
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

    dom.summary = document.getElementById("cgSummary");
    dom.startOverBtn = document.getElementById("cgStartOverBtn");

    dom.canvas = document.getElementById("cgCanvas");
    dom.downloadBtn = document.getElementById("cgDownloadBtn");
    dom.shareBtn = document.getElementById("cgShareBtn");
    dom.previewCaption = document.getElementById("cgPreviewCaption");
    dom.saveImgWrap = document.getElementById("cgSaveImgWrap");
    dom.saveImg = document.getElementById("cgSaveImg");

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
  };

  var templateCache = new Map();
  var lastDownloadUrl = null;

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
  /* Template loading                                                     */
  /* ------------------------------------------------------------------ */

  function selectTemplate(t) {
    state.templateId = t.id;
    state.rating = t.defaultRating;
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
      card.className = "cg-template-card";
      card.dataset.templateId = t.id;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");

      var thumb = el("span", "cg-template-thumb");
      var img = document.createElement("img");
      img.src = t.image;
      img.alt = t.title + " certificate template";
      img.loading = "lazy";
      thumb.appendChild(img);

      var meta = el("span", "cg-template-meta");
      meta.appendChild(el("span", "cg-template-title", t.title));
      meta.appendChild(el("span", "cg-template-subtitle", t.subtitle));

      card.appendChild(thumb);
      card.appendChild(meta);

      card.addEventListener("click", function () {
        selectTemplate(t);
        render();
      });

      dom.templateGrid.appendChild(card);
    });
  }

  function syncTemplateSelection() {
    var cards = dom.templateGrid.querySelectorAll(".cg-template-card");
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

  function redrawCanvas() {
    if (!state.templateImg || !state.fontsReady) return;
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
        render();
      });
    });

    dom.ratingButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.rating = btn.dataset.rating;
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
      if (!file) return;
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
    });

    dom.startOverBtn.addEventListener("click", resetAll);

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
