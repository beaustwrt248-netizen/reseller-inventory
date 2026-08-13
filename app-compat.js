/* Beau's Game Inventory — main app compatibility layer v3.2.0 */
(function(){
'use strict';
const SCANNER='./scanner-v3.html?v=3.2.0';
function goScanner(){window.location.href=SCANNER}
function goScannerWithBarcode(barcode){const u=new URL(SCANNER,location.href);if(barcode)u.searchParams.set('barcode',barcode);window.location.href=u.toString()}
function bind(){
 const start=document.getElementById('startScannerButton');
 const stop=document.getElementById('stopScannerButton');
 const lookup=document.getElementById('lookupButton');
 if(start){start.onclick=e=>{e.preventDefault();goScanner()};start.type='button';start.textContent='📷 Open Scanner'}
 if(stop){stop.onclick=e=>{e.preventDefault();goScanner()};stop.textContent='📷 Scanner'}
 if(lookup){lookup.onclick=e=>{e.preventDefault();goScannerWithBarcode((document.getElementById('barcodeSearch')?.value||'').trim())};lookup.type='button';lookup.textContent='🔎 Find Product & Pricing'}
 document.querySelectorAll('[data-open-scanner]').forEach(b=>b.addEventListener('click',goScanner));
}
window.BeauAppCompat={version:'3.2.0',openScanner:goScanner,lookupBarcode:goScannerWithBarcode};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
