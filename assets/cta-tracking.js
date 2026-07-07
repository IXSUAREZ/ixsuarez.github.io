(function () {
  function textFor(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  window.trackCtaClick = function (ctaId, element) {
    if (!ctaId) return;

    var props = {
      cta_id: ctaId,
      cta_text: element ? textFor(element) : "",
      cta_href: element ? element.getAttribute("href") || "" : "",
      page_path: window.location.pathname
    };

    if (typeof window.plausible === "function") {
      window.plausible("cta_click", { props: props });
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", "cta_click", {
        event_category: "CTA",
        event_label: ctaId,
        cta_text: props.cta_text,
        cta_href: props.cta_href,
        page_path: props.page_path
      });
    }
  };

  document.addEventListener("click", function (event) {
    var element = event.target.closest("[data-cta-id]");
    if (!element) return;
    window.trackCtaClick(element.getAttribute("data-cta-id"), element);
  }, { capture: true });

  // Dynamically inject category classes to cards and body
  function getCategoryClass(text) {
    if (!text) return "";
    text = text.toLowerCase().trim();
    if (text.indexOf("private pilot") !== -1) return "cat-private-pilot";
    if (text.indexOf("instrument rating") !== -1 || text.indexOf("ifr procedures") !== -1 || text.indexOf("ifr") !== -1) return "cat-instrument-rating";
    if (text.indexOf("commercial pilot") !== -1) return "cat-commercial-pilot";
    if (text.indexOf("cfi") !== -1 || text.indexOf("instructor") !== -1) return "cat-cfi";
    if (text.indexOf("getting started") !== -1) return "cat-student-pilot";
    if (text.indexOf("cost") !== -1 || text.indexOf("price") !== -1 || text.indexOf("budget") !== -1) return "cat-student-pilot";
    if (text.indexOf("written") !== -1 || text.indexOf("knowledge") !== -1 || text.indexOf("ground school") !== -1) return "cat-written-prep";
    if (text.indexOf("checkride") !== -1 || text.indexOf("practical") !== -1 || text.indexOf("oral") !== -1 || text.indexOf("retest") !== -1) return "cat-written-prep";
    if (text.indexOf("medical") !== -1 || text.indexOf("certificate") !== -1) return "cat-student-pilot";
    if (text.indexOf("weather") !== -1) return "cat-weather";
    if (text.indexOf("airspace") !== -1 || text.indexOf("atc") !== -1 || text.indexOf("radio") !== -1 || text.indexOf("airport") !== -1) return "cat-airspace";
    if (text.indexOf("landing") !== -1 || text.indexOf("takeoff") !== -1) return "cat-landings";
    if (text.indexOf("aircraft") !== -1 || text.indexOf("airplane") !== -1) return "cat-student-pilot";
    if (text.indexOf("multi-engine") !== -1 || text.indexOf("multi engine") !== -1) return "cat-multi-engine";
    return "";
  }

  function getCategoryFromHref(href) {
    if (!href) return "";
    href = href.toLowerCase();
    if (href.indexOf("/private-pilot/") !== -1) return "cat-private-pilot";
    if (href.indexOf("/flight-training-louisville-ky/") !== -1) return "cat-private-pilot";
    if (href.indexOf("/private-pilot-ground-school/") !== -1) return "cat-written-prep";
    if (href.indexOf("/ground-school-louisville-ky/") !== -1) return "cat-written-prep";
    if (href.indexOf("/faa-written-test-prep/") !== -1) return "cat-written-prep";
    if (href.indexOf("/checkride-oral-prep/") !== -1) return "cat-written-prep";
    if (href.indexOf("/bowman-field-klou/") !== -1) return "cat-airspace";
    if (href.indexOf("/remote-ground-instruction/") !== -1) return "cat-written-prep";
    if (href.indexOf("/instrument-rating/") !== -1 || href.indexOf("/ifr-procedures/") !== -1) return "cat-instrument-rating";
    if (href.indexOf("/commercial-pilot/") !== -1) return "cat-commercial-pilot";
    if (href.indexOf("/cfi/") !== -1 || href.indexOf("/pilot-careers/") !== -1) return "cat-cfi";
    if (href.indexOf("/flight-training-costs/") !== -1) return "cat-student-pilot";
    if (href.indexOf("/faa-written-test/") !== -1 || href.indexOf("/ground-school/") !== -1 || href.indexOf("/checkride-prep/") !== -1) return "cat-written-prep";
    if (href.indexOf("/pilot-medicals/") !== -1) return "cat-student-pilot";
    if (href.indexOf("/weather-for-student-pilots/") !== -1 || href.indexOf("/weather-and-safety/") !== -1) return "cat-weather";
    if (href.indexOf("/airspace-radio-communications/") !== -1 || href.indexOf("/airspace-and-atc/") !== -1) return "cat-airspace";
    if (href.indexOf("/landings-and-takeoffs/") !== -1) return "cat-landings";
    if (href.indexOf("/multi-engine-rating/") !== -1) return "cat-multi-engine";
    return "";
  }

  function enhanceElements() {
    // Process cards
    var cards = document.querySelectorAll(".post-card, .hub-card, .service-mini-card");
    cards.forEach(function (card) {
      var cat = "";
      
      // 1. Try tag/eyebrow/span text
      var tag = card.querySelector(".post-tag, .eyebrow, span");
      if (tag) {
        cat = getCategoryClass(tag.textContent);
      }
      
      // 2. Try header link text or card link
      if (!cat) {
        var link = card.querySelector("h2 a, h3 a, a");
        if (link) {
          cat = getCategoryClass(link.textContent) || getCategoryFromHref(link.getAttribute("href"));
        }
      }
      
      // 3. Try card direct href if card is an <a>
      if (!cat && card.tagName === "A") {
        cat = getCategoryFromHref(card.getAttribute("href"));
      }
      
      if (cat) {
        card.classList.add(cat);
      }
    });

    // Process page body
    var pathCat = getCategoryFromHref(window.location.pathname);
    if (!pathCat) {
      var breadcrumb = document.querySelector(".breadcrumb");
      if (breadcrumb) {
        pathCat = getCategoryFromHref(breadcrumb.innerHTML);
      }
    }
    if (!pathCat) {
      var heroEyebrow = document.querySelector(".page-hero .eyebrow");
      if (heroEyebrow) {
        pathCat = getCategoryClass(heroEyebrow.textContent);
      }
    }
    if (pathCat) {
      document.body.classList.add(pathCat);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceElements);
  } else {
    enhanceElements();
  }
})();
