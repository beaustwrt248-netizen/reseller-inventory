/* Beau's Game Inventory — fresh-page scanner controller v1.9.0 */
(function(){
  'use strict';
  const SCANNER_URL='./scanner.html';
  function install(){
    const start=document.getElementById('startScannerButton');
    const stop=document.getElementById('stopScannerButton');
    if(!start||!stop)return false;
    start.onclick=null;
    stop.onclick=null;
    start.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();window.location.href=SCANNER_URL;},{capture:true});
    stop.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();},{capture:true});
    return true;
  }
  if(!install()){
    const observer=new MutationObserver(()=>{if(install())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }
  window.BeauScannerFix={open:()=>{window.location.href=SCANNER_URL}};
})();