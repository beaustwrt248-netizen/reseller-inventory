/* Beau's Game Inventory — OTA updater */
(function(){
  const KEY='beauGameInventoryBuild';
  const CURRENT='1.9.1';
  const UPDATE_URL='./update.json';
  const OTA_URL='./ota.html';
  function compare(a,b){const aa=String(a).replace(/^v/,'').split('.').map(Number),bb=String(b).replace(/^v/,'').split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){const x=aa[i]||0,y=bb[i]||0;if(x!==y)return x-y}return 0;}
  async function check(){const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Update information unavailable');const d=await r.json();return{current:CURRENT,latest:String(d.version||CURRENT),available:compare(d.version||CURRENT,CURRENT)>0,notes:d.message||'',url:d.url||OTA_URL};}
  function reloadLatest(){const hash=location.hash||'#dashboard';const u=new URL(OTA_URL,location.href);u.searchParams.set('v',Date.now());u.hash=hash;window.location.replace(u.toString());}
  function loadScannerController(){const s=document.createElement('script');s.src='./scanner-fix.js?v='+Date.now();s.async=false;document.head.appendChild(s);}
  function handleScannerReturn(){const p=new URLSearchParams(location.search);const code=p.get('scanned');if(!code)return;history.replaceState({},'',location.pathname+location.hash);setTimeout(()=>{const input=document.getElementById('barcodeSearch');if(input)input.value=code;if(typeof window.lookupBarcode==='function')window.lookupBarcode(code);},350);}
  async function checkAndUpdate(options={}){try{const result=await check();if(result.available){const ok=options.silent?true:confirm('A new version of Beau\'s Game Inventory is available.\n\nVersion '+result.latest+'\n'+(result.notes||'')+'\n\nUpdate now?');if(ok)reloadLatest()}else if(!options.silent)alert('You are up to date (v'+CURRENT+').');return result}catch(e){if(!options.silent)alert('Could not check for updates right now.');return{current:CURRENT,latest:CURRENT,available:false,error:e.message}}}
  window.BeauUpdate={version:CURRENT,check,reloadLatest,checkAndUpdate};
  try{localStorage.setItem(KEY,CURRENT)}catch(e){}
  document.addEventListener('DOMContentLoaded',()=>{loadScannerController();handleScannerReturn();setTimeout(()=>checkAndUpdate({silent:true}),1500);});
})();