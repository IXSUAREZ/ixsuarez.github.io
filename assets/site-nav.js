/* SuarezCFI — canonical site navigation behavior
   Drives the shared .nav-wrap pill on every page:
   mobile sheet toggle, hamburger morph (CSS via aria-expanded),
   Tools dropdown, scroll-lock, Escape/outside-click close. */
(function () {
  "use strict";

  function initNav(nav) {
    if (nav.dataset.navReady === "true") return;
    nav.dataset.navReady = "true";

    var toggle = nav.querySelector(".nav-menu-toggle");
    var links = nav.querySelector(".nav-links");
    var dropdown = nav.querySelector(".nav-dropdown");
    var dropToggle = nav.querySelector(".nav-drop-toggle");
    if (!toggle || !links) return;

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
      var label = toggle.querySelector(".nav-toggle-label");
      if (label) label.textContent = open ? "Close" : "Menu";
      if (!open) setDropdown(false);
    }

    function setDropdown(open) {
      if (!dropdown || !dropToggle) return;
      dropdown.classList.toggle("is-open", open);
      dropToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setMenu(!nav.classList.contains("is-open"));
    });

    if (dropToggle) {
      dropToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        setDropdown(!dropdown.classList.contains("is-open"));
      });
    }

    // Close when a real link is activated
    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    // Escape closes, focus returns to the control
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (dropdown && dropdown.classList.contains("is-open")) {
        setDropdown(false);
        dropToggle.focus();
      } else if (nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Outside click closes
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) setMenu(false);
      else if (dropdown && !dropdown.contains(event.target) && window.innerWidth > 980) {
        setDropdown(false);
      }
    });

    // Leaving the mobile breakpoint resets transient state
    var mq = window.matchMedia("(min-width: 981px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () {
      setMenu(false);
      document.body.classList.remove("nav-open");
    });

    // Compress the pill once the page scrolls past ~40px (CSS transitions
    // live in design-system.css; stripped automatically under reduced motion)
    var compactTicking = false;
    function syncCompact() {
      nav.classList.toggle("nav--compact", window.scrollY > 40);
      compactTicking = false;
    }
    window.addEventListener("scroll", function () {
      if (!compactTicking) {
        compactTicking = true;
        window.requestAnimationFrame(syncCompact);
      }
    }, { passive: true });
    syncCompact();
  }

  function initAll() {
    document.querySelectorAll(".nav").forEach(initNav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
