/* ==========================================================================
   SuarezCFI — Mobile conversion bar (home page only)
   Shows the floating .conversion-bar only when the hero CTA block has
   scrolled out of view AND the #contact section is not on screen.
   Pure IntersectionObserver — no scroll listeners. Safe anywhere: if the
   bar markup is absent (every page except home), this does nothing.
   ========================================================================== */
(function () {
  "use strict";

  var bar = document.querySelector(".conversion-bar");
  if (!bar) return;
  if (!("IntersectionObserver" in window)) return; // no IO: bar stays hidden

  var hero = document.querySelector(".hero-ctas");
  var contact = document.getElementById("contact");

  var heroInView = true; // until observed, assume the hero owns the screen
  var contactInView = false;

  function update() {
    bar.classList.toggle("is-visible", !heroInView && !contactInView);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].target === hero) heroInView = entries[i].isIntersecting;
      else if (entries[i].target === contact) contactInView = entries[i].isIntersecting;
    }
    update();
  });

  if (hero) io.observe(hero);
  if (contact) io.observe(contact);
})();
