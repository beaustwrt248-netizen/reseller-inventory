/* Beau's Reseller Hub — manual OTA updater. Web assets only; never forces a reload. */
(function(){'use strict';
const CURRENT='9.3.3';
const CURRENT_WEB='2026.08.15.33';
const MANIFEST='./update.json';
const cmp=(a,b)=>{const x=String(a||'0').replace(/^v/i,'').split(/[.-]/).map(n=>Number(n)||0),y=String(b||'0').replace(/^v/i,'').split(/[.-]/).map(n=>Number(n)||0);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
async function check(){const r=await fetch(MANIFEST+'?otaCheck='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}});if(!r.ok)throw Error('Update manifest unavailable');const d=await r.json(),web=String(d.webVersion||CURRENT_WEB),app=String(d.version||CURRENT);return{available:cmp(web,CURRENT_WEB)>0||cmp(app,CURRENT)>0,app,web,message:String(d.message||'')};}
function paint(result){const box=document.getElementById('updateBox');if(!box)return;box.innerHTML=result.available?'<b>Update available</b><div class="muted">Web revision '+result.web+'</div><div class="toolbar"><button class="btn primary" id="applyManualUpdate">🔄 Install latest web update</button></div><div class="muted">This updates the web app without replacing the Android APK.</div>':'<b>Web app is up to date</b><div class="muted">Web revision '+result.web+' · App '+CURRENT+'</div>';const btn=document.getElementById('applyManualUpdate');if(btn)btn.onclick=()=>{btn.disabled=true;btn.textContent='Installing…';try{sessionStorage.setItem('manualOtaApplied',result.web)}catch(_){}const url='./index.html?ota='+encodeURIComponent(result.web)+'&t='+Date.now()+'#dashboard';setTimeout(()=>{window.location.href=url},50)};}
async function run(){const box=document.getElementById('updateBox');if(box)box.textContent='Checking for updates…';try{paint(await check())}catch(_){if(box)box.textContent='Update check unavailable. The app will continue working normally.'}}
window.BeauManualOTA={check:run,version:CURRENT,webVersion:CURRENT_WEB};
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('checkUpdate');if(b&&!b.dataset.manualOta){b.dataset.manualOta='1';b.addEventListener('click',run)}const v=document.getElementById('appVersion');if(v)v.textContent=CURRENT});
})();
