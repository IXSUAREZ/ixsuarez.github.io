(function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, delay) {
    let timeoutId = null;
    return function debounced() {
      const args = arguments;
      clearTimeout(timeoutId);
      timeoutId = root.setTimeout(() => fn.apply(null, args), delay);
    };
  }

  function copyTextToClipboard(text, button, successLabel) {
    if (!text || !button) {
      return;
    }

    const prior = button.textContent;
    const showCopied = () => {
      button.textContent = successLabel || "Copied";
      button.setAttribute("aria-live", "polite");
      root.setTimeout(() => {
        button.textContent = prior;
      }, 1200);
    };

    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showCopied();
      } catch (error) {
        // Fallback selection still leaves the text available if execCommand is blocked.
      }
      document.body.removeChild(textarea);
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  }

  function loadStoredJson(key) {
    try {
      const value = root.localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function saveStoredJson(key, value) {
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage write failures so the app still works in private mode.
    }
  }

  function clearStoredValue(key) {
    try {
      root.localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage failures so the app still works in private mode.
    }
  }

  function getStickyScrollOffset() {
    const topbar = document.querySelector(".topbar-sticky");
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    return Math.ceil(topbarHeight + 20);
  }

  function scrollToTarget(target) {
    if (!target) {
      return;
    }

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + root.scrollY - getStickyScrollOffset(),
    );
    root.scrollTo({ top, behavior: "smooth" });
  }

  function queueScrollToTarget(target) {
    if (!target) {
      return;
    }

    const raf = typeof root.requestAnimationFrame === "function"
      ? root.requestAnimationFrame.bind(root)
      : (fn) => setTimeout(fn, 0);

    raf(() => {
      raf(() => {
        scrollToTarget(target);
      });
    });
  }

  root.SimplyEndorsedUtils = {
    escapeHtml,
    debounce,
    copyTextToClipboard,
    loadStoredJson,
    saveStoredJson,
    clearStoredValue,
    getStickyScrollOffset,
    scrollToTarget,
    queueScrollToTarget,
  };
})(window);
