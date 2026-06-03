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
})();
