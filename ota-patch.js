/* Beau's Reseller Hub — OTA compatibility patch. Web OTA only; never pretends to replace the Android APK. */
(function () {
  'use strict';
  const WEB_VERSION = '9.3.3';
  const WEB_REVISION = '2026.08.15.33';
  window.RESELLER_WEB_VERSION = WEB_VERSION;

  function applyVersionLabel() {
    const el = document.getElementById('appVersion');
    if (el) el.textContent = WEB_VERSION;
    document.documentElement.dataset.webVersion = WEB_REVISION;
  }

  function compareVersions(a, b) {
    const x = String(a || '0').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    const y = String(b || '0').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < 3; i++) {
      if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
    }
    return 0;
  }

  window.renderSettings = function () {
    try {
      const inventory = JSON.parse(localStorage.getItem('resellerInventory') || '[]');
      const library = JSON.parse(localStorage.getItem('beauGameLibrary') || '[]');
      const bytes = new Blob([JSON.stringify({ inventory, library })]).size;
      const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      set('adminInv', Array.isArray(inventory) ? inventory.length : 0);
      set('adminLib', Array.isArray(library) ? library.length : 0);
      set('adminSize', (bytes / 1024).toFixed(1) + ' KB');
      set('appVersion', WEB_VERSION);
    } catch (_) {
      applyVersionLabel();
    }
  };

  window.checkUpdate = async function () {
    const box = document.getElementById('updateBox');
    if (!box) return;
    box.innerHTML = 'Checking for updates…';
    try {
      const r = await fetch('./update.json?otaCheck=' + Date.now(), { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      if (!r.ok) throw new Error('manifest unavailable');
      const d = await r.json();
      const available = String(d.webVersion || WEB_VERSION);
      const cmp = compareVersions(available, WEB_VERSION);
      box.innerHTML = '<b>Current web app:</b> ' + WEB_VERSION + '<br><b>Web revision:</b> ' + WEB_REVISION + '<br><span class="muted">' +
        (cmp > 0 ? (d.message || 'A newer web update is available.') :
        cmp === 0 ? 'You are on the latest stable web update.' : 'The update service reported an older web revision, so it has been ignored.') +
        '</span>' +
        (cmp > 0 ? '<div class="toolbar"><button class="btn primary" id="installWebOta">Install latest web update</button></div><div class="muted">This updates the web layer only. It does not replace the Android APK.</div>' :
        '<div class="toolbar"><button class="btn success" disabled>✓ Up to date</button></div>');
      const btn = document.getElementById('installWebOta');
      if (btn) btn.onclick = function () {
        btn.disabled = true;
        btn.textContent = 'Installing…';
        const url = './index.html?ota=' + encodeURIComponent(available) + '&t=' + Date.now() + '#dashboard';
        window.location.replace(url);
      };
    } catch (_) {
      box.textContent = 'Update service unavailable. The app will continue working normally.';
    }
  };

  applyVersionLabel();
  if (window.renderAll) window.renderAll();
})();
