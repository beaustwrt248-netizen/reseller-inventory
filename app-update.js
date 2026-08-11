/* Beau's Game Inventory — OTA updater that keeps the app on the correct web screen */
(function(){
  const KEY='beauGameInventoryBuild';
  const CURRENT='1.6.2';
  const UPDATE_URL='./update.json';
  const WEB_ROOT='https://beaustwrt248-netizen.github.io/reseller-inventory/';
  function compare(a,b){const aa=String(a).replace(/^v/,'').split('.').map(Number),bb=String(b).replace(/^v/,'').split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){const x=aa[i]||0,y=bb[i]||0;if(x!==y)return x-y;}return 0;}
  function isNative(){return !!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());}
  async function check(){const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Update information unavailable');const d=await r.json();return {current:CURRENT,latest:String(d.version||CURRENT),available:compare(d.version||CURRENT,CURRENT)>0,notes:d.message||''};}
  function rememberScreen(){return location.hash||localStorage.getItem('beauLastScreenHash')||'';}
  function remotePage(){
    const p=(location.pathname||'').split('/').pop().toLowerCase();
    const allowed=['dashboard.html','index.html','scanner.html','pricing.html','sales.html','settings.html'];
    if(!p||p==='index.html'||!allowed.includes(p)) return 'dashboard.html';
    return p;
  }
  function reloadLatest(){
    const hash=rememberScreen();
    const page=remotePage();
    try{localStorage.setItem('beauLastScreenHash',hash);}catch(e){}
    const u=new URL(page,WEB_ROOT);
    u.searchParams.set('otaVersion',Date.now().toString());
    if(hash)u.hash=hash;
    window.location.replace(u.toString());
  }
  window.BeauUpdate={version:CURRENT,isNative,check,reloadLatest};
  window.addEventListener('hashchange',function(){try{localStorage.setItem('beauLastScreenHash',location.hash||'')}catch(e){}});
  window.dispatchEvent(new CustomEvent('beau:update-ready',{detail:{version:CURRENT}}));
  try{
    const previous=localStorage.getItem(KEY);
    if(previous&&previous!==CURRENT){
      const n=document.createElement('div');
      n.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:2147483001;background:#111827;color:#fff;padding:14px 16px;border-radius:14px;box-shadow:0 5px 20px rgba(0,0,0,.25);font:14px Arial,sans-serif';
      n.innerHTML='<strong>✨ Beau\'s Game Inventory updated to v'+CURRENT+'</strong><br><span style="opacity:.85">The latest version is now loaded.</span> <button id="updateDismiss" style="float:right;border:0;border-radius:8px;padding:7px 10px;font-weight:bold">OK</button>';
      document.body.appendChild(n);
      document.getElementById('updateDismiss').onclick=()=>n.remove();
    }
    localStorage.setItem(KEY,CURRENT);
  }catch(e){}
})();
