/* Beau's Game Inventory — scanner lifecycle fix v1.8.10 */
(function(){
  'use strict';
  let scanner=null;
  let starting=false;
  let running=false;
  let session=0;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function els(){
    return {
      box:document.getElementById('scannerBox'),
      reader:document.getElementById('reader'),
      result:document.getElementById('barcodeResult'),
      start:document.getElementById('startScannerButton'),
      stop:document.getElementById('stopScannerButton')
    };
  }

  function releaseCameraTracks(){
    document.querySelectorAll('#reader video').forEach(video=>{
      try{
        if(video.srcObject){
          video.srcObject.getTracks().forEach(track=>{try{track.stop()}catch(e){}});
          video.srcObject=null;
        }
      }catch(e){}
    });
  }

  async function stopInternal(hide=true){
    session++;
    const current=scanner;
    scanner=null;
    starting=false;
    running=false;
    if(current){
      try{await current.stop()}catch(e){}
      try{await current.clear()}catch(e){}
    }
    releaseCameraTracks();
    const {box,reader}=els();
    if(reader)reader.innerHTML='';
    if(hide&&box)box.style.display='none';
  }

  async function start(){
    if(starting||running)return;
    const {box,reader,result,start:button}=els();
    if(!box||!reader)return;

    /* Important: invalidate the old session BEFORE cleanup. */
    const mySession=++session;
    await stopInternal(false);
    /* stopInternal increments session, so establish the new session after cleanup. */
    session=mySession+1;
    const activeSession=session;

    box.style.display='block';
    if(result)result.innerHTML='';
    if(button)button.disabled=true;
    await sleep(150);

    if(activeSession!==session){if(button)button.disabled=false;return;}
    if(typeof Html5Qrcode!=='function'){
      if(result)result.innerHTML='<div class="warning">Barcode scanner library failed to load. Please reload the app.</div>';
      box.style.display='none';
      if(button)button.disabled=false;
      return;
    }

    starting=true;
    const current=new Html5Qrcode('reader');
    scanner=current;

    try{
      await current.start(
        {facingMode:{ideal:'environment'}},
        {fps:10,qrbox:{width:250,height:150},aspectRatio:1.7777778},
        async code=>{
          if(!running||activeSession!==session||scanner!==current)return;
          running=false;
          starting=false;
          if(button)button.disabled=false;
          const search=document.getElementById('barcodeSearch');
          if(search)search.value=code;
          try{await current.stop()}catch(e){}
          try{await current.clear()}catch(e){}
          if(scanner===current)scanner=null;
          releaseCameraTracks();
          const {box:scanBox,reader:scanReader}=els();
          if(scanReader)scanReader.innerHTML='';
          if(scanBox)scanBox.style.display='none';
          if(typeof window.lookupBarcode==='function')window.lookupBarcode(code);
        },
        ()=>{}
      );

      if(activeSession!==session){
        try{await current.stop()}catch(e){}
        try{await current.clear()}catch(e){}
        releaseCameraTracks();
        return;
      }
      starting=false;
      running=true;
    }catch(error){
      starting=false;
      running=false;
      if(scanner===current)scanner=null;
      try{await current.stop()}catch(e){}
      try{await current.clear()}catch(e){}
      releaseCameraTracks();
      reader.innerHTML='';
      box.style.display='none';
      if(button)button.disabled=false;
      if(result)result.innerHTML='<div class="warning">Camera could not be started. Check camera permission for this site, then try again.</div>';
    }
  }

  async function stop(){
    const {start}=els();
    if(start)start.disabled=false;
    await stopInternal(true);
  }

  function install(){
    const {start,stop}=els();
    if(!start||!stop)return false;
    /* Replace the page's original scanner handlers with one authoritative handler. */
    start.onclick=null;
    stop.onclick=null;
    start.addEventListener('click',startHandler,{passive:true});
    stop.addEventListener('click',stopHandler,{passive:true});
    return true;
  }
  function startHandler(event){event.preventDefault();event.stopImmediatePropagation();start();}
  function stopHandler(event){event.preventDefault();event.stopImmediatePropagation();stop();}

  if(!install()){
    const observer=new MutationObserver(()=>{if(install())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }

  window.BeauScannerFix={start,stop,cleanup:stop};
})();