/* Beau's Game Inventory — scanner lifecycle fix v1.8.9 */
(function(){
  'use strict';
  let scanner=null, starting=false, running=false, generation=0;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function releaseTracks(){
    document.querySelectorAll('#reader video').forEach(v=>{try{if(v.srcObject){v.srcObject.getTracks().forEach(t=>{try{t.stop()}catch(e){}});v.srcObject=null}}catch(e){}});
  }
  async function cleanup(){
    generation++;
    const s=scanner;
    scanner=null; starting=false; running=false;
    if(s){try{await s.stop()}catch(e){} try{await s.clear()}catch(e){}}
    releaseTracks();
    const reader=document.getElementById('reader');
    if(reader) reader.innerHTML='';
    const box=document.getElementById('scannerBox');
    if(box) box.style.display='none';
  }
  async function start(){
    if(starting||running)return;
    const my=++generation;
    await cleanup();
    if(my!==generation)return;
    const box=document.getElementById('scannerBox'),reader=document.getElementById('reader'),result=document.getElementById('barcodeResult');
    if(!box||!reader)return;
    box.style.display='block';
    if(result)result.innerHTML='';
    await sleep(250);
    if(my!==generation)return;
    starting=true;
    const s=new Html5Qrcode('reader'); scanner=s;
    try{
      await s.start({facingMode:{ideal:'environment'}},{fps:10,qrbox:{width:250,height:150}},async code=>{
        if(!running||my!==generation)return;
        running=false; starting=false;
        const search=document.getElementById('barcodeSearch'); if(search)search.value=code;
        try{await s.stop()}catch(e){} try{await s.clear()}catch(e){}
        if(scanner===s)scanner=null;
        releaseTracks(); reader.innerHTML=''; box.style.display='none';
        if(typeof window.lookupBarcode==='function')window.lookupBarcode(code);
      });
      if(my!==generation){try{await s.stop()}catch(e){} try{await s.clear()}catch(e){} return}
      starting=false; running=true;
    }catch(e){
      starting=false; running=false; if(scanner===s)scanner=null;
      try{await s.stop()}catch(_){} try{await s.clear()}catch(_){} releaseTracks(); reader.innerHTML=''; box.style.display='none';
      if(result)result.innerHTML='<div class="warning">Camera could not be started. Check camera permission and try again.</div>';
    }
  }
  async function stop(){await cleanup(); await sleep(150); releaseTracks();}
  function install(){
    const a=document.getElementById('startScannerButton'),b=document.getElementById('stopScannerButton');
    if(!a||!b)return false;
    a.onclick=start; b.onclick=stop; return true;
  }
  if(!install()){
    const obs=new MutationObserver(()=>{if(install())obs.disconnect()});
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),5000);
  }
  window.BeauScannerFix={start,stop,cleanup};
})();