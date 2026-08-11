/* Beau's Game Inventory — reliable OTA updater */
(function(){
  const KEY='beauGameInventoryBuild';
  const CURRENT='1.6.1';
  const UPDATE_URL='./update.json';
  const WEB_URL='https://beaustwrt248-netizen.github.io/reseller-inventory/';
  function compare(a,b){const aa=String(a).replace(/^v/,'').split('.').map(Number),bb=String(b).replace(/^v/,'').split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){const x=aa[i]||0,y=bb[i]||0;if(x!==y)return x-y;}return 0;}
  function isNative(){return !!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());}
  async function check(){const r=await fetch(UPDATE_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Update information unavailable');const d=await r.json();return {current:CURRENT,latest:String(d.version||CURRENT),available:compare(d.version||CURRENT,CURRENT)>0,notes:d.message||'',url:d.url||WEB_URL};}
  function rememberScreen(){return location.hash||localStorage.getItem('beauLastScreenHash')||'#screen-home';}
  function reloadLatest(){const hash=rememberScreen();try{localStorage.setItem('beauLastScreenHash',hash);}catch(e){}const u=new URL(WEB_URL);u.searchParams.set('ota',Date.now().toString());u.hash=hash;window.location.replace(u.toString());}
  window.BeauUpdate={version:CURRENT,isNative,check,reloadLatest};
  window.addEventListener('hashchange',function(){try{localStorage.setItem('beauLastScreenHash',location.hash||'#screen-home')}catch(e){}});
  window.dispatchEvent(new CustomEvent('beau:update-ready',{detail:{version:CURRENT}}));
  try{localStorage.setItem(KEY,CURRENT);}catch(e){}
})();
