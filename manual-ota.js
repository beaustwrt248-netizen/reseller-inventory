/* Beau's Reseller Hub — manual OTA updater using the generated release config. */
(function(){
  'use strict';
  const cfg=window.BEAU_RELEASE||{};
  const CURRENT=String(cfg.appVersion||'unknown');
  const CURRENT_WEB=String(cfg.webVersion||'unknown');
  const MANIFEST='./update.json';
  const cmp=(a,b)=>{const x=String(a||'0').replace(/^v/i,'').split(/[.-]/).map(n=>Number(n)||0),y=String(b||'0').replace(/^v/i,'').split(/[.-]/).map(n=>Number(n)||0);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
  async function check(){const r=await fetch(MANIFEST+'?otaCheck='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}});if(!r.ok)throw Error('Update manifest unavailable');const d=await r.json(),web=String(d.webVersion||''),app=String(d.version||'');return{available:cmp(web,CURRENT_WEB)>0||cmp(app,CURRENT)>0,mismatch:app!==CURRENT||web!==CURRENT_WEB,app,web,message:String(d.message||'')};}
  function paint(result){const box=document.getElementById('updateBox');if(!box)return;box.innerHTML=result.mismatch?'<b>Version mismatch detected</b><div class="muted">Installed app '+CURRENT+' · Published app '+result.app+' · Published web '+result.web+'</div><div class="toolbar"><button class="btn primary" id="applyManualUpdate">🔄 Install latest web update</button></div>':result.available?'<b>Update available</b><div class="muted">Web revision '+result.web+'</div><div class="toolbar"><button class="btn primary" id="applyManualUpdate">🔄 Install latest web update</button></div><div class="muted">This updates the web app without replacing the Android APK.</div>':'<b>Web app is up to date</b><div class="muted">Web revision '+CURRENT_WEB+' · App '+CURRENT+'</div>';const btn=document.getElementById('applyManualUpdate');if(btn)btn.onclick=()=>{btn.disabled=true;btn.textContent='Installing…';location.href='./index.html?ota='+encodeURIComponent(result.web)+'&t='+Date.now()+'#dashboard'};}
  async function run(){const box=document.getElementById('updateBox');if(box)box.textContent='Checking release versions…';try{paint(await check())}catch(_){if(box)box.textContent='Update check unavailable. The app will continue working normally.'}}
  window.BeauManualOTA={check:run,version:CURRENT,webVersion:CURRENT_WEB};
  document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('checkUpdate');if(b&&!b.dataset.manualOta){b.dataset.manualOta='1';b.addEventListener('click',run)}const v=document.getElementById('appVersion');if(v)v.textContent=CURRENT});
})();
