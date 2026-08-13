/* Beau's Game Inventory — OTA updater v3.2.0 */
(function(){
  const KEY='beauGameInventoryBuild';
  const CURRENT='3.2.0';
  const UPDATE_URL='./update.json';
  const OTA_URL='./ota.html';
  const SCANNER_FIX_URL='./scanner-fix.js';
  const CAMERA_FIX_URL='./scanner-runtime-fix.js';
  const COMPAT_URL='./app-compat.js';
  function compare(a,b){const aa=String(a).replace(/^v/,'').split('.').map(Number),bb=String(b).replace(/^v/,'').split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){const x=aa[i]||0,y=bb[i]||0;if(x!==y)return x-y}return 0}
  function loadScript(url,attr){const old=document.querySelector('script['+attr+']');if(old)old.remove();const s=document.createElement('script');s.src=url+'?v='+Date.now();s.async=false;s.setAttribute(attr,'1');document.head.appendChild(s)}
  function loadScannerFix(){loadScript(SCANNER_FIX_URL,'data-scanner-fix')}
  function loadCameraFix(){loadScript(CAMERA_FIX_URL,'data-camera-fix')}
  function loadCompat(){loadScript(COMPAT_URL,'data-app-compat')}
  async function check(){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:controller.signal});if(!r.ok)throw Error('Update information unavailable');const d=await r.json(),latest=String(d.version||CURRENT);return{current:CURRENT,latest,webVersion:String(d.webVersion||latest),available:compare(latest,CURRENT)>0,notes:d.message||'',url:d.url||OTA_URL}}finally{clearTimeout(timer)}}
  function reloadLatest(){const u=new URL(OTA_URL,location.href);u.searchParams.set('v',Date.now());u.hash=location.hash||'#dashboard';window.location.replace(u.toString())}
  async function checkAndUpdate(options={}){try{const result=await check();if(result.available){const ok=options.silent?true:confirm('A new version of Beau Game Inventory is available.\n\nVersion '+result.latest+'\n'+(result.notes||'')+'\n\nUpdate now?');if(ok)reloadLatest()}else if(!options.silent)alert('You are up to date (v'+CURRENT+').');return result}catch(e){if(!options.silent)alert(e.name==='AbortError'?'Update check timed out. You can keep using the current app.':'Could not check for updates right now.');return{current:CURRENT,latest:CURRENT,available:false,error:e.message}}}
  window.BeauUpdate={version:CURRENT,check,reloadLatest,checkAndUpdate};try{localStorage.setItem(KEY,CURRENT)}catch(e){}
  document.addEventListener('DOMContentLoaded',()=>{loadScannerFix();loadCameraFix();loadCompat();setTimeout(()=>checkAndUpdate({silent:true}),1200)});
})();
