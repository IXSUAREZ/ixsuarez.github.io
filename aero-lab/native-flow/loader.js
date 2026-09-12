/* This frame runs the original Go/Ebitengine renderer locally through WebAssembly. */
(async () => {
  const parentOrigin = location.origin;
  const report = (type, extra = {}) => parent.postMessage({type, source:'suarez-native-flow', ...extra}, parentOrigin);
  window.addEventListener('error', event => report('suarez-native-flow-error', {error: event.message}));
  window.addEventListener('unhandledrejection', event => report('suarez-native-flow-error', {error:String(event.reason)}));
  try {
    const response = await fetch('./native-flow.wasm');
    if (!response.ok) throw new Error(`Renderer download failed (${response.status})`);
    const bytes = await response.arrayBuffer();
    const go = new Go();
    const {instance} = await WebAssembly.instantiate(bytes, go.importObject);
    document.querySelector('#loading')?.remove();
    await go.run(instance);
  } catch (error) {
    report('suarez-native-flow-error', {error: String(error)});
  }
})();
