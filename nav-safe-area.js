/* Beau's Game Inventory — safe area handling for Android, Samsung and browsers */
(function(){
  'use strict';
  const STYLE_ID='beau-native-nav-safe-style';
  function apply(){
    const nativeApp=!!(window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform());
    const fallback=nativeApp?'52px':'0px';
    document.documentElement.style.setProperty('--app-native-bottom',fallback);
    document.documentElement.style.setProperty('--safe-bottom','env(safe-area-inset-bottom, 0px)');
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style)}
    style.textContent=`
      :root{--app-safe-bottom:max(env(safe-area-inset-bottom,0px),var(--app-native-bottom,0px));--app-nav-total:calc(var(--nav-h,68px) + var(--app-safe-bottom));}
      html{scroll-padding-bottom:calc(var(--app-nav-total) + 20px)!important;}
      body{padding-bottom:calc(var(--app-nav-total) + 28px)!important;overflow-x:hidden;}
      .mobile-nav,.nav,.app-shell-nav{bottom:var(--app-safe-bottom)!important;}
      .mobile-nav{height:var(--nav-h,68px)!important;padding-bottom:max(5px,env(safe-area-inset-bottom,0px))!important;}
    `;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('resize',apply,{passive:true});
  window.addEventListener('orientationchange',apply,{passive:true});
})();
