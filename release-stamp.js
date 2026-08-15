/* Beau's Reseller Hub — runtime release consistency guard. */
(function(){
  'use strict';
  const cfg=window.BEAU_RELEASE||{};
  const RELEASE=String(cfg.appVersion||'unknown');
  const WEB=String(cfg.webVersion||'unknown');

  function paint(text){const box=document.getElementById('updateBox');if(box)box.innerHTML=text;}

  async function verifyLiveManifest(){
    const r=await fetch('./update.json?releaseCheck='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}});
    if(!r.ok)throw new Error('manifest');
    const d=await r.json();
    const app=String(d.version||'');
    const web=String(d.webVersion||'');
    if(app!==RELEASE||web!==WEB)return {ok:false,app,web};
    return {ok:true,app,web};
  }

  function apply(){
    const v=document.getElementById('appVersion');
    if(v)v.textContent=RELEASE;
    const check=document.getElementById('checkUpdate');
    if(check){
      const fresh=check.cloneNode(true);
      check.replaceWith(fresh);
      fresh.addEventListener('click',async function(){
        paint('Checking release versions…');
        try{
          const result=await verifyLiveManifest();
          if(result.ok){
            paint('<b>Web app is up to date</b><div class="muted">Web revision '+WEB+' · App '+RELEASE+'</div>');
          }else{
            paint('<b>Version mismatch detected</b><div class="muted">Installed app '+RELEASE+' · Published app '+result.app+' · Published web '+result.web+'</div><div class="toolbar"><button class="btn primary" id="applyReleaseUpdate">🔄 Install latest web update</button></div>');
            const b=document.getElementById('applyReleaseUpdate');
            if(b)b.onclick=function(){location.href='./index.html?ota='+encodeURIComponent(result.web)+'&t='+Date.now()+'#dashboard';};
          }
        }catch(_){paint('Update check unavailable. The app will continue working normally.');}
      });
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
