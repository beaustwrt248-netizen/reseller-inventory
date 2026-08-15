/* Beau's Reseller Hub — OTA updater v9.3.1 */
(function(){
  'use strict';
  const KEY='beauGameInventoryWebVersion';
  const CURRENT='9.3.1';
  const UPDATE_URL='./update.json';
  const OTA_URL='./ota.html';
  const SCANNER_FIX_URL='./scanner-fix.js';
  const CAMERA_FIX_URL='./scanner-runtime-fix.js';
  const COMPAT_URL='./app-compat.js';
  const CLOUD_LIBRARY_URL='./cloud-library.js';
  function compare(a,b){const aa=String(a||'0').replace(/^v/i,'').split('.').map(Number),bb=String(b||'0').replace(/^v/i,'').split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){const x=aa[i]||0,y=bb[i]||0;if(x!==y)return x-y}return 0}
  function loadScript(url,attr){const old=document.querySelector('script['+attr+']');if(old)old.remove();const s=document.createElement('script');s.src=url+'?v='+Date.now();s.async=false;s.setAttribute(attr,'1');document.head.appendChild(s)}
  function loadScannerFix(){loadScript(SCANNER_FIX_URL,'data-scanner-fix')}
  function loadCameraFix(){loadScript(CAMERA_FIX_URL,'data-camera-fix')}
  function loadCompat(){loadScript(COMPAT_URL,'data-app-compat')}
  function loadCloudLibrary(){loadScript(CLOUD_LIBRARY_URL,'data-cloud-library')}
  async function clearOldCaches(){try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}if('caches'in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(_){} }
  async function check(){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:controller.signal});if(!r.ok)throw Error('Update information unavailable');const d=await r.json(),latest=String(d.version||CURRENT);return{current:CURRENT,latest,webVersion:String(d.webVersion||latest),available:compare(latest,CURRENT)>0,notes:d.message||'',url:d.url||OTA_URL}}finally{clearTimeout(timer)}}
  async function reloadLatest(){await clearOldCaches();const u=new URL(OTA_URL,location.href);u.searchParams.set('v',Date.now());u.hash=location.hash||'#dashboard';window.location.replace(u.toString())}
  async function checkAndUpdate(options={}){try{const result=await check();if(result.available){const ok=options.silent?true:confirm('A new version of Beau\'s Reseller Hub is available.\n\nVersion '+result.latest+'\n'+(result.notes||'')+'\n\nUpdate now?');if(ok)await reloadLatest()}else if(!options.silent)alert('You are up to date (v'+CURRENT+').');return result}catch(e){if(!options.silent)alert(e.name==='AbortError'?'Update check timed out. You can keep using the current app.':'Could not check for updates right now.');return{current:CURRENT,latest:CURRENT,available:false,error:e.message}}}
  window.BeauUpdate={version:CURRENT,check,reloadLatest,checkAndUpdate};try{localStorage.setItem(KEY,CURRENT)}catch(_){}
  document.addEventListener('DOMContentLoaded',()=>{loadScannerFix();loadCameraFix();loadCompat();loadCloudLibrary();setTimeout(()=>checkAndUpdate({silent:true}),1200)});
})();
