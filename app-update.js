/* Beau's Reseller Hub — OTA updater v9.3.3 */
(function(){
'use strict';
const KEY='beauGameInventoryWebVersion',CURRENT='9.3.3',WEB_REV='2026.08.15.14',UPDATE_URL='./update.json';
function compare(a,b){const aa=String(a||'0').replace(/^v/i,'').split(/[.-]/).map(x=>Number(x)||0),bb=String(b||'0').replace(/^v/i,'').split(/[.-]/).map(x=>Number(x)||0);for(let i=0;i<Math.max(aa.length,bb.length);i++){const x=aa[i]||0,y=bb[i]||0;if(x!==y)return x-y}return 0}
async function clearOldCaches(){try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}if('caches'in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(_){}
}
async function check(){const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);try{const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:c.signal});if(!r.ok)throw Error('Update information unavailable');const d=await r.json(),latest=String(d.version||CURRENT),latestWeb=String(d.webVersion||WEB_REV);return{current:CURRENT,webVersion:WEB_REV,latest,latestWeb,available:compare(latest,CURRENT)>0||compare(latestWeb,WEB_REV)>0,notes:d.message||'',url:d.url||'./index.html'}}finally{clearTimeout(t)}}
async function reloadLatest(){await clearOldCaches();try{localStorage.setItem(KEY,WEB_REV)}catch(_){}const u=new URL('./index.html',location.href);u.searchParams.set('ota',Date.now());u.hash=location.hash||'#dashboard';location.replace(u.toString())}
async function checkAndUpdate(options={}){try{const result=await check();if(result.available){const ok=options.silent?true:confirm('A new Beau\'s Reseller Hub web update is available.\n\nApp '+result.latest+'\nWeb revision '+result.latestWeb+'\n'+(result.notes||'')+'\n\nUpdate now?');if(ok)await reloadLatest()}else if(!options.silent)alert('You are up to date (v'+CURRENT+').');return result}catch(e){if(!options.silent)alert(e.name==='AbortError'?'Update check timed out. You can keep using the current app.':'Could not check for updates right now.');return{current:CURRENT,latest:CURRENT,latestWeb:WEB_REV,available:false,error:e.message}}}
function patchSettings(){const v=document.getElementById('appVersion');if(v)v.textContent=CURRENT;const b=document.getElementById('checkUpdate');if(b&&!b.dataset.cloudUpdater){const n=b.cloneNode(true);b.replaceWith(n);n.dataset.cloudUpdater='1';n.addEventListener('click',()=>checkAndUpdate())}}
window.BeauUpdate={version:CURRENT,webVersion:WEB_REV,check,reloadLatest,checkAndUpdate};try{localStorage.setItem(KEY,WEB_REV)}catch(_){}
document.addEventListener('DOMContentLoaded',()=>{patchSettings();setTimeout(()=>checkAndUpdate({silent:true}),1200)});
})();
