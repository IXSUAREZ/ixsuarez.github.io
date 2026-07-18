const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Initializes JSDOM environment, mocks browser APIs, and loads application scripts.
 * @param {object} [options]
 * @param {object} [options.domOptions] Additional JSDOM options.
 * @param {string} [options.htmlPath] HTML fixture path relative to this tests directory.
 * @param {boolean} [options.loadFullApp] Load browse app scripts in page order.
 * @returns {object} { dom, window, document, getClipboardText, setClipboardText }
 */
function initJSDOM(options = {}) {
  const { domOptions = {}, htmlPath: htmlPathOption, loadFullApp = false } = options;
  const htmlPath = htmlPathOption
    ? path.resolve(__dirname, htmlPathOption)
    : path.resolve(__dirname, '../../simply-endorsed-cfi/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Create JSDOM instance
  const dom = new JSDOM(htmlContent, {
    runScripts: 'outside-only',
    url: 'http://localhost/',
    pretendToBeVisual: loadFullApp,
    ...domOptions
  });

  const { window } = dom;

  // Mock basic window APIs
  window.scrollTo = (options) => {
    window.scrollX = typeof options === 'object' ? (options.left || 0) : 0;
    window.scrollY = typeof options === 'object' ? (options.top || 0) : 0;
  };
  window.print = () => {
    // Dispatch print events
    const beforeEvent = new window.Event('beforeprint');
    const afterEvent = new window.Event('afterprint');
    window.dispatchEvent(beforeEvent);
    window.dispatchEvent(afterEvent);
  };
  window.alert = () => {};
  window.matchMedia = window.matchMedia || ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    }
  }));
  window.requestAnimationFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(() => callback(Date.now()), 0));
  window.cancelAnimationFrame = window.cancelAnimationFrame || ((id) => window.clearTimeout(id));
  window.CSS = window.CSS || {};
  window.CSS.escape = window.CSS.escape || ((value) => String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&'));

  // Mock Element scrollIntoView
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = () => {};
  }

  // Mock navigator.clipboard
  let clipboardText = '';
  if (!window.navigator.clipboard) {
    window.navigator.clipboard = {};
  }
  window.navigator.clipboard.writeText = async (text) => {
    clipboardText = text;
    return Promise.resolve();
  };
  window.navigator.clipboard.readText = async () => {
    return Promise.resolve(clipboardText);
  };
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      register: () => Promise.resolve()
    }
  });

  // Helper to load application scripts
  const loadScript = (relativePath) => {
    const scriptPath = path.resolve(__dirname, '..', relativePath);
    const code = fs.readFileSync(scriptPath, 'utf8');
    dom.window.eval(code);
  };

  // Sequence of scripts to load
  const scripts = loadFullApp
    ? [
        'js/shared-utils.js',
        'js/cfr-links.js',
        'js/endorsements-data.js',
        'js/browse-structure.js',
        'js/guidance-content.js',
        'js/training-requirements-data.js',
        'js/privileges-limitations-data.js',
        'js/part61-rules-data.js',
        'js/part61-calculator-core.js',
        'js/part61-scenario-generator.js',
        'js/part61-calculator-ui.js',
        'js/app.js'
      ]
    : [
        'js/shared-utils.js',
        'js/cfr-links.js',
        'js/part61-rules-data.js',
        'js/endorsements-data.js',
        'js/training-requirements-data.js',
        'js/privileges-limitations-data.js',
        'js/part61-calculator-core.js',
        'js/part61-scenario-generator.js',
        'js/part61-calculator-ui.js'
      ];

  if (loadFullApp) {
    Object.defineProperty(window.document, 'readyState', {
      configurable: true,
      value: 'complete'
    });
  }

  for (const script of scripts) {
    loadScript(script);
  }

  return {
    dom,
    window,
    document: window.document,
    getClipboardText: () => clipboardText,
    setClipboardText: (t) => { clipboardText = t; }
  };
}

module.exports = {
  initJSDOM
};
