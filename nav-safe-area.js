/* Keep the app's bottom navigation above Android's system navigation bar. */
(function(){
  function apply(){
    var nativeApp=!!(window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform());
    var inset=0;
    if(nativeApp){
      /* Samsung 3-button navigation commonly occupies ~48dp. Keep a safe minimum. */
      var visualInset=0;
      if(window.visualViewport){
        visualInset=Math.max(0,window.innerHeight-window.visualViewport.height);
      }
      inset=Math.max(48,Math.round(visualInset));
    }
    document.documentElement.style.setProperty('--app-nav-bottom', inset+'px');
  }
  apply();
  window.addEventListener('resize',apply,{passive:true});
  if(window.visualViewport) window.visualViewport.addEventListener('resize',apply,{passive:true});
})();
