/* Beau's Game Inventory - lightweight web update notice */
(function(){
  const KEY='beauGameInventoryBuild';
  const VERSION='web-2026-08-11-1';
  try{
    const previous=localStorage.getItem(KEY);
    if(previous && previous!==VERSION){
      const n=document.createElement('div');
      n.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:10000;background:#111827;color:#fff;padding:14px 16px;border-radius:14px;box-shadow:0 5px 20px rgba(0,0,0,.25);font:14px Arial,sans-serif';
      n.innerHTML='<strong>✨ Beau\'s Game Inventory updated</strong><br><span style="opacity:.85">The latest app changes are now loaded.</span> <button id="updateDismiss" style="float:right;border:0;border-radius:8px;padding:7px 10px;font-weight:bold">OK</button>';
      document.body.appendChild(n);
      document.getElementById('updateDismiss').onclick=()=>n.remove();
    }
    localStorage.setItem(KEY,VERSION);
  }catch(e){}
})();
