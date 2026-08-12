/* Beau's Game Inventory — robust scanner restart fix v1.8.8 */
(function(){
  'use strict';
  let activeScanner=null;
  let active=false;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function cleanup(){
    const s=activeScanner;
    activeScanner=null;
    active=false;
    if(s){try{await s.stop()}catch(e){} try{await s.clear()}catch(e){}}
    const reader=document.getElementById('reader');
    if(reader) reader.innerHTML='';
    const box=document.getElementById('scannerBox');
    if(box) box.style.display='none';
  }
  async function start(){
    if(active)return;
    await cleanup();
    const box=document.getElementById('scannerBox');
    const reader=document.getElementById('reader');
    const result=document.getElementById('barcodeResult');
    if(!box||!reader)return;
    box.style.display='block';
    if(result) result.innerHTML='';
    await sleep(100);
    try{
      const s=new Html5Qrcode('reader');
      activeScanner=s;
      await s.start({facingMode:'environment'},{fps:10,qrbox:{width:250,height:150}},async code=>{
        if(!active)return;
        active=false;
        const search=document.getElementById('barcodeSearch');
        if(search)search.value=code;
        try{await s.stop()}catch(e){}
        try{await s.clear()}catch(e){}
        activeScanner=null;
        reader.innerHTML='';
        box.style.display='none';
        if(typeof window.lookupBarcode==='function')window.lookupBarcode(code);
      });
      active=true;
    }catch(e){
      active=false;
      activeScanner=null;
      try{reader.innerHTML=''}catch(_){ }
      box.style.display='none';
      if(result)result.innerHTML='<div class="warning">Camera could not be started. Check camera permission and try again.</div>';
    }
  }
  async function stop(){await cleanup()}
  function install(){
    const startBtn=document.getElementById('startScannerButton');
    const stopBtn=document.getElementById('stopScannerButton');
    if(!startBtn||!stopBtn)return false;
    startBtn.onclick=start;
    stopBtn.onclick=stop;
    return true;
  }
  if(!install()){
    const obs=new MutationObserver(()=>{if(install())obs.disconnect()});
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),5000);
  }
  window.BeauScannerFix={start,stop,cleanup};
})();
