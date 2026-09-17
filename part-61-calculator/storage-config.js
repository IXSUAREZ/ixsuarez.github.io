/* Public endpoint only; secrets are held by the Worker. Production API verified before frontend activation. */
window.CertPathConfig = { enabled: true, apiBase: 'https://certpath-api.certpath-api.workers.dev' };
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  window.CertPathConfig = { enabled: true, apiBase: 'http://localhost:8787' };
}
