/* ==========================================================================
   hero-plane.js — "the parked trainer": the v12 hero's progressive 3D layer.
   The poster (<img>) is the hero; this module upgrades it to a live model.
   Chain: requestIdleCallback (or first pointer intent) → dynamic import of
   three.js → recolored trainer crossfades in. Fallbacks (reduced-motion,
   no WebGL, save-data, import/load failure, <45fps probe) keep the poster.
   Physics: 1:1 drag yaw/pitch, bank into the drag, critically-damped spring
   settle. No idle spin, no inertia fling. The prop turns only while held —
   engine answers the hand. window.quietSky?.setDragging() ties sound to it.
   ========================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector(".hero-plane");
  if (!stage) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection && navigator.connection.saveData) return;

  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.min.js";
  var armed = false;

  function arm() {
    if (armed) return;
    armed = true;
    Promise.all([import(THREE_URL), import("/assets/plane/trainer-model.js")])
      .then(function (mods) { boot(mods[0], mods[1].buildTrainer); })
      .catch(function () { /* poster stays; nothing breaks */ });
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(arm, { timeout: 2500 });
  } else {
    setTimeout(arm, 1200);
  }
  stage.addEventListener("pointerdown", arm, { once: true });

  function boot(THREE, buildTrainer) {
    try {
      var canvas = document.createElement("canvas");
      canvas.className = "hero-plane-canvas";
      canvas.setAttribute("aria-hidden", "true");
      stage.appendChild(canvas);

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      } catch (err) { canvas.remove(); return; }

      var rect = stage.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(rect.width, rect.height, false);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(30, rect.width / rect.height, 0.1, 100);
      camera.position.set(6.4, 2.6, 8.2);
      camera.lookAt(0, -0.2, 0);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8fb4e8, 1.25));
      var key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(4, 6, 3);
      scene.add(key);
      var fill = new THREE.DirectionalLight(0xcfe4ff, 0.6);
      fill.position.set(-5, 2, -4);
      scene.add(fill);

      /* Rig: rest pose has the nose angled toward the copy (left of stage). */
      var rig = new THREE.Group();
      var REST = { yaw: 2.6, pitch: 0.0, roll: 0.0 };
      rig.rotation.y = REST.yaw;
      var trainer = buildTrainer();
      rig.add(trainer);
      scene.add(rig);
      var prop = trainer.userData.prop;

      /* --- Physics state: current values, targets, spring velocities --- */
      var yaw = REST.yaw, pitch = REST.pitch, roll = 0;
      var yawT = REST.yaw, pitchT = REST.pitch, rollT = 0;
      var yawV = 0, pitchV = 0, rollV = 0;
      var propSpeed = 0;
      var dragging = false, lastX = 0, lastY = 0, dragVX = 0;
      var breathT = -1; /* one entrance breath: nose dips 1deg and returns */

      var K = 110, C = 17; /* ~600ms settle, slightly underdamped */
      function spring(v, vt, vv, dt) {
        var a = -K * (v - vt) - C * vv;
        vv += a * dt;
        v += vv * dt;
        return [v, vv];
      }

      var pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      var bankX = 0; /* desktop pointer bank, lerped */

      stage.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragging = true;
        lastX = e.clientX; lastY = e.clientY; dragVX = 0;
        stage.classList.add("is-held");
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        if (window.quietSky && window.quietSky.setDragging) window.quietSky.setDragging(true);
      });
      stage.addEventListener("pointermove", function (e) {
        if (dragging) {
          var dx = e.clientX - lastX, dy = e.clientY - lastY;
          lastX = e.clientX; lastY = e.clientY;
          dragVX = dragVX * 0.7 + dx * 0.3;
          yawT = clamp(yawT + dx * 0.0052, REST.yaw - 1.05, REST.yaw + 1.05);   /* ±60° */
          pitchT = clamp(pitchT + dy * 0.0028, -0.21, 0.21);                  /* ±12° */
          rollT = clamp(-dragVX * 0.03, -0.17, 0.17);                          /* ≤10° into drag */
        } else if (pointerFine && e.pointerType === "mouse") {
          var r = stage.getBoundingClientRect();
          bankX = ((e.clientX - r.left) / r.width - 0.5) * 2;                  /* -1..1 */
        }
      });
      function release(e) {
        if (!dragging) return;
        dragging = false;
        rollT = 0;
        stage.classList.remove("is-held");
        if (window.quietSky && window.quietSky.setDragging) window.quietSky.setDragging(false);
      }
      stage.addEventListener("pointerup", release);
      stage.addEventListener("pointercancel", release);
      stage.addEventListener("pointerleave", function () { if (!dragging) bankX = 0; });

      function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

      /* --- Frame probe: first 60 frames decide if the canvas survives --- */
      var probeFrames = 0, probeTime = 0, probeDone = false;
      function probe(dt) {
        if (probeDone) return true;
        probeFrames++; probeTime += dt;
        if (probeFrames >= 60) {
          probeDone = true;
          if (probeTime / probeFrames > 1 / 45) { /* slower than 45fps */
            stop();
            stage.removeChild(canvas);
            renderer.dispose();
            return false;
          }
        }
        return true;
      }

      /* --- Loop: rAF only while on-screen and tab visible --- */
      var onScreen = true, rafId = 0, lastT = 0, revealed = false;
      function tick(t) {
        rafId = 0;
        var dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016);
        lastT = t;
        if (!probe(dt)) return;

        /* desktop pointer bank lerps in when not dragging */
        var bankTarget = dragging ? 0 : bankX * 0.07; /* ±4° */
        rollT = dragging ? rollT : bankTarget;

        var s1 = spring(yaw, yawT, yawV, dt); yaw = s1[0]; yawV = s1[1];
        var s2 = spring(pitch, pitchT, pitchV, dt); pitch = s2[0]; pitchV = s2[1];
        var s3 = spring(roll, rollT, rollV, dt); roll = s3[0]; rollV = s3[1];

        /* one entrance breath */
        if (breathT >= 0) {
          breathT += dt;
          if (breathT < 0.35) pitchT = REST.pitch - 0.018;
          else if (breathT < 1.1) pitchT = REST.pitch;
          else breathT = -1;
        }

        rig.rotation.set(pitch, yaw, roll, "YXZ");

        /* prop: turns only while held, spools down after */
        propSpeed += ((dragging ? 14 : 0) - propSpeed) * Math.min(1, dt * (dragging ? 3 : 1.2));
        if (prop && propSpeed > 0.01) prop.rotation.z += propSpeed * dt;

        renderer.render(scene, camera);
        if (running) rafId = requestAnimationFrame(tick);
      }

      var running = false;
      function start() {
        if (running || probeDone && !canvas.isConnected) return;
        running = true;
        if (!revealed) {
          revealed = true;
          stage.classList.add("is-live");
          breathT = 0; /* the one breath */
        }
        lastT = 0;
        rafId = requestAnimationFrame(tick);
      }
      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      }

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          onScreen = entries[0].isIntersecting;
          if (onScreen && document.visibilityState === "visible") start();
          else stop();
        }, { threshold: 0.05 }).observe(stage);
      } else {
        start();
      }
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible" && onScreen) start();
        else stop();
      });

      window.addEventListener("resize", function () {
        var r = stage.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      });
    } catch (err) { /* any failure: the poster remains the hero */ }
  }
})();
