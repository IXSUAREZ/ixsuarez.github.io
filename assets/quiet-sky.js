/* ==========================================================================
   quiet-sky.js — "the quiet sky": the v12 sound layer. 0 audio files —
   everything is synthesized in WebAudio at arm-time.
   Model: preference defaults ON (OFF under prefers-reduced-motion), persisted
   in localStorage. Browsers forbid audio before a user gesture, so the
   AudioContext arms on the first pointerdown/keypress anywhere. The STRIP
   toggle mutes/unmutes and persists the choice.
   Bed (hero-gated): wind + a faint distant-plane drone that wanders in and
   out, plus a near-idle layer on the hero. Dragging the plane is the throttle:
   the idle's pitch rises and its filter opens. Committed sounds: detent clunk
   (journey slider), quieter clunk (FAQ), mic-key blip (form send), starter
   spool (first arm). Nothing plays for outbound navigation.
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "quiet-sky";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stored = null;
  try { stored = window.localStorage.getItem(KEY); } catch (e) {}
  var on = stored === null ? !reduced : stored === "on";

  var ctx = null, master = null, bedGain = null;
  var armed = false, spooled = false;
  var idle = null, wind = null, distant = null;
  var heroVisible = false, dragging = false;
  var listeners = [];

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](on); } catch (e) {}
    }
  }

  /* ---------- graph ---------- */

  function noiseBuffer(seconds) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function ensureCtx() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;  /* master ceiling ≈ −16dBFS peaks */
      comp.knee.value = 8;
      comp.ratio.value = 4;
      comp.connect(ctx.destination);

      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(comp);

      bedGain = ctx.createGain();  /* the bed, duckable, hero-gated */
      bedGain.gain.value = 0;
      bedGain.connect(master);

      buildBed();
      return true;
    } catch (e) { ctx = null; return false; }
  }

  function buildBed() {
    /* Wind: looped noise through a bandpass, slow LFO breathing. */
    var windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuffer(3);
    windSrc.loop = true;
    var windBp = ctx.createBiquadFilter();
    windBp.type = "bandpass"; windBp.frequency.value = 420; windBp.Q.value = 0.6;
    var windG = ctx.createGain(); windG.gain.value = 0.028; /* ≈ −31dBFS */
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    var lfoG = ctx.createGain(); lfoG.gain.value = 0.011;
    lfo.connect(lfoG); lfoG.connect(windG.gain);
    windSrc.connect(windBp); windBp.connect(windG); windG.connect(bedGain);
    windSrc.start(); lfo.start();
    wind = { gain: windG };

    /* Distant plane: sawtooth drone through lowpass, wanders in and out. */
    var dOsc = ctx.createOscillator();
    dOsc.type = "sawtooth"; dOsc.frequency.value = 82;
    var dLp = ctx.createBiquadFilter();
    dLp.type = "lowpass"; dLp.frequency.value = 300;
    var dG = ctx.createGain(); dG.gain.value = 0;
    dOsc.connect(dLp); dLp.connect(dG); dG.connect(bedGain);
    dOsc.start();
    distant = { gain: dG, lp: dLp };
    wander();

    /* Near-idle: 90Hz saw with 14Hz prop-pulse AM, hero + drag-throttled. */
    var iOsc = ctx.createOscillator();
    iOsc.type = "sawtooth"; iOsc.frequency.value = 90;
    var iLp = ctx.createBiquadFilter();
    iLp.type = "lowpass"; iLp.frequency.value = 480; iLp.Q.value = 1.1;
    var iG = ctx.createGain(); iG.gain.value = 0;
    var am = ctx.createOscillator(); am.frequency.value = 14;
    var amG = ctx.createGain(); amG.gain.value = 0.009;
    am.connect(amG); amG.connect(iG.gain);
    iOsc.connect(iLp); iLp.connect(iG); iG.connect(bedGain);
    iOsc.start(); am.start();
    idle = { osc: iOsc, lp: iLp, gain: iG };
  }

  /* Distant plane fades in/out over ~20–40s cycles. */
  function wander() {
    if (!ctx) return;
    var t = ctx.currentTime;
    var peak = 0.016 + Math.random() * 0.006; /* ≈ −34dBFS */
    distant.gain.gain.setTargetAtTime(peak, t, 1.6);
    setTimeout(function () {
      if (!ctx) return;
      distant.gain.gain.setTargetAtTime(0.0, ctx.currentTime, 1.8);
      setTimeout(wander, 9000 + Math.random() * 14000);
    }, 7000 + Math.random() * 9000);
  }

  function gateBed() {
    if (!ctx) return;
    var target = heroVisible ? 1 : 0;
    bedGain.gain.setTargetAtTime(target, ctx.currentTime, 0.25); /* ≈600ms fade */
    if (idle) idle.gain.gain.setTargetAtTime(heroVisible ? 0.026 : 0, ctx.currentTime, 0.25);
  }

  /* ---------- one-shots ---------- */

  function duck() {
    if (!ctx) return;
    bedGain.gain.cancelScheduledValues(ctx.currentTime);
    bedGain.gain.setTargetAtTime(0.4, ctx.currentTime, 0.03);
    setTimeout(gateBed, 320);
  }

  function clunk(level, vibe) {
    if (!ctx || !on) return;
    duck();
    var t = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(0.08);
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 1.4;
    var g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 0.08);
    var th = ctx.createOscillator();
    th.frequency.value = 60;
    var tg = ctx.createGain();
    tg.gain.setValueAtTime(level * 0.8, t);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    th.connect(tg); tg.connect(master);
    th.start(t); th.stop(t + 0.06);
    if (vibe && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
  }

  function micKey() {
    if (!ctx || !on) return;
    duck();
    var t = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(0.02);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    src.connect(g); g.connect(master);
    src.start(t);
    [1000, 1400].forEach(function (f, i) {
      var o = ctx.createOscillator();
      o.frequency.value = f;
      var og = ctx.createGain();
      var t0 = t + 0.05 + i * 0.09;
      og.gain.setValueAtTime(0.0, t0);
      og.gain.linearRampToValueAtTime(0.07, t0 + 0.015);
      og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
      o.connect(og); og.connect(master);
      o.start(t0); o.stop(t0 + 0.14);
    });
  }

  function spool() {
    if (!ctx || spooled || !on) return;
    spooled = true;
    var t = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(1.5);
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(180, t);
    bp.frequency.exponentialRampToValueAtTime(2900, t + 1.3);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.5);  /* ≈ −21dBFS peak */
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.45);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 1.5);
  }

  /* ---------- arming (autoplay-honest) ---------- */

  function arm() {
    if (armed) return;
    if (!on) return;
    if (!ensureCtx()) return;
    armed = true;
    if (ctx.state === "suspended") ctx.resume();
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.2);
    gateBed();
    spool();
  }

  window.addEventListener("pointerdown", arm, { once: true });
  window.addEventListener("keydown", arm, { once: true });

  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.visibilityState === "hidden") ctx.suspend();
    else if (armed && on) ctx.resume();
  });

  if ("IntersectionObserver" in window) {
    var hero = document.querySelector(".premium-hero");
    if (hero) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (ctx) gateBed();
      }, { threshold: 0.2 }).observe(hero);
    }
  } else {
    heroVisible = true;
  }

  /* ---------- committed sounds wired to page events ---------- */

  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "journey-stage") clunk(0.11, true);
  });
  document.addEventListener("toggle", function (e) {
    if (e.target && e.target.closest && e.target.closest("#faq")) clunk(0.05, false);
  }, true);

  /* Form-send success: the contact form swaps in .cf-success — watch for it. */
  if ("MutationObserver" in window) {
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1 && added[j].classList && added[j].classList.contains("cf-success")) micKey();
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- public API ---------- */

  window.quietSky = {
    toggle: function () {
      on = !on;
      try { window.localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
      if (on) { arm(); } else if (ctx) { master.gain.setTargetAtTime(0, ctx.currentTime, 0.08); }
      emit();
      return on;
    },
    isOn: function () { return on; },
    setDragging: function (b) {
      dragging = !!b;
      if (!ctx || !idle) return;
      idle.osc.frequency.setTargetAtTime(dragging ? 97 : 90, ctx.currentTime, 0.1);
      idle.lp.frequency.setTargetAtTime(dragging ? 700 : 480, ctx.currentTime, 0.1);
    },
    onChange: function (cb) {
      listeners.push(cb);
      try { cb(on); } catch (e) {}
    }
  };
})();
