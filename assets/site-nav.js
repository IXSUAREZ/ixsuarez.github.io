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

    // Compress the pill once the page scrolls past ~40px — an
    // IntersectionObserver sentinel at document y=40, so no scroll listener
    // and no rAF (CSS transitions live in design-system.css; stripped
    // automatically under reduced motion). Without IO the pill simply stays
    // full-size.
    if ("IntersectionObserver" in window) {
      var sentinel = document.createElement("div");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText =
        "position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none;";
      document.body.appendChild(sentinel);
      new IntersectionObserver(function (entries) {
        nav.classList.toggle("nav--compact", !entries[0].isIntersecting);
      }).observe(sentinel);
    }
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
