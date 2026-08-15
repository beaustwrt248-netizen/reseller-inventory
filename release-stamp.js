/* Beau's Reseller Hub — native/web release synchronisation guard. */
(function(){
  'use strict';
  const RELEASE='9.3.4';
  const WEB='2026.08.15.34';

  function apply(){
    const v=document.getElementById('appVersion');
    if(v) v.textContent=RELEASE;

    const box=document.getElementById('updateBox');
    if(box){
      box.innerHTML='<b>Web app is up to date</b><div class="muted">Web revision '+WEB+' · App '+RELEASE+'</div>';
    }

    const check=document.getElementById('checkUpdate');
    if(check){
      const fresh=check.cloneNode(true);
      check.replaceWith(fresh);
      fresh.addEventListener('click', async function(){
        const b=document.getElementById('updateBox');
        if(b) b.textContent='Checking for updates…';
        try{
          const r=await fetch('./update.json?releaseCheck='+Date.now(),{cache:'no-store'});
          if(!r.ok) throw new Error('manifest');
          const d=await r.json();
          const app=String(d.version||RELEASE);
          const web=String(d.webVersion||WEB);
          if(app===RELEASE && web===WEB){
            if(b) b.innerHTML='<b>Web app is up to date</b><div class="muted">Web revision '+WEB+' · App '+RELEASE+'</div>';
          }else if(b){
            b.innerHTML='<b>Update available</b><div class="muted">Web revision '+web+' · App '+app+'</div><div class="toolbar"><button class="btn primary" id="applyReleaseUpdate">🔄 Install latest web update</button></div>';
            document.getElementById('applyReleaseUpdate').onclick=function(){
              location.href='./index.html?ota='+encodeURIComponent(web)+'&t='+Date.now()+'#dashboard';
            };
          }
        }catch(_){
          if(b) b.textContent='Update check unavailable. The app will continue working normally.';
        }
      });
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();
