/* Beau's Reseller Hub — OTA compatibility patch 9.3.0 */
(function () {
  'use strict';
  const WEB_VERSION = '9.3.0';
  window.RESELLER_WEB_VERSION = WEB_VERSION;

  function applyVersionLabel() {
    const el = document.getElementById('appVersion');
    if (el) el.textContent = WEB_VERSION;
    document.documentElement.dataset.webVersion = WEB_VERSION;
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
      const r = await fetch('./update.json?ota=' + Date.now(), { cache: 'no-store' });
      const d = await r.json();
      const available = String(d.version || WEB_VERSION);
      const cmp = compareVersions(available, WEB_VERSION);
      box.innerHTML = '<b>Current app:</b> ' + WEB_VERSION + '<br><b>Available:</b> ' + available +
        '<br><span class="muted">' + (cmp > 0 ? (d.message || 'A newer stable release is available.') :
        cmp === 0 ? 'You are on the latest stable web version.' : 'The update service reported an older release, so it has been ignored.') + '</span>' +
        (cmp > 0 ? '<div class="toolbar"><button class="btn primary" onclick="location.href=\'./ota.html?ts=' + Date.now() + '\'">Install latest update</button></div>' :
        '<div class="toolbar"><button class="btn success" disabled>✓ Up to date</button></div>');
    } catch (_) {
      box.textContent = 'Update service unavailable. The app will continue working normally.';
    }
  };

  applyVersionLabel();
  if (window.renderAll) window.renderAll();
})();
