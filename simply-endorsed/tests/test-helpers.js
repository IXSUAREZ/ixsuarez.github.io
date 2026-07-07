const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Initializes JSDOM environment, mocks browser APIs, and loads application scripts.
 * @returns {object} { dom, window, document, getClipboardText, setClipboardText }
 */
function initJSDOM() {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Create JSDOM instance
  const dom = new JSDOM(htmlContent, {
    runScripts: 'outside-only',
    url: 'http://localhost/'
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

  // Helper to load application scripts
  const loadScript = (relativePath) => {
    const scriptPath = path.resolve(__dirname, '..', relativePath);
    const code = fs.readFileSync(scriptPath, 'utf8');
    dom.window.eval(code);
  };

  // Sequence of scripts to load
  const scripts = [
    'js/shared-utils.js',
    'js/cfr-links.js',
    'js/part61-rules-data.js',
    'js/endorsements-data.js',
    'js/training-requirements-data.js',
    'js/part61-calculator-core.js',
    'js/part61-calculator-ui.js'
  ];

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
