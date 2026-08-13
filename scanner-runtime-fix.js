/* Beau's Game Inventory — camera scanner runtime fix v2.5.0 */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  function show(msg,kind='warning'){
    const r=$('barcodeResult');
    if(r) r.innerHTML='<div class="'+kind+'">'+msg+'</div>';
  }
  async function start(){
    if(window.__beauScannerStarting || window.__beauScannerRunning)return;
    if(typeof Html5Qrcode==='undefined'){
      show('<strong>Scanner library did not load.</strong><br>Please refresh the page and try again.');
      return;
    }
    window.__beauScannerStarting=true;
    const box=$('scannerBox'), reader=$('reader');
    if(box)box.style.display='block';
    if(reader)reader.innerHTML='';
    try{
      if(window.__beauScanner){try{await window.__beauScanner.stop()}catch(e){}try{window.__beauScanner.clear()}catch(e){}}
      const scanner=new Html5Qrcode('reader');
      window.__beauScanner=scanner;
      const config={fps:10,qrbox:function(w,h){return {width:Math.min(300,Math.floor(w*.8)),height:Math.min(180,Math.floor(h*.32))}},aspectRatio:1.7777778};
      const success=code=>{
        if(window.__beauScanLocked)return;
        window.__beauScanLocked=true;
        code=String(code||'').trim();
        if($('barcodeSearch'))$('barcodeSearch').value=code;
        if($('barcode'))$('barcode').value=code;
        if(typeof window.lookupBarcode==='function')window.lookupBarcode(code);
        stop();
        setTimeout(()=>window.__beauScanLocked=false,1500);
      };
      let cameras=[];
      try{cameras=await Html5Qrcode.getCameras()}catch(e){
        show('<strong>Camera permission was blocked.</strong><br>On your Samsung phone, allow Camera permission for this website, then refresh the page.');
        throw e;
      }
      if(!cameras.length)throw Error('No camera found');
      const rear=cameras.find(c=>/back|rear|environment|world/i.test(c.label||''))||cameras[cameras.length-1];
      await scanner.start(rear.id,config,success,()=>{});
      window.__beauScannerRunning=true;
      window.__beauScannerStarting=false;
      show('📷 <strong>Scanner is ready.</strong> Point the rear camera at a barcode.','loading');
      const video=reader&&reader.querySelector('video');
      if(video){video.setAttribute('playsinline','true');video.muted=true;video.autoplay=true;}
    }catch(e){
      window.__beauScannerStarting=false;
      window.__beauScannerRunning=false;
      if(box)box.style.display='none';
      const message=String(e&&e.message||e||'Unknown camera error');
      show('<strong>Camera could not start.</strong><br>'+message+'<br><br>Make sure this page is opened using HTTPS and that Chrome has Camera permission.');
    }
  }
  async function stop(){
    const s=window.__beauScanner;
    window.__beauScannerRunning=false;
    window.__beauScannerStarting=false;
    if(s){try{await s.stop()}catch(e){}try{s.clear()}catch(e){}}
    window.__beauScanner=null;
    const box=$('scannerBox');if(box)box.style.display='none';
  }
  window.startScanner=start;
  window.stopScanner=stop;
  function wire(){
    const b=$('startScannerButton'),s=$('stopScannerButton');
    if(b){b.onclick=e=>{e.preventDefault();start()};b.removeAttribute('disabled')}
    if(s){s.onclick=e=>{e.preventDefault();stop()}}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
  setTimeout(wire,500);setTimeout(wire,1500);
})();
