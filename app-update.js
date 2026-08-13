/* Beau's Game Inventory — OTA updater v2.4.0 */
(function(){
  const KEY='beauGameInventoryBuild';
  const CURRENT='2.4.0';
  const UPDATE_URL='./update.json';
  const OTA_URL='./ota.html';
  const SCANNER_FIX_URL='./scanner-fix.js';

  function compare(a,b){
    const aa=String(a).replace(/^v/,'').split('.').map(Number);
    const bb=String(b).replace(/^v/,'').split('.').map(Number);
    for(let i=0;i<Math.max(aa.length,bb.length);i++){
      const x=aa[i]||0,y=bb[i]||0;
      if(x!==y)return x-y;
    }
    return 0;
  }

  function loadScannerFix(){
    if(window.BeauSmartScan?.version==='2.4.0')return;
    const old=document.querySelector('script[data-scanner-fix]');
    if(old)old.remove();
    const s=document.createElement('script');
    s.src=SCANNER_FIX_URL+'?v=2.4.0';
    s.async=false;
    s.dataset.scannerFix='1';
    document.head.appendChild(s);
  }

  async function check(){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),8000);
    try{
      const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:controller.signal});
      if(!r.ok)throw Error('Update information unavailable');
      const d=await r.json();
      const latest=String(d.version||CURRENT);
      return {current:CURRENT,latest,webVersion:String(d.webVersion||latest),available:compare(latest,CURRENT)>0,notes:d.message||'',url:d.url||OTA_URL};
    }finally{clearTimeout(timer)}
  }

  function reloadLatest(){
    const hash=location.hash||'#dashboard';
    const u=new URL(OTA_URL,location.href);
    u.searchParams.set('v',Date.now());
    u.hash=hash;
    window.location.replace(u.toString());
  }

  async function checkAndUpdate(options={}){
    try{
      const result=await check();
      if(result.available){
        const ok=options.silent?true:confirm('A new version of Beau Game Inventory is available.\n\nVersion '+result.latest+'\n'+(result.notes||'')+'\n\nUpdate now?');
        if(ok)reloadLatest();
      }else if(!options.silent){alert('You are up to date (v'+CURRENT+').');}
      return result;
    }catch(e){
      if(!options.silent)alert(e.name==='AbortError'?'Update check timed out. You can keep using the current app.':'Could not check for updates right now.');
      return {current:CURRENT,latest:CURRENT,available:false,error:e.message};
    }
  }

  window.BeauUpdate={version:CURRENT,check,reloadLatest,checkAndUpdate};
  try{localStorage.setItem(KEY,CURRENT)}catch(e){}

  document.addEventListener('DOMContentLoaded',()=>{
    loadScannerFix();
    setTimeout(()=>checkAndUpdate({silent:true}),1200);
  });
})();
