/* Beau's Game Inventory — Android/Samsung navigation-bar safe area */
(function(){
  var STYLE_ID='beau-native-nav-safe-style';
  function apply(){
    var nativeApp=!!(window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform());
    var inset=nativeApp ? 52 : 0;
    document.documentElement.style.setProperty('--app-nav-bottom', inset+'px');
    var style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent=nativeApp ? `
      html { scroll-padding-bottom: calc(68px + 52px + 16px) !important; }
      body { padding-bottom: max(82px, calc(68px + 52px + 16px)) !important; }
      .mobile-nav, .nav, .app-shell-nav {
        position: fixed !important;
        bottom: 52px !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 2147483000 !important;
      }
    ` : '';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('resize',apply,{passive:true});
})();
